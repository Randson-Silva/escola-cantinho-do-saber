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
      await prisma.student.create({ data: studentData });
      return true;
    } catch (error) {
      console.error('Error creating student:', error);
      return false;
    }
  }

  async findById(id: string): Promise<StudentEntity | null> {
    const student = await prisma.student.findUnique({ where: { id } });
    if (!student) return null;
    return StudentMapper.toDomain(student);
  }

  async update(studentEntity: StudentEntity): Promise<boolean> {
    try {
      const studentData = StudentMapper.toDatabase(studentEntity);
      await prisma.student.update({
        where: { id: studentEntity.id.toString() },
        data: studentData,
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
}
