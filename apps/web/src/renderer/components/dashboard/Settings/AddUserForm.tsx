import React, { useState } from 'react';
import styles from './AddUserForm.module.css';
import { userService } from '../../../services/userService';
import { useToast } from '../../../hooks/useToast';

export function AddUserForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('recepcionista');
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await userService.createUser({ name, email, password, role });

      // Se for recepcionista, armazena a senha gerada para exibição na lista
      if (role === 'recepcionista') {
        userService.storeGeneratedPassword(email, password);
      }

      addToast('✅ Usuário cadastrado com sucesso!', 'success');

      // Resetar formulário
      setName('');
      setEmail('');
      setPassword('');
      setRole('recepcionista');

      // Disparar evento para atualizar a lista
      window.dispatchEvent(new CustomEvent('userCreated'));
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Erro ao cadastrar usuário';
      addToast(`❌ ${errorMessage}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.formContainer}>
      <h3 className={styles.title}>Adicionar Usuário</h3>
      <form className={styles.form} onSubmit={handleSubmit}>
        <label>
          Nome
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Nome completo do usuário"
            disabled={loading}
          />
        </label>

        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="email@exemplo.com"
            disabled={loading}
          />
        </label>

        <label>
          Senha
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Mínimo 8 caracteres"
            minLength={8}
            disabled={loading}
          />
        </label>

        <label>
          Função
          <select value={role} onChange={(e) => setRole(e.target.value)} disabled={loading}>
            <option value="recepcionista">Recepcionista</option>
            <option value="professor">Professor</option>
            <option value="administrador">Administrador</option>
          </select>
          {role === 'professor' && (
            <small className={styles.permissionHint}>
              ⚠️ Professores têm acesso limitado: apenas Dashboard e registro de frequência.
            </small>
          )}
        </label>

        <button className={styles.submitButton} type="submit" disabled={loading}>
          {loading ? 'Cadastrando...' : 'Cadastrar Usuário'}
        </button>
      </form>
    </div>
  );
}
