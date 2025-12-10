import { UserEntity } from 'apps/server/src/core/entities/user';

export class UserPresenter {
  static toHTTP(user: UserEntity) {
    return {
      id: user.id.toString(),
      name: user.name,
      email: user.email,
      profile: {
        id: user.profile.id.toString(),
        accessLevel: user.profile.accessLevel,
      },
      createdAt: user.createdAt,
    };
  }
}
