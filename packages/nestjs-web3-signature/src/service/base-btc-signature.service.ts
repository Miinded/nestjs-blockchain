import { ISignature } from './signature.interface';

export abstract class BaseBtcSignatureService<T> implements ISignature<T> {
  constructor(protected readonly privateKey?: string) {}

  abstract createSignature(message: T): string;
  abstract recoverSignature(signature: string, message: T, wallet?: string): Promise<string>;

  getPublicKey(): string {
    if (!this.privateKey) {
      throw new Error('Private key is not defined');
    }
    throw new Error('getPublicKey not implemented for BTC');
  }
}
