import { GuardianEntity } from '../../enterprise/entities/guardian.entity';

export abstract class IGuardianRepository {
  abstract create(guardianEntity: GuardianEntity): Promise<boolean>;
  abstract findById(id: string): Promise<GuardianEntity | null>;
  abstract findByEmail(email: string): Promise<GuardianEntity | null>;
  abstract update(guardianEntity: GuardianEntity): Promise<boolean>;
  abstract delete(id: string): Promise<boolean>;
}

export const GUARDIAN_REPOSITORY_TOKEN = 'IGuardianRepository';
