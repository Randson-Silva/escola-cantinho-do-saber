import { SeriesEntity } from 'apps/server/src/domain/enterprise/entities/series.entity';

export class SeriePresenter {
  static toHTTP(SeriesEntity: SeriesEntity) {
    return {
      name: SeriesEntity.name,
    };
  }
}
