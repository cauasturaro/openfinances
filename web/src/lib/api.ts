import axios from 'axios';

// INSTÂNCIA DO AXIOS
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3333', 
  withCredentials: true,
});

// INTERCEPTADOR DA REQUISIÇÃO
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// INTERCEPTADOR DA RESPOSTA
api.interceptors.response.use(
  (response) => response, // SE NÃO DER ERRO, SÓ RETORNA A RESPOSTA NORMAL
  async (error) => { //ERRO 
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) { //SE O ERRO FOR POR NÃO SER AUTORIZADO
      originalRequest._retry = true;

      try {
        const { data } = await api.post('/users/refresh-token'); // MANDA PRA ROTA DE REFRESH-TOKEN PRA PEGAR UM TOKEN NOVO

        if (data.token) {
          localStorage.setItem('token', data.token);
          
          originalRequest.headers.Authorization = `Bearer ${data.token}`;
          api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
          
          return api(originalRequest); // REFAZ A INSTRUÇÃO INICIAL
        }
      } catch (refreshError) { // SE A SESSÃO EXPIROU:
        console.error("Sessão expirada.");
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);