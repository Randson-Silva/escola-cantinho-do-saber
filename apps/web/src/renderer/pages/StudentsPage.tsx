import { DashboardLayout } from '../components/dashboard/Layout/DashboardLayout';
import { RegisterStudentForm } from '../components/students/RegisterStudentForm';
// Aqui você pode importar outros componentes de students, como lista, filtros, etc.

export function StudentsPage() {
  return (
    <DashboardLayout>
      <RegisterStudentForm />
    </DashboardLayout>
  );
}

