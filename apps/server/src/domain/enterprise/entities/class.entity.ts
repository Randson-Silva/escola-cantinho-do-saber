import { Entity } from 'apps/server/src/core/entities/entity';
import { UniqueEntityId } from 'apps/server/src/core/entities/unique-entity-id';

export interface ClassProps {
  name: string;

  teacherId: string;

  // ! series ClassHasSeries[]
  // ? series: [];

  // ! lessons Lesson[]
  // ? lessons: [];

  // ! students Student[]
  // ? students: [];
}

export class ClassEntity extends Entity<ClassProps> {
  get name() {
    return this.props.name;
  }


  get teacherId() {
    return this.props.teacherId;
  }

  // get series() {
  //   return this.props.series;
  // }

  // get lessons() {
  //   return this.props.lessons;
  // }

  // get students() {
  //   return this.props.students;
  // }

  static create(props: ClassProps, id?: UniqueEntityId) {
    const classEntity = new ClassEntity(props, id);

    return classEntity;
  }
}
