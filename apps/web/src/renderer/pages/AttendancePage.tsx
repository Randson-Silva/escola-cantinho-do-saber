import { DashboardLayout } from '../components/dashboard/Layout/DashboardLayout';
import { AttendanceList } from '../components/attendance/AttendanceList';

export function AttendancePage() {
  return (
    <DashboardLayout>
      <AttendanceList />
    </DashboardLayout>
  );
}

