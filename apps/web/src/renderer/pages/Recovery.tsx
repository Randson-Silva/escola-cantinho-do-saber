import React from 'react';
import SenhaForm from '../components/login/SenhaForm';
import styles from '../styles/login-page.module.css';
import logoCantinho from '../assets/logoCantinho.png';

const RecoveryPage = () => {
  return (
    <div className={styles.page}>
      <img src={logoCantinho} alt="Logo Cantinho do Saber" className={styles.img} />
      <div className={styles.cardRequest}>
        <SenhaForm />
      </div>
    </div>
  );
};

export default RecoveryPage;

