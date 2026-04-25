import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook, FaApple } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';

function Login() {
  // 1. AHORA TRAEMOS loginReal (la función que conecta con Django)
  const { loginReal } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // 2. HACEMOS LA FUNCIÓN ASÍNCRONA (async) PORQUE VAMOS A ESPERAR A DJANGO
 const handleLogin = async (e) => {
    e.preventDefault(); 
    const exito = await loginReal({ email, password });

    if (exito) {
      // 1. Obtenemos el usuario que acabamos de guardar en el contexto
      // Nota: Necesitas importar el 'user' del AuthContext si no lo tienes
      
      // 2. Redireccionamos según el rol de la base de datos 
      // Usamos el resultado de la función para decidir a dónde ir
      // (Asumiendo que loginReal devuelve los datos del usuario o los guarda)
      navigate('/'); 
    }
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