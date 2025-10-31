import { UserEntity } from 'apps/server/src/core/entities/user';

export class UserPresenter {
  static toHTTP(user: UserEntity) {
    return {
      name: user.name,
      email: user.email,
      profileId: user.profileId,
    };
  }
}
