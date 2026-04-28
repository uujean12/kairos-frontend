import React from 'react';
import './Info.css';

export default function Info() {
  return (
    <div className="info-page">
      <div className="info-inner">
        <section className="info-section">
          <h2>CONTACT</h2>
          <div className="info-block">
            <h3>Customer Service</h3>
            <ul>
              <li>Email</li>
              <li>kairos@gmail.com</li>
              <li>Hours</li>
              <li>Mon - Fri 10AM - 5PM</li>
            </ul>
          </div>
        </section>

        <section className="info-section">
          <h2>ABOUT</h2>
          <div className="info-block">
            <p>
              kairos는 그리스어로 '결정적인 순간'을 의미합니다.<br /><br />
              운동의 모든 순간이 특별해질 수 있도록,<br />
              엄선된 프리미엄 운동 기구를 제공합니다.<br /><br />
              필라테스, 요가, 피트니스 등 다양한 종목의 용품을<br />
              체계적으로 분류하여 최적의 쇼핑 경험을 선사합니다.
            </p>
          </div>
        </section>

        <section className="info-section">
          <h2>SHIPPING & RETURNS</h2>
          <div className="info-block">
            <ul>
              <li>5만원 이상 구매 시 무료 배송</li>
              <li>5만원 미만 구매 시 배송비 3,000원</li>
              <li>수령 후 7일 이내 반품 가능</li>
              <li>제품 하자의 경우 30일 이내 교환/환불</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
