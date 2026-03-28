import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook, FaApple } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext'; // Importamos el contexto

function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  // Estados para capturar lo que el usuario escribe
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Función que se dispara al enviar el formulario
  const handleLogin = (e) => {
    e.preventDefault(); // Evita que la página recargue

    // Simulamos el inicio de sesión exitoso
    const usuarioSimulado = {
      nombre: email.split('@')[0] || "Usuario", // Usa el texto antes del @ como nombre
      email: email,
      telefono: "555-123-4567",
      direccion: "Calle Falsa 123"
    };

    login(usuarioSimulado); // Guardamos en la memoria global
    navigate('/'); // Redirigimos al inicio
  };

  return (
    <div className="login-container">
      
      {/* Lado Izquierdo (Azul) */}
      <div className="login-left d-none d-md-flex">
        <h1>Inicia sesion en</h1>
        <h3>Ventas Perrunas es simple</h3>
        <p>Negocio dedicado a darle lo mejor a esas pequeñas mascotitas que siempre nos alegran nuestros malos días y siempre nos sacan una sonrisa.</p>
      </div>

      {/* Lado Derecho (Formulario) */}
      <div className="login-right">
        <div className="login-card">
          
          <div className="login-header-text">
            <span>Bienvenido a <span style={{color: '#0084ff', fontWeight: 'bold'}}>VENTAS PERRUNAS</span></span>
            <span style={{fontSize: '0.85rem', color: '#666'}}>
              No tienes cuenta? <br/>
              <Link to="/registro" style={{color: '#0084ff', textDecoration: 'none'}}>Registrate</Link>
            </span>
          </div>

          <h2>Inicia Sesión</h2>

          {/* Botones Sociales */}
          <div className="social-buttons">
            <button className="btn-google">
              <FcGoogle size={24} /> Inicia sesión con Google
            </button>
            <button className="btn-social-icon fb">
              <FaFacebook />
            </button>
            <button className="btn-social-icon">
              <FaApple />
            </button>
          </div>

          {/* Formulario (Conectado a la función handleLogin) */}
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Ingresa tu usuario o correo electronico</label>
              <input 
                type="text" 
                className="form-control-custom" 
                placeholder="Usuario o correo electrónico" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Ingresa tu contraseña</label>
              <input 
                type="password" 
                className="form-control-custom" 
                placeholder="Contraseña" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Link to="/olvide-password" className="forgot-password">Olvide mi contraseña</Link>
            </div>

            <button type="submit" className="btn-login-main">Iniciar Sesion</button>
          </form>

        </div>
      </div>

    </div>
  );
}

export default Login;