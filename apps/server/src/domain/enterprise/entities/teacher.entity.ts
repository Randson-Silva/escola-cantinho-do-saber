import { Entity } from 'apps/server/src/core/entities/entity';
import { UniqueEntityId } from 'apps/server/src/core/entities/unique-entity-id';
import { Optional } from 'apps/server/src/core/types/optional';
import { SchoolGrade } from 'apps/server/src/core/types/school-enums';

export interface TeacherProps {
  name: string;
  taxId: string;
  phone: string;
  email: string;
  pixKey: string;
  startDate: Date;
  status: string;
  expertise?: string | null;

  // Campo que substitui a antiga tabela pivô
  qualifiedGrades: SchoolGrade[];

  createdAt: Date;
  deletedAt: Date | null;
}

export class TeacherEntity extends Entity<TeacherProps> {
  get name() {
    return this.props.name;
  }

  get taxId() {
    return this.props.taxId;
  }

  get phone() {
    return this.props.phone;
  }

  get email() {
    return this.props.email;
  }

  get pixKey() {
    return this.props.pixKey;
  }

  get startDate() {
    return this.props.startDate;
  }

  get status() {
    return this.props.status;
  }

  get expertise() {
    return this.props.expertise;
  }

  get qualifiedGrades() {
    return this.props.qualifiedGrades;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get deletedAt() {
    return this.props.deletedAt;
  }

  public getNextPaymentDate(): Date {
    const today = new Date();
    const startDay = this.props.startDate.getDate();
    const nextPayment = new Date(today.getFullYear(), today.getMonth(), startDay);

    if (nextPayment < today) {
      nextPayment.setMonth(nextPayment.getMonth() + 1);
    }
    return nextPayment;
  }

  static create(
    props: Optional<TeacherProps, 'status' | 'createdAt' | 'deletedAt' | 'qualifiedGrades'>,
    id?: UniqueEntityId,
  ): TeacherEntity {
    const teacher = new TeacherEntity(
      {
        ...props,
        status: props.status ?? 'ACTIVE',
        qualifiedGrades: props.qualifiedGrades ?? [],
        createdAt: props.createdAt ?? new Date(),
        deletedAt: props.deletedAt ?? null,
      },
      id,
    );
    return teacher;
  }
}
