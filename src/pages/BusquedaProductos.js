import React, { useContext, useEffect, useMemo, useState } from "react";
import { FaSearch, FaShoppingCart } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import { api } from "../api/client";
import { CartContext } from "../context/CartContext";
import {
  getProductImage,
  isProductAvailable,
  searchProducts,
  toCartProduct,
} from "../utils/products";

const BusquedaProductos = () => {
  const location = useLocation();
  const { addToCart } = useContext(CartContext);

  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const query = new URLSearchParams(location.search).get("q") || "";

  useEffect(() => {
    const cargarProductos = async () => {
      try {
        setCargando(true);
        setError("");

        const data = await api.productos.list();
        setProductos(data);
      } catch (err) {
        console.error(err);
        setError(err.message || "Ocurrió un error al buscar productos.");
      } finally {
        setCargando(false);
      }
    };

    cargarProductos();
  }, []);

  const productosFiltrados = useMemo(
    () => searchProducts(productos, query),
    [productos, query],
  );

  return (
    <main className="search-page">
      <section className="search-page-header">
        <div>
          <h1>
            <FaSearch /> Resultados de búsqueda
          </h1>
          <p>
            Buscando productos relacionados con: <strong>"{query}"</strong>
          </p>
        </div>
      </section>

      {cargando && (
        <div className="search-state">
          <p>Cargando productos...</p>
        </div>
      )}

      {error && (
        <div className="search-state search-error">
          <p>{error}</p>
        </div>
      )}

      {!cargando && !error && productosFiltrados.length === 0 && (
        <div className="search-state">
          <h2>No se encontraron productos</h2>
          <p>
            Intenta buscar con otra palabra, por ejemplo: croquetas, alimento,
            juguetes o accesorios.
          </p>
        </div>
      )}

      {!cargando && !error && productosFiltrados.length > 0 && (
        <>
          <p className="search-results-count">
            Se encontraron {productosFiltrados.length} producto(s).
          </p>

          <section className="search-products-grid">
            {productosFiltrados.map((producto) => {
              const disponible = isProductAvailable(producto);

              return (
                <article
                  className="search-product-card"
                  key={producto.id_producto}
                >
                  <Link
                    to={`/producto/${producto.id_producto}`}
                    className="producto-link-detalle"
                  >
                    <div className="search-product-img-box">
                      <img
                        src={getProductImage(producto, "300x300")}
                        alt={producto.nombre}
                        className="search-product-img"
                        onError={(e) => {
                          e.currentTarget.src = getProductImage(null, "300x300");
                        }}
                      />
                    </div>
                  </Link>

                  <div className="search-product-info">
                    <Link
                      to={`/producto/${producto.id_producto}`}
                      className="producto-link-detalle"
                    >
                      <h3>{producto.nombre}</h3>
                    </Link>

                    <p className="search-product-description">
                      {producto.descripcion || "Producto para mascotas."}
                    </p>

                    <p className="search-product-price">
                      ${Number(producto.precio || 0).toFixed(2)}
                    </p>

                    <button
                      className="search-add-cart-btn"
                      onClick={() => addToCart(toCartProduct(producto))}
                      disabled={!disponible}
                    >
                      <FaShoppingCart />{" "}
                      {disponible ? "Agregar al carrito" : "No disponible"}
                    </button>

                    <Link
                      to={`/producto/${producto.id_producto}`}
                      className="btn-ver-detalle-producto mt-2"
                    >
                      Ver información
                    </Link>
                  </div>
                </article>
              );
            })}
          </section>
        </>
      )}
    </main>
  );
};

export default BusquedaProductos;
