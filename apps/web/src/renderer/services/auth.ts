import { api } from './api';

export type LoginPayload = { email: string; password: string };
export type LoginResponse = {
  token: string;
  user: { id: string; name: string; email: string };
};

export async function login(payload: LoginPayload) {
  const { data } = await api.post<LoginResponse>('/auth/login', payload);
  return data;
}

export async function requestPasswordReset(email: string) {
  const { data } = await api.post<{ message: string }>('/auth/forgot-password', { email });
  return data;
}

