import { useState, useEffect, ChangeEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '../../hooks/useToast';
import { studentService, type Student, type CreateStudentDTO } from '../../services/studentService';
import styles from './student-details.module.css';

export function StudentDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [student, setStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<CreateStudentDTO | null>(null);

  useEffect(() => {
    loadStudent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadStudent = async () => {
    setIsLoading(true);
    try {
      if (!id) {
        navigate('/dashboard/students');
        return;
      }

      // Tenta buscar da API
      const data = await studentService.getStudentById(id);
      setStudent(data);
    } catch (error) {
      // Como a API não existe, busca do localStorage
      console.log('API não disponível. Carregando dados locais...');
      const localStudents = JSON.parse(localStorage.getItem('students') || '[]');
      const foundStudent = localStudents.find((s: Student) => s.id === id);

      if (foundStudent) {
        setStudent(foundStudent);
        prepareEditData(foundStudent);
      } else {
  addToast('Aluno não encontrado', 'error');
        navigate('/dashboard/students');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const prepareEditData = (studentData: Student) => {
    const birthDateFormatted = studentData.birthDate.split('T')[0];
    setEditData({
      name: studentData.name,
      birthDate: birthDateFormatted,
      grade: studentData.grade,
      schoolType: studentData.schoolType,
      class: studentData.class,
      teacher: studentData.teacher,
      monthlyFee: studentData.monthlyFee,
      address: studentData.address,
      guardian: studentData.guardian,
      status: studentData.status,
    });
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    if (student) prepareEditData(student);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!id || !editData) return;

    try {
      await studentService.updateStudent(id, editData);
  addToast('Aluno atualizado com sucesso!', 'success');
      await loadStudent();
      setIsEditing(false);
      navigate('/dashboard/students');
    } catch (error) {
      console.log('API não disponível. Salvando dados localmente...');
      const localStudents = JSON.parse(localStorage.getItem('students') || '[]');
      const updatedStudents = localStudents.map((s: Student) =>
        s.id === id ? { ...s, ...editData } : s,
      );
      localStorage.setItem('students', JSON.stringify(updatedStudents));
  addToast('Aluno atualizado com sucesso!', 'success');
      await loadStudent();
      setIsEditing(false);
      navigate('/dashboard/students');
    }
  };

  const handleDelete = async () => {
    if (!id) return;

    try {
      await studentService.deleteStudent(id);
  addToast('Aluno excluído com sucesso!', 'success');
      navigate('/dashboard/students');
    } catch (error) {
      // Remove do localStorage
      const localStudents = JSON.parse(localStorage.getItem('students') || '[]');
      const updatedStudents = localStudents.filter((s: Student) => s.id !== id);
      localStorage.setItem('students', JSON.stringify(updatedStudents));
  addToast('Aluno excluído com sucesso!', 'success');
      navigate('/dashboard/students');
    } finally {
      setShowDeleteConfirm(false);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!editData) return;
    const { name, value } = e.target;

    if (name.startsWith('address.')) {
      const field = name.split('.')[1];
      setEditData({
        ...editData,
        address: { ...editData.address, [field]: value },
      });
    } else if (name.startsWith('guardian.address.')) {
      const field = name.split('.')[2];
      setEditData({
        ...editData,
        guardian: {
          ...editData.guardian,
          address: { ...editData.guardian.address, [field]: value },
        },
      });
    } else if (name.startsWith('guardian.')) {
      const field = name.split('.')[1];
      setEditData({
        ...editData,
        guardian: { ...editData.guardian, [field]: value },
      });
    } else {
      // Converte monthlyFee para número
      const finalValue = name === 'monthlyFee' ? Number(value) : value;
      setEditData({ ...editData, [name]: finalValue });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Carregando dados do aluno...</div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className={styles.container}>
        <div className={styles.notFound}>Aluno não encontrado</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
        <div>
          <button onClick={() => navigate('/dashboard/students')} className={styles.backButton}>
            ← Voltar para Lista
          </button>
          <h1 className={styles.title}>
            {isEditing ? 'Editar Aluno' : `Ficha do Aluno: ${student.name}`}
          </h1>
          {!isEditing && (
            <div className={styles.statusBadge}>
              <span className={student.status === 'active' ? styles.active : styles.inactive}>
                {student.status === 'active' ? 'Matrícula Ativa' : 'Matrícula Inativa'}
              </span>
            </div>
          )}
        </div>
        {!isEditing && (
          <div className={styles.actions}>
            <button onClick={handleEdit} className={styles.editButton}>
              ✏️ Editar
            </button>
            <button onClick={() => setShowDeleteConfirm(true)} className={styles.deleteButton}>
              🗑️ Excluir
            </button>
          </div>
        )}
      </div>
        <div className={styles.content}>
        {/* Dados do Aluno */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Dados do Aluno</h2>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Nome Completo:</span>
              {isEditing && editData ? (
                <input
                  type="text"
                  name="name"
                  value={editData.name}
                  onChange={handleInputChange}
                  className={styles.editInput}
                  required
                />
              ) : (
                <span className={styles.infoValue}>{student.name}</span>
              )}
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Data de Nascimento:</span>
              {isEditing && editData ? (
                <input
                  type="date"
                  name="birthDate"
                  value={editData.birthDate}
                  onChange={handleInputChange}
                  className={styles.editInput}
                  required
                />
              ) : (
                <span className={styles.infoValue}>{formatDate(student.birthDate)}</span>
              )}
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Série:</span>
              {isEditing && editData ? (
                <select
                  name="grade"
                  value={editData.grade}
                  onChange={handleInputChange}
                  className={styles.editSelect}
                  required
                >
                  <option value="1">1º ano</option>
                  <option value="2">2º ano</option>
                  <option value="3">3º ano</option>
                  <option value="4">4º ano</option>
                  <option value="5">5º ano</option>
                  <option value="6">6º ano</option>
                  <option value="7">7º ano</option>
                </select>
              ) : (
                <span className={styles.infoValue}>{student.grade}º ano</span>
              )}
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Escola:</span>
              {isEditing && editData ? (
                <select
                  name="schoolType"
                  value={editData.schoolType}
                  onChange={handleInputChange}
                  className={styles.editSelect}
                  required
                >
                  <option value="publica">Pública</option>
                  <option value="particular">Particular</option>
                </select>
              ) : (
                <span className={styles.infoValue}>
                  {student.schoolType === 'publica' ? 'Pública' : 'Particular'}
                </span>
              )}
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Turma:</span>
              {isEditing && editData ? (
                <select
                  name="class"
                  value={editData.class}
                  onChange={handleInputChange}
                  className={styles.editSelect}
                  required
                >
                  <option value="">Selecione a turma</option>
                  <option value="Turma A - Manhã">Turma A - Manhã</option>
                  <option value="Turma B - Manhã">Turma B - Manhã</option>
                  <option value="Turma C - Tarde">Turma C - Tarde</option>
                  <option value="Turma D - Tarde">Turma D - Tarde</option>
                  <option value="Turma E - Integral">Turma E - Integral</option>
                </select>
              ) : (
                <span className={styles.infoValue}>{student.class}</span>
              )}
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Professor(a):</span>
              {isEditing && editData ? (
                <input
                  type="text"
                  name="teacher"
                  value={editData.teacher}
                  onChange={handleInputChange}
                  className={styles.editInput}
                  required
                />
              ) : (
                <span className={styles.infoValue}>{student.teacher}</span>
              )}
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Mensalidade:</span>
              {isEditing && editData ? (
                <input
                  type="number"
                  name="monthlyFee"
                  value={editData.monthlyFee}
                  onChange={handleInputChange}
                  className={styles.editInput}
                  step="0.01"
                  min="0"
                  required
                />
              ) : (
                <span className={styles.infoValue}>
                  R${' '}
                  {Number(student.monthlyFee || 0)
                    .toFixed(2)
                    .replace('.', ',')}
                </span>
              )}
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Status da Matrícula:</span>
              {isEditing && editData ? (
                <select
                  name="status"
                  value={editData.status}
                  onChange={handleInputChange}
                  className={styles.editSelect}
                >
                  <option value="active">Matrícula Ativa</option>
                  <option value="inactive">Matrícula Inativa</option>
                </select>
              ) : (
                <span className={styles.infoValue}>
                  {student.status === 'active' ? 'Matrícula Ativa' : 'Matrícula Inativa'}
                </span>
              )}
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Data de Matrícula:</span>
              <span className={styles.infoValue}>{formatDate(student.enrollmentDate)}</span>
            </div>
          </div>
        </section>

        {/* Endereço do Aluno */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Endereço do Aluno</h2>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Rua:</span>
              {isEditing && editData ? (
                <input
                  type="text"
                  name="address.street"
                  value={editData.address.street}
                  onChange={handleInputChange}
                  className={styles.editInput}
                  required
                />
              ) : (
                <span className={styles.infoValue}>{student.address.street}</span>
              )}
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Número:</span>
              {isEditing && editData ? (
                <input
                  type="text"
                  name="address.number"
                  value={editData.address.number}
                  onChange={handleInputChange}
                  className={styles.editInput}
                  required
                />
              ) : (
                <span className={styles.infoValue}>{student.address.number}</span>
              )}
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Bairro:</span>
              {isEditing && editData ? (
                <input
                  type="text"
                  name="address.neighborhood"
                  value={editData.address.neighborhood}
                  onChange={handleInputChange}
                  className={styles.editInput}
                  required
                />
              ) : (
                <span className={styles.infoValue}>{student.address.neighborhood}</span>
              )}
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Complemento:</span>
              {isEditing && editData ? (
                <input
                  type="text"
                  name="address.complement"
                  value={editData.address.complement}
                  onChange={handleInputChange}
                  className={styles.editInput}
                />
              ) : (
                student.address.complement && (
                  <span className={styles.infoValue}>{student.address.complement}</span>
                )
              )}
            </div>
          </div>
        </section>

        {/* Dados do Responsável */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Dados do Responsável</h2>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Nome Completo:</span>
              {isEditing && editData ? (
                <input
                  type="text"
                  name="guardian.name"
                  value={editData.guardian.name}
                  onChange={handleInputChange}
                  className={styles.editInput}
                  required
                />
              ) : (
                <span className={styles.infoValue}>{student.guardian.name}</span>
              )}
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Parentesco:</span>
              {isEditing && editData ? (
                <input
                  type="text"
                  name="guardian.relationship"
                  value={editData.guardian.relationship}
                  onChange={handleInputChange}
                  className={styles.editInput}
                  required
                />
              ) : (
                <span className={styles.infoValue}>{student.guardian.relationship}</span>
              )}
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Telefone:</span>
              {isEditing && editData ? (
                <input
                  type="tel"
                  name="guardian.phone"
                  value={editData.guardian.phone}
                  onChange={handleInputChange}
                  className={styles.editInput}
                  required
                />
              ) : (
                <span className={styles.infoValue}>{student.guardian.phone}</span>
              )}
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>E-mail:</span>
              {isEditing && editData ? (
                <input
                  type="email"
                  name="guardian.email"
                  value={editData.guardian.email}
                  onChange={handleInputChange}
                  className={styles.editInput}
                  required
                />
              ) : (
                <span className={styles.infoValue}>{student.guardian.email}</span>
              )}
            </div>
          </div>
        </section>

        {/* Endereço do Responsável */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Endereço do Responsável</h2>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Rua:</span>
              {isEditing && editData ? (
                <input
                  type="text"
                  name="guardian.address.street"
                  value={editData.guardian.address.street}
                  onChange={handleInputChange}
                  className={styles.editInput}
                  required
                />
              ) : (
                <span className={styles.infoValue}>{student.guardian.address.street}</span>
              )}
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Número:</span>
              {isEditing && editData ? (
                <input
                  type="text"
                  name="guardian.address.number"
                  value={editData.guardian.address.number}
                  onChange={handleInputChange}
                  className={styles.editInput}
                  required
                />
              ) : (
                <span className={styles.infoValue}>{student.guardian.address.number}</span>
              )}
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Bairro:</span>
              {isEditing && editData ? (
                <input
                  type="text"
                  name="guardian.address.neighborhood"
                  value={editData.guardian.address.neighborhood}
                  onChange={handleInputChange}
                  className={styles.editInput}
                  required
                />
              ) : (
                <span className={styles.infoValue}>{student.guardian.address.neighborhood}</span>
              )}
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Complemento:</span>
              {isEditing && editData ? (
                <input
                  type="text"
                  name="guardian.address.complement"
                  value={editData.guardian.address.complement}
                  onChange={handleInputChange}
                  className={styles.editInput}
                />
              ) : (
                student.guardian.address.complement && (
                  <span className={styles.infoValue}>{student.guardian.address.complement}</span>
                )
              )}
            </div>
          </div>

          {isEditing && (
            <div className={styles.editActions}>
              <button onClick={handleCancelEdit} className={styles.cancelButton}>
                Cancelar
              </button>
              <button onClick={() => setShowSaveConfirm(true)} className={styles.saveButton}>
                Salvar Alterações
              </button>
            </div>
          )}
        </section>
      </div>

      {/* Modal de Confirmação de Exclusão */}
        {showDeleteConfirm && (
        <div className={styles.modal}>
          <div className={styles.modalOverlay} onClick={() => setShowDeleteConfirm(false)} />
          <div className={styles.modalContent}>
            <h3 className={styles.modalTitle}>Confirmar Exclusão</h3>
            <p className={styles.modalMessage}>
              Tem certeza que deseja excluir o aluno <strong>{student.name}</strong>?
              <br />
              Esta ação não pode ser desfeita.
            </p>
            <div className={styles.modalActions}>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className={styles.modalCancelButton}
              >
                Cancelar
              </button>
              <button onClick={handleDelete} className={styles.modalDeleteButton}>
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Salvamento */}
        {showSaveConfirm && (
        <div className={styles.modal}>
          <div className={styles.modalOverlay} onClick={() => setShowSaveConfirm(false)} />
          <div className={styles.modalContent}>
            <h3 className={styles.modalTitle}>Confirmar Alterações</h3>
            <p className={styles.modalMessage}>
              Deseja salvar as alterações realizadas no cadastro de <strong>{student.name}</strong>?
            </p>
            <div className={styles.modalActions}>
              <button
                onClick={() => setShowSaveConfirm(false)}
                className={styles.modalCancelButton}
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setShowSaveConfirm(false);
                  handleSave();
                }}
                className={styles.saveButton}
              >
                Confirmar Salvar
              </button>
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}

