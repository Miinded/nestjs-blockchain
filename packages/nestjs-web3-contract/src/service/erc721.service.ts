import { Injectable } from '@nestjs/common';
import { BaseContractService } from './base-contract.service';
import { IERC721 } from '../interfaces/erc721.interface';

@Injectable()
export class ERC721Service extends BaseContractService implements IERC721 {
  async balanceOf(address: string): Promise<bigint> {
    return this.call<bigint>('balanceOf', [await this.resolveAddress(address)]);
  }

  async ownerOf(tokenId: number): Promise<string> {
    return this.call<string>('ownerOf', [tokenId]);
  }

  async safeTransferFrom(
    privateKey: string | Uint8Array,
    from: string,
    to: string,
    tokenId: number,
    data?: string,
  ): Promise<void> {
    this.send<boolean>(
      'safeTransferFrom',
      [await this.resolveAddress(from), await this.resolveAddress(to), tokenId, data],
      privateKey,
    );
    return;
  }

  async transferFrom(privateKey: string | Uint8Array, from: string, to: string, tokenId: number): Promise<boolean> {
    return this.send<boolean>(
      'transferFrom',
      [await this.resolveAddress(from), await this.resolveAddress(to), tokenId],
      privateKey,
    );
  }

  async approve(privateKey: string | Uint8Array, to: string, tokenId: number): Promise<boolean> {
    return this.send<boolean>('approve', [await this.resolveAddress(to), tokenId], privateKey);
  }

  async setApprovalForAll(privateKey: string | Uint8Array, operator: string, approved: boolean): Promise<void> {
    this.send<boolean>('setApprovalForAll', [await this.resolveAddress(operator), approved], privateKey);
    return;
  }

  async getApproved(tokenId: number): Promise<string> {
    return this.call<string>('getApproved', [tokenId]);
  }

  async isApprovedForAll(owner: string, operator: string): Promise<boolean> {
    return this.call<boolean>('isApprovedForAll', [
      await this.resolveAddress(owner),
      await this.resolveAddress(operator),
    ]);
  }

  async supportsInterface(interfaceId: string): Promise<boolean> {
    return this.call<boolean>('supportsInterface', [interfaceId]);
  }

  async tokenURI(tokenId: number): Promise<string> {
    return this.call<string>('tokenURI', [tokenId]);
  }

  async name(): Promise<string> {
    return this.call<string>('name');
  }

  async symbol(): Promise<string> {
    return this.call<string>('symbol');
  }

  async baseURI(): Promise<string> {
    return this.call<string>('baseURI');
  }

  async totalSupply(): Promise<bigint> {
    return this.call<bigint>('totalSupply');
  }
}
