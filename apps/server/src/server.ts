import 'dotenv/config';
import * as express from 'express';
import * as passport from 'passport';
import * as cors from 'cors';
import 'reflect-metadata';
import { container } from 'tsyringe';
import {
  IProfileRepository,
  PROFILE_REPOSITORY_TOKEN,
} from './domain/application/repositories/profile.repository';
import {
  IUserRepository,
  USERS_REPOSITORY_TOKEN,
} from './domain/application/repositories/user.repository';
import {
  GUARDIAN_REPOSITORY_TOKEN,
  IGuardianRepository,
} from 'apps/server/src/domain/application/repositories/guardian.repository';
import { GuardianRepository } from 'apps/server/src/infra/database/repositories/guardian.repository';
import {
  IStudentGuardianRepository,
  STUDENT_GUARDIAN_REPOSITORY_TOKEN,
} from 'apps/server/src/domain/application/repositories/student-guardian.repository';
import {
  ILessonRepository,
  LESSON_REPOSITORY_TOKEN,
} from './domain/application/repositories/lesson.repository';
import { LessonRepository } from './infra/database/repositories/lesson.repository';
import {
  ATTENDANCE_REPOSITORY_TOKEN,
  IAttendanceRepository,
} from './domain/application/repositories/attendance.repository';
import { AttendanceRepository } from './infra/database/repositories/attendance.repository';
import {
  ATTENDANCE_LINKED_TO_LESSON_REPOSITORY_TOKEN,
  IAttendanceLinkedToLessonRepository,
} from './domain/application/repositories/attendance-linked-to-lesson.repository';
import { AttendanceLinkedToLessonRepository } from './infra/database/repositories/attendance-linked-to-lesson.repository';
import { StudentGuardianRepository } from 'apps/server/src/infra/database/repositories/student-guardian.repository';
import { configurePassport } from './infra/auth/passport';
import { ProfileRepository } from './infra/database/repositories/profile.repository';
import { UserRepository } from './infra/database/repositories/user.repository';
import { AuthenticateUserController } from './infra/http/controllers/user/auth-user.controller';
import { CreateUserController } from './infra/http/controllers/user/create-user.controller';
import { ForgotPasswordController } from './infra/http/controllers/user/forgot-password.controller';
import { ResetPasswordController } from './infra/http/controllers/user/reset-password.controller';
import { VerifyCodeController } from './infra/http/controllers/user/verify-code.controller';
import { RefreshUserSessionController } from './infra/http/controllers/user/refresh-user-session.controller';
import { FindUserByEmailController } from './infra/http/controllers/user/find-user-by-email.controller';
import { SelfFindUserController } from './infra/http/controllers/user/self-find-user.controller';
import { DeleteUserController } from './infra/http/controllers/user/delete-user.controller';
import {
  IStudentRepository,
  STUDENT_REPOSITORY_TOKEN,
} from './domain/application/repositories/student.repository';
import { StudentRepository } from './infra/database/repositories/student.repository';
import { CreateStudentController } from './infra/http/controllers/student/create-student.controller';
import { FindStudentByIdController } from './infra/http/controllers/student/find-student-by-id.controller';
import { UpdateStudentController } from './infra/http/controllers/student/update-student.controller';
import { DeleteStudentController } from './infra/http/controllers/student/delete-student.controller';
import {
  CLASS_REPOSITORY_TOKEN,
  IClassRepository,
} from './domain/application/repositories/class.repository';
import { ClassRepository } from './infra/database/repositories/class.repository';
import { CreateClassController } from './infra/http/controllers/class/create-class.controller';
import { DeleteClassController } from './infra/http/controllers/class/delete-class.controller';
import { FindClassByIdController } from './infra/http/controllers/class/find-class-by-id.controller';
import { UpdateClassController } from './infra/http/controllers/class/update-class.controller';
import { CreateGuardianController } from './infra/http/controllers/guardian/create-guardian.controller';
import { LinkGuardianToStudentController } from './infra/http/controllers/student-guardian/link-guardian-to-student.controller';
import { CreateLessonController } from './infra/http/controllers/lesson/create-lesson.controller';
import { RegisterStudentAttendanceController } from './infra/http/controllers/attendance/register-student-attendance.controller';
import {
  ISerieRepository,
  SERIES_REPOSITORY_TOKEN,
} from './domain/application/repositories/serie.repository';
import { SerieRepository } from './infra/database/repositories/serie.repository';
import { CreateSerieController } from './infra/http/controllers/serie/create-serie.controller';
import { FindSerieByIdController } from './infra/http/controllers/serie/find-serie-by-id.controller';
import { UpdateSerieController } from './infra/http/controllers/serie/update-serie.controller';
import { DeleteSerieController } from './infra/http/controllers/serie/delete-serie.controller';
import { FindGuardianByIdController } from './infra/http/controllers/guardian/find-guardian-by-id.controller';
import { UpdateGuardianController } from './infra/http/controllers/guardian/update-guardian.controller';
import { DeleteGuardianController } from './infra/http/controllers/guardian/delete-guardian.controller';
import { FindLessonByIdController } from './infra/http/controllers/lesson/find-lesson-by-id.controller';
import { UpdateLessonController } from './infra/http/controllers/lesson/update-lesson.controller';
import { DeleteLessonController } from './infra/http/controllers/lesson/delete-lesson.controller';
import {
  ADDRESS_REPOSITORY_TOKEN,
  IAddressRepository,
} from './domain/application/repositories/address.repository';
import { AddressRepository } from './infra/database/repositories/address.repository';
import { FindStudentByNameController } from './infra/http/controllers/student/find-student-by-name.controller';
import { GetStudentsCountController } from './infra/http/controllers/student/get-students-count.controller';
import { TEACHER_REPOSITORY_TOKEN, ITeacherRepository } from './domain/application/repositories/teacher.repository';
import { TeacherRepository } from './infra/database/repositories/teacher.repository';
import { CreateTeacherController } from './infra/http/controllers/teacher/create-teacher.controller';
import { FetchTeachersController } from './infra/http/controllers/teacher/fetch-teachers.controller';
import { GetTeacherProfileController } from './infra/http/controllers/teacher/get-teacher-profile.controller';
import { EditTeacherController } from './infra/http/controllers/teacher/edit-teacher.controller';
//#region MODULE CONFIGURATION

