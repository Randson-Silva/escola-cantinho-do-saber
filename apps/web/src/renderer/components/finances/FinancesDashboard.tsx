import { useState, useEffect, useMemo } from 'react';
import { useToast } from '../../hooks/useToast';
import {
  expenseService,
  studentPaymentService,
  teacherPayrollService,
  financeSummaryService,
  type Expense,
  type StudentPayment,
  type TeacherPayroll,
  type FinanceSummary,
  type ExpenseCategory,
  type PaymentMethod,
} from '../../services/financeService';
import {
  dashboardFinanceService,
  type DashboardFinanceSummary,
  type MonthlyFeeSummary,
  type TeacherPaymentSummary,
  type PaymentMethod as DashboardPaymentMethod,
} from '../../services/dashboardFinanceService';
import styles from './finances.module.css';

// ============================================
// UTILITY FUNCTIONS
// ============================================

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('pt-BR');
}

function getMonthName(month: string): string {
  const [year, monthNum] = month.split('-');
  const date = new Date(Number(year), Number(monthNum) - 1);
  return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
}

function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

// Formata lista de meses atrasados para exibição
function formatOverdueMonths(months: string[]): string {
  if (!months || months.length === 0) return '';

  return months
    .map((m) => {
      const [year, month] = m.split('-');
      const date = new Date(Number(year), Number(month) - 1);
      return date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
    })
    .join(', ');
}

// Gera lista de meses (6 meses anteriores + mês atual + 6 meses futuros)
function generateMonthOptions(): { value: string; label: string }[] {
  const options: { value: string; label: string }[] = [];
  const now = new Date();

  for (let i = -6; i <= 6; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const label = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    options.push({ value, label: label.charAt(0).toUpperCase() + label.slice(1) });
  }

  return options;
}

// ============================================
// TYPES
// ============================================

type TabType = 'despesas' | 'mensalidades' | 'folha';
type ModalType =
  | 'expense'
  | 'payment'
  | 'payroll'
  | 'editExpense'
  | 'confirmRevert'
  | 'confirmDelete'
  | 'realStudentPayment'
  | 'realTeacherPayment'
  | null;

interface ModalData {
  type: ModalType;
  data?:
    | StudentPayment
    | TeacherPayroll
    | Expense
    | MonthlyFeeSummary
    | TeacherPaymentSummary
    | null;
}

interface RevertAction {
  type: 'expense' | 'payment' | 'payroll' | 'realStudent' | 'realTeacher';
  id: string;
  description: string;
}

interface DeleteAction {
  id: string;
  description: string;
}

// ============================================
// MAIN COMPONENT
// ============================================

