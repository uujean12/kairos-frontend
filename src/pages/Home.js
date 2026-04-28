import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

export default function Home() {
  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-image-wrap">
          <img src="/kairos-main.jpg" alt="kairos hero" className="hero-img" />
        </div>
        <div className="hero-card">
          <h1 className="hero-title">
            더 나은 움직임을 위한<br />일상의 파트너
          </h1>
          <p className="hero-sub">나에게 꼭 맞는 프리미엄 운동 기구를 만나보세요.</p>
          <Link to="/shop" className="hero-btn">바로가기 →</Link>
        </div>
      </section>

      {/* Featured Products */}
      <section className="home-featured">
        <h2 className="section-title">NEW ARRIVALS</h2>
        <div className="featured-grid">
          {[1, 2, 3].map((i) => (
            <Link to="/shop" key={i} className="featured-card">
              <div className="featured-img-placeholder" />
              <div className="featured-info">
                <span className="featured-name">Product {i}</span>
                <span className="featured-price">₩ 00,000</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Brand Section */}
      <section className="home-brand">
        <div className="brand-text">
          <h2>움직임의 순간,<br />카이로스</h2>
          <p>
            kairos는 그리스어로 '결정적인 순간'을 뜻합니다.<br />
            운동의 모든 순간이 특별해지도록, 최고의 기구를 선별합니다.
          </p>
          <Link to="/info" className="brand-link">브랜드 스토리 →</Link>
        </div>
      </section>
    </div>
  );
}
