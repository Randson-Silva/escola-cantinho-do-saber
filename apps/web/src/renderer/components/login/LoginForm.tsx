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

      // Log 1: Verificar resposta completa da API
      console.log('[LoginForm] Resposta completa da API:', response);
      console.log('[LoginForm] response.user:', response.user);
      console.log('[LoginForm] response.token:', response.token);

      // Log 2: Verificar se user tem role
      if (response.user) {
        console.log('[LoginForm] ✅ Login bem-sucedido!');
        console.log('[LoginForm] Nome do usuário:', response.user.name);
        console.log('[LoginForm] Email:', response.user.email);
        console.log('[LoginForm] Nível de acesso:', response.user.role || 'ROLE NÃO DEFINIDO');
      } else {
        console.warn('[LoginForm] ⚠️ response.user está undefined!');
      }

      login(response.user, response.token);
      addToast('✅ Login realizado com sucesso!', 'success');
      // navigate('/dashboard'); // ajuste conforme sua rota
    } catch (err: any) {
      const errorMessage = err?.message?.toLowerCase() || '';

      // Mensagens específicas baseadas no erro
      if (
        errorMessage.includes('email') ||
        errorMessage.includes('user') ||
        errorMessage.includes('usuário')
      ) {
        addToast('⚠️ Email não encontrado. Verifique se está correto.', 'error');
      } else if (
        errorMessage.includes('senha') ||
        errorMessage.includes('password') ||
        errorMessage.includes('credenciais')
      ) {
        addToast('⚠️ Senha incorreta. Tente novamente.', 'error');
      } else if (errorMessage.includes('não encontrado') || errorMessage.includes('not found')) {
        addToast('⚠️ Usuário não encontrado no sistema.', 'error');
      } else {
        addToast(err?.message ?? '❌ Erro ao fazer login', 'error');
      }
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
