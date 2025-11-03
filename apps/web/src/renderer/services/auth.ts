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

export async function verifyRecoveryCode(code: string, token: string) {

  if (!token) {
    throw new Error('Token de recuperação não encontrado');
  }

  console.log('[auth.ts] Verificando código com token:', token);
  console.log('[auth.ts] Código enviado:', code);

  try {
    const { data } = await api.post<{ authToken: string }>( '/auth/user/verify-code', { code },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    console.log('[auth.ts] ✅ Código verificado com sucesso');
    return data;
  } catch (error: any) {
    console.error('[auth.ts] ❌ Erro ao verificar código:', {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      data: error.response?.data,
    });
    throw error;
  }
}

export async function resetPassword({ password }: { password: string }) {
  // Agora confiamos no interceptor que lê 'auth_token'
  const token = localStorage.getItem('auth_token');
  if (!token) {
    throw new Error('Token não encontrado. Solicite novo código.');
  }

  try {
    const { data } = await api.post('/auth/user/reset-password', {
      newPassword: password,
    });

    console.log('[auth.ts] ✅ Senha alterada com sucesso');

    // Opcional: limpar o token de recuperação após o uso
    // localStorage.removeItem('auth_token');

    return data;
  } catch (error: any) {
    console.error('[auth.ts] ❌ Erro ao resetar senha:', error);
    throw error;
  }
}
