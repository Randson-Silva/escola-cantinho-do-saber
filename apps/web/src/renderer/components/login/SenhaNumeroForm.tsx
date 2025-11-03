import React, { useRef, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useToast } from '../../hooks';
import { verifyRecoveryCode } from '../../services/auth';
import styles from '../../styles/login-page.module.css';
import formStyles from './LoginForm.module.css';

const CODE_LENGTH = 6;

function SenhaNumeroForm() {
  const location = useLocation() as { state?: { email?: string } };
  const navigate = useNavigate();
  const email = location.state?.email;
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [values, setValues] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  if (!email) {
    // Sem email no state, volta para a tela de solicitar código
    return <Navigate to="/recuperar-senha" replace />;
  }

  const focusAt = (index: number) => {
    const el = inputsRef.current[index];
    if (el) el.focus();
  };

  const handleChange = (index: number, v: string) => {
    // aceita apenas 0-9 (ou letras se quiser alfanumérico)
    const char = v.replace(/\D/g, '').slice(0, 1);
    const next = [...values];
    next[index] = char;
    setValues(next);
    if (char && index < CODE_LENGTH - 1) focusAt(index + 1);
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const next = [...values];
      if (next[index]) {
        next[index] = '';
        setValues(next);
        return;
      }
      if (index > 0) {
        focusAt(index - 1);
        const prev = [...values];
        prev[index - 1] = '';
        setValues(prev);
      }
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      focusAt(index - 1);
    }
    if (e.key === 'ArrowRight' && index < CODE_LENGTH - 1) {
      e.preventDefault();
      focusAt(index + 1);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, CODE_LENGTH);
    if (!text) return;
    e.preventDefault();
    const next = Array(CODE_LENGTH)
      .fill('')
      .map((_, i) => text[i] ?? '');
    setValues(next);
    // foca no último preenchido
    const last = Math.min(text.length, CODE_LENGTH) - 1;
    if (last >= 0) focusAt(last);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = values.join('');
    if (code.length < CODE_LENGTH) {
      addToast('Digite o código completo (6 dígitos).', 'error');
      return;
    }

    const recoveryToken = localStorage.getItem('auth_token');
    console.log(recoveryToken);
    if (!recoveryToken) {
      console.error('❌ Token não encontrado no localStorage');
      addToast('Erro de autenticação. Por favor, solicite um novo código.', 'error');
      navigate('/recuperar-senha');
      return;
    }

    setLoading(true);
    try {
      const { authToken } = await verifyRecoveryCode(code, recoveryToken);

      // Se o código está correto, salvamos o novo token
      localStorage.setItem('auth_token', authToken);
      console.log('✅ Código verificado com sucesso');
      addToast('Código verificado com sucesso!', 'success');
      // Próxima etapa: redefinir senha
      navigate('/nova-senha', { state: { email } });
    } catch (err: any) {
      console.error('❌ Erro ao verificar código:', {
        message: err?.message,
        code,
        email,
      });

      if (err?.message?.toLowerCase().includes('expirado')) {
        addToast('O código expirou. Por favor, solicite um novo código.', 'error');
        navigate('/recuperar-senha');
      } else if (err?.message?.toLowerCase().includes('inválido')) {
        addToast('Código incorreto. Verifique e tente novamente.', 'error');
      } else {
        addToast('Erro ao verificar o código. Tente novamente.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <header className={styles.header}>
        <h1 className={styles.title}>Inserir Código</h1>
        <p className={styles.description}>
          Insira o endereço de email que pertence à sua conta para receber um código. Se não sabe
          qual é o email, solicite a um administrador.
        </p>
      </header>

      <form onSubmit={handleSubmit} noValidate>
        <div className={formStyles.otpContainer}>
          {values.map((val, i) => (
            <input
              key={i}
              ref={(el) => (inputsRef.current[i] = el)}
              className={formStyles.otpInput}
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={val}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onPaste={i === 0 ? handlePaste : undefined}
              aria-label={`Dígito ${i + 1}`}
            />
          ))}
        </div>

        <button type="submit" className={formStyles.submit} disabled={loading}>
          {loading ? 'Verificando...' : 'Confirmar'}
        </button>
      </form>
    </>
  );
}

export default SenhaNumeroForm;
