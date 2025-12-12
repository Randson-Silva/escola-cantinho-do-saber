// Teacher service with real API connection

import { api } from './api';
import { userService } from './userService';

export type TeacherStatus = 'ATIVO' | 'INATIVO';

// Mapeamento entre UI (frontend) e Backend
type BackendGrade =
  | 'PRIMEIRO_ANO'
  | 'SEGUNDO_ANO'
  | 'TERCEIRO_ANO'
  | 'QUARTO_ANO'
  | 'QUINTO_ANO'
  | 'SEXTO_ANO'
  | 'SETIMO_ANO'
  | 'OITAVO_ANO'
  | 'NONO_ANO';

type UiGrade =
  | '1º Ano'
  | '2º Ano'
  | '3º Ano'
  | '4º Ano'
  | '5º Ano'
  | '6º Ano'
  | '7º Ano'
  | '8º Ano'
  | '9º Ano';

const GRADE_TO_BACKEND: Record<UiGrade, BackendGrade> = {
  '1º Ano': 'PRIMEIRO_ANO',
  '2º Ano': 'SEGUNDO_ANO',
  '3º Ano': 'TERCEIRO_ANO',
  '4º Ano': 'QUARTO_ANO',
  '5º Ano': 'QUINTO_ANO',
  '6º Ano': 'SEXTO_ANO',
  '7º Ano': 'SETIMO_ANO',
  '8º Ano': 'OITAVO_ANO',
  '9º Ano': 'NONO_ANO',
};

const BACKEND_TO_GRADE: Record<BackendGrade, UiGrade> = {
  PRIMEIRO_ANO: '1º Ano',
  SEGUNDO_ANO: '2º Ano',
  TERCEIRO_ANO: '3º Ano',
  QUARTO_ANO: '4º Ano',
  QUINTO_ANO: '5º Ano',
  SEXTO_ANO: '6º Ano',
  SETIMO_ANO: '7º Ano',
  OITAVO_ANO: '8º Ano',
  NONO_ANO: '9º Ano',
};

// Interface que vem do backend
interface TeacherFromBackend {
  id: string;
  name: string;
  email: string;
  phone: string;
  taxId: string;
  pixKey: string;
  status: string; // Backend pode retornar 'ACTIVE', 'INACTIVE', 'ATIVO', 'INATIVO'
  expertise?: string;
  qualifiedGrades: BackendGrade[];
  startDate: string;
  nextPaymentDate?: string;
  createdAt: string;
}

// Interface usada na UI (mantém compatibilidade com os componentes)
export interface Teacher {
  id: string;
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
  competencias: string[]; // Ex: ['1º Ano', '2º Ano']
  chavePix: string;
  dataInicio: string; // ISO date string
  status: TeacherStatus;
}

// Converte status do backend para frontend
function convertStatus(status: string): TeacherStatus {
  const upperStatus = status?.toUpperCase() || 'ATIVO';
  if (upperStatus === 'ACTIVE' || upperStatus === 'ATIVO') return 'ATIVO';
  if (upperStatus === 'INACTIVE' || upperStatus === 'INATIVO') return 'INATIVO';
  return 'ATIVO';
}

// Converte do formato backend para frontend
function fromBackend(t: TeacherFromBackend): Teacher {
  return {
    id: t.id,
    nome: t.name,
    cpf: t.taxId,
    email: t.email,
    telefone: t.phone,
    competencias: t.qualifiedGrades.map((g) => BACKEND_TO_GRADE[g] || g),
    chavePix: t.pixKey,
    dataInicio: t.startDate,
    status: convertStatus(t.status),
  };
}

// Formata data de DD/MM/YYYY ou ISO para DD/MM/YYYY
function formatDateForBackend(dateStr: string): string {
  // Se já está no formato DD/MM/YYYY, retorna como está
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
    return dateStr;
  }
  // Se está no formato ISO (YYYY-MM-DD), converte
  if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }
  return dateStr;
}

// Remove máscara do CPF (deixa só números)
function unmaskCPF(cpf: string): string {
  return cpf.replace(/\D/g, '');
}

// Remove máscara do telefone (deixa só números)
function unmaskPhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

export const teacherService = {
  async getAll(): Promise<Teacher[]> {
    const { data } = await api.get<{ teachers: TeacherFromBackend[] }>('/teachers');
    return data.teachers.map(fromBackend);
  },

  async create(data: Omit<Teacher, 'id'>): Promise<Teacher & { generatedPassword?: string }> {
    // Converte competências do frontend para qualifiedGrades do backend
    const qualifiedGrades = data.competencias.map(
      (c) => GRADE_TO_BACKEND[c as UiGrade] || c,
    ) as BackendGrade[];

    const payload = {
      name: data.nome,
      taxId: unmaskCPF(data.cpf),
      phone: unmaskPhone(data.telefone),
      email: data.email,
      pixKey: data.chavePix,
      startDate: formatDateForBackend(data.dataInicio),
      qualifiedGrades,
    };

    const response = await api.post<{ teacherId: string; userEmail: string; password: string }>(
      '/teachers',
      payload,
    );

    // Armazena a senha gerada para exibir na lista de usuários
    if (response.data.password) {
      userService.storeGeneratedPassword(response.data.userEmail, response.data.password);
    }

    // Retorna o professor criado com a senha gerada pelo backend
    return {
      id: response.data.teacherId,
      nome: data.nome,
      cpf: data.cpf,
      email: response.data.userEmail,
      telefone: data.telefone,
      competencias: data.competencias,
      chavePix: data.chavePix,
      dataInicio: data.dataInicio,
      status: 'ATIVO',
      generatedPassword: response.data.password,
    };
  },

  async update(id: string, data: Partial<Teacher>): Promise<Teacher> {
    const payload: Record<string, any> = {};

    if (data.nome) payload.name = data.nome;
    if (data.telefone) payload.phone = unmaskPhone(data.telefone);
    if (data.email) payload.email = data.email;
    if (data.chavePix) payload.pixKey = data.chavePix;
    if (data.status) payload.status = data.status;
    if (data.competencias) {
      payload.qualifiedGrades = data.competencias.map((c) => GRADE_TO_BACKEND[c as UiGrade] || c);
    }

    const { data: updatedData } = await api.put(`/teachers/${id}`, payload);

    // Se o backend retorna o professor atualizado, converte; senão, retorna os dados locais
    if (updatedData && updatedData.id) {
      return fromBackend(updatedData);
    }

    // Fallback: busca o professor atualizado
    const all = await this.getAll();
    const found = all.find((t) => t.id === id);
    if (!found) throw new Error('Professor não encontrado após atualização');
    return found;
  },

  async delete(id: string): Promise<void> {
    // Soft delete - atualiza status para INATIVO
    await api.put(`/teachers/${id}`, { status: 'INATIVO' });
  },

  async getById(id: string): Promise<Teacher | null> {
    try {
      const all = await this.getAll();
      return all.find((t) => t.id === id) || null;
    } catch {
      return null;
    }
  },

  // Senha padrão não existe mais - é gerada pelo backend
  getDefaultPassword(): string {
    return '(gerada automaticamente)';
  },
};

export const COMPETENCIAS_PERMITIDAS = [
  '1º Ano',
  '2º Ano',
  '3º Ano',
  '4º Ano',
  '5º Ano',
  '6º Ano',
  '7º Ano',
  '8º Ano',
  '9º Ano',
] as const;
