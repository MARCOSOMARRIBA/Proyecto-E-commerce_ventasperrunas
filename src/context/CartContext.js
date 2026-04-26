import React, { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useContext(AuthContext);

  const [cart, setCart] = useState([]);
  const [cartReady, setCartReady] = useState(false);

  const getCartStorageKey = () => {
    if (!user) return null;
    return `carrito_mascotas_${user.id}`;
  };

  // Cargar el carrito del usuario cuando inicia sesión
  useEffect(() => {
    if (!user) {
      setCart([]);
      setCartReady(false);
      return;
    }

    const storageKey = `carrito_mascotas_${user.id}`;
    const carritoGuardado = localStorage.getItem(storageKey);

    if (carritoGuardado) {
      setCart(JSON.parse(carritoGuardado));
    } else {
      setCart([]);
    }

    setCartReady(true);
  }, [user]);

  // Guardar el carrito del usuario cada vez que cambie
  useEffect(() => {
    if (!user || !cartReady) return;

    const storageKey = getCartStorageKey();
    localStorage.setItem(storageKey, JSON.stringify(cart));
  }, [cart, user, cartReady]);

  const addToCart = (product) => {
    setCart((prevCart) => {
      const existeProducto = prevCart.find((item) => item.id === product.id);

      if (existeProducto) {
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item,
        );
      }

      return [...prevCart, { ...product, cantidad: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId ? { ...item, cantidad: newQuantity } : item,
      ),
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const getCartTotal = () => {
    return cart.reduce(
      (total, item) => total + Number(item.precio_final) * item.cantidad,
      0,
    );
  };

  const getCartCount = () => {
    return cart.reduce((total, item) => total + item.cantidad, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
