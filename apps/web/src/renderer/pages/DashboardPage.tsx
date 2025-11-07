import { DashboardLayout } from '../components/dashboard/Layout/DashboardLayout';
import styles from '../styles/dashboard-page.module.css';

export function DashboardPage() {
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
            <button className={styles.statButton}>Cadastrar Aluno</button>
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

          <div className={styles.statCard}>
            <div className={styles.statIcon}>📅</div>
            <div className={styles.statContent}>
              <h3 className={styles.statLabel}>Eventos Este Mês</h3>
              <p className={styles.statValue}>8</p>
              <span className={styles.statChange}>2 próximos</span>
            </div>
            <button className={styles.statButton}>Agendar Evento</button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

