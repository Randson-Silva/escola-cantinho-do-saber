// Mocked teacher service with strong typing and localStorage persistence

export type TeacherStatus = 'ATIVO' | 'INATIVO';

export interface Teacher {
  id: string;
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
  competencias: string[]; // Ex: ['1º Ano', '2º Ano']
  chavePix: string;
  dataInicio: string; // ISO date string
  status: TeacherStatus;
}

const STORAGE_KEY = 'teachers';

function readAll(): Teacher[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(list: Teacher[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export const teacherService = {
  async getAll(): Promise<Teacher[]> {
    return Promise.resolve(readAll());
  },

  async create(data: Omit<Teacher, 'id'>): Promise<Teacher> {
    const genId = `t-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    const teacher: Teacher = { ...data, id: genId };
    const list = readAll();
    list.unshift(teacher);
    writeAll(list);
    return Promise.resolve(teacher);
  },

  async update(id: string, data: Partial<Teacher>): Promise<Teacher> {
    const list = readAll();
    const idx = list.findIndex((t) => t.id === id);
    if (idx === -1) {
      throw new Error('Professor não encontrado');
    }
    const updated: Teacher = { ...list[idx], ...data, id };
    list[idx] = updated;
    writeAll(list);
    return Promise.resolve(updated);
  },
};

export const COMPETENCIAS_PERMITIDAS = [
  '1º Ano',
  '2º Ano',
  '3º Ano',
  '4º Ano',
  '5º Ano',
  '6º Ano',
  '7º Ano',
  '8º Ano',
  '9º Ano',
];

