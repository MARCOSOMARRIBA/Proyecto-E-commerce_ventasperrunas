import React, { useContext, useEffect, useMemo, useState } from "react";
import { FaSearch, FaShoppingCart } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import { CartContext } from "../context/CartContext";

const API_PRODUCTOS = "http://127.0.0.1:8000/api/productos/";

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

        const respuesta = await fetch(API_PRODUCTOS);
        const data = await respuesta.json();

        if (!respuesta.ok) {
          throw new Error("No se pudieron cargar los productos.");
        }

        setProductos(data);
      } catch (error) {
        console.error(error);
        setError("Ocurrió un error al buscar productos.");
      } finally {
        setCargando(false);
      }
    };

    cargarProductos();
  }, []);

  const productosFiltrados = useMemo(() => {
    const texto = query.trim().toLowerCase();

    if (texto === "") {
      return [];
    }

    return productos.filter((producto) => {
      const camposBusqueda = [
        producto.id_producto,
        producto.nombre,
        producto.descripcion,
        producto.precio,
        producto.id_categoria,
      ]
        .join(" ")
        .toLowerCase();

      return camposBusqueda.includes(texto);
    });
  }, [productos, query]);

  const agregarAlCarrito = (producto) => {
    addToCart({
      id: producto.id_producto,
      nombre: producto.nombre,
      imagen: producto.imagen,
      precio_final: Number(producto.precio),
    });
  };

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
              const disponible = producto.activo && producto.stock;

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
                        src={
                          producto.imagen || "https://via.placeholder.com/300"
                        }
                        alt={producto.nombre}
                        className="search-product-img"
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
                      onClick={() => agregarAlCarrito(producto)}
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
