import { Entity } from 'apps/server/src/core/entities/entity';
import { UniqueEntityId } from 'apps/server/src/core/entities/unique-entity-id';

export interface StudentProps {
  name: string;
  birthDate: Date;
  classId: string;
  seriesId: string;
}

export class StudentEntity extends Entity<StudentProps> {
  get name() {
    return this.props.name;
  }

  get birthDate() {
    return this.props.birthDate;
  }

  get classId() {
    return this.props.classId;
  }

  get seriesId() {
    return this.props.seriesId;
  }

  static create(props: StudentProps, id?: UniqueEntityId): StudentEntity {
    const studentEntity = new StudentEntity(props, id);

    return studentEntity;
  }
}
