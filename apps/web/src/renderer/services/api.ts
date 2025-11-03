import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

// Anexa token se existir
api.interceptors.request.use((config) => {
   const token = localStorage.getItem('auth_token');
  config.headers = config.headers ?? {};
  const h: any = config.headers;

  const alreadyHasAuth =
    (typeof h.get === 'function' && !!h.get('Authorization')) ||
    !!h.Authorization;

  if (token && !alreadyHasAuth) {
    if (typeof h.set === 'function') h.set('Authorization', `Bearer ${token}`);
    else h.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Normaliza mensagens de erro
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err.response?.data?.message || err.message || 'Erro na requisição';
    return Promise.reject(new Error(message));
  },
);
