export class CannotCreateError extends Error {
  constructor(entityType: string) {
    super(`Cannot create ${entityType}`);
  }
}
