import styles from './students.module.css';
import { useState, useEffect, useMemo } from 'react';
import {
  calculateMonthlyFee,
  pricingService,
  formatCurrency,
  BASE_SLOTS,
} from '../../services/pricingService';

interface EnrollmentSummaryProps {
  studentData: any;
  classData: any;
  scheduleData: { start: string; end: string };
  onBack: () => void;
  onConfirm: (financialData: { monthlyFee: number; firstPaymentDate: string }) => void;
}

export function EnrollmentSummary({
  studentData,
  classData,
  scheduleData,
  onBack,
  onConfirm,
}: EnrollmentSummaryProps) {
  const [firstPaymentDate, setFirstPaymentDate] = useState(new Date().toISOString().split('T')[0]);

  // Calculate duration
  const start = new Date(`2000-01-01T${scheduleData.start}`);
  const end = new Date(`2000-01-01T${scheduleData.end}`);
  const diffMinutes = (end.getTime() - start.getTime()) / 60000;
  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;
  const durationString = `${hours}h ${minutes > 0 ? `${minutes}min` : '00min'}`;

  // Calcula slots (cada slot = 30 minutos)
  const durationSlots = Math.ceil(diffMinutes / 30);

  // Calcula o valor base da tabela (referência: 3 slots = 1h30)
  const basePrice = useMemo(() => {
    return pricingService.getBasePrice(studentData.schoolType, studentData.grade);
  }, [studentData.schoolType, studentData.grade]);

  // Calcula o valor proporcional baseado na duração
  const calculatedFee = useMemo(() => {
    return calculateMonthlyFee(studentData.schoolType, studentData.grade, durationSlots);
  }, [studentData.schoolType, studentData.grade, durationSlots]);

  // Estado para o valor editável (inicia com o valor calculado)
  const [monthlyFee, setMonthlyFee] = useState(calculatedFee);

  // Atualiza o valor quando o cálculo mudar
  useEffect(() => {
    setMonthlyFee(calculatedFee);
  }, [calculatedFee]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Resumo da Matrícula</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Left Column: Summary */}
        <div>
          <h2 className={styles.sectionTitle}>Resumo do agendamento</h2>
          <hr style={{ margin: '0.5rem 0 1.5rem', borderColor: '#e2e8f0' }} />

          {/* Student Card */}
          <div
            style={{
              backgroundColor: '#e0f2fe',
              padding: '1.5rem',
              borderRadius: '8px',
              marginBottom: '1rem',
              display: 'flex',
              gap: '1rem',
              alignItems: 'flex-start',
            }}
          >
            <div
              style={{
                backgroundColor: '#bae6fd',
                padding: '0.75rem',
                borderRadius: '50%',
                color: '#0369a1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '48px',
                height: '48px',
                fontSize: '24px',
              }}
            >
              <span>👤</span>
            </div>
            <div>
              <h3 style={{ margin: '0 0 0.25rem', color: '#0c4a6e', fontSize: '1.1rem' }}>
                {studentData.name}
              </h3>
              <p style={{ margin: 0, color: '#334155', fontSize: '0.9rem' }}>
                {studentData.grade} •{' '}
                {studentData.schoolType === 'publica' ? 'Escola Pública' : 'Escola Particular'}
              </p>
              <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.85rem' }}>
                {studentData.address?.street}, {studentData.address?.number} -{' '}
                {studentData.address?.neighborhood}
              </p>
            </div>
          </div>

          {/* Schedule Card */}
          <div
            style={{
              backgroundColor: '#e0f2fe',
              padding: '1.5rem',
              borderRadius: '8px',
              display: 'flex',
              gap: '1rem',
              alignItems: 'flex-start',
            }}
          >
            <div
              style={{
                backgroundColor: '#bae6fd',
                padding: '0.75rem',
                borderRadius: '50%',
                color: '#0369a1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '48px',
                height: '48px',
                fontSize: '24px',
              }}
            >
              <span>🕒</span>
            </div>
            <div>
              <h3 style={{ margin: '0 0 0.25rem', color: '#0c4a6e', fontSize: '1.1rem' }}>
                Turno da {classData.turno}
              </h3>
              <p style={{ margin: 0, color: '#334155', fontSize: '0.9rem' }}>
                Entrada: <strong>{scheduleData.start}</strong> • Duração:{' '}
                <strong>{durationString}</strong>
              </p>
              <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.85rem' }}>
                Frequência: Segunda a Sexta (Diária)
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Contract */}
        <div>
          <h2
            className={styles.sectionTitle}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <span className="text-green-600">💲</span> Definição do Contrato
          </h2>
          <hr style={{ margin: '0.5rem 0 1.5rem', borderColor: '#e2e8f0' }} />

          <div className={styles.card}>
            {/* Informações do cálculo */}
            <div
              style={{
                backgroundColor: '#f0fdf4',
                padding: '1rem',
                borderRadius: '8px',
                marginBottom: '1rem',
                border: '1px solid #bbf7d0',
              }}
            >
              <div style={{ fontSize: '0.85rem', color: '#166534', marginBottom: '0.5rem' }}>
                <strong>📊 Cálculo Automático</strong>
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.25rem',
                  fontSize: '0.85rem',
                  color: '#334155',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>
                    Escola {studentData.schoolType === 'publica' ? 'Pública' : 'Particular'}:
                  </span>
                  <span>Valor base: {formatCurrency(basePrice)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>
                    Duração: {durationString} ({durationSlots} slots)
                  </span>
                  <span>Referência: {BASE_SLOTS} slots (1h30)</span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontWeight: 'bold',
                    color: '#166534',
                    marginTop: '0.5rem',
                    paddingTop: '0.5rem',
                    borderTop: '1px dashed #bbf7d0',
                  }}
                >
                  <span>
                    Fórmula: ({formatCurrency(basePrice)} ÷ 3) × {durationSlots}
                  </span>
                  <span>= {formatCurrency(calculatedFee)}</span>
                </div>
              </div>
            </div>

            <label className={styles.label}>Valor final da Mensalidade</label>
            <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
              <span
                style={{
                  position: 'absolute',
                  left: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94a3b8',
                  fontWeight: 'bold',
                }}
              >
                R$
              </span>
              <input
                type="number"
                value={monthlyFee}
                onChange={(e) => setMonthlyFee(Number(e.target.value))}
                className={styles.input}
                style={{ paddingLeft: '2.5rem', fontSize: '1.25rem', fontWeight: 'bold' }}
              />
              <span
                style={{
                  position: 'absolute',
                  right: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94a3b8',
                }}
              >
                ✏️
              </span>
            </div>

            <div
              style={{
                backgroundColor: '#e0f2fe',
                padding: '1rem',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
              }}
            >
              <span className="text-blue-500">📅</span>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.75rem',
                    color: '#0369a1',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                  }}
                >
                  Data do Primeiro Pagamento
                </label>
                <input
                  type="date"
                  value={firstPaymentDate}
                  onChange={(e) => setFirstPaymentDate(e.target.value)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    fontWeight: 'bold',
                    color: '#0c4a6e',
                    fontSize: '0.95rem',
                    outline: 'none',
                  }}
                />
              </div>
            </div>
          </div>

          <div
            style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}
          >
            <button
              onClick={onBack}
              className={styles.cancelBtn}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <span>⬅️</span> Voltar
            </button>
            <button
              onClick={() => onConfirm({ monthlyFee, firstPaymentDate })}
              className={styles.saveBtn}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: '#22c55e',
              }}
            >
              <span>✅</span> Confirmar Matrícula
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
