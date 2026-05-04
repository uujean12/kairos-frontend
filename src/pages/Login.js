import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../api';
import api from '../api';
import './Login.css';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ email: '', name: '', password: '', passwordConfirm: '' });
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [needVerification, setNeedVerification] = useState(false);
  const [validations, setValidations] = useState({
    emailExists: false,
    emailFormat: true,
    passwordMatch: true,
    passwordStrength: true,
  });

  const verified = searchParams.get('verified');

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validatePassword = (pw) => {
    const hasLength = pw.length >= 10;
    const hasNumber = /[0-9]/.test(pw);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pw);
    return hasLength && hasNumber && hasSpecial;
  };

  const checkEmailDuplicate = async (email) => {
    if (!validateEmail(email)) {
      setValidations(v => ({ ...v, emailFormat: false, emailExists: false }));
      return;
    }
    setValidations(v => ({ ...v, emailFormat: true }));
    try {
      await api.get(`/api/auth/check-email?email=${email}`);
      setValidations(v => ({ ...v, emailExists: false }));
    } catch {
      setValidations(v => ({ ...v, emailExists: true }));
    }
  };

  // 회원가입
  const handleRegister = async () => {
    setError('');
    if (!form.name) { setError('이름을 입력해주세요.'); return; }
    if (!validateEmail(form.email)) { setError('올바른 이메일 형식이 아닙니다.'); return; }
    if (validations.emailExists) { setError('이미 사용 중인 이메일입니다.'); return; }
    if (!validatePassword(form.password)) { setError('비밀번호는 10자 이상, 숫자, 특수기호를 포함해야 합니다.'); return; }
    if (form.password !== form.passwordConfirm) { setError('비밀번호가 일치하지 않습니다.'); return; }
    if (!agreed) { setError('개인정보 처리방침에 동의해주세요.'); return; }

    setLoading(true);
    try {
      await api.post('/api/auth/register', {
        email: form.email,
        name: form.name,
        password: form.password,
      });
      setRegisterSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || '오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 로그인
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setNeedVerification(false);

    setLoading(true);
    try {
      await login(loginForm.email, loginForm.password);
      navigate('/');
    } catch (err) {
      if (err.response?.status === 403 && err.response?.data?.needVerification) {
        setNeedVerification(true);
      } else {
        setError(err.response?.data?.message || '이메일 또는 비밀번호를 확인해주세요.');
      }
    } finally {
      setLoading(false);
    }
  };

  // 인증 메일 재발송
  const handleResendVerification = async () => {
    try {
      await api.post('/api/auth/send-verification', { email: form.email || loginForm.email });
      alert('인증 메일을 재발송했습니다. 메일함을 확인해주세요.');
    } catch {
      alert('메일 발송 중 오류가 발생했습니다.');
    }
  };

  const PrivacyAgreement = () => (
    <div style={{ marginTop: 16, padding: '16px', background: '#f9f9f9', fontSize: 13 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <input
          type="checkbox"
          id="agree"
          checked={agreed}
          onChange={e => setAgreed(e.target.checked)}
          style={{ marginTop: 2, cursor: 'pointer' }}
        />
        <label htmlFor="agree" style={{ cursor: 'pointer', color: '#444', lineHeight: 1.5 }}>
          <span style={{ color: '#c00' }}>[필수]</span> 개인정보 처리방침에 동의합니다.{' '}
          <span
            style={{ color: '#4C4C4C', textDecoration: 'underline', cursor: 'pointer' }}
            onClick={() => setShowPrivacy(!showPrivacy)}
          >
            내용 보기
          </span>
        </label>
      </div>
      {showPrivacy && (
        <div style={{
          marginTop: 12, padding: 12, background: '#fff',
          border: '1px solid #e0e0e0', fontSize: 12, color: '#666',
          lineHeight: 1.8, maxHeight: 200, overflowY: 'auto'
        }}>
          <strong>개인정보 처리방침</strong><br /><br />
          kairos(이하 "회사")는 회원의 개인정보를 중요시하며, 개인정보보호법 등 관련 법령을 준수합니다.<br /><br />
          <strong>1. 수집하는 개인정보 항목</strong><br />
          - 필수: 이름, 이메일<br />
          - 선택: 전화번호, 주소<br /><br />
          <strong>2. 개인정보 수집 및 이용 목적</strong><br />
          - 회원 식별 및 서비스 제공<br />
          - 주문 및 배송 처리<br />
          - 고객 문의 응대<br /><br />
          <strong>3. 개인정보 보유 및 이용 기간</strong><br />
          - 회원 탈퇴 시까지 보유<br />
          - 단, 관련 법령에 따라 일정 기간 보존<br /><br />
          <strong>4. 개인정보의 제3자 제공</strong><br />
          - 회사는 원칙적으로 회원의 개인정보를 외부에 제공하지 않습니다.<br /><br />
          <strong>5. 문의</strong><br />
          - 이메일: support@kaiiros.shop
        </div>
      )}
    </div>
  );

  return (
    <div className="login-page">
      <div className="login-card">
        <Link to="/" className="login-logo">kairos</Link>

        {/* 이메일 인증 완료 메시지 */}
        {verified === 'true' && (
          <div style={{ background: '#f0fff0', border: '1px solid #c3e6c3', padding: 16, marginBottom: 16, fontSize: 13, color: '#2d6a2d', textAlign: 'center' }}>
            이메일 인증이 완료되었습니다. 로그인해주세요 😊
          </div>
        )}
        {verified === 'false' && (
          <div style={{ background: '#fff5f5', border: '1px solid #fcc', padding: 16, marginBottom: 16, fontSize: 13, color: '#c00', textAlign: 'center' }}>
            인증 링크가 만료되었습니다. 다시 인증 메일을 요청해주세요.
          </div>
        )}

        {/* 회원가입 성공 - 인증 메일 발송 완료 */}
        {registerSuccess ? (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <div style={{ fontSize: 32, marginBottom: 16 }}>📧</div>
            <p style={{ fontSize: 15, color: '#111', marginBottom: 8 }}>인증 메일을 발송했습니다!</p>
            <p style={{ fontSize: 13, color: '#999', marginBottom: 24, lineHeight: 1.6 }}>
              <strong>{form.email}</strong>로 발송된 메일에서<br />
              인증 링크를 클릭해주세요.
            </p>
            <button
              onClick={handleResendVerification}
              style={{ background: 'none', border: 'none', fontSize: 13, color: '#4C4C4C', textDecoration: 'underline', cursor: 'pointer', marginBottom: 16 }}
            >
              인증 메일 재발송
            </button>
            <br />
            <button
              onClick={() => { setRegisterSuccess(false); setMode('login'); }}
              className="login-btn-black"
              style={{ marginTop: 8 }}
            >
              로그인 페이지로
            </button>
          </div>
        ) : mode === 'login' ? (
          <>
            <form onSubmit={handleLogin} className="login-form">
              <div className="login-field">
                <label>ID</label>
                <div className="login-field-right">
                  <Link to="/find-account" className="login-find">아이디 찾기</Link>
                </div>
                <input
                  type="email"
                  value={loginForm.email}
                  onChange={e => setLoginForm({ ...loginForm, email: e.target.value })}
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
                  value={loginForm.password}
                  onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
                  required
                />
              </div>
              {error && <p className="login-error">{error}</p>}

              {needVerification && (
                <div style={{ background: '#fff9e6', border: '1px solid #ffe58f', padding: 12, fontSize: 13, color: '#996600', marginTop: 8 }}>
                  이메일 인증이 필요합니다.{' '}
                  <span
                    style={{ textDecoration: 'underline', cursor: 'pointer' }}
                    onClick={handleResendVerification}
                  >
                    인증 메일 재발송
                  </span>
                </div>
              )}

              <button type="submit" className="login-btn-black" disabled={loading}>
                {loading ? '...' : '로그인'}
              </button>
              <button type="button" className="login-btn-white" onClick={() => { setMode('register'); setError(''); setAgreed(false); }}>
                회원가입
              </button>
            </form>

            <div className="social-btns">
              <button className="social-btn google" onClick={() => authAPI.googleLogin()}>
                Google로 계속하기
              </button>
              <button className="social-btn kakao" onClick={() => authAPI.kakaoLogin()}>
                카카오로 계속하기
              </button>
            </div>
          </>
        ) : (
          <div className="login-form">
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
                onChange={e => {
                  setForm({ ...form, email: e.target.value });
                  checkEmailDuplicate(e.target.value);
                }}
                required
              />
              {form.email && !validations.emailFormat && (
                <p className="validation-error">올바른 이메일 형식이 아닙니다.</p>
              )}
              {form.email && validations.emailFormat && validations.emailExists && (
                <p className="validation-error">이미 사용 중인 이메일입니다.</p>
              )}
              {form.email && validations.emailFormat && !validations.emailExists && (
                <p className="validation-success">사용 가능한 이메일입니다.</p>
              )}
            </div>
            <div className="login-field">
              <label>비밀번호</label>
              <input
                type="password"
                value={form.password}
                onChange={e => {
                  setForm({ ...form, password: e.target.value });
                  setValidations(v => ({ ...v, passwordStrength: validatePassword(e.target.value) }));
                }}
                placeholder="10자 이상, 숫자, 특수기호 포함"
                required
              />
              {form.password && !validations.passwordStrength && (
                <p className="validation-error">10자 이상, 숫자, 특수기호를 포함해야 합니다.</p>
              )}
              {form.password && validations.passwordStrength && (
                <p className="validation-success">안전한 비밀번호입니다.</p>
              )}
            </div>
            <div className="login-field">
              <label>비밀번호 확인</label>
              <input
                type="password"
                value={form.passwordConfirm}
                onChange={e => {
                  setForm({ ...form, passwordConfirm: e.target.value });
                  setValidations(v => ({ ...v, passwordMatch: e.target.value === form.password }));
                }}
                required
              />
              {form.passwordConfirm && !validations.passwordMatch && (
                <p className="validation-error">비밀번호가 일치하지 않습니다.</p>
              )}
              {form.passwordConfirm && validations.passwordMatch && (
                <p className="validation-success">비밀번호가 일치합니다.</p>
              )}
            </div>

            <PrivacyAgreement />

            {error && <p className="login-error">{error}</p>}

            <button
              type="button"
              className="login-btn-black"
              onClick={handleRegister}
              disabled={loading || validations.emailExists || !validations.emailFormat || !validations.passwordStrength || !validations.passwordMatch || !agreed}
            >
              {loading ? '...' : '회원가입'}
            </button>
            <button
              type="button"
              className="login-btn-white"
              onClick={() => { setMode('login'); setError(''); setAgreed(false); }}
            >
              로그인으로 돌아가기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}