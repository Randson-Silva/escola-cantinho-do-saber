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
  status?: 'active' | 'inactive';
  enrollmentDate?: string;
}

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_STUDENTS: Student[] = [
  {
    id: 'mock-1',
    name: 'João Pedro Silva',
    birthDate: '2015-03-15',
    grade: 'series-3-ano',
    class: 'Turma A - Manhã',
    schoolType: 'publica',
    teacher: 'Prof. Maria Santos',
    monthlyFee: 350,
    address: {
      street: 'Rua das Flores',
      number: '123',
      complement: 'Apto 101',
      neighborhood: 'Centro',
    },
    guardian: {
      name: 'Carlos Silva',
      relationship: 'Pai',
      phone: '(11) 99999-0001',
      email: 'carlos.silva@email.com',
      address: {
        street: 'Rua das Flores',
        number: '123',
        complement: 'Apto 101',
        neighborhood: 'Centro',
      },
    },
    enrollmentDate: '2024-02-01',
    status: 'active',
  },
  {
    id: 'mock-2',
    name: 'Maria Eduarda Costa',
    birthDate: '2016-07-22',
    grade: 'series-2-ano',
    class: 'Turma B - Tarde',
    schoolType: 'particular',
    teacher: 'Prof. Ana Paula',
    monthlyFee: 400,
    address: {
      street: 'Av. Principal',
      number: '456',
      neighborhood: 'Jardim América',
    },
    guardian: {
      name: 'Fernanda Costa',
      relationship: 'Mãe',
      phone: '(11) 99999-0002',
      email: 'fernanda.costa@email.com',
      address: {
        street: 'Av. Principal',
        number: '456',
        neighborhood: 'Jardim América',
      },
    },
    enrollmentDate: '2024-01-15',
    status: 'active',
  },
  {
    id: 'mock-3',
    name: 'Lucas Oliveira Santos',
    birthDate: '2014-11-08',
    grade: 'series-4-ano',
    class: 'Turma A - Manhã',
    schoolType: 'publica',
    teacher: 'Prof. Roberto Lima',
    monthlyFee: 350,
    address: {
      street: 'Rua São Paulo',
      number: '789',
      neighborhood: 'Vila Nova',
    },
    guardian: {
      name: 'Patricia Oliveira',
      relationship: 'Mãe',
      phone: '(11) 99999-0003',
      email: 'patricia.oliveira@email.com',
      address: {
        street: 'Rua São Paulo',
        number: '789',
        neighborhood: 'Vila Nova',
      },
    },
    enrollmentDate: '2023-08-10',
    status: 'active',
  },
  {
    id: 'mock-4',
    name: 'Ana Beatriz Ferreira',
    birthDate: '2017-01-30',
    grade: 'series-1-ano',
    class: 'Turma C - Tarde',
    schoolType: 'particular',
    teacher: 'Prof. Juliana Mendes',
    monthlyFee: 450,
    address: {
      street: 'Rua dos Ipês',
      number: '321',
      complement: 'Casa 2',
      neighborhood: 'Parque das Árvores',
    },
    guardian: {
      name: 'Ricardo Ferreira',
      relationship: 'Pai',
      phone: '(11) 99999-0004',
      email: 'ricardo.ferreira@email.com',
      address: {
        street: 'Rua dos Ipês',
        number: '321',
        complement: 'Casa 2',
        neighborhood: 'Parque das Árvores',
      },
    },
    enrollmentDate: '2024-03-01',
    status: 'active',
  },
  {
    id: 'mock-5',
    name: 'Gabriel Henrique Souza',
    birthDate: '2015-09-12',
    grade: 'series-3-ano',
    class: 'Turma B - Manhã',
    schoolType: 'publica',
    teacher: 'Prof. Maria Santos',
    monthlyFee: 350,
    address: {
      street: 'Av. Brasil',
      number: '1000',
      neighborhood: 'Centro',
    },
    guardian: {
      name: 'Luciana Souza',
      relationship: 'Mãe',
      phone: '(11) 99999-0005',
      email: 'luciana.souza@email.com',
      address: {
        street: 'Av. Brasil',
        number: '1000',
        neighborhood: 'Centro',
      },
    },
    enrollmentDate: '2023-02-20',
    status: 'inactive',
  },
];

