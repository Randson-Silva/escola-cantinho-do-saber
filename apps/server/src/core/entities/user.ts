import { ProfileEntity } from '../../domain/enterprise/entities/profile.entity';
import { Entity } from './entity';
import { UniqueEntityId } from './unique-entity-id';

export interface UserProps {
  name: string;

  email: string;
  password: string;

  profile: ProfileEntity;
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

  static create(props: UserProps, id?: UniqueEntityId) {
    const userEntity = new UserEntity(props, id);

    return userEntity;
  }
}
