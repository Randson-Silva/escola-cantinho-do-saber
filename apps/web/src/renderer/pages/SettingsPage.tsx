import { DashboardLayout } from '../components/dashboard/Layout/DashboardLayout';
//import { AddUserForm } from '../components/dashboard/Settings/AddUserForm';
import { UsersList } from '../components/dashboard/Settings/UsersList';

export function SettingsPage() {
  return (
    <DashboardLayout>
      <div style={{ maxWidth: 700, margin: '0 auto', marginTop: '2rem' }}>
        <h2 style={{ color: '#1976d2', marginBottom: '2rem' }}>Configurações</h2>
        
        <UsersList />
      </div>
    </DashboardLayout>
  );
}

