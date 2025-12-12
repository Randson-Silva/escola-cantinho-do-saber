import { DashboardLayout } from '../components/dashboard/Layout/DashboardLayout';
import { ClassesList } from '../components/classes/ClassesList';

export function ClassesPage() {
  return (
    <DashboardLayout>
      <ClassesList />
    </DashboardLayout>
  );
}
