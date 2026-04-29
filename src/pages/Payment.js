import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api';
import './Payment.css';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const paymentKey = searchParams.get('paymentKey');
    const orderId = searchParams.get('orderId');
    const amount = searchParams.get('amount');

    if (!paymentKey || !orderId || !amount) {
      navigate('/');
      return;
    }

    // 백엔드에 결제 승인 요청
    api.post('/api/payments/confirm', {
        paymentKey,
        orderId,
        amount: parseInt(amount),
        })
        .then(res => {
            // orderId에서 주문 ID 추출 (kairos-{id}-{timestamp})
            const realOrderId = orderId.split('-')[1];
            navigate(`/orders/${realOrderId}`, { replace: true });
        })
        .catch(() => {
            alert('결제 승인 중 오류가 발생했습니다.');
            navigate('/cart');
        });
        }, []);

  return (
    <div className="payment-loading">
      <div className="payment-spinner" />
      <p>결제 처리 중입니다...</p>
    </div>
  );
}