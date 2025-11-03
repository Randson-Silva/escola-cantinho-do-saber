import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './header.module.css';

export function Header() {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [userName, setUserName] = useState('Usuário');
  const navigate = useNavigate();

  useEffect(() => {
    // Você pode buscar o nome do usuário do localStorage ou de uma API
    const storedName = localStorage.getItem('userName');
    if (storedName) {
      setUserName(storedName);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    navigate('/login');
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = () => {
      if (showUserMenu) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showUserMenu]);

  return (
    <header className={styles.header}>
      <div className={styles.content}>
        <div className={styles.titleContainer}>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.subtitle}>Bem-vindo ao Cantinho do Saber</p>
        </div>

        <div className={styles.userSection}>
          <button
            className={styles.userButton}
            onClick={(e) => {
              e.stopPropagation();
              toggleUserMenu();
            }}
          >
            <div className={styles.avatar}>{userName.charAt(0).toUpperCase()}</div>
            <span className={styles.userName}>{userName}</span>
            <span className={styles.chevron}>▼</span>
          </button>

          {showUserMenu && (
            <div className={styles.userMenu}>
              <button className={styles.menuItem} onClick={() => navigate('/dashboard/settings')}>
                <span>⚙️</span>
                <span>Configurações</span>
              </button>
              <button className={styles.menuItem} onClick={() => navigate('/dashboard/profile')}>
                <span>👤</span>
                <span>Meu Perfil</span>
              </button>
              <div className={styles.menuDivider}></div>
              <button className={`${styles.menuItem} ${styles.logoutItem}`} onClick={handleLogout}>
                <span>🚪</span>
                <span>Sair</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

