import React from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './AdminLayout.css';

const NAV_ITEMS = [
  { path: '/admin', label: '대시보드', icon: '◻' },
  { path: '/admin/products', label: '상품 관리', icon: '◻' },
  { path: '/admin/orders', label: '주문 관리', icon: '◻' },
  { path: '/admin/users', label: '회원 관리', icon: '◻' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // 관리자 권한 체크
  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="admin-denied">
        <h2>접근 권한이 없습니다</h2>
        <p>관리자 계정으로 로그인해주세요.</p>
        <Link to="/login">로그인</Link>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="admin-wrap">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-top">
          <Link to="/" className="admin-logo">kairos</Link>
          <span className="admin-badge">ADMIN</span>
        </div>

        <nav className="admin-nav">
          {NAV_ITEMS.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`admin-nav-item ${
                location.pathname === item.path ||
                (item.path !== '/admin' && location.pathname.startsWith(item.path))
                  ? 'active' : ''
              }`}
            >
              <span className="admin-nav-icon">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <button className="admin-logout" onClick={handleLogout}>로그아웃</button>
      </aside>

      {/* Main content */}
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
