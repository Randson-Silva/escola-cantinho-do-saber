import { DashboardLayout } from '../components/dashboard/Layout/DashboardLayout';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/dashboard-page.module.css';

export function DashboardPage() {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className={styles.container}>
        <div className={styles.welcome}>
          <h2 className={styles.welcomeTitle}>Bem-vindo de volta! 👋</h2>
          <p className={styles.welcomeText}>Aqui está um resumo das atividades da escola</p>
        </div>

        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>👨‍🎓</div>
            <div className={styles.statContent}>
              <h3 className={styles.statLabel}>Total de Alunos</h3>
              <p className={styles.statValue}>245</p>
              <span className={styles.statChange}>+12 este mês</span>
            </div>
            <div className={styles.statActions}>
              <button className={styles.statButton} onClick={() => navigate('/dashboard/students')}>
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
            <div className={styles.statIcon}>📚</div>
            <div className={styles.statContent}>
              <h3 className={styles.statLabel}>Turmas Ativas</h3>
              <p className={styles.statValue}>12</p>
              <span className={styles.statChange}>3 em andamento</span>
            </div>
            <button className={styles.statButton}>Criar Turma</button>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>👥</div>
            <div className={styles.statContent}>
              <h3 className={styles.statLabel}>Professores</h3>
              <p className={styles.statValue}>18</p>
              <span className={styles.statChange}>Todos ativos</span>
            </div>
            <button className={styles.statButton}>Adicionar Professor</button>
          </div>

         
        </div>
      </div>
    </DashboardLayout>
  );
}
