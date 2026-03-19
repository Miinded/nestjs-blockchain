import { TypedMessage, MessageTypes } from '@metamask/eth-sig-util';
import { SiweMessage } from 'siwe';

export interface ISignature<T> {
  createSignature(message: T): string;
  recoverSignature(signature: string, message: T, wallet?: string): Promise<string>;
  getPublicKey(): string;
}

export enum SignatureType {
  SIMPLE = 'simple',
  ADVANCED = 'advanced',
  SIWE = 'siwe',
  BIP322 = 'bip322',
  CONTRACT = 'contract',
}

export type BIP322Message = { message: string | object; address: string };

export interface SignatureTypeMap {
  [SignatureType.SIMPLE]: string | object;
  [SignatureType.ADVANCED]: TypedMessage<MessageTypes>;
  [SignatureType.SIWE]: SiweMessage;
  [SignatureType.BIP322]: BIP322Message;
  [SignatureType.CONTRACT]: string | object;
}
