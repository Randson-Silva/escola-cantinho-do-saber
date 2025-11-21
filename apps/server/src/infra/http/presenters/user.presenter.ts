import { UserEntity } from 'apps/server/src/core/entities/user';

export class UserPresenter {
  static toHTTP(user: UserEntity) {
    const profile = {
      accessLevel: user.profile.accessLevel,
    };

    return {
      name: user.name,
      email: user.email,
      profile,
    };
  }
}
