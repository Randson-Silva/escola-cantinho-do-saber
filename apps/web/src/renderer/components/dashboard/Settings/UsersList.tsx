import React, { useState } from 'react';
import styles from './UsersList.module.css';

// Mock de usuários cadastrados
const initialUsers = [
  { id: 1, email: 'admin@cantinho.com', role: 'admin' },
  { id: 2, email: 'professor@cantinho.com', role: 'relatorios' },
  { id: 3, email: 'financeiro@cantinho.com', role: 'despesas' },
];

export function UsersList() {
  const [users, setUsers] = useState(initialUsers);
  const [editId, setEditId] = useState<number | null>(null);
  const [newPassword, setNewPassword] = useState('');

  function handleDelete(id: number) {
    setUsers(users.filter((u) => u.id !== id));
  }

  function handleEdit(id: number) {
    setEditId(id);
    setNewPassword('');
  }

  function handleSave(id: number) {
    // Aqui você faria a chamada para atualizar a senha no backend
    setEditId(null);
    setNewPassword('');
    alert('Senha atualizada!');
  }

  return (
    <div className={styles.listContainer}>
      <h3>Usuários Cadastrados</h3>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Email</th>
            <th>Função</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>
                {editId === user.id ? (
                  <>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Nova senha"
                      className={styles.input}
                    />
                    <button className={styles.saveBtn} onClick={() => handleSave(user.id)}>
                      Salvar
                    </button>
                    <button className={styles.cancelBtn} onClick={() => setEditId(null)}>
                      Cancelar
                    </button>
                  </>
                ) : (
                  <>
                    <button className={styles.editBtn} onClick={() => handleEdit(user.id)}>
                      Editar Senha
                    </button>
                    <button className={styles.deleteBtn} onClick={() => handleDelete(user.id)}>
                      Excluir
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

