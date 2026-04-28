import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productAPI } from '../api';
import { useCart } from '../context/CartContext';
import './Shop.css';

const CATEGORIES = ['ALL', 'PILATES', 'YOGA', 'FITNESS', 'RECOVERY'];

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('ALL');
  const [error, setError] = useState('');
  const { addToCart } = useCart();

  useEffect(() => {
    fetchProducts();
  }, [category]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = category === 'ALL'
        ? await productAPI.getAll()
        : await productAPI.getByCategory(category);
      setProducts(res.data.content || res.data || []);
    } catch {
      setError('상품을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (e, productId) => {
    e.preventDefault();
    try {
      await addToCart(productId, 1);
      alert('장바구니에 추가되었습니다.');
    } catch {
      alert('로그인이 필요합니다.');
    }
  };

  return (
    <div className="shop-page">
      <div className="shop-header">
        <h1>SHOP</h1>
        <div className="category-filter">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              className={`cat-btn ${category === c ? 'active' : ''}`}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="shop-error">{error}</p>}

      {loading ? (
        <div className="shop-loading">
          <div className="loading-dots"><span /><span /><span /></div>
        </div>
      ) : (
        <div className="product-grid">
          {products.length === 0 ? (
            <p className="shop-empty">등록된 상품이 없습니다.</p>
          ) : (
            products.map((product) => (
              <Link to={`/shop/${product.id}`} key={product.id} className="product-card">
                <div className="product-img-wrap">
                  {product.imageUrl
                    ? <img src={product.imageUrl} alt={product.name} />
                    : <div className="product-img-placeholder" />
                  }
                  <button
                    className="quick-add"
                    onClick={(e) => handleAddToCart(e, product.id)}
                  >
                    ADD TO CART
                  </button>
                </div>
                <div className="product-info">
                  <span className="product-category">{product.category}</span>
                  <span className="product-name">{product.name}</span>
                  <span className="product-price">₩ {product.price?.toLocaleString()}</span>
                  {product.stock === 0 && <span className="out-of-stock">품절</span>}
                </div>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
