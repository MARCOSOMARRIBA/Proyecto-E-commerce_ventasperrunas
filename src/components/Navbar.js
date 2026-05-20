import React, { useContext, useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
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
import { FaSearch, FaTimes, FaClipboardList } from "react-icons/fa";
import SearchBar from "./SearchBar";
import { FavoritesContext } from "../context/FavoritesContext";
import { useMessage } from "../context/MessageContext";

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const { getCartCount } = useContext(CartContext);
  const navigate = useNavigate();
  const { showMessage } = useMessage();
  const [mostrarBusqueda, setMostrarBusqueda] = useState(false);
  const { getFavoritesCount } = useContext(FavoritesContext);
  // Estado para controlar si el menú de Facebook está abierto o cerrado
  const [menuAbierto, setMenuAbierto] = useState(false);
  const location = useLocation();
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
    <nav className="navbar navbar-expand-lg navbar-modern px-4 py-3">
      <div className="container-fluid">
        {/* LOGO */}
        <Link
          className="navbar-brand d-flex align-items-center gap-3 text-white"
          to="/"
        >
          <div className="logo-icon">🐾</div>

          <div className="d-flex flex-column">
            <span className="fw-bold brand-title">Ventas Perrunas</span>

            <small className="brand-subtitle">Todo para tu mascota</small>
          </div>
        </Link>

        {/* MENÚ CENTRAL */}
        <div
          className={`d-none d-lg-flex align-items-center gap-3 mx-auto navbar-center-links ${
            mostrarBusqueda ? "navbar-hidden-elements" : ""
          }`}
        >
          <Link
            className={`nav-modern-link ${
              location.pathname === "/" ? "active" : ""
            }`}
            to="/"
          >
            Inicio
          </Link>

          <Link
            className={`nav-modern-link ${
              location.pathname === "/Tienda" ? "active" : ""
            }`}
            to="/Tienda"
          >
            Productos
          </Link>

          <Link
            className={`nav-modern-link ${
              location.pathname === "/categorias" ? "active" : ""
            }`}
            to="/categorias"
          >
            Categorías
          </Link>

          <Link
            className={`nav-modern-link ${
              location.pathname === "/novedades" ? "active" : ""
            }`}
            to="/novedades"
          >
            <FiStar className="text-warning" />
            Novedades
          </Link>
        </div>

        {/* DERECHA */}
        <div className="d-none d-lg-flex align-items-center gap-3">
          {/* SEARCH */}
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
              className={`animated-search-panel ${
                mostrarBusqueda ? "open" : ""
              }`}
            >
              <SearchBar />
            </div>
            <div
              className={`d-flex align-items-center gap-3 navbar-right-elements ${
                mostrarBusqueda ? "navbar-hidden-elements" : ""
              }`}
            ></div>
          </div>

          {/* PEDIDOS */}
          <Link
            to="/mis-pedidos"
            className="modern-icon-btn"
            onClick={(e) => {
              if (!user) {
                e.preventDefault();

                showMessage({
                  title: "Inicia sesión",

                  message: "Debes iniciar sesión para ver tus pedidos.",

                  type: "warning",
                });

                return;
              }
            }}
          >
            <FaClipboardList size={18} />
          </Link>

          {/* FAVORITOS */}
          <Link
            to="/favoritos"
            className="modern-icon-btn position-relative"
            onClick={(e) => {
              if (!user) {
                e.preventDefault();

                showMessage({
                  title: "Inicia sesión",

                  message:
                    "Debes iniciar sesión para guardar productos en favoritos.",

                  type: "warning",
                });

                return;
              }
            }}
          >
            <FiHeart size={18} />

            {getFavoritesCount() > 0 && (
              <span className="modern-badge danger">{getFavoritesCount()}</span>
            )}
          </Link>

          {/* CARRITO */}
          <Link
            to="/carrito"
            className="modern-icon-btn position-relative"
            onClick={(e) => {
              if (!user) {
                e.preventDefault();

                showMessage({
                  title: "Inicia sesión",

                  message: "Debes iniciar sesión para comprar.",

                  type: "warning",
                });

                return;
              }
            }}
          >
            <FiShoppingCart size={18} />

            {getCartCount() > 0 && (
              <span className="modern-badge warning">{getCartCount()}</span>
            )}
          </Link>

          {/* NOTIFICADOR */}
          {user && user.rol === "4" && <NotificadorProveedor />}

          <div className="modern-divider"></div>

          {/* USUARIO */}
          {user ? (
            <div className="position-relative" ref={menuRef}>
              <button
                onClick={() => setMenuAbierto(!menuAbierto)}
                className="modern-user-btn"
              >
                <div className="modern-avatar">
                  {user.nombre ? user.nombre.charAt(0).toUpperCase() : "U"}
                </div>

                <div className="d-flex flex-column text-start">
                  <span className="modern-user-name">{user.nombre}</span>

                  <small className="modern-user-role">Usuario</small>
                </div>

                <FiChevronDown
                  className={`transition-transform ${
                    menuAbierto ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* DROPDOWN */}
              {menuAbierto && (
                <div className="modern-dropdown">
                  <div className="modern-dropdown-header">
                    <div className="modern-avatar large">
                      {user.nombre ? user.nombre.charAt(0).toUpperCase() : "U"}
                    </div>

                    <div>
                      <p className="mb-0 fw-bold">{user.nombre}</p>

                      <small className="text-muted">
                        {user.email || "Usuario registrado"}
                      </small>
                    </div>
                  </div>

                  <div className="modern-dropdown-body">
                    <Link to="/perfil" className="modern-dropdown-item">
                      <FiUser /> Mi Perfil
                    </Link>

                    <Link to="/configuracion" className="modern-dropdown-item">
                      <FiSettings /> Configuración
                    </Link>

                    {user.rol === "2" && (
                      <Link
                        to="/empleado"
                        className="modern-dropdown-item success"
                      >
                        <FiMonitor /> Panel Empleado
                      </Link>
                    )}

                    {user.rol === "3" && (
                      <Link
                        to="/intranet"
                        className="modern-dropdown-item info"
                      >
                        <FiMonitor /> Panel Admin
                      </Link>
                    )}

                    {user.rol === "4" && (
                      <Link
                        to="/extranet"
                        className="modern-dropdown-item warning"
                      >
                        <FiMonitor /> Portal Proveedor
                      </Link>
                    )}
                  </div>

                  <div className="modern-dropdown-footer">
                    <button
                      onClick={handleLogout}
                      className="modern-logout-btn"
                    >
                      <FiLogOut />
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="d-flex align-items-center gap-2">
              <Link to="/login" className="modern-login-btn">
                <FiUser />
                Iniciar sesión
              </Link>

              <Link to="/registro" className="modern-register-btn">
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
