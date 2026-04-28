import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: false,
});

// 요청 인터셉터: JWT 토큰 자동 첨부
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 응답 인터셉터: 401 시 로그인으로 리다이렉트
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ========== AUTH ==========
export const authAPI = {
  login: (email, password) =>
    api.post('/api/auth/login', { email, password }),
  register: (email, password, name) =>
    api.post('/api/auth/register', { email, password, name }),
  logout: () =>
    api.post('/api/auth/logout'),
  me: () =>
    api.get('/api/auth/me'),
  googleLogin: () => {
    window.location.href = `${API_BASE_URL}/oauth2/authorization/google`;
  },
  kakaoLogin: () => {
    window.location.href = `${API_BASE_URL}/oauth2/authorization/kakao`;
  },
};

// ========== PRODUCTS ==========
export const productAPI = {
  getAll: (params) => api.get('/api/products', { params }),
  getById: (id) => api.get(`/api/products/${id}`),
  getByCategory: (category) => api.get(`/api/products/category/${category}`),
  search: (keyword) => api.get('/api/products/search', { params: { keyword } }),
};

// ========== CART ==========
export const cartAPI = {
  get: () => api.get('/api/cart'),
  add: (productId, quantity) =>
    api.post('/api/cart', { productId, quantity }),
  update: (cartItemId, quantity) =>
    api.put(`/api/cart/${cartItemId}`, { quantity }),
  remove: (cartItemId) =>
    api.delete(`/api/cart/${cartItemId}`),
  clear: () =>
    api.delete('/api/cart'),
};

// ========== ORDERS ==========
export const orderAPI = {
  create: (orderData) => api.post('/api/orders', orderData),
  getAll: () => api.get('/api/orders'),
  getById: (id) => api.get(`/api/orders/${id}`),
  cancel: (id) => api.put(`/api/orders/${id}/cancel`),
};

export default api;
