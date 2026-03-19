import { Injectable, Logger } from '@nestjs/common';
import { BaseSignatureService, RegisteredSubscription } from './base-signature.service';
import Web3 from 'web3';

@Injectable()
export class SignatureContractService extends BaseSignatureService<string | object> {
  protected readonly logger = new Logger(SignatureContractService.name);

  constructor(web3: Web3<RegisteredSubscription>, privateKey?: string) {
    super(web3, privateKey);
  }

  public createSignature(message: string | object): string {
    if (!this.privateKey) {
      throw new Error('Private key is not defined');
    }
    const hexMessage = this.web3.utils.sha3(JSON.stringify(message));
    if (!hexMessage) {
      throw new Error('Invalid hex message.');
    }
    const signature = this.web3.eth.accounts.sign(hexMessage, this.privateKey);
    return signature.signature;
  }

  public async recoverSignature(signature: string, message: object | string, _wallet?: string): Promise<string> {
    const messageHash = this.web3.utils.sha3(JSON.stringify(message));
    if (!messageHash) {
      throw new Error('Invalid message hash.');
    }
    const recover = this.web3.eth.accounts.recover(messageHash, signature);
    return this.web3.utils.toChecksumAddress(recover);
  }
}
