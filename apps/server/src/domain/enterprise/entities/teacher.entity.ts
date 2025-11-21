import { Entity } from 'apps/server/src/core/entities/entity';
import { UniqueEntityId } from 'apps/server/src/core/entities/unique-entity-id';

export interface TeacherProps {
  name: string;
  taxId: string;
  phone: string;
  email: string;
  pixKey: string;
  startDate: Date;
  status: string;
  expertise?: string | null;
}

export class TeacherEntity extends Entity<TeacherProps> {
  get name() { return this.props.name; }
  get taxId() { return this.props.taxId; }
  get phone() { return this.props.phone; }
  get email() { return this.props.email; }
  get pixKey() { return this.props.pixKey; }
  get startDate() { return this.props.startDate; }
  get status() { return this.props.status; }
  get expertise() { return this.props.expertise; }

  // Setters
  set name(value: string) { this.props.name = value; }
  set phone(value: string) { this.props.phone = value; }
  set email(value: string) { this.props.email = value; }
  set pixKey(value: string) { this.props.pixKey = value; }
  set startDate(value: Date) { this.props.startDate = value; }
  set status(value: string) { this.props.status = value; }
  set expertise(value: string | null | undefined) { this.props.expertise = value; }

  static create(
    props: Omit<TeacherProps, 'status'> & { status?: string },
    id?: UniqueEntityId,
  ): TeacherEntity {
    const teacher = new TeacherEntity(
      {
        ...props,
        status: props.status ?? 'ACTIVE',
      },
      id,
    );
    return teacher;
  }
}