export function FinancesDashboard() {
  const { addToast } = useToast();

  // State
  const [currentMonth, setCurrentMonth] = useState(getCurrentMonth());
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [activeTab, setActiveTab] = useState<TabType>('despesas');
  const [isLoading, setIsLoading] = useState(true);
  const monthOptions = useMemo(() => generateMonthOptions(), []);

  // Data states
  const [summary, setSummary] = useState<FinanceSummary | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [payments, setPayments] = useState<StudentPayment[]>([]);
  const [payrolls, setPayrolls] = useState<TeacherPayroll[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  // Dados reais de alunos e professores
  const [realFinanceSummary, setRealFinanceSummary] = useState<DashboardFinanceSummary | null>(
    null,
  );
  const [realStudentPayments, setRealStudentPayments] = useState<MonthlyFeeSummary[]>([]);
  const [realTeacherPayments, setRealTeacherPayments] = useState<TeacherPaymentSummary[]>([]);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal states
  const [modal, setModal] = useState<ModalData>({ type: null });
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [revertAction, setRevertAction] = useState<RevertAction | null>(null);
  const [deleteAction, setDeleteAction] = useState<DeleteAction | null>(null);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);

  // Expense form state
  const [expenseForm, setExpenseForm] = useState({
    description: '',
    category: '' as ExpenseCategory | '',
    dueDate: '',
    amount: '',
  });

  // Expanded payroll cards
  const [expandedPayrolls, setExpandedPayrolls] = useState<Set<string>>(new Set());

  // ============================================
  // LOAD DATA
  // ============================================

  useEffect(() => {
    loadData();
  }, [currentMonth, selectedMonth]);

  const loadData = async () => {
    // Usa selectedMonth se disponível, senão currentMonth
    const targetMonth = selectedMonth || currentMonth;

    setIsLoading(true);
    try {
      const [
        summaryData,
        expensesData,
        paymentsData,
        payrollsData,
        categoriesData,
        realFinanceData,
      ] = await Promise.all([
        financeSummaryService.getSummary(targetMonth),
        expenseService.getByMonth(targetMonth),
        studentPaymentService.getByMonth(targetMonth),
        teacherPayrollService.getByMonth(targetMonth),
        expenseService.getCategories(),
        dashboardFinanceService.getFinanceSummary(targetMonth),
      ]);

      setSummary(summaryData);
      setExpenses(expensesData);
      setPayments(paymentsData);
      setPayrolls(payrollsData);
      setCategories(categoriesData);

      // Dados reais de alunos e professores
      setRealFinanceSummary(realFinanceData);
      setRealStudentPayments(realFinanceData.studentPayments);
      setRealTeacherPayments(realFinanceData.teacherPayments);
    } catch (error) {
      addToast('Erro ao carregar dados financeiros', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================
  // HANDLERS PARA DADOS REAIS
  // ============================================

  const getTargetMonth = () => selectedMonth || currentMonth;

  // Abre modal para receber mensalidade de aluno
  const handleOpenRealStudentPaymentModal = (payment: MonthlyFeeSummary) => {
    setSelectedPaymentMethod(null);
    setModal({ type: 'realStudentPayment', data: payment });
  };

  // Confirma recebimento de mensalidade de aluno
  const handleConfirmRealStudentPayment = async () => {
    if (!modal.data || !selectedPaymentMethod) {
      addToast('Selecione a forma de pagamento', 'error');
      return;
    }

    try {
      const payment = modal.data as MonthlyFeeSummary;
      await dashboardFinanceService.markStudentPaymentAsPaid(
        payment.studentId,
        getTargetMonth(),
        selectedPaymentMethod as DashboardPaymentMethod,
      );
      addToast('Mensalidade recebida com sucesso!', 'success');
      setModal({ type: null });
      loadData();
    } catch (error) {
      addToast('Erro ao receber mensalidade', 'error');
    }
  };

  const handleMarkRealStudentPending = async (studentId: string) => {
    try {
      await dashboardFinanceService.markStudentPaymentAsPending(studentId, getTargetMonth());
      addToast('Pagamento revertido para pendente!', 'success');
      loadData();
    } catch (error) {
      addToast('Erro ao reverter pagamento', 'error');
    }
  };

  // Abre modal para pagar professor
  const handleOpenRealTeacherPaymentModal = (payment: TeacherPaymentSummary) => {
    setSelectedPaymentMethod(null);
    setModal({ type: 'realTeacherPayment', data: payment });
  };

  // Confirma pagamento de professor
  const handleConfirmRealTeacherPayment = async () => {
    if (!modal.data || !selectedPaymentMethod) {
      addToast('Selecione a forma de pagamento', 'error');
      return;
    }

    try {
      const payment = modal.data as TeacherPaymentSummary;
      await dashboardFinanceService.markTeacherPaymentAsPaid(
        payment.teacherId,
        getTargetMonth(),
        selectedPaymentMethod as DashboardPaymentMethod,
      );
      addToast('Pagamento do professor realizado com sucesso!', 'success');
      setModal({ type: null });
      loadData();
    } catch (error) {
      addToast('Erro ao pagar professor', 'error');
    }
  };

  const handleMarkRealTeacherPending = async (teacherId: string) => {
    try {
      await dashboardFinanceService.markTeacherPaymentAsPending(teacherId, getTargetMonth());
      addToast('Folha revertida para pendente!', 'success');
      loadData();
    } catch (error) {
      addToast('Erro ao reverter folha', 'error');
    }
  };

  // ============================================
  // FILTERED DATA
  // ============================================

  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !categoryFilter || expense.category === categoryFilter;
      const matchesStatus = !statusFilter || expense.status === statusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [expenses, searchTerm, categoryFilter, statusFilter]);

  const expensesTotals = useMemo(() => {
    const paid = filteredExpenses
      .filter((e) => e.status === 'PAGO')
      .reduce((sum, e) => sum + e.amount, 0);
    const pending = filteredExpenses
      .filter((e) => e.status !== 'PAGO')
      .reduce((sum, e) => sum + e.amount, 0);
    return { paid, pending };
  }, [filteredExpenses]);

  // ============================================
  // HANDLERS
  // ============================================

  const handleOpenExpenseModal = () => {
    setEditingExpenseId(null);
    setExpenseForm({ description: '', category: '', dueDate: '', amount: '' });
    setModal({ type: 'expense' });
  };

  const handleOpenEditExpenseModal = (expense: Expense) => {
    setEditingExpenseId(expense.id);
    setExpenseForm({
      description: expense.description,
      category: expense.category,
      dueDate: expense.dueDate,
      amount: expense.amount.toString().replace('.', ','),
    });
    setModal({ type: 'editExpense', data: expense });
  };

  const handleSaveExpense = async () => {
    if (
      !expenseForm.description ||
      !expenseForm.category ||
      !expenseForm.dueDate ||
      !expenseForm.amount
    ) {
      addToast('Preencha todos os campos', 'error');
      return;
    }

    try {
      if (editingExpenseId) {
        await expenseService.update(editingExpenseId, {
          description: expenseForm.description,
          category: expenseForm.category as ExpenseCategory,
          dueDate: expenseForm.dueDate,
          amount: parseFloat(expenseForm.amount.replace(',', '.')),
        });
        addToast('Despesa atualizada com sucesso!', 'success');
      } else {
        await expenseService.create({
          description: expenseForm.description,
          category: expenseForm.category as ExpenseCategory,
          dueDate: expenseForm.dueDate,
          amount: parseFloat(expenseForm.amount.replace(',', '.')),
          status: 'PENDENTE',
        });
        addToast('Despesa cadastrada com sucesso!', 'success');
      }
      setModal({ type: null });
      setEditingExpenseId(null);
      loadData();
    } catch (error) {
      addToast('Erro ao salvar despesa', 'error');
    }
  };

  const handleCreateExpense = async () => {
    if (
      !expenseForm.description ||
      !expenseForm.category ||
      !expenseForm.dueDate ||
      !expenseForm.amount
    ) {
      addToast('Preencha todos os campos', 'error');
      return;
    }

    try {
      await expenseService.create({
        description: expenseForm.description,
        category: expenseForm.category as ExpenseCategory,
        dueDate: expenseForm.dueDate,
        amount: parseFloat(expenseForm.amount.replace(',', '.')),
        status: 'PENDENTE',
      });
      addToast('Despesa cadastrada com sucesso!', 'success');
      setModal({ type: null });
      loadData();
    } catch (error) {
      addToast('Erro ao cadastrar despesa', 'error');
    }
  };

  const handleOpenDeleteModal = (id: string, description: string) => {
    setDeleteAction({ id, description });
    setModal({ type: 'confirmDelete' });
  };

  const handleConfirmDelete = async () => {
    if (!deleteAction) return;

    try {
      await expenseService.delete(deleteAction.id);
      addToast('Despesa excluída com sucesso!', 'success');
      setModal({ type: null });
      setDeleteAction(null);
      loadData();
    } catch (error) {
      addToast('Erro ao excluir despesa', 'error');
    }
  };

  const handleCancelDelete = () => {
    setModal({ type: null });
    setDeleteAction(null);
  };

  const handleMarkExpenseAsPaid = async (id: string) => {
    try {
      await expenseService.markAsPaid(id);
      addToast('Despesa marcada como paga!', 'success');
      loadData();
    } catch (error) {
      addToast('Erro ao atualizar despesa', 'error');
    }
  };

  const handleOpenRevertModal = (
    type: 'expense' | 'payment' | 'payroll' | 'realStudent' | 'realTeacher',
    id: string,
    description: string,
  ) => {
    setRevertAction({ type, id, description });
    setModal({ type: 'confirmRevert' });
  };

  const handleConfirmRevert = async () => {
    if (!revertAction) return;

    try {
      switch (revertAction.type) {
        case 'expense':
          await expenseService.revertToPending(revertAction.id);
          addToast('Despesa revertida para pendente!', 'success');
          break;
        case 'payment':
          await studentPaymentService.revertToPending(revertAction.id);
          addToast('Pagamento revertido para pendente!', 'success');
          break;
        case 'payroll':
          await teacherPayrollService.revertToPending(revertAction.id);
          addToast('Folha revertida para pendente!', 'success');
          break;
        case 'realStudent':
          await dashboardFinanceService.markStudentPaymentAsPending(
            revertAction.id,
            getTargetMonth(),
          );
          addToast('Mensalidade revertida para pendente!', 'success');
          break;
        case 'realTeacher':
          await dashboardFinanceService.markTeacherPaymentAsPending(
            revertAction.id,
            getTargetMonth(),
          );
          addToast('Pagamento do professor revertido para pendente!', 'success');
          break;
      }
      setModal({ type: null });
      setRevertAction(null);
      loadData();
    } catch (error) {
      addToast('Erro ao reverter', 'error');
    }
  };

  const handleCancelRevert = () => {
    setModal({ type: null });
    setRevertAction(null);
  };

  const handleOpenPaymentModal = (payment: StudentPayment) => {
    setSelectedPaymentMethod(null);
    setModal({ type: 'payment', data: payment });
  };

  const handleReceivePayment = async () => {
    if (!modal.data || !selectedPaymentMethod) {
      addToast('Selecione a forma de pagamento', 'error');
      return;
    }

    try {
      await studentPaymentService.receivePayment(modal.data.id, selectedPaymentMethod);
      addToast('Pagamento recebido com sucesso!', 'success');
      setModal({ type: null });
      loadData();
    } catch (error) {
      addToast('Erro ao receber pagamento', 'error');
    }
  };

  const handleOpenPayrollModal = (payroll: TeacherPayroll) => {
    setSelectedPaymentMethod(null);
    setModal({ type: 'payroll', data: payroll });
  };

  const handleClosePayroll = async () => {
    if (!modal.data || !selectedPaymentMethod) {
      addToast('Selecione a forma de pagamento', 'error');
      return;
    }

    try {
      await teacherPayrollService.closePayroll(modal.data.id, selectedPaymentMethod);
      addToast('Folha fechada com sucesso!', 'success');
      setModal({ type: null });
      loadData();
    } catch (error) {
      addToast('Erro ao fechar folha', 'error');
    }
  };

  const togglePayrollExpanded = (id: string) => {
    setExpandedPayrolls((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'expense':
        handleOpenExpenseModal();
        break;
      case 'payment':
        setActiveTab('mensalidades');
        break;
      case 'payroll':
        setActiveTab('folha');
        break;
      case 'student':
        // Could navigate to students page
        break;
    }
  };

  // ============================================
  // RENDER HELPERS
  // ============================================

  const getCategoryClass = (category: string): string => {
    const map: Record<string, string> = {
      UTILIDADES: styles.utilidades,
      SUPRIMENTOS: styles.suprimentos,
      MANUTENÇÃO: styles.manutencao,
    };
    return map[category] || '';
  };

  const getStatusClass = (status: string): string => {
    const map: Record<string, string> = {
      PAGO: styles.pago,
      PENDENTE: styles.pendente,
      AGENDADO: styles.agendado,
      ATRASADO: styles.atrasado,
      CONCLUIDO: styles.concluido,
    };
    return map[status] || '';
  };

  const getPaymentMethodLabel = (method: PaymentMethod): string => {
    const map: Record<PaymentMethod, string> = {
      PIX: 'PIX',
      DINHEIRO: 'Dinheiro',
      MISTO: 'Misto (PIX + Dinheiro)',
    };
    return map[method];
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1>Gestão Financeira</h1>
          <p>Controle de receitas, despesas e pagamentos</p>
        </div>
        <div className={styles.monthSelector}>
          <span>📅</span>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #e0e0e0',
              backgroundColor: '#fff',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              textTransform: 'capitalize',
              minWidth: '180px',
            }}
          >
            {monthOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className={styles.summaryGrid}>
        <div className={styles.summaryCard}>
          <div className={styles.summaryCardHeader}>
            <div className={`${styles.summaryIcon} ${styles.income}`}>📈</div>
            <span className={`${styles.summaryBadge} ${styles.income}`}>↗ Entradas</span>
          </div>
          <p className={styles.summaryLabel}>Receita realizada</p>
          <p className={styles.summaryValue}>
            {isLoading ? '...' : formatCurrency(summary?.realizedRevenue || 0)}
          </p>
        </div>

        <div className={styles.summaryCard}>
          <div className={styles.summaryCardHeader}>
            <div className={`${styles.summaryIcon} ${styles.expense}`}>📉</div>
            <span className={`${styles.summaryBadge} ${styles.expense}`}>↘ Saídas</span>
          </div>
          <p className={styles.summaryLabel}>Despesas (Prof + Ops)</p>
          <p className={styles.summaryValue}>
            {isLoading ? '...' : formatCurrency(summary?.expenses || 0)}
          </p>
        </div>

        <div className={`${styles.summaryCard}`}>
          <div className={styles.summaryCardHeader}>
            <div className={`${styles.summaryIcon} ${styles.profit}`}>💰</div>
          </div>
          <p className={styles.summaryLabel}>Lucro líquido</p>
          <p className={styles.summaryValue}>
            {isLoading ? '...' : formatCurrency(summary?.netProfit || 0)}
          </p>
        </div>

        <div className={styles.summaryCard}>
          <div className={styles.summaryCardHeader}>
            <div className={`${styles.summaryIcon} ${styles.default}`}>⏰</div>
          </div>
          <p className={styles.summaryLabel}>Inadimplência (A Receber)</p>
          <p className={styles.summaryValue}>
            {isLoading ? '...' : formatCurrency(summary?.defaultAmount || 0)}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className={styles.actionsGrid}>
        <div className={styles.actionCard} onClick={() => handleQuickAction('expense')}>
          <div className={`${styles.actionIcon} ${styles.add}`}>➕</div>
          <div className={styles.actionContent}>
            <h3>Nova Despesa</h3>
            <p>Registrar conta...</p>
          </div>
        </div>

        <div className={styles.actionCard} onClick={() => handleQuickAction('payment')}>
          <div className={`${styles.actionIcon} ${styles.receive}`}>💵</div>
          <div className={styles.actionContent}>
            <h3>Receber Mensalidade</h3>
            <p>Ir para as Contas e Receber</p>
          </div>
        </div>

        <div className={styles.actionCard} onClick={() => handleQuickAction('payroll')}>
          <div className={`${styles.actionIcon} ${styles.payroll}`}>👥</div>
          <div className={styles.actionContent}>
            <h3>Fechar Folha</h3>
            <p>Pagar Professores</p>
          </div>
        </div>

        <div className={styles.actionCard} onClick={() => handleQuickAction('student')}>
          <div className={`${styles.actionIcon} ${styles.search}`}>🔍</div>
          <div className={styles.actionContent}>
            <h3>Consultar Aluno</h3>
            <p>Ver histórico / perfil</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabsContainer}>
        <div className={styles.tabsNav}>
          <button
            className={`${styles.tabButton} ${activeTab === 'despesas' ? styles.active : ''}`}
            onClick={() => setActiveTab('despesas')}
          >
            💸 Despesas Operacionais
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === 'mensalidades' ? styles.active : ''}`}
            onClick={() => setActiveTab('mensalidades')}
          >
            💳 Mensalidades
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === 'folha' ? styles.active : ''}`}
            onClick={() => setActiveTab('folha')}
          >
            👨‍🏫 Folha de Professores
          </button>
        </div>

        <div className={styles.tabContent}>
          {/* Despesas Tab */}
          {activeTab === 'despesas' && (
            <>
              <div className={styles.tableHeader}>
                <div className={styles.searchInput}>
                  <span>🔍</span>
                  <input
                    type="text"
                    placeholder="Buscar despesa..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className={styles.filterGroup}>
                  <select
                    className={styles.filterSelect}
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                  >
                    <option value="">Todas Categorias</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  <select
                    className={styles.filterSelect}
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="">Todos os Status</option>
                    <option value="PAGO">Pago</option>
                    <option value="PENDENTE">Pendente</option>
                    <option value="AGENDADO">Agendado</option>
                  </select>
                </div>
                <button className={styles.addButton} onClick={handleOpenExpenseModal}>
                  + Nova Despesa
                </button>
              </div>

              {isLoading ? (
                <div className={styles.loadingState}>Carregando...</div>
              ) : filteredExpenses.length === 0 ? (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>📋</div>
                  <h3>Nenhuma despesa encontrada</h3>
                  <p>Cadastre uma nova despesa para começar</p>
                </div>
              ) : (
                <>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Descrição</th>
                        <th>Categoria</th>
                        <th>Vencimento</th>
                        <th>Valor</th>
                        <th>Status</th>
                        <th style={{ textAlign: 'right' }}>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredExpenses.map((expense) => (
                        <tr key={expense.id}>
                          <td>
                            <div className={styles.descriptionCell}>
                              <div className={styles.descriptionIcon}>📄</div>
                              {expense.description}
                            </div>
                          </td>
                          <td>
                            <span
                              className={`${styles.categoryBadge} ${getCategoryClass(expense.category)}`}
                            >
                              {expense.category}
                            </span>
                          </td>
                          <td>📅 {formatDate(expense.dueDate)}</td>
                          <td className={styles.amountNegative}>
                            -{formatCurrency(expense.amount)}
                          </td>
                          <td>
                            <span
                              className={`${styles.statusBadge} ${getStatusClass(expense.status)}`}
                            >
                              {expense.status === 'PAGO' && '✓'} {expense.status}
                            </span>
                          </td>
                          <td>
                            <div className={styles.actionButtons}>
                              {expense.status !== 'PAGO' ? (
                                <button
                                  className={styles.iconButton}
                                  onClick={() => handleMarkExpenseAsPaid(expense.id)}
                                  title="Marcar como pago"
                                >
                                  ✓
                                </button>
                              ) : (
                                <button
                                  className={`${styles.iconButton} ${styles.revert}`}
                                  onClick={() =>
                                    handleOpenRevertModal(
                                      'expense',
                                      expense.id,
                                      expense.description,
                                    )
                                  }
                                  title="Reverter para pendente"
                                >
                                  ↩️
                                </button>
                              )}
                              <button
                                className={styles.iconButton}
                                onClick={() => handleOpenEditExpenseModal(expense)}
                                title="Editar"
                              >
                                ✏️
                              </button>
                              <button
                                className={`${styles.iconButton} ${styles.delete}`}
                                onClick={() =>
                                  handleOpenDeleteModal(expense.id, expense.description)
                                }
                                title="Excluir"
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className={styles.tableSummary}>
                    <div className={styles.summaryItem}>
                      <label>Total Pago:</label>
                      <span className={styles.paid}>{formatCurrency(expensesTotals.paid)}</span>
                    </div>
                    <div className={styles.summaryItem}>
                      <label>Total Pendente:</label>
                      <span className={styles.pending}>
                        {formatCurrency(expensesTotals.pending)}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </>
          )}

          {/* Mensalidades Tab - Dados Reais dos Alunos */}
          {activeTab === 'mensalidades' && (
            <>
              <div className={styles.tableHeader}>
                <div className={styles.searchInput}>
                  <span>🔍</span>
                  <input
                    type="text"
                    placeholder="Buscar aluno..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className={styles.filterGroup}>
                  <select
                    className={styles.filterSelect}
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="">Todos os Status</option>
                    <option value="PAGO">Pago</option>
                    <option value="PENDENTE">Pendente</option>
                    <option value="ATRASADO">Atrasado</option>
                  </select>
                </div>
              </div>

              {isLoading ? (
                <div className={styles.loadingState}>Carregando...</div>
              ) : realStudentPayments.length === 0 ? (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>💳</div>
                  <h3>Nenhuma mensalidade encontrada</h3>
                  <p>Não há alunos matriculados para este mês</p>
                </div>
              ) : (
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Aluno</th>
                      <th>Turma</th>
                      <th>Professor</th>
                      <th>Valor</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {realStudentPayments
                      .filter((p) => {
                        const matchesSearch = p.studentName
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase());
                        const matchesStatus = !statusFilter || p.status === statusFilter;
                        return matchesSearch && matchesStatus;
                      })
                      .map((payment) => {
                        const hasOverdueMonths =
                          payment.overdueMonths && payment.overdueMonths.length > 0;

                        return (
                          <tr key={payment.studentId}>
                            <td style={{ fontWeight: 500 }}>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                {payment.studentName}
                                {hasOverdueMonths && (
                                  <span className={styles.overdueWarning}>
                                    Pendente: {formatOverdueMonths(payment.overdueMonths!)}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td>{payment.className}</td>
                            <td>{payment.teacherName}</td>
                            <td className={payment.status === 'PAGO' ? styles.amountPositive : ''}>
                              {formatCurrency(payment.monthlyFee)}
                            </td>
                            <td>
                              <span
                                className={`${styles.statusBadge} ${
                                  payment.status === 'PAGO'
                                    ? styles.pago
                                    : payment.status === 'ATRASADO'
                                      ? styles.atrasado
                                      : styles.pendente
                                }`}
                              >
                                {payment.status === 'PAGO' && '✓'} {payment.status}
                              </span>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              {payment.status !== 'PAGO' ? (
                                hasOverdueMonths ? (
                                  <div className={styles.overdueActions}>
                                    <span className={styles.overdueBlockedText}>
                                      Regularize meses anteriores
                                    </span>
                                  </div>
                                ) : (
                                  <button
                                    className={styles.receiveBtn}
                                    onClick={() => handleOpenRealStudentPaymentModal(payment)}
                                  >
                                    💵 Receber
                                  </button>
                                )
                              ) : (
                                <div className={styles.paidActions}>
                                  {payment.paymentMethod && (
                                    <span className={styles.paymentMethodBadge}>
                                      {payment.paymentMethod === 'PIX' && '💳 PIX'}
                                      {payment.paymentMethod === 'DINHEIRO' && '💵 Dinheiro'}
                                      {payment.paymentMethod === 'MISTO' && '💰 Misto'}
                                    </span>
                                  )}
                                  <button
                                    className={styles.revertBtn}
                                    onClick={() =>
                                      handleOpenRevertModal(
                                        'realStudent',
                                        payment.studentId,
                                        payment.studentName,
                                      )
                                    }
                                  >
                                    ↩️ Reverter
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              )}
              {/* Resumo das mensalidades */}
              {realStudentPayments.length > 0 && (
                <div className={styles.tableSummary}>
                  <div className={styles.summaryItem}>
                    <label>Total Recebido:</label>
                    <span className={styles.paid}>
                      {formatCurrency(realFinanceSummary?.paidMonthlyFees || 0)}
                    </span>
                  </div>
                  <div className={styles.summaryItem}>
                    <label>Total Pendente:</label>
                    <span className={styles.pending}>
                      {formatCurrency(
                        (realFinanceSummary?.pendingMonthlyFees || 0) +
                          (realFinanceSummary?.overdueMonthlyFees || 0),
                      )}
                    </span>
                  </div>
                  <div className={styles.summaryItem}>
                    <label>Total Esperado:</label>
                    <span>{formatCurrency(realFinanceSummary?.totalMonthlyFees || 0)}</span>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Folha de Professores Tab - Dados Reais */}
          {activeTab === 'folha' && (
            <div className={styles.payrollList}>
              {isLoading ? (
                <div className={styles.loadingState}>Carregando...</div>
              ) : realTeacherPayments.length === 0 ? (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>👨‍🏫</div>
                  <h3>Nenhum professor encontrado</h3>
                  <p>Não há professores com alunos ativos para este mês</p>
                </div>
              ) : (
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Professor</th>
                      <th>Alunos</th>
                      <th>Receita Total</th>
                      <th>A Pagar (50%)</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {realTeacherPayments.map((payment) => (
                      <tr key={payment.teacherId}>
                        <td style={{ fontWeight: 500 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span
                              style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                backgroundColor: '#e3f2fd',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              👤
                            </span>
                            {payment.teacherName}
                          </div>
                        </td>
                        <td>{payment.totalStudents} alunos</td>
                        <td>{formatCurrency(payment.totalRevenue)}</td>
                        <td
                          className={payment.status === 'PAGO' ? styles.amountPositive : ''}
                          style={{ fontWeight: 600 }}
                        >
                          {formatCurrency(payment.amountToPay)}
                        </td>
                        <td>
                          <span
                            className={`${styles.statusBadge} ${
                              payment.status === 'PAGO' ? styles.pago : styles.pendente
                            }`}
                          >
                            {payment.status === 'PAGO' && '✓'} {payment.status}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          {payment.status !== 'PAGO' ? (
                            <button
                              className={styles.closePayrollBtn}
                              onClick={() => handleOpenRealTeacherPaymentModal(payment)}
                            >
                              💵 Pagar
                            </button>
                          ) : (
                            <div className={styles.paidActions}>
                              {payment.paymentMethod && (
                                <span className={styles.paymentMethodBadge}>
                                  {payment.paymentMethod === 'PIX' && '💳 PIX'}
                                  {payment.paymentMethod === 'DINHEIRO' && '💵 Dinheiro'}
                                  {payment.paymentMethod === 'MISTO' && '💰 Misto'}
                                </span>
                              )}
                              <button
                                className={styles.revertBtn}
                                onClick={() =>
                                  handleOpenRevertModal(
                                    'realTeacher',
                                    payment.teacherId,
                                    payment.teacherName,
                                  )
                                }
                              >
                                ↩️ Reverter
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {/* Resumo da folha de professores */}
              {realTeacherPayments.length > 0 && (
                <div className={styles.tableSummary}>
                  <div className={styles.summaryItem}>
                    <label>Total Pago:</label>
                    <span className={styles.paid}>
                      {formatCurrency(realFinanceSummary?.paidTeacherPayments || 0)}
                    </span>
                  </div>
                  <div className={styles.summaryItem}>
                    <label>Total Pendente:</label>
                    <span className={styles.pending}>
                      {formatCurrency(realFinanceSummary?.pendingTeacherPayments || 0)}
                    </span>
                  </div>
                  <div className={styles.summaryItem}>
                    <label>Total a Pagar:</label>
                    <span>{formatCurrency(realFinanceSummary?.totalTeacherPayments || 0)}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Expense Modal */}
      {modal.type === 'expense' && (
        <div className={styles.modalOverlay} onClick={() => setModal({ type: null })}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <h2>Lançar Nova Despesa</h2>
              </div>
              <button className={styles.closeModalBtn} onClick={() => setModal({ type: null })}>
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label>Descrição</label>
                <input
                  type="text"
                  placeholder="Ex: Compra de Papel A4"
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Categoria</label>
                  <select
                    value={expenseForm.category}
                    onChange={(e) =>
                      setExpenseForm({
                        ...expenseForm,
                        category: e.target.value as ExpenseCategory,
                      })
                    }
                  >
                    <option value="">Selecione...</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Data Vencimento</label>
                  <input
                    type="date"
                    value={expenseForm.dueDate}
                    onChange={(e) => setExpenseForm({ ...expenseForm, dueDate: e.target.value })}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Valor (R$)</label>
                <div className={styles.currencyInput}>
                  <span>R$</span>
                  <input
                    type="text"
                    placeholder="0,00"
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={() => setModal({ type: null })}>
                Cancelar
              </button>
              <button className={styles.addButton} onClick={handleCreateExpense}>
                + Nova Despesa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {modal.type === 'payment' && modal.data && (
        <div className={styles.modalOverlay} onClick={() => setModal({ type: null })}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <h2>Confirmar Pagamento</h2>
                <p>Aluno: {(modal.data as StudentPayment).studentName}</p>
              </div>
              <button className={styles.closeModalBtn} onClick={() => setModal({ type: null })}>
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.modalAmount}>
                <label>VALOR A PAGAR</label>
                <span>{formatCurrency((modal.data as StudentPayment).amount)}</span>
              </div>

              <div className={styles.paymentMethods}>
                <label>Forma de Pagamento</label>
                {(['PIX', 'DINHEIRO', 'MISTO'] as PaymentMethod[]).map((method) => (
                  <div
                    key={method}
                    className={`${styles.paymentMethodOption} ${selectedPaymentMethod === method ? styles.selected : ''}`}
                    onClick={() => setSelectedPaymentMethod(method)}
                  >
                    <div className={styles.methodIcon}>
                      {method === 'PIX' && '💳'}
                      {method === 'DINHEIRO' && '💵'}
                      {method === 'MISTO' && '💰'}
                    </div>
                    <span>{getPaymentMethodLabel(method)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={() => setModal({ type: null })}>
                Cancelar
              </button>
              <button
                className={styles.confirmBtn}
                onClick={handleReceivePayment}
                disabled={!selectedPaymentMethod}
              >
                ✓ Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payroll Modal */}
      {modal.type === 'payroll' && modal.data && (
        <div className={styles.modalOverlay} onClick={() => setModal({ type: null })}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <h2>Confirmar Pagamento</h2>
                <p>Professor: {(modal.data as TeacherPayroll).teacherName}</p>
              </div>
              <button className={styles.closeModalBtn} onClick={() => setModal({ type: null })}>
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.modalAmount}>
                <label>VALOR A PAGAR</label>
                <span>{formatCurrency((modal.data as TeacherPayroll).amountToPay)}</span>
              </div>

              <div className={styles.paymentMethods}>
                <label>Forma de Pagamento</label>
                {(['PIX', 'DINHEIRO', 'MISTO'] as PaymentMethod[]).map((method) => (
                  <div
                    key={method}
                    className={`${styles.paymentMethodOption} ${selectedPaymentMethod === method ? styles.selected : ''}`}
                    onClick={() => setSelectedPaymentMethod(method)}
                  >
                    <div className={styles.methodIcon}>
                      {method === 'PIX' && '💳'}
                      {method === 'DINHEIRO' && '💵'}
                      {method === 'MISTO' && '💰'}
                    </div>
                    <span>{getPaymentMethodLabel(method)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={() => setModal({ type: null })}>
                Cancelar
              </button>
              <button
                className={styles.confirmBtn}
                onClick={handleClosePayroll}
                disabled={!selectedPaymentMethod}
              >
                ✓ Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Expense Modal */}
      {modal.type === 'editExpense' && (
        <div className={styles.modalOverlay} onClick={() => setModal({ type: null })}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Editar Despesa</h2>
              <button className={styles.closeModalBtn} onClick={() => setModal({ type: null })}>
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label>Descrição *</label>
                <input
                  type="text"
                  placeholder="Ex: Conta de Luz"
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Categoria *</label>
                  <select
                    value={expenseForm.category}
                    onChange={(e) =>
                      setExpenseForm({
                        ...expenseForm,
                        category: e.target.value as ExpenseCategory,
                      })
                    }
                  >
                    <option value="">Selecione...</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Valor (R$) *</label>
                  <input
                    type="text"
                    placeholder="0,00"
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Data de Vencimento *</label>
                <input
                  type="date"
                  value={expenseForm.dueDate}
                  onChange={(e) => setExpenseForm({ ...expenseForm, dueDate: e.target.value })}
                />
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={() => setModal({ type: null })}>
                Cancelar
              </button>
              <button className={styles.confirmBtn} onClick={handleSaveExpense}>
                💾 Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Revert Modal */}
      {modal.type === 'confirmRevert' && revertAction && (
        <div className={styles.modalOverlay} onClick={handleCancelRevert}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Confirmar Reversão</h2>
              <button className={styles.closeModalBtn} onClick={handleCancelRevert}>
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.confirmMessage}>
                <div className={styles.revertIcon}>↩️</div>
                <p>
                  Você está prestes a reverter este item para <strong>pendente</strong>
                </p>
                <div className={styles.revertItemInfo}>
                  <span className={styles.revertItemType}>
                    {revertAction.type === 'expense' && '💰 Despesa'}
                    {revertAction.type === 'payment' && '📚 Mensalidade'}
                    {revertAction.type === 'payroll' && '👨‍🏫 Folha de Professor'}
                    {revertAction.type === 'realStudent' && '📚 Mensalidade do Aluno'}
                    {revertAction.type === 'realTeacher' && '👨‍🏫 Pagamento do Professor'}
                  </span>
                  <span className={styles.revertItemName}>{revertAction.description}</span>
                </div>
                <p className={styles.warningText}>
                  ⚠️ Esta ação irá desfazer o registro de pagamento
                </p>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={handleCancelRevert}>
                Cancelar
              </button>
              <button className={styles.confirmRevertBtn} onClick={handleConfirmRevert}>
                ↩️ Confirmar Reversão
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {modal.type === 'confirmDelete' && deleteAction && (
        <div className={styles.modalOverlay} onClick={handleCancelDelete}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Excluir Despesa</h2>
              <button className={styles.closeModalBtn} onClick={handleCancelDelete}>
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.confirmMessage}>
                <div className={styles.deleteIcon}>🗑️</div>
                <p>
                  Você está prestes a <strong>excluir permanentemente</strong> esta despesa
                </p>
                <div className={styles.deleteItemInfo}>
                  <span className={styles.deleteItemType}>💰 Despesa</span>
                  <span className={styles.deleteItemName}>{deleteAction.description}</span>
                </div>
                <p className={styles.deleteWarningText}>⚠️ Esta ação não pode ser desfeita</p>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={handleCancelDelete}>
                Cancelar
              </button>
              <button className={styles.confirmDeleteBtn} onClick={handleConfirmDelete}>
                🗑️ Excluir Despesa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Receber Mensalidade de Aluno (Real) */}
      {modal.type === 'realStudentPayment' && modal.data && (
        <div className={styles.modalOverlay} onClick={() => setModal({ type: null })}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <h2>💵 Receber Mensalidade</h2>
                <p>Aluno: {(modal.data as MonthlyFeeSummary).studentName}</p>
              </div>
              <button className={styles.closeModalBtn} onClick={() => setModal({ type: null })}>
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.paymentSummary}>
                <div className={styles.paymentSummaryItem}>
                  <span className={styles.paymentSummaryLabel}>Turma</span>
                  <span className={styles.paymentSummaryValue}>
                    {(modal.data as MonthlyFeeSummary).className}
                  </span>
                </div>
                <div className={styles.paymentSummaryItem}>
                  <span className={styles.paymentSummaryLabel}>Professor(a)</span>
                  <span className={styles.paymentSummaryValue}>
                    {(modal.data as MonthlyFeeSummary).teacherName}
                  </span>
                </div>
                <div className={styles.paymentSummaryItem}>
                  <span className={styles.paymentSummaryLabel}>Vencimento</span>
                  <span className={styles.paymentSummaryValue}>
                    {formatDate((modal.data as MonthlyFeeSummary).dueDate)}
                  </span>
                </div>
              </div>

              <div className={styles.modalAmount}>
                <label>VALOR A RECEBER</label>
                <span className={styles.amountPositive}>
                  {formatCurrency((modal.data as MonthlyFeeSummary).monthlyFee)}
                </span>
              </div>

              <div className={styles.paymentMethods}>
                <label>Forma de Pagamento *</label>
                {(['PIX', 'DINHEIRO', 'MISTO'] as PaymentMethod[]).map((method) => (
                  <div
                    key={method}
                    className={`${styles.paymentMethodOption} ${selectedPaymentMethod === method ? styles.selected : ''}`}
                    onClick={() => setSelectedPaymentMethod(method)}
                  >
                    <div className={styles.methodIcon}>
                      {method === 'PIX' && '💳'}
                      {method === 'DINHEIRO' && '💵'}
                      {method === 'MISTO' && '💰'}
                    </div>
                    <span>
                      {method === 'PIX' && 'PIX'}
                      {method === 'DINHEIRO' && 'Dinheiro'}
                      {method === 'MISTO' && 'Misto (PIX + Dinheiro)'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={() => setModal({ type: null })}>
                Cancelar
              </button>
              <button
                className={styles.confirmBtn}
                onClick={handleConfirmRealStudentPayment}
                disabled={!selectedPaymentMethod}
              >
                ✓ Confirmar Recebimento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Pagar Professor (Real) */}
      {modal.type === 'realTeacherPayment' && modal.data && (
        <div className={styles.modalOverlay} onClick={() => setModal({ type: null })}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <h2>👨‍🏫 Pagar Professor</h2>
                <p>Professor: {(modal.data as TeacherPaymentSummary).teacherName}</p>
              </div>
              <button className={styles.closeModalBtn} onClick={() => setModal({ type: null })}>
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.paymentSummary}>
                <div className={styles.paymentSummaryItem}>
                  <span className={styles.paymentSummaryLabel}>Alunos Ativos</span>
                  <span className={styles.paymentSummaryValue}>
                    {(modal.data as TeacherPaymentSummary).totalStudents} alunos
                  </span>
                </div>
                <div className={styles.paymentSummaryItem}>
                  <span className={styles.paymentSummaryLabel}>Receita Total</span>
                  <span className={styles.paymentSummaryValue}>
                    {formatCurrency((modal.data as TeacherPaymentSummary).totalRevenue)}
                  </span>
                </div>
                <div className={styles.paymentSummaryItem}>
                  <span className={styles.paymentSummaryLabel}>Participação</span>
                  <span className={styles.paymentSummaryValue}>50%</span>
                </div>
              </div>

              <div className={styles.modalAmount}>
                <label>VALOR A PAGAR</label>
                <span className={styles.amountNegative}>
                  {formatCurrency((modal.data as TeacherPaymentSummary).amountToPay)}
                </span>
              </div>

              <div className={styles.paymentMethods}>
                <label>Forma de Pagamento *</label>
                {(['PIX', 'DINHEIRO', 'MISTO'] as PaymentMethod[]).map((method) => (
                  <div
                    key={method}
                    className={`${styles.paymentMethodOption} ${selectedPaymentMethod === method ? styles.selected : ''}`}
                    onClick={() => setSelectedPaymentMethod(method)}
                  >
                    <div className={styles.methodIcon}>
                      {method === 'PIX' && '💳'}
                      {method === 'DINHEIRO' && '💵'}
                      {method === 'MISTO' && '💰'}
                    </div>
                    <span>
                      {method === 'PIX' && 'PIX'}
                      {method === 'DINHEIRO' && 'Dinheiro'}
                      {method === 'MISTO' && 'Misto (PIX + Dinheiro)'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={() => setModal({ type: null })}>
                Cancelar
              </button>
              <button
                className={styles.confirmBtn}
                onClick={handleConfirmRealTeacherPayment}
                disabled={!selectedPaymentMethod}
              >
                ✓ Confirmar Pagamento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
