import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '../../hooks/useToast';
import { studentService, type Student, type StudentFormData } from '../../services/studentService';
import { classService, type Class } from '../../services/classService';
import { maskPhone } from '../../utils/masks';
import styles from './students.module.css';

// Mapeamento de grade do aluno para competência da turma
const GRADE_TO_COMPETENCIA: Record<string, string> = {
  'series-1-ano': '1º Ano',
  'series-2-ano': '2º Ano',
  'series-3-ano': '3º Ano',
  'series-4-ano': '4º Ano',
  'series-5-ano': '5º Ano',
  'series-6-ano': '6º Ano',
  'series-7-ano': '7º Ano',
  'series-8-ano': '8º Ano',
  'series-9-ano': '9º Ano',
};

export function EditStudentForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [availableClasses, setAvailableClasses] = useState<Class[]>([]);
  const [formData, setFormData] = useState<StudentFormData>({
    name: '',
    birthDate: '',
    grade: 'series-1-ano',
    schoolType: 'publica',
    class: '',
    teacher: '',
    monthlyFee: 0,
    address: {
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
    },
    guardian: {
      name: '',
      relationship: '',
      phone: '',
      email: '',
      address: {
        street: '',
        number: '',
        complement: '',
        neighborhood: '',
      },
    },
    status: 'active',
    enrollmentDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    loadStudent();
    loadClasses();
  }, [id]);

  const loadStudent = async () => {
    setIsLoading(true);
    try {
      if (!id) {
        navigate('/dashboard/students');
        return;
      }

      const data = await studentService.getStudentById(id);

      // Converte a data para o formato do input (YYYY-MM-DD)
      const birthDateFormatted = data.birthDate.split('T')[0];
      const enrollmentDateFormatted = data.enrollmentDate.split('T')[0];

      setFormData({
        name: data.name,
        birthDate: birthDateFormatted,
        grade: data.grade,
        schoolType: data.schoolType,
        class: data.class,
        teacher: data.teacher,
        monthlyFee: data.monthlyFee || 0,
        address: data.address,
        guardian: data.guardian,
        status: data.status,
        enrollmentDate: enrollmentDateFormatted,
      });
    } catch (error) {
      console.log('API não disponível. Carregando dados locais...');
      const localStudents = JSON.parse(localStorage.getItem('students') || '[]');
      const foundStudent = localStudents.find((s: Student) => s.id === id);

      if (foundStudent) {
        const birthDateFormatted = foundStudent.birthDate?.split('T')[0] || '';
        const enrollmentDateFormatted = foundStudent.enrollmentDate?.split('T')[0] || '';

        setFormData({
          name: foundStudent.name || '',
          birthDate: birthDateFormatted,
          grade: foundStudent.grade || 'series-1-ano',
          schoolType: foundStudent.schoolType || 'publica',
          class: foundStudent.class || '',
          teacher: foundStudent.teacher || '',
          monthlyFee: foundStudent.monthlyFee || 0,
          address: foundStudent.address || {
            street: '',
            number: '',
            complement: '',
            neighborhood: '',
          },
          guardian: foundStudent.guardian || {
            name: '',
            relationship: '',
            phone: '',
            email: '',
            address: { street: '', number: '', complement: '', neighborhood: '' },
          },
          status: foundStudent.status || 'active',
          enrollmentDate: enrollmentDateFormatted,
        });
      } else {
        addToast('Aluno não encontrado', 'error');
        navigate('/dashboard/students');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadClasses = async () => {
    try {
      const classes = await classService.getAll();
      setAvailableClasses(classes);
    } catch (error) {
      console.error('Erro ao carregar turmas:', error);
    }
  };

  // Filtra turmas baseado na série do aluno
  const getFilteredClasses = () => {
    const competencia = GRADE_TO_COMPETENCIA[formData.grade];
    if (!competencia) return availableClasses;

    return availableClasses.filter(
      (cls) => cls.competencias && cls.competencias.includes(competencia),
    );
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value,
        },
      }));
    } else if (name.startsWith('guardian.address.')) {
      const addressField = name.split('.')[2];
      setFormData((prev) => ({
        ...prev,
        guardian: {
          ...prev.guardian,
          address: {
            ...prev.guardian.address,
            [addressField]: value,
          },
        },
      }));
    } else if (name.startsWith('guardian.')) {
      const guardianField = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        guardian: {
          ...prev.guardian,
          [guardianField]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!id) return;

    try {
      await studentService.updateStudent(id, formData);
      addToast('Aluno atualizado com sucesso!', 'success');
      setTimeout(() => {
        navigate(`/dashboard/students/${id}`);
      }, 1000);
    } catch (error) {
      console.log('API não disponível. Salvando dados localmente...');
      const localStudents = JSON.parse(localStorage.getItem('students') || '[]');
      const updatedStudents = localStudents.map((s: Student) =>
        s.id === id ? { ...s, ...formData } : s,
      );
      localStorage.setItem('students', JSON.stringify(updatedStudents));
      addToast('Aluno atualizado com sucesso!', 'success');
      setTimeout(() => {
        navigate(`/dashboard/students/${id}`);
      }, 1000);
    }
  };

  const handleCancel = () => {
    navigate(`/dashboard/students/${id}`);
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div style={{ textAlign: 'center', padding: '3rem' }}>Carregando dados do aluno...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Editar Aluno</h1>
          <p className={styles.subtitle}>Atualize as informações do aluno</p>
        </div>
        <button onClick={() => navigate(`/dashboard/students/${id}`)} className={styles.cancelBtn}>
          ← Voltar
        </button>
      </div>

      <div className={styles.card}>
        <form onSubmit={handleSubmit}>
          {/* Dados do Aluno */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Dados do Aluno</h2>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label htmlFor="name" className={styles.label}>
                  Nome Completo <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={styles.input}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="birthDate" className={styles.label}>
                  Data de Nascimento <span className={styles.required}>*</span>
                </label>
                <input
                  type="date"
                  id="birthDate"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleInputChange}
                  className={styles.input}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="grade" className={styles.label}>
                  Série <span className={styles.required}>*</span>
                </label>
                <select
                  id="grade"
                  name="grade"
                  value={formData.grade}
                  onChange={handleInputChange}
                  className={styles.select}
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
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="schoolType" className={styles.label}>
                  Escola <span className={styles.required}>*</span>
                </label>
                <select
                  id="schoolType"
                  name="schoolType"
                  value={formData.schoolType}
                  onChange={handleInputChange}
                  className={styles.select}
                  required
                >
                  <option value="publica">Pública</option>
                  <option value="particular">Particular</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="class" className={styles.label}>
                  Turma <span className={styles.required}>*</span>
                </label>
                <select
                  id="class"
                  name="class"
                  value={formData.class}
                  onChange={handleInputChange}
                  className={styles.select}
                  required
                >
                  <option value="">Selecione uma turma</option>
                  {getFilteredClasses().map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} - {cls.shift === 'MANHA' ? 'Manhã' : 'Tarde'}
                    </option>
                  ))}
                  {getFilteredClasses().length === 0 && (
                    <option value="" disabled>
                      Nenhuma turma disponível para esta série
                    </option>
                  )}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="teacher" className={styles.label}>
                  Professor(a) <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  id="teacher"
                  name="teacher"
                  value={formData.teacher}
                  onChange={handleInputChange}
                  className={styles.input}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="status" className={styles.label}>
                  Status <span className={styles.required}>*</span>
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className={styles.select}
                  required
                >
                  <option value="active">Ativo</option>
                  <option value="inactive">Inativo</option>
                </select>
              </div>
            </div>
          </div>

          {/* Endereço do Aluno */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Endereço do Aluno</h2>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label htmlFor="address.street" className={styles.label}>
                  Rua <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  id="address.street"
                  name="address.street"
                  value={formData.address.street}
                  onChange={handleInputChange}
                  className={styles.input}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="address.number" className={styles.label}>
                  Número <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  id="address.number"
                  name="address.number"
                  value={formData.address.number}
                  onChange={handleInputChange}
                  className={styles.input}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="address.neighborhood" className={styles.label}>
                  Bairro <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  id="address.neighborhood"
                  name="address.neighborhood"
                  value={formData.address.neighborhood}
                  onChange={handleInputChange}
                  className={styles.input}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="address.complement" className={styles.label}>
                  Complemento
                </label>
                <input
                  type="text"
                  id="address.complement"
                  name="address.complement"
                  value={formData.address.complement}
                  onChange={handleInputChange}
                  className={styles.input}
                />
              </div>
            </div>
          </div>

          {/* Dados do Responsável */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Dados do Responsável</h2>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label htmlFor="guardian.name" className={styles.label}>
                  Nome Completo <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  id="guardian.name"
                  name="guardian.name"
                  value={formData.guardian.name}
                  onChange={handleInputChange}
                  className={styles.input}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="guardian.relationship" className={styles.label}>
                  Parentesco <span className={styles.required}>*</span>
                </label>
                <select
                  id="guardian.relationship"
                  name="guardian.relationship"
                  value={formData.guardian.relationship}
                  onChange={handleInputChange}
                  className={styles.select}
                  required
                >
                  <option value="">Selecione...</option>
                  <option value="Pai/Mãe">Pai / Mãe</option>
                  <option value="Tio/Tia">Tio / Tia</option>
                  <option value="Irmão/Irmã">Irmão / Irmã</option>
                  <option value="Avô/Avó">Avô / Avó</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="guardian.phone" className={styles.label}>
                  Telefone <span className={styles.required}>*</span>
                </label>
                <input
                  type="tel"
                  id="guardian.phone"
                  name="guardian.phone"
                  value={formData.guardian.phone}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      guardian: { ...prev.guardian, phone: maskPhone(e.target.value) },
                    }));
                  }}
                  className={styles.input}
                  placeholder="(00) 00000-0000"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="guardian.email" className={styles.label}>
                  E-mail
                </label>
                <input
                  type="email"
                  id="guardian.email"
                  name="guardian.email"
                  value={formData.guardian.email}
                  onChange={handleInputChange}
                  className={styles.input}
                />
              </div>
            </div>
          </div>

          {/* Endereço do Responsável */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Endereço do Responsável</h2>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label htmlFor="guardian.address.street" className={styles.label}>
                  Rua <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  id="guardian.address.street"
                  name="guardian.address.street"
                  value={formData.guardian.address.street}
                  onChange={handleInputChange}
                  className={styles.input}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="guardian.address.number" className={styles.label}>
                  Número <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  id="guardian.address.number"
                  name="guardian.address.number"
                  value={formData.guardian.address.number}
                  onChange={handleInputChange}
                  className={styles.input}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="guardian.address.neighborhood" className={styles.label}>
                  Bairro <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  id="guardian.address.neighborhood"
                  name="guardian.address.neighborhood"
                  value={formData.guardian.address.neighborhood}
                  onChange={handleInputChange}
                  className={styles.input}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="guardian.address.complement" className={styles.label}>
                  Complemento
                </label>
                <input
                  type="text"
                  id="guardian.address.complement"
                  name="guardian.address.complement"
                  value={formData.guardian.address.complement}
                  onChange={handleInputChange}
                  className={styles.input}
                />
              </div>
            </div>
          </div>

          <div className={styles.actions}>
            <button type="button" onClick={handleCancel} className={styles.cancelBtn}>
              Cancelar
            </button>
            <button type="submit" className={styles.saveBtn}>
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
