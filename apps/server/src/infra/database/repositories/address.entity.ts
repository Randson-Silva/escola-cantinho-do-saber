import { Entity } from '../../../core/entities/entity';
import { UniqueEntityId } from '../../../core/entities/unique-entity-id';

export interface AddressProps {
  street: string;
  number: string;
  district: string;
  complement?: string | null;
}

export class AddressEntity extends Entity<AddressProps> {
  get street() { return this.props.street; }
  get number() { return this.props.number; }
  get district() { return this.props.district; }
  get complement() { return this.props.complement ?? null; }

  static create(props: AddressProps, id?: UniqueEntityId) {
    return new AddressEntity(props, id);
  }

  static restore(props: AddressProps, id: UniqueEntityId) {
    return new AddressEntity(props, id);
  }
}
