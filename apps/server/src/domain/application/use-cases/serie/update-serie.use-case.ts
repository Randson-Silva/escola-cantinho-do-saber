import { Either, fail, succeed } from 'apps/server/src/core/either';
import { CannotUpdateError } from 'apps/server/src/core/errors/cannot-update.error';
import { ResourceNotFoundError } from 'apps/server/src/core/errors/resource-not-found.error';
import { UniqueEntityId } from 'apps/server/src/core/entities/unique-entity-id';
import { inject, singleton } from 'tsyringe';
import { SeriesEntity } from '../../../enterprise/entities/series.entity';
import { ISerieRepository, SERIES_REPOSITORY_TOKEN } from '../../repositories/serie.repository';

type UpdateSerieUseCaseRequest = {
  serieId: string;
  name: string;
  classIds?: string[] | null;
  studentIds?: string[] | null;
  teacherIds?: string[] | null;
};

type UpdateSerieUseCaseResponse = Either<CannotUpdateError, { serieId: string }>;

@singleton()
export class UpdateSerieUseCase {
  constructor(
    @inject(SERIES_REPOSITORY_TOKEN)
    private readonly serieRepository: ISerieRepository,
  ) {}

  async execute({
    serieId,
    name,
    classIds = null,
    studentIds = null,
    teacherIds = null,
  }: UpdateSerieUseCaseRequest): Promise<UpdateSerieUseCaseResponse> {
    try {
      const foundSerie = await this.serieRepository.findById(serieId);

      if (!foundSerie) {
        return fail(new ResourceNotFoundError('Serie not found'));
      }

      const updatedSerie = SeriesEntity.create(
        {
          name,
          classIds,
          studentIds,
          teacherIds,
        },
        new UniqueEntityId(serieId),
      );

      const canUpdateSerie = await this.serieRepository.update(updatedSerie);

      if (!canUpdateSerie) {
        return fail(new CannotUpdateError('Serie'));
      }

      return succeed({ serieId: updatedSerie.id.toString() });
    } catch (error) {
      return fail(new Error('Cannot update serie due to error: ' + error));
    }
  }
}
