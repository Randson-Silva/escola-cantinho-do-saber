// ============================================================================
// SERVIÇO DE DADOS FINANCEIROS DO DASHBOARD
// Integra pricing, alunos e professores para exibição no dashboard
// ============================================================================

import { studentService, Student } from './studentService';
import { teacherService, Teacher } from './teacherService';
import { classService, Class } from './classService';
import {
  pricingService,
  calculateTeacherPayment,
  formatCurrency,
  TEACHER_PARTICIPATION_RATE,
} from './pricingService';

// ============================================================================
// INTERFACES
// ============================================================================

export interface TeacherPaymentSummary {
  teacherId: string;
  teacherName: string;
  totalStudents: number;
  totalRevenue: number; // Total das mensalidades dos alunos
  amountToPay: number; // 50% do total
  status: 'PENDENTE' | 'PAGO';
  paidAt?: string;
  paymentMethod?: PaymentMethod;
}

export interface MonthlyFeeSummary {
  studentId: string;
  studentName: string;
  className: string;
  teacherName: string;
  monthlyFee: number;
  status: 'PENDENTE' | 'PAGO' | 'ATRASADO';
  dueDate: string;
  paidAt?: string;
  paymentMethod?: PaymentMethod;
  overdueMonths?: string[]; // Lista de meses atrasados (formato YYYY-MM)
}

export interface DashboardFinanceSummary {
  // Mensalidades
  totalMonthlyFees: number; // Total de mensalidades a receber
  paidMonthlyFees: number; // Mensalidades pagas
  pendingMonthlyFees: number; // Mensalidades pendentes
  overdueMonthlyFees: number; // Mensalidades atrasadas

  // Professores
  totalTeacherPayments: number; // Total a pagar para professores
  paidTeacherPayments: number; // Pagamentos de professores concluídos
  pendingTeacherPayments: number; // Pagamentos de professores pendentes

  // Lucro
  netProfit: number; // Lucro líquido (mensalidades pagas - professores pagos)

  // Listas
  teacherPayments: TeacherPaymentSummary[];
  studentPayments: MonthlyFeeSummary[];
}

// ============================================================================
// STORAGE PARA PAGAMENTOS
// ============================================================================

const TEACHER_PAYMENTS_STATUS_KEY = 'dashboard_teacher_payments_status';
const STUDENT_PAYMENTS_STATUS_KEY = 'dashboard_student_payments_status';

export type PaymentMethod = 'PIX' | 'DINHEIRO' | 'MISTO';

interface PaymentStatus {
  id: string;
  status: 'PENDENTE' | 'PAGO' | 'ATRASADO';
  paidAt?: string;
  paymentMethod?: PaymentMethod;
}

function loadPaymentStatus(key: string): Map<string, PaymentStatus> {
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      const parsed = JSON.parse(stored);
      return new Map(Object.entries(parsed));
    }
  } catch {
    // ignore
  }
  return new Map();
}

function savePaymentStatus(key: string, status: Map<string, PaymentStatus>): void {
  const obj = Object.fromEntries(status);
  localStorage.setItem(key, JSON.stringify(obj));
}

// ============================================================================
// SERVIÇO
// ============================================================================

/**
 * Retorna a lista de meses atrasados para um aluno
 * A primeira mensalidade só é contada a partir do mês do primeiro cadastro
 */
