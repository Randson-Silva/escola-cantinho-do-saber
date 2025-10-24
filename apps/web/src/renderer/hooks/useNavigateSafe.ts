import { useNavigate, NavigateOptions } from 'react-router-dom';
import { useCallback } from 'react';

export function useNavigateSafe() {
  const navigate = useNavigate();

  const navigateSafe = useCallback(
    (to: string, options?: NavigateOptions) => {
      try {
        navigate(to, options);
      } catch (err) {
        console.error('Erro ao navegar:', err);
      }
    },
    [navigate],
  );

  return navigateSafe;
}

