import React, { useEffect, useRef, useState } from "react";
import { FaSearch, FaTimes } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { getProductImage, searchProducts } from "../utils/products";

const SearchBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchRef = useRef(null);

  const [termino, setTermino] = useState("");
  const [productos, setProductos] = useState([]);
  const [sugerencias, setSugerencias] = useState([]);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setTermino(params.get("q") || "");
  }, [location.search]);

  useEffect(() => {
    const cargarProductos = async () => {
      try {
        const data = await api.productos.list();
        setProductos(data);
      } catch (error) {
        console.error("Error al cargar productos para búsqueda:", error);
      }
    };

    cargarProductos();
  }, []);

  useEffect(() => {
    const texto = termino.trim();

    if (texto.length < 2) {
      setSugerencias([]);
      return;
    }

    setSugerencias(searchProducts(productos, texto).slice(0, 5));
  }, [termino, productos]);

  useEffect(() => {
    const cerrarSugerencias = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setMostrarSugerencias(false);
      }
    };

    document.addEventListener("mousedown", cerrarSugerencias);

    return () => {
      document.removeEventListener("mousedown", cerrarSugerencias);
    };
  }, []);

  const buscarProductos = (event) => {
    event.preventDefault();

    const texto = termino.trim();

    if (!texto) return;

    setMostrarSugerencias(false);
    navigate(`/buscar?q=${encodeURIComponent(texto)}`);
  };

  const seleccionarSugerencia = (producto) => {
    setTermino(producto.nombre);
    setMostrarSugerencias(false);
    navigate(`/buscar?q=${encodeURIComponent(producto.nombre)}`);
  };

  const limpiarBusqueda = () => {
    setTermino("");
    setSugerencias([]);
    setMostrarSugerencias(false);
  };

  return (
    <div className="search-container" ref={searchRef}>
      <form className="search-form" onSubmit={buscarProductos}>
        <input
          type="text"
          className="search-input"
          placeholder="Buscar alimento, juguetes, accesorios..."
          value={termino}
          onChange={(e) => {
            setTermino(e.target.value);
            setMostrarSugerencias(true);
          }}
          onFocus={() => setMostrarSugerencias(true)}
        />

        {termino && (
          <button
            type="button"
            className="search-clear-btn"
            onClick={limpiarBusqueda}
            title="Limpiar búsqueda"
          >
            <FaTimes />
          </button>
        )}

        <button type="submit" className="search-submit-btn" title="Buscar">
          <FaSearch />
        </button>
      </form>

      {mostrarSugerencias && sugerencias.length > 0 && (
        <div className="search-suggestions">
          {sugerencias.map((producto) => (
            <button
              type="button"
              key={producto.id_producto}
              className="search-suggestion-item"
              onClick={() => seleccionarSugerencia(producto)}
            >
              <img
                src={getProductImage(producto, "50x50")}
                alt={producto.nombre}
                className="search-suggestion-img"
                onError={(e) => {
                  e.currentTarget.src = getProductImage(null, "50x50");
                }}
              />

              <div className="search-suggestion-info">
                <span className="search-suggestion-name">
                  {producto.nombre}
                </span>
                <span className="search-suggestion-price">
                  ${Number(producto.precio).toFixed(2)}
                </span>
              </div>
            </button>
          ))}

          <button className="search-view-all" onClick={buscarProductos}>
            Ver todos los resultados
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
