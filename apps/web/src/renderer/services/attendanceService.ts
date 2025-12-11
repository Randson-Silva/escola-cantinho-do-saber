// Serviço de Frequência com dados mockados

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

// ==================== DADOS MOCK ====================

const MOCK_CLASSES: ClassInfo[] = [
  {
    id: '1',
    name: 'Reforço Tarde A',
    teacherId: 'teacher-1',
    teacherName: 'Prof. Carlos',
    attendancePercentage: 85,
  },
  {
    id: '2',
    name: 'Reforço Inglês B',
    teacherId: 'teacher-2',
    teacherName: 'Profa. Ana',
    attendancePercentage: 92,
  },
  {
    id: '3',
    name: 'Alfabetização',
    teacherId: 'teacher-3',
    teacherName: 'Prof. Roberto',
    attendancePercentage: 70,
  },
  {
    id: '4',
    name: 'Matemática Avançada',
    teacherId: 'teacher-1',
    teacherName: 'Prof. Carlos',
    attendancePercentage: 95,
  },
];

const MOCK_STUDENTS_BY_CLASS: Record<string, Student[]> = {
  '1': [
    { id: 's1', name: 'Fernanda Lima' },
    { id: 's2', name: 'Lucas Pereira' },
    { id: 's3', name: 'Mariana Souza' },
    { id: 's4', name: 'Pedro Henrique' },
    { id: 's5', name: 'Carla Diaz' },
    { id: 's6', name: 'João Silva' },
    { id: 's7', name: 'Ana Clara' },
    { id: 's8', name: 'Bruno Santos' },
  ],
  '2': [
    { id: 's9', name: 'Julia Oliveira' },
    { id: 's10', name: 'Rafael Costa' },
    { id: 's11', name: 'Isabela Martins' },
    { id: 's12', name: 'Gabriel Ferreira' },
    { id: 's13', name: 'Larissa Almeida' },
  ],
  '3': [
    { id: 's14', name: 'Miguel Rodrigues' },
    { id: 's15', name: 'Sofia Nunes' },
    { id: 's16', name: 'Davi Ribeiro' },
    { id: 's17', name: 'Helena Barbosa' },
    { id: 's18', name: 'Arthur Cardoso' },
    { id: 's19', name: 'Laura Moreira' },
  ],
  '4': [
    { id: 's20', name: 'Enzo Gomes' },
    { id: 's21', name: 'Valentina Dias' },
    { id: 's22', name: 'Theo Mendes' },
    { id: 's23', name: 'Alice Campos' },
  ],
};

// Armazena a frequência salva (mock persistente na memória)
const savedAttendance: Map<string, AttendanceRecord[]> = new Map();

// ==================== SERVIÇO ====================

export const attendanceService = {
  // Listar todas as turmas (para admin)
  async listClasses(): Promise<ClassInfo[]> {
    // Simula delay de rede
    await new Promise((resolve) => setTimeout(resolve, 300));
    return MOCK_CLASSES;
  },

  // Listar turmas do professor logado
  async listMyClasses(teacherId: string): Promise<ClassInfo[]> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return MOCK_CLASSES.filter((c) => c.teacherId === teacherId);
  },

  // Buscar detalhes de uma turma
  async getClassById(classId: string): Promise<ClassInfo | undefined> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return MOCK_CLASSES.find((c) => c.id === classId);
  },

  // Listar alunos de uma turma
  async listStudentsByClass(classId: string): Promise<Student[]> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return MOCK_STUDENTS_BY_CLASS[classId] || [];
  },

  // Buscar frequência de uma turma em uma data específica
  async getAttendanceByDate(classId: string, date: string): Promise<AttendanceRecord[]> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const key = `${classId}-${date}`;
    return savedAttendance.get(key) || [];
  },

  // Salvar chamada do dia
  async saveAttendance(attendance: DailyAttendance): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const key = `${attendance.classId}-${attendance.date}`;
    savedAttendance.set(key, attendance.records);
    console.log('Frequência salva:', key, attendance.records);
  },

  // Atualizar registro de frequência individual
  async updateAttendance(
    recordId: string,
    status: AttendanceStatus,
    observation?: string,
  ): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    // Em uma implementação real, atualizaria o registro específico
    console.log('Atualizando registro:', recordId, status, observation);
  },
};

