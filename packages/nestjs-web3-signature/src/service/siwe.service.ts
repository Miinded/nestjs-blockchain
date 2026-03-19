import { Injectable, Logger } from '@nestjs/common';
import { BaseSignatureService } from './base-signature.service';
import { SiweMessage } from 'siwe';

@Injectable()
export class SiweService extends BaseSignatureService<SiweMessage> {
  logger = new Logger(SiweService.name);

  public createSignature(message: SiweMessage): string {
    if (!this.privateKey) {
      throw new Error('Private key is not defined');
    }
    const signature = this.web3.eth.accounts.sign(message.prepareMessage(), this.privateKey);
    return signature.signature;
  }

  public async recoverSignature(signature: string, message: SiweMessage, _wallet?: string): Promise<string> {
    const { data } = await message.verify({
      signature,
    });

    return this.web3.utils.toChecksumAddress(data.address);
  }
}
