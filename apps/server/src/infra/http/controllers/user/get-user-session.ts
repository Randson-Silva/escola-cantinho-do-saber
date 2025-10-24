// import { Either, succeed } from 'apps/server/src/core/either';
// import { ResourceNotFoundError } from 'apps/server/src/core/errors/resource-not-found.error';
// import { WrongCredentialsError } from 'apps/server/src/core/errors/wrong-credentials.error';
// import { IUserRepository } from 'apps/server/src/domain/application/repositories/user.repository';
// import { z, ZodError } from 'zod';
// import { AuthService } from '../../../auth/auth.service';
// import { injectable } from 'tsyringe';

// interface GetTenantUserSessionUseCaseRequest {
//   authorizationCode: string;
// }

// type GetTenantUserSessionUseCaseResponse = Either<
//   ResourceNotFoundError | WrongCredentialsError,
//   {
//     accessToken: string;
//     refreshToken: string;
//   }
// >;

// const authorizationCodeSchema = z.object({
//   sub: z.string(),
//   iat: z.number(),
//   exp: z.number(),
// });

// @injectable()
// export class GetTenantUserSessionUseCase {
//   constructor(
//     private readonly userRepository: IUserRepository,
//     private readonly authService: AuthService,
//   ) {}

//   async execute({
//     authorizationCode,
//   }: GetTenantUserSessionUseCaseRequest): Promise<GetTenantUserSessionUseCaseResponse> {
//     try {
//       const jsonPayload = await this.authService.decodeToken(authorizationCode);

//       const objectPayload = JSON.parse(jsonPayload);

//       const { sub, exp } = authorizationCodeSchema.parse(objectPayload);

//       const user = await this.userRepository.findById(sub);

//       if (!user) return fail(new ResourceNotFoundError('user does not exist'));

//       const isCodeValid = new Date() < new Date(exp * 1000);

//       if (!isCodeValid) return fail(new WrongCredentialsError());

//       const memberships = await this.membershipRepository.findAllByUserId(user.id.toString());

//       // prettier-ignore
//       const [accessToken, refreshToken] = await Promise.all([
//         this.authService.generateToken({
//           payloadSource: { user, memberships },
//           payloadGenerator: ({ user, memberships }) =>
//           ({
//             sub: user.id.toString(),
//             context: 'tenant',
//             memberships: memberships.map((membershipEntity) => ({
//               id: membershipEntity.id.toString(),
//               tenantId: membershipEntity.tenantId.toString(),
//               role: membershipEntity.role,
//               permissions: membershipEntity.permissions,
//             })),
//           } satisfies CreateTenantAccessJwtPayload),
//         }),
//         this.authService.generateToken({
//           payloadSource: user,
//           payloadGenerator: ({ id }) =>
//           ({
//             sub: id.toString(),
//           } satisfies CreateTenantRefreshJwtPayload),
//           options: { expTime: '7d' },
//         }),
//       ]);

//       return succeed({ accessToken, refreshToken });
//     } catch (error) {
//       const errorConstructor = (error as Error).constructor;

//       if (errorConstructor === SyntaxError || errorConstructor === ZodError) {
//         return fail(new WrongCredentialsError());
//       }

//       return fail(new Error('unable to get tenant user session'));
//     }
//   }
// }
