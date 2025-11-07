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
  const [showPassword, setShowPassword] = useState(false);

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
      setTimeout(() => {
        console.log('[LoginForm] ✅ Executando navigate("/dashboard")');
        navigate('/dashboard');
      }, 200);
    } catch (err: any) {
      const errorMessage = err?.message?.toLowerCase() || '';

      console.error('[LoginForm] ❌ Erro ao fazer login:', {
        message: err?.message,
        status: err?.response?.status,
        data: err?.response?.data,
      });

      // Mensagens específicas baseadas no erro do backend
      if (errorMessage.includes('wrong credentials') || errorMessage.includes('credenciais')) {
        addToast('⚠️ Email ou senha incorretos. Verifique e tente novamente.', 'error');
      } else if (
        errorMessage.includes('user not found') ||
        errorMessage.includes('usuário não encontrado')
      ) {
        addToast('⚠️ Usuário não encontrado. Verifique o email digitado.', 'error');
      } else if (errorMessage.includes('password') || errorMessage.includes('senha')) {
        addToast('⚠️ Senha incorreta. Tente novamente.', 'error');
      } else if (errorMessage.includes('email')) {
        addToast('⚠️ Email não cadastrado no sistema.', 'error');
      } else if (errorMessage.includes('blocked') || errorMessage.includes('bloqueado')) {
        addToast('⚠️ Usuário bloqueado. Entre em contato com o administrador.', 'error');
      } else if (errorMessage.includes('network') || errorMessage.includes('rede')) {
        addToast('❌ Erro de conexão. Verifique sua internet e tente novamente.', 'error');
      } else {
        addToast(err?.message || '❌ Erro ao fazer login. Tente novamente.', 'error');
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
          <div className={styles.passwordContainer}>
            <input
              className={styles.input}
              type={showPassword ? 'text' : 'password'}
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
            <button
              type="button"
              className={styles.togglePassword}
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
            >
              {showPassword ? (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              ) : (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              )}
            </button>
          </div>
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
