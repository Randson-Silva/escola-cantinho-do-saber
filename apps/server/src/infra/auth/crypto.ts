import { createCipheriv, createDecipheriv } from 'crypto';
import 'dotenv/config';

export class Crypto {
  async encrypt(payload: Record<string, unknown>) {
    const algorithm = process.env.ENCRYPTION_ALGORITHM as string;
    const secretKey = process.env.ENCRYPT_SECRET_KEY as string;
    const encryptedIV = process.env.ENCRYPT_IV as string;

    const key = Buffer.from(secretKey, 'hex');
    const iv = Buffer.from(encryptedIV, 'hex');

    const cipher = createCipheriv(algorithm, key, iv);

    return Buffer.from(
      cipher.update(JSON.stringify(payload), 'utf8', 'hex') + cipher.final('hex'),
    ).toString('base64');
  }

  async encryptSingle(str: string) {
    const algorithm = process.env.ENCRYPTION_ALGORITHM as string;
    const secretKey = process.env.ENCRYPT_SECRET_KEY as string;
    const encryptedIV = process.env.ENCRYPT_IV as string;

    const key = Buffer.from(secretKey, 'hex');
    const iv = Buffer.from(encryptedIV, 'hex');

    const cipher = createCipheriv(algorithm, key, iv);

    return Buffer.from(cipher.update(str, 'utf8', 'hex') + cipher.final('hex')).toString('base64');
  }

  async decrypt(payload: string) {
    const secretKey = process.env.ENCRYPT_SECRET_KEY as string;
    const encryptedIV = process.env.ENCRYPT_IV as string;

    const key = Buffer.from(secretKey, 'hex');
    const iv = Buffer.from(encryptedIV, 'hex');

    const buff = Buffer.from(payload, 'base64');

    const decipher = createDecipheriv('aes-256-ctr', key, iv);

    return decipher.update(buff.toString('utf8'), 'hex', 'utf8') + decipher.final();
  }

  async decryptSingle(payload: string) {
    const secretKey = process.env.ENCRYPT_SECRET_KEY as string;
    const encryptedIV = process.env.ENCRYPT_IV as string;

    const key = Buffer.from(secretKey, 'hex');
    const iv = Buffer.from(encryptedIV, 'hex');

    const buff = Buffer.from(payload, 'base64');

    const decipher = createDecipheriv('aes-256-ctr', key, iv);

    return decipher.update(buff.toString('utf8'), 'hex', 'utf8') + decipher.final();
  }
}

export default new Crypto();
