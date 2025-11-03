import React from 'react';
import styles from './SettingsLayout.module.css';

interface SettingsLayoutProps {
  children: React.ReactNode;
}

export function SettingsLayout({ children }: SettingsLayoutProps) {
  return (
    <div className={styles.settingsContainer}>
      <aside className={styles.settingsSidebar}>
        <h2>Configurações</h2>
        <ul>
          <li>Usuários</li>
          <li>Relatórios</li>
          <li>Despesas</li>
        </ul>
        <button className={styles.backButton} onClick={() => (window.location.href = '/dashboard')}>
          ← Voltar para o Dashboard
        </button>
      </aside>
      <main className={styles.settingsMain}>{children}</main>
    </div>
  );
}

