export class NotAllowedError extends Error {
  constructor(message?: string) {
    super(message || 'Method not allowed');
  }
}
