import { Entity } from 'apps/server/src/core/entities/entity';
import { UniqueEntityId } from 'apps/server/src/core/entities/unique-entity-id';
import { Optional } from 'apps/server/src/core/types/optional';

export interface AddressProps {
  street: string;
  number: string;
  district: string;
  complement?: string | null;
  city?: string | null;
  state?: string | null;

  studentIds?: string[] | null;
  guardianIds?: string[] | null;

  createdAt: Date;
  deletedAt: Date | null;
}

export class AddressEntity extends Entity<AddressProps> {
  get street() {
    return this.props.street;
  }

  get number() {
    return this.props.number;
  }

  get district() {
    return this.props.district;
  }

  get complement() {
    return this.props.complement ?? null;
  }

  get city() {
    return this.props.city ?? null;
  }

  get state() {
    return this.props.state ?? null;
  }

  get studentIds() {
    return this.props.studentIds ?? [];
  }

  get guardianIds() {
    return this.props.guardianIds ?? [];
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get deletedAt() {
    return this.props.deletedAt;
  }

  static create(
    props: Optional<
      AddressProps,
      'createdAt' | 'deletedAt' | 'studentIds' | 'guardianIds' | 'city' | 'state'
    >,
    id?: UniqueEntityId,
  ) {
    return new AddressEntity(
      {
        ...props,
        city: props.city ?? null,
        state: props.state ?? null,
        studentIds: props.studentIds ?? [],
        guardianIds: props.guardianIds ?? [],
        createdAt: props.createdAt ?? new Date(),
        deletedAt: props.deletedAt ?? null,
      },
      id,
    );
  }

  static compareAddresses({
    studentAddress,
    guardianAddress,
  }: {
    studentAddress: Optional<AddressProps, 'createdAt' | 'deletedAt'>;
    guardianAddress: Optional<AddressProps, 'createdAt' | 'deletedAt'>;
  }): boolean {
    return (
      studentAddress.street.toLowerCase() === guardianAddress.street.toLowerCase() &&
      studentAddress.number.toLowerCase() === guardianAddress.number.toLowerCase() &&
      studentAddress.district.toLowerCase() === guardianAddress.district.toLowerCase() &&
      (studentAddress.complement?.toLowerCase() ?? '') ===
        (guardianAddress.complement?.toLowerCase() ?? '')
    );
  }
}
