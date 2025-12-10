import { DashboardLayout } from '../components/dashboard/Layout/DashboardLayout';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { studentService } from '../services/studentService';
import { teacherService } from '../services/teacherService';
import styles from '../styles/dashboard-page.module.css';

export function DashboardPage() {
  const navigate = useNavigate();
  const [studentsCount, setStudentsCount] = useState<number>(0);
  const [teachersCount, setTeachersCount] = useState<number>(0);

  useEffect(() => {
    async function loadCounts() {
      // 1. Tenta pegar contagem de alunos
      try {
        const count = await studentService.getStudentsCount();
        setStudentsCount(count);
      } catch (error) {
        console.error('Erro ao contar alunos:', error);
        setStudentsCount(0); // Se falhar, assume 0
      }

      // 2. Tenta pegar contagem de professores
      // (Dica: O ideal seria ter um teacherService.getTeachersCount() também,
      // em vez de listar todos os professores aqui em baixo)
      try {
        const teachers = await teacherService.getAll();
        setTeachersCount(Array.isArray(teachers) ? teachers.length : 0);
      } catch {
        setTeachersCount(0);
      }
    }
    loadCounts();
  }, []);

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
              <p className={styles.statValue}>{studentsCount}</p>
              <span className={styles.statChange}>cadastrados</span>
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
              <p className={styles.statValue}>{teachersCount}</p>
              <span className={styles.statChange}>Todos ativos</span>
            </div>
            <div className={styles.statActions}>
              <button className={styles.statButton} onClick={() => navigate('/dashboard/teachers')}>
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
        </div>
      </div>
    </DashboardLayout>
  );
}
