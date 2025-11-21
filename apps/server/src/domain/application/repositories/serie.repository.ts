import { SeriesEntity } from '../../enterprise/entities/series.entity';

export abstract class ISerieRepository {
  abstract create(SeriesEntity: SeriesEntity): Promise<boolean>;
  abstract findById(id: string): Promise<SeriesEntity | null>;
  abstract update(SeriesEntity: SeriesEntity): Promise<boolean>;
  abstract delete(id: string): Promise<boolean>;
}

export const SERIES_REPOSITORY_TOKEN = 'ISeriesRepository';
