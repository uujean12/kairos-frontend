import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login(email, password);
    const { accessToken, user: userData } = res.data;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const logout = async () => {
  try {
    const res = await authAPI.logout();
    // 카카오 로그아웃이 필요한 경우
    if (res.data.kakaoLogoutUrl) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      setUser(null);
      window.location.href = res.data.kakaoLogoutUrl;
      return;
    }
  } catch {}
  localStorage.removeItem('accessToken');
  localStorage.removeItem('user');
  setUser(null);
};

  const register = async (email, password, name) => {
    const res = await authAPI.register(email, password, name);
    const { accessToken, user: userData } = res.data;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
