import { Entity } from 'apps/server/src/core/entities/entity';
import { UniqueEntityId } from 'apps/server/src/core/entities/unique-entity-id';
import { AccessLevel } from 'apps/server/src/core/types/role';

export interface ProfileProps {
  accessLevel: AccessLevel;
}
export class ProfileEntity extends Entity<ProfileProps> {
  get accessLevel() {
    return this.props.accessLevel;
  }

  static create(props: ProfileProps, id?: UniqueEntityId): ProfileEntity {
    const profileEntity = new ProfileEntity(props, id);
    return profileEntity;
  }
}
