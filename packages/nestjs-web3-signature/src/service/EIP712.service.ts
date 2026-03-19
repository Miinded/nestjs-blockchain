import { Injectable, Logger } from '@nestjs/common';
import {
  recoverTypedSignature,
  signTypedData,
  SignTypedDataVersion,
  TypedMessage,
  MessageTypes,
  MessageTypeProperty,
} from '@metamask/eth-sig-util';
export {
  signTypedData,
  SignTypedDataVersion,
  TypedMessage,
  MessageTypes,
  MessageTypeProperty,
} from '@metamask/eth-sig-util';
import { BaseSignatureService } from './base-signature.service';

@Injectable()
export class EIP712Service extends BaseSignatureService<TypedMessage<MessageTypes>> {
  logger = new Logger(EIP712Service.name);

  public createSignature(message: TypedMessage<MessageTypes>): string {
    if (!this.privateKey) {
      throw new Error('Private key is not defined');
    }
    const myBuffer = Buffer.from(this.privateKey.replace('0x', ''), 'hex');
    const signature = signTypedData({
      version: SignTypedDataVersion.V4,
      privateKey: myBuffer,
      data: message,
    });

    return signature;
  }

  public async recoverSignature(
    signature: string,
    message: TypedMessage<MessageTypes>,
    _wallet?: string,
  ): Promise<string> {
    const msgParams = JSON.stringify(message);

    const recover = recoverTypedSignature({
      data: JSON.parse(msgParams),
      signature: signature,
      version: SignTypedDataVersion.V4,
    });

    return this.web3.utils.toChecksumAddress(recover);
  }

  public generateTypedMessage<T>(
    types: { [additionalProperties: string]: MessageTypeProperty[] },
    primaryType: string,
    message: T,
    networkId: number,
    contractName: string,
    contractAddress: string,
  ) {
    return {
      types: {
        EIP712Domain: [
          { name: 'name', type: 'string' },
          { name: 'version', type: 'string' },
          { name: 'chainId', type: 'uint256' },
          { name: 'verifyingContract', type: 'address' },
        ],
        ...types,
      },
      primaryType,
      domain: {
        name: contractName,
        version: '1',
        chainId: networkId,
        verifyingContract: contractAddress,
      },
      message,
    } as TypedMessage<MessageTypes>;
  }
}
