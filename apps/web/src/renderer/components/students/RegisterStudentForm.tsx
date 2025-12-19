import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../hooks/useToast';
import { studentService, type StudentFormData } from '../../services/studentService';
import { classService } from '../../services/classService';
import { SmartScheduleSearch } from './SmartScheduleSearch';
import { EnrollmentSummary } from './EnrollmentSummary';
import { maskPhone } from '../../utils/masks';
import styles from './students.module.css';

export function RegisterStudentForm() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<'form' | 'schedule' | 'summary'>('form');
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{ start: string; end: string } | null>(
    null,
  );

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
  });

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name.startsWith('address.')) {
      const field = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        address: { ...prev.address, [field]: value },
      }));
    } else if (name.startsWith('guardian.address.')) {
      const field = name.split('.')[2];
      setFormData((prev) => ({
        ...prev,
        guardian: {
          ...prev.guardian,
          address: { ...prev.guardian.address, [field]: value },
        },
      }));
    } else if (name.startsWith('guardian.')) {
      const field = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        guardian: { ...prev.guardian, [field]: value },
      }));
    } else {
      const finalValue = name === 'monthlyFee' ? Number(value) : value;
      setFormData((prev) => ({ ...prev, [name]: finalValue }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Validação básica dos campos obrigatórios
    if (!formData.name.trim() || !formData.birthDate || !formData.guardian.name.trim()) {
      addToast('Preencha todos os campos obrigatórios', 'error');
      return;
    }

    // Não salva ainda - apenas avança para seleção de turma
    addToast('Dados validados! Selecione a turma.', 'success');
    setStep('schedule');
  };

  const handleCancel = () => {
    navigate('/dashboard/students');
  };

  const handleScheduleNext = (cls: any, timeSlot: { start: string; end: string }) => {
    setSelectedClass(cls);
    setSelectedTimeSlot(timeSlot);
    setStep('summary');
  };

  const handleEnrollmentConfirm = async (financialData: {
    monthlyFee: number;
    firstPaymentDate: string;
  }) => {
    setIsSubmitting(true);

    try {
      // Monta os dados completos do aluno com turma e valores
      const completeStudentData: StudentFormData = {
        ...formData,
        class: selectedClass.id, // Salva o ID da turma para filtrar na frequência
        teacher: selectedClass.professor,
        monthlyFee: financialData.monthlyFee,
      };

      // Agora sim salva o aluno no mock
      const result = await studentService.createStudent(completeStudentData);

      // Adiciona o aluno ao slot da turma
      if (result && result.id && selectedTimeSlot) {
        await classService.addStudentToSlot(
          selectedClass.id,
          result.id,
          formData.name, // Usa o nome do formData
          selectedTimeSlot.start,
          selectedTimeSlot.end,
        );

        // Atualiza com dados adicionais de agendamento
        const localStudents: any[] = JSON.parse(localStorage.getItem('students') || '[]');
        const studentIndex = localStudents.findIndex((s: any) => s.id === result.id);

        if (studentIndex >= 0) {
          localStudents[studentIndex] = {
            ...localStudents[studentIndex],
            classId: selectedClass.id,
            schedule: {
              shift: selectedClass.turno,
              ...selectedTimeSlot,
            },
            firstPaymentDate: financialData.firstPaymentDate,
          };
          localStorage.setItem('students', JSON.stringify(localStudents));
        }
      }

      addToast('Matrícula realizada com sucesso!', 'success');
      navigate('/dashboard/students');
    } catch (error: any) {
      console.error('Erro ao finalizar matrícula:', error);
      addToast(error.message || 'Erro ao finalizar matrícula', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === 'schedule') {
    return (
      <SmartScheduleSearch
        studentGrade={formData.grade}
        onBack={() => setStep('form')}
        onNext={handleScheduleNext}
      />
    );
  }

  if (step === 'summary' && selectedClass && selectedTimeSlot) {
    return (
      <EnrollmentSummary
        studentData={formData}
        classData={selectedClass}
        scheduleData={selectedTimeSlot}
        onBack={() => setStep('schedule')}
        onConfirm={handleEnrollmentConfirm}
      />
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Cadastrar Novo Aluno</h1>
          <p className={styles.subtitle}>Preencha os dados do aluno e do responsável</p>
        </div>
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
                  <option value="series-1-ano">1º ano</option>
                  <option value="series-2-ano">2º ano</option>
                  <option value="series-3-ano">3º ano</option>
                  <option value="series-4-ano">4º ano</option>
                  <option value="series-5-ano">5º ano</option>
                  <option value="series-6-ano">6º ano</option>
                  <option value="series-7-ano">7º ano</option>
                  <option value="series-8-ano">8º ano</option>
                  <option value="series-9-ano">9º ano</option>
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
                <label htmlFor="teacher" className={styles.label}>
                  Professor(a)
                </label>
                <input
                  type="text"
                  id="teacher"
                  name="teacher"
                  value={formData.teacher}
                  onChange={handleInputChange}
                  className={styles.input}
                  placeholder="Nome do professor(a)"
                />
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

          {/* Botões */}
          <div className={styles.actions}>
            <button
              type="button"
              onClick={handleCancel}
              className={styles.cancelBtn}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button type="submit" className={styles.saveBtn} disabled={isSubmitting}>
              {isSubmitting ? 'Cadastrando...' : 'Cadastrar Aluno'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
