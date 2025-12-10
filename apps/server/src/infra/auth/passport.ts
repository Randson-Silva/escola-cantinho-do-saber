import { Strategy as JwtStrategy, ExtractJwt, StrategyOptions } from 'passport-jwt';
import { PassportStatic } from 'passport';
import { z } from 'zod';
import 'dotenv/config';

const tokenPayloadSchema = z.object({
  sub: z.ulid(),
  code: z.string().optional(),
  accessLevel: z.enum(['ADMIN', 'COMUM', 'PROFESSOR']),
  type: z.enum(['access', 'refresh', 'pass_reset']),
});

export type JwtPayload = z.infer<typeof tokenPayloadSchema>;

const publicKey = Buffer.from(process.env.JWT_PUBLIC_KEY as string, 'base64');

const options: StrategyOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  ignoreExpiration: false,
  secretOrKey: publicKey,
  algorithms: ['RS256'],
};

export const configurePassport = (passport: PassportStatic) => {
  passport.use(
    new JwtStrategy(options, async (payload, done) => {
      try {
        const validatedPayload = tokenPayloadSchema.parse(payload);
        return done(null, validatedPayload);
      } catch (error) {
        return done(error, false);
      }
    }),
  );
};
