// ============================================================================
// INTERFACES
// ============================================================================

export type ExpenseStatus = 'PAGO' | 'PENDENTE' | 'AGENDADO';
export type ExpenseCategory =
  | 'UTILIDADES'
  | 'SUPRIMENTOS'
  | 'MANUTENÇÃO'
  | 'SALÁRIOS'
  | 'MARKETING'
  | 'OUTROS';

export type PaymentMethod = 'PIX' | 'DINHEIRO' | 'MISTO';

export interface Expense {
  id: string;
  description: string;
  category: ExpenseCategory;
  dueDate: string; // ISO date string
  amount: number;
  status: ExpenseStatus;
  paidAt?: string;
  createdAt: string;
}

export interface StudentPayment {
  id: string;
  studentId: string;
  studentName: string;
  enrollmentId: string;
  amount: number;
  dueDate: string;
  paidAt?: string;
  status: 'PENDENTE' | 'PAGO' | 'ATRASADO';
  paymentMethod?: PaymentMethod;
}

export interface TeacherPayroll {
  id: string;
  teacherId: string;
  teacherName: string;
  shift: string;
  activeStudents: number;
  totalContracts: number; // Total de contratos ativos
  participationRate: number; // Ex: 0.50 para 50%
  amountToPay: number;
  realizedRevenue: number; // Receita realizada (baixas)
  status: 'PENDENTE' | 'CONCLUIDO';
  paidAt?: string;
  paymentMethod?: PaymentMethod;
  month: string; // Ex: '2025-11'
}

export interface FinanceSummary {
  realizedRevenue: number; // Receita realizada (mensalidades pagas)
  expenses: number; // Despesas (Prof + Ops)
  netProfit: number; // Lucro líquido
  defaultAmount: number; // Inadimplência (A Receber)
  month: string;
}

// ============================================================================
// STORAGE KEYS
// ============================================================================

const EXPENSES_KEY = 'finance_expenses';
const PAYMENTS_KEY = 'finance_student_payments';
const PAYROLLS_KEY = 'finance_teacher_payrolls';
const CATEGORIES_KEY = 'finance_expense_categories';

// ============================================================================
// HELPERS
// ============================================================================

function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function readFromStorage<T>(key: string, defaultValue: T[] = []): T[] {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : defaultValue;
    return Array.isArray(parsed) ? parsed : defaultValue;
  } catch {
    return defaultValue;
  }
}

function writeToStorage<T>(key: string, data: T[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(data));
}

// ============================================================================
// MOCK DATA INITIALIZATION
// ============================================================================

