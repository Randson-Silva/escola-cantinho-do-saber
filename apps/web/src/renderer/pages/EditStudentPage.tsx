import { DashboardLayout } from '../components/dashboard/Layout/DashboardLayout';
import { EditStudentForm } from '../components/students/EditStudentForm';

export default function EditStudentPage() {
  return (
    <DashboardLayout>
      <EditStudentForm />
    </DashboardLayout>
  );
}

