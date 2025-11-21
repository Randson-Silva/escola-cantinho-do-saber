import { Entity } from 'apps/server/src/core/entities/entity';
import { UniqueEntityId } from 'apps/server/src/core/entities/unique-entity-id';

export interface SeriesProps {
  name: string;
  classIds: string[] | null;
  studentIds: string[] | null;
  teacherIds: string[] | null;
  // ! teachers
}

export class SeriesEntity extends Entity<SeriesProps> {
  get name() {
    return this.props.name;
  }

  get classIds() {
    return this.props.classIds;
  }

  get studentIds() {
    return this.props.studentIds;
  }

  get teacherIds() {
    return this.props.teacherIds;
  }

  static create(props: SeriesProps, id?: UniqueEntityId) {
    const seriesEntity = new SeriesEntity(props, id);

    return seriesEntity;
  }
}
