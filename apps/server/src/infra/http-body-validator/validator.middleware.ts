import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

export const validateBody = (schema: z.ZodObject<any, any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsedBody = schema.parse(req.body);
      req.body = parsedBody;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          statusCode: 400,
          message: 'Validation failed',
          errors: z.treeifyError(error),
        });
      }

      return res.status(500).json({
        statusCode: 500,
        message: 'Internal Server Error in validation',
      });
    }
  };
};
