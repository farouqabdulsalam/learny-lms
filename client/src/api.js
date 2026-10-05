import axios from 'axios';

export const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api'
});

API.interceptors.request.use(config => {
  const token = localStorage.getItem('learny_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const auth = {
  login: data => API.post('/auth/login', data),
  register: data => API.post('/auth/register', data),
  me: () => API.get('/auth/me'),
  switchRole: role => API.post('/auth/switch-role', { role }),
  becomeInstructor: () => API.post('/auth/become-instructor')
};
