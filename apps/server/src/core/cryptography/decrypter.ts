export abstract class Decrypter {
  abstract decrypt(payload: string): Promise<string>;
  abstract decryptSingle(payload: string): Promise<string>;
}
