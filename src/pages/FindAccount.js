import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import './Login.css';

export default function FindAccount() {
  const [tab, setTab] = useState('id');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const handleFindId = async (e) => {
    e.preventDefault();
    setError(''); setResult('');
    setLoading(true);
    try {
      const res = await api.post('/api/auth/find-email', { name });
      setResult(res.data.email);
    } catch {
      setError('일치하는 계정을 찾을 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleFindPw = async (e) => {
    e.preventDefault();
    setError(''); setResult('');
    setLoading(true);
    try {
      await api.post('/api/auth/verify-email', { email });
      setStep(2);
    } catch {
      setError('등록된 이메일을 찾을 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPw = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/api/auth/reset-password', { email, newPassword });
      setResult('비밀번호가 변경되었습니다. 로그인해주세요.');
      setStep(3);
    } catch {
      setError('비밀번호 변경 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <Link to="/" className="login-logo">kairos</Link>

        <div className="login-tabs">
          <button
            className={tab === 'id' ? 'active' : ''}
            onClick={() => { setTab('id'); setStep(1); setResult(''); setError(''); }}
          >
            아이디 찾기
          </button>
          <button
            className={tab === 'pw' ? 'active' : ''}
            onClick={() => { setTab('pw'); setStep(1); setResult(''); setError(''); }}
          >
            비밀번호 찾기
          </button>
        </div>

        {/* 아이디 찾기 */}
        {tab === 'id' && (
          <form onSubmit={handleFindId} className="login-form">
            <div className="login-field">
              <label>이름</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="가입 시 입력한 이름"
                required
              />
            </div>
            {error && <p className="login-error">{error}</p>}
            {result && (
              <div style={{ background: '#f5f5f5', padding: '16px', textAlign: 'center', fontSize: 14, color: '#111' }}>
                가입된 이메일: <strong>{result}</strong>
              </div>
            )}
            <button type="submit" className="login-btn-black" disabled={loading}>
              {loading ? '확인 중...' : '아이디 찾기'}
            </button>
          </form>
        )}

        {/* 비밀번호 찾기 */}
        {tab === 'pw' && (
          <>
            {step === 1 && (
              <form onSubmit={handleFindPw} className="login-form">
                <div className="login-field">
                  <label>이메일</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="가입 시 입력한 이메일"
                    required
                  />
                </div>
                {error && <p className="login-error">{error}</p>}
                <button type="submit" className="login-btn-black" disabled={loading}>
                  {loading ? '확인 중...' : '이메일 확인'}
                </button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleResetPw} className="login-form">
                <div className="login-field">
                  <label>새 비밀번호</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="새 비밀번호 입력"
                    required
                    minLength={4}
                  />
                </div>
                {error && <p className="login-error">{error}</p>}
                <button type="submit" className="login-btn-black" disabled={loading}>
                  {loading ? '변경 중...' : '비밀번호 변경'}
                </button>
              </form>
            )}

            {step === 3 && (
              <div className="login-form">
                <div style={{ background: '#f5f5f5', padding: '16px', textAlign: 'center', fontSize: 14, color: '#111' }}>
                  {result}
                </div>
                <Link to="/login" className="login-btn-black" style={{ textAlign: 'center', display: 'block', textDecoration: 'none' }}>
                  로그인하기
                </Link>
              </div>
            )}
          </>
        )}

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Link to="/login" style={{ fontSize: 13, color: '#999', textDecoration: 'none' }}>
            로그인으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}