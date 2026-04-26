import React, { useEffect, useRef, useState } from "react";
import { FaSearch, FaTimes } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";

const API_PRODUCTOS = "http://127.0.0.1:8000/api/productos/";

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
    const queryActual = params.get("q") || "";
    setTermino(queryActual);
  }, [location.search]);

  useEffect(() => {
    const cargarProductos = async () => {
      try {
        const respuesta = await fetch(API_PRODUCTOS);
        const data = await respuesta.json();

        if (respuesta.ok) {
          setProductos(data);
        }
      } catch (error) {
        console.error("Error al cargar productos para búsqueda:", error);
      }
    };

    cargarProductos();
  }, []);

  useEffect(() => {
    const texto = termino.trim().toLowerCase();

    if (texto.length < 2) {
      setSugerencias([]);
      return;
    }

    const resultados = productos
      .filter((producto) => {
        const nombre = producto.nombre?.toLowerCase() || "";
        const descripcion = producto.descripcion?.toLowerCase() || "";
        const idProducto = String(producto.id_producto || "");

        return (
          nombre.includes(texto) ||
          descripcion.includes(texto) ||
          idProducto.includes(texto)
        );
      })
      .slice(0, 5);

    setSugerencias(resultados);
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

    if (texto === "") {
      return;
    }

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
            <div
              key={producto.id_producto}
              className="search-suggestion-item"
              onClick={() => seleccionarSugerencia(producto)}
            >
              <img
                src={producto.imagen || "https://via.placeholder.com/50"}
                alt={producto.nombre}
                className="search-suggestion-img"
              />

              <div className="search-suggestion-info">
                <span className="search-suggestion-name">
                  {producto.nombre}
                </span>
                <span className="search-suggestion-price">
                  ${Number(producto.precio).toFixed(2)}
                </span>
              </div>
            </div>
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