function getOverdueMonthsForStudent(
  studentId: string,
  targetMonth: string,
  enrollmentDate?: string,
): string[] {
  // Se não tem data de matrícula, não verifica meses anteriores
  if (!enrollmentDate) {
    return [];
  }

  const overdueMonths: string[] = [];
  const [targetYear, targetMonthNum] = targetMonth.split('-').map(Number);

  // Determina o mês de início (mês da matrícula)
  const enrollmentDateObj = new Date(enrollmentDate);
  const enrollmentYear = enrollmentDateObj.getFullYear();
  const enrollmentMonthNum = enrollmentDateObj.getMonth() + 1;
  const enrollmentMonth = `${enrollmentYear}-${String(enrollmentMonthNum).padStart(2, '0')}`;

  // Se o mês alvo é anterior ou igual ao mês de matrícula, não há meses atrasados
  if (targetMonth <= enrollmentMonth) {
    return [];
  }

  // Percorre os meses desde a matrícula até o mês anterior ao alvo
  let currentDate = new Date(enrollmentYear, enrollmentMonthNum - 1, 1);
  const targetDate = new Date(targetYear, targetMonthNum - 1, 1);

  while (currentDate < targetDate) {
    const monthStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;

    // Carrega status de pagamento para este mês
    const status = loadPaymentStatus(`${STUDENT_PAYMENTS_STATUS_KEY}_${monthStr}`);
    const paymentInfo = status.get(studentId);

    // Se não tem pagamento ou status não é PAGO, está atrasado
    if (!paymentInfo || paymentInfo.status !== 'PAGO') {
      overdueMonths.push(monthStr);
    }

    // Avança para o próximo mês
    currentDate.setMonth(currentDate.getMonth() + 1);
  }

  return overdueMonths; // Já está ordenado do mais antigo para o mais recente
}

