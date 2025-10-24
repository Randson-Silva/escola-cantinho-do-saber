import { AccessLevel } from './role';

export type CreateAccessJwtPayload = {
  sub: string;
  accessLevel: AccessLevel;
};

export type AccessJwtPayload = CreateAccessJwtPayload & {
  iat: number;
  exp: number;
};

export type CreateRefreshJwtPayload = {
  sub: string;
  accessLevel: AccessLevel;
};

export type RefreshJwtPayload = CreateRefreshJwtPayload & {
  iat: number;
  exp: number;
};
