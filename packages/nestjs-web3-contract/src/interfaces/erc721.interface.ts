export interface IERC721 {
  balanceOf(address: string): Promise<bigint>;
  ownerOf(tokenId: number): Promise<string>;
  safeTransferFrom(
    privateKey: string | Uint8Array,
    from: string,
    to: string,
    tokenId: number,
    data?: string,
  ): Promise<void>;
  transferFrom(privateKey: string | Uint8Array, from: string, to: string, tokenId: number): Promise<boolean>;

  approve(privateKey: string | Uint8Array, to: string, tokenId: number): Promise<boolean>;
  setApprovalForAll(privateKey: string | Uint8Array, operator: string, approved: boolean): Promise<void>;
  getApproved(tokenId: number): Promise<string>;
  isApprovedForAll(owner: string, operator: string): Promise<boolean>;

  supportsInterface(interfaceId: string): Promise<boolean>;

  // Metadata Extension Interface
  tokenURI(tokenId: number): Promise<string>;
  name(): Promise<string>;
  symbol(): Promise<string>;
  baseURI(): Promise<string>;

  totalSupply(): Promise<bigint>;
}

// ERC721 Burnable Extension Interface
export interface IERC721Burnable extends IERC721 {
  burn(privateKey: string | Uint8Array, tokenId: number): Promise<void>;
}
