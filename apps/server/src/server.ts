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

//#region MODULE CONFIGURATION

container.register(USERS_REPOSITORY_TOKEN, { useClass: UserRepository });
container.register(PROFILE_REPOSITORY_TOKEN, { useClass: ProfileRepository });
container.register(STUDENT_REPOSITORY_TOKEN, { useClass: StudentRepository });
container.registerSingleton<IGuardianRepository>( GUARDIAN_REPOSITORY_TOKEN, GuardianRepository,);
container.registerSingleton<IStudentGuardianRepository>( STUDENT_GUARDIAN_REPOSITORY_TOKEN, StudentGuardianRepository,);
container.register(CLASS_REPOSITORY_TOKEN, { useClass: ClassRepository });

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
//#endregion

const PORT = process.env.EXPRESS_BACK_PORT ?? 4000;

app.listen(PORT, () => console.log(`🚀 Server listening on http://localhost:${PORT}`));
