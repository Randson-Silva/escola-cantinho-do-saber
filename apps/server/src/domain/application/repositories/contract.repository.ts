import { ContractEntity } from '../../enterprise/entities/contract.entity';
import { EnrollmentEntity } from '../../enterprise/entities/enrollment.entity';

export const CONTRACT_REPOSITORY_TOKEN = 'IContractRepository';

export abstract class IContractRepository {
  abstract create(contract: ContractEntity, initialEnrollment?: EnrollmentEntity): Promise<boolean>;
  abstract findById(id: string): Promise<ContractEntity | null>;
}
