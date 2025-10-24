import React, { useState } from 'react';
import styles from './LoginForm.module.css';
import { useNavigate } from 'react-router-dom';
import { useForm, useAuth, useToast } from '../../hooks';
import { login as loginApi } from '../../services/auth';

function LoginForm() {
  const navigate = useNavigate();
  const { values, handleChange } = useForm({ email: '', password: '' });
  const { login } = useAuth();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [capsEmail, setCapsEmail] = useState(false);
  const [capsPassword, setCapsPassword] = useState(false);

  function handleCaps(e: React.KeyboardEvent<HTMLInputElement>) {
    const on = e.getModifierState?.('CapsLock') ?? false;
    if (e.currentTarget.name === 'email') setCapsEmail(on);
    if (e.currentTarget.name === 'password') setCapsPassword(on);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Validações com toasts flutuantes
    if (!values.email.trim()) {
      addToast('⚠️ Preencha o email', 'error');
      return;
    }
    if (!values.email.includes('@')) {
      addToast('⚠️ Email inválido', 'error');
      return;
    }
    if (!values.password.trim()) {
      addToast('⚠️ Preencha a senha', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await loginApi(values);
      login(response.user, response.token);
      addToast('✅ Login realizado com sucesso!', 'success');
      // navigate('/dashboard'); // ajuste conforme sua rota
    } catch (err: any) {
      addToast(err?.message ?? '❌ Erro ao fazer login', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <form onSubmit={onSubmit} noValidate>
        <label className={styles.label}>
          Email
          <input
            className={styles.input}
            type="email"
            name="email"
            placeholder="Insira seu email:"
            value={values.email}
            onChange={handleChange}
            onKeyDown={handleCaps}
            onKeyUp={handleCaps}
            onBlur={() => setCapsEmail(false)}
            disabled={loading}
            required
          />
        </label>

        <label className={styles.label}>
          Senha
          <input
            className={styles.input}
            type="password"
            name="password"
            placeholder="Digite sua senha:"
            value={values.password}
            onChange={handleChange}
            onKeyDown={handleCaps}
            onKeyUp={handleCaps}
            onBlur={() => setCapsPassword(false)}
            disabled={loading}
            required
          />
          {capsPassword && <span className={styles.capsWarning}>⚠️ Caps Lock ativado</span>}
        </label>
        <div className={styles.forgotRow}>
          <button
            type="button"
            className={styles.forgotLink}
            onClick={() => navigate('/recuperar-senha')}
            disabled={loading}
          >
            Esqueceu a senha?
          </button>
        </div>

        <button type="submit" className={styles.submit} disabled={loading}>
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </>
  );
}

export default LoginForm;




