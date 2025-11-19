import { api } from './api';

// Tipos de função para o frontend (o que o usuário vê no <select>)
type UiRole = 'administrador' | 'recepcionista';

// Tipos de função para o backend (o que é salvo no banco)
type BackendRole = 'ADMIN' | 'COMUM';

// Mapeamento para converter do frontend para o backend
const ROLE_TO_BACKEND: Record<UiRole, BackendRole> = {
  administrador: 'ADMIN',
  recepcionista: 'COMUM',
};

// Mapeamento para converter do backend para o frontend
const BACKEND_TO_ROLE: Record<BackendRole, UiRole> = {
  ADMIN: 'administrador',
  COMUM: 'recepcionista',
};

// Interface para os dados que vêm do backend
export interface UserFromBackend {
  id: string;
  name: string;
  email: string;
  profile: {
    accessLevel: BackendRole;
  };
}

// Interface para os dados que serão usados na UI
export interface UserForUI {
  id: string;
  name: string;
  email: string;
  role: UiRole;
}

export const userService = {
  // Criar novo usuário
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
    const backendRole = ROLE_TO_BACKEND[role];
    const { data } = await api.post('/auth/user/register', {
      name,
      email,
      password,
      accessLevel: backendRole, // Backend espera "accessLevel"
    });
    return data;
  },

  // Listar todos os usuários (apenas ADMIN)
  async listUsers(): Promise<UserForUI[]> {
    const { data } = await api.get<UserFromBackend[]>('/users');
    // Converte os dados do backend para o formato da UI
    return data.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: BACKEND_TO_ROLE[user.profile.accessLevel],
    }));
  },

  // Deletar um usuário pelo ID (apenas ADMIN)
  async deleteUser(userId: string): Promise<void> {
    await api.delete(`/users/${userId}`);
  },
};
