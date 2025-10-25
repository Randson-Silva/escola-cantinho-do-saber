import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import 'dotenv/config';
import { singleton } from 'tsyringe';

type EncryptationOptions = { expiresIn?: string | number };
export type TokenGenerationParams<T> = {
  payloadSource: T;
  payloadGenerator: (data: T) => Record<string, unknown>;
  options?: EncryptationOptions;
};

const privateKey = Buffer.from(process.env.JWT_PRIVATE_KEY as string, 'base64');
const publicKey = Buffer.from(process.env.JWT_PUBLIC_KEY as string, 'base64');
const algorithm = (process.env.JWT_ALGORITHM || 'RS256') as jwt.Algorithm;

@singleton()
export class AuthService {
  async validatePassword(password: string, hash: string) {
    return bcrypt.compare(password, hash);
  }

  async hashPassword(password: string) {
    return bcrypt.hash(password, 10);
  }

  async generateToken<T>({
    payloadSource,
    payloadGenerator,
    options,
  }: TokenGenerationParams<T>): Promise<string> {
    const payload = payloadGenerator(payloadSource);
    const signOptions: jwt.SignOptions = {
      expiresIn: options?.expiresIn || '1d',
      algorithm: algorithm,
    };
    return jwt.sign(payload, privateKey, signOptions);
  }

  async decodeToken<T>(token: string): Promise<T> {
    return jwt.decode(token) as T;
  }

  async verifyToken<T extends object>(token: string): Promise<T> {
    return jwt.verify(token, publicKey, { algorithms: [algorithm] }) as T;
  }

  public async generateAuthorizationCode(userId: string, secondsToExp: number) {
    const issuedAt = Math.round(new Date().getTime() / 1000);
    const payload = {
      sub: userId,
      iat: issuedAt,
      exp: issuedAt + secondsToExp,
    };

    return jwt.sign(payload, privateKey, { algorithm });
  }

  public generateVerificationCode() {
    return crypto.randomInt(100000, 999999).toString();
  }
}

export default new AuthService();
