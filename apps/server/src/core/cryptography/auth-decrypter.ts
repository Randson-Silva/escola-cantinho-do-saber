export abstract class AuthDecrypter {
  abstract decrypt<TPayload>(token: string): Promise<TPayload>;
}
