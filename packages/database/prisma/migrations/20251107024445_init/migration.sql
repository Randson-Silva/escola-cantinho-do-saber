-- CreateEnum
CREATE TYPE "AccessLevel" AS ENUM ('ADMIN', 'COMUM');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL,
    "accessLevel" "AccessLevel" NOT NULL DEFAULT 'COMUM',

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Series" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Series_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Teacher" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "taxId" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "pixKey" TEXT NOT NULL,
    "expertise" TEXT NOT NULL,

    CONSTRAINT "Teacher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeacherQualified" (
    "teacherId" TEXT NOT NULL,
    "seriesId" TEXT NOT NULL,

    CONSTRAINT "TeacherQualified_pkey" PRIMARY KEY ("teacherId","seriesId")
);

-- CreateTable
CREATE TABLE "Class" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,

    CONSTRAINT "Class_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClassHasSeries" (
    "seriesId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,

    CONSTRAINT "ClassHasSeries_pkey" PRIMARY KEY ("seriesId","classId")
);

-- CreateTable
CREATE TABLE "Student" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "birthDate" TIMESTAMP(3) NOT NULL,
    "classId" TEXT NOT NULL,
    "seriesId" TEXT,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Guardian" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phones" TEXT[],

    CONSTRAINT "Guardian_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentHasGuardian" (
    "studentId" TEXT NOT NULL,
    "guardianId" TEXT NOT NULL,
    "kinship" TEXT,

    CONSTRAINT "StudentHasGuardian_pkey" PRIMARY KEY ("studentId","guardianId")
);

-- CreateTable
CREATE TABLE "Address" (
    "id" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "complement" TEXT,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contract" (
    "id" TEXT NOT NULL,
    "signatureDate" TIMESTAMP(3) NOT NULL,
    "dueDate" TIMESTAMP(3),
    "document" TEXT,

    CONSTRAINT "Contract_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Enrollment" (
    "id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "enrollmentDate" TIMESTAMP(3) NOT NULL,
    "studentId" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,

    CONSTRAINT "Enrollment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "paymentDate" TIMESTAMP(3),
    "paymentStatus" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lesson" (
    "id" TEXT NOT NULL,
    "lessonDate" TIMESTAMP(3) NOT NULL,
    "classId" TEXT NOT NULL,
    "startTime" TEXT,
    "endTime" TEXT,
    "duration" TEXT,

    CONSTRAINT "Lesson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attendance" (
    "id" TEXT NOT NULL,
    "presenceStatus" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,

    CONSTRAINT "Attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttendanceLinkedToLesson" (
    "attendanceId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,

    CONSTRAINT "AttendanceLinkedToLesson_pkey" PRIMARY KEY ("attendanceId","lessonId")
);

-- CreateTable
CREATE TABLE "_StudentAddresses" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_StudentAddresses_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_GuardianAddresses" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_GuardianAddresses_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_id_key" ON "User"("id");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_profileId_key" ON "User"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_id_key" ON "Profile"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Series_id_key" ON "Series"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Teacher_id_key" ON "Teacher"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Teacher_taxId_key" ON "Teacher"("taxId");

-- CreateIndex
CREATE UNIQUE INDEX "Teacher_phone_key" ON "Teacher"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Class_id_key" ON "Class"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Student_id_key" ON "Student"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Guardian_id_key" ON "Guardian"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Guardian_email_key" ON "Guardian"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Address_id_key" ON "Address"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Contract_id_key" ON "Contract"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Enrollment_id_key" ON "Enrollment"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_id_key" ON "Payment"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Lesson_id_key" ON "Lesson"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Attendance_id_key" ON "Attendance"("id");

-- CreateIndex
CREATE INDEX "_StudentAddresses_B_index" ON "_StudentAddresses"("B");

-- CreateIndex
CREATE INDEX "_GuardianAddresses_B_index" ON "_GuardianAddresses"("B");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherQualified" ADD CONSTRAINT "TeacherQualified_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherQualified" ADD CONSTRAINT "TeacherQualified_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "Series"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Class" ADD CONSTRAINT "Class_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassHasSeries" ADD CONSTRAINT "ClassHasSeries_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "Series"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassHasSeries" ADD CONSTRAINT "ClassHasSeries_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "Series"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentHasGuardian" ADD CONSTRAINT "StudentHasGuardian_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentHasGuardian" ADD CONSTRAINT "StudentHasGuardian_guardianId_fkey" FOREIGN KEY ("guardianId") REFERENCES "Guardian"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "Enrollment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceLinkedToLesson" ADD CONSTRAINT "AttendanceLinkedToLesson_attendanceId_fkey" FOREIGN KEY ("attendanceId") REFERENCES "Attendance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceLinkedToLesson" ADD CONSTRAINT "AttendanceLinkedToLesson_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_StudentAddresses" ADD CONSTRAINT "_StudentAddresses_A_fkey" FOREIGN KEY ("A") REFERENCES "Address"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_StudentAddresses" ADD CONSTRAINT "_StudentAddresses_B_fkey" FOREIGN KEY ("B") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GuardianAddresses" ADD CONSTRAINT "_GuardianAddresses_A_fkey" FOREIGN KEY ("A") REFERENCES "Address"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GuardianAddresses" ADD CONSTRAINT "_GuardianAddresses_B_fkey" FOREIGN KEY ("B") REFERENCES "Guardian"("id") ON DELETE CASCADE ON UPDATE CASCADE;
