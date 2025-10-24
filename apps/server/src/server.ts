import 'dotenv/config';
import * as express from 'express';
import * as passport from 'passport';
import 'reflect-metadata';
import { container } from 'tsyringe';
import { PROFILE_REPOSITORY_TOKEN } from './domain/application/repositories/profile.repository';
import { USERS_REPOSITORY_TOKEN } from './domain/application/repositories/user.repository';
import { configurePassport } from './infra/auth/passport';
import { ProfileRepository } from './infra/database/repositories/profile.repository';
import { UserRepository } from './infra/database/repositories/user.repository';
import { AuthenticateUserController } from './infra/http/controllers/user/auth-user.controller';
import { CreateUserController } from './infra/http/controllers/user/create-user.controller';
import { checkJwt, requireRole } from './infra/auth/auth.middleware';

//#region MODULE CONFIGURATION

container.register(USERS_REPOSITORY_TOKEN, { useClass: UserRepository });

container.register(PROFILE_REPOSITORY_TOKEN, { useClass: ProfileRepository });

//#endregion

//#region EXPRESS CONFIGURATION
const app = express();

const router = express.Router();

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

router.use('/', authUserController.router);
router.use('/', checkJwt, requireRole('ADMIN'), createUserController.router);
//#endregion

const PORT = process.env.EXPRESS_BACK_PORT ?? 3000;

app.listen(PORT, () => console.log(`🚀 Server listening on http://localhost:${PORT}`));

router.stack
  .filter((r) => r.route)
  .map((r) => ({
    path: r.route!.path,
    methods: Object.keys(r.route!.all).join(', ').toUpperCase(),
  }))
  .forEach((r) => console.log(`${r.methods} ${r.path}`));
