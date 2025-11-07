import React, { useState, useEffect } from 'react';
import styles from './UsersList.module.css';
import { userService, UserForUI } from '../../../services/userService';
import { useToast } from '../../../hooks/useToast';
import { useAuth } from '../../../hooks/useAuth';

export function UsersList() {
  const [users, setUsers] = useState<UserForUI[]>([]);
  const [loading, setLoading] = useState(true);
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
  const handleDelete = async (id: string) => {
    // Verifica se é admin
    if (!isAdmin) {
      addToast('⚠️ Apenas administradores podem excluir usuários.', 'error');
      return;
    }

    if (!window.confirm('Tem certeza que deseja excluir este usuário?')) {
      return;
    }
    try {
      await userService.deleteUser(id);
      setUsers((currentUsers) => currentUsers.filter((user) => user.id !== id));
      addToast('✅ Usuário excluído com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      addToast('❌ Erro ao excluir o usuário.', 'error');
    }
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
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Email</th>
              <th>Função</th>
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
                  {isAdmin ? (
                    <div className={styles.actions}>
                      <button className={styles.deleteBtn} onClick={() => handleDelete(user.id)}>
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
      )}
    </div>
  );
}
