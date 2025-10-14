export type CreateSystemAccessJwtPayload = {
  sub: string;
  context: 'system';
};

export type SystemAccessJwtPayload = CreateSystemAccessJwtPayload & {
  iat: number;
  exp: number;
};

export type CreateSystemRefreshJwtPayload = {
  sub: string;
};

export type SystemRefreshJwtPayload = CreateSystemRefreshJwtPayload & {
  iat: number;
  exp: number;
};
