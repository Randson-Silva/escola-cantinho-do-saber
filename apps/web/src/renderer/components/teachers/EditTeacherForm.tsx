import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { useToast } from '../../hooks/useToast';
import { useForm } from '../../hooks/useForm';
import { maskPhone } from '../../utils/masks';
import styles from './teachers.module.css';
import {
  teacherService,
  COMPETENCIAS_PERMITIDAS,
  type Teacher,
} from '../../services/teacherService';

const editTeacherSchema = z.object({
  nome: z.string().min(3, 'Nome muito curto'),
  telefone: z.string().min(10, 'Telefone inválido'),
  competencias: z
    .array(
      z.enum([
        '1º Ano',
        '2º Ano',
        '3º Ano',
        '4º Ano',
        '5º Ano',
        '6º Ano',
        '7º Ano',
        '8º Ano',
        '9º Ano',
      ]),
    )
    .min(1, 'Selecione ao menos uma competência'),
  chavePix: z.string().min(5, 'Chave PIX inválida'),
  status: z.enum(['ATIVO', 'INATIVO']),
});

type EditTeacherFormData = z.infer<typeof editTeacherSchema>;

const initialForm: EditTeacherFormData = {
  nome: '',
  telefone: '',
  competencias: [],
  chavePix: '',
  status: 'ATIVO',
};

export function EditTeacherForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { values, handleChange, setFieldValue } = useForm<EditTeacherFormData>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [teacher, setTeacher] = useState<Teacher | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const all = await teacherService.getAll();
        const found = all.find((t) => t.id === id) || null;
        setTeacher(found);
        if (found) {
          setFieldValue('nome', found.nome);
          setFieldValue('telefone', found.telefone);
          setFieldValue('competencias', found.competencias);
          setFieldValue('chavePix', found.chavePix);
          setFieldValue('status', found.status);
        }
      } catch (err: any) {
        addToast('Erro ao carregar professor', 'error');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  function toggleCompetencia(value: string) {
    setFieldValue(
      'competencias',
      values.competencias.includes(value)
        ? values.competencias.filter((c) => c !== value)
        : [...values.competencias, value],
    );
  }

  function validate() {
    const parsed = editTeacherSchema.safeParse(values);
    if (parsed.success) {
      setErrors({});
      return true;
    }
    const map: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      map[issue.path.join('.')] = issue.message;
    }
    setErrors(map);
    return false;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!id) return;
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      const payload: Partial<Teacher> = {
        nome: values.nome,
        telefone: values.telefone,
        competencias: values.competencias,
        chavePix: values.chavePix,
        status: values.status,
      };
      await teacherService.update(id, payload);
      addToast('Professor atualizado com sucesso!', 'success');
      navigate('/dashboard/teachers');
    } catch (err: any) {
      addToast(err?.message || 'Erro ao atualizar professor', 'error');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading)
    return (
      <div className={styles.container}>
        <div className={styles.card}>Carregando...</div>
      </div>
    );
  if (!teacher)
    return (
      <div className={styles.container}>
        <div className={styles.card}>Professor não encontrado.</div>
      </div>
    );

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>Editar Professor</h1>
          <p className={styles.subtitle}>Atualize os dados necessários</p>
        </div>
        <form onSubmit={onSubmit}>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="nome">
                Nome *
              </label>
              <input
                id="nome"
                name="nome"
                value={values.nome}
                onChange={handleChange}
                className={styles.input}
                required
              />
              {errors.nome && <div className={styles.errorMsg}>{errors.nome}</div>}
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="telefone">
                Telefone *
              </label>
              <input
                id="telefone"
                name="telefone"
                value={values.telefone}
                onChange={(e) => setFieldValue('telefone', maskPhone(e.target.value))}
                className={styles.input}
                placeholder="(00) 00000-0000"
                required
              />
              {errors.telefone && <div className={styles.errorMsg}>{errors.telefone}</div>}
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Competências *</label>
              <div className={styles.checkboxGrid}>
                {COMPETENCIAS_PERMITIDAS.map((c) => (
                  <label key={c} className={styles.checkboxItem}>
                    <input
                      type="checkbox"
                      checked={values.competencias.includes(c)}
                      onChange={() => toggleCompetencia(c)}
                    />
                    {c}
                  </label>
                ))}
              </div>
              {errors.competencias && <div className={styles.errorMsg}>{errors.competencias}</div>}
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="chavePix">
                Chave PIX *
              </label>
              <input
                id="chavePix"
                name="chavePix"
                value={values.chavePix}
                onChange={handleChange}
                className={styles.input}
                required
              />
              {errors.chavePix && <div className={styles.errorMsg}>{errors.chavePix}</div>}
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="status">
                Status *
              </label>
              <select
                id="status"
                name="status"
                value={values.status}
                onChange={handleChange}
                className={styles.input}
              >
                <option value="ATIVO">ATIVO</option>
                <option value="INATIVO">INATIVO</option>
              </select>
              {errors.status && <div className={styles.errorMsg}>{errors.status}</div>}
            </div>
          </div>
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={() => navigate('/dashboard/teachers')}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button type="submit" className={styles.saveBtn} disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
