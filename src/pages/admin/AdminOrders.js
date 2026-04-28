import React, { useState, useEffect } from 'react';
import api from '../../api';
import './AdminLayout.css';

const STATUS_MAP = {
  PENDING: '결제 대기', PAID: '결제 완료', PREPARING: '준비 중',
  SHIPPED: '배송 중', DELIVERED: '배송 완료', CANCELLED: '취소',
};
const STATUS_CLASS = {
  PENDING: 'status-pending', PAID: 'status-paid', PREPARING: 'status-preparing',
  SHIPPED: 'status-shipped', DELIVERED: 'status-delivered', CANCELLED: 'status-cancelled',
};
const STATUS_OPTIONS = Object.entries(STATUS_MAP);

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = () => {
    setLoading(true);
    api.get('/api/admin/orders')
      .then(res => setOrders(Array.isArray(res.data) ? res.data : res.data?.content || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.put(`/api/admin/orders/${orderId}/status`, { status: newStatus });
      fetchOrders();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => ({ ...prev, status: newStatus }));
      }
    } catch {
      alert('상태 변경 중 오류가 발생했습니다.');
    }
  };

  const filtered = filterStatus === 'ALL' ? orders : orders.filter(o => o.status === filterStatus);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 className="admin-page-title" style={{ margin: 0 }}>주문 관리</h1>
        <button className="admin-btn admin-btn-primary" onClick={fetchOrders}>새로고침</button>
      </div>

      {/* Status filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {[['ALL', '전체'], ...STATUS_OPTIONS].map(([val, label]) => (
          <button
            key={val}
            onClick={() => setFilterStatus(val)}
            style={{
              padding: '7px 16px',
              fontSize: 12,
              border: '1px solid',
              borderColor: filterStatus === val ? '#111' : '#e0e0e0',
              background: filterStatus === val ? '#111' : '#fff',
              color: filterStatus === val ? '#fff' : '#666',
              cursor: 'pointer',
              fontFamily: 'Anuphan, sans-serif',
              letterSpacing: '0.5px',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedOrder ? '1fr 360px' : '1fr', gap: 20 }}>
        <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
          {loading ? (
            <p style={{ padding: 28, color: '#bbb', fontSize: 13 }}>불러오는 중...</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>주문번호</th>
                  <th>수령인</th>
                  <th>금액</th>
                  <th>상태</th>
                  <th>일시</th>
                  <th>상태변경</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', color: '#bbb', padding: 40 }}>주문이 없습니다.</td></tr>
                ) : filtered.map(order => (
                  <tr key={order.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedOrder(order)}>
                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>#{order.orderNumber || order.id}</td>
                    <td>{order.recipient || order.shippingInfo?.recipient || '-'}</td>
                    <td>₩ {Number(order.totalPrice).toLocaleString()}</td>
                    <td>
                      <span className={`admin-status-badge ${STATUS_CLASS[order.status]}`}>
                        {STATUS_MAP[order.status] || order.status}
                      </span>
                    </td>
                    <td style={{ color: '#bbb', fontSize: 12 }}>
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString('ko-KR') : '-'}
                    </td>
                    <td onClick={e => e.stopPropagation()}>
                      <select
                        value={order.status}
                        onChange={e => handleStatusChange(order.id, e.target.value)}
                        style={{
                          border: '1px solid #e5e5e5', padding: '5px 8px',
                          fontSize: 12, fontFamily: 'Anuphan, sans-serif',
                          background: '#fafafa', cursor: 'pointer', outline: 'none',
                        }}
                      >
                        {STATUS_OPTIONS.map(([val, label]) => (
                          <option key={val} value={val}>{label}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Order detail panel */}
        {selectedOrder && (
          <div className="admin-card" style={{ position: 'sticky', top: 40, maxHeight: 'calc(100vh - 80px)', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3 style={{ fontSize: 14, fontWeight: 400, color: '#111' }}>주문 상세</h3>
              <button onClick={() => setSelectedOrder(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#bbb', fontSize: 18, lineHeight: 1 }}>×</button>
            </div>

            <div style={{ fontSize: 12, color: '#999', marginBottom: 4 }}>주문번호</div>
            <div style={{ fontFamily: 'monospace', fontSize: 13, marginBottom: 20 }}>#{selectedOrder.orderNumber || selectedOrder.id}</div>

            <div style={{ fontSize: 12, color: '#999', marginBottom: 8 }}>주문 상품</div>
            {(selectedOrder.items || []).map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '8px 0', borderBottom: '1px solid #f5f5f5' }}>
                <span>{item.productName}</span>
                <span style={{ color: '#666' }}>{item.quantity}개 · ₩{(item.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 500, marginTop: 12, paddingTop: 12, borderTop: '2px solid #f0f0f0' }}>
              <span>합계</span>
              <span>₩ {Number(selectedOrder.totalPrice).toLocaleString()}</span>
            </div>

            <div style={{ marginTop: 24, fontSize: 12, color: '#999', marginBottom: 8 }}>배송 정보</div>
            {[
              ['수령인', selectedOrder.recipient || selectedOrder.shippingInfo?.recipient],
              ['연락처', selectedOrder.phone || selectedOrder.shippingInfo?.phone],
              ['주소', selectedOrder.address || selectedOrder.shippingInfo?.address],
              ['상세주소', selectedOrder.addressDetail || selectedOrder.shippingInfo?.addressDetail],
              ['메모', selectedOrder.memo || selectedOrder.shippingInfo?.memo],
            ].map(([label, val]) => val ? (
              <div key={label} style={{ fontSize: 13, color: '#444', marginBottom: 6 }}>
                <span style={{ color: '#bbb', marginRight: 8 }}>{label}</span>{val}
              </div>
            ) : null)}
          </div>
        )}
      </div>
    </div>
  );
}
