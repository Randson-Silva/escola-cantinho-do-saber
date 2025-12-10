import { DashboardLayout } from '../components/dashboard/Layout/DashboardLayout';
import { TeacherList } from '../components/teachers/TeacherList';

export function TeachersPage() {
  return (
    <DashboardLayout>
      <TeacherList />
    </DashboardLayout>
  );
}

