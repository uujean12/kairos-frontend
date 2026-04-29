import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../api';
import './Login.css';

export default function Login() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ email: '', password: '', name: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
        navigate('/');
      } else {
        await register(form.email, form.password, form.name);
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || '이메일 또는 비밀번호를 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <Link to="/" className="login-logo">kairos</Link>

        {mode === 'login' ? (
          <form onSubmit={handleSubmit} className="login-form">
            <div className="login-field">
              <label>ID</label>
              <div className="login-field-right">
                <Link to="/find-account" className="login-find">아이디 찾기</Link>
              </div>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div className="login-field">
              <label>Password</label>
              <div className="login-field-right">
                <Link to="/find-account" className="login-find">비밀번호 찾기</Link>
              </div>
              <input
                type="password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
            {error && <p className="login-error">{error}</p>}
            <button type="submit" className="login-btn-black" disabled={loading}>
              {loading ? '...' : '로그인'}
            </button>
            <button type="button" className="login-btn-white" onClick={() => { setMode('register'); setError(''); }}>
              회원가입
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="login-form">
            <div className="login-field">
              <label>이름</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="login-field">
              <label>이메일</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div className="login-field">
              <label>비밀번호</label>
              <input
                type="password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
            {error && <p className="login-error">{error}</p>}
            <button type="submit" className="login-btn-black" disabled={loading}>
              {loading ? '...' : '회원가입'}
            </button>
            <button type="button" className="login-btn-white" onClick={() => { setMode('login'); setError(''); }}>
              로그인으로 돌아가기
            </button>
          </form>
        )}

        <div className="social-btns">
          <button className="social-btn google" onClick={() => authAPI.googleLogin()}>
            Google로 계속하기
          </button>
          <button className="social-btn kakao" onClick={() => authAPI.kakaoLogin()}>
            카카오로 계속하기
          </button>
        </div>
      </div>
    </div>
  );
}