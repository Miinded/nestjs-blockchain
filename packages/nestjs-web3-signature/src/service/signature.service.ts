import { Injectable, Logger } from '@nestjs/common';
import { BaseSignatureService } from './base-signature.service';

@Injectable()
export class SignatureService extends BaseSignatureService<string | object> {
  logger = new Logger(SignatureService.name);

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
    const message_hash = this.web3.utils.sha3(JSON.stringify(message));
    if (!message_hash) {
      throw new Error('Invalid message hash.');
    }
    const recover = this.web3.eth.accounts.recover(message_hash, signature);
    return this.web3.utils.toChecksumAddress(recover);
  }
}
