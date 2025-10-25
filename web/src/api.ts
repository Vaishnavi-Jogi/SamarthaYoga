import axios from 'axios';

const baseURL = (import.meta as any).env?.VITE_API_BASE_URL || '/api';

export const api = axios.create({ baseURL });

export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('token', token);
  } else {
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem('token');
  }
}

// initialize from storage
const saved = localStorage.getItem('token');
if (saved) setAuthToken(saved);
