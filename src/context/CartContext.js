import React, { createContext, useState } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]); // Inicia vacío

  // Función para agregar al carrito
  const addToCart = (producto) => {
    setCart((prevCart) => {
      // Verifica si el producto ya está en el carrito
      const existe = prevCart.find(item => item.id === producto.id);
      if (existe) {
        // Si existe, le suma 1 a la cantidad
        return prevCart.map(item => 
          item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item
        );
      }
      // Si no existe, lo agrega con cantidad 1
      return [...prevCart, { ...producto, cantidad: 1 }];
    });
  };

  // Función para quitar un producto por completo
  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  // Función para sumar o restar cantidad (+ o -)
  const updateQuantity = (id, delta) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const nuevaCantidad = item.cantidad + delta;
        return { ...item, cantidad: nuevaCantidad > 0 ? nuevaCantidad : 1 }; // Evita que baje de 1
      }
      return item;
    }));
  };

  // Calcular el total a pagar
  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.precio_final * item.cantidad), 0);
  };

  // Contar cuántos artículos hay en total para el icono del Navbar
  const getCartCount = () => {
    return cart.reduce((count, item) => count + item.cantidad, 0);
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, getCartTotal, getCartCount }}>
      {children}
    </CartContext.Provider>
  );
};