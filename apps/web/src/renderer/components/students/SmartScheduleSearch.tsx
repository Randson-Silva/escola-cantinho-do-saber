import React, { useState, useEffect, useMemo } from 'react';
import { classService, type Class, type ClassShift } from '../../services/classService';
import { teacherService, type Teacher } from '../../services/teacherService';
import styles from './SmartScheduleSearch.module.css';

// --- Icons (Mocking Lucide-react for portability) ---
const Clock = ({ size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const Search = ({ size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const ArrowLeft = ({ size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

const CheckCircle = ({ size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const XCircle = ({ size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);

const User = ({ size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const ArrowRight = ({ size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

// --- Types ---

type Shift = 'Manhã' | 'Tarde';

// Mapeamento de grade para competência
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

// Resultado de busca com ocupação
interface ClassResult {
  id: string;
  nome: string;
  turno: Shift;
  professor: string;
  studentCount: number;
  competencias: string[];
  ocupacao: Record<string, number>;
  available: boolean;
}

// --- Helper Functions ---

const addMinutes = (time: string, minutes: number): string => {
  const [h, m] = time.split(':').map(Number);
  const date = new Date();
  date.setHours(h, m, 0, 0);
  date.setMinutes(date.getMinutes() + minutes);
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};

const calculateEndTime = (start: string, durationMinutes: number): string => {
  return addMinutes(start, durationMinutes);
};

const getSlotsInRange = (start: string, durationMinutes: number): string[] => {
  const slots: string[] = [];
  let current = start;
  const steps = durationMinutes / 30; // Assuming 30 min blocks

  for (let i = 0; i < steps; i++) {
    slots.push(current);
    current = addMinutes(current, 30);
  }
  return slots;
};

const checkAvailability = (
  ocupacao: Record<string, number>,
  start: string,
  durationMinutes: number,
): boolean => {
  const slotsToCheck = getSlotsInRange(start, durationMinutes);

  // Regra: Se em QUALQUER bloco de tempo houver >= 4 alunos, está indisponível.
  for (const slot of slotsToCheck) {
    const count = ocupacao[slot] || 0;
    if (count >= 4) {
      return false;
    }
  }
  return true;
};

// --- Component ---

interface SmartScheduleSearchProps {
  studentGrade: string; // Série do aluno (ex: 'series-1-ano')
  onBack?: () => void;
  onNext?: (selectedClass: ClassResult, timeSlot: { start: string; end: string }) => void;
}

export function SmartScheduleSearch({ studentGrade, onBack, onNext }: SmartScheduleSearchProps) {
  const [shift, setShift] = useState<Shift>('Manhã');
  const [startTime, setStartTime] = useState('08:00');
  const [duration, setDuration] = useState('90'); // minutes
  const [results, setResults] = useState<ClassResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  // Carrega professores ao iniciar
  useEffect(() => {
    teacherService.getAll().then(setTeachers);
  }, []);

  // Competência baseada na série do aluno
  const studentCompetencia = GRADE_TO_COMPETENCIA[studentGrade] || '1º Ano';

  // Limites de horário por turno
  const SHIFT_END_TIME = {
    Manhã: '12:00',
    Tarde: '17:30',
  };

  // Calcula quantos minutos restam até o fim do turno
  const getAvailableMinutes = (start: string, shiftType: Shift): number => {
    const [startH, startM] = start.split(':').map(Number);
    const endTimeStr = SHIFT_END_TIME[shiftType];
    const [endH, endM] = endTimeStr.split(':').map(Number);

    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    return endMinutes - startMinutes;
  };

  // Dynamic Time Options based on Shift
  const timeOptions = useMemo(() => {
    if (shift === 'Manhã') {
      return ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00'];
    } else {
      return ['13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00'];
    }
  }, [shift]);

  // Duration options filtered by available time
  const durationOptions = useMemo(() => {
    const allOptions = [
      { label: '1h 00min', value: '60' },
      { label: '1h 30min (Padrão)', value: '90' },
      { label: '2h 00min', value: '120' },
      { label: '3h 00min', value: '180' },
      { label: '4h 30min (Tarde Toda)', value: '270' },
    ];

    const availableMinutes = getAvailableMinutes(startTime, shift);

    return allOptions.filter((opt) => parseInt(opt.value) <= availableMinutes);
  }, [startTime, shift]);

  // Reset start time when shift changes if current start time is invalid
  useEffect(() => {
    if (!timeOptions.includes(startTime)) {
      setStartTime(timeOptions[0]);
    }
  }, [shift, timeOptions, startTime]);

  // Reset duration when it becomes invalid for the selected time
  useEffect(() => {
    const isValidDuration = durationOptions.some((opt) => opt.value === duration);
    if (!isValidDuration && durationOptions.length > 0) {
      // Seleciona a maior duração disponível
      setDuration(durationOptions[durationOptions.length - 1].value);
    }
  }, [durationOptions, duration]);

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      // Busca todas as turmas
      const allClasses = await classService.getAll();

      // Filtra por turno e competência do aluno
      const shiftValue: ClassShift = shift === 'Manhã' ? 'MANHA' : 'TARDE';
      const filteredClasses = allClasses.filter((cls) => {
        // Verifica se o turno corresponde
        if (cls.shift !== shiftValue) return false;

        // Verifica se a turma tem a competência do aluno
        if (!cls.competencias.includes(studentCompetencia)) return false;

        return true;
      });

      // Transforma para o formato de resultado com ocupação
      const classResults: ClassResult[] = filteredClasses.map((cls) => {
        const ocupacao = classService.getSlotOccupancy(cls);
        const available = checkAvailability(ocupacao, startTime, parseInt(duration));
        const teacher = teachers.find((t) => t.id === cls.teacherId);

        return {
          id: cls.id,
          nome: cls.name,
          turno: shift,
          professor: teacher?.nome || 'Não definido',
          studentCount: cls.studentCount,
          competencias: cls.competencias,
          ocupacao,
          available,
        };
      });

      setResults(classResults);
      setHasSearched(true);
    } catch (error) {
      console.error('Erro ao buscar turmas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (cls: ClassResult) => {
    if (onNext) {
      const end = calculateEndTime(startTime, parseInt(duration));
      onNext(cls, { start: startTime, end });
    } else {
      alert(
        `Turma selecionada: ${cls.nome} (${startTime} - ${calculateEndTime(startTime, parseInt(duration))})`,
      );
    }
  };

  const endTime = calculateEndTime(startTime, parseInt(duration));

  return (
    <div className={styles.container}>
      {/* Left Column: Filters */}
      <div className={styles.filterCard}>
        <button className={styles.backButton} onClick={onBack}>
          <ArrowLeft size={18} />
          Voltar
        </button>

        <h2 className={styles.filterTitle}>
          <Clock className="text-blue-500" />
          Preferência de Horário
        </h2>

        <div className={styles.formGroup}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label className={styles.label}>Turno</label>
              <select
                className={styles.select}
                value={shift}
                onChange={(e) => setShift(e.target.value as Shift)}
              >
                <option value="Manhã">Manhã</option>
                <option value="Tarde">Tarde</option>
              </select>
            </div>

            <div style={{ flex: 1 }}>
              <label className={styles.label}>Horário de Início</label>
              <select
                className={styles.select}
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              >
                {timeOptions.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Duração Desejada</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {durationOptions.length === 0 ? (
              <p style={{ color: '#ef4444', fontSize: '0.85rem' }}>
                Nenhuma duração disponível para este horário.
              </p>
            ) : (
              durationOptions.map((opt) => (
                <label
                  key={opt.value}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem',
                    border: duration === opt.value ? '1px solid #3b82f6' : '1px solid #e2e8f0',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    backgroundColor: duration === opt.value ? '#eff6ff' : 'white',
                  }}
                >
                  <input
                    type="radio"
                    name="duration"
                    value={opt.value}
                    checked={duration === opt.value}
                    onChange={(e) => setDuration(e.target.value)}
                    style={{ accentColor: '#3b82f6' }}
                  />
                  <span style={{ fontSize: '0.9rem', color: '#334155' }}>{opt.label}</span>
                </label>
              ))
            )}
          </div>
          {shift === 'Tarde' && (
            <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem' }}>
              ⏰ Turno da tarde encerra às 17:30
            </p>
          )}
          {shift === 'Manhã' && (
            <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem' }}>
              ⏰ Turno da manhã encerra às 12:00
            </p>
          )}
        </div>

        <button className={styles.confirmButton} onClick={handleSearch}>
          Confirmar
        </button>
      </div>

      {/* Right Column: Results */}
      <div className={styles.resultsContainer}>
        <div className={styles.resultsHeader}>
          <h2 className={styles.resultsTitle}>Turmas encontradas:</h2>
          {hasSearched && (
            <span
              style={{
                backgroundColor: shift === 'Manhã' ? '#ffedd5' : '#e0e7ff',
                color: shift === 'Manhã' ? '#c2410c' : '#4338ca',
                padding: '0.25rem 0.75rem',
                borderRadius: '999px',
                fontSize: '0.8rem',
                fontWeight: 600,
              }}
            >
              Turno {shift}
            </span>
          )}
        </div>

        {!hasSearched ? (
          <div className={styles.emptyState}>
            <div style={{ margin: '0 auto 1rem', opacity: 0.2 }}>
              <Search size={48} />
            </div>
            <p>Preencha as preferências ao lado e clique em Confirmar.</p>
          </div>
        ) : results.length === 0 ? (
          <div className={styles.emptyState}>
            <p>
              Nenhuma turma encontrada para a série <strong>{studentCompetencia}</strong> no turno
              da {shift.toLowerCase()}.
            </p>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.5rem' }}>
              Verifique se existem turmas com professores que tenham essa competência.
            </p>
          </div>
        ) : (
          results.map((cls) => {
            return (
              <div
                key={cls.id}
                className={styles.classCard}
                style={{
                  opacity: cls.available ? 1 : 0.7,
                  backgroundColor: cls.available ? 'white' : '#fff1f2',
                }}
              >
                <div className={styles.classInfo}>
                  <div className={styles.classAvatar}>{cls.nome.charAt(0)}</div>
                  <div className={styles.classDetails}>
                    <h3>{cls.nome}</h3>
                    <div className={styles.classMeta}>
                      <div className={styles.metaItem}>
                        <User size={14} />
                        {cls.professor} • {cls.studentCount} alunos
                      </div>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        gap: '0.5rem',
                        flexWrap: 'wrap',
                        marginTop: '0.5rem',
                      }}
                    >
                      {cls.competencias.map((comp) => (
                        <span
                          key={comp}
                          style={{
                            fontSize: '0.7rem',
                            padding: '0.15rem 0.5rem',
                            borderRadius: '999px',
                            backgroundColor: comp === studentCompetencia ? '#dcfce7' : '#f1f5f9',
                            color: comp === studentCompetencia ? '#166534' : '#475569',
                            fontWeight: comp === studentCompetencia ? 600 : 400,
                          }}
                        >
                          {comp}
                        </span>
                      ))}
                    </div>
                    <div
                      style={{
                        marginTop: '0.5rem',
                        fontSize: '0.85rem',
                        color: '#475569',
                        backgroundColor: '#f1f5f9',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                      }}
                    >
                      <Clock size={14} />
                      Horário:{' '}
                      <strong>
                        {startTime} às {endTime}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className={styles.cardRight}>
                  {cls.available ? (
                    <span className={`${styles.statusBadge} ${styles.statusAvailable}`}>
                      <CheckCircle size={14} />
                      Disponível
                    </span>
                  ) : (
                    <div style={{ textAlign: 'right' }}>
                      <span className={`${styles.statusBadge} ${styles.statusFull}`}>
                        <XCircle size={14} />
                        Lotado
                      </span>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          color: '#ef4444',
                          display: 'block',
                          marginTop: '2px',
                        }}
                      >
                        4 alunos no horário
                      </span>
                    </div>
                  )}

                  {cls.available && (
                    <button className={styles.selectButton} onClick={() => handleSelect(cls)}>
                      Selecionar
                      <ArrowRight size={16} />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
