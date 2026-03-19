import Web3 from 'web3';
import { ISignature, SignatureType, SignatureTypeMap } from './signature.interface';
import { BIP322Service } from './BIP322.service';
import { SignatureService } from './signature.service';
import { EIP712Service } from './EIP712.service';
import { SiweService } from './siwe.service';
import { SignatureContractService } from './signature-contract.service';
import { RegisteredSubscription } from './base-signature.service';

export class SignatureManager {
  private services: Map<SignatureType, ISignature<unknown>> = new Map();

  static init(): SignatureManager {
    return new SignatureManager();
  }

  register<K extends SignatureType>(name: K, service: ISignature<SignatureTypeMap[K]>): void {
    this.services.set(name, service as ISignature<unknown>);
  }

  get<K extends SignatureType>(name: K): ISignature<SignatureTypeMap[K]> {
    const service = this.services.get(name);
    if (!service) {
      throw new Error(`No signature service registered for type: ${name}`);
    }
    return service as ISignature<SignatureTypeMap[K]>;
  }

  static fromConfig(web3: Web3<RegisteredSubscription>, privateKey?: string, privateKeyBtc?: string): SignatureManager {
    const manager = SignatureManager.init();
    manager.register(SignatureType.BIP322, new BIP322Service(privateKeyBtc));
    manager.register(SignatureType.SIMPLE, new SignatureService(web3, privateKey));
    manager.register(SignatureType.ADVANCED, new EIP712Service(web3, privateKey));
    manager.register(SignatureType.SIWE, new SiweService(web3, privateKey));
    manager.register(SignatureType.CONTRACT, new SignatureContractService(web3, privateKey));
    return manager;
  }
}
