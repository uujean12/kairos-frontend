import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderAPI } from '../api';
import './Orders.css';

const STATUS_MAP = {
  PENDING: '결제 대기', PAID: '결제 완료', PREPARING: '준비 중',
  SHIPPED: '배송 중', DELIVERED: '배송 완료', CANCELLED: '취소',
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderAPI.getAll().then(res => setOrders(res.data || [])).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="orders-loading">Loading...</div>;

  return (
    <div className="orders-page">
      <div className="orders-inner">
        <h1 className="orders-title">ORDER HISTORY</h1>
        {orders.length === 0 ? (
          <div className="orders-empty">
            <p>주문 내역이 없습니다.</p>
            <Link to="/shop" className="orders-shop-link">쇼핑하러 가기 →</Link>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map(order => (
              <Link to={`/orders/${order.id}`} key={order.id} className="order-row">
                <div className="or-left">
                  <span className="or-num">#{order.orderNumber || order.id}</span>
                  <span className="or-date">{new Date(order.createdAt).toLocaleDateString('ko-KR')}</span>
                </div>
                <div className="or-items">
                  {order.items?.[0]?.productName}
                  {order.items?.length > 1 && ` 외 ${order.items.length - 1}건`}
                </div>
                <div className="or-right">
                  <span className="or-price">₩ {order.totalPrice?.toLocaleString()}</span>
                  <span className={`or-status or-${order.status?.toLowerCase()}`}>
                    {STATUS_MAP[order.status] || order.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
