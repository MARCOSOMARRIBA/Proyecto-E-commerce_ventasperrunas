import React, { useContext, useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiSearch,
  FiShoppingCart,
  FiHeart,
  FiUser,
  FiLogOut,
  FiMonitor,
  FiStar,
  FiSettings,
  FiChevronDown,
} from "react-icons/fi";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";
import NotificadorProveedor from "./NotificadorProveedor";
import { FaSearch, FaTimes } from "react-icons/fa";
import SearchBar from "./SearchBar";
import { FavoritesContext } from "../context/FavoritesContext";

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const { getCartCount } = useContext(CartContext);
  const navigate = useNavigate();
  const [mostrarBusqueda, setMostrarBusqueda] = useState(false);
  const { getFavoritesCount } = useContext(FavoritesContext);
  // Estado para controlar si el menú de Facebook está abierto o cerrado
  const [menuAbierto, setMenuAbierto] = useState(false);
  const menuRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Efecto para cerrar el menú si haces clic afuera de él
  useEffect(() => {
    const handleClickFuera = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuAbierto(false);
      }
    };
    document.addEventListener("mousedown", handleClickFuera);
    return () => document.removeEventListener("mousedown", handleClickFuera);
  }, []);

  return (
    <nav className="navbar navbar-expand-lg navbar-custom px-3">
      <div className="container-fluid">
        {/* LOGO */}
        <Link
          className="navbar-brand d-flex align-items-center gap-2 text-white"
          to="/"
        >
          <span style={{ fontSize: "2rem" }}>🐾</span>
          <span className="fw-bold" style={{ lineHeight: "1.1" }}>
            Ventas
            <br />
            Perrunas
          </span>
        </Link>

        {/* MENÚ DEL CENTRO */}
        <ul
          className={`navbar-nav mx-auto mb-2 mb-lg-0 d-none d-lg-flex novedades-navbar ${
            mostrarBusqueda ? "novedades-navbar-hidden" : ""
          }`}
        >
          <li className="nav-item">
            <Link
              className="nav-link text-white fw-bold d-flex align-items-center gap-2 px-4 py-2 bg-white bg-opacity-10 rounded-pill hover-scale"
              to="/novedades"
            >
              <FiStar className="text-warning" /> Novedades
            </Link>
          </li>
        </ul>

        {/* BOTONES E ICONOS DE LA DERECHA */}
        <div className="nav-icons d-none d-lg-flex align-items-center gap-4">
          {/* ICONOS FUNCIONALES (Búsqueda, Favoritos, Carrito, y CAMPANITA) */}
          <div className="d-flex align-items-center gap-3 text-white">
            <div className="animated-navbar-search">
              <button
                type="button"
                className="animated-search-toggle"
                onClick={() => setMostrarBusqueda(!mostrarBusqueda)}
                title={mostrarBusqueda ? "Cerrar búsqueda" : "Buscar productos"}
              >
                {mostrarBusqueda ? <FaTimes /> : <FaSearch />}
              </button>

              <div
                className={`animated-search-panel ${mostrarBusqueda ? "open" : ""}`}
              >
                <SearchBar />
              </div>
            </div>

            <Link
              to="/favoritos"
              title="Mis Favoritos"
              className="text-white text-decoration-none hover-scale position-relative"
            >
              <FiHeart size={22} />

              {getFavoritesCount() > 0 && (
                <span
                  className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                  style={{ fontSize: "0.6rem" }}
                >
                  {getFavoritesCount()}
                </span>
              )}
            </Link>

            <Link
              to="/carrito"
              title="Ir al Carrito"
              className="text-white text-decoration-none hover-scale position-relative"
            >
              <FiShoppingCart size={22} />
              {getCartCount() > 0 && (
                <span
                  className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-warning text-dark"
                  style={{ fontSize: "0.6rem" }}
                >
                  {getCartCount()}
                </span>
              )}
            </Link>

            {/* 🔔 AQUÍ ESTÁ LA MAGIA: Solo renderizamos el notificador si hay un usuario logueado Y su rol es 4 */}
            {user && user.rol === "4" && <NotificadorProveedor />}
          </div>

          <div
            className="nav-divider"
            style={{
              width: "2px",
              height: "30px",
              backgroundColor: "rgba(255,255,255,0.2)",
            }}
          ></div>

          {/* RENDERIZADO CONDICIONAL DEL USUARIO (Estilo Facebook) */}
          {user ? (
            <div className="position-relative" ref={menuRef}>
              {/* Botón que despliega el menú */}
              <button
                onClick={() => setMenuAbierto(!menuAbierto)}
                className="btn btn-link text-white text-decoration-none d-flex align-items-center gap-2 p-0 border-0 shadow-none hover-scale"
              >
                <div
                  className="d-flex justify-content-center align-items-center bg-light text-dark rounded-circle"
                  style={{ width: "40px", height: "40px" }}
                >
                  <span className="fw-bold fs-5">
                    {user.nombre ? user.nombre.charAt(0).toUpperCase() : "U"}
                  </span>
                </div>
                <span className="fw-bold d-none d-xl-block">{user.nombre}</span>
                <FiChevronDown
                  className={`transition-transform ${menuAbierto ? "rotate-180" : ""}`}
                />
              </button>

              {/* EL MENÚ DESPLEGABLE */}
              {menuAbierto && (
                <div
                  className="dropdown-menu show position-absolute end-0 mt-3 shadow-lg border-0 fade-in-up"
                  style={{
                    minWidth: "260px",
                    borderRadius: "12px",
                    zIndex: 1050,
                  }}
                >
                  {/* Cabecera del menú */}
                  <div
                    className="px-4 py-3 border-bottom bg-light rounded-top"
                    style={{
                      borderTopLeftRadius: "12px",
                      borderTopRightRadius: "12px",
                    }}
                  >
                    <p className="mb-0 fw-bold text-dark fs-6">{user.nombre}</p>
                    <small className="text-muted">
                      {user.email || "Usuario registrado"}
                    </small>
                  </div>

                  <div className="py-2">
                    <Link
                      to="/perfil"
                      className="dropdown-item d-flex align-items-center gap-3 py-2 px-4 fw-medium text-secondary hover-bg-light"
                      onClick={() => setMenuAbierto(false)}
                    >
                      <FiUser size={18} /> Mi Perfil
                    </Link>

                    <Link
                      to="/configuracion"
                      className="dropdown-item d-flex align-items-center gap-2"
                    >
                      <FiSettings /> Configuración
                    </Link>

                    {/* 🛡️ SOLO PARA ADMIN (Rol 3) */}
                    {user.rol === "3" && (
                      <Link
                        to="/intranet"
                        className="dropdown-item d-flex align-items-center gap-3 py-2 px-4 fw-bold text-info hover-bg-light"
                        onClick={() => setMenuAbierto(false)}
                      >
                        <FiMonitor size={18} /> Panel Admin
                      </Link>
                    )}

                    {/* 🏭 SOLO PARA PROVEEDORES (Rol 4) */}
                    {user.rol === "4" && (
                      <Link
                        to="/extranet"
                        className="dropdown-item d-flex align-items-center gap-3 py-2 px-4 fw-bold text-warning hover-bg-light"
                        style={{ color: "#d97706" }}
                        onClick={() => setMenuAbierto(false)}
                      >
                        <FiMonitor size={18} /> Portal Proveedor
                      </Link>
                    )}
                  </div>

                  <div className="border-top my-1"></div>

                  <button
                    onClick={handleLogout}
                    className="dropdown-item d-flex align-items-center gap-3 py-3 px-4 fw-bold text-danger hover-bg-light w-100 text-start"
                    style={{
                      borderBottomLeftRadius: "12px",
                      borderBottomRightRadius: "12px",
                    }}
                  >
                    <FiLogOut size={18} /> Cerrar Sesión
                  </button>
                </div>
              )}
            </div>
          ) : (
            // BOTONES DE LOGIN SI NO HAY USUARIO
            <div className="d-flex align-items-center gap-2">
              <Link
                to="/login"
                className="btn btn-outline-light d-flex align-items-center gap-2 fw-bold rounded-pill px-4"
              >
                <FiUser /> Iniciar sesión
              </Link>
              <Link
                to="/registro"
                className="btn btn-warning text-dark fw-bold rounded-pill px-4 shadow-sm"
              >
                Regístrate
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
