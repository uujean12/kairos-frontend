import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api';
import './Login.css';

export default function AdditionalInfo() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const provider = searchParams.get('provider');
  const kakaoId = searchParams.get('kakaoId');
  const googleEmail = searchParams.get('email');
  const googleName = searchParams.get('name');

  const [form, setForm] = useState({
    name: provider === 'google' ? (googleName || '') : '',
    email: provider === 'google' ? (googleEmail || '') : '',
  });
  const [agreed, setAgreed] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!agreed) { setError('개인정보 처리방침에 동의해주세요.'); return; }
    if (provider === 'kakao' && !validateEmail(form.email)) {
      setError('올바른 이메일 형식이 아닙니다.'); return;
    }

    setLoading(true);
    try {
      if (provider === 'kakao') {
        const res = await api.post('/api/auth/kakao-register', {
          kakaoId,
          name: form.name,
          email: form.email,
        });
        localStorage.setItem('accessToken', res.data.accessToken);
        localStorage.setItem('user', JSON.stringify(res.data.user));
      } else if (provider === 'google') {
        const res = await api.post('/api/auth/google-register', {
          name: googleName,
          email: googleEmail,
        });
        localStorage.setItem('accessToken', res.data.accessToken);
        localStorage.setItem('user', JSON.stringify(res.data.user));
      }
      window.location.href = '/';
    } catch (err) {
      setError(err.response?.data?.message || '오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div style={{
          fontFamily: 'Arial Black', fontStyle: 'italic',
          fontSize: 24, textAlign: 'center', marginBottom: 8, color: '#111'
        }}>
          kairos
        </div>
        <p style={{ textAlign: 'center', fontSize: 13, color: '#999', marginBottom: 16 }}>
          {provider === 'kakao'
            ? '카카오 로그인을 위해 추가 정보를 입력해주세요.'
            : 'Google 로그인을 위해 아래 내용을 확인해주세요.'}
        </p>

        <form onSubmit={handleSubmit} className="login-form">
          {/* 카카오만 이름, 이메일 입력 */}
          {provider === 'kakao' && (
            <>
              <div className="login-field">
                <label>이름 (실명)</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="실명을 입력해주세요"
                  required
                />
              </div>
              <div className="login-field">
                <label>이메일</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="이메일을 입력해주세요"
                  required
                />
              </div>
            </>
          )}

          {/* 구글은 정보 표시만 */}
          {provider === 'google' && (
            <div className="mypage-info-card" style={{ marginBottom: 16 }}>
              <div className="mypage-info-row">
                <span className="mypage-info-label">이름</span>
                <span className="mypage-info-value">{googleName}</span>
              </div>
              <div className="mypage-info-row">
                <span className="mypage-info-label">이메일</span>
                <span className="mypage-info-value">{googleEmail}</span>
              </div>
            </div>
          )}

          {/* 개인정보 동의 */}
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

          {error && <p className="login-error">{error}</p>}

          <button
            type="submit"
            className="login-btn-black"
            disabled={loading || !agreed}
          >
            {loading ? '처리 중...' : '시작하기'}
          </button>
        </form>
      </div>
    </div>
  );
}