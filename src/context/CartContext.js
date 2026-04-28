import React, { createContext, useContext, useState, useEffect } from 'react';
import { cartAPI } from '../api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    if (user) fetchCart();
    else { setCartItems([]); setCartCount(0); }
  }, [user]);

  const fetchCart = async () => {
    try {
      const res = await cartAPI.get();
      setCartItems(res.data.items || []);
      setCartCount(res.data.totalCount || 0);
    } catch { setCartItems([]); setCartCount(0); }
  };

  const addToCart = async (productId, quantity = 1) => {
    await cartAPI.add(productId, quantity);
    await fetchCart();
  };

  const updateQuantity = async (cartItemId, quantity) => {
    await cartAPI.update(cartItemId, quantity);
    await fetchCart();
  };

  const removeItem = async (cartItemId) => {
    await cartAPI.remove(cartItemId);
    await fetchCart();
  };

  const clearCart = async () => {
    await cartAPI.clear();
    setCartItems([]);
    setCartCount(0);
  };

  return (
    <CartContext.Provider value={{ cartItems, cartCount, addToCart, updateQuantity, removeItem, clearCart, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
