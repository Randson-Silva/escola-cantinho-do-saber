import { Either, fail, succeed } from 'apps/server/src/core/either';
import { ResourceNotFoundError } from 'apps/server/src/core/errors/resource-not-found.error';
import { CannotDeleteError } from 'apps/server/src/core/errors/cannot-delete.error';
import { ISerieRepository, SERIE_REPOSITORY_TOKEN } from '../../repositories/serie.repository';
import { inject, singleton } from 'tsyringe';

type DeleteSerieUseCaseRequest = {
  serieId: string;
};

type DeleteSerieUseCaseResponse = Either<ResourceNotFoundError | CannotDeleteError, null>;

@singleton()
export class DeleteSerieUseCase {
  constructor(
    @inject(SERIE_REPOSITORY_TOKEN)
    private readonly serieRepository: ISerieRepository,
  ) {}

  async execute({ serieId }: DeleteSerieUseCaseRequest): Promise<DeleteSerieUseCaseResponse> {
    try {
      const foundSerie = await this.serieRepository.findById(serieId);

      if (!foundSerie) return fail(new ResourceNotFoundError('Serie not found'));

      const serieWasDeleted = await this.serieRepository.delete(serieId);

      if (!serieWasDeleted) return fail(new CannotDeleteError('Serie'));

      return succeed(null);
    } catch (err) {
      return fail(new Error('Could not delete serie due to error: ' + err));
    }
  }
}
