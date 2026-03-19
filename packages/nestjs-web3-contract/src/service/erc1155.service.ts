import { Injectable } from '@nestjs/common';
import { BaseContractService } from './base-contract.service';
import { IERC1155 } from '../interfaces/erc1155.interface';

@Injectable()
export class ERC1155Service extends BaseContractService implements IERC1155 {
  async balanceOf(account: string, id: number): Promise<bigint> {
    return this.call<bigint>('balanceOf', [await this.resolveAddress(account), id]);
  }

  async balanceOfBatch(accounts: string[], ids: number[]): Promise<bigint[]> {
    const accountsResolved = await Promise.all(accounts.map(async (x) => await this.resolveAddress(x)));
    return this.call<bigint[]>('balanceOfBatch', [accountsResolved, ids]);
  }

  async setApprovalForAll(privateKey: string | Uint8Array, operator: string, approved: boolean): Promise<void> {
    this.send<boolean>('safeTransferFrom', [await this.resolveAddress(operator), approved], privateKey);
  }

  async isApprovedForAll(account: string, operator: string): Promise<boolean> {
    return this.call<boolean>('isApprovedForAll', [
      await this.resolveAddress(account),
      await this.resolveAddress(operator),
    ]);
  }

  async safeTransferFrom(
    privateKey: string | Uint8Array,
    from: string,
    to: string,
    id: number,
    amount: number,
    data: string,
  ): Promise<void> {
    this.send<boolean>(
      'safeTransferFrom',
      [await this.resolveAddress(from), await this.resolveAddress(to), id, amount, data],
      privateKey,
    );
  }

  async safeBatchTransferFrom(
    privateKey: string | Uint8Array,
    from: string,
    to: string,
    ids: number[],
    amounts: number[],
    data: string,
  ): Promise<void> {
    this.send<boolean>(
      'safeBatchTransferFrom',
      [await this.resolveAddress(from), await this.resolveAddress(to), ids, amounts, data],
      privateKey,
    );
  }

  async setURI(privateKey: string | Uint8Array, uri: string): Promise<void> {
    this.send<boolean>('setURI', [uri], privateKey);
  }

  async uri(id: number): Promise<string> {
    return this.call<string>('uri', [id]);
  }
}
