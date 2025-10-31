import { IStudentGuardianRepository } from 'apps/server/src/domain/application/repositories/student-guardian.repository';
import { StudentGuardianEntity } from 'apps/server/src/domain/enterprise/entities/student-guardian.entity';
import { prisma } from 'packages/database/src/client';
import { singleton } from 'tsyringe';
import { StudentGuardianMapper } from '../mapper/student-guardian.mapper';

@singleton()
export class StudentGuardianRepository implements IStudentGuardianRepository {
  async create(entity: StudentGuardianEntity): Promise<boolean> {
    try {
      const data = StudentGuardianMapper.toDatabase(entity);
      await prisma.studentHasGuardian.create({ data });
      return true;
    } catch (error) {
      console.error('Error creating student-guardian link:', error);
      return false;
    }
  }

  async update(entity: StudentGuardianEntity): Promise<boolean> {
    try {
      const data = StudentGuardianMapper.toDatabase(entity);
      await prisma.studentHasGuardian.update({
        where: {
          studentId_guardianId: { // Sintaxe do Prisma para chave composta
            studentId: entity.studentId,
            guardianId: entity.guardianId,
          },
        },
        data: {
          kinship: data.kinship, // Só podemos atualizar o parentesco
        },
      });
      return true;
    } catch (error) {
      console.error('Error updating student-guardian link:', error);
      return false;
    }
  }

  async delete(studentId: string, guardianId: string): Promise<boolean> {
    try {
      await prisma.studentHasGuardian.delete({
        where: {
          studentId_guardianId: { studentId, guardianId },
        },
      });
      return true;
    } catch (error) {
      console.error('Error deleting student-guardian link:', error);
      return false;
    }
  }

  async findUnique(
    studentId: string,
    guardianId: string,
  ): Promise<StudentGuardianEntity | null> {
    const link = await prisma.studentHasGuardian.findUnique({
      where: {
        studentId_guardianId: { studentId, guardianId },
      },
    });
    if (!link) return null;
    return StudentGuardianMapper.toDomain(link);
  }

  async findByStudentId(
    studentId: string,
  ): Promise<StudentGuardianEntity[] | null> {
    const links = await prisma.studentHasGuardian.findMany({
      where: { studentId },
    });
    if (!links || links.length === 0) return null;
    return links.map(StudentGuardianMapper.toDomain);
  }

  async findByGuardianId(
    guardianId: string,
  ): Promise<StudentGuardianEntity[] | null> {
    const links = await prisma.studentHasGuardian.findMany({
      where: { guardianId },
    });
    if (!links || links.length === 0) return null;
    return links.map(StudentGuardianMapper.toDomain);
  }
}
