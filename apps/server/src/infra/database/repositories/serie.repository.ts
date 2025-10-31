import { ISerieRepository } from 'apps/server/src/domain/application/repositories/serie.repository';
import { SerieEntity } from 'apps/server/src/domain/enterprise/entities/serie.entity';
import { prisma } from 'packages/database/src/client';
import { singleton } from 'tsyringe';
import { SerieMapper } from '../mapper/serie.mapper';

@singleton()
export class SerieRepository implements ISerieRepository {
  async create(serieEntity: SerieEntity): Promise<boolean> {
    try {
      const serieData = SerieMapper.toDatabase(serieEntity);
      await prisma.series.create({ data: serieData });
      return true;
    } catch (error) {
      console.error('Error creating serie:', error);
      return false;
    }
  }

  async findById(id: string): Promise<SerieEntity | null> {
    const serieData = await prisma.series.findUnique({ where: { id } });
    if (!serieData) return null;
    return SerieMapper.toDomain(serieData);
  }

  async update(serieEntity: SerieEntity): Promise<boolean> {
    try {
      const serieData = SerieMapper.toDatabase(serieEntity);
      await prisma.series.update({
        where: { id: serieEntity.id.toString() },
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
