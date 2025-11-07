import React, { useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import styles from './UserProfile.module.css';

export function UserProfile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);

  if (!user) {
    return (
      <div className={styles.profileContainer}>
        <p>Carregando informações do usuário...</p>
      </div>
    );
  }

  // Formata o papel do usuário para exibição
  const displayRole = user.role === 'ADMIN' ? 'Administrador' : 'Recepcionista';

  const handleChangePassword = () => {
    // Faz logout e redireciona para o fluxo de recuperação de senha
    logout();
    navigate('/recuperar-senha');
  };

  return (
    <div className={styles.profileContainer}>
      <div className={styles.header}>
        <div className={styles.avatarLarge}>{user.name.charAt(0).toUpperCase()}</div>
        <div className={styles.headerInfo}>
          <h2 className={styles.userName}>{user.name}</h2>
          <span className={styles.userRole}>{displayRole}</span>
        </div>
      </div>

      <div className={styles.infoSection}>
        <h3 className={styles.sectionTitle}>Informações Pessoais</h3>

        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <label className={styles.infoLabel}>Nome Completo</label>
            <div className={styles.infoValue}>{user.name}</div>
          </div>

          <div className={styles.infoItem}>
            <label className={styles.infoLabel}>Email</label>
            <div className={styles.infoValue}>{user.email}</div>
          </div>

          <div className={styles.infoItem}>
            <label className={styles.infoLabel}>Função</label>
            <div className={styles.infoValue}>{displayRole}</div>
          </div>

          <div className={styles.infoItem}>
            <label className={styles.infoLabel}>ID do Usuário</label>
            <div className={styles.infoValue}>{user.id}</div>
          </div>
        </div>
      </div>

      <div className={styles.actionsSection}>
        <h3 className={styles.sectionTitle}>Ações da Conta</h3>

        <div className={styles.actionButtons}>
          <button
            className={`${styles.actionButton} ${styles.actionButtonActive}`}
            onClick={handleChangePassword}
          >
            <span>🔑</span>
            <span>Alterar Senha</span>
          </button>

          <button className={styles.actionButton} disabled>
            <span>✏️</span>
            <span>Editar Perfil</span>
          </button>
        </div>

        <p className={styles.infoNote}>
          ℹ️ Para alterar sua senha, você será redirecionado para o processo de recuperação de senha
          por email.
        </p>

        <p className={styles.comingSoon}>⚠️ Edição de perfil em desenvolvimento</p>
      </div>
    </div>
  );
}

