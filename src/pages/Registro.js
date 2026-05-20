import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, googleProvider, facebookProvider } from "../firebaseConfig";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithPopup,
} from "firebase/auth";
import { api } from "../api/client";
import { FaFacebookF } from "react-icons/fa";

function Registro() {
  const navigate = useNavigate();

  // Memoria del formulario
  const [formData, setFormData] = useState({
    correo: "",
    nombre: "",
    telefono: "",
    password: "",
  });

  // Estados para alertas y carga
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });
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
      rol: "1",
      fecha_registro: new Date().toISOString(),
    });
  };

  // =================================================================
  // REGISTRO CON CORREO TRADICIONAL
  // =================================================================
  const handleRegister = async (e) => {
    e.preventDefault();
    setCargando(true);
    setMensaje({ texto: "", tipo: "" });

    try {
      // 1. Firebase crea la cuenta
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.correo,
        formData.password,
      );
      const userFirebase = userCredential.user;

      // 2. Firebase envía el correo de confirmación
      await sendEmailVerification(userFirebase);

      // 3. Guardamos en tu base de datos Django
      await guardarEnDjango({
        nombre: formData.nombre,
        email: formData.correo,
        telefono: formData.telefono,
        password: formData.password,
        rol: "1", // Cliente
        firebase_uid: userFirebase.uid,
      });

      setMensaje({
        texto:
          "¡Éxito! Revisa tu bandeja de entrada o SPAM para confirmar tu correo.",
        type: "success",
      });

      // Limpiamos el formulario
      setFormData({ correo: "", nombre: "", telefono: "", password: "" });
    } catch (error) {
      console.error("Error Firebase:", error);
      let errorMsg = "Ocurrió un error al registrarse.";
      if (error.code === "auth/email-already-in-use")
        errorMsg = "Este correo ya está registrado.";
      if (error.code === "auth/weak-password")
        errorMsg = "La contraseña debe tener al menos 6 caracteres.";
      setMensaje({ texto: errorMsg, tipo: "error" });
    } finally {
      setCargando(false);
    }
  };

  // =================================================================
  // REGISTRO CON GOOGLE O FACEBOOK
  // =================================================================
  const manejarRegistroSocial = async (proveedor) => {
    try {
      setMensaje({ texto: "", tipo: "" });
      const result = await signInWithPopup(auth, proveedor);
      const userFirebase = result.user;

      // Lo registramos en Django.
      await guardarEnDjango({
        nombre: userFirebase.displayName || "Usuario Nuevo",
        email: userFirebase.email,
        telefono: "",
        rol: "1",
        firebase_uid: userFirebase.uid,
      });

      // Como Google/Facebook ya verifican la identidad, lo mandamos directo a la tienda
      navigate("/");
    } catch (error) {
      console.error("Error Social:", error);
      setMensaje({
        texto: "No se pudo completar el registro con esta red social.",
        tipo: "error",
      });
    }
  };

  return (
    <div className="register-wrapper-modern">
      <div className="register-container-modern">
        {/* Lado Izquierdo */}
        <div className="register-left-modern d-none d-md-flex">
          <div className="register-text">
            <h1>
              Todo para tus mascotas
              <br />
              en un solo lugar
            </h1>
            <p>
              Compra alimentos, accesorios y productos premium para consentir a
              quienes alegran tus días.
            </p>
            <div className="register-stats">
              <div className="stat-box">
                <h3>+500</h3>
                <span>Productos</span>
              </div>
              <div className="stat-box">
                <h3>24/7</h3>
                <span>Atención</span>
              </div>
              <div className="stat-box">
                <h3>100%</h3>
                <span>Seguro</span>
              </div>
            </div>
          </div>
        </div>

        {/* Lado Derecho */}
        <div className="register-right-modern">
          <div className="register-card-modern">
            <div className="register-header-modern"></div>

            <h2 className="register-title-modern">Crea tu cuenta</h2>

            {/* CAJA DE MENSAJES */}
            {mensaje.texto && (
              <div
                style={{
                  padding: "12px",
                  marginBottom: "20px",
                  borderRadius: "8px",
                  fontSize: "0.9rem",
                  backgroundColor:
                    mensaje.tipo === "error" ? "#ffebee" : "#e8f5e9",
                  color: mensaje.tipo === "error" ? "#c62828" : "#2e7d32",
                  border: `1px solid ${mensaje.tipo === "error" ? "#ffcdd2" : "#c8e6c9"}`,
                }}
              >
                {mensaje.texto}
              </div>
            )}

            {/* BOTONES SOCIALES */}
            <div className="social-register-buttons">
              <button
                type="button"
                onClick={() => manejarRegistroSocial(googleProvider)}
                className="social-btn-modern google-btn"
              >
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg"
                  alt="Google"
                />
                <span>Continuar con Google</span>
              </button>

              {/* 🔥 BOTÓN DE FACEBOOK CONECTADO Y CON FLEXBOX 🔥 */}
              <button 
                type="button" 
                onClick={() => manejarRegistroSocial(facebookProvider)}
                className="btn-facebook-modern"
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '10px',
                  backgroundColor: '#1877F2',
                  color: 'white',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                <FaFacebookF size={18} />
                <span>Continuar con Facebook</span>
              </button>
            </div>

            <div className="divider-register-modern">
              <div className="divider-line"></div>
              <span style={{ padding: "0 10px" }}>
                o regístrate con tu correo
              </span>
              <div className="divider-line"></div>
            </div>

            {/* Formulario conectado a React */}
            <form onSubmit={handleRegister} className="register-form-modern">
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

              <button
                type="submit"
                className="btn-login-main"
                style={{ marginTop: "20px" }}
                disabled={cargando}
              >
                {cargando ? "Procesando..." : "Regístrate"}
              </button>
              <div className="register-login-link">
                ¿Ya tienes una cuenta?
                <Link to="/login">Inicia sesión</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className="register-security-text">
        🔒 Tus datos están protegidos y cifrados.
      </div>
    </div>
  );
}

export default Registro;