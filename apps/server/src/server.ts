import 'dotenv/config';
import * as express from 'express';
import * as passport from 'passport';
import * as cors from 'cors';
import 'reflect-metadata';
import { container } from 'tsyringe';
import { PROFILE_REPOSITORY_TOKEN } from './domain/application/repositories/profile.repository';
import { USERS_REPOSITORY_TOKEN } from './domain/application/repositories/user.repository';
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
import { STUDENT_REPOSITORY_TOKEN } from './domain/application/repositories/student.repository';
import { StudentRepository } from './infra/database/repositories/student.repository';
import { CreateStudentController } from './infra/http/controllers/student/create-student.controller';
import { FindStudentByIdController } from './infra/http/controllers/student/find-student-by-id.controller';
import { UpdateStudentController } from './infra/http/controllers/student/update-student.controller';
import { DeleteStudentController } from './infra/http/controllers/student/delete-student.controller';

//#region MODULE CONFIGURATION

container.register(USERS_REPOSITORY_TOKEN, { useClass: UserRepository });
container.register(PROFILE_REPOSITORY_TOKEN, { useClass: ProfileRepository });
container.register(STUDENT_REPOSITORY_TOKEN, { useClass: StudentRepository });

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
//#endregion

const PORT = process.env.EXPRESS_BACK_PORT ?? 4000;

app.listen(PORT, () => console.log(`🚀 Server listening on http://localhost:${PORT}`));
