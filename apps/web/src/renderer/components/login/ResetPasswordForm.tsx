import React, { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useForm, useToast } from '../../hooks';
import { resetPassword } from '../../services/auth';
import styles from '../../styles/login-page.module.css';
import formStyles from './LoginForm.module.css';

function ResetPasswordForm() {
  const location = useLocation() as { state?: { email?: string } };
  const navigate = useNavigate();
  const email = location.state?.email;
  const { addToast } = useToast();

  const { values, handleChange } = useForm({ password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // email é opcional apenas para exibir; a autorização é feita via token 'pass_reset'

  const minLengthOk = values.password.length >= 8;
  const confirmMinOk = values.confirm.length >= 8;
  const passwordsMatch = values.password === values.confirm;
  const showMatchError = values.confirm.length > 0 && !passwordsMatch; // exibe somente após digitar confirmação
  const canSubmit = !loading && minLengthOk && confirmMinOk && passwordsMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { password, confirm } = values;
    if (!password || password.length < 8) {
      addToast('A nova senha deve ter no mínimo 8 caracteres.', 'error');
      return;
    }
    if (password !== confirm) {
      addToast('As senhas não coincidem.', 'error');
      return;
    }

    setLoading(true);
    try {
      await resetPassword({ password });
      addToast('Senha redefinida com sucesso! Faça login com a nova senha.', 'success');
      // limpa o token de reset após sucesso
      localStorage.removeItem('auth_token');
      navigate('/login');
    } catch (err: any) {
      addToast(err?.message ?? 'Não foi possível redefinir a senha.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <header className={styles.header}>
        <h1 className={styles.title}>Nova Senha</h1>
        <p className={styles.description}>
          Defina sua nova senha para o email <strong>{email}</strong>.
        </p>
      </header>

      <form onSubmit={handleSubmit} noValidate>
        <label className={formStyles.label}>
          Nova senha
          <div className={formStyles.passwordContainer}>
            <input
              className={`${formStyles.input} ${formStyles.inputPassword}`}
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Digite a nova senha"
              value={values.password}
              onChange={handleChange}
              disabled={loading}
              minLength={8}
              required
            />
            <button
              type="button"
              className={formStyles.togglePassword}
              onClick={() => setShowPassword(!showPassword)}
              disabled={loading}
              tabIndex={-1}
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
          {!minLengthOk && values.password.length > 0 && (
            <span className={formStyles.error}>A nova senha deve ter no mínimo 8 caracteres.</span>
          )}
        </label>

        <label className={formStyles.label}>
          Confirmar nova senha
          <div className={formStyles.passwordContainer}>
            <input
              className={`${formStyles.input} ${formStyles.inputPassword}`}
              type={showConfirm ? 'text' : 'password'}
              name="confirm"
              placeholder="Confirme a nova senha"
              value={values.confirm}
              onChange={handleChange}
              disabled={loading}
              minLength={8}
              required
            />
            <button
              type="button"
              className={formStyles.togglePassword}
              onClick={() => setShowConfirm(!showConfirm)}
              disabled={loading}
              tabIndex={-1}
              aria-label={showConfirm ? 'Ocultar senha' : 'Mostrar senha'}
            >
              {showConfirm ? (
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
          {showMatchError && <span className={formStyles.error}>As senhas não coincidem.</span>}
        </label>

        <button type="submit" className={formStyles.submit} disabled={!canSubmit}>
          {loading ? 'Salvando...' : 'Salvar e entrar'}
        </button>
      </form>
    </>
  );
}

export default ResetPasswordForm;
