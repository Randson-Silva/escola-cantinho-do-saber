import React from 'react';
import styles from './student-form.module.css';

export interface StudentData {
  name: string;
  birth: string;
  grade: string;
  school: string;
  schoolType: string;
  street: string;
  number: string;
  neighborhood: string;
  complement: string;
}

interface StudentFormProps {
  value: StudentData;
  onChange: (data: StudentData) => void;
}

export function StudentForm({ value, onChange }: StudentFormProps) {
  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value: val } = e.target;
    onChange({ ...value, [name]: val });
  }

  return (
    <div className={styles.container}>
      <h3 className={styles.sectionTitle}>Dados do Aluno</h3>
      <label className={styles.full}>
        Nome
        <input type="text" name="name" value={value.name} onChange={handleChange} required />
      </label>
      <label>
        Data de Nascimento
        <input type="date" name="birth" value={value.birth} onChange={handleChange} required />
      </label>
      <label>
        Série
        <input type="text" name="grade" value={value.grade} onChange={handleChange} required />
      </label>
      <label>
        Escola
        <input type="text" name="school" value={value.school} onChange={handleChange} required />
      </label>
      <label className={`${styles.schoolTypeLabel} ${styles.full}`}>
        <span>Tipo de Escola:</span>
        <select name="schoolType" value={value.schoolType} onChange={handleChange} required>
          <option value="publica">Pública</option>
          <option value="privada">Privada</option>
        </select>
      </label>
      <h4 className={styles.sectionSubtitle}>Endereço do Aluno</h4>
      <label>
        Rua
        <input type="text" name="street" value={value.street} onChange={handleChange} required />
      </label>
      <label>
        Número
        <input type="text" name="number" value={value.number} onChange={handleChange} required />
      </label>
      <label>
        Bairro
        <input
          type="text"
          name="neighborhood"
          value={value.neighborhood}
          onChange={handleChange}
          required
        />
      </label>
      <label>
        Complemento
        <input type="text" name="complement" value={value.complement} onChange={handleChange} />
      </label>
    </div>
  );
}

