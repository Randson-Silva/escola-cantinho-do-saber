import { Entity } from 'apps/server/src/core/entities/entity';
import { UniqueEntityId } from 'apps/server/src/core/entities/unique-entity-id';

export interface AddressProps {
  street: string;
  number: string;
  district: string;
  complement?: string | null;
  studentIds?: string[] | null;
  guardianIds?: string[] | null;
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

  get studentIds() {
    return this.props.studentIds ?? null;
  }

  get guardianIds() {
    return this.props.guardianIds ?? null;
  }

  static create(props: AddressProps, id?: UniqueEntityId) {
    return new AddressEntity(props, id);
  }

  static compareAddresses({
    studentAddress,
    guardianAddress,
  }: {
    studentAddress: AddressProps;
    guardianAddress: AddressProps;
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
