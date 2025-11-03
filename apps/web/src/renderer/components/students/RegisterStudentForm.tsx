import React, { useState } from 'react';
import { ResponsibleForm, ResponsibleData } from './ResponsibleForm';
import { StudentForm, StudentData } from './StudentForm';
import styles from './register-student.module.css';

const initialResponsible: ResponsibleData = {
  name: '',
  relationship: '',
  phone: '',
  email: '',
  street: '',
  number: '',
  neighborhood: '',
  complement: '',
};
const initialStudent: StudentData = {
  name: '',
  birth: '',
  grade: '',
  school: '',
  schoolType: 'publica',
  street: '',
  number: '',
  neighborhood: '',
  complement: '',
};

export function RegisterStudentForm() {
  const [responsible, setResponsible] = useState<ResponsibleData>(initialResponsible);
  const [student, setStudent] = useState<StudentData>(initialStudent);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Aqui você pode enviar { responsible, student } para a API
    // Exemplo: studentService.register({ responsible, student })
    console.log('Dados enviados:', { responsible, student });
  }

  function handleCancel() {
    setResponsible(initialResponsible);
    setStudent(initialStudent);
  }

  return (
    <div className={styles.container}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.columns}>
          <ResponsibleForm value={responsible} onChange={setResponsible} />
          <StudentForm value={student} onChange={setStudent} />
        </div>
        <div className={styles.actions}>
          <button type="button" className={styles.cancelBtn} onClick={handleCancel}>
            Cancelar
          </button>
          <button type="submit" className={styles.saveBtn}>
            Salvar
          </button>
        </div>
      </form>
    </div>
  );
}

