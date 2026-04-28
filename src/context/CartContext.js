import React, { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import { useMessage } from "./MessageContext";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const { showMessage } = useMessage();

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
    if (!user) {
      showMessage({
        title: "Inicia sesión",
        message: "Debes iniciar sesión para agregar productos al carrito.",
        type: "warning",
      });
      return;
    }

    const existeProducto = cart.find((item) => item.id === product.id);

    if (existeProducto) {
      setCart((prevCart) =>
        prevCart.map((item) =>
          item.id === product.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item,
        ),
      );

      showMessage({
        title: "Cantidad actualizada",
        message: `Se agregó otra unidad de ${product.nombre} al carrito.`,
        type: "success",
      });

      return;
    }

    setCart((prevCart) => [...prevCart, { ...product, cantidad: 1 }]);

    showMessage({
      title: "Producto agregado",
      message: `${product.nombre} fue agregado al carrito correctamente.`,
      type: "success",
    });
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));

    showMessage({
      title: "Producto eliminado",
      message: "El producto fue eliminado del carrito.",
      type: "info",
    });
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

    showMessage({
      title: "Carrito vacío",
      message: "Se eliminaron todos los productos del carrito.",
      type: "info",
    });
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
