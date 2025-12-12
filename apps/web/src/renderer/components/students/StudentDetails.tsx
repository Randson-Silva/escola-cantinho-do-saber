import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '../../hooks/useToast';
import { studentService, type Student } from '../../services/studentService';
import { classService, type Class } from '../../services/classService';
import styles from './students.module.css';
import detailsStyles from './student-details.module.css';

export function StudentDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [student, setStudent] = useState<Student | null>(null);
  const [classes, setClasses] = useState<Class[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    loadStudent();
    loadClasses();
  }, [id]);

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

    // Se não encontrou por ID, pode ser o nome direto
    const classByName = classes.find((c) => c.name === classIdOrName);
    if (classByName) return classByName.name;

    // Retorna o valor original se não encontrar
    return classIdOrName;
  };

  const loadStudent = async () => {
    setIsLoading(true);
    try {
      if (!id) {
        navigate('/dashboard/students');
        return;
      }

      const data = await studentService.getStudentById(id);
      setStudent(data);
    } catch (error) {
      console.log('API não disponível. Carregando dados locais...');
      const localStudents = JSON.parse(localStorage.getItem('students') || '[]');
      const foundStudent = localStudents.find((s: Student) => s.id === id);

      if (foundStudent) {
        setStudent(foundStudent);
      } else {
        addToast('Aluno não encontrado', 'error');
        navigate('/dashboard/students');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;

    try {
      await studentService.deleteStudent(id);
      addToast('Aluno excluído com sucesso!', 'success');
      navigate('/dashboard/students');
    } catch (error) {
      const localStudents = JSON.parse(localStorage.getItem('students') || '[]');
      const updatedStudents = localStudents.filter((s: Student) => s.id !== id);
      localStorage.setItem('students', JSON.stringify(updatedStudents));
      addToast('Aluno excluído com sucesso!', 'success');
      navigate('/dashboard/students');
    } finally {
      setShowDeleteConfirm(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div style={{ textAlign: 'center', padding: '3rem' }}>Carregando dados do aluno...</div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className={styles.container}>
        <div style={{ textAlign: 'center', padding: '3rem' }}>Aluno não encontrado</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Ficha do Aluno: {student.name}</h1>
          <div className={styles.subtitle}>
            <span
              className={`${styles.statusBadge} ${
                student.status === 'active' ? styles.ativo : styles.inativo
              }`}
            >
              {student.status === 'active' ? 'Matrícula Ativa' : 'Matrícula Inativa'}
            </span>
          </div>
        </div>
        <div className={styles.actions}>
          <button onClick={() => navigate('/dashboard/students')} className={styles.cancelBtn}>
            Voltar
          </button>
          <button
            onClick={() => navigate(`/dashboard/students/${student.id}/edit`)}
            className={styles.saveBtn}
          >
            ✏️ Editar
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className={styles.cancelBtn}
            style={{ color: '#dc2626', background: '#fee2e2' }}
          >
            🗑️ Excluir
          </button>
        </div>
      </div>

      <div className={styles.card}>
        {/* Dados do Aluno */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Dados do Aluno</h2>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Nome Completo</label>
              <div className={styles.input} style={{ background: '#f9fafb' }}>
                {student.name}
              </div>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Data de Nascimento</label>
              <div className={styles.input} style={{ background: '#f9fafb' }}>
                {formatDate(student.birthDate)}
              </div>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Série</label>
              <div className={styles.input} style={{ background: '#f9fafb' }}>
                {student.grade}º ano
              </div>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Escola</label>
              <div className={styles.input} style={{ background: '#f9fafb' }}>
                {student.schoolType === 'publica' ? 'Pública' : 'Particular'}
              </div>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Turma</label>
              <div className={styles.input} style={{ background: '#f9fafb' }}>
                {getClassName(student.class)}
              </div>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Professor(a)</label>
              <div className={styles.input} style={{ background: '#f9fafb' }}>
                {student.teacher}
              </div>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Mensalidade</label>
              <div className={styles.input} style={{ background: '#f9fafb' }}>
                R${' '}
                {Number(student.monthlyFee || 0)
                  .toFixed(2)
                  .replace('.', ',')}
              </div>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Data de Matrícula</label>
              <div className={styles.input} style={{ background: '#f9fafb' }}>
                {formatDate(student.enrollmentDate)}
              </div>
            </div>
          </div>
        </div>

        {/* Endereço do Aluno */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Endereço do Aluno</h2>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Rua</label>
              <div className={styles.input} style={{ background: '#f9fafb' }}>
                {student.address?.street || '-'}
              </div>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Número</label>
              <div className={styles.input} style={{ background: '#f9fafb' }}>
                {student.address?.number || '-'}
              </div>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Bairro</label>
              <div className={styles.input} style={{ background: '#f9fafb' }}>
                {student.address?.neighborhood || '-'}
              </div>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Complemento</label>
              <div className={styles.input} style={{ background: '#f9fafb' }}>
                {student.address?.complement || '-'}
              </div>
            </div>
          </div>
        </div>

        {/* Dados do Responsável */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Dados do Responsável</h2>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Nome Completo</label>
              <div className={styles.input} style={{ background: '#f9fafb' }}>
                {student.guardian?.name || '-'}
              </div>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Parentesco</label>
              <div className={styles.input} style={{ background: '#f9fafb' }}>
                {student.guardian?.relationship || '-'}
              </div>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Telefone</label>
              <div className={styles.input} style={{ background: '#f9fafb' }}>
                {student.guardian?.phone || '-'}
              </div>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>E-mail</label>
              <div className={styles.input} style={{ background: '#f9fafb' }}>
                {student.guardian?.email || '-'}
              </div>
            </div>
          </div>
        </div>

        {/* Endereço do Responsável */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Endereço do Responsável</h2>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Rua</label>
              <div className={styles.input} style={{ background: '#f9fafb' }}>
                {student.guardian?.address?.street || '-'}
              </div>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Número</label>
              <div className={styles.input} style={{ background: '#f9fafb' }}>
                {student.guardian?.address?.number || '-'}
              </div>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Bairro</label>
              <div className={styles.input} style={{ background: '#f9fafb' }}>
                {student.guardian?.address?.neighborhood || '-'}
              </div>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Complemento</label>
              <div className={styles.input} style={{ background: '#f9fafb' }}>
                {student.guardian?.address?.complement || '-'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Confirmação de Exclusão */}
      {showDeleteConfirm && (
        <div className={detailsStyles.modal}>
          <div className={detailsStyles.modalOverlay} onClick={() => setShowDeleteConfirm(false)} />
          <div className={detailsStyles.modalContent}>
            <h3 className={detailsStyles.modalTitle}>Confirmar Exclusão</h3>
            <p className={detailsStyles.modalMessage}>
              Tem certeza que deseja excluir o aluno <strong>{student.name}</strong>?
              <br />
              Esta ação não pode ser desfeita.
            </p>
            <div className={detailsStyles.modalActions}>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className={detailsStyles.modalCancelButton}
              >
                Cancelar
              </button>
              <button onClick={handleDelete} className={detailsStyles.modalDeleteButton}>
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
