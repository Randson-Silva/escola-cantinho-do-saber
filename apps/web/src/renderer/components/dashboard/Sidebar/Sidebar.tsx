import { useNavigate, useLocation } from 'react-router-dom';
import styles from './sidebar.module.css';
import logoImg from '../../../assets/LogoCantinho.png';
import { useAuth } from '../../../hooks/useAuth';

interface SidebarItemProps {
  icon: string;
  label: string;
  path: string;
  active?: boolean;
  onClick?: () => void;
}

function SidebarItem({ icon, label, path, active = false, onClick }: SidebarItemProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(path);
    }
  };

  return (
    <button className={`${styles.item} ${active ? styles.itemActive : ''}`} onClick={handleClick}>
      <span className={styles.icon}>{icon}</span>
      <span className={styles.label}>{label}</span>
    </button>
  );
}

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Verifica o nível de acesso do usuário
  const isAdmin = user?.role === 'ADMIN';
  const isProfessor = user?.role === 'PROFESSOR';

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userId');
    navigate('/login');
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logoContainer}>
        <img src={logoImg} alt="Cantinho do Saber" className={styles.logo} />
        <h2 className={styles.logoText}>Cantinho do Saber</h2>
      </div>

      <nav className={styles.nav}>
        {/* Dashboard - visível para todos */}
        <SidebarItem
          icon="📊"
          label="Dashboard"
          path="/dashboard"
          active={location.pathname === '/dashboard'}
        />

        {/* Usuários - apenas Admin */}
        {isAdmin && (
          <SidebarItem
            icon="👥"
            label="Usuários"
            path="/dashboard/users"
            active={location.pathname === '/dashboard/users'}
          />
        )}

        {/* Alunos - Admin e Recepcionista (professor NÃO pode matricular) */}
        {!isProfessor && (
          <SidebarItem
            icon="👨‍🎓"
            label="Alunos"
            path="/dashboard/students"
            active={location.pathname === '/dashboard/students'}
          />
        )}

        {/* Professores - Admin e Recepcionista */}
        {!isProfessor && (
          <SidebarItem
            icon="👨‍🏫"
            label="Professores"
            path="/dashboard/teachers"
            active={location.pathname === '/dashboard/teachers'}
          />
        )}

        {/* Turmas - Admin e Recepcionista */}
        {!isProfessor && (
          <SidebarItem
            icon="📚"
            label="Turmas"
            path="/dashboard/classes"
            active={location.pathname === '/dashboard/classes'}
          />
        )}

        {/* Finanças - apenas Admin */}
        {isAdmin && (
          <SidebarItem
            icon="💵"
            label="Finanças"
            path="/dashboard/finances"
            active={location.pathname === '/dashboard/finances'}
          />
        )}

        {/* Configurações - Admin e Recepcionista */}
        {!isProfessor && (
          <SidebarItem
            icon="⚙️"
            label="Configurações"
            path="/dashboard/settings"
            active={location.pathname === '/dashboard/settings'}
          />
        )}
      </nav>

      <div className={styles.footer}>
        <SidebarItem icon="🚪" label="Sair" path="/login" onClick={handleLogout} />
      </div>
    </aside>
  );
}
