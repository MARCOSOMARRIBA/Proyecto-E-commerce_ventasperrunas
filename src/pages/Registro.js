import React from 'react';
import { Link } from 'react-router-dom';

function Registro() {
  return (
    <div className="register-wrapper">
      <div className="register-container">
        
        {/* Lado Izquierdo (Textos y Perritos) */}
        <div className="register-left d-none d-md-flex">
          <div className="register-text">
            <h1>Ventas Perrunas es fácil!!</h1>
            <p>Negocio dedicado a darle lo mejor a esas pequeñas mascotitas que siempre nos alegran nuestros malos días y siempre nos sacan una sonrisa.</p>
          </div>
          
          {/* Imágenes de los perritos (Reemplaza los links por tus PNG sin fondo) */}
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

            {/* Formulario */}
            <form>
              <div className="form-group">
                <label>Ingresa tu usuario o correo electronico</label>
                <input type="text" className="form-control-custom" placeholder="Usuario o correo electronico" />
              </div>

              {/* Fila con dos campos divididos */}
              <div className="row-inputs">
                <div className="form-group">
                  <label>Usuario</label>
                  <input type="text" className="form-control-custom" placeholder="Usuario" />
                </div>
                <div className="form-group">
                  <label>Numero de Contaco</label>
                  <input type="text" className="form-control-custom" placeholder="Numero de Contacto" />
                </div>
              </div>

              <div className="form-group">
                <label>Escribe tu contraseña</label>
                <input type="password" className="form-control-custom" placeholder="Contraseña" />
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