import React, { useState, useEffect } from 'react';
import styles from './UsersList.module.css';
import { userService, UserForUI } from '../../../services/userService';
import { useToast } from '../../../hooks/useToast';
import { useAuth } from '../../../hooks/useAuth';

export function UsersList() {
  const [users, setUsers] = useState<UserForUI[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    userId: string | null;
    userName: string;
  }>({
    isOpen: false,
    userId: null,
    userName: '',
  });
  const { addToast } = useToast();
  const { user } = useAuth();

  // Verifica se o usuário logado é admin
  const isAdmin = user?.role === 'ADMIN';

  // Função para carregar os usuários do backend
  const loadUsers = async () => {
    try {
      setLoading(true);
      const fetchedUsers = await userService.listUsers();
      setUsers(fetchedUsers);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      // addToast('❌ Erro ao carregar a lista de usuários.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // useEffect para carregar os usuários quando o componente montar
  useEffect(() => {
    loadUsers();

    // Ouve o evento 'userCreated' para recarregar a lista automaticamente
    window.addEventListener('userCreated', loadUsers);

    // Limpa o listener quando o componente desmontar
    return () => {
      window.removeEventListener('userCreated', loadUsers);
    };
  }, []);

  // Função para deletar um usuário (apenas admin)
  const handleDelete = (id: string, name: string) => {
    // Verifica se é admin
    if (!isAdmin) {
      addToast('⚠️ Apenas administradores podem excluir usuários.', 'error');
      return;
    }

    // Abre o modal de confirmação
    setConfirmDialog({
      isOpen: true,
      userId: id,
      userName: name,
    });
  };

  // Confirma a exclusão
  const confirmDelete = async () => {
    if (!confirmDialog.userId) return;

    try {
      await userService.deleteUser(confirmDialog.userId);
      setUsers((currentUsers) => currentUsers.filter((user) => user.id !== confirmDialog.userId));
      addToast('✅ Usuário excluído com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      addToast('❌ Erro ao excluir o usuário.', 'error');
    } finally {
      // Fecha o modal
      cancelDelete();
    }
  };

  // Cancela a exclusão
  const cancelDelete = () => {
    setConfirmDialog({
      isOpen: false,
      userId: null,
      userName: '',
    });
  };

  if (loading) {
    return (
      <div className={styles.listContainer}>
        <h3 className={styles.title}>Usuários Cadastrados</h3>
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className={styles.listContainer}>
      <h3 className={styles.title}>Usuários Cadastrados</h3>
      {users.length === 0 ? (
        <p>Nenhum usuário cadastrado.</p>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Email</th>
                <th>Função</th>
                <th>Senha Gerada</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td style={{ textTransform: 'capitalize' }}>{user.role}</td>
                  <td>
                    {user.generatedPassword ? (
                      <code
                        style={{
                          background: '#e8f5e9',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontFamily: 'monospace',
                          color: '#2e7d32',
                        }}
                      >
                        {user.generatedPassword}
                      </code>
                    ) : (
                      <span style={{ color: '#9e9e9e', fontSize: '0.85rem' }}>—</span>
                    )}
                  </td>
                  <td>
                    {isAdmin ? (
                      <div className={styles.actions}>
                        <button
                          className={styles.deleteBtn}
                          onClick={() => handleDelete(user.id, user.name)}
                        >
                          Excluir
                        </button>
                      </div>
                    ) : (
                      <span className={styles.noPermission}>Sem permissão</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de confirmação */}
      {confirmDialog.isOpen && (
        <div className={styles.modal}>
          <div className={styles.modalOverlay} onClick={cancelDelete} />
          <div className={styles.modalContent}>
            <h3 className={styles.modalTitle}>Confirmar Exclusão</h3>
            <p className={styles.modalMessage}>
              Tem certeza que deseja excluir o usuário <strong>{confirmDialog.userName}</strong>?
              <br />
              Esta ação não pode ser desfeita.
            </p>
            <div className={styles.modalActions}>
              <button onClick={cancelDelete} className={styles.modalCancelButton}>
                Cancelar
              </button>
              <button onClick={confirmDelete} className={styles.modalDeleteButton}>
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
