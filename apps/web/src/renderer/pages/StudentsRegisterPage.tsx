import { DashboardLayout } from '../components/dashboard/Layout/DashboardLayout';
import { RegisterStudentForm } from '../components/students/RegisterStudentForm';

export function StudentsRegisterPage() {
  return (
    <DashboardLayout>
      <RegisterStudentForm />
    </DashboardLayout>
  );
}

