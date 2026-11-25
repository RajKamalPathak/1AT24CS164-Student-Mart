import { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from './ToastContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('student_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const { addToast } = useToast();

  useEffect(() => {
    localStorage.setItem('student_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, qty = 1) => {
    const existing = cartItems.find((item) => item.product === product._id);

    if (existing) {
      const newQty = Math.min(existing.qty + qty, product.stock || 99);
      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.product === product._id ? { ...item, qty: newQty } : item
        )
      );
      addToast(`Updated quantity for "${product.name}" (${newQty})`, 'info');
    } else {
      setCartItems((prevItems) => [
        ...prevItems,
        {
          product: product._id,
          name: product.name,
          price: product.price,
          originalPrice: product.originalPrice,
          image: product.image,
          category: product.category,
          stock: product.stock,
          qty: Math.min(qty, product.stock || 1),
        },
      ]);
      addToast(`Added "${product.name}" to cart!`, 'success');
    }
  };

  const updateQty = (productId, qty) => {
    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.product === productId) {
          const clampedQty = Math.min(qty, item.stock || 99);
          return { ...item, qty: clampedQty };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId) => {
    const target = cartItems.find((item) => item.product === productId);
    setCartItems((prev) => prev.filter((item) => item.product !== productId));
    if (target) {
      addToast(`Removed "${target.name}" from cart`, 'info');
    }
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const totalItems = cartItems.reduce((acc, item) => acc + item.qty, 0);
  const itemsPrice = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  // Free delivery for orders above ₹299
  const deliveryFee = itemsPrice >= 299 || itemsPrice === 0 ? 0 : 30;
  const totalPrice = itemsPrice + deliveryFee;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        totalItems,
        itemsPrice,
        deliveryFee,
        totalPrice,
        addToCart,
        updateQty,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
