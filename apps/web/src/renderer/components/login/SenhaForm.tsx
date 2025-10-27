import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useToast } from '../../hooks';
import { requestPasswordReset } from '../../services/auth';
import styles from '../../styles/login-page.module.css';
import formStyles from './LoginForm.module.css';

function SenhaForm() {
  const navigate = useNavigate();
  const { values, handleChange } = useForm({ email: '' });
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { authToken } = await requestPasswordReset(values.email);
      // guarda o token do passo para a próxima chamada (verify-code)
      localStorage.setItem('auth_token', authToken);
      console.log('🔑 Token salvo:', authToken.substring(0, 20) + '...');
      addToast('Email de recuperação enviado com sucesso!', 'success');
      // Redireciona para a tela de código
      navigate('/senha-numero', { state: { email: values.email } });
    } catch (err: any) {
      addToast(err?.message ?? 'Não foi possível enviar o email de recuperação.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <header className={styles.header}>
        <h1 className={styles.title}>Recuperar Senha</h1>
        <p className={styles.description}>
          Insira o endereço de email que pertence à sua conta para receber um código. Se não sabe
          qual é o email, solicite a um administrador.
        </p>
      </header>

      <form onSubmit={handleSubmit} noValidate>
        <label className={formStyles.label}>
          Email
          <input
            className={formStyles.input}
            type="email"
            name="email"
            placeholder="Insira seu email:"
            value={values.email}
            onChange={handleChange}
            disabled={loading}
            required
          />
        </label>

        <button type="submit" className={formStyles.submit} disabled={loading}>
          {loading ? 'Enviando...' : 'Enviar Email'}
        </button>

        <div className={formStyles.forgotRow}>
          <button
            type="button"
            className={formStyles.forgotLink}
            onClick={() => navigate('/login')}
            disabled={loading}
          >
            ← Possui cadastro?
          </button>
        </div>
      </form>
    </>
  );
}

export default SenhaForm;
