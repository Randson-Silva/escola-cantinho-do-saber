import { SerieEntity } from 'apps/server/src/domain/enterprise/entities/serie.entity';

export class SeriePresenter {
  static toHTTP(serieEntity: SerieEntity) {
    return {
      name: serieEntity.name,
    };
  }
}
