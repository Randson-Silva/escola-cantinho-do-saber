import { Class, Lesson, Student, ClassHasSeries } from '@prisma/client';

export type ClassSchema = Class & {
  lessons?: Lesson[];
  students?: Student[];
  series?: ClassHasSeries[];
};
