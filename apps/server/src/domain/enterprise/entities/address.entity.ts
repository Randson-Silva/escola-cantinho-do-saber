import { Entity } from "apps/server/src/core/entities/entity";
import { Optional } from "apps/server/src/core/types/optional";
import { UniqueEntityId } from "apps/server/src/core/entities/unique-entity-id";

export interface AddressProps {
    street: string;
    number: string;
    district: string;
    complement?: string | null;
    createdAt: Date;
    updatedAt: Date | null;
    deletedAt: Date | null;
}

export class AddressEntity extends Entity<AddressProps> {
  get street() { return this.props.street; }
  get number() { return this.props.number; }
  get district() { return this.props.district; }
  get complement() { return this.props.complement ?? null; }
  get createdAt() { return this.props.createdAt; }
  get updatedAt() { return this.props.updatedAt; }
  get deletedAt() { return this.props.deletedAt; }

  static create(props: Omit<AddressProps, 'createdAt' | 'updatedAt' | 'deletedAt'>, id?: UniqueEntityId) {
    const now = new Date();
    const entity = new AddressEntity(
      { ...props, createdAt: now, updatedAt: null, deletedAt: null },
      id,
    );
    return entity;
  }
}