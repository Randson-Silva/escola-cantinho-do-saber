import { Class, Lesson, Student } from '@prisma/client';

export type ClassSchema = Class & {
  lessons?: Lesson[];
  students?: Student[];
};
