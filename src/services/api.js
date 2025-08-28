// services/api.js
import axios from 'axios';


const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/', // or your base URL
  headers: {
    'Content-Type': 'application/json'
  }
});

// ✅ Enable token header
api.interceptors.request.use((config) => {
  const publicEndpoints = ['api/v1/auth/login'];
  const isPublic = publicEndpoints.some(endpoint => config.url.includes(endpoint));

  if (!isPublic) {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
  }

  return config;
});


export const login = (credentials) => api.post('api/v1/auth/login', credentials);
export const logout = () => api.post('api/v1/auth/logout');



export default api;
