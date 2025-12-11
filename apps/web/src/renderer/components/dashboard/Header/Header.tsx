import { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './header.module.css';

function computeTitle(pathname: string) {
  const p = pathname.toLowerCase();
  if (p === '/dashboard' || p.startsWith('/dashboard$')) return 'Dashboard';
  if (p.startsWith('/dashboard/users')) return 'Usuários';
  if (p.startsWith('/dashboard/students')) return 'Alunos';
  if (p.startsWith('/dashboard/classes')) return 'Turmas';
  if (p.startsWith('/dashboard/attendance')) return 'Frequência';
  if (p.startsWith('/dashboard/finances')) return 'Finanças';
  if (p.startsWith('/dashboard/settings')) return 'Configurações';
  return 'Dashboard';
}

function computeSubtitle(pathname: string) {
  const p = pathname.toLowerCase();
  if (p === '/dashboard' || p.startsWith('/dashboard$')) return 'Resumo geral e atalhos do sistema';
  if (p.startsWith('/dashboard/users')) return 'Gerencie usuários, permissões e acessos';
  if (p.startsWith('/dashboard/students')) return 'Cadastre, edite e acompanhe os alunos';
  if (p.startsWith('/dashboard/classes')) return 'Organize turmas, horários e matrículas';
  if (p.startsWith('/dashboard/attendance')) return 'Registre e acompanhe a frequência dos alunos';
  if (p.startsWith('/dashboard/finances')) return 'Controle receitas, despesas e fluxo de caixa';
  if (p.startsWith('/dashboard/settings')) return 'Ajuste preferências e configurações do sistema';
  return 'Navegue pelos módulos do sistema';
}

export function Header() {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [userName, setUserName] = useState('Usuário');
  const location = useLocation();
  const navigate = useNavigate();
  const title = useMemo(() => computeTitle(location.pathname), [location.pathname]);
  const subtitle = useMemo(() => computeSubtitle(location.pathname), [location.pathname]);

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
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.subtitle}>{subtitle}</p>
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
