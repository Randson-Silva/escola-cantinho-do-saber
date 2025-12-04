import { Request, NextFunction, Response } from 'express';
import * as passport from 'passport';
import { AccessLevel } from '../../core/types/role';
import { JwtPayload } from './passport';

export interface IRequestWithUser extends Request {
  user?: JwtPayload;
}

export const checkJwt = passport.authenticate('jwt', { session: false });

export const requireRole = (requiredRole: AccessLevel) => {
  return (req: IRequestWithUser, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    if (user.accessLevel !== requiredRole) {
      return res.status(403).json({
        message: `Forbidden. User role is '${user.accessLevel}', but '${requiredRole}' is required.`,
      });
    }

    next();
  };
};

export const requireAnyRole = (requiredRoles: AccessLevel[]) => {
  return (req: IRequestWithUser, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const userRole = (user.accessLevel ?? '').toString().toUpperCase();
    const normalizedRequired = requiredRoles.map((r) => r.toString().toUpperCase());

    if (!normalizedRequired.includes(userRole)) {
      return res.status(403).json({
        message: `Forbidden. User role is '${user.accessLevel}', one of '${requiredRoles.join(',')}' is required.`,
      });
    }

    next();
  };
};
