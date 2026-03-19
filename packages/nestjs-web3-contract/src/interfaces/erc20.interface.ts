export interface IERC20 {
  totalSupply(): Promise<bigint>;
  balanceOf(address: string): Promise<bigint>;
  transfer(privateKey: string | Uint8Array, to: string, amount: number): Promise<boolean>;
  allowance(owner: string, spender: string): Promise<bigint>;
  approve(privateKey: string | Uint8Array, spender: string, amount: number): Promise<boolean>;
  transferFrom(privateKey: string | Uint8Array, sender: string, recipient: string, amount: number): Promise<boolean>;

  name(): Promise<string>;
  symbol(): Promise<string>;
  decimals(): Promise<bigint>;
}

export interface IERC20Burnable extends IERC20 {
  burn(privateKey: string | Uint8Array, amount: number): Promise<boolean>;
  burnFrom(privateKey: string | Uint8Array, account: string, amount: number): Promise<boolean>;
}

export interface IERC20Safe extends IERC20 {
  safeTransfer(privateKey: string | Uint8Array, token: string, to: string, value: number): Promise<void>;
  safeTransferFrom(
    privateKey: string | Uint8Array,
    token: string,
    from: string,
    to: string,
    value: number,
  ): Promise<void>;
  forceApprove(privateKey: string | Uint8Array, token: string, spender: string, value: number): Promise<void>;
  safeIncreaseAllowance(privateKey: string | Uint8Array, token: string, spender: string, value: number): Promise<void>;
  safeDecreaseAllowance(privateKey: string | Uint8Array, token: string, spender: string, value: number): Promise<void>;
}
