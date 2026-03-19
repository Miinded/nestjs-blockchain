export interface IERC1155 {
  balanceOf(account: string, id: number): Promise<bigint>;
  balanceOfBatch(accounts: string[], ids: number[]): Promise<bigint[]>;
  setApprovalForAll(privateKey: string | Uint8Array, operator: string, approved: boolean): Promise<void>;
  isApprovedForAll(account: string, operator: string): Promise<boolean>;
  safeTransferFrom(
    privateKey: string | Uint8Array,
    from: string,
    to: string,
    id: number,
    amount: number,
    data: string,
  ): Promise<void>;
  safeBatchTransferFrom(
    privateKey: string | Uint8Array,
    from: string,
    to: string,
    ids: number[],
    amounts: number[],
    data: string,
  ): Promise<void>;
  // Additional ERC1155 methods
  setURI(privateKey: string | Uint8Array, uri: string): Promise<void>;
  uri(id: number): Promise<string>;
}

// ERC1155 Burnable Extension Interface
export interface IERC1155Burnable extends IERC1155 {
  burn(privateKey: string | Uint8Array, from: string, id: number, quantity: number): Promise<void>;
  burnBatch(privateKey: string | Uint8Array, from: string, ids: number[], quantities: number[]): Promise<void>;
}