export const dashboardFinanceService = {
  /**
   * Obtém o resumo financeiro para o dashboard
   * @param month Mês no formato YYYY-MM (opcional, padrão: mês atual)
   */
  async getFinanceSummary(month?: string): Promise<DashboardFinanceSummary> {
    // Define o mês a ser consultado
    const targetMonth = month || this.getCurrentMonth();

    // Carrega dados
    const [students, teachers, classes] = await Promise.all([
      studentService.getAll(),
      teacherService.getAll(),
      classService.getAll(),
    ]);

    // Filtra apenas alunos ativos
    const activeStudents = students.filter((s) => s.status === 'active');

    // Filtra alunos que já estavam matriculados no mês alvo
    // A mensalidade só conta a partir do mês de cadastro
    const enrolledStudentsForMonth = activeStudents.filter((student) => {
      if (!student.enrollmentDate) {
        return true; // Se não tem data de matrícula, considera como matriculado
      }
      const enrollmentDate = new Date(student.enrollmentDate);
      const enrollmentMonth = `${enrollmentDate.getFullYear()}-${String(enrollmentDate.getMonth() + 1).padStart(2, '0')}`;
      // Aluno aparece se o mês de matrícula for igual ou anterior ao mês alvo
      return enrollmentMonth <= targetMonth;
    });

    // Carrega status de pagamentos para o mês específico
    const teacherPaymentStatus = loadPaymentStatus(`${TEACHER_PAYMENTS_STATUS_KEY}_${targetMonth}`);
    const studentPaymentStatus = loadPaymentStatus(`${STUDENT_PAYMENTS_STATUS_KEY}_${targetMonth}`);

    // Verifica se é mês futuro
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const isFutureMonth = targetMonth > currentMonth;
    const isPastMonth = targetMonth < currentMonth;

    // Calcula mensalidades dos alunos (apenas os matriculados no mês)
    const studentPayments: MonthlyFeeSummary[] = enrolledStudentsForMonth.map((student) => {
      const cls = classes.find((c) => c.id === student.class || c.name === student.class);
      const teacher = teachers.find((t) => t.id === student.teacher || t.nome === student.teacher);

      // Verifica status do pagamento
      const paymentInfo = studentPaymentStatus.get(student.id);
      let status: 'PENDENTE' | 'PAGO' | 'ATRASADO' = paymentInfo?.status || 'PENDENTE';

      // Se não tem status definido e é mês passado, marca como atrasado
      // Se é mês futuro, mantém como pendente
      if (!paymentInfo && !isFutureMonth) {
        const today = new Date();
        if (isPastMonth || today.getDate() > 10) {
          status = 'ATRASADO';
        }
      }

      // Obtém lista de meses atrasados do aluno (a partir da data de matrícula)
      const overdueMonths = getOverdueMonthsForStudent(
        student.id,
        targetMonth,
        student.enrollmentDate,
      );

      return {
        studentId: student.id,
        studentName: student.name,
        className: cls?.name || student.class || 'Sem turma',
        teacherName: teacher?.nome || student.teacher || 'Sem professor',
        monthlyFee: student.monthlyFee || 0,
        status,
        dueDate: this.getMonthDueDate(targetMonth),
        paidAt: paymentInfo?.paidAt,
        paymentMethod: paymentInfo?.paymentMethod,
        overdueMonths: overdueMonths.length > 0 ? overdueMonths : undefined,
      };
    });

    // Agrupa alunos por professor e calcula pagamentos (apenas os matriculados no mês)
    const teacherStudentMap = new Map<string, { teacher: Teacher; students: Student[] }>();

    for (const student of enrolledStudentsForMonth) {
      // Encontra o professor do aluno (por turma ou direto)
      const cls = classes.find((c) => c.id === student.class || c.name === student.class);
      const teacherId = cls?.teacherId || student.teacher;
      const teacher = teachers.find((t) => t.id === teacherId || t.nome === teacherId);

      if (teacher) {
        const existing = teacherStudentMap.get(teacher.id);
        if (existing) {
          existing.students.push(student);
        } else {
          teacherStudentMap.set(teacher.id, { teacher, students: [student] });
        }
      }
    }

    // Cria resumo de pagamentos de professores
    const teacherPayments: TeacherPaymentSummary[] = [];

    teacherStudentMap.forEach(({ teacher, students: teacherStudents }) => {
      const totalRevenue = teacherStudents.reduce((sum, s) => sum + (s.monthlyFee || 0), 0);
      const amountToPay = Math.round(totalRevenue * TEACHER_PARTICIPATION_RATE);

      const paymentInfo = teacherPaymentStatus.get(teacher.id);

      teacherPayments.push({
        teacherId: teacher.id,
        teacherName: teacher.nome,
        totalStudents: teacherStudents.length,
        totalRevenue,
        amountToPay,
        status: paymentInfo?.status === 'PAGO' ? 'PAGO' : 'PENDENTE',
        paidAt: paymentInfo?.paidAt,
        paymentMethod: paymentInfo?.paymentMethod,
      });
    });

    // Calcula totais
    const totalMonthlyFees = studentPayments.reduce((sum, p) => sum + p.monthlyFee, 0);
    const paidMonthlyFees = studentPayments
      .filter((p) => p.status === 'PAGO')
      .reduce((sum, p) => sum + p.monthlyFee, 0);
    const pendingMonthlyFees = studentPayments
      .filter((p) => p.status === 'PENDENTE')
      .reduce((sum, p) => sum + p.monthlyFee, 0);
    const overdueMonthlyFees = studentPayments
      .filter((p) => p.status === 'ATRASADO')
      .reduce((sum, p) => sum + p.monthlyFee, 0);

    const totalTeacherPayments = teacherPayments.reduce((sum, p) => sum + p.amountToPay, 0);
    const paidTeacherPayments = teacherPayments
      .filter((p) => p.status === 'PAGO')
      .reduce((sum, p) => sum + p.amountToPay, 0);
    const pendingTeacherPayments = teacherPayments
      .filter((p) => p.status === 'PENDENTE')
      .reduce((sum, p) => sum + p.amountToPay, 0);

    const netProfit = paidMonthlyFees - paidTeacherPayments;

    return {
      totalMonthlyFees,
      paidMonthlyFees,
      pendingMonthlyFees,
      overdueMonthlyFees,
      totalTeacherPayments,
      paidTeacherPayments,
      pendingTeacherPayments,
      netProfit,
      teacherPayments,
      studentPayments,
    };
  },

  /**
   * Marca pagamento de aluno como pago
   * @param studentId ID do aluno
   * @param month Mês no formato YYYY-MM (opcional, padrão: mês atual)
   * @param paymentMethod Forma de pagamento (opcional)
   */
  async markStudentPaymentAsPaid(
    studentId: string,
    month?: string,
    paymentMethod?: PaymentMethod,
  ): Promise<void> {
    const targetMonth = month || this.getCurrentMonth();
    const status = loadPaymentStatus(`${STUDENT_PAYMENTS_STATUS_KEY}_${targetMonth}`);
    status.set(studentId, {
      id: studentId,
      status: 'PAGO',
      paidAt: new Date().toISOString(),
      paymentMethod,
    });
    savePaymentStatus(`${STUDENT_PAYMENTS_STATUS_KEY}_${targetMonth}`, status);
  },

  /**
   * Marca pagamento de aluno como pendente
   * @param studentId ID do aluno
   * @param month Mês no formato YYYY-MM (opcional, padrão: mês atual)
   */
  async markStudentPaymentAsPending(studentId: string, month?: string): Promise<void> {
    const targetMonth = month || this.getCurrentMonth();
    const status = loadPaymentStatus(`${STUDENT_PAYMENTS_STATUS_KEY}_${targetMonth}`);
    status.set(studentId, {
      id: studentId,
      status: 'PENDENTE',
      paymentMethod: undefined,
    });
    savePaymentStatus(`${STUDENT_PAYMENTS_STATUS_KEY}_${targetMonth}`, status);
  },

  /**
   * Marca pagamento de professor como pago
   * @param teacherId ID do professor
   * @param month Mês no formato YYYY-MM (opcional, padrão: mês atual)
   * @param paymentMethod Forma de pagamento (opcional)
   */
  async markTeacherPaymentAsPaid(
    teacherId: string,
    month?: string,
    paymentMethod?: PaymentMethod,
  ): Promise<void> {
    const targetMonth = month || this.getCurrentMonth();
    const status = loadPaymentStatus(`${TEACHER_PAYMENTS_STATUS_KEY}_${targetMonth}`);
    status.set(teacherId, {
      id: teacherId,
      status: 'PAGO',
      paidAt: new Date().toISOString(),
      paymentMethod,
    });
    savePaymentStatus(`${TEACHER_PAYMENTS_STATUS_KEY}_${targetMonth}`, status);
  },

  /**
   * Marca pagamento de professor como pendente
   * @param teacherId ID do professor
   * @param month Mês no formato YYYY-MM (opcional, padrão: mês atual)
   */
  async markTeacherPaymentAsPending(teacherId: string, month?: string): Promise<void> {
    const targetMonth = month || this.getCurrentMonth();
    const status = loadPaymentStatus(`${TEACHER_PAYMENTS_STATUS_KEY}_${targetMonth}`);
    status.set(teacherId, {
      id: teacherId,
      status: 'PENDENTE',
      paymentMethod: undefined,
    });
    savePaymentStatus(`${TEACHER_PAYMENTS_STATUS_KEY}_${targetMonth}`, status);
  },

  /**
   * Reseta todos os pagamentos para o novo mês
   */
  async resetMonthlyPayments(): Promise<void> {
    localStorage.removeItem(TEACHER_PAYMENTS_STATUS_KEY);
    localStorage.removeItem(STUDENT_PAYMENTS_STATUS_KEY);
  },

  /**
   * Retorna a data de vencimento do mês atual (dia 10)
   */
  getCurrentMonthDueDate(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}-10`;
  },

  /**
   * Retorna a data de vencimento de um mês específico (dia 10)
   * @param month Mês no formato YYYY-MM
   */
  getMonthDueDate(month: string): string {
    return `${month}-10`;
  },

  /**
   * Retorna o mês atual no formato YYYY-MM
   */
  getCurrentMonth(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  },

  /**
   * Formata valor em reais
   */
  formatCurrency,

  /**
   * Limpa dados mock antigos do localStorage
   * Deve ser chamado uma vez para limpar dados fictícios
   */
  clearMockData(): void {
    // Remove pagamentos de alunos e professores fictícios do financeService
    localStorage.removeItem('finance_student_payments');
    localStorage.removeItem('finance_teacher_payrolls');
    console.log('[dashboardFinanceService] Dados mock antigos removidos');
  },
};

// Limpa dados mock antigos automaticamente na primeira carga
if (typeof window !== 'undefined') {
  const cleanupKey = 'dashboard_finance_mock_cleaned_v2';
  if (!localStorage.getItem(cleanupKey)) {
    localStorage.removeItem('finance_student_payments');
    localStorage.removeItem('finance_teacher_payrolls');
    localStorage.setItem(cleanupKey, 'true');
    console.log('[dashboardFinanceService] Dados mock antigos limpos automaticamente');
  }
}

