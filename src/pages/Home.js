import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productAPI } from '../api';
import './Home.css';

export default function Home() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
  productAPI.getAll({ page: 0, size: 3 })
    .then(res => {
      const data = res.data;
      // Page 객체일 경우 content 추출
      if (data && data.content) {
        setProducts(data.content);
      } else if (Array.isArray(data)) {
        setProducts(data);
      } else {
        setProducts([]);
      }
    })
    .catch(() => setProducts([]));
}, []);

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-image-wrap">
          <img src="/kairos-main.jpg" alt="kairos hero" className="hero-img" />
        </div>
        <div className="hero-card">
          <h1 className="hero-title">더 나은 움직임을 위한<br />일상의 파트너</h1>
          <p className="hero-sub">나에게 꼭 맞는 프리미엄 운동 기구를 만나보세요.</p>
          <Link to="/shop" className="hero-btn">바로가기 →</Link>
        </div>
      </section>

      <section className="home-featured">
        <h2 className="section-title">NEW ARRIVALS</h2>
        <div className="featured-grid">
          {products.length === 0 ? (
            [1, 2, 3].map(i => (
              <div key={i} className="featured-card">
                <div className="featured-img-placeholder" />
                <div className="featured-info">
                  <span className="featured-name">Product {i}</span>
                  <span className="featured-price">₩ 00,000</span>
                </div>
              </div>
            ))
          ) : (
            products.map(product => (
              <Link to={`/shop/${product.id}`} key={product.id} className="featured-card">
                <div className="featured-img-wrap">
                  {product.imageUrl
                    ? <img src={product.imageUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div className="featured-img-placeholder" />
                  }
                </div>
                <div className="featured-info">
                  <span className="featured-name">{product.name}</span>
                  <span className="featured-price">₩ {product.price?.toLocaleString()}</span>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>

      <section className="home-brand">
        <div className="brand-text">
          <h2>움직임의 순간,<br />카이로스</h2>
          <p>kairos는 그리스어로 '결정적인 순간'을 뜻합니다.<br />운동의 모든 순간이 특별해지도록, 최고의 기구를 선별합니다.</p>
          <Link to="/info" className="brand-link">브랜드 스토리 →</Link>
        </div>
      </section>
    </div>
  );
}