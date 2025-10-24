export class WrongCredentialsError extends Error {
  constructor(message?: string) {
    super(message || 'Credentials are not valid.');
  }
}