function initializeMockData(): void {
  // Get current month for mock data
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  // Initialize expenses if empty
  const expenses = readFromStorage<Expense>(EXPENSES_KEY);
  if (expenses.length === 0) {
    const mockExpenses: Expense[] = [
      {
        id: generateId(),
        description: 'Conta de Energia (Enel)',
        category: 'UTILIDADES',
        dueDate: `${currentMonth}-05`,
        amount: 450,
        status: 'PAGO',
        paidAt: `${currentMonth}-05`,
        createdAt: new Date().toISOString(),
      },
      {
        id: generateId(),
        description: 'Internet Fibra',
        category: 'UTILIDADES',
        dueDate: `${currentMonth}-10`,
        amount: 120,
        status: 'PAGO',
        paidAt: `${currentMonth}-10`,
        createdAt: new Date().toISOString(),
      },
      {
        id: generateId(),
        description: 'Material de Limpeza',
        category: 'SUPRIMENTOS',
        dueDate: `${currentMonth}-12`,
        amount: 85.5,
        status: 'PENDENTE',
        createdAt: new Date().toISOString(),
      },
      {
        id: generateId(),
        description: 'Manutenção Ar Condicionado',
        category: 'MANUTENÇÃO',
        dueDate: `${currentMonth}-15`,
        amount: 250,
        status: 'AGENDADO',
        createdAt: new Date().toISOString(),
      },
    ];
    writeToStorage(EXPENSES_KEY, mockExpenses);
  }

  // Initialize student payments if empty
  const payments = readFromStorage<StudentPayment>(PAYMENTS_KEY);
  if (payments.length === 0) {
    const mockPayments: StudentPayment[] = [
      {
        id: generateId(),
        studentId: 'mock-1',
        studentName: 'João Pedro Silva',
        enrollmentId: 'enroll-1',
        amount: 350,
        dueDate: `${currentMonth}-10`,
        status: 'PAGO',
        paidAt: `${currentMonth}-08`,
        paymentMethod: 'PIX',
      },
      {
        id: generateId(),
        studentId: 'mock-2',
        studentName: 'Maria Clara Santos',
        enrollmentId: 'enroll-2',
        amount: 350,
        dueDate: `${currentMonth}-10`,
        status: 'PENDENTE',
      },
      {
        id: generateId(),
        studentId: 'mock-3',
        studentName: 'Lucas Oliveira',
        enrollmentId: 'enroll-3',
        amount: 400,
        dueDate: `${currentMonth}-10`,
        status: 'ATRASADO',
      },
      {
        id: generateId(),
        studentId: 'mock-4',
        studentName: 'Ana Beatriz Costa',
        enrollmentId: 'enroll-4',
        amount: 350,
        dueDate: `${currentMonth}-10`,
        status: 'PAGO',
        paidAt: `${currentMonth}-05`,
        paymentMethod: 'DINHEIRO',
      },
    ];
    writeToStorage(PAYMENTS_KEY, mockPayments);
  }

  // Initialize teacher payrolls if empty
  const payrolls = readFromStorage<TeacherPayroll>(PAYROLLS_KEY);
  if (payrolls.length === 0) {
    const mockPayrolls: TeacherPayroll[] = [
      {
        id: generateId(),
        teacherId: 'teacher-1',
        teacherName: 'Prof Carlos',
        shift: 'Manhã',
        activeStudents: 12,
        totalContracts: 3200,
        participationRate: 0.5,
        amountToPay: 1600,
        realizedRevenue: 3200,
        status: 'PENDENTE',
        month: currentMonth,
      },
      {
        id: generateId(),
        teacherId: 'teacher-2',
        teacherName: 'Profa. Ana',
        shift: 'Manhã',
        activeStudents: 12,
        totalContracts: 2000,
        participationRate: 0.5,
        amountToPay: 1000,
        realizedRevenue: 2000,
        status: 'CONCLUIDO',
        paidAt: `${currentMonth}-05`,
        paymentMethod: 'MISTO',
        month: currentMonth,
      },
    ];
    writeToStorage(PAYROLLS_KEY, mockPayrolls);
  }

  // Initialize categories if empty
  const categories = readFromStorage<string>(CATEGORIES_KEY);
  if (categories.length === 0) {
    const defaultCategories = [
      'UTILIDADES',
      'SUPRIMENTOS',
      'MANUTENÇÃO',
      'SALÁRIOS',
      'MARKETING',
      'OUTROS',
    ];
    writeToStorage(CATEGORIES_KEY, defaultCategories);
  }
}

// Initialize on module load
if (typeof window !== 'undefined') {
  initializeMockData();
}

// ============================================================================
// EXPENSE SERVICE
// ============================================================================

export const expenseService = {
  async getAll(): Promise<Expense[]> {
    return Promise.resolve(readFromStorage<Expense>(EXPENSES_KEY));
  },

  async getByMonth(month: string): Promise<Expense[]> {
    const expenses = readFromStorage<Expense>(EXPENSES_KEY);
    return Promise.resolve(expenses.filter((e) => e.dueDate.startsWith(month)));
  },

  async create(data: Omit<Expense, 'id' | 'createdAt'>): Promise<Expense> {
    const expense: Expense = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    const list = readFromStorage<Expense>(EXPENSES_KEY);
    list.unshift(expense);
    writeToStorage(EXPENSES_KEY, list);
    return Promise.resolve(expense);
  },

  async update(id: string, data: Partial<Expense>): Promise<Expense> {
    const list = readFromStorage<Expense>(EXPENSES_KEY);
    const idx = list.findIndex((e) => e.id === id);
    if (idx === -1) throw new Error('Despesa não encontrada');

    const updated: Expense = { ...list[idx], ...data, id };
    list[idx] = updated;
    writeToStorage(EXPENSES_KEY, list);
    return Promise.resolve(updated);
  },

  async delete(id: string): Promise<void> {
    const list = readFromStorage<Expense>(EXPENSES_KEY);
    const filtered = list.filter((e) => e.id !== id);
    writeToStorage(EXPENSES_KEY, filtered);
    return Promise.resolve();
  },

  async markAsPaid(id: string): Promise<Expense> {
    return this.update(id, {
      status: 'PAGO',
      paidAt: new Date().toISOString(),
    });
  },

  async getCategories(): Promise<string[]> {
    return Promise.resolve(readFromStorage<string>(CATEGORIES_KEY));
  },

  async addCategory(category: string): Promise<string[]> {
    const categories = readFromStorage<string>(CATEGORIES_KEY);
    if (!categories.includes(category.toUpperCase())) {
      categories.push(category.toUpperCase());
      writeToStorage(CATEGORIES_KEY, categories);
    }
    return Promise.resolve(categories);
  },
};

// ============================================================================
// STUDENT PAYMENT SERVICE
// ============================================================================

