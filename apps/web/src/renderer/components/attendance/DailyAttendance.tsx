import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  attendanceService,
  AttendanceStatus,
  Student,
  ClassInfo,
} from '../../services/attendanceService';
import styles from './daily-attendance.module.css';

interface AttendanceState {
  studentId: string;
  studentName: string;
  status: AttendanceStatus;
  observation: string;
}

export function DailyAttendance() {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();

  const [classInfo, setClassInfo] = useState<ClassInfo | null>(null);
  const [date, setDate] = useState(new Date());
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceList, setAttendanceList] = useState<AttendanceState[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [hasSavedAttendance, setHasSavedAttendance] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (classId) {
      loadData();
    }
  }, [classId, date]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setShowCalendar(false);
      }
    }
    if (showCalendar) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCalendar]);

  async function loadData() {
    try {
      setLoading(true);

      const classData = await attendanceService.getClassById(classId!);
      setClassInfo(classData || null);

      const studentsData = await attendanceService.listStudentsByClass(classId!);
      setStudents(studentsData);

      const dateStr = formatDateForAPI(date);
      const existingRecords = await attendanceService.getAttendanceByDate(classId!, dateStr);

      // Verifica se já existe frequência salva para esta data
      const hasExisting = existingRecords.length > 0;
      setHasSavedAttendance(hasExisting);
      setIsEditing(false); // Reseta o modo de edição ao trocar de data

      const attendance: AttendanceState[] = studentsData.map((student) => {
        const existing = existingRecords.find((r) => r.studentId === student.id);
        return {
          studentId: student.id,
          studentName: student.name,
          status: existing?.status || 'PRESENT',
          observation: existing?.observation || '',
        };
      });

      setAttendanceList(attendance);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }

  function formatDateForAPI(d: Date): string {
    return d.toISOString().split('T')[0];
  }

  function formatDateDisplay(d: Date): string {
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  function changeDate(days: number) {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + days);
    setDate(newDate);
  }

  function selectDate(selectedDate: Date) {
    setDate(selectedDate);
    setShowCalendar(false);
  }

  function changeCalendarMonth(months: number) {
    const newMonth = new Date(calendarMonth);
    newMonth.setMonth(newMonth.getMonth() + months);
    setCalendarMonth(newMonth);
  }

  function getCalendarDays() {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const days: (Date | null)[] = [];

    const startWeekDay = firstDay.getDay();
    for (let i = 0; i < startWeekDay; i++) {
      days.push(null);
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  }

  function isSameDay(d1: Date, d2: Date): boolean {
    return (
      d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear()
    );
  }

  function isToday(d: Date): boolean {
    return isSameDay(d, new Date());
  }

  function updateAttendance(studentId: string, status: AttendanceStatus) {
    setAttendanceList((prev) =>
      prev.map((a) => (a.studentId === studentId ? { ...a, status } : a)),
    );
  }

  function updateObservation(studentId: string, observation: string) {
    setAttendanceList((prev) =>
      prev.map((a) => (a.studentId === studentId ? { ...a, observation } : a)),
    );
  }

  async function handleSave() {
    setShowConfirmModal(true);
  }

  async function confirmSave() {
    try {
      setSaving(true);
      await attendanceService.saveAttendance({
        classId: classId!,
        date: formatDateForAPI(date),
        records: attendanceList.map((a) => ({
          studentId: a.studentId,
          classId: classId!,
          date: formatDateForAPI(date),
          status: a.status,
          observation: a.observation,
        })),
      });
      setShowConfirmModal(false);
      setHasSavedAttendance(true);
      setIsEditing(false);
    } catch (error) {
      console.error('Erro ao salvar frequência:', error);
    } finally {
      setSaving(false);
    }
  }

  function getInitial(name: string): string {
    return name.charAt(0).toUpperCase();
  }

  function getAvatarColor(name: string): string {
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  }

  const presentCount = attendanceList.filter((a) => a.status === 'PRESENT').length;
  const partialCount = attendanceList.filter((a) => a.status === 'PARTIAL').length;
  const absentCount = attendanceList.filter((a) => a.status === 'ABSENT').length;

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header de navegação */}
      <button onClick={() => navigate('/dashboard/attendance')} className={styles.backButton}>
        ← Voltar para Lista
      </button>

      {/* Card principal */}
      <div className={styles.mainCard}>
        <div className={styles.cardHeader}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>📋</div>
            <div>
              <h1 className={styles.className}>{classInfo?.name || 'Turma'}</h1>
              <p className={styles.headerSubtitle}>Chamada Diária · {classInfo?.teacherName}</p>
            </div>
          </div>
          <div className={styles.statsContainer}>
            <div className={styles.statBox}>
              <span className={styles.statLabel}>TOTAL ALUNOS</span>
              <span className={styles.statValue}>{students.length}</span>
            </div>
            <div className={styles.statBox}>
              <span className={styles.statLabel}>PRESENTES</span>
              <span className={styles.statValue}>{presentCount}</span>
            </div>
          </div>
        </div>

        {/* Conteúdo branco */}
        <div className={styles.cardContent}>
          {/* Seletor de data */}
          <div className={styles.dateSelector}>
            <div className={styles.dateControls}>
              <button onClick={() => changeDate(-1)} className={styles.dateButton}>
                ‹
              </button>
              <div className={styles.datePickerWrapper} ref={calendarRef}>
                <button
                  className={styles.dateDisplay}
                  onClick={() => {
                    setCalendarMonth(date);
                    setShowCalendar(!showCalendar);
                  }}
                >
                  <span>📅</span>
                  <span>{formatDateDisplay(date)}</span>
                </button>

                {/* Calendário Popup */}
                {showCalendar && (
                  <div className={styles.calendarPopup}>
                    <div className={styles.calendarHeader}>
                      <button
                        className={styles.calendarNavBtn}
                        onClick={() => changeCalendarMonth(-1)}
                      >
                        ‹
                      </button>
                      <span className={styles.calendarTitle}>
                        {calendarMonth.toLocaleDateString('pt-BR', {
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                      <button
                        className={styles.calendarNavBtn}
                        onClick={() => changeCalendarMonth(1)}
                      >
                        ›
                      </button>
                    </div>

                    <div className={styles.calendarWeekdays}>
                      {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
                        <span key={day} className={styles.weekday}>
                          {day}
                        </span>
                      ))}
                    </div>

                    <div className={styles.calendarDays}>
                      {getCalendarDays().map((day, index) => (
                        <button
                          key={index}
                          className={`${styles.calendarDay} ${
                            day ? '' : styles.emptyDay
                          } ${day && isSameDay(day, date) ? styles.selectedDay : ''} ${
                            day && isToday(day) ? styles.today : ''
                          }`}
                          onClick={() => day && selectDate(day)}
                          disabled={!day}
                        >
                          {day?.getDate()}
                        </button>
                      ))}
                    </div>

                    <div className={styles.calendarFooter}>
                      <button className={styles.todayBtn} onClick={() => selectDate(new Date())}>
                        Hoje
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <button onClick={() => changeDate(1)} className={styles.dateButton}>
                ›
              </button>
            </div>
            <p className={styles.saveHint}>*Clique em Salvar para confirmar as alterações.</p>
          </div>

          {/* Lista de alunos */}
          <div className={styles.studentsList}>
            {attendanceList.map((attendance) => {
              const isDisabled = hasSavedAttendance && !isEditing;
              return (
              <div key={attendance.studentId} className={styles.studentRow}>
                {/* Avatar */}
                <div
                  className={styles.avatar}
                  style={{ backgroundColor: getAvatarColor(attendance.studentName) }}
                >
                  {getInitial(attendance.studentName)}
                </div>

                  {/* Nome */}
                  <div className={styles.studentName}>{attendance.studentName}</div>

                {/* Botões de status */}
                <div className={styles.statusButtons}>
                  <button
                    onClick={() => updateAttendance(attendance.studentId, 'PRESENT')}
                    disabled={isDisabled}
                    className={`${styles.statusBtn} ${
                      attendance.status === 'PRESENT' ? styles.presentActive : ''
                    } ${isDisabled ? styles.disabled : ''}`}
                  >
                    ✓ Presente
                  </button>
                  <button
                    onClick={() => updateAttendance(attendance.studentId, 'PARTIAL')}
                    disabled={isDisabled}
                    className={`${styles.statusBtn} ${
                      attendance.status === 'PARTIAL' ? styles.partialActive : ''
                    } ${isDisabled ? styles.disabled : ''}`}
                  >
                    ⏱ Parcial
                  </button>
                  <button
                    onClick={() => updateAttendance(attendance.studentId, 'ABSENT')}
                    disabled={isDisabled}
                    className={`${styles.statusBtn} ${
                      attendance.status === 'ABSENT' ? styles.absentActive : ''
                    } ${isDisabled ? styles.disabled : ''}`}
                  >
                    ✕ Falta
                  </button>
                </div>

                {/* Observação */}
                <input
                  type="text"
                  placeholder={
                    attendance.status === 'PARTIAL'
                      ? 'Horário e motivo da saída...'
                      : 'Adicionar obs opcional...'
                  }
                  value={attendance.observation}
                  onChange={(e) => updateObservation(attendance.studentId, e.target.value)}
                  disabled={isDisabled}
                  className={`${styles.observationInput} ${isDisabled ? styles.disabled : ''}`}
                />
              </div>
            );
            })}
          </div>

          {/* Footer */}
          <div className={styles.cardFooter}>
            <p className={styles.studentsCount}>
              <strong>{students.length}</strong> alunos listados.
            </p>
            {hasSavedAttendance && !isEditing ? (
              <button onClick={() => setIsEditing(true)} className={styles.editButton}>
                ✏️ Editar Chamada
              </button>
            ) : (
              <button onClick={handleSave} className={styles.saveButton}>
                💾 Salvar Chamada do Dia
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modal de confirmação */}
      {showConfirmModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <span>📋</span>
              <h2>Confirmar Chamada</h2>
            </div>
            <p className={styles.modalSubtitle}>
              Revise os dados antes de salvar o diário de hoje.
            </p>

            <div className={styles.modalStats}>
              <div className={styles.modalStatRow}>
                <span className={styles.modalStatIcon}>✓</span>
                <span className={styles.modalStatLabel}>Presentes</span>
                <span className={styles.modalStatValue}>{presentCount}</span>
              </div>
              <div className={styles.modalStatRow}>
                <span className={`${styles.modalStatIcon} ${styles.yellow}`}>⏱</span>
                <span className={styles.modalStatLabel}>Parciais</span>
                <span className={styles.modalStatValue}>{partialCount}</span>
              </div>
              <div className={styles.modalStatRow}>
                <span className={`${styles.modalStatIcon} ${styles.red}`}>✕</span>
                <span className={styles.modalStatLabel}>Ausentes</span>
                <span className={styles.modalStatValue}>{absentCount}</span>
              </div>
            </div>

            <div className={styles.modalActions}>
              <button onClick={() => setShowConfirmModal(false)} className={styles.modalCancelBtn}>
                Voltar
              </button>
              <button onClick={confirmSave} disabled={saving} className={styles.modalConfirmBtn}>
                {saving ? 'Salvando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

