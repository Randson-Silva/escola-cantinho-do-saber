import { Entity } from 'apps/server/src/core/entities/entity';
import { UniqueEntityId } from 'apps/server/src/core/entities/unique-entity-id';

export interface GuardianProps {
  name: string;
  email: string | null;
  phones: string[];
}

export class GuardianEntity extends Entity<GuardianProps> {
  get name() {
    return this.props.name;
  }

  get email() {
    return this.props.email;
  }

  get phones() {
    return this.props.phones;
  }

  static create(props: GuardianProps, id?: UniqueEntityId): GuardianEntity {
    const guardianEntity = new GuardianEntity(props, id);

    return guardianEntity;
  }
}