export const studentPaymentService = {
  async getAll(): Promise<StudentPayment[]> {
    return Promise.resolve(readFromStorage<StudentPayment>(PAYMENTS_KEY));
  },

  async getByMonth(month: string): Promise<StudentPayment[]> {
    const payments = readFromStorage<StudentPayment>(PAYMENTS_KEY);
    return Promise.resolve(payments.filter((p) => p.dueDate.startsWith(month)));
  },

  async getPending(): Promise<StudentPayment[]> {
    const payments = readFromStorage<StudentPayment>(PAYMENTS_KEY);
    return Promise.resolve(
      payments.filter((p) => p.status === 'PENDENTE' || p.status === 'ATRASADO'),
    );
  },

  async receivePayment(id: string, paymentMethod: PaymentMethod): Promise<StudentPayment> {
    const list = readFromStorage<StudentPayment>(PAYMENTS_KEY);
    const idx = list.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error('Pagamento não encontrado');

    const updated: StudentPayment = {
      ...list[idx],
      status: 'PAGO',
      paidAt: new Date().toISOString(),
      paymentMethod,
    };
    list[idx] = updated;
    writeToStorage(PAYMENTS_KEY, list);
    return Promise.resolve(updated);
  },

  async create(data: Omit<StudentPayment, 'id'>): Promise<StudentPayment> {
    const payment: StudentPayment = {
      ...data,
      id: generateId(),
    };
    const list = readFromStorage<StudentPayment>(PAYMENTS_KEY);
    list.unshift(payment);
    writeToStorage(PAYMENTS_KEY, list);
    return Promise.resolve(payment);
  },
};

// ============================================================================
// TEACHER PAYROLL SERVICE
// ============================================================================

export const teacherPayrollService = {
  async getAll(): Promise<TeacherPayroll[]> {
    return Promise.resolve(readFromStorage<TeacherPayroll>(PAYROLLS_KEY));
  },

  async getByMonth(month: string): Promise<TeacherPayroll[]> {
    const payrolls = readFromStorage<TeacherPayroll>(PAYROLLS_KEY);
    return Promise.resolve(payrolls.filter((p) => p.month === month));
  },

  async getPending(): Promise<TeacherPayroll[]> {
    const payrolls = readFromStorage<TeacherPayroll>(PAYROLLS_KEY);
    return Promise.resolve(payrolls.filter((p) => p.status === 'PENDENTE'));
  },

  async closePayroll(id: string, paymentMethod: PaymentMethod): Promise<TeacherPayroll> {
    const list = readFromStorage<TeacherPayroll>(PAYROLLS_KEY);
    const idx = list.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error('Folha não encontrada');

    const updated: TeacherPayroll = {
      ...list[idx],
      status: 'CONCLUIDO',
      paidAt: new Date().toISOString(),
      paymentMethod,
    };
    list[idx] = updated;
    writeToStorage(PAYROLLS_KEY, list);
    return Promise.resolve(updated);
  },

  async create(data: Omit<TeacherPayroll, 'id'>): Promise<TeacherPayroll> {
    const payroll: TeacherPayroll = {
      ...data,
      id: generateId(),
    };
    const list = readFromStorage<TeacherPayroll>(PAYROLLS_KEY);
    list.unshift(payroll);
    writeToStorage(PAYROLLS_KEY, list);
    return Promise.resolve(payroll);
  },
};

// ============================================================================
// FINANCE SUMMARY SERVICE
// ============================================================================

export const financeSummaryService = {
  async getSummary(month: string): Promise<FinanceSummary> {
    const payments = await studentPaymentService.getByMonth(month);
    const expenses = await expenseService.getByMonth(month);
    const payrolls = await teacherPayrollService.getByMonth(month);

    const paidPayments = payments.filter((p) => p.status === 'PAGO');
    const paidExpenses = expenses.filter((e) => e.status === 'PAGO');
    const paidPayrolls = payrolls.filter((p) => p.status === 'CONCLUIDO');

    const realizedRevenue = paidPayments.reduce((sum, p) => sum + p.amount, 0);
    const operationalExpenses = paidExpenses.reduce((sum, e) => sum + e.amount, 0);
    const teacherPayments = paidPayrolls.reduce((sum, p) => sum + p.amountToPay, 0);
    const totalExpenses = operationalExpenses + teacherPayments;
    const netProfit = realizedRevenue - totalExpenses;

    const pendingPayments = payments.filter(
      (p) => p.status === 'PENDENTE' || p.status === 'ATRASADO',
    );
    const defaultAmount = pendingPayments.reduce((sum, p) => sum + p.amount, 0);

    return Promise.resolve({
      realizedRevenue,
      expenses: totalExpenses,
      netProfit,
      defaultAmount,
      month,
    });
  },
};

