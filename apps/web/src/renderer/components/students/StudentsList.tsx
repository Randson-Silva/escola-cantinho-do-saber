import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../hooks/useToast';
import { studentService, type Student } from '../../services/studentService';
import styles from './students-list.module.css';
import detailsStyles from './student-details.module.css';

export function StudentsList() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    setIsLoading(true);
    try {
      // Tenta buscar da API
      const data = await studentService.listStudents();
      setStudents(data);
    } catch (error) {
      // Como a API não existe, busca do localStorage
      console.log('API não disponível. Carregando dados locais...');
      const localStudents = JSON.parse(localStorage.getItem('students') || '[]');
      setStudents(localStudents);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (id: string, name: string) => {
    setStudentToDelete({ id, name });
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!studentToDelete) return;

    try {
      await studentService.deleteStudent(studentToDelete.id);
      showToast('Aluno excluído com sucesso!', 'success');
      loadStudents();
    } catch (error) {
      // Remove do localStorage
      const updatedStudents = students.filter((s) => s.id !== studentToDelete.id);
      localStorage.setItem('students', JSON.stringify(updatedStudents));
      setStudents(updatedStudents);
      showToast('Aluno excluído com sucesso!', 'success');
    } finally {
      setShowDeleteConfirm(false);
      setStudentToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setStudentToDelete(null);
  };

  const filteredStudents = students.filter((student) =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Alunos Cadastrados</h1>
          <p className={styles.subtitle}>
            {students.length} {students.length === 1 ? 'aluno' : 'alunos'} cadastrado
            {students.length !== 1 && 's'}
          </p>
        </div>
        <button
          className={styles.addButton}
          onClick={() => navigate('/dashboard/students/register')}
        >
          + Cadastrar Aluno
        </button>
      </div>

      <div className={styles.searchBar}>
        <input
          type="text"
          placeholder="Buscar aluno por nome..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      {isLoading ? (
        <div className={styles.loading}>Carregando alunos...</div>
      ) : filteredStudents.length === 0 ? (
        <div className={styles.empty}>
          <p>Nenhum aluno encontrado.</p>
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className={styles.clearSearchButton}>
              Limpar busca
            </button>
          )}
        </div>
      ) : (
        <div className={styles.tableContainer}>
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
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student.id}>
                  <td className={styles.nameCell}>{student.name}</td>
                  <td>{formatDate(student.birthDate)}</td>
                  <td>{student.grade}º ano</td>
                  <td>{student.class}</td>
                  <td>{student.teacher}</td>
                  <td>{student.guardian.name}</td>
                  <td>{student.guardian.phone}</td>
                  <td>
                    <span
                      className={`${styles.statusBadge} ${
                        student.status === 'active' ? styles.statusActive : styles.statusInactive
                      }`}
                    >
                      {student.status === 'active' ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button
                        className={styles.viewButton}
                        onClick={() => navigate(`/dashboard/students/${student.id}`)}
                        title="Visualizar"
                      >
                        👁️
                      </button>
                      <button
                        className={styles.deleteButton}
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

