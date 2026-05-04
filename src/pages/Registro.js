import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// 1. Importamos las herramientas de Firebase
import { auth, googleProvider, facebookProvider } from '../firebaseConfig';
import { createUserWithEmailAndPassword, sendEmailVerification, signInWithPopup } from 'firebase/auth';
import { api } from '../api/client';

function Registro() {
  const navigate = useNavigate();

  // Memoria del formulario
  const [formData, setFormData] = useState({
    correo: '',
    nombre: '',
    telefono: '',
    password: ''
  });

  // Estados para alertas y carga
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
  const [cargando, setCargando] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // =================================================================
  // FUNCIÓN PUENTE: Guarda al usuario en tu Django (PostgreSQL)
  // =================================================================
  const guardarEnDjango = async (datosUsuario) => {
    const idGenerado = Date.now().toString();

    return api.auth.register({
      id_usuario: idGenerado,
      nombre_usuario: datosUsuario.nombre,
      correo: datosUsuario.email,
      contrasena: datosUsuario.password || datosUsuario.firebase_uid,
      rol: '1',
      fecha_registro: new Date().toISOString()
    });
  };

  // =================================================================
  // REGISTRO CON CORREO TRADICIONAL
  // =================================================================
  const handleRegister = async (e) => {
    e.preventDefault();
    setCargando(true);
    setMensaje({ texto: '', tipo: '' });

    try {
      // 1. Firebase crea la cuenta
      const userCredential = await createUserWithEmailAndPassword(auth, formData.correo, formData.password);
      const userFirebase = userCredential.user;

      // 2. Firebase envía el correo de confirmación
      await sendEmailVerification(userFirebase);

      // 3. Guardamos en tu base de datos Django
      await guardarEnDjango({
        nombre: formData.nombre,
        email: formData.correo,
        telefono: formData.telefono,
        password: formData.password,
        rol: '1', // Cliente
        firebase_uid: userFirebase.uid
      });

      setMensaje({ 
        texto: '¡Éxito! Revisa tu bandeja de entrada o SPAM para confirmar tu correo.', 
        tipo: 'success' 
      });
      
      // Limpiamos el formulario
      setFormData({ correo: '', nombre: '', telefono: '', password: '' });

    } catch (error) {
      console.error("Error Firebase:", error);
      let errorMsg = "Ocurrió un error al registrarse.";
      if (error.code === 'auth/email-already-in-use') errorMsg = "Este correo ya está registrado.";
      if (error.code === 'auth/weak-password') errorMsg = "La contraseña debe tener al menos 6 caracteres.";
      setMensaje({ texto: errorMsg, tipo: 'error' });
    } finally {
      setCargando(false);
    }
  };

  // =================================================================
  // REGISTRO CON GOOGLE O FACEBOOK
  // =================================================================
  const manejarRegistroSocial = async (proveedor) => {
    try {
      setMensaje({ texto: '', tipo: '' });
      const result = await signInWithPopup(auth, proveedor);
      const userFirebase = result.user;

      // Lo registramos en Django. 
      // Las redes sociales no siempre dan teléfono, así que lo mandamos vacío por ahora
      await guardarEnDjango({
        nombre: userFirebase.displayName || 'Usuario Nuevo',
        email: userFirebase.email,
        telefono: '', 
        rol: '1',
        firebase_uid: userFirebase.uid
      });

      // Como Google/Facebook ya verifican la identidad, lo mandamos directo a la tienda
      navigate('/'); 
      
    } catch (error) {
      console.error("Error Social:", error);
      setMensaje({ texto: 'No se pudo completar el inicio de sesión con esta red social.', tipo: 'error' });
    }
  };

  return (
    <div className="register-wrapper">
      <div className="register-container">
        
        {/* Lado Izquierdo (Textos y Perritos) INTACTO */}
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

            <h2 style={{fontSize: '3.5rem', marginBottom: '15px'}}>Regístrate</h2>

            {/* CAJA DE MENSAJES (Éxito o Error) */}
            {mensaje.texto && (
              <div style={{
                padding: '12px', marginBottom: '20px', borderRadius: '8px', fontSize: '0.9rem',
                backgroundColor: mensaje.tipo === 'error' ? '#ffebee' : '#e8f5e9',
                color: mensaje.tipo === 'error' ? '#c62828' : '#2e7d32',
                border: `1px solid ${mensaje.tipo === 'error' ? '#ffcdd2' : '#c8e6c9'}`
              }}>
                {mensaje.texto}
              </div>
            )}

            {/* BOTONES SOCIALES */}
            <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
              <button 
                type="button" 
                onClick={() => manejarRegistroSocial(googleProvider)}
                style={{ flex: 1, padding: '12px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#fff', cursor: 'pointer', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', transition: '0.3s' }}
              >
                <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" style={{width: '18px'}}/> 
                Google
              </button>
              
              <button 
                type="button" 
                onClick={() => manejarRegistroSocial(facebookProvider)}
                style={{ flex: 1, padding: '12px', border: 'none', borderRadius: '8px', backgroundColor: '#1877F2', color: '#fff', cursor: 'pointer', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', transition: '0.3s' }}
              >
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/2021_Facebook_icon.svg/1024px-2021_Facebook_icon.svg.png" alt="Facebook" style={{width: '18px', filter: 'brightness(0) invert(1)'}}/> 
                Facebook
              </button>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '20px', color: '#999', fontSize: '0.9rem', display: 'flex', alignItems: 'center' }}>
              <div style={{ flex: 1, height: '1px', backgroundColor: '#eee' }}></div>
              <span style={{ padding: '0 10px' }}>o regístrate con tu correo</span>
              <div style={{ flex: 1, height: '1px', backgroundColor: '#eee' }}></div>
            </div>

            {/* Formulario conectado a React */}
            <form onSubmit={handleRegister}>
              <div className="form-group">
                <label>Ingresa tu correo electronico</label>
                <input 
                  type="email" 
                  className="form-control-custom" 
                  placeholder="ejemplo@correo.com" 
                  name="correo"
                  value={formData.correo}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Fila con dos campos divididos */}
              <div className="row-inputs">
                <div className="form-group">
                  <label>Usuario / Nombre</label>
                  <input 
                    type="text" 
                    className="form-control-custom" 
                    placeholder="Tu nombre" 
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Numero de Contacto</label>
                  <input 
                    type="tel" 
                    className="form-control-custom" 
                    placeholder="10 dígitos" 
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
                  placeholder="Mínimo 6 caracteres" 
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength="6"
                />
              </div>

              <button type="submit" className="btn-login-main" style={{marginTop: '20px'}} disabled={cargando}>
                {cargando ? 'Procesando...' : 'Regístrate'}
              </button>
            </form>

          </div>
        </div>

      </div>
    </div>
  );
}

export default Registro;
