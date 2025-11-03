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

        <div className={styles.sectionsGrid}>
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Atividades Recentes</h3>
            <div className={styles.activityList}>
              <div className={styles.activityItem}>
                <span className={styles.activityIcon}>✅</span>
                <div className={styles.activityContent}>
                  <p className={styles.activityText}>
                    <strong>João Silva</strong> completou a matrícula
                  </p>
                  <span className={styles.activityTime}>Há 2 horas</span>
                </div>
              </div>

              <div className={styles.activityItem}>
                <span className={styles.activityIcon}>📝</span>
                <div className={styles.activityContent}>
                  <p className={styles.activityText}>
                    <strong>Turma 5A</strong> teve uma nova atividade registrada
                  </p>
                  <span className={styles.activityTime}>Há 5 horas</span>
                </div>
              </div>

              <div className={styles.activityItem}>
                <span className={styles.activityIcon}>👤</span>
                <div className={styles.activityContent}>
                  <p className={styles.activityText}>
                    <strong>Maria Santos</strong> foi adicionada como professora
                  </p>
                  <span className={styles.activityTime}>Ontem</span>
                </div>
              </div>

              <div className={styles.activityItem}>
                <span className={styles.activityIcon}>📊</span>
                <div className={styles.activityContent}>
                  <p className={styles.activityText}>Relatório mensal gerado com sucesso</p>
                  <span className={styles.activityTime}>2 dias atrás</span>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Próximos Eventos</h3>
            <div className={styles.eventList}>
              <div className={styles.eventItem}>
                <div className={styles.eventDate}>
                  <span className={styles.eventDay}>15</span>
                  <span className={styles.eventMonth}>NOV</span>
                </div>
                <div className={styles.eventContent}>
                  <p className={styles.eventTitle}>Reunião de Pais</p>
                  <span className={styles.eventTime}>14:00 - Auditório</span>
                </div>
              </div>

              <div className={styles.eventItem}>
                <div className={styles.eventDate}>
                  <span className={styles.eventDay}>20</span>
                  <span className={styles.eventMonth}>NOV</span>
                </div>
                <div className={styles.eventContent}>
                  <p className={styles.eventTitle}>Dia do Professor</p>
                  <span className={styles.eventTime}>09:00 - Pátio</span>
                </div>
              </div>

              <div className={styles.eventItem}>
                <div className={styles.eventDate}>
                  <span className={styles.eventDay}>25</span>
                  <span className={styles.eventMonth}>NOV</span>
                </div>
                <div className={styles.eventContent}>
                  <p className={styles.eventTitle}>Feira de Ciências</p>
                  <span className={styles.eventTime}>Todo o dia</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

