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
// STORAGE - Apenas dados criados pelo usuário
// ============================================================================

// Inicializa do localStorage (sem dados mock)
function loadStudentsFromStorage(): Student[] {
  try {
    const stored = localStorage.getItem('students');
    if (stored) {
      const parsed = JSON.parse(stored);
      // Filtra alunos mockados antigos (IDs que começam com 'mock-' de 1 a 9)
      return parsed.filter((s: Student) => !s.id.match(/^mock-[1-9]$/));
    }
    return [];
  } catch {
    return [];
  }
}

function saveStudentsToStorage(students: Student[]): void {
  localStorage.setItem('students', JSON.stringify(students));
}

// Banco de dados em memória (inicializa do localStorage)
let studentsDb: Student[] = loadStudentsFromStorage();

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const generateId = () => `student-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// ============================================================================
// SERVICE
// ============================================================================

export const studentService = {
  // 1. CRIAR ALUNO
  async createStudent(data: StudentFormData): Promise<{ id: string }> {
    await delay(300);

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

    studentsDb.unshift(newStudent);
    saveStudentsToStorage(studentsDb);

    return { id: newStudent.id };
  },

  // 2. BUSCAR POR NOME
  async searchStudentsByName(studentName: string): Promise<Student[]> {
    await delay(200);

    // Recarrega do localStorage
    studentsDb = loadStudentsFromStorage();

    if (!studentName || studentName.trim() === '') {
      return studentsDb;
    }

    return studentsDb.filter((s) => s.name.toLowerCase().includes(studentName.toLowerCase()));
  },

  // 3. BUSCAR POR ID
  async getStudentById(id: string): Promise<Student> {
    await delay(150);

    studentsDb = loadStudentsFromStorage();

    const student = studentsDb.find((s) => s.id === id);
    if (!student) {
      throw new Error('Aluno não encontrado');
    }
    return student;
  },

  // 4. ATUALIZAR ALUNO
  async updateStudent(id: string, data: Partial<StudentFormData>): Promise<void> {
    await delay(300);

    studentsDb = loadStudentsFromStorage();
    const index = studentsDb.findIndex((s) => s.id === id);
    if (index === -1) {
      throw new Error('Aluno não encontrado');
    }

    const oldStudent = studentsDb[index];
    const newStatus = data.status || oldStudent.status;
    const oldClass = oldStudent.class;
    const newClass = data.class || oldClass;

    // Se o aluno foi inativado, remove dos slots da turma
    if (newStatus === 'inactive' && oldStudent.status === 'active') {
      const { classService } = await import('./classService');
      try {
        // Remove de todas as turmas (caso tenha mudado)
        const allClasses = await classService.getAll();
        for (const cls of allClasses) {
          const hasStudent = cls.studentSlots?.some((s) => s.studentId === id);
          if (hasStudent) {
            await classService.removeStudentFromSlot(cls.id, id);
          }
        }
      } catch (error) {
        console.error('Erro ao remover aluno da turma:', error);
      }
    }

    // Se mudou de turma, remove da antiga e permanece na nova
    if (newClass !== oldClass && oldClass) {
      const { classService } = await import('./classService');
      try {
        const allClasses = await classService.getAll();
        const oldClassObj = allClasses.find((c) => c.id === oldClass || c.name === oldClass);
        if (oldClassObj) {
          await classService.removeStudentFromSlot(oldClassObj.id, id);
        }
      } catch (error) {
        console.error('Erro ao remover aluno da turma antiga:', error);
      }
    }

    studentsDb[index] = {
      ...studentsDb[index],
      ...data,
      address: data.address
        ? { ...studentsDb[index].address, ...data.address }
        : studentsDb[index].address,
      guardian: data.guardian
        ? {
            ...studentsDb[index].guardian,
            ...data.guardian,
            address: data.guardian.address
              ? { ...studentsDb[index].guardian.address, ...data.guardian.address }
              : studentsDb[index].guardian.address,
          }
        : studentsDb[index].guardian,
    };

    saveStudentsToStorage(studentsDb);
  },

  // 5. DELETAR ALUNO
  async deleteStudent(id: string): Promise<void> {
    await delay(200);

    studentsDb = loadStudentsFromStorage();

    // Remove o aluno de todas as turmas antes de deletar
    const { classService } = await import('./classService');
    try {
      const allClasses = await classService.getAll();
      for (const cls of allClasses) {
        const hasStudent = cls.studentSlots?.some((s) => s.studentId === id);
        if (hasStudent) {
          await classService.removeStudentFromSlot(cls.id, id);
        }
      }
    } catch (error) {
      console.error('Erro ao remover aluno das turmas:', error);
    }

    studentsDb = studentsDb.filter((s) => s.id !== id);
    saveStudentsToStorage(studentsDb);
  },

  // 6. COUNT
  async getStudentsCount(): Promise<number> {
    await delay(100);

    studentsDb = loadStudentsFromStorage();
    return studentsDb.length;
  },

  // 7. LISTAR TODOS
  async getAll(): Promise<Student[]> {
    return this.searchStudentsByName('');
  },
};
