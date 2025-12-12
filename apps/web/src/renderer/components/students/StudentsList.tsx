import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../hooks/useToast';
import { useDebounce } from '../../hooks/useDebounce';
import { studentService, type Student } from '../../services/studentService';
import { classService, type Class } from '../../services/classService';
import styles from './students.module.css';
import detailsStyles from './student-details.module.css';

// Mapeamento de grade para exibição
const GRADE_DISPLAY: Record<string, string> = {
  'series-1-ano': '1º ano',
  'series-2-ano': '2º ano',
  'series-3-ano': '3º ano',
  'series-4-ano': '4º ano',
  'series-5-ano': '5º ano',
  'series-6-ano': '6º ano',
  'series-7-ano': '7º ano',
  'series-8-ano': '8º ano',
  'series-9-ano': '9º ano',
};

const formatGrade = (grade: string): string => {
  return GRADE_DISPLAY[grade] || grade;
};

export function StudentsList() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    loadTotalCount();
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      const data = await classService.getAll();
      setClasses(data);
    } catch (error) {
      console.error('Erro ao carregar turmas:', error);
    }
  };

  // Retorna o nome da turma baseado no ID ou nome
  const getClassName = (classIdOrName: string): string => {
    if (!classIdOrName) return '-';

    // Primeiro tenta encontrar por ID
    const classById = classes.find((c) => c.id === classIdOrName);
    if (classById) return classById.name;

    // Se não encontrou por ID, pode ser o nome direto ou turma antiga
    const classByName = classes.find((c) => c.name === classIdOrName);
    if (classByName) return classByName.name;

    // Retorna o valor original se não encontrar
    return classIdOrName;
  };

  useEffect(() => {
    if (debouncedSearchTerm.trim()) {
      performSearch(debouncedSearchTerm);
    } else {
      setStudents([]);
    }
  }, [debouncedSearchTerm]);

  const loadTotalCount = async () => {
    try {
      const count = await studentService.getStudentsCount();
      setTotalCount(count);
    } catch (err) {
      setTotalCount(null);
    }
  };

  const performSearch = async (term: string) => {
    setIsLoading(true);
    try {
      console.log('[StudentsList] Buscando por:', term);
      const data = await studentService.searchStudentsByName(term);
      console.log('[StudentsList] Resultados recebidos:', data.length, 'alunos');
      setStudents(data);
    } catch (error) {
      console.error('Erro ao buscar alunos:', error);
      addToast('Erro ao buscar alunos', 'error');
      setStudents([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setStudents([]);
  };

  const handleDelete = (id: string, name: string) => {
    if (!id) {
      addToast('Não é possível excluir aluno sem identificador', 'error');
      return;
    }

    setStudentToDelete({ id, name });
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!studentToDelete) return;

    try {
      await studentService.deleteStudent(studentToDelete.id);
      addToast('Aluno excluído com sucesso!', 'success');
      setStudents(students.filter((s) => s.id !== studentToDelete.id));
      loadTotalCount();
    } catch (error) {
      addToast('Erro ao excluir aluno', 'error');
    } finally {
      setShowDeleteConfirm(false);
      setStudentToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setStudentToDelete(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Alunos Cadastrados</h1>
            <p className={styles.subtitle}>
              {totalCount !== null
                ? `${totalCount} ${totalCount === 1 ? 'aluno' : 'alunos'} no sistema`
                : 'Busque por nome para ver os alunos'}
            </p>
          </div>
          <button
            className={styles.saveBtn}
            onClick={() => navigate('/dashboard/students/register')}
          >
            + Cadastrar Aluno
          </button>
        </div>

        <div className={styles.filterBar}>
          <input
            type="text"
            placeholder="Buscar aluno por nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.input}
            style={{ maxWidth: '400px' }}
          />
          {searchTerm && (
            <button onClick={handleClearSearch} className={styles.cancelBtn}>
              Limpar
            </button>
          )}
        </div>

        {isLoading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
            Carregando alunos...
          </div>
        ) : students.length === 0 && searchTerm ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
            <p>Nenhum aluno encontrado com o nome "{searchTerm}".</p>
          </div>
        ) : students.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
            <p>Use a busca acima para encontrar alunos por nome.</p>
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Data de Nascimento</th>
                  <th>Série</th>
                  <th>Turma</th>
                  <th>Professor(a)</th>
                  <th>Responsável</th>
                  <th>Telefone</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id}>
                    <td style={{ fontWeight: 500 }}>{student.name}</td>
                    <td>{formatDate(student.birthDate)}</td>
                    <td>{formatGrade(student.grade)}</td>
                    <td>{getClassName(student.class)}</td>
                    <td>{student.teacher || '-'}</td>
                    <td>{student.guardian?.name || '-'}</td>
                    <td>{student.guardian?.phone || '-'}</td>
                    <td>
                      <span
                        className={`${styles.statusBadge} ${
                          student.status === 'active' ? styles.ativo : styles.inativo
                        }`}
                      >
                        {student.status === 'active' ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actions} style={{ marginTop: 0 }}>
                        <button
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '1.1rem',
                          }}
                          onClick={() => navigate(`/dashboard/students/${student.id}`)}
                          title="Visualizar"
                        >
                          👁️
                        </button>
                        <button
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '1.1rem',
                          }}
                          onClick={() => handleDelete(student.id, student.name)}
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
          </div>
        )}
      </div>

      {/* Modal de Confirmação de Exclusão */}
      {showDeleteConfirm && studentToDelete && (
        <div className={detailsStyles.modal}>
          <div className={detailsStyles.modalOverlay} onClick={cancelDelete} />
          <div className={detailsStyles.modalContent}>
            <h3 className={detailsStyles.modalTitle}>Confirmar Exclusão</h3>
            <p className={detailsStyles.modalMessage}>
              Tem certeza que deseja excluir o aluno <strong>{studentToDelete.name}</strong>?
              <br />
              Esta ação não pode ser desfeita.
            </p>
            <div className={detailsStyles.modalActions}>
              <button onClick={cancelDelete} className={detailsStyles.modalCancelButton}>
                Cancelar
              </button>
              <button onClick={confirmDelete} className={detailsStyles.modalDeleteButton}>
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
