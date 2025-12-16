// ============================================================================
// INTERFACES
// ============================================================================

export type ExpenseStatus = 'PAGO' | 'PENDENTE' | 'AGENDADO';
export type ExpenseCategory = 'UTILIDADES' | 'SUPRIMENTOS' | 'MANUTENÇÃO' | 'MARKETING' | 'OUTROS';

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

  // Initialize expenses if empty (mantém apenas despesas operacionais)
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

  // NÃO inicializa mais pagamentos de alunos fictícios
  // O dashboardFinanceService usa dados reais dos alunos cadastrados

  // NÃO inicializa mais folhas de pagamento fictícias
  // O dashboardFinanceService usa dados reais dos professores cadastrados

  // Initialize categories - always ensure correct list without SALÁRIOS
  const defaultCategories = ['UTILIDADES', 'SUPRIMENTOS', 'MANUTENÇÃO', 'MARKETING', 'OUTROS'];
  const categories = readFromStorage<string>(CATEGORIES_KEY);
  // Remove SALÁRIOS if it exists and ensure default categories are present
  const filteredCategories = categories.filter((cat) => cat !== 'SALÁRIOS');
  if (
    categories.length === 0 ||
    filteredCategories.length !== categories.length ||
    !defaultCategories.every((cat) => filteredCategories.includes(cat))
  ) {
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

  async revertToPending(id: string): Promise<Expense> {
    return this.update(id, {
      status: 'PENDENTE',
      paidAt: undefined,
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

  async revertToPending(id: string): Promise<StudentPayment> {
    const list = readFromStorage<StudentPayment>(PAYMENTS_KEY);
    const idx = list.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error('Pagamento não encontrado');

    const updated: StudentPayment = {
      ...list[idx],
      status: 'PENDENTE',
      paidAt: undefined,
      paymentMethod: undefined,
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

  async revertToPending(id: string): Promise<TeacherPayroll> {
    const list = readFromStorage<TeacherPayroll>(PAYROLLS_KEY);
    const idx = list.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error('Folha não encontrada');

    const updated: TeacherPayroll = {
      ...list[idx],
      status: 'PENDENTE',
      paidAt: undefined,
      paymentMethod: undefined,
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
// Integra dados reais de alunos e professores com despesas operacionais
// ============================================================================

// Importação dinâmica para evitar dependência circular
const loadDashboardFinanceService = async () => {
  const { dashboardFinanceService } = await import('./dashboardFinanceService');
  return dashboardFinanceService;
};

export const financeSummaryService = {
  async getSummary(month: string): Promise<FinanceSummary> {
    // Carrega o dashboardFinanceService dinamicamente
    const dashboardService = await loadDashboardFinanceService();

    // Obtém dados reais de alunos e professores
    const realFinanceData = await dashboardService.getFinanceSummary(month);

    // Obtém despesas operacionais
    const expenses = await expenseService.getByMonth(month);
    const paidExpenses = expenses.filter((e) => e.status === 'PAGO');
    const operationalExpenses = paidExpenses.reduce((sum, e) => sum + e.amount, 0);

    // Usa dados reais de mensalidades
    const realizedRevenue = realFinanceData.paidMonthlyFees;

    // Usa dados reais de pagamentos de professores
    const teacherPayments = realFinanceData.paidTeacherPayments;

    // Total de despesas = professores pagos + despesas operacionais
    const totalExpenses = teacherPayments + operationalExpenses;

    // Lucro líquido = receita realizada - total de despesas
    const netProfit = realizedRevenue - totalExpenses;

    // Inadimplência = mensalidades pendentes + atrasadas
    const defaultAmount = realFinanceData.pendingMonthlyFees + realFinanceData.overdueMonthlyFees;

    return Promise.resolve({
      realizedRevenue,
      expenses: totalExpenses,
      netProfit,
      defaultAmount,
      month,
    });
  },
};
