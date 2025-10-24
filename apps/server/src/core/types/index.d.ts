import { JwtPayload } from '../../infra/auth/passport';
import { UserContext } from '../../infra/auth/context.middleware';

export {};

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
      userContext?: UserContext;
    }
  }
}
