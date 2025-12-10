import { Entity } from 'apps/server/src/core/entities/entity';
import { UniqueEntityId } from 'apps/server/src/core/entities/unique-entity-id';
import { Optional } from 'apps/server/src/core/types/optional';

export interface GuardianProps {
  name: string;
  email: string | null;
  phone: string; // (Tel único)

  addressIds: string[];
  studentIds: string[];

  createdAt: Date;
  deletedAt: Date | null;
}

export class GuardianEntity extends Entity<GuardianProps> {
  get name() {
    return this.props.name;
  }
  get email() {
    return this.props.email;
  }
  get phone() {
    return this.props.phone;
  }

  get addressIds() {
    return this.props.addressIds;
  }
  get studentIds() {
    return this.props.studentIds;
  }

  get createdAt() {
    return this.props.createdAt;
  }
  get deletedAt() {
    return this.props.deletedAt;
  }

  static create(
    props: Optional<GuardianProps, 'createdAt' | 'deletedAt' | 'addressIds' | 'studentIds'>,
    id?: UniqueEntityId,
  ): GuardianEntity {
    const guardianEntity = new GuardianEntity(
      {
        ...props,
        addressIds: props.addressIds ?? [],
        studentIds: props.studentIds ?? [],
        createdAt: props.createdAt ?? new Date(),
        deletedAt: props.deletedAt ?? null,
      },
      id,
    );

    return guardianEntity;
  }
}