container.registerSingleton<IUserRepository>(USERS_REPOSITORY_TOKEN, UserRepository);
container.registerSingleton<IProfileRepository>(PROFILE_REPOSITORY_TOKEN, ProfileRepository);
container.registerSingleton<IStudentRepository>(STUDENT_REPOSITORY_TOKEN, StudentRepository);
container.registerSingleton<IGuardianRepository>(GUARDIAN_REPOSITORY_TOKEN, GuardianRepository);
container.registerSingleton<IStudentGuardianRepository>(
  STUDENT_GUARDIAN_REPOSITORY_TOKEN,
  StudentGuardianRepository,
);
container.registerSingleton<IClassRepository>(CLASS_REPOSITORY_TOKEN, ClassRepository);
container.registerSingleton<ILessonRepository>(LESSON_REPOSITORY_TOKEN, LessonRepository);
container.registerSingleton<IAttendanceRepository>(
  ATTENDANCE_REPOSITORY_TOKEN,
  AttendanceRepository,
);
container.registerSingleton<IAttendanceLinkedToLessonRepository>(
  ATTENDANCE_LINKED_TO_LESSON_REPOSITORY_TOKEN,
  AttendanceLinkedToLessonRepository,
);
container.registerSingleton<ISerieRepository>(SERIES_REPOSITORY_TOKEN, SerieRepository);
container.registerSingleton<IAddressRepository>(ADDRESS_REPOSITORY_TOKEN, AddressRepository);
container.registerSingleton<ITeacherRepository>(TEACHER_REPOSITORY_TOKEN, TeacherRepository);

//#endregion

//#region EXPRESS CONFIGURATION
const app = express();

const router = express.Router();

app.use(
  cors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  }),
);
app.use(express.json());

app.use('/api/v1', router);
//#endregion

//#region AUTH CONFIGS
app.use(passport.initialize());
configurePassport(passport);

//#endregion

