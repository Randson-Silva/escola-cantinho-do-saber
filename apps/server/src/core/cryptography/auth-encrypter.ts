export type EncryptationOptions = {
  expTime: string | number;
};

export abstract class AuthEncrypter {
  abstract encrypt(
    payload: Record<string, unknown>,
    options?: EncryptationOptions,
  ): Promise<string>;
}
