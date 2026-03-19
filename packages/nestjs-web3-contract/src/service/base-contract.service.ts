import { Logger } from '@nestjs/common';
import { AbiParameter, DecodedParams } from 'web3-types';
import Web3 from 'web3';
import { ContractAbi, NonPayableCallOptions, PayableCallOptions, Transaction, ContractEvents } from 'web3-types';
import { Contract, ContractEventsInterface } from 'web3-eth-contract';
import { ethers } from 'ethers';

export abstract class BaseContractService {
  protected readonly logger = new Logger(BaseContractService.name);
  private _web3?: Web3;
  private _contract?: Contract<ContractAbi>;
  private _proxyEns: { [ens: string]: string } = {};

  public setWeb3(value: Web3) {
    this._web3 = value;
  }

  get web3(): Web3 {
    if (!this._web3) {
      throw new Error('Web3 is not configured');
    }
    return this._web3;
  }

  get contract(): Contract<ContractAbi> {
    if (!this._contract) {
      throw new Error('Contract is not configured');
    }
    return this._contract;
  }

  public setContract(value: Contract<ContractAbi>) {
    this._contract = value;
  }

  public getContractAddress() {
    return this.contract.options.address;
  }

  public async decodeLog(inputs: AbiParameter[], data: string, topics: string[]): Promise<DecodedParams> {
    return this.web3.eth.abi.decodeLog(inputs, data, topics.slice(1));
  }

  protected async execute<T>(
    method: string,
    execute: string,
    options: any[] | null = null,
    from: string | null = null,
  ) {
    try {
      const callback = this.contract.methods[method] as CallableFunction;
      return (await callback(...(options || []))[execute]({ from })) as T;
    } catch (error: unknown) {
      const err = error as { innerError?: { message?: string } };
      if (err.innerError?.message) {
        throw new Error(err.innerError.message);
      }
      throw error;
    }
  }

  public async call<T>(method: string, options: any[] = [], from: string | null = null) {
    return this.execute<T>(method, 'call', options, from);
  }

  protected getPublicKeySincePrivateKey(privateKey: string | Uint8Array) {
    return this.web3.eth.accounts.privateKeyToAccount(privateKey.toString());
  }

  public async send<T>(
    method: string,
    options: any[] | null = null,
    privateKey: string | Uint8Array | null = null,
    value: bigint = BigInt(0),
  ) {
    if (!privateKey) {
      throw new Error('Private key is required');
    }
    const signerWallet = this.getPublicKeySincePrivateKey(privateKey);

    const gasUse = await this.estimateGas(method, options, signerWallet.address);
    const gasPrice = await this.web3.eth.getGasPrice();
    const nonce = await this.web3.eth.getTransactionCount(signerWallet.address);

    let send = {
      gas: gasUse.toString(),
      gasPrice: Math.floor(Number(gasPrice) * 1.1).toString(),
      from: signerWallet.address,
    } as NonPayableCallOptions;
    if (value > 0) {
      send = { ...send, value: value.toString() } as PayableCallOptions;
    }

    const callback = this.contract.methods[method] as CallableFunction;
    return callback(...(options || [])).send({ ...send, nonce } as Transaction) as T;
  }

  public async estimateGas(method: string, options: any[] | null = null, from: string | null = null) {
    return this.execute<bigint>(method, 'estimateGas', options, from);
  }

  protected async resolveAddress(addressEns: string) {
    try {
      if (this._proxyEns[addressEns]) {
        return this._proxyEns[addressEns];
      }
      const address = (await this.web3.eth.ens.getOwner(addressEns)) as string;
      this._proxyEns[addressEns] = address;
      return address;
    } catch (error) {
      throw new Error(`Invalid ENS address: ${addressEns}`);
    }
  }

  protected createSignature(privateKey: string, messageParams: { type: string; value: any }[]): string {
    const _types = [];
    const _values = [];
    for (const value of messageParams) {
      _types.push(value.type);
      _values.push(value.value);
    }

    const message = ethers.solidityPackedKeccak256(_types, _values);
    const hash = ethers.getBytes(message);

    const wallet = new ethers.Wallet(privateKey);
    return wallet.signMessageSync(hash);
  }

  get events(): ContractEventsInterface<ContractAbi, ContractEvents<ContractAbi>> {
    return this.contract.events;
  }
}
