import { Injectable } from '@nestjs/common';
import { Signer, Verifier } from 'bip322-js';
import { BaseBtcSignatureService } from './base-btc-signature.service';
import { BIP322Message } from './signature.interface';
export { BIP322Message } from './signature.interface';

@Injectable()
export class BIP322Service extends BaseBtcSignatureService<BIP322Message> {
  constructor(privateKey?: string) {
    super(privateKey);
  }

  public createSignature(message: BIP322Message): string {
    if (!this.privateKey) {
      throw new Error('Private key is not defined');
    }
    const signature = Signer.sign(this.privateKey, message.address, JSON.stringify(message.message));

    return signature as string;
  }

  public async recoverSignature(signature: string, message: BIP322Message): Promise<string> {
    const validity = Verifier.verifySignature(message.address, JSON.stringify(message.message), signature);
    if (!validity) {
      throw new Error(`Invalid signature for address ${message.address}`);
    }
    return message.address;
  }
}
