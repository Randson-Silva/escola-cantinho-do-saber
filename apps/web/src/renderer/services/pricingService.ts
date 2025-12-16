// ============================================================================
// SERVIÇO DE PRECIFICAÇÃO ESCOLAR
// Implementa a lógica de cálculo de mensalidades proporcional aos slots
// ============================================================================

// Tipos de escola suportados
export type SchoolType = 'publica' | 'particular';

// Séries suportadas (1º ao 9º ano)
export type Grade = '1ano' | '2ano' | '3ano' | '4ano' | '5ano' | '6ano' | '7ano' | '8ano' | '9ano';

// Mapeamento de labels para grades internas
export const GRADE_LABELS: Record<string, Grade> = {
  '1º Ano': '1ano',
  '2º Ano': '2ano',
  '3º Ano': '3ano',
  '4º Ano': '4ano',
  '5º Ano': '5ano',
  '6º Ano': '6ano',
  '7º Ano': '7ano',
  '8º Ano': '8ano',
  '9º Ano': '9ano',
  // Formatos alternativos
  '1ano': '1ano',
  '2ano': '2ano',
  '3ano': '3ano',
  '4ano': '4ano',
  '5ano': '5ano',
  '6ano': '6ano',
  '7ano': '7ano',
  '8ano': '8ano',
  '9ano': '9ano',
  // Formatos do formulário (series-X-ano)
  'series-1-ano': '1ano',
  'series-2-ano': '2ano',
  'series-3-ano': '3ano',
  'series-4-ano': '4ano',
  'series-5-ano': '5ano',
  'series-6-ano': '6ano',
  'series-7-ano': '7ano',
  'series-8-ano': '8ano',
  'series-9-ano': '9ano',
  // Formatos com 1 ano, 2 ano, etc.
  '1 ano': '1ano',
  '2 ano': '2ano',
  '3 ano': '3ano',
  '4 ano': '4ano',
  '5 ano': '5ano',
  '6 ano': '6ano',
  '7 ano': '7ano',
  '8 ano': '8ano',
  '9 ano': '9ano',
};

// ============================================================================
// TABELA DE PREÇOS BASE
// Referência: Aula Padrão de 1h30 (3 slots de 30 minutos)
// ============================================================================

export const PRICING_TABLE: Record<SchoolType, Record<Grade, number>> = {
  publica: {
    '1ano': 100,
    '2ano': 120,
    '3ano': 130,
    '4ano': 140,
    '5ano': 150,
    '6ano': 160,
    '7ano': 170,
    '8ano': 180,
    '9ano': 190,
  },
  particular: {
    '1ano': 130,
    '2ano': 130, // 1º e 2º ano têm o mesmo valor
    '3ano': 140,
    '4ano': 150,
    '5ano': 160,
    '6ano': 170,
    '7ano': 180,
    '8ano': 190,
    '9ano': 200,
  },
};

// Slots base para referência (1h30 = 3 slots de 30 min)
export const BASE_SLOTS = 3;

// Porcentagem de participação do professor
export const TEACHER_PARTICIPATION_RATE = 0.5; // 50%

// ============================================================================
// FUNÇÕES DE CÁLCULO
// ============================================================================

/**
 * Normaliza o tipo de escola para o formato interno
 */
export function normalizeSchoolType(schoolType: string): SchoolType {
  const normalized = schoolType.toLowerCase().trim();
  if (normalized === 'publica' || normalized === 'pública') return 'publica';
  if (normalized === 'particular' || normalized === 'privada') return 'particular';
  return 'publica'; // Padrão
}

/**
 * Normaliza a série para o formato interno
 */
export function normalizeGrade(grade: string): Grade {
  const normalized = grade.trim();
  return GRADE_LABELS[normalized] || '1ano'; // Padrão: 1º ano
}

/**
 * Calcula a mensalidade proporcional baseada na duração
 * @param schoolType Tipo de escola ('publica' ou 'particular')
 * @param grade Série do aluno ('1ano', '2ano', etc.)
 * @param durationSlots Quantidade de slots de 30 minutos (ex: 4 slots = 2h)
 * @returns Valor da mensalidade arredondado
 */
