import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../../styles/login-page.module.css'; // ← mudou aqui
import formStyles from './LoginForm.module.css'; // ← mantém para estilos de formulário

function SenhaForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);

      console.log('Recuperar senha para:', email);

      // Simula envio de email
      setTimeout(() => {
        setLoading(false);
        alert('Email de recuperação enviado!');
      }, 2000);
    },
    [email],
  );

  const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  }, []);

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
            value={email}
            onChange={onChange}
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
