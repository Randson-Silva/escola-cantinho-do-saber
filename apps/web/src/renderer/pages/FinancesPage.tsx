import { DashboardLayout } from '../components/dashboard/Layout/DashboardLayout';
import { FinancesDashboard } from '../components/finances/FinancesDashboard';

export function FinancesPage() {
  return (
    <DashboardLayout>
      <FinancesDashboard />
    </DashboardLayout>
  );
}
