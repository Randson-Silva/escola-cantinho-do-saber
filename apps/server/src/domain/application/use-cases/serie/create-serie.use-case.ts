import { Either, fail, succeed } from 'apps/server/src/core/either';
import { CannotCreateError } from 'apps/server/src/core/errors/cannot-create.error';
import { inject, singleton } from 'tsyringe';
import { SerieEntity } from '../../../enterprise/entities/serie.entity';
import { SERIE_REPOSITORY_TOKEN, ISerieRepository } from '../../repositories/serie.repository';

type CreateSerieUseCaseRequest = {
  name: string;
};

type CreateSerieUseCaseResponse = Either<CannotCreateError, { serieId: string }>;

@singleton()
export class CreateSerieUseCase {
  constructor(
    @inject(SERIE_REPOSITORY_TOKEN)
    private readonly serieRepository: ISerieRepository,
  ) {}

  async execute({ name }: CreateSerieUseCaseRequest): Promise<CreateSerieUseCaseResponse> {
    try {
      const serieEntity = SerieEntity.create({
        name,
      });

      const canCreateSerie = await this.serieRepository.create(serieEntity);

      if (!canCreateSerie) return fail(new CannotCreateError('Serie'));

      return succeed({ serieId: serieEntity.id.toString() });
    } catch (error) {
      return fail(new Error('Cannot create Serie due to error' + error));
    }
  }
}
