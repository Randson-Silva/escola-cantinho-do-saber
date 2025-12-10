import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './teachers.module.css';
import { teacherService, type Teacher } from '../../services/teacherService';

export function TeacherList() {
  const navigate = useNavigate();
  const [items, setItems] = useState<Teacher[]>([]);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'TODOS' | 'ATIVO' | 'INATIVO'>('TODOS');

  useEffect(() => {
    teacherService.getAll().then(setItems);
  }, []);

  const filtered = useMemo(() => {
    return items.filter((t) => {
      const okName = t.nome.toLowerCase().includes(query.toLowerCase());
      const okStatus = status === 'TODOS' ? true : t.status === status;
      return okName && okStatus;
    });
  }, [items, query, status]);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Professores</h1>
            <p className={styles.subtitle}>Gerencie professores e competências</p>
          </div>
          <button
            className={styles.saveBtn}
            onClick={() => navigate('/dashboard/teachers/register')}
          >
            Novo Professor
          </button>
        </div>

        <div className={styles.filterBar}>
          <input
            className={styles.input}
            placeholder="Buscar por nome"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <select
            className={styles.input}
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
          >
            <option value="TODOS">Todos</option>
            <option value="ATIVO">Ativos</option>
            <option value="INATIVO">Inativos</option>
          </select>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Telefone</th>
                <th>Competências</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id}>
                  <td>{t.nome}</td>
                  <td>{t.telefone}</td>
                  <td>
                    {t.competencias.map((c) => (
                      <span key={c} className={styles.statusBadge} style={{ marginRight: 6 }}>
                        {c}
                      </span>
                    ))}
                  </td>
                  <td>
                    <span
                      className={`${styles.statusBadge} ${t.status === 'ATIVO' ? styles.ativo : styles.inativo}`}
                    >
                      {t.status}
                    </span>
                  </td>
                  <td>
                    <Link to={`/dashboard/teachers/${t.id}/edit`}>Editar</Link>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: 16 }}>
                    Nenhum professor encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

