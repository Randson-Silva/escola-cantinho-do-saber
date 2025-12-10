import { IStudentGuardianRepository } from 'apps/server/src/domain/application/repositories/student-guardian.repository';
import { StudentGuardianEntity } from 'apps/server/src/domain/enterprise/entities/student-guardian.entity';
import { prisma } from 'packages/database/src/client';
import { singleton } from 'tsyringe';
import { StudentGuardianMapper } from '../mapper/student-guardian.mapper';
import { StudentGuardianSchema } from '../schemas/student-guardian.schema';

@singleton()
export class StudentGuardianRepository implements IStudentGuardianRepository {
  async create(entity: StudentGuardianEntity): Promise<boolean> {
    try {
      const raw = StudentGuardianMapper.toDatabase(entity);

      await prisma.studentHasGuardian.create({
        data: {
          studentId: raw.studentId,
          guardianId: raw.guardianId,
          kinship: raw.kinship,
          createdAt: raw.createdAt,
          deletedAt: raw.deletedAt,
        },
      });
      return true;
    } catch (error) {
      console.error('Error creating student-guardian link:', error);
      return false;
    }
  }

  async update(entity: StudentGuardianEntity): Promise<boolean> {
    try {
      const raw = StudentGuardianMapper.toDatabase(entity);

      await prisma.studentHasGuardian.update({
        where: {
          studentId_guardianId: {
            studentId: raw.studentId,
            guardianId: raw.guardianId,
          },
        },
        data: {
          kinship: raw.kinship, // Atualiza o parentesco
          deletedAt: raw.deletedAt, // Caso precise reativar (soft delete reverso)
        },
      });
      return true;
    } catch (error) {
      console.error('Error updating student-guardian link:', error);
      return false;
    }
  }

  // Hard Delete
  // async delete(studentId: string, guardianId: string): Promise<boolean> {
  //   try {
  //     await prisma.studentHasGuardian.delete({
  //       where: {
  //         studentId_guardianId: { studentId, guardianId },
  //       },
  //     });
  //     return true;
  //   } catch (error) {
  //     console.error('Error deleting student-guardian link:', error);
  //     return false;
  //   }
  // }

  // Soft Delete
  async delete(studentId: string, guardianId: string): Promise<boolean> {
    try {
      await prisma.studentHasGuardian.update({
        where: {
          studentId_guardianId: { studentId, guardianId },
        },
        data: {
          deletedAt: new Date(),
        },
      });
      return true;
    } catch (error) {
      console.error('Error soft-deleting student-guardian link:', error);
      return false;
    }
  }

  async findUnique(studentId: string, guardianId: string): Promise<StudentGuardianEntity | null> {
    const link = await prisma.studentHasGuardian.findUnique({
      where: {
        studentId_guardianId: { studentId, guardianId },
      },
    });
    if (!link) return null;
    return StudentGuardianMapper.toDomain(link as StudentGuardianSchema);
  }

  async findByStudentId(studentId: string): Promise<StudentGuardianEntity[] | null> {
    const links = await prisma.studentHasGuardian.findMany({
      where: { studentId },
    });
    if (!links || links.length === 0) return null;
    return links.map((l) => StudentGuardianMapper.toDomain(l as StudentGuardianSchema));
  }

  async findByGuardianId(guardianId: string): Promise<StudentGuardianEntity[] | null> {
    const links = await prisma.studentHasGuardian.findMany({
      where: { guardianId },
    });
    if (!links || links.length === 0) return null;
    return links.map((l) => StudentGuardianMapper.toDomain(l as StudentGuardianSchema));
  }
}
