import React, { useState, useEffect } from 'react';
import api from '../../api';
import './AdminLayout.css';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ products: 0, orders: 0, users: 0, revenue: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/api/admin/stats').catch(() => ({ data: {} })),
      api.get('/api/admin/orders?size=5').catch(() => ({ data: [] })),
    ]).then(([statsRes, ordersRes]) => {
      setStats(statsRes.data || {});
      setRecentOrders(Array.isArray(ordersRes.data) ? ordersRes.data.slice(0, 5) : ordersRes.data?.content?.slice(0, 5) || []);
    }).finally(() => setLoading(false));
  }, []);

  const STATUS_MAP = {
    PENDING: '결제 대기', PAID: '결제 완료', PREPARING: '준비 중',
    SHIPPED: '배송 중', DELIVERED: '배송 완료', CANCELLED: '취소',
  };
  const STATUS_CLASS = {
    PENDING: 'status-pending', PAID: 'status-paid', PREPARING: 'status-preparing',
    SHIPPED: 'status-shipped', DELIVERED: 'status-delivered', CANCELLED: 'status-cancelled',
  };

  return (
    <div>
      <h1 className="admin-page-title">대시보드</h1>

      <div className="admin-stat-grid">
        {[
          { label: 'TOTAL PRODUCTS', value: stats.products ?? '-', sub: '등록 상품' },
          { label: 'TOTAL ORDERS', value: stats.orders ?? '-', sub: '전체 주문' },
          { label: 'TOTAL USERS', value: stats.users ?? '-', sub: '가입 회원' },
          { label: 'REVENUE', value: stats.revenue ? `₩${Number(stats.revenue).toLocaleString()}` : '-', sub: '총 매출' },
        ].map((s) => (
          <div key={s.label} className="admin-stat-card">
            <div className="admin-stat-label">{s.label}</div>
            <div className="admin-stat-value">{loading ? '...' : s.value}</div>
            <div className="admin-stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="admin-card">
        <h2 style={{ fontSize: 13, fontWeight: 400, letterSpacing: '1.5px', color: '#999', marginBottom: 20 }}>
          RECENT ORDERS
        </h2>
        {loading ? (
          <p style={{ color: '#bbb', fontSize: 13 }}>불러오는 중...</p>
        ) : recentOrders.length === 0 ? (
          <p style={{ color: '#bbb', fontSize: 13 }}>주문 내역이 없습니다.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>주문번호</th>
                <th>회원</th>
                <th>금액</th>
                <th>상태</th>
                <th>일시</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map(order => (
                <tr key={order.id}>
                  <td style={{ fontFamily: 'monospace', fontSize: 12 }}>#{order.orderNumber || order.id}</td>
                  <td>{order.userEmail || order.recipient || '-'}</td>
                  <td>₩ {Number(order.totalPrice).toLocaleString()}</td>
                  <td>
                    <span className={`admin-status-badge ${STATUS_CLASS[order.status]}`}>
                      {STATUS_MAP[order.status] || order.status}
                    </span>
                  </td>
                  <td style={{ color: '#bbb', fontSize: 12 }}>
                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString('ko-KR') : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
