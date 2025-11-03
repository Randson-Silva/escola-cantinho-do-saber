import { DashboardLayout } from '../components/dashboard/Layout/DashboardLayout';

export function UsersPage() {
  return (
    <DashboardLayout>
      <h2 style={{ marginBottom: '2rem', color: '#1976d2' }}>Gestão de Usuários</h2>
      <p>Conteúdo de usuários aqui (listar, editar, excluir, etc).</p>
    </DashboardLayout>
  );
}

