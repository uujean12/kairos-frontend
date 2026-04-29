import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import './Payment.css';

export default function PaymentFail() {
  const [searchParams] = useSearchParams();
  const errorMessage = searchParams.get('message') || '결제에 실패했습니다.';

  return (
    <div className="payment-result">
      <div className="payment-fail-icon">✕</div>
      <h2>결제 실패</h2>
      <p>{errorMessage}</p>
      <div className="payment-actions">
        <Link to="/cart" className="payment-btn-primary">장바구니로 돌아가기</Link>
        <Link to="/shop" className="payment-btn-secondary">쇼핑 계속하기</Link>
      </div>
    </div>
  );
}