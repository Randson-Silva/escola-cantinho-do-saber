import { Entity } from 'apps/server/src/core/entities/entity';
import { UniqueEntityId } from 'apps/server/src/core/entities/unique-entity-id';

export interface SerieProps {
  name: string;

  // ? check with future implementations
  // ! classes ClassHasSeries[];
  // ! students StudentEntity[];
  // ! teachers TeacherQualified[];
}

export class SerieEntity extends Entity<SerieProps> {
  get name() {
    return this.props.name;
  }

  static create(props: SerieProps, id?: UniqueEntityId) {
    const serieEntity = new SerieEntity(props, id);

    return serieEntity;
  }
}
