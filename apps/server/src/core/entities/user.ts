import { ProfileEntity } from '../../domain/enterprise/entities/profile.entity';
import { Optional } from '../types/optional';
import { Entity } from './entity';
import { UniqueEntityId } from './unique-entity-id';

export interface UserProps {
  name: string;

  email: string;
  password: string;

  profile: ProfileEntity;

  createdAt: Date;
  deletedAt: Date | null;
}

export class UserEntity<Props = any> extends Entity<Props & UserProps> {
  get name() {
    return this.props.name;
  }

  get email() {
    return this.props.email;
  }

  get password() {
    return this.props.password;
  }

  get profile() {
    return this.props.profile;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get deletedAt() {
    return this.props.deletedAt;
  }

  static create(props: Optional<UserProps, 'createdAt' | 'deletedAt'>, id?: UniqueEntityId) {
    const userEntity = new UserEntity(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
        deletedAt: props.deletedAt ?? null,
      },
      id,
    );

    return userEntity;
  }
}
