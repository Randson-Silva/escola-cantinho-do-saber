import { User, Profile } from '@prisma/client';

export type UserSchema = User & {
  profile?: Profile;
};
