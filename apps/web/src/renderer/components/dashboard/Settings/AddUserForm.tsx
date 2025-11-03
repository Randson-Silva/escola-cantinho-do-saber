import React, { useState } from 'react';
import styles from './AddUserForm.module.css';
import { userService } from '../../../services/api/user.service';

export function AddUserForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('relatorios');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await userService.createUser({ email, password, role });
      setSuccess('Usuário adicionado com sucesso!');
      setEmail('');
      setPassword('');
      setRole('relatorios');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Erro ao cadastrar usuário');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h3>Adicionar Usuário</h3>
      <label>
        Email
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </label>
      <label>
        Senha
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </label>
      <label>
        Função
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="relatorios">Gerar Relatórios</option>
          <option value="despesas">Ver Despesas</option>
          <option value="admin">Administrador</option>
        </select>
      </label>
      <button type="submit" disabled={loading}>
        {loading ? 'Adicionando...' : 'Adicionar Usuário'}
      </button>
      {success && <p className={styles.success}>{success}</p>}
      {error && <p className={styles.error}>{error}</p>}
    </form>
  );
}

