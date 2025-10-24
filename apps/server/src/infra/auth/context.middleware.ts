import { Request, Response, NextFunction } from 'express';
import { JwtPayload } from './passport';

export type UserContext = { userId: string; code?: number };

export const withUserContext = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  const { sub: userId, code } = req.user as JwtPayload;

  req.userContext = { userId, code };
  next();
};
