import { SignatureType } from '@miinded/nestjs-web3-signature';

export interface IBlockchainAuthWallet {
  getOneUserByWallet(wallet: string): Promise<unknown>;
  nonce(
    signatureType: SignatureType,
    networkId: number,
    wallet: string,
    domain: string,
    uri: string,
    message: string | { message: string; wallet: string } | { message: string; address: string },
  ): Promise<{
    nonce: string;
    issuedAt: string;
  }>;
}
