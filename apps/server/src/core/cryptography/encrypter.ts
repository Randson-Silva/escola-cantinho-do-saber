export abstract class Encrypter {
  abstract encrypt(payload: Record<string, unknown>): Promise<string>;
  abstract encryptSingle(payload: string): Promise<string>;
}
