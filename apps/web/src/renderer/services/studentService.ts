import { api } from './api';

// ============================================================================
// INTERFACES
// ============================================================================

// 1. MODELO DE LEITURA (O que a Lista e o Detalhe usam)
export interface Student {
  id: string;
  name: string;
  birthDate: string;
  grade: string; // No back é 'seriesId'
  class: string; // No back é 'classId'
  schoolType: string; // 'publica' | 'particular'
  teacher: string;
  monthlyFee: number;

  address: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string; // No back é 'district'
  };

  guardian: {
    name: string;
    relationship: string; // No back é 'kinship'
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

// 2. MODELO DE FORMULÁRIO (O que o Form de Cadastro/Edição usa)
// Removemos o ID daqui, pois no cadastro ele não existe
export interface StudentFormData {
  name: string;
  birthDate: string;
  grade: string;
  schoolType: 'publica' | 'particular';
  class: string;
  teacher: string;
  monthlyFee: number;
  address: {
    street: string;
    number: string;
    complement: string;
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
      complement: string;
      neighborhood: string;
    };
  };
  status: 'active' | 'inactive';
  enrollmentDate?: string;
}

// ============================================================================
// HELPERS (Mapeamento Backend -> Frontend)
// ============================================================================

// Função auxiliar para garantir que os dados nunca venham nulos do backend
// e evitar o erro "Uncontrolled Input" ou "Key prop unique"
function mapToFrontend(d: any): Student {
  return {
    id: d.id || d._id || d.studentId || '',
    name: d.name || '',
    birthDate: d.birthDate || '',
    grade: d.seriesId || d.series?.name || '',
    class: d.classId || d.class?.name || '',
    schoolType: 'publica', // Backend não retorna isso ainda
    teacher: d.class?.teacher?.name || '',
    monthlyFee: d.monthlyFee || 0,

    // Mapeamento do endereço do aluno
    address:
      d.addresses && d.addresses.length > 0
        ? {
            street: d.addresses[0].street || '',
            number: d.addresses[0].number || '',
            neighborhood: d.addresses[0].district || '',
            complement: d.addresses[0].complement || '',
          }
        : { street: '', number: '', neighborhood: '', complement: '' },

    // Mapeamento do responsável (guardian)
    guardian:
      d.guardians && d.guardians.length > 0
        ? {
            name: d.guardians[0].guardian?.name || '',
            relationship: d.guardians[0].kinship || '',
            phone: d.guardians[0].guardian?.phones?.[0] || '',
            email: d.guardians[0].guardian?.email || '',
            address:
              d.guardians[0].guardian?.addresses && d.guardians[0].guardian.addresses.length > 0
                ? {
                    street: d.guardians[0].guardian.addresses[0].street || '',
                    number: d.guardians[0].guardian.addresses[0].number || '',
                    neighborhood: d.guardians[0].guardian.addresses[0].district || '',
                    complement: d.guardians[0].guardian.addresses[0].complement || '',
                  }
                : { street: '', number: '', neighborhood: '', complement: '' },
          }
        : {
            name: '',
            relationship: '',
            phone: '',
            email: '',
            address: { street: '', number: '', neighborhood: '', complement: '' },
          },

    enrollmentDate: d.createdAt || new Date().toISOString(),
    status: 'active', // Backend não retorna status ainda
  };
}

// ============================================================================
// SERVICE
// ============================================================================

export const studentService = {
  // 1. CRIAR ALUNO
  // Retorna apenas o ID (string) para facilitar o redirect no front
  async createStudent(data: StudentFormData): Promise<string> {
    const backendPayload = {
      name: data.name,
      birthDate: new Date(data.birthDate), // Garante formato Date
      classId: data.class,
      seriesId: data.grade,
      studentAddress: {
        street: data.address.street,
        number: data.address.number,
        district: data.address.neighborhood,
        complement: data.address.complement || null,
      },
      guardianAddress: {
        street: data.guardian.address.street,
        number: data.guardian.address.number,
        district: data.guardian.address.neighborhood,
        complement: data.guardian.address.complement || null,
      },
      guardian: {
        name: data.guardian.name,
        kinship: data.guardian.relationship,
        phones: [data.guardian.phone],
        email: data.guardian.email || null,
      },
    };

    try {
      // O backend retorna { studentId: "..." }
      const response = await api.post<{ studentId: string }>('/student', backendPayload);
      return response.data.studentId;
    } catch (error) {
      console.error('Erro ao criar aluno:', error);
      throw error;
    }
  },

  // 2. BUSCAR POR NOME (Substitui o ListStudents)
  async searchStudentsByName(studentName: string): Promise<Student[]> {
    try {
      // GET com body precisa usar a propriedade 'data' do config do axios
      const { data } = await api.request<any[]>({
        method: 'GET',
        url: '/student',
        data: { studentName },
      });
      // Usa o helper para limpar os dados antes de entregar pra tela
      return (data || []).map(mapToFrontend);
    } catch (error) {
      console.error('Erro na busca:', error);
      return [];
    }
  },

  // 3. BUSCAR POR ID (Para edição/detalhes)
  async getStudentById(id: string): Promise<Student> {
    try {
      const { data } = await api.get<any>(`/student/${id}`);
      return mapToFrontend(data);
    } catch (error) {
      console.error('Erro ao buscar aluno por ID:', error);
      throw error;
    }
  },

  // 4. ATUALIZAR ALUNO
  async updateStudent(id: string, data: Partial<StudentFormData>): Promise<void> {
    // Monta payload parcial apenas com o que foi alterado (simplificado)
    // Nota: Idealmente, validar campos como no Create
    const backendPayload: any = {
      name: data.name,
      // Adicione aqui o mapeamento reverso (Front -> Back) similar ao create
      // se o seu endpoint de update exigir estrutura complexa
    };

    await api.put(`/student/${id}`, backendPayload);
  },

  // 5. DELETAR ALUNO
  async deleteStudent(id: string): Promise<void> {
    await api.delete(`/student/${id}`);
  },

  // 6. COUNT (Relatórios)
  async getStudentsCount(): Promise<number> {
    try {
      const { data } = await api.get<{ count: number }>('/student/report/count');
      return data?.count ?? 0;
    } catch {
      return 0;
    }
  },
};
