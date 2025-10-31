import { Either, fail, succeed } from 'apps/server/src/core/either';
import { CannotUpdateError } from 'apps/server/src/core/errors/cannot-update.error';
import { ResourceNotFoundError } from 'apps/server/src/core/errors/resource-not-found.error';
import { SerieEntity } from '../../../enterprise/entities/serie.entity';
import { ISerieRepository, SERIE_REPOSITORY_TOKEN } from '../../repositories/serie.repository';
import { UniqueEntityId } from 'apps/server/src/core/entities/unique-entity-id';
import { inject, singleton } from 'tsyringe';

type UpdateSerieUseCaseRequest = {
  serieId: string;
  name: string;
};

type UpdateSerieUseCaseResponse = Either<CannotUpdateError, { serieId: string }>;

@singleton()
export class UpdateSerieUseCase {
  constructor(
    @inject(SERIE_REPOSITORY_TOKEN)
    private readonly serieRepository: ISerieRepository,
  ) {}

  async execute({ serieId, name }: UpdateSerieUseCaseRequest): Promise<UpdateSerieUseCaseResponse> {
    try {
      const foundSerie = await this.serieRepository.findById(serieId);

      if (!foundSerie) return fail(new ResourceNotFoundError('Serie not found'));

      const serieEntity = SerieEntity.create({ name }, new UniqueEntityId(serieId));

      const canUpdateSerie = await this.serieRepository.update(serieEntity);

      if (!canUpdateSerie) return fail(new CannotUpdateError('Serie'));

      return succeed({ serieId: serieEntity.id.toString() });
    } catch (error) {
      return fail(new Error('Cannot update serie due to error' + error));
    }
  }
}
