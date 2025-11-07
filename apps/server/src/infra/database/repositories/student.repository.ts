import { IStudentRepository } from 'apps/server/src/domain/application/repositories/student.repository';
import { StudentEntity } from 'apps/server/src/domain/enterprise/entities/student.entity';
import { prisma } from 'packages/database/src/client';
import { singleton } from 'tsyringe';
import { StudentMapper } from '../mapper/student.mapper';

@singleton()
export class StudentRepository implements IStudentRepository {
  async create(studentEntity: StudentEntity): Promise<boolean> {
    try {
      const studentData = StudentMapper.toDatabase(studentEntity);

      await prisma.student.create({
        data: {
          id: studentData.id,
          name: studentData.name,
          birthDate: studentData.birthDate,

          class: { connect: { id: studentData.classId } },

          series: studentData.seriesId ? { connect: { id: studentData.seriesId } } : undefined,

          addresses: studentEntity.addresses?.length
            ? {
                connect: studentEntity.addresses.map((address) => ({
                  id: address.id.toString(),
                })),
              }
            : undefined,

          guardians: studentEntity.guardians?.length
            ? {
                create: studentEntity.guardians.map((guardianId) => ({
                  guardian: { connect: { id: guardianId } },
                })),
              }
            : undefined,
        },
      });

      return true;
    } catch (error) {
      console.error('Error creating student:', error);
      return false;
    }
  }

  async findById(id: string): Promise<StudentEntity | null> {
    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        addresses: true,
        guardians: { include: { guardian: true } },
        enrollments: { include: { contract: true, payments: true } },
        attendances: { include: { linkedLessons: { include: { lesson: true } } } },
      },
    });

    if (!student) return null;
    return StudentMapper.toDomain(student);
  }

  async update(studentEntity: StudentEntity): Promise<boolean> {
    try {
      const studentData = StudentMapper.toDatabase(studentEntity);

      await prisma.student.update({
        where: { id: studentEntity.id.toString() },
        data: {
          name: studentData.name,
          birthDate: studentData.birthDate,

          class: { connect: { id: studentData.classId } },

          series: studentData.seriesId
            ? { connect: { id: studentData.seriesId } }
            : { disconnect: true },

          addresses: studentEntity.addresses?.length
            ? {
                set: studentEntity.addresses.map((address) => ({
                  id: address.id.toString(),
                })),
              }
            : undefined,

          guardians: studentEntity.guardians?.length
            ? {
                set: studentEntity.guardians.map((guardianId) => ({
                  studentId_guardianId: {
                    studentId: studentEntity.id.toString(),
                    guardianId,
                  },
                })),
              }
            : undefined,
        },
      });

      return true;
    } catch (error) {
      console.error('Error updating student:', error);
      return false;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.student.delete({ where: { id } });
      return true;
    } catch (error) {
      console.error('Error deleting student:', error);
      return false;
    }
  }

  async findAllByClass(classId: string): Promise<StudentEntity[]> {
    const students = await prisma.student.findMany({ where: { classId } });
    return students.map(StudentMapper.toDomain);
  }

  async findAllBySeries(seriesId: string): Promise<StudentEntity[]> {
    const students = await prisma.student.findMany({ where: { seriesId } });
    return students.map(StudentMapper.toDomain);
  }

  async findAllByGuardian(guardianId: string): Promise<StudentEntity[]> {
    const relations = await prisma.studentHasGuardian.findMany({
      where: { guardianId },
      include: { student: true },
    });
    return relations.map((r) => StudentMapper.toDomain(r.student));
  }

  async getAddresses(studentId: string) {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { addresses: true },
    });
    return student?.addresses ?? [];
  }

  async getEnrollments(studentId: string) {
    return prisma.enrollment.findMany({
      where: { studentId },
      include: { contract: true, payments: true },
    });
  }

  async getAttendances(studentId: string) {
    return prisma.attendance.findMany({
      where: { studentId },
      include: { linkedLessons: { include: { lesson: true } } },
    });
  }
}
