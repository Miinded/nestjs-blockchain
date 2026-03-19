import { SignatureManager, SignatureType, SiweMessage } from '@miinded/nestjs-web3-signature';
import { Injectable, Logger } from '@nestjs/common';
import { TypedMessage, MessageTypes } from '@metamask/eth-sig-util';
import { IBlockchainAuth } from '../interface/IBlockchainAuth.interface';

export type MessageTypedBtc = { message: string; address: string };
export type MessageTypedEvm = { message: string; wallet: string };
export type MessageTyped = MessageTypedBtc | MessageTypedEvm;

@Injectable()
export class NonceCheckerService {
  private readonly logger = new Logger(NonceCheckerService.name);

  constructor(
    private readonly signatureManager: SignatureManager,
    private readonly userService: IBlockchainAuth,
  ) {}

  public async signIsValid(networkId: string, domains: string[], wallet: string, nonce: string, signature: string) {
    const nonceValidity = await this.userService.get<{
      nonce: string;
      issuedAt: string;
      domain: string;
      uri: string;
      message: MessageTyped | string;
      signatureType: SignatureType;
    }>(Number(networkId), wallet, nonce);

    if (!nonceValidity) {
      throw new Error('Token expired');
    }

    if (!domains.includes(nonceValidity.domain)) {
      throw new Error('Domain not allowed');
    }
    const domain = nonceValidity.domain;

    const messageInNonce = nonceValidity.message;
    if (!messageInNonce) {
      throw new Error('Invalid signature');
    }

    const { issuedAt } = nonceValidity;
    const uri = nonceValidity.uri;
    const signatureService = this.signatureManager.get(nonceValidity.signatureType);

    let message: object | SiweMessage;

    if (nonceValidity.signatureType === SignatureType.SIMPLE) {
      const _message = nonceValidity.message as MessageTypedEvm;
      this.logger.debug('signatureType.simple');
      message = {
        domain,
        chainId: networkId,
        message: _message.message,
        wallet: _message.wallet,
        nonce,
        uri,
      };
    } else if (nonceValidity.signatureType === SignatureType.BIP322) {
      const _message = nonceValidity.message as MessageTypedBtc;
      this.logger.debug('signatureType.bip322');
      message = {
        message: {
          domain,
          chainId: Number(networkId),
          statement: _message.message,
          address: _message.address,
          nonce,
          uri,
          issuedAt,
        },
        address: _message.address,
      };
    } else if (nonceValidity.signatureType === SignatureType.ADVANCED) {
      const _message = nonceValidity.message as MessageTypedEvm;
      this.logger.debug('signatureType.advanced');
      message = {
        types: {
          EIP712Domain: [
            { name: 'name', type: 'string' },
            { name: 'version', type: 'string' },
            { name: 'chainId', type: 'uint256' },
          ],
          Content: [
            { name: 'message', type: 'string' },
            { name: 'wallet', type: 'address' },
            { name: 'nonce', type: 'string' },
            { name: 'uri', type: 'string' },
          ],
        },
        primaryType: 'Content',
        domain: {
          name: domain,
          version: '1',
          chainId: Number(networkId),
        },
        message: { ..._message, nonce, uri } as {
          message: string;
          wallet: string;
          nonce: string;
          uri: string;
        },
      } as TypedMessage<MessageTypes>;
    } else if (nonceValidity.signatureType === SignatureType.SIWE) {
      this.logger.debug('signatureType.siwe');
      message = new SiweMessage({
        domain,
        address: wallet,
        statement: messageInNonce as string,
        uri,
        version: '1',
        chainId: Number(networkId),
        nonce: nonce,
        issuedAt,
      });
    } else {
      throw new Error(`Unsupported signature type: ${nonceValidity.signatureType}`);
    }

    this.logger.debug('domain', domain);
    this.logger.debug('signature', signature);
    const recoverWallet = await signatureService.recoverSignature(signature, message as never, wallet);

    if (!recoverWallet || recoverWallet.toLowerCase() !== wallet.toLowerCase()) {
      throw new Error('Wallet not match');
    }

    return nonceValidity;
  }
}
