import { api } from './api';

// Tipos de função para o frontend (o que o usuário vê no <select>)
export type UiRole = 'administrador' | 'recepcionista' | 'professor';

// Tipos de função para o backend (o que é salvo no banco)
type BackendRole = 'ADMIN' | 'COMUM' | 'PROFESSOR';

// Mapeamento para converter do frontend para o backend
const ROLE_TO_BACKEND: Record<UiRole, BackendRole> = {
  administrador: 'ADMIN',
  recepcionista: 'COMUM',
  professor: 'PROFESSOR',
};

// Mapeamento para converter do backend para o frontend
const BACKEND_TO_ROLE: Record<BackendRole, UiRole> = {
  ADMIN: 'administrador',
  COMUM: 'recepcionista',
  PROFESSOR: 'professor',
};

// Descrição das permissões de cada role
export const ROLE_PERMISSIONS: Record<UiRole, string[]> = {
  administrador: ['Acesso total ao sistema', 'Gerenciar usuários', 'Relatórios financeiros'],
  recepcionista: ['Cadastrar alunos', 'Gerenciar matrículas', 'Atendimento'],
  professor: ['Registrar frequência', 'Visualizar dashboard'],
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
  generatedPassword?: string; // Senha gerada (apenas para novos usuários)
}

// Armazenamento local de senhas geradas (por email)
const PASSWORDS_STORAGE_KEY = 'generated_passwords';

function getStoredPasswords(): Record<string, string> {
  try {
    const raw = localStorage.getItem(PASSWORDS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function storePassword(email: string, password: string): void {
  const passwords = getStoredPasswords();
  passwords[email] = password;
  localStorage.setItem(PASSWORDS_STORAGE_KEY, JSON.stringify(passwords));
}

function removeStoredPassword(email: string): void {
  const passwords = getStoredPasswords();
  delete passwords[email];
  localStorage.setItem(PASSWORDS_STORAGE_KEY, JSON.stringify(passwords));
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
    const storedPasswords = getStoredPasswords();

    // Converte os dados do backend para o formato da UI
    return data.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: BACKEND_TO_ROLE[user.profile.accessLevel],
      generatedPassword: storedPasswords[user.email], // Anexa senha se existir
    }));
  },

  // Deletar um usuário pelo ID (apenas ADMIN)
  async deleteUser(userId: string): Promise<void> {
    await api.delete(`/users/${userId}`);
  },

  // Armazena senha gerada para um email
  storeGeneratedPassword(email: string, password: string): void {
    storePassword(email, password);
  },

  // Remove senha armazenada (ex: após usuário trocar a senha)
  clearStoredPassword(email: string): void {
    removeStoredPassword(email);
  },
};
