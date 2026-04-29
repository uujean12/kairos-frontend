import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderAPI } from '../api';
import './Cart.css';

export default function Cart() {
  const { cartItems, updateQuantity, removeItem, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [ordering, setOrdering] = useState(false);
  const [form, setForm] = useState({ recipient: '', phone: '', address: '', addressDetail: '', memo: '' });

  if (!user) {
    return (
      <div className="cart-page">
        <div className="cart-login-prompt">
          <p>로그인이 필요합니다.</p>
          <Link to="/login" className="cart-login-btn">로그인하기</Link>
        </div>
      </div>
    );
  }

  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleOrder = async () => {
  if (cartItems.length === 0) { alert('장바구니가 비어있습니다.'); return; }
  if (!form.recipient || !form.phone || !form.address) { alert('배송 정보를 입력해주세요.'); return; }

  setOrdering(true);
  try {
    // 1. 먼저 주문 생성
    const res = await orderAPI.create({
      items: cartItems.map(i => ({ productId: i.productId, quantity: i.quantity })),
      shippingInfo: form,
      totalPrice: total,
    });

    const orderId = `kairos-${res.data.id}-${Date.now()}`;
    const orderAmount = total >= 50000 ? total : total + 3000;

    // 2. 토스 결제창 띄우기
    const tossPayments = window.TossPayments(
      process.env.REACT_APP_TOSS_CLIENT_KEY
    );

    await tossPayments.requestPayment('카드', {
      amount: orderAmount,
      orderId: orderId,
      orderName: cartItems[0].name + (cartItems.length > 1 ? ` 외 ${cartItems.length - 1}건` : ''),
      customerName: form.recipient,
      successUrl: `${window.location.origin}/payment/success`,
      failUrl: `${window.location.origin}/payment/fail`,
    });

  } catch (err) {
    console.log('토스 에러:', err);
    console.log('에러 코드:', err.code);
    console.log('에러 메시지:', err.message);
    if (err.code !== 'USER_CANCEL') {
      alert(err.message || '오류가 발생했습니다.');
    }
  } finally {
    setOrdering(false);
  }
};

  return (
    <div className="cart-page">
      <div className="cart-inner">
        <h1 className="cart-title">CART</h1>

        {cartItems.length === 0 ? (
          <div className="cart-empty">
            <p>장바구니가 비어있습니다.</p>
            <Link to="/shop" className="cart-shop-link">쇼핑 계속하기 →</Link>
          </div>
        ) : (
          <div className="cart-content">
            <div className="cart-items">
              {cartItems.map((item) => (
                <div key={item.id} className="cart-item">
                  <div className="cart-item-img">
                    {item.imageUrl
                      ? <img src={item.imageUrl} alt={item.name} />
                      : <div className="cart-img-placeholder" />
                    }
                  </div>
                  <div className="cart-item-info">
                    <span className="cart-item-name">{item.name}</span>
                    <span className="cart-item-price">₩ {item.price?.toLocaleString()}</span>
                    <div className="cart-qty">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1}>−</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>＋</button>
                    </div>
                  </div>
                  <div className="cart-item-right">
                    <span className="cart-subtotal">₩ {(item.price * item.quantity)?.toLocaleString()}</span>
                    <button className="cart-remove" onClick={() => removeItem(item.id)}>×</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-sidebar">
              <div className="order-form">
                <h3>배송 정보</h3>
                <input placeholder="수령인" value={form.recipient} onChange={e => setForm({...form, recipient: e.target.value})} />
                <input placeholder="연락처" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                <input placeholder="주소" value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
                <input placeholder="상세 주소" value={form.addressDetail} onChange={e => setForm({...form, addressDetail: e.target.value})} />
                <textarea placeholder="배송 메모 (선택)" value={form.memo} onChange={e => setForm({...form, memo: e.target.value})} rows={3} />
              </div>

              <div className="cart-summary">
                <div className="summary-row">
                  <span>상품 합계</span>
                  <span>₩ {total.toLocaleString()}</span>
                </div>
                <div className="summary-row">
                  <span>배송비</span>
                  <span>{total >= 50000 ? '무료' : '₩ 3,000'}</span>
                </div>
                <div className="summary-row summary-total">
                  <span>총 결제금액</span>
                  <span>₩ {(total >= 50000 ? total : total + 3000).toLocaleString()}</span>
                </div>
                <button className="order-btn" onClick={handleOrder} disabled={ordering}>
                  {ordering ? '처리 중...' : '주문하기'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
