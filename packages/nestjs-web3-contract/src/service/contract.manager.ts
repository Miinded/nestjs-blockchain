import { BaseContractService } from './base-contract.service';

export class ContractManager {
  private contracts: Map<string, BaseContractService> = new Map();

  static init(): ContractManager {
    return new ContractManager();
  }

  register(name: string, service: BaseContractService): void {
    this.contracts.set(name, service);
  }

  get<T extends BaseContractService>(name: string): T {
    const service = this.contracts.get(name);
    if (!service) {
      throw new Error(`No contract registered for name: ${name}`);
    }
    return service as T;
  }
}
