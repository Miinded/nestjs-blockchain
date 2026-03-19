import { Injectable } from '@nestjs/common';
import { BaseContractService } from './base-contract.service';
import { IERC20 } from '../interfaces/erc20.interface';

@Injectable()
export class ERC20Service extends BaseContractService implements IERC20 {
  async totalSupply(): Promise<bigint> {
    return this.call<bigint>('totalSupply');
  }

  async balanceOf(address: string): Promise<bigint> {
    return this.call<bigint>('balanceOf', [await this.resolveAddress(address)]);
  }

  async transfer(privateKey: string | Uint8Array, to: string, amount: number): Promise<boolean> {
    return this.send<boolean>('transfer', [await this.resolveAddress(to), amount], privateKey);
  }

  async allowance(owner: string, spender: string): Promise<bigint> {
    return this.call<bigint>('allowance', [await this.resolveAddress(owner), spender]);
  }

  async approve(privateKey: string | Uint8Array, spender: string, amount: number): Promise<boolean> {
    return this.send<boolean>('approve', [await this.resolveAddress(spender), amount], privateKey);
  }

  async transferFrom(
    privateKey: string | Uint8Array,
    sender: string,
    recipient: string,
    amount: number,
  ): Promise<boolean> {
    return this.send<boolean>(
      'transferFrom',
      [await this.resolveAddress(sender), await this.resolveAddress(recipient), amount],
      privateKey,
    );
  }

  async name(): Promise<string> {
    return this.call<string>('name');
  }

  async symbol(): Promise<string> {
    return this.call<string>('symbol');
  }

  async decimals(): Promise<bigint> {
    return this.call<bigint>('decimals');
  }
}
