import { teacherService, type Teacher } from './teacherService';

export type ClassShift = 'MANHA' | 'TARDE';

export interface TimeSlot {
  start: string;
  end: string;
}

// Representa um aluno ocupando um horário na turma
export interface StudentSlot {
  studentId: string;
  studentName: string;
  start: string;
  end: string;
}

export interface Class {
  id: string;
  name: string;
  shift: ClassShift;
  teacherId: string | null; // null se "Definir Depois"
  studentCount: number;
  capacity: number;
  schedule: TimeSlot; // Horário da turma
  competencias: string[]; // Competências herdadas do professor
  studentSlots: StudentSlot[]; // Alunos ocupando horários
}

const STORAGE_KEY = 'classes';
const MAX_STUDENTS_PER_SLOT = 4; // Máximo de 4 alunos por slot de 1h30min

// Horários padrão por turno
const SHIFT_SCHEDULES: Record<ClassShift, TimeSlot> = {
  MANHA: { start: '08:00', end: '12:00' },
  TARDE: { start: '13:00', end: '17:30' },
};

// Função para obter horário baseado no turno
function getScheduleForShift(shift: ClassShift): TimeSlot {
  return SHIFT_SCHEDULES[shift];
}

// Gera os slots de 30 minutos dentro de um período
function generateTimeSlots(start: string, end: string): string[] {
  const slots: string[] = [];
  const [startH, startM] = start.split(':').map(Number);
  const [endH, endM] = end.split(':').map(Number);

  let currentMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  while (currentMinutes < endMinutes) {
    const h = Math.floor(currentMinutes / 60);
    const m = currentMinutes % 60;
    slots.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
    currentMinutes += 30;
  }

  return slots;
}

// Conta quantos alunos estão em um slot específico
function countStudentsInSlot(studentSlots: StudentSlot[], slotTime: string): number {
  return studentSlots.filter((slot) => {
    const [slotH, slotM] = slotTime.split(':').map(Number);
    const [startH, startM] = slot.start.split(':').map(Number);
    const [endH, endM] = slot.end.split(':').map(Number);

    const slotMinutes = slotH * 60 + slotM;
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    return slotMinutes >= startMinutes && slotMinutes < endMinutes;
  }).length;
}

// Verifica disponibilidade em um período
function checkSlotAvailability(
  studentSlots: StudentSlot[],
  start: string,
  end: string,
): { available: boolean; slots: Record<string, number> } {
  const slotsToCheck = generateTimeSlots(start, end);
  const slotCounts: Record<string, number> = {};
  let available = true;

  for (const slot of slotsToCheck) {
    const count = countStudentsInSlot(studentSlots, slot);
    slotCounts[slot] = count;
    if (count >= MAX_STUDENTS_PER_SLOT) {
      available = false;
    }
  }

  return { available, slots: slotCounts };
}

// Mock inicial para não começar vazio se não tiver nada no storage
const INITIAL_MOCK: Class[] = [
  {
    id: 'c-1',
    name: 'Reforço Mat/Port A',
    shift: 'MANHA',
    teacherId: 't-mock-1',
    studentCount: 0,
    capacity: 12,
    schedule: { start: '08:00', end: '12:00' },
    competencias: ['1º Ano', '2º Ano'],
    studentSlots: [],
  },
  {
    id: 'c-2',
    name: 'Reforço Inglês B',
    shift: 'TARDE',
    teacherId: 't-mock-2',
    studentCount: 0,
    capacity: 12,
    schedule: { start: '13:00', end: '17:30' },
    competencias: ['3º Ano', '4º Ano'],
    studentSlots: [],
  },
  {
    id: 'c-3',
    name: 'Alfabetização C',
    shift: 'TARDE',
    teacherId: 't-mock-3',
    studentCount: 0,
    capacity: 12,
    schedule: { start: '13:00', end: '17:30' },
    competencias: ['1º Ano'],
    studentSlots: [],
  },
];

