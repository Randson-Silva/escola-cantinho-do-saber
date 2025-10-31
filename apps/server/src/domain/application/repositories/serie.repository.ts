import { SerieEntity } from '../../enterprise/entities/serie.entity';

export abstract class ISerieRepository {
  abstract create(serieEntity: SerieEntity): Promise<boolean>;
  abstract findById(id: string): Promise<SerieEntity | null>;
  abstract update(serieEntity: SerieEntity): Promise<boolean>;
  abstract delete(id: string): Promise<boolean>;
}

export const SERIE_REPOSITORY_TOKEN = 'ISerieRepository';
