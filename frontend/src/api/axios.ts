import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({ baseURL: '/api', timeout: 15000 });

// Attach access token
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('accessToken') || localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => error ? prom.reject(error) : prom.resolve(token));
  failedQueue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        });
      }
      original._retry = true;
      isRefreshing = true;
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        sessionStorage.removeItem('accessToken');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(error);
      }
      try {
        const res = await axios.post('/api/auth/refresh', { refreshToken });
        const { accessToken } = res.data;
        sessionStorage.setItem('accessToken', accessToken);
        api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
        processQueue(null, accessToken);
        original.headers.Authorization = `Bearer ${accessToken}`;
        return api(original);
      } catch (err) {
        processQueue(err, null);
        sessionStorage.removeItem('accessToken');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    // const msg = error.response?.data?.message || 'Đã xảy ra lỗi';
    // if (error.response?.status !== 401) toast.error(msg);
    return Promise.reject(error);
  }
);

export default api;
