import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderAPI } from '../api';
import './OrderDetail.css';

const STATUS_MAP = {
  PENDING: '결제 대기',
  PAID: '결제 완료',
  PREPARING: '상품 준비 중',
  SHIPPED: '배송 중',
  DELIVERED: '배송 완료',
  CANCELLED: '주문 취소',
};

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderAPI.getById(id)
      .then(res => setOrder(res.data))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="order-loading">Loading...</div>;
  if (!order) return <div className="order-loading">주문을 찾을 수 없습니다.</div>;

  return (
    <div className="order-page">
      <div className="order-inner">
        <div className="order-confirm-icon">✓</div>
        <h1 className="order-title">주문이 완료되었습니다</h1>
        <p className="order-num">주문번호: {order.orderNumber || order.id}</p>

        <div className="order-card">
          <h3>주문 상품</h3>
          {order.items?.map((item, i) => (
            <div key={i} className="order-item">
              <span className="oi-name">{item.productName}</span>
              <span className="oi-qty">{item.quantity}개</span>
              <span className="oi-price">₩ {(item.price * item.quantity).toLocaleString()}</span>
            </div>
          ))}
          <div className="order-total">
            <span>총 결제금액</span>
            <span>₩ {order.totalPrice?.toLocaleString()}</span>
          </div>
        </div>

        <div className="order-card">
          <h3>배송 정보</h3>
          <p>{order.shippingInfo?.recipient}</p>
          <p>{order.shippingInfo?.phone}</p>
          <p>{order.shippingInfo?.address} {order.shippingInfo?.addressDetail}</p>
        </div>

        <div className="order-card">
          <h3>주문 상태</h3>
          <p className="order-status">{STATUS_MAP[order.status] || order.status}</p>
        </div>

        <div className="order-actions">
          <Link to="/shop" className="order-shop-btn">쇼핑 계속하기</Link>
          <Link to="/orders" className="order-list-btn">주문 내역 보기</Link>
        </div>
      </div>
    </div>
  );
}
