import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../services/api';
import { useToast } from '../../../hooks/useToast';
import styles from './UserProfile.module.css';

export function UserProfile() {
  const { user, logout, login } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [userProfile, setUserProfile] = useState<{
    name: string;
    email: string;
    profile: { accessLevel: string };
  } | null>(null);

  // Busca dados completos do usuário incluindo email
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data } = await api.get('/users/profile');
        setUserProfile(data);
        setEditName(data.name);
      } catch (error) {
        console.error('Erro ao buscar perfil:', error);
      }
    };

    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  if (!user || !userProfile) {
    return (
      <div className={styles.profileContainer}>
        <p>Carregando informações do usuário...</p>
      </div>
    );
  }

  // Formata o papel do usuário para exibição
  const displayRole = userProfile.profile.accessLevel === 'ADMIN' ? 'Administrador' : 'Recepcionista';

  const handleChangePassword = () => {
    // Faz logout e redireciona para o fluxo de recuperação de senha
    logout();
    navigate('/recuperar-senha');
  };

  const handleStartEdit = () => {
    setEditName(userProfile.name);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditName(userProfile.name);
    setIsEditing(false);
  };

  const handleSaveEdit = async () => {
    if (!editName.trim()) {
      addToast('O nome não pode estar vazio', 'error');
      return;
    }

    if (editName.trim() === userProfile.name) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
  await api.put('/users/profile', { name: editName.trim() });
      
      // Atualiza o perfil local
      setUserProfile({ ...userProfile, name: editName.trim() });
      
      // Atualiza o usuário no contexto
      const token = localStorage.getItem('auth_token');
      if (token) {
        login({ ...user, name: editName.trim() }, token);
      }
      
  addToast('Nome atualizado com sucesso!', 'success');
      setIsEditing(false);
    } catch (error: any) {
      console.error('Erro ao atualizar nome:', error);
      addToast(error.message || 'Erro ao atualizar nome. Tente novamente.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={styles.profileContainer}>
      <div className={styles.header}>
        <div className={styles.avatarLarge}>{userProfile.name.charAt(0).toUpperCase()}</div>
        <div className={styles.headerInfo}>
          <h2 className={styles.userName}>{userProfile.name}</h2>
          <span className={styles.userRole}>{displayRole}</span>
        </div>
      </div>

      <div className={styles.infoSection}>
        <h3 className={styles.sectionTitle}>Informações Pessoais</h3>

        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <label className={styles.infoLabel}>Nome Completo</label>
            {isEditing ? (
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className={styles.infoInput}
                placeholder="Digite seu nome"
                disabled={isSaving}
              />
            ) : (
              <div className={styles.infoValue}>{userProfile.name}</div>
            )}
          </div>

          <div className={styles.infoItem}>
            <label className={styles.infoLabel}>Email</label>
            <div className={styles.infoValue}>{userProfile.email}</div>
          </div>

          <div className={styles.infoItem}>
            <label className={styles.infoLabel}>Função</label>
            <div className={styles.infoValue}>{displayRole}</div>
          </div>
        </div>
      </div>

      <div className={styles.actionsSection}>
        <h3 className={styles.sectionTitle}>Ações da Conta</h3>

        <div className={styles.actionButtons}>
          {isEditing ? (
            <>
              <button
                className={`${styles.actionButton} ${styles.actionButtonCancel}`}
                onClick={handleCancelEdit}
                disabled={isSaving}
              >
                <span>❌</span>
                <span>Cancelar</span>
              </button>
              <button
                className={`${styles.actionButton} ${styles.actionButtonActive}`}
                onClick={handleSaveEdit}
                disabled={isSaving}
              >
                <span>💾</span>
                <span>{isSaving ? 'Salvando...' : 'Salvar Alterações'}</span>
              </button>
            </>
          ) : (
            <>
              <button
                className={`${styles.actionButton} ${styles.actionButtonActive}`}
                onClick={handleChangePassword}
              >
                <span>🔑</span>
                <span>Alterar Senha</span>
              </button>

              <button
                className={`${styles.actionButton} ${styles.actionButtonActive}`}
                onClick={handleStartEdit}
              >
                <span>✏️</span>
                <span>Editar Perfil</span>
              </button>
            </>
          )}
        </div>

        {!isEditing && (
          <p className={styles.infoNote}>
            ℹ️ Para alterar sua senha, você será redirecionado para o processo de recuperação de
            senha por email.
          </p>
        )}
      </div>
    </div>
  );
}
