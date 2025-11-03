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

    // Validação de email antes de enviar
    if (!values.email.trim()) {
      addToast('⚠️ Preencha o email', 'error');
      return;
    }
    if (!values.email.includes('@')) {
      addToast('⚠️ Email inválido', 'error');
      return;
    }

    setLoading(true);

    try {
      const { authToken } = await requestPasswordReset(values.email);
      localStorage.setItem('auth_token', authToken);
      console.log('✅ Email de recuperação enviado com sucesso');
      console.log(authToken);
      addToast('✅ Email de recuperação enviado com sucesso!', 'success');
      navigate('/senha-numero', { state: { email: values.email } });
    } catch (err: any) {
      const errorMessage = err?.message?.toLowerCase() || '';

      console.error('❌ Erro ao solicitar recuperação de senha:', {
        email: values.email,
        error: err?.message,
        timestamp: new Date().toISOString(),
      });

      // Mensagens específicas baseadas no erro
      if (
        errorMessage.includes('email') ||
        errorMessage.includes('não encontrado') ||
        errorMessage.includes('not found')
      ) {
        addToast('⚠️ Email não encontrado. Verifique se está cadastrado.', 'error');
      } else if (errorMessage.includes('user') || errorMessage.includes('usuário')) {
        addToast('⚠️ Usuário não encontrado no sistema.', 'error');
      } else if (
        errorMessage.includes('muitas tentativas') ||
        errorMessage.includes('rate limit')
      ) {
        addToast('⚠️ Muitas tentativas. Por favor, aguarde alguns minutos.', 'error');
      } else {
        addToast(
          '❌ Não foi possível enviar o email de recuperação. Tente novamente mais tarde.',
          'error',
        );
      }
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
