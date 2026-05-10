import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook, FaApple } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';

function Login() {
  // 1. Traemos loginReal y también la variable 'user' del contexto
  const { loginReal, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // 2. EFECTO VIGILANTE: En cuanto 'user' tenga datos, decidimos a dónde enviarlo
  useEffect(() => {
    if (user) {
      if (user.rol === '2') {
        navigate('/empleado');    // Va al Dashboard del Empleado
      } else if (user.rol === '3') {
        navigate('/intranet');    // Va al Dashboard del Admin
      } else if (user.rol === '4') {
        navigate('/extranet');    // Va al Dashboard del Proveedor
      } else {
        navigate('/');            // Cliente normal (Rol 1 u otro)
      }
    }
  }, [user, navigate]);

  // 3. LA FUNCIÓN DEL BOTÓN AHORA ES MÁS LIMPIA
  const handleLogin = async (e) => {
    e.preventDefault(); 
    // Llamamos a tu contexto. Si hay éxito, el useEffect de arriba hará la magia de la redirección
    await loginReal({ email, password });
  };

  return (
    <div className="login-container">
      
      <div className="login-left d-none d-md-flex">
        <h1>Inicia sesion en</h1>
        <h3>Ventas Perrunas es simple</h3>
        <p>Negocio dedicado a darle lo mejor a esas pequeñas mascotitas que siempre nos alegran nuestros malos días y siempre nos sacan una sonrisa.</p>
      </div>

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