// Migra turmas antigas para o novo formato
function migrateClasses(classes: Class[]): Class[] {
  let needsUpdate = false;
  const migrated = classes.map((c) => {
    let updated = { ...c };

    if (!c.schedule) {
      needsUpdate = true;
      updated.schedule = getScheduleForShift(c.shift);
    }

    if (!c.competencias) {
      needsUpdate = true;
      updated.competencias = [];
    }

    if (!c.studentSlots) {
      needsUpdate = true;
      updated.studentSlots = [];
    }

    return updated;
  });

  if (needsUpdate) {
    writeAll(migrated);
  }

  return migrated;
}

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
    const classes = Array.isArray(parsed) ? parsed : [];
    // Migra turmas antigas para o novo formato
    return migrateClasses(classes);
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

    // Limpa slots de alunos que não existem mais
    await this.cleanupOrphanedSlots();

    return readAll();
  },

  // Busca turmas por competência (série do aluno)
  async getByCompetencia(competencia: string): Promise<Class[]> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const all = readAll();
    return all.filter((c) => c.competencias.includes(competencia));
  },

  // Verifica disponibilidade de um horário em uma turma
  async checkAvailability(
    classId: string,
    start: string,
    end: string,
  ): Promise<{ available: boolean; slots: Record<string, number> }> {
    const all = readAll();
    const cls = all.find((c) => c.id === classId);
    if (!cls) throw new Error('Turma não encontrada');

    return checkSlotAvailability(cls.studentSlots, start, end);
  },

  // Adiciona um aluno a um horário da turma
  async addStudentToSlot(
    classId: string,
    studentId: string,
    studentName: string,
    start: string,
    end: string,
  ): Promise<Class> {
    await new Promise((resolve) => setTimeout(resolve, 400));

    const list = readAll();
    const idx = list.findIndex((c) => c.id === classId);
    if (idx === -1) throw new Error('Turma não encontrada');

    const cls = list[idx];

    // Verifica disponibilidade
    const { available } = checkSlotAvailability(cls.studentSlots, start, end);
    if (!available) {
      throw new Error('Horário lotado (máximo 4 alunos por slot)');
    }

    // Adiciona o aluno
    const newSlot: StudentSlot = { studentId, studentName, start, end };
    cls.studentSlots.push(newSlot);
    cls.studentCount = new Set(cls.studentSlots.map((s) => s.studentId)).size;

    list[idx] = cls;
    writeAll(list);

    return cls;
  },

  // Remove um aluno de um horário da turma
  async removeStudentFromSlot(classId: string, studentId: string): Promise<Class> {
    await new Promise((resolve) => setTimeout(resolve, 400));

    const list = readAll();
    const idx = list.findIndex((c) => c.id === classId);
    if (idx === -1) throw new Error('Turma não encontrada');

    const cls = list[idx];
    cls.studentSlots = cls.studentSlots.filter((s) => s.studentId !== studentId);
    cls.studentCount = new Set(cls.studentSlots.map((s) => s.studentId)).size;

    list[idx] = cls;
    writeAll(list);

    return cls;
  },

  // Obtém a ocupação por horário de uma turma
  getSlotOccupancy(cls: Class): Record<string, number> {
    const slots = generateTimeSlots(cls.schedule.start, cls.schedule.end);
    const occupancy: Record<string, number> = {};

    for (const slot of slots) {
      occupancy[slot] = countStudentsInSlot(cls.studentSlots, slot);
    }

    return occupancy;
  },

  async create(
    data: Omit<Class, 'id' | 'studentCount' | 'capacity' | 'schedule' | 'studentSlots'>,
  ): Promise<Class> {
    await new Promise((resolve) => setTimeout(resolve, 600));

    const genId = `c-${Date.now().toString(36)}`;
    const newClass: Class = {
      ...data,
      id: genId,
      studentCount: 0,
      capacity: 12, // Regra de negócio: capacidade fixa em 12
      schedule: getScheduleForShift(data.shift), // Popula horário baseado no turno
      competencias: data.competencias || [],
      studentSlots: [],
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

  // Atualiza as competências da turma baseado no professor
  async syncCompetenciasWithTeacher(classId: string): Promise<Class> {
    const list = readAll();
    const idx = list.findIndex((c) => c.id === classId);
    if (idx === -1) throw new Error('Turma não encontrada');

    const cls = list[idx];

    if (cls.teacherId) {
      const teachers = await teacherService.getAll();
      const teacher = teachers.find((t) => t.id === cls.teacherId);
      if (teacher) {
        cls.competencias = [...teacher.competencias];
        list[idx] = cls;
        writeAll(list);
      }
    }

    return cls;
  },

  // Limpa slots de alunos que não existem mais no sistema
  async cleanupOrphanedSlots(): Promise<void> {
    const { studentService } = await import('./studentService');
    const allStudents = await studentService.getAll();
    const validStudentIds = new Set(allStudents.map((s) => s.id));

    const list = readAll();
    let hasChanges = false;

    for (const cls of list) {
      if (cls.studentSlots && cls.studentSlots.length > 0) {
        const originalLength = cls.studentSlots.length;
        cls.studentSlots = cls.studentSlots.filter((slot) => validStudentIds.has(slot.studentId));
        cls.studentCount = new Set(cls.studentSlots.map((s) => s.studentId)).size;

        if (cls.studentSlots.length !== originalLength) {
          hasChanges = true;
          console.log(
            `[classService] Removidos ${originalLength - cls.studentSlots.length} slots órfãos da turma "${cls.name}"`,
          );
        }
      }
    }

    if (hasChanges) {
      writeAll(list);
      console.log('[classService] Slots órfãos removidos com sucesso');
    }
  },

  // Constantes exportadas
  MAX_STUDENTS_PER_SLOT,
  generateTimeSlots,
  checkSlotAvailability,
};
