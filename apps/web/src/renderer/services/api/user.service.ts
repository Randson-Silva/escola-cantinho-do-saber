import { api } from '../api';

type UiRole = 'administrador' | 'recepcionista' | 'outros';

const ROLE_TO_ACCESS: Record<UiRole, 'ADMIN' | 'COMUM'> = {
  administrador: 'ADMIN',
  recepcionista: 'COMUM',
  outros: 'COMUM',
};

export const userService = {
  async createUser({
    name,
    email,
    password,
    role,
  }: {
    name: string;
    email: string;
    password: string;
    role: UiRole;
  }) {
    const accessLevel = ROLE_TO_ACCESS[role];
    const { data } = await api.post('/auth/user/register', {
      name,
      email,
      password,
      accessLevel,
    });
    return data;
  },
};

