import { Series } from '@prisma/client';

export type SeriesSchema = Series & {
  classIds?: string[];
  studentIds?: string[];
  teacherIds?: string[];
};
