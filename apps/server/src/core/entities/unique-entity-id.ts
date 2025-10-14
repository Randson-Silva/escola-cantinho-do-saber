import { ulid } from 'ulid';

export class EntityId {
  private value: string;

  toString() {
    return this.value;
  }

  constructor(value?: string) {
    this.value = value ?? ulid();
  }

  equals(id: EntityId) {
    return id.toString() === this.value;
  }
}