// Simula um "banco de dados" em memória
let mockStudentsDb = [...MOCK_STUDENTS];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const generateId = () => `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// ============================================================================
// SERVICE (MOCK)
// ============================================================================

export const studentService = {
  // 1. CRIAR ALUNO
  async createStudent(data: StudentFormData): Promise<{ id: string }> {
    await delay(300); // Simula latência de rede

    const newStudent: Student = {
      id: generateId(),
      name: data.name,
      birthDate: data.birthDate,
      grade: data.grade,
      class: data.class || 'A definir',
      schoolType: data.schoolType,
      teacher: data.teacher || 'A definir',
      monthlyFee: data.monthlyFee || 0,
      address: {
        street: data.address.street,
        number: data.address.number,
        complement: data.address.complement,
        neighborhood: data.address.neighborhood,
      },
      guardian: {
        name: data.guardian.name,
        relationship: data.guardian.relationship,
        phone: data.guardian.phone,
        email: data.guardian.email,
        address: {
          street: data.guardian.address.street,
          number: data.guardian.address.number,
          complement: data.guardian.address.complement,
          neighborhood: data.guardian.address.neighborhood,
        },
      },
      enrollmentDate: new Date().toISOString(),
      status: 'active',
    };

    mockStudentsDb.unshift(newStudent);

    // Também salva no localStorage para persistência
    localStorage.setItem('students', JSON.stringify(mockStudentsDb));

    return { id: newStudent.id };
  },

  // 2. BUSCAR POR NOME (Substitui o ListStudents)
  async searchStudentsByName(studentName: string): Promise<Student[]> {
    await delay(200);

    // Tenta carregar do localStorage primeiro
    const stored = localStorage.getItem('students');
    if (stored) {
      mockStudentsDb = JSON.parse(stored);
    }

    if (!studentName || studentName.trim() === '') {
      return mockStudentsDb;
    }

    return mockStudentsDb.filter((s) => s.name.toLowerCase().includes(studentName.toLowerCase()));
  },

  // 3. BUSCAR POR ID (Para edição/detalhes)
  async getStudentById(id: string): Promise<Student> {
    await delay(150);

    // Tenta carregar do localStorage primeiro
    const stored = localStorage.getItem('students');
    if (stored) {
      mockStudentsDb = JSON.parse(stored);
    }

    const student = mockStudentsDb.find((s) => s.id === id);
    if (!student) {
      throw new Error('Aluno não encontrado');
    }
    return student;
  },

  // 4. ATUALIZAR ALUNO
  async updateStudent(id: string, data: Partial<StudentFormData>): Promise<void> {
    await delay(300);

    const index = mockStudentsDb.findIndex((s) => s.id === id);
    if (index === -1) {
      throw new Error('Aluno não encontrado');
    }

    mockStudentsDb[index] = {
      ...mockStudentsDb[index],
      ...data,
      address: data.address
        ? { ...mockStudentsDb[index].address, ...data.address }
        : mockStudentsDb[index].address,
      guardian: data.guardian
        ? {
            ...mockStudentsDb[index].guardian,
            ...data.guardian,
            address: data.guardian.address
              ? { ...mockStudentsDb[index].guardian.address, ...data.guardian.address }
              : mockStudentsDb[index].guardian.address,
          }
        : mockStudentsDb[index].guardian,
    };

    localStorage.setItem('students', JSON.stringify(mockStudentsDb));
  },

  // 5. DELETAR ALUNO
  async deleteStudent(id: string): Promise<void> {
    await delay(200);

    mockStudentsDb = mockStudentsDb.filter((s) => s.id !== id);
    localStorage.setItem('students', JSON.stringify(mockStudentsDb));
  },

  // 6. COUNT (Relatórios)
  async getStudentsCount(): Promise<number> {
    await delay(100);

    const stored = localStorage.getItem('students');
    if (stored) {
      mockStudentsDb = JSON.parse(stored);
    }

    return mockStudentsDb.length;
  },

  // 7. LISTAR TODOS (Novo método auxiliar)
  async getAll(): Promise<Student[]> {
    return this.searchStudentsByName('');
  },
};
