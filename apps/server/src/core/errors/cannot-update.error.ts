export class CannotUpdateError extends Error {
  constructor(entityType: string) {
    super(`Cannot update ${entityType}`);
  }
}
