import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaEnvelope, FaPaw } from "react-icons/fa";
import { useMessage } from "../context/MessageContext";

function OlvidePassword() {
  const [email, setEmail] = useState("");
  const [cargando, setCargando] = useState(false);
  const { showMessage } = useMessage();

  const manejarEnvio = async (e) => {
    e.preventDefault();
    setCargando(true);

    try {
      // Petición a tu backend de Django (Necesitarás crear esta URL en views.py)
      const res = await fetch("https://proyecto-e-commerce-ventasperrunas.onrender.com/api/usuarios/recuperar-password/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo: email }),
      });

      if (res.ok) {
        showMessage({
          title: "Correo enviado",
          message: "Si el correo está registrado, recibirás instrucciones para cambiar tu contraseña.",
          type: "success",
        });
        setEmail("");
      } else {
        const error = await res.json();
        showMessage({ title: "Error", message: error.error || "No pudimos procesar tu solicitud.", type: "error" });
      }
    } catch (error) {
      showMessage({ title: "Error de conexión", message: "No se pudo conectar con el servidor.", type: "error" });
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-right-panel" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        <div className="login-card-modern" style={{ maxWidth: '450px', margin: 'auto' }}>
          <div className="text-center mb-4">
            <FaPaw size={40} color="#2cb1ff" className="mb-2" />
            <h2>Recuperar Contraseña</h2>
            <p className="text-muted small">Ingresa tu correo y te enviaremos las instrucciones.</p>
          </div>

          <form onSubmit={manejarEnvio}>
            <div className="input-group-modern mb-4">
              <FaEnvelope className="input-icon" />
              <input
                type="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="login-main-btn mb-3" disabled={cargando}>
              {cargando ? "Enviando..." : "Enviar Instrucciones"}
            </button>
            
            <div className="text-center mt-3">
              <Link to="/login" className="text-decoration-none text-secondary small fw-bold">
                Volver al Inicio de Sesión
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default OlvidePassword;