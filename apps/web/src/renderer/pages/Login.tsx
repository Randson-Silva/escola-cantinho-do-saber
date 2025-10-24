import React from 'react';
import LoginForm from '../components/login/LoginForm';
import styles from '../styles/login-page.module.css';
import logoCantinho from '../assets/logoCantinho.png'; // nova importação

export default function LoginPage() {
  return (
    <main className={styles.page}>
      <img src={logoCantinho} alt="Logo Cantinho do Saber" className={styles.img} />
      <div className={styles.card}>
        <header className={styles.header}>
          <h1 className={styles.title}>Bem-vindo!</h1>
          <p className={styles.description}>Digite suas credenciais para acessar o sistema</p>
        </header>
        <LoginForm />
      </div>
    </main>
  );
}


