import { api } from './api';

export type LoginPayload = { email: string; password: string };
export type LoginResponse = {
  token: string;
  user: { id: string; name: string; email: string };
};

export async function login(payload: LoginPayload) {
  const { data } = await api.post<LoginResponse>('/auth/user/login', payload);
  return data;
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
