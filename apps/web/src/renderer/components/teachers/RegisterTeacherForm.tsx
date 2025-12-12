import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useToast } from '../../hooks/useToast';
import { useForm } from '../../hooks/useForm';
import { maskCPF, maskPhone } from '../../utils/masks';
import styles from './teachers.module.css';
import {
  teacherService,
  COMPETENCIAS_PERMITIDAS,
  type Teacher,
} from '../../services/teacherService';

const teacherSchema = z.object({
  nome: z.string().min(3, 'Nome muito curto'),
  cpf: z.string().min(11, 'CPF inválido'),
  email: z.string().email('E-mail inválido'),
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
  dataInicio: z.string().refine((v) => !Number.isNaN(Date.parse(v)), 'Data inválida'),
  status: z.enum(['ATIVO', 'INATIVO']).default('ATIVO'),
});

type TeacherFormData = z.infer<typeof teacherSchema>;

const initialForm: TeacherFormData = {
  nome: '',
  cpf: '',
  email: '',
  telefone: '',
  competencias: [],
  chavePix: '',
  dataInicio: '',
  status: 'ATIVO',
};

export function RegisterTeacherForm() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { values, handleChange, setFieldValue, reset } = useForm<TeacherFormData>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const diaPagamento = (() => {
    if (!values.dataInicio) return null;
    const d = new Date(values.dataInicio);
    return Number.isNaN(d.getTime()) ? null : d.getDate();
  })();

  function toggleCompetencia(value: string) {
    setFieldValue(
      'competencias',
      values.competencias.includes(value)
        ? values.competencias.filter((c) => c !== value)
        : [...values.competencias, value],
    );
  }

  function validate() {
    const parsed = teacherSchema.safeParse(values);
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

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      const payload: Omit<Teacher, 'id'> = {
        ...values,
        // status automático ATIVO no cadastro
        status: 'ATIVO',
      };
      const result = await teacherService.create(payload);

      // Mostra a senha gerada pelo backend
      if (result.generatedPassword) {
        addToast(`Professor cadastrado! Senha de acesso: ${result.generatedPassword}`, 'success');
      } else {
        addToast('Professor cadastrado com sucesso!', 'success');
      }

      reset();
      navigate('/dashboard/teachers');
    } catch (err: any) {
      addToast(err?.message || 'Erro ao cadastrar professor', 'error');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>Cadastrar Professor</h1>
          <p className={styles.subtitle}>Preencha os dados do professor</p>
        </div>
        <form onSubmit={onSubmit}>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="nome">
                Nome Completo *
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
              <label className={styles.label} htmlFor="cpf">
                CPF *
              </label>
              <input
                id="cpf"
                name="cpf"
                value={values.cpf}
                onChange={(e) => setFieldValue('cpf', maskCPF(e.target.value))}
                className={styles.input}
                placeholder="000.000.000-00"
                required
              />
              {errors.cpf && <div className={styles.errorMsg}>{errors.cpf}</div>}
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
              <label className={styles.label} htmlFor="email">
                E-mail *{' '}
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 400 }}>
                  (será usado para login)
                </span>
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={values.email}
                onChange={handleChange}
                className={styles.input}
                placeholder="professor@email.com"
                required
              />
              {errors.email && <div className={styles.errorMsg}>{errors.email}</div>}
              <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                🔐 Um usuário será criado automaticamente. A senha será exibida após o cadastro.
              </p>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="chavePix">
                Chave de Pagamento (PIX) *
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
              <label className={styles.label} htmlFor="dataInicio">
                Data de Início *
              </label>
              <input
                id="dataInicio"
                type="date"
                name="dataInicio"
                value={values.dataInicio}
                onChange={handleChange}
                className={styles.input}
                required
              />
              {diaPagamento && (
                <div className={styles.alertPagamento}>
                  Pagamento todo dia {diaPagamento} do mês
                </div>
              )}
              {errors.dataInicio && <div className={styles.errorMsg}>{errors.dataInicio}</div>}
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Competências (Séries) *</label>
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
              {isSubmitting ? 'Cadastrando...' : 'Cadastrar Professor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
