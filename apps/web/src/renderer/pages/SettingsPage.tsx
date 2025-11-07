import { DashboardLayout } from '../components/dashboard/Layout/DashboardLayout';
import { UserProfile } from '../components/dashboard/Settings/UserProfile';
import styles from '../styles/settings-page.module.css';

export function SettingsPage() {
  return (
    <DashboardLayout>
      <div className={styles.settingsContainer}>
        <UserProfile />
      </div>
    </DashboardLayout>
  );
}
