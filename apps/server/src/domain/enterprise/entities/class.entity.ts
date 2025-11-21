import { Entity } from 'apps/server/src/core/entities/entity';
import { UniqueEntityId } from 'apps/server/src/core/entities/unique-entity-id';

export interface ClassProps {
  name: string;
  teacherId: string;
  seriesIds: string[] | null;
  studentIds: string[] | null;
  lessonIds: string[] | null;
}

export class ClassEntity extends Entity<ClassProps> {
  get name() {
    return this.props.name;
  }

  get teacherId() {
    return this.props.teacherId;
  }

  get seriesIds() {
    return this.props.seriesIds;
  }

  get studentIds() {
    return this.props.studentIds;
  }

  get lessonIds() {
    return this.props.lessonIds;
  }

  static create(props: ClassProps, id?: UniqueEntityId) {
    return new ClassEntity(props, id);
  }
}
