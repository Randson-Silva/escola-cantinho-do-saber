import { ContractEntity } from '../../enterprise/entities/contract.entity';

export const CONTRACT_REPOSITORY_TOKEN = 'IContractRepository';

export abstract class IContractRepository {
  abstract create(contract: ContractEntity): Promise<boolean>;
  abstract findById(id: string): Promise<ContractEntity | null>;
}
