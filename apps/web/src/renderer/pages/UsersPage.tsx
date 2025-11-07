import { DashboardLayout } from '../components/dashboard/Layout/DashboardLayout';
import { UsersList } from '../components/dashboard/Settings/UsersList';
import { AddUserForm } from '../components/dashboard/Settings/AddUserForm';
import styles from '../styles/users-page.module.css';

export function UsersPage() {
  return (
    <DashboardLayout>
      <div className={styles.usersGrid}>
        <AddUserForm />
        <UsersList />
      </div>
    </DashboardLayout>
  );
}

