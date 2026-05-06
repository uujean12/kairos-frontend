import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { orderAPI } from '../api';
import api from '../api';
import './MyPage.css';

const STATUS_MAP = {
  PENDING: '결제 대기', PAID: '결제 완료', PREPARING: '준비 중',
  SHIPPED: '배송 중', DELIVERED: '배송 완료', CANCELLED: '취소',
};

const STATUS_CLASS = {
  PENDING: 'status-pending', PAID: 'status-paid', PREPARING: 'status-preparing',
  SHIPPED: 'status-shipped', DELIVERED: 'status-delivered', CANCELLED: 'status-cancelled',
};

export default function MyPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');
  const [infoForm, setInfoForm] = useState({ phone: '', address: '' });
  const [editMode, setEditMode] = useState({ phone: false, address: false });
  const [infoSaving, setInfoSaving] = useState(false);
  const [infoMsg, setInfoMsg] = useState('');
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawPassword, setWithdrawPassword] = useState('');
  const [withdrawError, setWithdrawError] = useState('');
  const [withdrawLoading, setWithdrawLoading] = useState(false);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    orderAPI.getAll()
      .then(res => setOrders(res.data || []))
      .finally(() => setLoading(false));

    api.get('/api/auth/me').then(res => {
      setInfoForm({
        phone: res.data.phone || '',
        address: res.data.address || '',
      });
    });
  }, [user]);

  const handleCancel = async (orderId) => {
    if (!window.confirm('주문을 취소하시겠습니까?')) return;
    try {
      await orderAPI.cancel(orderId);
      setOrders(prev => prev.map(o =>
        o.id === orderId ? { ...o, status: 'CANCELLED' } : o
      ));
      alert('주문이 취소되었습니다.');
    } catch (err) {
      alert(err.response?.data?.message || '취소 중 오류가 발생했습니다.');
    }
  };

  const handleInfoSave = async (field) => {
    setInfoSaving(true);
    setInfoMsg('');
    try {
      const res = await api.put('/api/auth/update-info', infoForm);
      localStorage.setItem('user', JSON.stringify(res.data));
      setEditMode(prev => ({ ...prev, [field]: false }));
      setInfoMsg('저장되었습니다.');
      setTimeout(() => setInfoMsg(''), 2000);
    } catch {
      setInfoMsg('저장 중 오류가 발생했습니다.');
    } finally {
      setInfoSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleWithdraw = async () => {
    setWithdrawError('');
    setWithdrawLoading(true);
    try {
      const res = await api.delete('/api/auth/withdraw', {
        data: { password: withdrawPassword }
      });
      if (res.data.kakaoLogoutUrl) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        window.location.href = res.data.kakaoLogoutUrl;
        return;
      }
      alert('탈퇴가 완료되었습니다.');
      await logout();
      navigate('/');
    } catch (err) {
      setWithdrawError(err.response?.data?.message || '오류가 발생했습니다.');
    } finally {
      setWithdrawLoading(false);
    }
  };

  return (
    <div className="mypage">
      <div className="mypage-inner">
        <div className="mypage-sidebar">
          <div className="mypage-profile">
            <div className="mypage-avatar">{user?.name?.[0]?.toUpperCase()}</div>
            <div className="mypage-user-info">
              <span className="mypage-name">{user?.name}</span>
              <span className="mypage-email">{user?.email}</span>
            </div>
          </div>
          <nav className="mypage-nav">
            <button
              className={`mypage-nav-item ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >주문 내역</button>
            <button
              className={`mypage-nav-item ${activeTab === 'info' ? 'active' : ''}`}
              onClick={() => setActiveTab('info')}
            >내 정보</button>
            <button className="mypage-nav-item mypage-logout" onClick={handleLogout}>
              로그아웃
            </button>
          </nav>
        </div>

        <div className="mypage-content">
          {activeTab === 'orders' && (
            <div>
              <h2 className="mypage-title">주문 내역</h2>
              {loading ? (
                <p className="mypage-empty">불러오는 중...</p>
              ) : orders.length === 0 ? (
                <div className="mypage-empty">
                  <p>주문 내역이 없습니다.</p>
                  <Link to="/shop" className="mypage-shop-link">쇼핑하러 가기 →</Link>
                </div>
              ) : (
                <div className="mypage-orders">
                  {orders.map(order => (
                    <div key={order.id} className="mypage-order-card">
                      <div className="mypage-order-header">
                        <div>
                          <span className="mypage-order-num">#{order.orderNumber || order.id}</span>
                          <span className="mypage-order-date">
                            {order.createdAt ? new Date(order.createdAt).toLocaleDateString('ko-KR') : ''}
                          </span>
                        </div>
                        <span className={`mypage-status ${STATUS_CLASS[order.status]}`}>
                          {STATUS_MAP[order.status] || order.status}
                        </span>
                      </div>
                      <div className="mypage-order-items">
                        {order.items?.map((item, i) => (
                          <div key={i} className="mypage-order-item">
                            <span>{item.productName}</span>
                            <span>{item.quantity}개 · ₩{(item.price * item.quantity).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mypage-order-footer">
                        <span className="mypage-order-total">
                          총 ₩{order.totalPrice?.toLocaleString()}
                        </span>
                        {(order.status === 'PENDING' || order.status === 'PAID') && (
                          <button
                            className="mypage-cancel-btn"
                            onClick={() => handleCancel(order.id)}
                          >
                            주문 취소
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'info' && (
            <div>
              <h2 className="mypage-title">내 정보</h2>
              <div className="mypage-info-card">
                <div className="mypage-info-row">
                  <span className="mypage-info-label">이름</span>
                  <span className="mypage-info-value">{user?.name}</span>
                </div>
                <div className="mypage-info-row">
                  <span className="mypage-info-label">이메일</span>
                  <span className="mypage-info-value">{user?.email}</span>
                </div>
                <div className="mypage-info-row">
                  <span className="mypage-info-label">등급</span>
                  <span className="mypage-info-value">
                    {user?.role === 'ADMIN' ? '관리자' : '회원'}
                  </span>
                </div>

                {/* 전화번호 */}
                <div className="mypage-info-row">
                  <span className="mypage-info-label">전화번호</span>
                  {editMode.phone ? (
                    <div className="mypage-edit-wrap">
                      <input
                        className="mypage-info-input"
                        type="tel"
                        value={infoForm.phone}
                        placeholder="010-0000-0000"
                        onChange={e => setInfoForm({ ...infoForm, phone: e.target.value })}
                      />
                      <button
                        className="mypage-edit-save-btn"
                        onClick={() => handleInfoSave('phone')}
                        disabled={infoSaving}
                      >
                        저장
                      </button>
                    </div>
                  ) : (
                    <div className="mypage-edit-wrap">
                      <span className="mypage-info-value">
                        {infoForm.phone || '등록된 전화번호가 없습니다.'}
                      </span>
                      <button
                        className="mypage-edit-btn"
                        onClick={() => setEditMode(prev => ({ ...prev, phone: true }))}
                      >
                        수정
                      </button>
                    </div>
                  )}
                </div>

                {/* 주소 */}
                <div className="mypage-info-row">
                  <span className="mypage-info-label">주소</span>
                  {editMode.address ? (
                    <div className="mypage-edit-wrap">
                      <input
                        className="mypage-info-input"
                        type="text"
                        value={infoForm.address}
                        placeholder="기본 배송지 주소"
                        onChange={e => setInfoForm({ ...infoForm, address: e.target.value })}
                      />
                      <button
                        className="mypage-edit-save-btn"
                        onClick={() => handleInfoSave('address')}
                        disabled={infoSaving}
                      >
                        저장
                      </button>
                    </div>
                  ) : (
                    <div className="mypage-edit-wrap">
                      <span className="mypage-info-value">
                        {infoForm.address || '등록된 주소가 없습니다.'}
                      </span>
                      <button
                        className="mypage-edit-btn"
                        onClick={() => setEditMode(prev => ({ ...prev, address: true }))}
                      >
                        수정
                      </button>
                    </div>
                  )}
                </div>

                {infoMsg && (
                  <p style={{ fontSize: 13, color: infoMsg === '저장되었습니다.' ? '#006600' : '#c00', padding: '8px 0' }}>
                    {infoMsg}
                  </p>
                )}

                {/* 회원 탈퇴 */}
                <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid #f0f0f0' }}>
                  {!showWithdraw ? (
                    <button
                      onClick={() => setShowWithdraw(true)}
                      style={{ background: 'none', border: 'none', fontSize: 13, color: '#999', textDecoration: 'underline', cursor: 'pointer' }}
                    >
                      회원 탈퇴
                    </button>
                  ) : (
                    <div>
                      <p style={{ fontSize: 14, color: '#333', marginBottom: 12 }}>
                        정말 탈퇴하시겠습니까?<br />
                        <span style={{ fontSize: 12, color: '#999' }}>탈퇴 시 모든 정보가 삭제되며 복구가 어렵습니다.</span>
                      </p>
                      {user?.provider === 'LOCAL' && (
                        <div className="mypage-info-row" style={{ marginBottom: 12 }}>
                          <input
                            type="password"
                            placeholder="비밀번호 입력"
                            value={withdrawPassword}
                            onChange={e => setWithdrawPassword(e.target.value)}
                            className="mypage-info-input"
                          />
                        </div>
                      )}
                      {withdrawError && (
                        <p style={{ fontSize: 13, color: '#c00', marginBottom: 8 }}>{withdrawError}</p>
                      )}
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          onClick={handleWithdraw}
                          disabled={withdrawLoading}
                          style={{ background: '#c00', color: '#fff', border: 'none', padding: '8px 16px', fontSize: 13, cursor: 'pointer' }}
                        >
                          {withdrawLoading ? '...' : '탈퇴하기'}
                        </button>
                        <button
                          onClick={() => { setShowWithdraw(false); setWithdrawPassword(''); setWithdrawError(''); }}
                          style={{ background: '#f0f0f0', color: '#333', border: 'none', padding: '8px 16px', fontSize: 13, cursor: 'pointer' }}
                        >
                          취소
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}