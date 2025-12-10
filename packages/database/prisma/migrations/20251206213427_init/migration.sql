/*
  Warnings:

  - You are about to drop the column `presenceStatus` on the `Attendance` table. All the data in the column will be lost.
  - You are about to drop the column `document` on the `Contract` table. All the data in the column will be lost.
  - You are about to drop the column `lessonDate` on the `Lesson` table. All the data in the column will be lost.
  - You are about to drop the column `paymentStatus` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `seriesId` on the `Student` table. All the data in the column will be lost.
  - The `kinship` column on the `StudentHasGuardian` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `AttendanceLinkedToLesson` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ClassHasSeries` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Series` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TeacherQualified` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[studentId,lessonId]` on the table `Attendance` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `Teacher` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `lessonId` to the `Attendance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `Attendance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shift` to the `Class` table without a default value. This is not possible if the table is not empty.
  - Added the required column `date` to the `Lesson` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `currentGrade` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `Teacher` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `Teacher` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SchoolGrade" AS ENUM ('PRIMEIRO_ANO', 'SEGUNDO_ANO', 'TERCEIRO_ANO', 'QUARTO_ANO', 'QUINTO_ANO', 'SEXTO_ANO', 'SETIMO_ANO', 'OITAVO_ANO', 'NONO_ANO');

-- CreateEnum
CREATE TYPE "Shift" AS ENUM ('MATUTINO', 'VESPERTINO', 'NOTURNO', 'INTEGRAL');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENTE', 'AUSENTE', 'JUSTIFICADO');

-- CreateEnum
CREATE TYPE "Kinship" AS ENUM ('PAI_MAE', 'AVOS', 'TIOS', 'IRMAOS', 'OUTRO');

-- AlterEnum
ALTER TYPE "AccessLevel" ADD VALUE 'PROFESSOR';

-- DropForeignKey
ALTER TABLE "public"."AttendanceLinkedToLesson" DROP CONSTRAINT "AttendanceLinkedToLesson_attendanceId_fkey";

-- DropForeignKey
ALTER TABLE "public"."AttendanceLinkedToLesson" DROP CONSTRAINT "AttendanceLinkedToLesson_lessonId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ClassHasSeries" DROP CONSTRAINT "ClassHasSeries_classId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ClassHasSeries" DROP CONSTRAINT "ClassHasSeries_seriesId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Student" DROP CONSTRAINT "Student_seriesId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TeacherQualified" DROP CONSTRAINT "TeacherQualified_seriesId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TeacherQualified" DROP CONSTRAINT "TeacherQualified_teacherId_fkey";

-- AlterTable
ALTER TABLE "Address" ADD COLUMN     "city" TEXT,
ADD COLUMN     "state" TEXT;

-- AlterTable
ALTER TABLE "Attendance" DROP COLUMN "presenceStatus",
ADD COLUMN     "lessonId" TEXT NOT NULL,
ADD COLUMN     "status" "AttendanceStatus" NOT NULL;

-- AlterTable
ALTER TABLE "Class" ADD COLUMN     "grades" "SchoolGrade"[],
ADD COLUMN     "shift" "Shift" NOT NULL;

-- AlterTable
ALTER TABLE "Contract" DROP COLUMN "document",
ADD COLUMN     "documentUrl" TEXT;

-- AlterTable
ALTER TABLE "Lesson" DROP COLUMN "lessonDate",
ADD COLUMN     "contents" TEXT,
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "paymentStatus",
ADD COLUMN     "status" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Profile" ALTER COLUMN "accessLevel" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Student" DROP COLUMN "seriesId",
ADD COLUMN     "currentGrade" "SchoolGrade" NOT NULL;

-- AlterTable
ALTER TABLE "StudentHasGuardian" DROP COLUMN "kinship",
ADD COLUMN     "kinship" "Kinship" NOT NULL DEFAULT 'PAI_MAE';

-- AlterTable
ALTER TABLE "Teacher" ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "qualifiedGrades" "SchoolGrade"[],
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'ATIVO',
ALTER COLUMN "expertise" DROP NOT NULL;

-- DropTable
DROP TABLE "public"."AttendanceLinkedToLesson";

-- DropTable
DROP TABLE "public"."ClassHasSeries";

-- DropTable
DROP TABLE "public"."Series";

-- DropTable
DROP TABLE "public"."TeacherQualified";

-- CreateIndex
CREATE UNIQUE INDEX "Attendance_studentId_lessonId_key" ON "Attendance"("studentId", "lessonId");

-- CreateIndex
CREATE UNIQUE INDEX "Teacher_email_key" ON "Teacher"("email");

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
