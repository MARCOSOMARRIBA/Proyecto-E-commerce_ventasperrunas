import React, { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import { useMessage } from "./MessageContext";

export const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const { showMessage } = useMessage();

  const [favorites, setFavorites] = useState([]);
  const [favoritesReady, setFavoritesReady] = useState(false);

  const getFavoritesStorageKey = () => {
    if (!user) return null;
    return `favoritos_mascotas_${user.id}`;
  };

  useEffect(() => {
    if (!user) {
      setFavorites([]);
      setFavoritesReady(false);
      return;
    }

    const storageKey = getFavoritesStorageKey();
    const favoritosGuardados = localStorage.getItem(storageKey);

    if (favoritosGuardados) {
      try {
        setFavorites(JSON.parse(favoritosGuardados));
      } catch (error) {
        localStorage.removeItem(storageKey);
        setFavorites([]);
      }
    } else {
      setFavorites([]);
    }

    setFavoritesReady(true);
  }, [user]);

  useEffect(() => {
    if (!user || !favoritesReady) return;

    const storageKey = getFavoritesStorageKey();
    localStorage.setItem(storageKey, JSON.stringify(favorites));
  }, [favorites, user, favoritesReady]);

  const normalizarProducto = (producto) => {
    return {
      id: producto.id_producto || producto.id,
      nombre: producto.nombre,
      imagen: producto.imagen,
      descripcion: producto.descripcion,
      precio_final: Number(producto.precio || producto.precio_final || 0),
      activo: producto.activo,
      stock: producto.stock,
    };
  };

  const isFavorite = (productId) => {
    return favorites.some((item) => String(item.id) === String(productId));
  };

  const toggleFavorite = (producto) => {
    if (!user) {
      showMessage({
        title: "Inicia sesión",
        message: "Debes iniciar sesión para guardar productos en favoritos.",
        type: "warning",
      });
      return;
    }

    // =================================================================
    // 🛡️ LÓGICA DE SEGURIDAD RBAC (Bloqueo para personal interno)
    // =================================================================
    if (user.rol !== '1') {
      showMessage({
        title: "Modo Auditoría",
        message: "Esta función es exclusiva para cuentas de clientes.",
        type: "warning",
      });
      return; // Detenemos la ejecución aquí
    }
    // =================================================================

    const productoNormalizado = normalizarProducto(producto);
    const yaExiste = isFavorite(productoNormalizado.id);

    if (yaExiste) {
      setFavorites((prev) =>
        prev.filter(
          (item) => String(item.id) !== String(productoNormalizado.id),
        ),
      );

      showMessage({
        title: "Eliminado de favoritos",
        message: `${productoNormalizado.nombre} fue eliminado de tus favoritos.`,
        type: "info",
      });

      return;
    }

    setFavorites((prev) => [...prev, productoNormalizado]);

    showMessage({
      title: "Agregado a favoritos",
      message: `${productoNormalizado.nombre} fue guardado en tus favoritos.`,
      type: "success",
    });
  };

  const removeFavorite = (productId) => {
    setFavorites((prev) =>
      prev.filter((item) => String(item.id) !== String(productId)),
    );

    showMessage({
      title: "Favorito eliminado",
      message: "El producto fue eliminado de tus favoritos.",
      type: "info",
    });
  };

  const clearFavorites = () => {
    setFavorites([]);

    if (user) {
      localStorage.removeItem(getFavoritesStorageKey());
    }

    showMessage({
      title: "Favoritos vacíos",
      message: "Se eliminaron todos tus productos favoritos.",
      type: "info",
    });
  };

  const getFavoritesCount = () => {
    return favorites.length;
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        toggleFavorite,
        removeFavorite,
        clearFavorites,
        isFavorite,
        getFavoritesCount,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};