import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [lang, setLang] = useState('KOR');

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">kairos</Link>

        <div className="navbar-links">
          <Link to="/shop">SHOP</Link>
          <Link to="/info">INFO</Link>
        </div>

        <div className="navbar-right">
          <button className="navbar-lang" onClick={() => setLang(lang === 'KOR' ? 'ENG' : 'KOR')}>
            {lang}
          </button>
          {user ? (
            <>
              <Link to="/mypage">MY</Link>
              <button className="navbar-link-btn" onClick={handleLogout}>LOGOUT</button>
            </>
          ) : (
            <Link to="/login">LOGIN</Link>
          )}
          <Link to="/cart">CART({cartCount})</Link>
        </div>
      </div>
    </nav>
  );
}