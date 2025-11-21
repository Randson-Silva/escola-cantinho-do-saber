import { Entity } from 'apps/server/src/core/entities/entity';
import { UniqueEntityId } from 'apps/server/src/core/entities/unique-entity-id';
import { AddressEntity } from './address.entity';

export interface StudentProps {
  name: string;
  birthDate: Date;
  classId: string;
  seriesId: string | null;
  addresses: AddressEntity[] | null;
  guardians: string[] | null;
  enrollmentIds: string[] | null;
  attendanceIds: string[] | null;
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

  get addresses() {
    return this.props.addresses;
  }

  get guardians() {
    return this.props.guardians;
  }

  get enrollmentIds() {
    return this.props.enrollmentIds;
  }

  get attendanceIds() {
    return this.props.attendanceIds;
  }

  static create(props: StudentProps, id?: UniqueEntityId): StudentEntity {
    return new StudentEntity(props, id);
  }
}
