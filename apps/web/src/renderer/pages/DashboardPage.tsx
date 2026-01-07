import { DashboardLayout } from '../components/dashboard/Layout/DashboardLayout';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { studentService } from '../services/studentService';
import { teacherService, Teacher } from '../services/teacherService';
import { classService, Class } from '../services/classService';
// Removido: dashboardFinanceService - finanças ficam apenas na aba de Finanças
import { useAuth } from '../hooks/useAuth';
import styles from '../styles/dashboard-page.module.css';

export function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [studentsCount, setStudentsCount] = useState<number>(0);
  const [teachersCount, setTeachersCount] = useState<number>(0);
  const [classes, setClasses] = useState<Class[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Verifica se o usuário é professor
  const isTeacher = user?.role === 'PROFESSOR';
  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setIsLoading(true);
    try {
      const [studentsCountData, teachersData, classesData] = await Promise.all([
        studentService.getStudentsCount(),
        teacherService.getAll(),
        classService.getAll(),
      ]);

      setStudentsCount(studentsCountData);
      setTeachers(Array.isArray(teachersData) ? teachersData : []);
      setTeachersCount(Array.isArray(teachersData) ? teachersData.length : 0);
      setClasses(classesData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setIsLoading(false);
    }
  }

  function getTeacherName(teacherId: string | null): string {
    if (!teacherId) return 'Não definido';
    const teacher = teachers.find((t) => t.id === teacherId);
    return teacher ? teacher.nome : 'Professor não encontrado';
  }

  return (
    <DashboardLayout>
      <div className={styles.container}>
        <div className={styles.welcome}>
          <h2 className={styles.welcomeTitle}>Bem-vindo de volta, {user?.name || 'Usuário'}! 👋</h2>
          <p className={styles.welcomeText}>
            {isTeacher
              ? 'Acesse suas turmas e registre a frequência dos alunos'
              : 'Aqui está um resumo das atividades da escola'}
          </p>
        </div>

        <div className={styles.statsGrid}>
          {/* Card de Frequência - Visível apenas para Professor */}
          {isTeacher && (
            <div className={styles.statCard}>
              <div className={styles.statIcon}>📋</div>
              <div className={styles.statContent}>
                <h3 className={styles.statLabel}>Frequência</h3>
                <p className={styles.statValue}>{isLoading ? '...' : classes.length}</p>
                <span className={styles.statChange}>turmas disponíveis</span>
              </div>
              <div className={styles.statActions}>
                <button
                  className={`${styles.statButton} ${styles.statButtonPrimary}`}
                  onClick={() => navigate('/dashboard/attendance')}
                >
                  Registrar Frequência
                </button>
              </div>
            </div>
          )}

          {/* Cards para Admin - apenas Cadastrar Aluno, Cadastrar Professor e Configurações */}
          {isAdmin && (
            <>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>👨‍🎓</div>
                <div className={styles.statContent}>
                  <h3 className={styles.statLabel}>Alunos</h3>
                  <p className={styles.statValue}>{studentsCount}</p>
                  <span className={styles.statChange}>cadastrados</span>
                </div>
                <div className={styles.statActions}>
                  <button
                    className={`${styles.statButton} ${styles.statButtonPrimary}`}
                    onClick={() => navigate('/dashboard/students/register')}
                  >
                    Cadastrar Aluno
                  </button>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon}>👥</div>
                <div className={styles.statContent}>
                  <h3 className={styles.statLabel}>Professores</h3>
                  <p className={styles.statValue}>{teachersCount}</p>
                  <span className={styles.statChange}>cadastrados</span>
                </div>
                <div className={styles.statActions}>
                  <button
                    className={`${styles.statButton} ${styles.statButtonPrimary}`}
                    onClick={() => navigate('/dashboard/teachers/register')}
                  >
                    Cadastrar Professor
                  </button>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon}>🏫</div>
                <div className={styles.statContent}>
                  <h3 className={styles.statLabel}>Turmas</h3>
                  <p className={styles.statValue}>{isLoading ? '...' : classes.length}</p>
                  <span className={styles.statChange}>cadastradas</span>
                </div>
                <div className={styles.statActions}>
                  <button
                    className={`${styles.statButton} ${styles.statButtonPrimary}`}
                    onClick={() => navigate('/dashboard/classes?action=create')}
                  >
                    Criar Turma
                  </button>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon}>⚙️</div>
                <div className={styles.statContent}>
                  <h3 className={styles.statLabel}>Configurações</h3>
                  <p className={styles.statValue}>—</p>
                  <span className={styles.statChange}>Perfil e preferências</span>
                </div>
                <div className={styles.statActions}>
                  <button
                    className={`${styles.statButton} ${styles.statButtonPrimary}`}
                    onClick={() => navigate('/dashboard/settings')}
                  >
                    Acessar Configurações
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Cards para Recepcionista (COMUM) - Ver/Cadastrar Alunos e Professores */}
          {!isTeacher && !isAdmin && (
            <>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>👨‍🎓</div>
                <div className={styles.statContent}>
                  <h3 className={styles.statLabel}>Total de Alunos</h3>
                  <p className={styles.statValue}>{studentsCount}</p>
                  <span className={styles.statChange}>cadastrados</span>
                </div>
                <div className={styles.statActions}>
                  <button
                    className={styles.statButton}
                    onClick={() => navigate('/dashboard/students')}
                  >
                    Ver Alunos
                  </button>
                  <button
                    className={`${styles.statButton} ${styles.statButtonPrimary}`}
                    onClick={() => navigate('/dashboard/students/register')}
                  >
                    Cadastrar Aluno
                  </button>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon}>👥</div>
                <div className={styles.statContent}>
                  <h3 className={styles.statLabel}>Professores</h3>
                  <p className={styles.statValue}>{teachersCount}</p>
                  <span className={styles.statChange}>Todos ativos</span>
                </div>
                <div className={styles.statActions}>
                  <button
                    className={styles.statButton}
                    onClick={() => navigate('/dashboard/teachers')}
                  >
                    Ver Professores
                  </button>
                  <button
                    className={`${styles.statButton} ${styles.statButtonPrimary}`}
                    onClick={() => navigate('/dashboard/teachers/register')}
                  >
                    Cadastrar Professor
                  </button>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon}>🏫</div>
                <div className={styles.statContent}>
                  <h3 className={styles.statLabel}>Turmas</h3>
                  <p className={styles.statValue}>{isLoading ? '...' : classes.length}</p>
                  <span className={styles.statChange}>cadastradas</span>
                </div>
                <div className={styles.statActions}>
                  <button
                    className={styles.statButton}
                    onClick={() => navigate('/dashboard/classes')}
                  >
                    Ver Turmas
                  </button>
                  <button
                    className={`${styles.statButton} ${styles.statButtonPrimary}`}
                    onClick={() => navigate('/dashboard/classes?action=create')}
                  >
                    Criar Turma
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
