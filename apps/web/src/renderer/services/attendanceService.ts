// Serviço de Frequência com integração real
import { classService, type Class } from './classService';
import { teacherService } from './teacherService';
import { studentService } from './studentService';

export type AttendanceStatus = 'PRESENT' | 'PARTIAL' | 'ABSENT';

export interface Student {
  id: string;
  name: string;
}

export interface ClassInfo {
  id: string;
  name: string;
  teacherId: string;
  teacherName: string;
  attendancePercentage?: number;
}

export interface AttendanceRecord {
  id?: string;
  studentId: string;
  studentName?: string;
  classId: string;
  date: string;
  status: AttendanceStatus;
  observation?: string;
}

export interface DailyAttendance {
  classId: string;
  date: string;
  records: AttendanceRecord[];
}

// ==================== STORAGE ====================

const ATTENDANCE_STORAGE_KEY = 'attendance_records';

// Carrega frequências do localStorage
function loadAttendanceFromStorage(): Map<string, AttendanceRecord[]> {
  try {
    const stored = localStorage.getItem(ATTENDANCE_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return new Map(Object.entries(parsed));
    }
  } catch {
    // ignore
  }
  return new Map();
}

// Salva frequências no localStorage
function saveAttendanceToStorage(attendance: Map<string, AttendanceRecord[]>): void {
  const obj = Object.fromEntries(attendance);
  localStorage.setItem(ATTENDANCE_STORAGE_KEY, JSON.stringify(obj));
}

// Armazena a frequência salva (persistente no localStorage)
let savedAttendance: Map<string, AttendanceRecord[]> = loadAttendanceFromStorage();

// ==================== HELPERS ====================

// Converte Class para ClassInfo
async function classToClassInfo(cls: Class): Promise<ClassInfo> {
  let teacherName = 'Sem professor';
  
  if (cls.teacherId) {
    try {
      const teachers = await teacherService.getAll();
      const teacher = teachers.find((t) => t.id === cls.teacherId);
      if (teacher) {
        teacherName = teacher.nome;
      }
    } catch {
      // Se falhar ao buscar professor, usa o padrão
    }
  }

  // Calcula porcentagem de presença (baseado nos registros salvos)
  const attendancePercentage = calculateAttendancePercentage(cls.id);

  return {
    id: cls.id,
    name: cls.name,
    teacherId: cls.teacherId || '',
    teacherName,
    attendancePercentage,
  };
}

// Calcula a porcentagem de presença de uma turma
function calculateAttendancePercentage(classId: string): number {
  let totalRecords = 0;
  let presentRecords = 0;

  savedAttendance.forEach((records, key) => {
    if (key.startsWith(`${classId}-`)) {
      totalRecords += records.length;
      presentRecords += records.filter((r) => r.status === 'PRESENT').length;
    }
  });

  if (totalRecords === 0) return 0;
  return Math.round((presentRecords / totalRecords) * 100);
}

// ==================== SERVIÇO ====================

export const attendanceService = {
  // Listar todas as turmas (para admin)
  async listClasses(): Promise<ClassInfo[]> {
    const classes = await classService.getAll();
    const classInfos = await Promise.all(classes.map(classToClassInfo));
    return classInfos;
  },

  // Listar turmas do professor logado (busca pelo email do usuário)
  async listMyClasses(userEmail: string): Promise<ClassInfo[]> {
    // Busca o professor correspondente ao email do usuário logado
    const teachers = await teacherService.getAll();
    const teacher = teachers.find((t) => t.email === userEmail);
    
    if (!teacher) {
      console.warn('[attendanceService] Professor não encontrado para o email:', userEmail);
      return [];
    }

    const classes = await classService.getAll();
    const myClasses = classes.filter((c) => c.teacherId === teacher.id);
    const classInfos = await Promise.all(myClasses.map(classToClassInfo));
    return classInfos;
  },

  // Buscar detalhes de uma turma
  async getClassById(classId: string): Promise<ClassInfo | undefined> {
    const classes = await classService.getAll();
    const cls = classes.find((c) => c.id === classId);
    if (!cls) return undefined;
    return classToClassInfo(cls);
  },

  // Listar alunos de uma turma (baseado no campo 'class' do aluno)
  async listStudentsByClass(classId: string): Promise<Student[]> {
    // Busca todos os alunos cadastrados
    const allStudents = await studentService.getAll();
    
    // Busca o nome da turma para compatibilidade com dados antigos
    const classes = await classService.getAll();
    const cls = classes.find((c) => c.id === classId);
    const className = cls?.name || '';
    
    // Filtra alunos que pertencem a esta turma (por ID ou nome)
    const classStudents = allStudents.filter(
      (s) => s.class === classId || s.class === className
    );
    
    // Retorna no formato esperado (id e name)
    return classStudents.map((s) => ({
      id: s.id,
      name: s.name,
    }));
  },

  // Buscar frequência de uma turma em uma data específica
  async getAttendanceByDate(classId: string, date: string): Promise<AttendanceRecord[]> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    // Recarrega do localStorage
    savedAttendance = loadAttendanceFromStorage();
    const key = `${classId}-${date}`;
    return savedAttendance.get(key) || [];
  },

  // Salvar chamada do dia
  async saveAttendance(attendance: DailyAttendance): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const key = `${attendance.classId}-${attendance.date}`;
    savedAttendance.set(key, attendance.records);
    saveAttendanceToStorage(savedAttendance);
    console.log('Frequência salva:', key, attendance.records);
  },

  // Atualizar registro de frequência individual
  async updateAttendance(
    recordId: string,
    status: AttendanceStatus,
    observation?: string,
  ): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    // Em uma implementação real, atualizaria o registro específico
    console.log('Atualizando registro:', recordId, status, observation);
  },
};

