import React, { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";

import { FaFacebookF, FaEnvelope, FaLock, FaPaw } from "react-icons/fa";

import { AuthContext } from "../context/AuthContext";

function Login() {
  const { loginReal, loginGoogle, loginFacebook, user } = useContext(AuthContext);

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [recordarme, setRecordarme] = useState(false);

  useEffect(() => {
    if (user) {
      if (user.rol === "2") {
        navigate("/empleado");
      } else if (user.rol === "3") {
        navigate("/intranet");
      } else if (user.rol === "4") {
        navigate("/extranet");
      } else {
        navigate("/");
      }
    }
  }, [user, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();

    await loginReal({
      email,
      password,
      recordarme,
    });
  };

  return (
    <div className="login-page">
      {/* LADO IZQUIERDO */}
      <div className="login-left-panel">
        <div className="login-overlay"></div>

        <div className="login-left-content">
          <div className="brand-badge">
            <FaPaw />
            <span>Ventas Perrunas</span>
          </div>

          <h1>
            Todo para tus mascotas
            <br />
            en un solo lugar
          </h1>

          <p>
            Compra alimentos, accesorios y productos premium para consentir a
            quienes alegran tus días.
          </p>

          <div className="login-stats">
            <div className="stat-item">
              <h3>+500</h3>
              <span>Productos</span>
            </div>

            <div className="stat-item">
              <h3>24/7</h3>
              <span>Atención</span>
            </div>

            <div className="stat-item">
              <h3>100%</h3>
              <span>Seguro</span>
            </div>
          </div>
        </div>
      </div>

      {/* LADO DERECHO */}
      <div className="login-right-panel">
        <div className="login-card-modern">
          <div className="login-top">
            <div>
              <h2>Inicia Sesión</h2>
            </div>

            <div className="register-link-box">
              <span>¿No tienes cuenta?</span>

              <Link to="/registro">Regístrate</Link>
            </div>
          </div>

          {/* LOGIN SOCIAL */}

          <div className="social-login-container">
            <button className="google-btn" onClick={loginGoogle}>
              <FcGoogle size={22} />

              <span>Continuar con Google</span>
            </button>
          </div>

          <div className="social-login-container">
          <button className="facebook-btn" onClick={loginFacebook}>
             <FaFacebookF size={22} /> 

             <span>Continuar con Facebook</span>
          </button>
         </div>

          <div className="divider">
            <span>o continúa con correo</span>
          </div>

          {/* FORMULARIO */}

          <form onSubmit={handleLogin}>
            <div className="input-group-modern">
              <FaEnvelope className="input-icon" />

              <input
                type="text"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="input-group-modern">
              <FaLock className="input-icon" />

              <input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="login-options">
              <label className="remember-me">
                <input
                  type="checkbox"
                  type="checkbox"
                  checked={recordarme}
                  onChange={(e) => setRecordarme(e.target.checked)}
                />

                <span>Recordarme</span>
              </label>

              <Link to="/olvide-password" className="forgot-password-modern">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <button type="submit" className="login-main-btn">
              Ingresar
            </button>
          </form>

          <div className="login-footer">
            <span>Protegido y cifrado para tu seguridad.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