export function calculateMonthlyFee(
  schoolType: SchoolType | string,
  grade: Grade | string,
  durationSlots: number,
): number {
  // Normaliza os parâmetros
  const normalizedSchoolType = normalizeSchoolType(schoolType as string);
  const normalizedGrade = normalizeGrade(grade as string);

  // Busca o valor base na tabela
  const basePrice = PRICING_TABLE[normalizedSchoolType][normalizedGrade];

  if (!basePrice) {
    console.warn(
      `[pricingService] Preço não encontrado para: ${normalizedSchoolType}/${normalizedGrade}`,
    );
    return 0;
  }

  // Calcula o valor proporcional: (Valor_Base / 3) * Quantidade_Slots
  const proportionalValue = (basePrice / BASE_SLOTS) * durationSlots;

  // Arredonda para o inteiro mais próximo
  return Math.round(proportionalValue);
}

/**
 * Calcula a remuneração do professor baseada no valor da mensalidade
 * @param monthlyFee Valor da mensalidade do aluno
 * @returns Valor que o professor recebe (50% da mensalidade)
 */
export function calculateTeacherPayment(monthlyFee: number): number {
  return Math.round(monthlyFee * TEACHER_PARTICIPATION_RATE);
}

/**
 * Calcula o total a pagar para um professor baseado em seus alunos
 * @param studentFees Array com os valores das mensalidades de cada aluno
 * @returns Total que o professor deve receber
 */
export function calculateTotalTeacherPayment(studentFees: number[]): number {
  const total = studentFees.reduce((sum, fee) => sum + calculateTeacherPayment(fee), 0);
  return Math.round(total);
}

// ============================================================================
// HELPERS PARA EXIBIÇÃO
// ============================================================================

/**
 * Converte slots em texto legível de duração
 */
export function slotsToReadableDuration(slots: number): string {
  const totalMinutes = slots * 30;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) return `${minutes}min`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h${minutes}min`;
}

/**
 * Converte duração em texto para slots
 */
export function durationToSlots(duration: string): number {
  // Formatos suportados: "1h", "1h30", "2h00", "30min", "1:30"
  const hoursMatch = duration.match(/(\d+)h/);
  const minutesMatch = duration.match(/(\d+)min/) || duration.match(/h(\d+)/);

  let hours = hoursMatch ? parseInt(hoursMatch[1]) : 0;
  let minutes = minutesMatch ? parseInt(minutesMatch[1]) : 0;

  // Formato HH:MM
  if (duration.includes(':')) {
    const [h, m] = duration.split(':').map((n) => parseInt(n));
    hours = h || 0;
    minutes = m || 0;
  }

  const totalMinutes = hours * 60 + minutes;
  return Math.ceil(totalMinutes / 30); // Arredonda para cima
}

/**
 * Formata valor em reais
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

// ============================================================================
// SERVIÇO DE PRECIFICAÇÃO (API)
// ============================================================================

export const pricingService = {
  /**
   * Retorna a tabela de preços completa
   */
  getPricingTable(): typeof PRICING_TABLE {
    return PRICING_TABLE;
  },

  /**
   * Retorna o preço base para uma combinação de escola/série
   */
  getBasePrice(schoolType: SchoolType | string, grade: Grade | string): number {
    const normalizedSchoolType = normalizeSchoolType(schoolType as string);
    const normalizedGrade = normalizeGrade(grade as string);
    return PRICING_TABLE[normalizedSchoolType][normalizedGrade] || 0;
  },

  /**
   * Calcula a mensalidade proporcional
   */
  calculateMonthlyFee,

  /**
   * Calcula pagamento do professor
   */
  calculateTeacherPayment,

  /**
   * Calcula total do professor
   */
  calculateTotalTeacherPayment,

  /**
   * Helpers de conversão
   */
  slotsToReadableDuration,
  durationToSlots,
  formatCurrency,

  /**
   * Taxa de participação do professor
   */
  getTeacherParticipationRate(): number {
    return TEACHER_PARTICIPATION_RATE;
  },
};

