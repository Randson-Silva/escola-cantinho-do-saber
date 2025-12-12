// Mock user service with localStorage persistence

export type UserRole = 'ADMIN' | 'RECEPCIONISTA' | 'PROFESSOR';

export interface MockUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  teacherId?: string; // Referência ao professor, se for PROFESSOR
  createdAt: string;
}

const STORAGE_KEY = 'mock_users';
const DEFAULT_PASSWORD = 'Professor123';

// Usuário admin padrão
const INITIAL_USERS: MockUser[] = [
  {
    id: 'admin-1',
    name: 'Administrador',
    email: 'admin@escola.com',
    password: 'admin123',
    role: 'ADMIN',
    createdAt: new Date().toISOString(),
  },
];

function readAll(): MockUser[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      writeAll(INITIAL_USERS);
      return INITIAL_USERS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(list: MockUser[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export const mockUserService = {
  async getAll(): Promise<MockUser[]> {
    return readAll();
  },

  async getByEmail(email: string): Promise<MockUser | null> {
    const users = readAll();
    return users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
  },

  async create(data: {
    name: string;
    email: string;
    password?: string;
    role: UserRole;
    teacherId?: string;
  }): Promise<MockUser> {
    const list = readAll();

    // Verifica se email já existe
    const exists = list.find((u) => u.email.toLowerCase() === data.email.toLowerCase());
    if (exists) {
      throw new Error('E-mail já cadastrado no sistema');
    }

    const genId = `user-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    const user: MockUser = {
      id: genId,
      name: data.name,
      email: data.email,
      password: data.password || DEFAULT_PASSWORD,
      role: data.role,
      teacherId: data.teacherId,
      createdAt: new Date().toISOString(),
    };

    list.unshift(user);
    writeAll(list);
    return user;
  },

  async createForTeacher(teacherId: string, name: string, email: string): Promise<MockUser> {
    return this.create({
      name,
      email,
      password: DEFAULT_PASSWORD,
      role: 'PROFESSOR',
      teacherId,
    });
  },

  async update(id: string, data: Partial<MockUser>): Promise<MockUser> {
    const list = readAll();
    const idx = list.findIndex((u) => u.id === id);
    if (idx === -1) {
      throw new Error('Usuário não encontrado');
    }

    const updated: MockUser = { ...list[idx], ...data, id };
    list[idx] = updated;
    writeAll(list);
    return updated;
  },

  async delete(id: string): Promise<void> {
    const list = readAll();
    const filtered = list.filter((u) => u.id !== id);
    writeAll(filtered);
  },

  async deleteByTeacherId(teacherId: string): Promise<void> {
    const list = readAll();
    const filtered = list.filter((u) => u.teacherId !== teacherId);
    writeAll(filtered);
  },

  // Autenticação simples
  async authenticate(email: string, password: string): Promise<MockUser | null> {
    const users = readAll();
    const user = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password,
    );
    return user || null;
  },

  DEFAULT_PASSWORD,
};

