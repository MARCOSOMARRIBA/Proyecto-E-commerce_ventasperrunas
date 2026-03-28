import React, { useContext } from 'react'; 
import { Link, useNavigate } from 'react-router-dom';
import { FiSearch, FiShoppingCart, FiHeart, FiUser, FiLogOut } from 'react-icons/fi';
import { AuthContext } from '../context/AuthContext'; 
import { CartContext } from '../context/CartContext'; // <-- Importamos el contexto del carrito

function Navbar() {
  const { user, logout } = useContext(AuthContext); 
  const { getCartCount } = useContext(CartContext); // <-- EXTRAEMOS EL CONTADOR DE PRODUCTOS
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/'); 
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-custom">
      <div className="container-fluid">
        {/* LOGO Y MENÚ DEL CENTRO */}
        <Link className="navbar-brand" to="/">
          <span style={{ fontSize: '2rem' }}>🐾</span> Ventas<br/>Perrunas
        </Link>

        {/* BOTONES E ICONOS DE LA DERECHA */}
        <div className="nav-icons d-none d-lg-flex align-items-center">
          
          {/* Renderizado condicional del Login/Perfil */}
          {user ? (
            <div className="d-flex align-items-center gap-3">
              <Link to="/perfil" className="text-white text-decoration-none fw-bold d-flex align-items-center gap-2">
                <FiUser /> Hola, {user.nombre}
              </Link>
              <button onClick={handleLogout} className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1" style={{color: 'white', borderColor: 'rgba(255,255,255,0.3)'}}>
                <FiLogOut /> Salir
              </button>
            </div>
          ) : (
            <div className="d-flex align-items-center">
              <Link to="/login" className="btn-nav-login">
                <FiUser /> Iniciar sesión
              </Link>
              <Link to="/registro" className="btn-nav-register ms-2">
                Regístrate
              </Link>
            </div>
          )}

          <div className="nav-divider"></div>

          <span title="Buscar"><FiSearch /></span>
          
          {/* CARRITO MÁGICO CONECTADO */}
          <Link to="/carrito" className="text-white text-decoration-none ms-3" title="Carrito">
            <FiShoppingCart /> {getCartCount()}
          </Link>

          <span className="ms-3" title="Favoritos"><FiHeart /> 1</span>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;