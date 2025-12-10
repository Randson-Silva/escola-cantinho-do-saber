import os

file_path = r"c:\Users\ediva\escola-cantinho-do-saber\apps\web\src\renderer\components\students\StudentsList.tsx"

new_content = """import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../../hooks/useToast';
import { useDebounce } from '../../hooks/useDebounce';
import { studentService, type Student } from '../../services/studentService';
import styles from './students.module.css';
import detailsStyles from './student-details.module.css';

export function StudentsList() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    loadTotalCount();
  }, []);

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
      const data = await studentService.searchStudentsByName(term);
      setStudents(data);
    } catch (error) {
      console.error('Erro ao buscar alunos:', error);
      addToast('Erro ao buscar alunos', 'error');
      setStudents([]);
    } finally {
      setIsLoading(false);
    }
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
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Alunos</h1>
            <p className={styles.subtitle}>
              {totalCount !== null
                ? `${totalCount} ${totalCount === 1 ? 'aluno' : 'alunos'} no sistema`
                : 'Gerencie os alunos'}
            </p>
          </div>
          <button
            className={styles.saveBtn}
            onClick={() => navigate('/dashboard/students/register')}
          >
            Novo Aluno
          </button>
        </div>

        <div className={styles.filterBar}>
          <input
            type="text"
            placeholder="Buscar aluno por nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.input}
          />
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Série/Turma</th>
                <th>Responsável</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id}>
                  <td>
                    <div style={{ fontWeight: 500 }}>{student.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#666' }}>
                      Nasc: {formatDate(student.birthDate)}
                    </div>
                  </td>
                  <td>
                    <div>{student.grade}º ano</div>
                    <div style={{ fontSize: '0.75rem', color: '#666' }}>{student.class}</div>
                  </td>
                  <td>
                    <div>{student.guardian.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#666' }}>{student.guardian.phone}</div>
                  </td>
                  <td>
                    <span
                      className={`${styles.statusBadge} ${
                        student.status === 'active' ? styles.ativo : styles.inativo
                      }`}
                    >
                      {student.status === 'active' ? 'ATIVO' : 'INATIVO'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                      <Link 
                        to={`/dashboard/students/${student.id}`} 
                        style={{ fontSize: '0.85rem', color: '#2563eb', textDecoration: 'none', fontWeight: 500 }}
                      >
                        Editar
                      </Link>
                      <button
                        onClick={() => handleDelete(student.id, student.name)}
                        style={{ border: 'none', background: 'none', color: '#dc2626', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500 }}
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                    {searchTerm ? 'Nenhum aluno encontrado.' : 'Use a busca para encontrar alunos.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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
"""

with open(file_path, "w", encoding="utf-8") as f:
    f.write(new_content)
