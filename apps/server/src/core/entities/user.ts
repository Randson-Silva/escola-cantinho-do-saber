import { Entity } from './entity';
import { Optional } from '../types/optional';
import { Role } from '../types/roles';
import { EntityId } from './unique-entity-id';
import { UserStatus } from '../types/user-status';

export interface UserProps {
  name: string;
  phonenumber: string;

  email: string;
  password: string | null;

  role: Role;

  status: UserStatus;

  createdAt: Date;
  updatedAt: Date | null;
  deletedAt: Date | null;
}

export class User<Props = any> extends Entity<Props & UserProps> {
  get name() {
    return this.props.name;
  }

  get phonenumber() {
    return this.props.phonenumber;
  }

  get email() {
    return this.props.email;
  }

  get password() {
    return this.props.password;
  }

  get role() {
    return this.props.role;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get updatedAt() {
    return this.props.updatedAt;
  }

  get deletedAt() {
    return this.props.deletedAt;
  }

  get status() {
    return this.props.status;
  }

  set status(status: UserStatus) {
    this.props.status = status;
  }

  protected touch() {
    this.props.updatedAt = new Date();
  }

  static create(
    props: Optional<UserProps, 'status' | 'createdAt' | 'deletedAt' | 'updatedAt'>,
    id?: EntityId,
  ) {
    const user = new User(
      {
        ...props,
        status: 'active',
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? null,
        deletedAt: props.deletedAt ?? null,
      },
      id,
    );

    return user;
  }
}
