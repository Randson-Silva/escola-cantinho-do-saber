import { ClassEntity } from '../../enterprise/entities/class.entity';

export abstract class IClassRepository {
  abstract create(classEntity: ClassEntity): Promise<boolean>;
  abstract findById(id: string): Promise<ClassEntity | null>;
  abstract update(classEntity: ClassEntity): Promise<boolean>;
  // hardDelete removido
  abstract delete(id: string): Promise<boolean>; // delete agora é o padrão (soft)
}

export const CLASS_REPOSITORY_TOKEN = 'IClassRepository';
