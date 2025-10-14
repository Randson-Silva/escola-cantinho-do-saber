export abstract class AuthVerifier {
  abstract verify<TPayload extends object>(token: string): Promise<TPayload>;
}
