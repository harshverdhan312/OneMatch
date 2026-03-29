import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// We will inject the store getter later or use a different way to access it
// to avoid circular dependency if App imports API and API imports Store.
let store = null;

export const injectStore = (s) => {
  store = s;
};

API.interceptors.request.use((config) => {
  if (store) {
    const tokens = store.getState().tokens;
    if (tokens?.accessToken) {
      config.headers.Authorization = `Bearer ${tokens.accessToken}`;
    }
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 403 && !originalRequest._retry && store) {
      originalRequest._retry = true;
      try {
        const refreshToken = store.getState().tokens?.refreshToken;
        const res = await axios.post(`${API.defaults.baseURL}/auth/refresh`, { refreshToken });
        const { tokens } = res.data;
        store.getState().setTokens(tokens);
        originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`;
        return API(originalRequest);
      } catch (err) {
        store.getState().logout();
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  }
);

export default API;
