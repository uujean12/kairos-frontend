import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productAPI } from '../api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './ProductDetail.css';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    productAPI.getById(id)
      .then(res => setProduct(res.data))
      .catch(() => navigate('/shop'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleAddToCart = async () => {
    if (!user) { navigate('/login'); return; }
    try {
      await addToCart(product.id, quantity);
      setMsg('장바구니에 추가되었습니다.');
      setTimeout(() => setMsg(''), 3000);
    } catch { setMsg('오류가 발생했습니다.'); }
  };

  const handleOrder = async () => {
    if (!user) { navigate('/login'); return; }
    await addToCart(product.id, quantity);
    navigate('/cart');
  };

  if (loading) return <div className="detail-loading">Loading...</div>;
  if (!product) return null;

  return (
    <div className="detail-page">
      <div className="detail-inner">
        <div className="detail-img-wrap">
          {product.imageUrl
            ? <img src={product.imageUrl} alt={product.name} />
            : <div className="detail-img-placeholder" />
          }
        </div>

        <div className="detail-info">
          <span className="detail-category">{product.category}</span>
          <h1 className="detail-name">{product.name}</h1>
          <p className="detail-price">₩ {product.price?.toLocaleString()}</p>
          <div className="detail-divider" />
          <p className="detail-desc">{product.description}</p>

          <div className="detail-stock">
            재고: {product.stock > 0 ? `${product.stock}개` : '품절'}
          </div>

          <div className="detail-qty">
            <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>−</button>
            <span>{quantity}</span>
            <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}>＋</button>
          </div>

          {msg && <p className="detail-msg">{msg}</p>}

          <div className="detail-actions">
            <button
              className="btn-cart"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
            >
              장바구니 담기
            </button>
            <button
              className="btn-order"
              onClick={handleOrder}
              disabled={product.stock === 0}
            >
              바로 구매
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
