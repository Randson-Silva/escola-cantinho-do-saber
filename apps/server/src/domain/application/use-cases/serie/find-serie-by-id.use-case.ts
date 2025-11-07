import { ISerieRepository, SERIES_REPOSITORY_TOKEN } from '../../repositories/serie.repository';
import { Either, fail, succeed } from 'apps/server/src/core/either';
import { ResourceNotFoundError } from 'apps/server/src/core/errors/resource-not-found.error';
import { SeriesEntity } from '../../../enterprise/entities/series.entity';
import { inject, singleton } from 'tsyringe';

type FindSerieByIdUseCaseRequest = {
  serieId: string;
};

type FindSerieByIdUseCaseResponse = Either<ResourceNotFoundError, { SeriesEntity: SeriesEntity }>;

@singleton()
export class FindSerieByIdUseCase {
  constructor(
    @inject(SERIES_REPOSITORY_TOKEN)
    private readonly serieRepository: ISerieRepository,
  ) {}

  async execute({ serieId }: FindSerieByIdUseCaseRequest): Promise<FindSerieByIdUseCaseResponse> {
    try {
      const foundSerie = await this.serieRepository.findById(serieId);

      if (!foundSerie) return fail(new ResourceNotFoundError('Serie not found'));

      return succeed({ SeriesEntity: foundSerie });
    } catch (error) {
      return fail(new Error('Serie was not found due to error: ' + error));
    }
  }
}
