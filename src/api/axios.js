import axios from 'axios';
import { getToken, removeToken } from '../utils/tokenManager';

const api = axios.create({
  baseURL: 'https://api.zumar.co.id',
});

api.interceptors.request.use((config) => {
  const token = getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      removeToken();
      localStorage.removeItem('userPermissions');
      window.location.href = '/sign-in';
    }

    return Promise.reject(error);
  }
);

export default api;
