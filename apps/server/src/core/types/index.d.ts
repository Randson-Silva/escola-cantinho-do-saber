import { JwtPayload } from '../../infra/auth/passport';

export {};

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
