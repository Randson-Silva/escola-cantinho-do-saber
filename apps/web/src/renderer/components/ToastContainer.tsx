import React from 'react';
import { useToast } from '../hooks';
import styles from './login/LoginForm.module.css';

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className={styles.toastContainer}>
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`${styles.toast} ${toast.type ? styles[`toast${toast.type.charAt(0).toUpperCase() + toast.type.slice(1)}`] : ''}`}
          onClick={() => removeToast(toast.id)}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}

