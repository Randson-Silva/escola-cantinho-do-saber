import { Either, fail, succeed } from 'apps/server/src/core/either';
import { CannotCreateError } from 'apps/server/src/core/errors/cannot-create.error';
import { inject, singleton } from 'tsyringe';
import { SERIES_REPOSITORY_TOKEN, ISerieRepository } from '../../repositories/serie.repository';
import { SeriesEntity } from '../../../enterprise/entities/series.entity';

type CreateSerieUseCaseRequest = {
  name: string;
  description?: string | null;
  classIds?: string[] | null;
  studentIds?: string[] | null;
};

type CreateSerieUseCaseResponse = Either<CannotCreateError, { serieId: string }>;

@singleton()
export class CreateSerieUseCase {
  constructor(
    @inject(SERIES_REPOSITORY_TOKEN)
    private readonly serieRepository: ISerieRepository,
  ) {}

  async execute({
    name,
    description = null,
    classIds = null,
    studentIds = null,
  }: CreateSerieUseCaseRequest): Promise<CreateSerieUseCaseResponse> {
    try {
      const serieEntity = SeriesEntity.create({
        name,
        teacherIds: [],
        classIds,
        studentIds,
      });

      const canCreateSerie = await this.serieRepository.create(serieEntity);

      if (!canCreateSerie) {
        return fail(new CannotCreateError('Serie'));
      }

      return succeed({ serieId: serieEntity.id.toString() });
    } catch (error) {
      return fail(new Error('Cannot create Serie due to error: ' + error));
    }
  }
}
