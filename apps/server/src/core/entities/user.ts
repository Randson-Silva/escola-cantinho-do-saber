import { Entity } from './entity';
import { UniqueEntityId } from './unique-entity-id';

export interface UserProps {
  name: string;

  email: string;
  password: string;

  profileId: string;
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

  get profileId() {
    return this.props.profileId;
  }

  static create(props: UserProps, id?: UniqueEntityId) {
    const userEntity = new UserEntity(props, id);

    return userEntity;
  }
}
