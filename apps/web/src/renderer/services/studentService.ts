import { api } from './api';

// Interface para os dados do aluno
export interface Student {
  id: string;
  name: string;
  birthDate: string;
  grade: string; // 1º ao 7º ano
  schoolType: 'publica' | 'particular';
  class: string; // Turma (mocado)
  teacher: string; // Professor(a)
  monthlyFee: number; // Valor da mensalidade
  address: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
  };
  guardian: {
    name: string;
    relationship: string;
    phone: string;
    email: string;
    address: {
      street: string;
      number: string;
      complement?: string;
      neighborhood: string;
    };
  };
  enrollmentDate: string;
  status: 'active' | 'inactive';
}

export interface CreateStudentDTO {
  name: string;
  birthDate: string;
  grade: string;
  schoolType: 'publica' | 'particular';
  class: string;
  teacher: string;
  monthlyFee: number; // Valor da mensalidade
  address: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
  };
  guardian: {
    name: string;
    relationship: string;
    phone: string;
    email: string;
    address: {
      street: string;
      number: string;
      complement?: string;
      neighborhood: string;
    };
  };
  status?: 'active' | 'inactive';
  enrollmentDate?: string;
}

export const studentService = {
  // Criar novo aluno (rota genérica - será implementada no backend)
  async createStudent(data: CreateStudentDTO): Promise<Student> {
    const { data: response } = await api.post<Student>('/students', data);
    return response;
  },

  // Listar todos os alunos (rota genérica - será implementada no backend)
  async listStudents(): Promise<Student[]> {
    const { data } = await api.get<Student[]>('/students');
    return data;
  },

  // Buscar aluno por ID (rota genérica - será implementada no backend)
  async getStudentById(id: string): Promise<Student> {
    const { data } = await api.get<Student>(`/students/${id}`);
    return data;
  },

  // Atualizar aluno (rota genérica - será implementada no backend)
  async updateStudent(id: string, data: Partial<CreateStudentDTO>): Promise<Student> {
    const { data: response } = await api.put<Student>(`/students/${id}`, data);
    return response;
  },

  // Deletar aluno (rota genérica - será implementada no backend)
  async deleteStudent(id: string): Promise<void> {
    await api.delete(`/students/${id}`);
  },
};

