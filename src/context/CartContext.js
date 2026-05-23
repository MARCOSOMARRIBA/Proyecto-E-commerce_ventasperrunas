import React, { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import { useMessage } from "./MessageContext";

export const CartContext = createContext();

const API_BASE = "https://proyecto-e-commerce-ventasperrunas.onrender.com";

export const CartProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const { showMessage } = useMessage();

  // 🔥 INICIALIZACIÓN CON PERSISTENCIA
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem("cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });
  
  const [cartReady, setCartReady] = useState(false);

  // Guardar en localStorage cada vez que el carrito cambia
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const fetchCart = async () => {
    if (!user) return;
    try {
      const res = await fetch(`${API_BASE}/api/cart/${user.id}/`);
      if (!res.ok) throw new Error("Error en servidor");
      const data = await res.json();
      setCart(data);
    } catch (error) {
      console.error("Error cargando carrito:", error);
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

  const addToCart = async (product) => {
    if (!user) {
      showMessage({ title: "Inicia sesión", message: "Debes iniciar sesión para comprar.", type: "warning" });
      return;
    }

    if (user.rol === "2" || user.rol === "3" || user.rol === "4") {
      showMessage({ title: "Acción Denegada ⚠️", message: "Modo Auditoría.", type: "error" });
      return;
    }

    const productId = product.id_producto || product.id;
    
    // UI Optimista
    setCart((prevCart) => {
      const existe = prevCart.find((item) => item.id === productId);
      if (existe) {
        return prevCart.map((item) => item.id === productId ? { ...item, cantidad: item.cantidad + 1 } : item);
      }
      return [...prevCart, { id: productId, nombre: product.nombre, precio: Number(product.precio ?? 0), cantidad: 1, imagen: product.imagen }];
    });

    try {
      await fetch(`${API_BASE}/api/cart/agregar/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_usuario: user.id, id_producto: productId, cantidad: 1 }),
      });
    } catch (error) {
      fetchCart(); // Recuperar si falla
    }
  };

  const removeFromCart = async (id_producto) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id_producto));
    try {
      await fetch(`${API_BASE}/api/cart/eliminar/${user.id}/${id_producto}/`, { method: "DELETE" });
    } catch (error) { fetchCart(); }
  };

  const updateQuantity = async (id_producto, qty) => {
    setCart((prev) => prev.map(item => item.id === id_producto ? {...item, cantidad: qty} : item));
    try {
      await fetch(`${API_BASE}/api/cart/actualizar/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_usuario: user.id, id_producto: id_producto, cantidad: qty }),
      });
    } catch (error) { fetchCart(); }
  };

  const incrementQuantity = (id_producto, amount) => {
    const item = cart.find((p) => p.id === id_producto);
    if (!item) return;
    const nuevaCantidad = item.cantidad + amount;
    if (nuevaCantidad < 1) return;
    updateQuantity(id_producto, nuevaCantidad);
  };

  const clearCart = async () => {
    setCart([]);
    try {
      await fetch(`${API_BASE}/api/cart/limpiar/${user.id}/`, { method: "DELETE" });
    } catch (error) { fetchCart(); }
  };

  const getCartTotal = () => cart.reduce((total, item) => total + parseFloat(item.precio || 0) * parseInt(item.cantidad || 0), 0);
  const getCartCount = () => cart.reduce((total, item) => total + item.cantidad, 0);

  return (
    <CartContext.Provider value={{ cart, cartReady, addToCart, removeFromCart, updateQuantity, incrementQuantity, clearCart, getCartTotal, getCartCount }}>
      {children}
    </CartContext.Provider>
  );
};