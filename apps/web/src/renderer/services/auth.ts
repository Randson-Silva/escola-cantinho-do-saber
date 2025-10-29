import { api } from './api';

export type LoginPayload = { email: string; password: string };
export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
};

export async function login(payload: LoginPayload) {
  const { data } = await api.post<LoginResponse>('/auth/user/login', payload);

  // Decodifica o accessToken para extrair dados do usuário
  const tokenPayload = JSON.parse(atob(data.accessToken.split('.')[1]));
  console.log('[auth.ts] Payload decodificado do token:', tokenPayload);

  // Monta objeto user a partir do payload do token
  const user = {
    id: tokenPayload.sub,
    name: tokenPayload.name || 'Usuário', // Se não tiver name no token
    email: tokenPayload.email || '', // Se não tiver email no token
    role: tokenPayload.accessLevel as 'ADMIN' | 'COMUM',
  };

  console.log('[auth.ts] User montado:', user);

  return {
    token: data.accessToken,
    user,
  };
}

export async function requestPasswordReset(email: string) {
  // backend retorna { authToken } para ser usado no passo de verificação
  const { data } = await api.post<{ authToken: string }>('/auth/user/forgot-password', { email });
  return data;
}

export async function verifyRecoveryCode(code: string) {
  // backend exige Authorization: Bearer <token do passo anterior> e corpo { code }
  const { data } = await api.post<{ authToken: string }>('/auth/user/verify-code', {
    code,
  });
  return data;
}

export async function resetPassword(params: { password: string }) {
  const { password } = params;
  // backend exige Authorization com token do tipo 'pass_reset'
  const { data } = await api.post<{ userId: string }>('/auth/user/reset-password', {
    newPassword: password,
  });
  return data;
}
