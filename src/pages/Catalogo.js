import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import {
  FaSearch,
  FaShoppingCart,
  FaFilter,
  FaDog,
  FaBoxOpen,
  FaTimes,
} from "react-icons/fa";
import { FiStar, FiAlertCircle } from "react-icons/fi";
import { api } from "../api/client";
import { CartContext } from "../context/CartContext";
import {
  createSlug,
  getProductCategoryId,
  getProductImage,
  isProductAvailable,
  normalizeText,
  toCartProduct,
} from "../utils/products";

const Catalogo = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart } = useContext(CartContext);

  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [textoBusqueda, setTextoBusqueda] = useState("");
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("todas");
  const [soloDisponibles, setSoloDisponibles] = useState(false);
  const [orden, setOrden] = useState("recientes");

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setCargando(true);
        setError("");

        const [dataProductos, dataCategorias] = await Promise.all([
          api.productos.list(),
          api.categorias.list(),
        ]);

        setProductos(dataProductos);
        setCategorias(dataCategorias);
      } catch (err) {
        console.error(err);
        setError(err.message || "Ocurrió un error al cargar el catálogo.");
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, []);

  useEffect(() => {
    const categoriaQuery = searchParams.get("categoria");

    if (categoriaQuery) {
      setCategoriaSeleccionada(categoriaQuery);
      return;
    }

    const partesRuta = location.pathname.split("/").filter(Boolean);
    const categoriaDesdeRuta = partesRuta[1];

    if (!categoriaDesdeRuta || categorias.length === 0) {
      setCategoriaSeleccionada("todas");
      return;
    }

    const categoriaEncontrada = categorias.find(
      (cat) => createSlug(cat.nombre) === createSlug(categoriaDesdeRuta),
    );

    setCategoriaSeleccionada(
      categoriaEncontrada ? String(categoriaEncontrada.id_categoria) : "todas",
    );
  }, [searchParams, location.pathname, categorias]);

  const cambiarCategoria = (idCategoria) => {
    setCategoriaSeleccionada(idCategoria);

    if (idCategoria === "todas") {
      setSearchParams({});
      navigate("/tienda");
      return;
    }

    setSearchParams({ categoria: idCategoria });
  };

  const limpiarFiltros = () => {
    setTextoBusqueda("");
    setCategoriaSeleccionada("todas");
    setSoloDisponibles(false);
    setOrden("recientes");
    setSearchParams({});
    navigate("/tienda");
  };

  const productosFiltrados = useMemo(() => {
    let resultado = [...productos];
    const busqueda = normalizeText(textoBusqueda);

    if (busqueda) {
      resultado = resultado.filter((producto) => {
        const textoProducto = normalizeText(
          [
            producto.id_producto,
            producto.nombre,
            producto.descripcion,
            producto.precio,
          ].join(" "),
        );

        return textoProducto.includes(busqueda);
      });
    }

    if (categoriaSeleccionada !== "todas") {
      resultado = resultado.filter(
        (producto) =>
          String(getProductCategoryId(producto)) ===
          String(categoriaSeleccionada),
      );
    }

    if (soloDisponibles) {
      resultado = resultado.filter(isProductAvailable);
    }

    const ordenadores = {
      "precio-menor": (a, b) => Number(a.precio) - Number(b.precio),
      "precio-mayor": (a, b) => Number(b.precio) - Number(a.precio),
      "nombre-az": (a, b) => a.nombre.localeCompare(b.nombre),
      "nombre-za": (a, b) => b.nombre.localeCompare(a.nombre),
    };

    if (ordenadores[orden]) {
      resultado.sort(ordenadores[orden]);
    }

    return resultado;
  }, [productos, textoBusqueda, categoriaSeleccionada, soloDisponibles, orden]);

  const obtenerNombreCategoria = (idCategoria) => {
    const categoria = categorias.find(
      (cat) => String(cat.id_categoria) === String(idCategoria),
    );

    return categoria ? categoria.nombre : "Sin categoría";
  };

  return (
    <main className="catalogo-page">
      <section className="catalogo-hero">
        <div>
          <span className="catalogo-etiqueta">
            <FaDog /> Tienda de mascotas
          </span>
          <h1>Catálogo de productos</h1>
          <p>
            Explora alimentos, juguetes, accesorios y productos para consentir a
            tus mascotas.
          </p>
        </div>
      </section>

      <section className="catalogo-layout">
        <aside className="catalogo-filtros">
          <div className="catalogo-filtros-header">
            <h3>
              <FaFilter /> Filtros
            </h3>

            <button className="catalogo-limpiar-btn" onClick={limpiarFiltros}>
              <FaTimes /> Limpiar
            </button>
          </div>

          <div className="catalogo-buscador">
            <FaSearch />
            <input
              type="text"
              placeholder="Buscar producto..."
              value={textoBusqueda}
              onChange={(e) => setTextoBusqueda(e.target.value)}
            />
          </div>

          <div className="catalogo-filtro-grupo">
            <h4>Categorías</h4>

            <button
              className={`catalogo-categoria-btn ${
                categoriaSeleccionada === "todas" ? "active" : ""
              }`}
              onClick={() => cambiarCategoria("todas")}
            >
              Todas las categorías
            </button>

            {categorias.map((cat) => (
              <button
                key={cat.id_categoria}
                className={`catalogo-categoria-btn ${
                  String(categoriaSeleccionada) === String(cat.id_categoria)
                    ? "active"
                    : ""
                }`}
                onClick={() => cambiarCategoria(String(cat.id_categoria))}
              >
                {cat.nombre}
              </button>
            ))}
          </div>

          <div className="catalogo-filtro-grupo">
            <h4>Disponibilidad</h4>

            <label className="catalogo-check">
              <input
                type="checkbox"
                checked={soloDisponibles}
                onChange={(e) => setSoloDisponibles(e.target.checked)}
              />
              Mostrar solo disponibles
            </label>
          </div>

          <div className="catalogo-filtro-grupo">
            <h4>Ordenar por</h4>

            <select
              className="catalogo-select"
              value={orden}
              onChange={(e) => setOrden(e.target.value)}
            >
              <option value="recientes">Orden original</option>
              <option value="precio-menor">Precio: menor a mayor</option>
              <option value="precio-mayor">Precio: mayor a menor</option>
              <option value="nombre-az">Nombre: A - Z</option>
              <option value="nombre-za">Nombre: Z - A</option>
            </select>
          </div>
        </aside>

        <section className="catalogo-contenido">
          <div className="catalogo-topbar">
            <div>
              <h2>Productos</h2>
              <p>{productosFiltrados.length} producto(s) encontrado(s)</p>
            </div>
          </div>

          {cargando && (
            <div className="catalogo-estado">
              <FaBoxOpen size={42} />
              <h3>Cargando catálogo...</h3>
              <p>Consultando productos y categorías.</p>
            </div>
          )}

          {error && (
            <div className="catalogo-estado catalogo-error">
              <FiAlertCircle size={42} />
              <h3>Error al cargar catálogo</h3>
              <p>{error}</p>
            </div>
          )}

          {!cargando && !error && productosFiltrados.length === 0 && (
            <div className="catalogo-estado">
              <FaBoxOpen size={42} />
              <h3>No se encontraron productos</h3>
              <p>Prueba con otra categoría o limpia los filtros.</p>
            </div>
          )}

          {!cargando && !error && productosFiltrados.length > 0 && (
            <div className="catalogo-grid">
              {productosFiltrados.map((producto) => {
                const disponible = isProductAvailable(producto);

                return (
                  <article
                    className="catalogo-producto-card"
                    key={producto.id_producto}
                  >
                    <Link
                      to={`/producto/${producto.id_producto}`}
                      className="catalogo-producto-img-link"
                    >
                      <div className="catalogo-producto-img-box">
                        <img
                          src={getProductImage(producto)}
                          alt={producto.nombre}
                          onError={(e) => {
                            e.currentTarget.src = getProductImage(null);
                          }}
                        />

                        <span
                          className={`catalogo-producto-badge ${
                            disponible ? "disponible" : "agotado"
                          }`}
                        >
                          {disponible ? "Disponible" : "No disponible"}
                        </span>
                      </div>
                    </Link>

                    <div className="catalogo-producto-info">
                      <span className="catalogo-producto-categoria">
                        {obtenerNombreCategoria(
                          getProductCategoryId(producto),
                        )}
                      </span>

                      <Link
                        to={`/producto/${producto.id_producto}`}
                        className="catalogo-producto-nombre"
                      >
                        {producto.nombre}
                      </Link>

                      <p className="catalogo-producto-desc">
                        {producto.descripcion || "Producto para mascotas."}
                      </p>

                      <div className="catalogo-estrellas">
                        {[...Array(5)].map((_, index) => (
                          <FiStar key={index} />
                        ))}
                      </div>

                      <p className="catalogo-producto-precio">
                        ${Number(producto.precio || 0).toFixed(2)}
                      </p>

                      <div className="catalogo-producto-actions">
                        <button
                          className="catalogo-btn-carrito"
                          onClick={() => addToCart(toCartProduct(producto))}
                          disabled={!disponible}
                        >
                          <FaShoppingCart />
                          {disponible ? "Agregar" : "No disponible"}
                        </button>

                        <Link
                          to={`/producto/${producto.id_producto}`}
                          className="catalogo-btn-detalle"
                        >
                          Ver detalle
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </section>
    </main>
  );
};

export default Catalogo;
