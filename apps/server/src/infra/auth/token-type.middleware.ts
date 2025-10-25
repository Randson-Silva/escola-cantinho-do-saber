import { NextFunction, Response } from 'express';
import { IRequestWithUser } from './auth.middleware';

export const requireTokenType = (expectedType: 'access' | 'refresh' | 'pass_reset') => {
  return (req: IRequestWithUser, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (user.type !== expectedType) {
      return res.status(403).json({
        message: `Token type '${user.type}' cannot be used in this route.`,
      });
    }

    next();
  };
};
