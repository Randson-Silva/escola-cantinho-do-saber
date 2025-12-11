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

// ============================================
// TYPES
// ============================================

type TabType = 'despesas' | 'mensalidades' | 'folha';
type ModalType = 'expense' | 'payment' | 'payroll' | null;

interface ModalData {
  type: ModalType;
  data?: StudentPayment | TeacherPayroll | null;
}

// ============================================
// MAIN COMPONENT
// ============================================

export function FinancesDashboard() {
  const { addToast } = useToast();
  
  // State
  const [currentMonth, setCurrentMonth] = useState(getCurrentMonth());
  const [activeTab, setActiveTab] = useState<TabType>('despesas');
  const [isLoading, setIsLoading] = useState(true);
  
  // Data states
  const [summary, setSummary] = useState<FinanceSummary | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [payments, setPayments] = useState<StudentPayment[]>([]);
  const [payrolls, setPayrolls] = useState<TeacherPayroll[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Modal states
  const [modal, setModal] = useState<ModalData>({ type: null });
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  
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
  }, [currentMonth]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [summaryData, expensesData, paymentsData, payrollsData, categoriesData] = await Promise.all([
        financeSummaryService.getSummary(currentMonth),
        expenseService.getByMonth(currentMonth),
        studentPaymentService.getByMonth(currentMonth),
        teacherPayrollService.getByMonth(currentMonth),
        expenseService.getCategories(),
      ]);
      
      setSummary(summaryData);
      setExpenses(expensesData);
      setPayments(paymentsData);
      setPayrolls(payrollsData);
      setCategories(categoriesData);
    } catch (error) {
      addToast('Erro ao carregar dados financeiros', 'error');
    } finally {
      setIsLoading(false);
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
    setExpenseForm({ description: '', category: '', dueDate: '', amount: '' });
    setModal({ type: 'expense' });
  };

  const handleCreateExpense = async () => {
    if (!expenseForm.description || !expenseForm.category || !expenseForm.dueDate || !expenseForm.amount) {
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

  const handleDeleteExpense = async (id: string) => {
    if (!confirm('Deseja realmente excluir esta despesa?')) return;
    
    try {
      await expenseService.delete(id);
      addToast('Despesa excluída com sucesso!', 'success');
      loadData();
    } catch (error) {
      addToast('Erro ao excluir despesa', 'error');
    }
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
      'UTILIDADES': styles.utilidades,
      'SUPRIMENTOS': styles.suprimentos,
      'MANUTENÇÃO': styles.manutencao,
    };
    return map[category] || '';
  };

  const getStatusClass = (status: string): string => {
    const map: Record<string, string> = {
      'PAGO': styles.pago,
      'PENDENTE': styles.pendente,
      'AGENDADO': styles.agendado,
      'ATRASADO': styles.atrasado,
      'CONCLUIDO': styles.concluido,
    };
    return map[status] || '';
  };

  const getPaymentMethodLabel = (method: PaymentMethod): string => {
    const map: Record<PaymentMethod, string> = {
      'PIX': 'PIX',
      'DINHEIRO': 'Dinheiro',
      'MISTO': 'Misto (PIX + Dinheiro)',
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
          <span style={{ textTransform: 'capitalize' }}>{getMonthName(currentMonth)}</span>
          <span>▼</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className={styles.summaryGrid}>
        <div className={styles.summaryCard}>
          <div className={styles.summaryCardHeader}>
            <div className={`${styles.summaryIcon} ${styles.income}`}>📈</div>
            <span className={`${styles.summaryBadge} ${styles.income}`}>
              ↗ Entradas
            </span>
          </div>
          <p className={styles.summaryLabel}>Receita realizada</p>
          <p className={styles.summaryValue}>
            {isLoading ? '...' : formatCurrency(summary?.realizedRevenue || 0)}
          </p>
        </div>

        <div className={styles.summaryCard}>
          <div className={styles.summaryCardHeader}>
            <div className={`${styles.summaryIcon} ${styles.expense}`}>📉</div>
            <span className={`${styles.summaryBadge} ${styles.expense}`}>
              ↘ Saídas
            </span>
          </div>
          <p className={styles.summaryLabel}>Despesas (Prof + Ops)</p>
          <p className={styles.summaryValue}>
            {isLoading ? '...' : formatCurrency(summary?.expenses || 0)}
          </p>
        </div>

        <div className={`${styles.summaryCard} ${styles.highlight}`}>
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
                      <option key={cat} value={cat}>{cat}</option>
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
                            <span className={`${styles.categoryBadge} ${getCategoryClass(expense.category)}`}>
                              {expense.category}
                            </span>
                          </td>
                          <td>📅 {formatDate(expense.dueDate)}</td>
                          <td className={styles.amountNegative}>
                            -{formatCurrency(expense.amount)}
                          </td>
                          <td>
                            <span className={`${styles.statusBadge} ${getStatusClass(expense.status)}`}>
                              {expense.status === 'PAGO' && '✓'} {expense.status}
                            </span>
                          </td>
                          <td>
                            <div className={styles.actionButtons}>
                              {expense.status !== 'PAGO' && (
                                <button
                                  className={styles.iconButton}
                                  onClick={() => handleMarkExpenseAsPaid(expense.id)}
                                  title="Marcar como pago"
                                >
                                  ✓
                                </button>
                              )}
                              <button
                                className={styles.iconButton}
                                title="Editar"
                              >
                                ✏️
                              </button>
                              <button
                                className={`${styles.iconButton} ${styles.delete}`}
                                onClick={() => handleDeleteExpense(expense.id)}
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
                      <span className={styles.pending}>{formatCurrency(expensesTotals.pending)}</span>
                    </div>
                  </div>
                </>
              )}
            </>
          )}

          {/* Mensalidades Tab */}
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
              ) : payments.length === 0 ? (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>💳</div>
                  <h3>Nenhuma mensalidade encontrada</h3>
                  <p>Não há mensalidades registradas para este mês</p>
                </div>
              ) : (
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Aluno</th>
                      <th>Vencimento</th>
                      <th>Valor</th>
                      <th>Status</th>
                      <th>Pagamento</th>
                      <th style={{ textAlign: 'right' }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments
                      .filter((p) => {
                        const matchesSearch = p.studentName.toLowerCase().includes(searchTerm.toLowerCase());
                        const matchesStatus = !statusFilter || p.status === statusFilter;
                        return matchesSearch && matchesStatus;
                      })
                      .map((payment) => (
                        <tr key={payment.id}>
                          <td style={{ fontWeight: 500 }}>{payment.studentName}</td>
                          <td>📅 {formatDate(payment.dueDate)}</td>
                          <td className={payment.status === 'PAGO' ? styles.amountPositive : ''}>
                            {formatCurrency(payment.amount)}
                          </td>
                          <td>
                            <span className={`${styles.statusBadge} ${getStatusClass(payment.status)}`}>
                              {payment.status === 'PAGO' && '✓'} {payment.status}
                            </span>
                          </td>
                          <td>
                            {payment.paymentMethod ? (
                              <span className={styles.paymentMethodBadge}>
                                ✓ {getPaymentMethodLabel(payment.paymentMethod)}
                              </span>
                            ) : (
                              '-'
                            )}
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            {payment.status !== 'PAGO' && (
                              <button
                                className={styles.receiveBtn}
                                onClick={() => handleOpenPaymentModal(payment)}
                              >
                                Receber
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              )}
            </>
          )}

          {/* Folha de Professores Tab */}
          {activeTab === 'folha' && (
            <div className={styles.payrollList}>
              {isLoading ? (
                <div className={styles.loadingState}>Carregando...</div>
              ) : payrolls.length === 0 ? (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>👨‍🏫</div>
                  <h3>Nenhuma folha encontrada</h3>
                  <p>Não há folhas de pagamento para este mês</p>
                </div>
              ) : (
                payrolls.map((payroll) => (
                  <div key={payroll.id} className={styles.payrollCard}>
                    <div className={styles.payrollHeader}>
                      <div className={styles.teacherInfo}>
                        <div className={styles.teacherAvatar}>👤</div>
                        <div className={styles.teacherDetails}>
                          <h3>{payroll.teacherName}</h3>
                          <p>{payroll.shift} · {payroll.activeStudents} alunos ativos</p>
                        </div>
                      </div>
                      <div className={styles.payrollAmount}>
                        <label>A PAGAR ({(payroll.participationRate * 100).toFixed(0)}%)</label>
                        <span>{formatCurrency(payroll.amountToPay)}</span>
                      </div>
                      <div className={styles.payrollActions}>
                        {payroll.status === 'PENDENTE' ? (
                          <button
                            className={styles.closePayrollBtn}
                            onClick={() => handleOpenPayrollModal(payroll)}
                          >
                            💵 Fechar Folha
                          </button>
                        ) : (
                          <span className={`${styles.statusBadge} ${styles.concluido}`}>
                            ✓ Concluído
                          </span>
                        )}
                        <button
                          className={styles.expandBtn}
                          onClick={() => togglePayrollExpanded(payroll.id)}
                        >
                          {expandedPayrolls.has(payroll.id) ? '▲' : '▼'}
                        </button>
                      </div>
                    </div>

                    {expandedPayrolls.has(payroll.id) && (
                      <div className={styles.payrollDetails}>
                        <div className={styles.auditSection}>
                          <h4>📋 AUDITORIA DA REMUNERAÇÃO</h4>
                          <div className={styles.auditRow}>
                            <label>Total de Contratos Ativos:</label>
                            <span>{formatCurrency(payroll.totalContracts)}</span>
                          </div>
                          <div className={styles.auditRow}>
                            <label>Regras de Participação:</label>
                            <span>{(payroll.participationRate * 100).toFixed(0)}%</span>
                          </div>
                          <div className={`${styles.auditRow} ${styles.highlight}`}>
                            <label>Valor Final a Pagar:</label>
                            <span className={styles.primary}>{formatCurrency(payroll.amountToPay)}</span>
                          </div>
                        </div>

                        <div className={styles.auditSection}>
                          <h4>📋 AUDITORIA DA REMUNERAÇÃO</h4>
                          <div className={styles.auditRow}>
                            <label>Receita Realizada (Baixas):</label>
                            <span className={styles.positive}>+{formatCurrency(payroll.realizedRevenue)}</span>
                          </div>
                          <div className={styles.auditRow}>
                            <label>Pagamento ao Professor:</label>
                            <span className={styles.negative}>-{formatCurrency(payroll.amountToPay)}</span>
                          </div>
                          <div className={`${styles.auditRow} ${styles.highlight}`}>
                            <label>Diferença (Custo Extra):</label>
                            <span>{formatCurrency(payroll.realizedRevenue - payroll.amountToPay - payroll.amountToPay)}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))
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
                  <div className={styles.categoryHeader}>
                    <label>Categoria</label>
                    <button className={styles.addCategoryBtn}>+ Nova</button>
                  </div>
                  <select
                    value={expenseForm.category}
                    onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value as ExpenseCategory })}
                  >
                    <option value="">Selecione...</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
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
    </div>
  );
}
