import { UserEntity } from 'apps/server/src/core/entities/user';

export abstract class IUserRepository {
  abstract create(userEntity: UserEntity): Promise<boolean>;
  abstract findAllUsers(): Promise<UserEntity[]>;
  abstract findById(id: string): Promise<UserEntity | null>;
  abstract findByEmail(email: string): Promise<UserEntity | null>;
  abstract update(userEntity: UserEntity): Promise<boolean>;
  abstract delete(id: string): Promise<boolean>;
}

export const USERS_REPOSITORY_TOKEN = 'IUserRepository';
