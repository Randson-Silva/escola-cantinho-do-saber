import { DashboardLayout } from '../components/dashboard/Layout/DashboardLayout';
import { DailyAttendance } from '../components/attendance/DailyAttendance';

export function DailyAttendancePage() {
  return (
    <DashboardLayout>
      <DailyAttendance />
    </DashboardLayout>
  );
}