//#region CONTROLLERS AND ROUTES
const createUserController = container.resolve(CreateUserController);
const authUserController = container.resolve(AuthenticateUserController);
const forgotPasswordController = container.resolve(ForgotPasswordController);
const resetPasswordController = container.resolve(ResetPasswordController);
const verifyCodeController = container.resolve(VerifyCodeController);
const refreshUserSessionController = container.resolve(RefreshUserSessionController);
const deleteUserController = container.resolve(DeleteUserController);
const findUserByEmailController = container.resolve(FindUserByEmailController);
const selfGetUserController = container.resolve(SelfFindUserController);

const createStudentController = container.resolve(CreateStudentController);
const findStudentByIdController = container.resolve(FindStudentByIdController);
const updateStudentController = container.resolve(UpdateStudentController);
const deleteStudentController = container.resolve(DeleteStudentController);
const findStudentByNameController = container.resolve(FindStudentByNameController);
const getStudentsCountController = container.resolve(GetStudentsCountController);

const createClassController = container.resolve(CreateClassController);
const findClassByIdController = container.resolve(FindClassByIdController);
const updateClassController = container.resolve(UpdateClassController);
const deleteClassController = container.resolve(DeleteClassController);

const createSerieController = container.resolve(CreateSerieController);
const findSerieByIdController = container.resolve(FindSerieByIdController);
const updateSerieController = container.resolve(UpdateSerieController);
const deleteSerieController = container.resolve(DeleteSerieController);

const createGuardianController = container.resolve(CreateGuardianController);
const findGuardianByIdController = container.resolve(FindGuardianByIdController);
const updateGuardianController = container.resolve(UpdateGuardianController);
const deleteGuardianController = container.resolve(DeleteGuardianController);
const linkGuardianToStudentController = container.resolve(LinkGuardianToStudentController);

const createLessonController = container.resolve(CreateLessonController);
const findLessonByIdController = container.resolve(FindLessonByIdController);
const updateLessonController = container.resolve(UpdateLessonController);
const deleteLessonController = container.resolve(DeleteLessonController);
const registerStudentAttendanceController = container.resolve(RegisterStudentAttendanceController);

const createTeacherController = container.resolve(CreateTeacherController);
const fetchTeachersController = container.resolve(FetchTeachersController);
const getTeacherProfileController = container.resolve(GetTeacherProfileController);
const editTeacherController = container.resolve(EditTeacherController);

router.use('/', authUserController.router);
router.use('/', forgotPasswordController.router);
router.use('/', createUserController.router);
router.use('/', resetPasswordController.router);
router.use('/', verifyCodeController.router);
router.use('/', refreshUserSessionController.router);
router.use('/', deleteUserController.router);
router.use('/', findUserByEmailController.router);
router.use('/', selfGetUserController.router);

router.use('/', createStudentController.router);
router.use('/', findStudentByIdController.router);
router.use('/', updateStudentController.router);
router.use('/', deleteStudentController.router);
router.use('/', findStudentByNameController.router);
router.use('/', getStudentsCountController.router);

router.use('/', createClassController.router);
router.use('/', findClassByIdController.router);
router.use('/', updateClassController.router);
router.use('/', deleteClassController.router);

router.use('/', createSerieController.router);
router.use('/', findSerieByIdController.router);
router.use('/', updateSerieController.router);
router.use('/', deleteSerieController.router);

router.use('/', createGuardianController.router);
router.use('/', findGuardianByIdController.router);
router.use('/', updateGuardianController.router);
router.use('/', deleteGuardianController.router);
router.use('/', linkGuardianToStudentController.router);

router.use('/', createLessonController.router);
router.use('/', findLessonByIdController.router);
router.use('/', updateLessonController.router);
router.use('/', deleteLessonController.router);
router.use('/', registerStudentAttendanceController.router);

router.use('/', createTeacherController.router);
router.use('/', fetchTeachersController.router);
router.use('/', getTeacherProfileController.router);
router.use('/', editTeacherController.router);

//#endregion

const PORT = process.env.EXPRESS_BACK_PORT ?? 4000;

app.listen(PORT, () => console.log(`🚀 Server listening on http://localhost:${PORT}`));
