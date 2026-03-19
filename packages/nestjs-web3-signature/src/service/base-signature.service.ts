import { Logger } from '@nestjs/common';
import Web3 from 'web3';
import { ISignature } from './signature.interface';
export { ISignature } from './signature.interface';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type RegisteredSubscription = any;

export abstract class BaseSignatureService<T> implements ISignature<T> {
  protected readonly logger = new Logger(BaseSignatureService.name);

  constructor(
    protected readonly web3: Web3<RegisteredSubscription>,
    protected readonly privateKey?: string,
  ) {}

  getPublicKey(): string {
    if (!this.privateKey) {
      throw new Error('Private key is not defined');
    }
    return this.web3.eth.accounts.privateKeyToAccount(this.privateKey).address;
  }

  abstract createSignature(message: T): string;
  abstract recoverSignature(signature: string, message: T, wallet?: string): Promise<string>;
}
