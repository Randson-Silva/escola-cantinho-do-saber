import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { attendanceService, ClassInfo } from '../../services/attendanceService';
import { useAuth } from '../../hooks/useAuth';
import styles from './attendance-list.module.css';

export function AttendanceList() {
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  const isProfessor = user?.role === 'PROFESSOR';

  useEffect(() => {
    loadClasses();
  }, [user]);

  async function loadClasses() {
    try {
      setLoading(true);
      const data = isProfessor && user?.email
        ? await attendanceService.listMyClasses(user.email)
        : await attendanceService.listClasses();
      setClasses(data);
    } catch (error) {
      console.error('Erro ao carregar turmas:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredClasses = classes.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  function getPercentageColor(percentage?: number) {
    if (!percentage) return styles.percentageGray;
    if (percentage >= 90) return styles.percentageGreen;
    if (percentage >= 70) return styles.percentageYellow;
    return styles.percentageRed;
  }

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header com busca */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Frequência</h1>
          <p className={styles.subtitle}>
            {isProfessor
              ? 'Gerencie a frequência dos alunos das suas turmas'
              : 'Gerencie a frequência dos alunos por turma'}
          </p>
        </div>
        <div className={styles.searchContainer}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder="Buscar por nome da turma..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>

      {/* Grid de turmas */}
      <div className={styles.grid}>
        {filteredClasses.map((classItem) => (
          <div key={classItem.id} className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.iconContainer}>
                <span className={styles.classIcon}>👥</span>
              </div>
              {classItem.attendancePercentage !== undefined && (
                <span
                  className={`${styles.percentage} ${getPercentageColor(classItem.attendancePercentage)}`}
                >
                  {classItem.attendancePercentage}% Presença
                </span>
              )}
            </div>

            <h3 className={styles.className}>{classItem.name}</h3>
            <p className={styles.teacherName}>{classItem.teacherName}</p>

            <button
              onClick={() => navigate(`/dashboard/attendance/${classItem.id}`)}
              className={styles.accessButton}
            >
              <span>📋</span>
              Acessar Diário
            </button>
          </div>
        ))}
      </div>

      {filteredClasses.length === 0 && (
        <div className={styles.emptyState}>
          <p>Nenhuma turma encontrada.</p>
        </div>
      )}
    </div>
  );
}

