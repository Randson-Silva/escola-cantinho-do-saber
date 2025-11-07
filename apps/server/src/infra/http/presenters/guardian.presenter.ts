import { GuardianEntity } from 'apps/server/src/domain/enterprise/entities/guardian.entity';

export class GuardianPresenter {
  static toHTTP(guardian: GuardianEntity) {
    return {
      id: guardian.id.toString(),
      name: guardian.name,
      email: guardian.email,
      phones: guardian.phones,
    };
  }
}
