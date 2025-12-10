import React, { useState, useEffect, useMemo } from 'react';
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

// --- Types & Mock Data ---

type Shift = 'Manhã' | 'Tarde';

interface ClassData {
  id: number;
  nome: string;
  turno: Shift;
  professor: string;
  studentsCount: number; // Base count
  ocupacao: Record<string, number>; // Map of time slot -> current student count
}

const MOCK_CLASSES: ClassData[] = [
  {
    id: 1,
    nome: 'Reforço Manhã A',
    turno: 'Manhã',
    professor: 'Prof. Carlos',
    studentsCount: 2,
    ocupacao: {
      '08:00': 2,
      '08:30': 2,
      '09:00': 2,
      '09:30': 2, // 2 alunos das 8h às 10h
      '10:00': 0,
      '10:30': 0,
      '11:00': 0,
      '11:30': 0,
    },
  },
  {
    id: 2,
    nome: 'Reforço Manhã B',
    turno: 'Manhã',
    professor: 'Profa. Julia',
    studentsCount: 3,
    ocupacao: {
      '08:00': 3,
      '08:30': 3,
      '09:00': 4,
      '09:30': 4, // Lotada (4) das 9h às 10h
      '10:00': 1,
      '10:30': 1,
    },
  },
  {
    id: 3,
    nome: 'Reforço Mat/Port A',
    turno: 'Tarde',
    professor: 'Prof. Carlos',
    studentsCount: 3,
    ocupacao: {
      '13:00': 3,
      '13:30': 3,
      '14:00': 3,
      '14:30': 3,
      '15:00': 0,
      '15:30': 0,
      '16:00': 0,
    },
  },
  {
    id: 4,
    nome: 'Reforço Inglês B',
    turno: 'Tarde',
    professor: 'Profa. Ana',
    studentsCount: 4,
    ocupacao: {
      '13:00': 4,
      '13:30': 4,
      '14:00': 4,
      '14:30': 4, // Lotada o tempo todo
      '15:00': 4,
      '15:30': 4,
      '16:00': 4,
    },
  },
];

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

const checkAvailability = (cls: ClassData, start: string, durationMinutes: number): boolean => {
  const slotsToCheck = getSlotsInRange(start, durationMinutes);

  // Regra: Se em QUALQUER bloco de tempo houver >= 4 alunos, está indisponível.
  for (const slot of slotsToCheck) {
    const count = cls.ocupacao[slot] || 0;
    if (count >= 4) {
      return false;
    }
  }
  return true;
};

// --- Component ---

interface SmartScheduleSearchProps {
  onBack?: () => void;
  onNext?: (selectedClass: ClassData, timeSlot: { start: string; end: string }) => void;
}

export function SmartScheduleSearch({ onBack, onNext }: SmartScheduleSearchProps) {
  const [shift, setShift] = useState<Shift>('Manhã');
  const [startTime, setStartTime] = useState('08:00');
  const [duration, setDuration] = useState('90'); // minutes
  const [results, setResults] = useState<ClassData[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  // Dynamic Time Options based on Shift
  const timeOptions = useMemo(() => {
    if (shift === 'Manhã') {
      return ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30'];
    } else {
      return ['13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00'];
    }
  }, [shift]);

  // Reset start time when shift changes if current start time is invalid
  useEffect(() => {
    if (!timeOptions.includes(startTime)) {
      setStartTime(timeOptions[0]);
    }
  }, [shift, timeOptions, startTime]);

  const handleSearch = () => {
    // Filter classes by shift
    const shiftClasses = MOCK_CLASSES.filter((c) => c.turno === shift);
    setResults(shiftClasses);
    setHasSearched(true);
  };

  const handleSelect = (cls: ClassData) => {
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
            {[
              { label: '1h 00min', value: '60' },
              { label: '1h 30min (Padrão)', value: '90' },
              { label: '2h 00min', value: '120' },
              { label: '3h 00min', value: '180' },
              { label: '4h 30min (Tarde Toda)', value: '270' },
            ].map((opt) => (
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
            ))}
          </div>
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
            <p>Nenhuma turma encontrada para este turno.</p>
          </div>
        ) : (
          results.map((cls) => {
            const isAvailable = checkAvailability(cls, startTime, parseInt(duration));

            return (
              <div
                key={cls.id}
                className={styles.classCard}
                style={{
                  opacity: isAvailable ? 1 : 0.7,
                  backgroundColor: isAvailable ? 'white' : '#fff1f2',
                }}
              >
                <div className={styles.classInfo}>
                  <div className={styles.classAvatar}>{cls.nome.charAt(0)}</div>
                  <div className={styles.classDetails}>
                    <h3>{cls.nome}</h3>
                    <div className={styles.classMeta}>
                      <div className={styles.metaItem}>
                        <User size={14} />
                        {cls.professor} • {cls.studentsCount} alunos
                      </div>
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
                  {isAvailable ? (
                    <span className={`${styles.statusBadge} ${styles.statusAvailable}`}>
                      <CheckCircle size={14} />
                      Disponível
                    </span>
                  ) : (
                    <div style={{ textAlign: 'right' }}>
                      <span className={`${styles.statusBadge} ${styles.statusFull}`}>
                        <XCircle size={14} />
                        Indisponível
                      </span>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          color: '#ef4444',
                          display: 'block',
                          marginTop: '2px',
                        }}
                      >
                        Lotado às {startTime}
                      </span>
                    </div>
                  )}

                  {isAvailable && (
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

