import React, { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import { useMessage } from "./MessageContext";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const { showMessage } = useMessage();

  const [cart, setCart] = useState([]);
  const [cartReady, setCartReady] = useState(false);

  // 🔥 CARGAR CARRITO SOLO AL INICIO
  const fetchCart = async () => {
    if (!user) return;

    try {
      const res = await fetch(`http://localhost:8000/api/cart/${user.id}/`);

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

  // 🛒 AGREGAR PRODUCTO (UI OPTIMISTA)
  const addToCart = async (product) => {
    if (!user) {
      showMessage({
        title: "Inicia sesión",
        message: "Debes iniciar sesión para comprar.",
        type: "warning",
      });

      return;
    }

    // 🛑 BLOQUEO PARA EMPLEADOS / ADMINS / PROVEEDORES
    if (user.rol === "2" || user.rol === "3" || user.rol === "4") {
      showMessage({
        title: "Acción Denegada ⚠️",
        message:
          "Modo Auditoría: Las cuentas de empleados, administradores y proveedores no tienen permitido realizar compras.",
        type: "error",
      });

      return;
    }

    const productId = product.id_producto || product.id;

    // 🔥 ALERTA INSTANTÁNEA
    showMessage({
      title: "Producto agregado",
      message: `${product.nombre} agregado al carrito`,
      type: "success",
    });

    // 🔥 ACTUALIZACIÓN INSTANTÁNEA
    setCart((prevCart) => {
      const existe = prevCart.find((item) => item.id === productId);

      if (existe) {
        return prevCart.map((item) =>
          item.id === productId
            ? {
                ...item,
                cantidad: item.cantidad + 1,

                // 🔥 MANTENER PRECIO CORRECTO
                precio: Number(
                  item.precio ??
                    product.precio ??
                    product.precio_final ??
                    product.precio_unitario ??
                    0,
                ),
              }
            : item,
        );
      }

      return [
        ...prevCart,
        {
          id: productId,
          nombre: product.nombre,

          // 🔥 PRECIO COMPATIBLE CON TODAS LAS VISTAS
          precio: Number(
            product.precio ??
              product.precio_final ??
              product.precio_unitario ??
              0,
          ),

          cantidad: 1,

          imagen:
            product.imagen ||
            "https://via.placeholder.com/500x500.png?text=Sin+Imagen",
        },
      ];
    });

    // 🔥 BACKEND EN SEGUNDO PLANO
    try {
      await fetch("http://localhost:8000/api/cart/agregar/", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          id_usuario: user.id,
          id_producto: productId,
          cantidad: 1,
        }),
      });
    } catch (error) {
      console.error("Error agregando producto:", error);

      // 🔥 RECUPERAR SI FALLA
      fetchCart();
    }
  };

  // ❌ ELIMINAR PRODUCTO (UI OPTIMISTA)
  const removeFromCart = async (id_producto) => {
    // 🔥 ELIMINAR INSTANTÁNEAMENTE
    setCart((prevCart) => prevCart.filter((item) => item.id !== id_producto));

    showMessage({
      title: "Producto eliminado",
      message: "El producto fue eliminado del carrito.",
      type: "info",
    });

    try {
      await fetch(
        `http://localhost:8000/api/cart/eliminar/${user.id}/${id_producto}/`,
        {
          method: "DELETE",
        },
      );
    } catch (error) {
      console.error("Error eliminando producto:", error);

      // 🔥 RECUPERAR SI FALLA
      fetchCart();
    }
  };

  // 🔄 ACTUALIZAR CANTIDAD (UI OPTIMISTA)
  const updateQuantity = async (id_producto, qty) => {
    // 🔥 MANTENER ORDEN ORIGINAL
    setCart((prevCart) => {
      const updatedCart = [...prevCart];

      const index = updatedCart.findIndex((item) => item.id === id_producto);

      if (index !== -1) {
        updatedCart[index] = {
          ...updatedCart[index],
          cantidad: qty,
        };
      }

      return updatedCart;
    });

    try {
      await fetch("http://localhost:8000/api/cart/actualizar/", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          id_usuario: user.id,
          id_producto: id_producto,
          cantidad: qty,
        }),
      });
    } catch (error) {
      console.error("Error actualizando cantidad:", error);

      fetchCart();
    }
  };

  // ➕➖ SUMAR / RESTAR
  const incrementQuantity = (id_producto, amount) => {
    const item = cart.find((p) => p.id === id_producto);

    if (!item) return;

    const nuevaCantidad = item.cantidad + amount;

    if (nuevaCantidad < 1) return;

    updateQuantity(id_producto, nuevaCantidad);
  };

  // 🧹 LIMPIAR CARRITO
  const clearCart = async () => {
    // 🔥 LIMPIAR INSTANTÁNEAMENTE
    setCart([]);

    try {
      await fetch(`http://localhost:8000/api/cart/limpiar/${user.id}/`, {
        method: "DELETE",
      });

      showMessage({
        title: "Carrito limpio",
        message: "Todos los productos fueron eliminados.",
        type: "info",
      });
    } catch (error) {
      console.error("Error limpiando carrito:", error);

      fetchCart();
    }
  };

  // 💰 TOTAL
  const getCartTotal = () =>
    cart.reduce(
      (total, item) =>
        total + parseFloat(item.precio || 0) * parseInt(item.cantidad || 0),
      0,
    );

  // 🛒 TOTAL DE PRODUCTOS
  const getCartCount = () =>
    cart.reduce((total, item) => total + item.cantidad, 0);

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
