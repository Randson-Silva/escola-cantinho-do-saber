import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useToast } from '../../hooks/useToast';
import { useAuth } from '../../hooks/useAuth';
import {
  classService,
  type Class,
  type ClassShift,
  type TimeSlot,
} from '../../services/classService';
import { teacherService, type Teacher } from '../../services/teacherService';
import styles from './classes.module.css';

// Icons
const SchoolIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 6H5a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h13l4-3.5L18 6Z" />
    <path d="M12 13v9" />
    <path d="M12 2v4" />
  </svg>
);

const SearchIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#9ca3af"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

const UserIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const UsersIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const PlusIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M5 12h14" />
    <path d="M12 5v14" />
  </svg>
);

export function ClassesList() {
  const { addToast } = useToast();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [classes, setClasses] = useState<Class[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const isProfessor = user?.role === 'PROFESSOR';

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newClassShift, setNewClassShift] = useState<ClassShift>('MANHA');
  const [newClassTeacherId, setNewClassTeacherId] = useState('');
  const [editingClassId, setEditingClassId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [user]);

  // Check URL for action=create and open modal
  useEffect(() => {
    if (searchParams.get('action') === 'create') {
      openCreateModal();
      // Clear the query param after opening
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  const loadData = async () => {
    try {
      const [classesData, teachersData] = await Promise.all([
        classService.getAll(),
        teacherService.getAll(),
      ]);
      
      // Verifica se é professor dentro da função para garantir valor atualizado
      const userIsProfessor = user?.role === 'PROFESSOR';
      
      // Se for professor, filtra apenas suas turmas
      if (userIsProfessor && user?.email) {
        const teacher = teachersData.find((t) => t.email === user.email);
        console.log('[ClassesList] Professor logado:', user.email);
        console.log('[ClassesList] Teacher encontrado:', teacher);
        if (teacher) {
          const myClasses = classesData.filter((c) => c.teacherId === teacher.id);
          console.log('[ClassesList] Turmas do professor:', myClasses);
          setClasses(myClasses);
        } else {
          console.log('[ClassesList] Professor não encontrado na lista de teachers');
          setClasses([]);
        }
      } else {
        setClasses(classesData);
      }
      
      setTeachers(teachersData);
    } catch (error) {
      addToast('Erro ao carregar dados', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredClasses = useMemo(() => {
    return classes.filter((c) => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [classes, searchTerm]);

  const getTeacherName = (id: string | null) => {
    if (!id) return 'Não definido';
    const teacher = teachers.find((t) => t.id === id);
    return teacher ? teacher.nome : 'Professor não encontrado';
  };

  const openCreateModal = () => {
    setEditingClassId(null);
    setNewClassName('');
    setNewClassShift('MANHA');
    setNewClassTeacherId('');
    setIsModalOpen(true);
  };

  const openEditModal = (cls: Class) => {
    setEditingClassId(cls.id);
    setNewClassName(cls.name);
    setNewClassShift(cls.shift);
    setNewClassTeacherId(cls.teacherId || '');
    setIsModalOpen(true);
  };

  const handleSaveClass = async () => {
    if (!newClassName.trim()) {
      addToast('Nome da turma é obrigatório', 'error');
      return;
    }

    // Obtém as competências do professor selecionado
    let competencias: string[] = [];
    if (newClassTeacherId) {
      const teacher = teachers.find((t) => t.id === newClassTeacherId);
      if (teacher) {
        competencias = [...teacher.competencias];
      }
    }

    const payload = {
      name: newClassName,
      shift: newClassShift,
      teacherId: newClassTeacherId || null,
      competencias,
    };

    setIsModalOpen(false);
    resetForm();

    if (editingClassId) {
      // Update Mode
      const previousClasses = [...classes];

      // Optimistic Update
      setClasses((prev) => prev.map((c) => (c.id === editingClassId ? { ...c, ...payload } : c)));

      try {
        await classService.update(editingClassId, payload);
        addToast('Turma atualizada com sucesso!', 'success');
      } catch (error) {
        setClasses(previousClasses);
        addToast('Erro ao atualizar turma', 'error');
      }
    } else {
      // Create Mode
      const tempId = `temp-${Date.now()}`;
      const scheduleForShift: TimeSlot =
        newClassShift === 'MANHA'
          ? { start: '08:00', end: '12:00' }
          : { start: '13:00', end: '17:30' };
      const optimisticClass: Class = {
        id: tempId,
        ...payload,
        studentCount: 0,
        capacity: 12,
        schedule: scheduleForShift,
        studentSlots: [],
      };

      setClasses((prev) => [optimisticClass, ...prev]);

      try {
        const created = await classService.create(payload);
        setClasses((prev) => prev.map((c) => (c.id === tempId ? created : c)));
        addToast('Turma criada com sucesso!', 'success');
      } catch (error) {
        setClasses((prev) => prev.filter((c) => c.id !== tempId));
        addToast('Erro ao criar turma', 'error');
      }
    }
  };

  const resetForm = () => {
    setNewClassName('');
    setNewClassShift('MANHA');
    setNewClassTeacherId('');
  };

  return (
    <div className={styles.container}>
      {/* Header Stats & Search */}
      <div className={styles.topSection}>
        <div className={styles.statsCard}>
          <div className={styles.statsIcon}>
            <SchoolIcon />
          </div>
          <div className={styles.statsInfo}>
            <span className={styles.statsNumber}>{classes.length}</span>
            <span className={styles.statsLabel}>Total de Turmas</span>
          </div>
        </div>

        <div className={styles.searchBar}>
          <SearchIcon />
          <input
            type="text"
            placeholder="Buscar por nome da turma..."
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {!isProfessor && (
          <button className={styles.headerBtn} onClick={openCreateModal}>
            <PlusIcon />
            Nova Turma
          </button>
        )}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className={styles.loading}>Carregando turmas...</div>
      ) : (
        <div className={styles.grid}>
          {filteredClasses.length === 0 ? (
            <div className={styles.emptyState}>Nenhuma turma encontrada.</div>
          ) : (
            filteredClasses.map((turma) => (
              <div key={turma.id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <span
                    className={`${styles.badge} ${turma.shift === 'MANHA' ? styles.badgeMorning : styles.badgeAfternoon}`}
                  >
                    {turma.shift === 'MANHA' ? 'MANHÃ' : 'TARDE'}
                  </span>
                  {turma.schedule && (
                    <span className={styles.scheduleTime}>
                      🕒 {turma.schedule.start} - {turma.schedule.end}
                    </span>
                  )}
                </div>

                <h3 className={styles.cardTitle}>{turma.name}</h3>

                {/* Competências / Séries atendidas */}
                {turma.competencias && turma.competencias.length > 0 && (
                  <div className={styles.competenciasRow}>
                    {turma.competencias.map((comp) => (
                      <span key={comp} className={styles.competenciaBadge}>
                        {comp}
                      </span>
                    ))}
                  </div>
                )}

                <div className={styles.divider} />

                <div className={styles.teacherSection}>
                  <div className={styles.avatar}>
                    <UserIcon />
                  </div>
                  <div className={styles.teacherInfo}>
                    <span className={styles.teacherLabel}>PROFESSOR RESPONSÁVEL</span>
                    <span className={styles.teacherName}>{getTeacherName(turma.teacherId)}</span>
                  </div>
                </div>

                <div className={styles.statsRow}>
                  <div className={styles.studentCount}>
                    <UsersIcon />
                    <span>{turma.studentCount} Alunos</span>
                  </div>
                  <span className={styles.capacity}>Máx: 4/slot</span>
                </div>

                {/* Ocupação por horário */}
                {turma.studentSlots && turma.studentSlots.length > 0 && (
                  <div className={styles.slotsSection}>
                    <span className={styles.slotsTitle}>Alunos por Horário</span>
                    <div className={styles.slotsGrid}>
                      {turma.studentSlots.map((slot, idx) => (
                        <span key={idx} className={styles.slotItem}>
                          {(slot.studentName || 'Aluno').split(' ')[0]} ({slot.start}-{slot.end})
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {!isProfessor && (
                  <button className={styles.footerButton} onClick={() => openEditModal(turma)}>
                    Gerenciar / Trocar
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2 className={styles.modalTitle}>
              {editingClassId ? 'Editar Turma' : 'Cadastrar Nova Turma'}
            </h2>
            <p className={styles.modalSubtitle}>
              {editingClassId ? 'Atualize os dados da turma' : 'Preencha os dados básicos da turma'}
            </p>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Nome da Turma <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                className={styles.input}
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                placeholder="Ex: Reforço Mat/Port A"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Turno <span className={styles.required}>*</span>
              </label>
              <div className={styles.shiftToggle}>
                <button
                  type="button"
                  className={`${styles.shiftButton} ${newClassShift === 'MANHA' ? styles.shiftButtonSelected : styles.shiftButtonUnselected}`}
                  onClick={() => setNewClassShift('MANHA')}
                >
                  Manhã
                </button>
                <button
                  type="button"
                  className={`${styles.shiftButton} ${newClassShift === 'TARDE' ? styles.shiftButtonSelected : styles.shiftButtonUnselected}`}
                  onClick={() => setNewClassShift('TARDE')}
                >
                  Tarde
                </button>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Professor Responsável{' '}
                <span style={{ fontWeight: 400, color: '#9ca3af' }}>(Opcional neste momento)</span>
              </label>
              <select
                className={styles.select}
                value={newClassTeacherId}
                onChange={(e) => setNewClassTeacherId(e.target.value)}
              >
                <option value="">-- Definir Depois (Criar como Pendente) --</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={() => setIsModalOpen(false)}>
                Cancelar
              </button>
              <button className={styles.createBtn} onClick={handleSaveClass}>
                {editingClassId ? 'Salvar Alterações' : 'Criar Turma'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

