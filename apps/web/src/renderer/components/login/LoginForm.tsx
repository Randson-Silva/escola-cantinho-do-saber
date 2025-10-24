import React, { useState, useCallback } from 'react';
import styles from './LoginForm.module.css';
import { Navigate, useNavigate } from 'react-router-dom';

type FormState = { email: string; password: string };
type Toast = { id: number; message: string };

function LoginForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>({ email: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [capsEmail, setCapsEmail] = useState(false);
  const [capsPassword, setCapsPassword] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  }

  function handleCaps(e: React.KeyboardEvent<HTMLInputElement>) {
    const on = e.getModifierState?.('CapsLock') ?? false;
    if (e.currentTarget.name === 'email') setCapsEmail(on);
    if (e.currentTarget.name === 'password') setCapsPassword(on);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Validações com toasts flutuantes
    if (!form.email.trim()) {
      showToast('⚠️ Preencha o email');
      return;
    }
    if (!form.email.includes('@')) {
      showToast('⚠️ Email inválido');
      return;
    }
    if (!form.password.trim()) {
      showToast('⚠️ Preencha a senha');
      return;
    }

    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 800));
      console.log('Login:', form);
      showToast('✅ Login realizado com sucesso!');
    } catch (err: any) {
      showToast('❌ Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Container de toasts flutuantes */}
      <div className={styles.toastContainer}>
        {toasts.map((toast) => (
          <div key={toast.id} className={styles.toast}>
            {toast.message}
          </div>
        ))}
      </div>

      <form onSubmit={onSubmit} noValidate>
        <label className={styles.label}>
          Email
          <input
            className={styles.input}
            type="email"
            name="email"
            placeholder="Insira seu email:"
            value={form.email}
            onChange={onChange}
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
            value={form.password}
            onChange={onChange}
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




