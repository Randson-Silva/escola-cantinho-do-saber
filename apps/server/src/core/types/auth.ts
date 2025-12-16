import { AccessLevel } from './role';
import { TokenType } from './token';

export type CreateAccessJwtPayload = {
  sub: string;
  name: string;
  email: string;
  accessLevel: AccessLevel;
  type: TokenType;
};

export type AccessJwtPayload = CreateAccessJwtPayload & {
  iat: number;
  exp: number;
};

export type CreateRefreshJwtPayload = {
  sub: string;
  accessLevel: AccessLevel;
  type: TokenType;
};

export type RefreshJwtPayload = CreateRefreshJwtPayload & {
  iat: number;
  exp: number;
};

export type CreateAuthJwtPayload = {
  sub: string;
  accessLevel: AccessLevel;
  code: string;
  type: TokenType;
};

export type AuthJwtPayload = CreateAuthJwtPayload & {
  iat: number;
  exp: number;
};
