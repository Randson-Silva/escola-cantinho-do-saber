import React from 'react';
import { maskPhone } from '../../utils/masks';
import styles from './responsible-form.module.css';

export interface ResponsibleData {
  name: string;
  relationship: string;
  phone: string;
  email: string;
  street: string;
  number: string;
  neighborhood: string;
  complement: string;
}

interface ResponsibleFormProps {
  value: ResponsibleData;
  onChange: (data: ResponsibleData) => void;
}

export function ResponsibleForm({ value, onChange }: ResponsibleFormProps) {
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value: val } = e.target;
    onChange({ ...value, [name]: val });
  }

  return (
    <div className={styles.container}>
      <h3 className={styles.sectionTitle}>Dados do Responsável</h3>
      <label className={styles.full}>
        Nome Completo
        <input type="text" name="name" value={value.name} onChange={handleChange} required />
      </label>
      <label>
        Parentesco
        <input
          type="text"
          name="relationship"
          value={value.relationship}
          onChange={handleChange}
          required
        />
      </label>
      <label>
        Telefone
        <input
          type="tel"
          name="phone"
          value={value.phone}
          onChange={(e) => onChange({ ...value, phone: maskPhone(e.target.value) })}
          placeholder="(00) 00000-0000"
          required
        />
      </label>
      <label>
        Email
        <input type="email" name="email" value={value.email} onChange={handleChange} required />
      </label>
      <h4 className={styles.sectionSubtitle}>Endereço do Responsável</h4>
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
