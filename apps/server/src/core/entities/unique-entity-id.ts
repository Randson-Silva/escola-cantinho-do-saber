import { ulid } from 'ulid';

export class UniqueEntityId {
  private value: string;

  toString() {
    return this.value;
  }

  constructor(value?: string) {
    this.value = value ?? ulid();
  }

  equals(id: UniqueEntityId) {
    return id.toString() === this.value;
  }
}
