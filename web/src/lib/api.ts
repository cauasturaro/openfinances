import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3333', 
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { data } = await api.post('/users/refresh-token');

        if (data.token) {
          localStorage.setItem('token', data.token);
          
          originalRequest.headers.Authorization = `Bearer ${data.token}`;
          api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
          
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error("Sessão expirada.");
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);