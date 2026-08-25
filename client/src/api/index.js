import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL
  || (import.meta.env.DEV ? '/api' : 'https://test-backend-six-ivory.vercel.app/api');

const api = axios.create({
  baseURL,
});

// Add a request interceptor to add the auth token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const translateText = async (data) => {
  const res = await api.post('/translate', data);
  return res.data;
};

export const loginUser = async (data) => {
  const res = await api.post('/auth/login', data);
  return res.data;
};

export const registerUser = async (data) => {
  const res = await api.post('/auth/register', data);
  return res.data;
};

export const getCurrentUser = async () => {
  const res = await api.get('/auth/me');
  return res.data;
};

export const updateUserPreferences = async (data) => {
  const res = await api.put('/user/preferences', data);
  return res.data;
};

export const getHistory = async (params) => {
  const res = await api.get('/history', { params });
  return res.data;
};

export const deleteHistoryItem = async (id) => {
  const res = await api.delete(`/history/${id}`);
  return res.data;
};

export const getStats = async () => {
  const res = await api.get('/history/stats');
  return res.data;
};

export const getFavorites = async (params) => {
  const res = await api.get('/favorites', { params });
  return res.data;
};

export const addFavorite = async (data) => {
  const res = await api.post('/favorites', data);
  return res.data;
};

export const removeFavorite = async (id) => {
  const res = await api.delete(`/favorites/${id}`);
  return res.data;
};

export const checkFavorite = async (translationId) => {
  const res = await api.get(`/favorites/check/${translationId}`);
  return res.data;
};

export const transliterateText = async (text, lang) => {
  try {
    const res = await api.post('/translate/transliterate', { text, lang });
    return res.data.result;
  } catch (err) {
    console.error('Transliteration API error:', err);
    return text;
  }
};

export const getTextToSpeechUrl = (text, lang) => {
  const params = new URLSearchParams({ text, lang });
  return `${baseURL}/translate/tts?${params.toString()}`;
};

export default api;
