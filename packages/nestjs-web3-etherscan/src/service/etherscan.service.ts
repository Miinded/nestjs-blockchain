import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AbiParameter, ContractAbi, DecodedParams } from 'web3-types';
import {
  EtherscanLogsResponse,
  EtherscanOrder,
  EtherscanPriceResponse,
  EtherscanTransferResponse,
} from '../interfaces/etherscan.interface';
import Web3 from 'web3';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class EtherscanService {
  private readonly logger = new Logger(EtherscanService.name);
  private _web3: Web3 | null = null;

  constructor(
    private readonly httpService: HttpService,
    private readonly blockchainAddress: string,
  ) {}

  public async getWeb3(): Promise<Web3> {
    if (!this._web3) {
      this._web3 = new Web3(new Web3.providers.HttpProvider(this.blockchainAddress));
    }
    return this._web3;
  }

  public async listLogs(
    address: string,
    startblock: number,
    endblock: number | 'latest',
    topic: string,
  ): Promise<EtherscanLogsResponse[]> {
    const params = {
      module: 'logs',
      action: 'getLogs',
      address,
      fromBlock: startblock,
      toBlock: endblock,
      topic0: topic,
    };

    try {
      const { data } = await lastValueFrom(this.httpService.get(`api?`, { params }));
      return data.result as EtherscanLogsResponse[];
    } catch (e) {
      this.logger.error(`Erreur: listLogs; URL: ${this.httpService.axiosRef.defaults.baseURL};`, params, e);
      return [] as EtherscanLogsResponse[];
    }
  }

  public async decodeLog(inputs: AbiParameter[], data: string, topics: string[]): Promise<DecodedParams> {
    const web3 = await this.getWeb3();
    return web3.eth.abi.decodeLog(inputs, data, topics.slice(1));
  }

  public async getAbi(address: string): Promise<ContractAbi> {
    const params = {
      module: 'contract',
      action: 'getabi',
      address,
    };

    try {
      const result = await lastValueFrom(this.httpService.get(`api?`, { params }));
      return JSON.parse(result.data.result) as ContractAbi;
    } catch (e) {
      this.logger.error(`Erreur: getAbi; URL: ${this.httpService.axiosRef.defaults.baseURL};`, params, e);
      return [] as ContractAbi;
    }
  }

  public async listTransactions(
    address: string,
    startblock: number,
    endblock: number | 'latest',
    sort: EtherscanOrder,
  ): Promise<EtherscanTransferResponse[] | undefined> {
    const params = {
      module: 'account',
      action: 'txlist',
      address,
      startblock,
      endblock,
      sort,
    };

    try {
      const result = await lastValueFrom(this.httpService.get(`api?`, { params }));
      return result.data.result as EtherscanTransferResponse[];
    } catch (e) {
      this.logger.error(`Erreur: listTransactions; URL: ${this.httpService.axiosRef.defaults.baseURL};`, params, e);
      return undefined;
    }
  }

  public async getCurrentBlock(safe = false): Promise<string | number | undefined> {
    const params = {
      module: 'proxy',
      action: 'eth_blockNumber',
      tag: 'latest',
      boolean: true,
    };
    try {
      const result = await lastValueFrom(this.httpService.get(`/api?`, { params }));
      const currentBlock = parseInt(result.data.result, 16);
      if (safe) {
        return (currentBlock - 12).toString();
      }
      return currentBlock;
    } catch (e) {
      this.logger.error(`Erreur: getCurrentBlock; URL: ${this.httpService.axiosRef.defaults.baseURL};`, params, e);
      return undefined;
    }
  }

  public async getCurrencyPrice(): Promise<EtherscanPriceResponse | undefined> {
    const params = {
      module: 'stats',
      action: 'ethprice',
    };
    try {
      const { data } = await lastValueFrom(this.httpService.get(`/api?`, { params }));
      return data.result as EtherscanPriceResponse;
    } catch (e) {
      this.logger.error(`Erreur: getCurrencyPrice; URL: ${this.httpService.axiosRef.defaults.baseURL};`, params, e);
      return undefined;
    }
  }
}
