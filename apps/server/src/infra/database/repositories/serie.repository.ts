import { ISerieRepository } from 'apps/server/src/domain/application/repositories/serie.repository';
import { SeriesEntity } from 'apps/server/src/domain/enterprise/entities/series.entity';
import { prisma } from 'packages/database/src/client';
import { singleton } from 'tsyringe';
import { SeriesMapper } from '../mapper/series.mapper';

@singleton()
export class SerieRepository implements ISerieRepository {
  async create(SeriesEntity: SeriesEntity): Promise<boolean> {
    try {
      const serieData = SeriesMapper.toDatabase(SeriesEntity);
      await prisma.series.create({ data: serieData });
      return true;
    } catch (error) {
      console.error('Error creating serie:', error);
      return false;
    }
  }

  async findById(id: string): Promise<SeriesEntity | null> {
    const serieData = await prisma.series.findUnique({ where: { id } });
    if (!serieData) return null;
    return SeriesMapper.toDomain(serieData);
  }

  async update(SeriesEntity: SeriesEntity): Promise<boolean> {
    try {
      const serieData = SeriesMapper.toDatabase(SeriesEntity);
      await prisma.series.update({
        where: { id: SeriesEntity.id.toString() },
        data: serieData,
      });
      return true;
    } catch (error) {
      console.error('Error updating serie:', error);
      return false;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.series.delete({ where: { id } });
      return true;
    } catch (error) {
      console.error('Error deleting serie:', error);
      return false;
    }
  }
}
