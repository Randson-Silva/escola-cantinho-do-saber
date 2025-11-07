import 'dotenv/config';
import * as express from 'express';
import * as passport from 'passport';
import * as cors from 'cors';
import 'reflect-metadata';
import { container } from 'tsyringe';
import { PROFILE_REPOSITORY_TOKEN } from './domain/application/repositories/profile.repository';
import { USERS_REPOSITORY_TOKEN } from './domain/application/repositories/user.repository';
import {
  GUARDIAN_REPOSITORY_TOKEN,
  IGuardianRepository,
} from 'apps/server/src/domain/application/repositories/guardian.repository';
import { GuardianRepository } from 'apps/server/src/infra/database/repositories/guardian.repository';
import {
  STUDENT_GUARDIAN_REPOSITORY_TOKEN,
  IStudentGuardianRepository,
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
import { STUDENT_REPOSITORY_TOKEN } from './domain/application/repositories/student.repository';
import { StudentRepository } from './infra/database/repositories/student.repository';
import { CreateStudentController } from './infra/http/controllers/student/create-student.controller';
import { FindStudentByIdController } from './infra/http/controllers/student/find-student-by-id.controller';
import { UpdateStudentController } from './infra/http/controllers/student/update-student.controller';
import { DeleteStudentController } from './infra/http/controllers/student/delete-student.controller';
import { CLASS_REPOSITORY_TOKEN } from './domain/application/repositories/class.repository';
import { ClassRepository } from './infra/database/repositories/class.repository';
import { CreateClassController } from './infra/http/controllers/class/create-class.controller';
import { DeleteClassController } from './infra/http/controllers/class/delete-class.controller';
import { FindClassByIdController } from './infra/http/controllers/class/find-class-by-id.controller';
import { UpdateClassController } from './infra/http/controllers/class/update-class.controller';
import { SERIE_REPOSITORY_TOKEN } from './domain/application/repositories/serie.repository';
import { SerieRepository } from './infra/database/repositories/serie.repository';
import { CreateSerieController } from './infra/http/controllers/serie/create-serie.controller';
import { FindSerieByIdController } from './infra/http/controllers/serie/find-serie-by-id.controller';
import { UpdateSerieController } from './infra/http/controllers/serie/update-serie.controller';
import { DeleteSerieController } from './infra/http/controllers/serie/delete-serie.controller';
import { CreateGuardianController } from './infra/http/controllers/guardian/create-guardian.controller';
import { LinkGuardianToStudentController } from './infra/http/controllers/student-guardian/link-guardian-to-student.controller';
import { CreateLessonController } from './infra/http/controllers/lesson/create-lesson.controller';
import { RegisterStudentAttendanceController } from './infra/http/controllers/attendance/register-student-attendance.controller';
import { ADDRESS_REPOSITORY_TOKEN } from './domain/application/repositories/address.repository';
import { PrismaAddressRepository } from './infra/database/repositories/prisma.adress.repository';
import { CreateAddressController } from './infra/http/controllers/address/create-address.controller';
import { FindAddressController } from './infra/http/controllers/address/find-address.controller';
import { UpdateAddressController } from './infra/http/controllers/address/update-address.controller';
import { DeleteAddressController } from './infra/http/controllers/address/delete-address.controller';
import { FindGuardianByIdController } from './infra/http/controllers/guardian/find-guardian-by-id.controller';
import { UpdateGuardianController } from './infra/http/controllers/guardian/update-guardian.controller';
import { DeleteGuardianController } from './infra/http/controllers/guardian/delete-guardian.controller';
import { FindLessonByIdController } from './infra/http/controllers/lesson/find-lesson-by-id.controller';
import { UpdateLessonController } from './infra/http/controllers/lesson/update-lesson.controller';
import { DeleteLessonController } from './infra/http/controllers/lesson/delete-lesson.controller';


//#region MODULE CONFIGURATION

container.register(USERS_REPOSITORY_TOKEN, { useClass: UserRepository });
container.register(PROFILE_REPOSITORY_TOKEN, { useClass: ProfileRepository });
container.register(STUDENT_REPOSITORY_TOKEN, { useClass: StudentRepository });
container.registerSingleton<IGuardianRepository>( GUARDIAN_REPOSITORY_TOKEN, GuardianRepository,);
container.registerSingleton<IStudentGuardianRepository>( STUDENT_GUARDIAN_REPOSITORY_TOKEN, StudentGuardianRepository,);
container.register(CLASS_REPOSITORY_TOKEN, { useClass: ClassRepository });
container.register(ADDRESS_REPOSITORY_TOKEN, { useClass: PrismaAddressRepository });
container.registerSingleton<ILessonRepository>(
  LESSON_REPOSITORY_TOKEN,
  LessonRepository,
);
container.registerSingleton<IAttendanceRepository>(
  ATTENDANCE_REPOSITORY_TOKEN,
  AttendanceRepository,
);
container.registerSingleton<IAttendanceLinkedToLessonRepository>(
  ATTENDANCE_LINKED_TO_LESSON_REPOSITORY_TOKEN,
  AttendanceLinkedToLessonRepository,
);
container.register(SERIE_REPOSITORY_TOKEN, { useClass: SerieRepository });

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

const createStudentController = container.resolve(CreateStudentController);
const findStudentByIdController = container.resolve(FindStudentByIdController);
const updateStudentController = container.resolve(UpdateStudentController);
const deleteStudentController = container.resolve(DeleteStudentController);

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
const linkGuardianToStudentController = container.resolve(
  LinkGuardianToStudentController,
);

const createLessonController = container.resolve(CreateLessonController);
const findLessonByIdController = container.resolve(FindLessonByIdController);
const updateLessonController = container.resolve(UpdateLessonController);
const deleteLessonController = container.resolve(DeleteLessonController);
const registerStudentAttendanceController = container.resolve(
  RegisterStudentAttendanceController,
);
const createAddressController = container.resolve(CreateAddressController);
const findAddressController = container.resolve(FindAddressController);
const updateAddressController = container.resolve(UpdateAddressController);
const deleteAddressController = container.resolve(DeleteAddressController);

router.use('/', authUserController.router);
router.use('/', forgotPasswordController.router);
router.use('/', createUserController.router);
router.use('/', resetPasswordController.router);
router.use('/', verifyCodeController.router);
router.use('/', refreshUserSessionController.router);

router.use('/', createStudentController.router);
router.use('/', findStudentByIdController.router);
router.use('/', updateStudentController.router);
router.use('/', deleteStudentController.router);

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

router.use('/', createAddressController.router);
router.use('/', findAddressController.router);
router.use('/', updateAddressController.router);
router.use('/', deleteAddressController.router);
//#endregion

const PORT = process.env.EXPRESS_BACK_PORT ?? 4000;

app.listen(PORT, () => console.log(`🚀 Server listening on http://localhost:${PORT}`));
