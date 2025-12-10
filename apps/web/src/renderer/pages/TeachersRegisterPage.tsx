import { DashboardLayout } from '../components/dashboard/Layout/DashboardLayout';
import { RegisterTeacherForm } from '../components/teachers/RegisterTeacherForm';

export function TeachersRegisterPage() {
  return (
    <DashboardLayout>
      <RegisterTeacherForm />
    </DashboardLayout>
  );
}

