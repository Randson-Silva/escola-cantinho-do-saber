export class CannotDeleteError extends Error {
  constructor(entityType: string) {
    super(`Cannot delete ${entityType}`);
  }
}
