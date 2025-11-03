import { DashboardLayout } from '../components/dashboard/Layout/DashboardLayout';
import { RegisterStudentForm } from '../components/students/RegisterStudentForm';
// Aqui você pode importar outros componentes de students, como lista, filtros, etc.

export function StudentsPage() {
  return (
    <DashboardLayout>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '2rem',
        }}
      >
        <h2 style={{ color: '#1976d2' }}>Cadastro de Alunos</h2>
      </div>
      <RegisterStudentForm />
    </DashboardLayout>
  );
}

