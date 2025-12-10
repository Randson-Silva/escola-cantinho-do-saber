import { teacherService, type Teacher } from './teacherService';

export type ClassShift = 'MANHA' | 'TARDE';

export interface Class {
  id: string;
  name: string;
  shift: ClassShift;
  teacherId: string | null; // null se "Definir Depois"
  studentCount: number;
  capacity: number;
}

const STORAGE_KEY = 'classes';

// Mock inicial para não começar vazio se não tiver nada no storage
const INITIAL_MOCK: Class[] = [
  {
    id: 'c-1',
    name: 'Reforço Mat/Port A',
    shift: 'MANHA',
    teacherId: 't-mock-1', // Será resolvido com o mock de professores se existir, senão fica sem nome
    studentCount: 4,
    capacity: 12,
  },
  {
    id: 'c-2',
    name: 'Reforço Inglês B',
    shift: 'TARDE',
    teacherId: 't-mock-2',
    studentCount: 0,
    capacity: 12,
  },
  {
    id: 'c-3',
    name: 'Alfabetização C',
    shift: 'TARDE',
    teacherId: 't-mock-3',
    studentCount: 2,
    capacity: 12,
  },
];

function readAll(): Class[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Se não tiver nada, salva o mock inicial e retorna ele
      writeAll(INITIAL_MOCK);
      return INITIAL_MOCK;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(list: Class[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export const classService = {
  async getAll(): Promise<Class[]> {
    // Simula delay de rede
    await new Promise((resolve) => setTimeout(resolve, 500));
    return readAll();
  },

  async create(data: Omit<Class, 'id' | 'studentCount' | 'capacity'>): Promise<Class> {
    await new Promise((resolve) => setTimeout(resolve, 600));

    const genId = `c-${Date.now().toString(36)}`;
    const newClass: Class = {
      ...data,
      id: genId,
      studentCount: 0,
      capacity: 12, // Regra de negócio: capacidade fixa em 12
    };

    const list = readAll();
    list.unshift(newClass);
    writeAll(list);
    return newClass;
  },

  async delete(id: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const list = readAll();
    const filtered = list.filter((c) => c.id !== id);
    writeAll(filtered);
  },

  async update(id: string, data: Partial<Class>): Promise<Class> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const list = readAll();
    const idx = list.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error('Turma não encontrada');

    const updated = { ...list[idx], ...data };
    list[idx] = updated;
    writeAll(list);
    return updated;
  },
};

