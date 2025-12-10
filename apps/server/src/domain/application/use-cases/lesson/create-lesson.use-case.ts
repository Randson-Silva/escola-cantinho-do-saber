import { Either, fail, succeed } from 'apps/server/src/core/either';
import { CannotCreateError } from 'apps/server/src/core/errors/cannot-create.error';
import { ResourceNotFoundError } from 'apps/server/src/core/errors/resource-not-found.error';
import { inject, singleton } from 'tsyringe';
import { LessonEntity } from '../../../enterprise/entities/lesson.entity';
import { CLASS_REPOSITORY_TOKEN, IClassRepository } from '../../repositories/class.repository';
import { ILessonRepository, LESSON_REPOSITORY_TOKEN } from '../../repositories/lesson.repository';
import { TimeUtils } from 'apps/server/src/core/utils/time-utils';

type CreateLessonUseCaseRequest = {
  classId: string;
  date: Date;
  startTime: string;
  durationStr: string; // (ex: "01:30")
};

type CreateLessonUseCaseResponse = Either<
  ResourceNotFoundError | CannotCreateError,
  { lessonId: string }
>;

@singleton()
export class CreateLessonUseCase {
  private readonly MAX_CAPACITY_PER_BLOCK = 4;

  constructor(
    @inject(LESSON_REPOSITORY_TOKEN)
    private readonly lessonRepository: ILessonRepository,
    @inject(CLASS_REPOSITORY_TOKEN)
    private readonly classRepository: IClassRepository,
  ) {}

  async execute({
    classId,
    date,
    startTime,
    durationStr,
  }: CreateLessonUseCaseRequest): Promise<CreateLessonUseCaseResponse> {
    try {
      // 1. Verifica se a Turma existe
      const classExists = await this.classRepository.findById(classId);
      if (!classExists) {
        return fail(new ResourceNotFoundError('Class'));
      }

      // 2. Calcular Horário de Término
      const startMinutes = TimeUtils.timeToMinutes(startTime);
      const durationMinutes = TimeUtils.timeToMinutes(durationStr);
      const endMinutes = startMinutes + durationMinutes;
      const endTime = TimeUtils.minutesToTime(endMinutes);

      // 3. Validar Horário de Funcionamento (13:00 - 17:30)
      const openTime = TimeUtils.timeToMinutes('13:00');
      const closeTime = TimeUtils.timeToMinutes('17:30');

      if (startMinutes < openTime || endMinutes > closeTime) {
        return fail(
          new CannotCreateError('Lesson time is outside operating hours (13:00 - 17:30)'),
        );
      }

      // 4. Buscar aulas existentes para verificar conflitos
      const existingLessons = await this.lessonRepository.findByClassAndDateWithAttendances(
        classId,
        date,
      );

      // 5. Gerar blocos e validar capacidade
      const requiredBlocks = TimeUtils.generateTimeBlocks(startTime, endTime);

      for (const block of requiredBlocks) {
        let currentCapacity = 0;

        for (const lesson of existingLessons) {
          const lessonStart = TimeUtils.timeToMinutes(lesson.startTime);
          const lessonEnd = TimeUtils.timeToMinutes(lesson.endTime);

          if (TimeUtils.hasOverlap(lessonStart, lessonEnd, block.start, block.end)) {
            currentCapacity += lesson.studentCount;
          }
        }

        if (currentCapacity >= this.MAX_CAPACITY_PER_BLOCK) {
          return fail(
            new CannotCreateError(
              `Capacity exceeded for time block ${block.label}. Max: ${this.MAX_CAPACITY_PER_BLOCK}`,
            ),
          );
        }
      }

      // 6. Criar Entidade e Persistir
      const lessonEntity = LessonEntity.create({
        classId,
        date,
        startTime,
        endTime,
        duration: durationStr,
      });

      const canCreate = await this.lessonRepository.create(lessonEntity);
      if (!canCreate) return fail(new CannotCreateError('Lesson'));

      return succeed({ lessonId: lessonEntity.id.toString() });
    } catch (error) {
      return fail(new Error('Cannot create lesson due to error: ' + error));
    }
  }
}
