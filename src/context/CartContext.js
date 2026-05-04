import React, { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import { useMessage } from "./MessageContext";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const { showMessage } = useMessage();

  const [cart, setCart] = useState([]);
  const [cartReady, setCartReady] = useState(false);

  // 🔥 CARGAR CARRITO
  const fetchCart = async () => {
    if (!user) return;

    try {
      const res = await fetch(`http://localhost:8000/api/carrito/${user.id}/`);

      if (!res.ok) {
        console.error("ERROR BACKEND:", await res.text());
        setCart([]);
        return;
      }
      const data = await res.json();

      console.log("CARRITO:", data);

      setCart(data);
    } catch (error) {
      console.error("Error cargando carrito:", error);
      setCart([]);
    } finally {
      setCartReady(true);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setCart([]);
      setCartReady(false);
    }
  }, [user]);

  // 🛒 AGREGAR
  const addToCart = async (product) => {
    if (!user) {
      showMessage({
        title: "Inicia sesión",
        message: "Debes iniciar sesión para comprar.",
        type: "warning",
      });
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/api/carrito/agregar/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_usuario: user.id,
          id_producto: product.id_producto || product.id,
          cantidad: 1,
        }),
      });

      const data = await res.json();
      console.log("RESPUESTA:", data);

      fetchCart();

      showMessage({
        title: "Producto agregado",
        message: `${product.nombre} agregado al carrito`,
        type: "success",
      });
    } catch (error) {
      console.error(error);
    }
  };

  // ❌ ELIMINAR
  const removeFromCart = async (id) => {
    await fetch(
      `http://localhost:8000/api/carrito/eliminar/${user.id}/${id}/`,
      { method: "DELETE" },
    );

    fetchCart();
  };

  // 🔄 ACTUALIZAR
  const updateQuantity = async (id, qty) => {
    await fetch(`http://localhost:8000/api/carrito/actualizar/`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id_usuario: user.id,
        id_producto: id,
        cantidad: qty,
      }),
    });

    fetchCart();
  };

  // ➕➖
  const incrementQuantity = (id, amount) => {
    const item = cart.find((p) => p.id === id);
    if (!item) return;

    updateQuantity(id, item.cantidad + amount);
  };

  // 🧹 LIMPIAR
  const clearCart = async () => {
    await fetch(`http://localhost:8000/api/carrito/limpiar/${user.id}/`, {
      method: "DELETE",
    });

    setCart([]);
  };

  const getCartTotal = () =>
    cart.reduce((t, p) => t + p.precio * p.cantidad, 0);

  const getCartCount = () => cart.reduce((t, p) => t + p.cantidad, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        cartReady,
        addToCart,
        removeFromCart,
        updateQuantity,
        incrementQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
