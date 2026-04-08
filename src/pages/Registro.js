import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function Registro() {
  const { registroReal } = useContext(AuthContext); // Traemos la función que conecta a Django
  const navigate = useNavigate(); // Para redirigir al Login si el registro es exitoso

  // 1. Creamos la "memoria" del formulario
  const [formData, setFormData] = useState({
    correo: '',
    nombre: '',
    telefono: '',
    password: ''
  });

  // 2. Función que actualiza la memoria cada vez que el usuario teclea
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 3. Función que se ejecuta al darle clic a "Regístrate"
  const handleRegister = async (e) => {
    e.preventDefault(); // Evita que la página se recargue
    
    // Llamamos a nuestra función del AuthContext enviando los datos
    const exito = await registroReal({
      nombre: formData.nombre,
      email: formData.correo,
      password: formData.password
    });
    
    // Si Django dice que OK, lo mandamos al login para que inicie sesión
    if (exito) {
      navigate('/login');
    }
  };

  return (
    <div className="register-wrapper">
      <div className="register-container">
        
        {/* Lado Izquierdo (Textos y Perritos) */}
        <div className="register-left d-none d-md-flex">
          <div className="register-text">
            <h1>Ventas Perrunas es fácil!!</h1>
            <p>Negocio dedicado a darle lo mejor a esas pequeñas mascotitas que siempre nos alegran nuestros malos días y siempre nos sacan una sonrisa.</p>
          </div>
          
          <div className="register-dogs">
            <img src="https://images.vexels.com/media/users/3/298818/isolated/preview/e395e5482bf4ed55d5d3bca7d4b4a1df-corgi-dog-sitting-character.png" alt="Corgi" />
            <img src="https://images.vexels.com/media/users/3/298815/isolated/preview/a108df1e0dbb3a2cd7de385317b9b1e7-golden-retriever-dog-sitting-character.png" alt="Golden Retriever" style={{height: '420px'}}/>
          </div>
        </div>

        {/* Lado Derecho (Formulario de Registro) */}
        <div className="register-right">
          <div className="login-card">
            
            <div className="login-header-text">
              <span>Bienvenido a <span style={{color: '#0084ff', fontWeight: 'bold'}}>VENTAS PERRUNAS</span></span>
              <span style={{fontSize: '0.85rem', color: '#666', textAlign: 'right'}}>
                Tienes cuenta ? <br/>
                <Link to="/login" style={{color: '#0084ff', textDecoration: 'none'}}>Inicia Sesión</Link>
              </span>
            </div>

            <h2 style={{fontSize: '3.5rem', marginBottom: '30px'}}>Regístrate</h2>

            {/* Formulario conectado a React */}
            <form onSubmit={handleRegister}>
              <div className="form-group">
                <label>Ingresa tu correo electronico</label>
                <input 
                  type="email" 
                  className="form-control-custom" 
                  placeholder="Correo electronico" 
                  name="correo"
                  value={formData.correo}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Fila con dos campos divididos */}
              <div className="row-inputs">
                <div className="form-group">
                  <label>Usuario</label>
                  <input 
                    type="text" 
                    className="form-control-custom" 
                    placeholder="Usuario" 
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Numero de Contacto</label>
                  <input 
                    type="text" 
                    className="form-control-custom" 
                    placeholder="Numero de Contacto" 
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Escribe tu contraseña</label>
                <input 
                  type="password" 
                  className="form-control-custom" 
                  placeholder="Contraseña" 
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <button type="submit" className="btn-login-main" style={{marginTop: '30px'}}>Registrate</button>
            </form>

          </div>
        </div>

      </div>
    </div>
  );
}

export default Registro;