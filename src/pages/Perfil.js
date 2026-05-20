import React, { useContext, useEffect, useRef, useState } from "react";
import { Navigate } from "react-router-dom";
import {
  FiAlertTriangle,
  FiCheckCircle,
  FiSave,
  FiShield,
  FiStar,
  FiUser,
} from "react-icons/fi";
import { AuthContext } from "../context/AuthContext";

function Perfil() {
  const { user, updateProfile } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    nombre: user?.nombre || "",
    telefono: user?.telefono || "",
  });
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });

  useEffect(() => {
    if (!user) return;

    setFormData({
      nombre: user.nombre || "",
      telefono: user.telefono || "",
    });
  }, [user]);

  if (!user) {
    return <Navigate to="/" />;
  }

  const mostrarMensaje = (texto, tipo = "success") => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje({ texto: "", tipo: "" }), 3500);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSaveForm = (e) => {
    e.preventDefault();
    updateProfile(formData);
    mostrarMensaje("Perfil actualizado con éxito.");
  };

  return (
    <div className="profile-wrapper">
      <div className="container">
        <div className="profile-card profile-account-layout">
          <aside className="profile-sidebar">
            <div className="profile-avatar-placeholder">
              {user.nombre?.charAt(0).toUpperCase()}
            </div>

            <h3 className="sidebar-name">{user.nombre}</h3>

            <p className="sidebar-username">@{user.username}</p>

            <div className="profile-side-list">
              <div>
                <FiShield />
                <span>Cuenta verificada</span>
              </div>

              <div>
                <FiStar />
                <span>Cliente desde 2026</span>
              </div>
            </div>
          </aside>

          <section className="profile-details">
            {mensaje.texto && (
              <div
                className={`alert alert-${mensaje.tipo} d-flex align-items-center gap-2 mb-4`}
                role="alert"
              >
                {mensaje.tipo === "info" && <FiAlertTriangle size={20} />}
                {mensaje.texto}
              </div>
            )}

            <div className="profile-header-row">
              <div>
                <span className="profile-eyebrow">
                  <FiUser /> Mi cuenta
                </span>
                <h2>Mi perfil</h2>
                <p>Mantén actualizada la información principal de tu cuenta.</p>
              </div>
              <span className="badge-account">
                <FiCheckCircle /> Cuenta verificada
              </span>
            </div>

            <form onSubmit={handleSaveForm} className="profile-section-card">
              <div className="profile-section-heading">
                <h3>Datos personales</h3>
                <p>Información básica de contacto de tu cuenta.</p>
              </div>

              <div className="mb-4">
                <label className="form-label-custom">Correo electrónico</label>
                <input
                  type="email"
                  className="form-control form-control-custom bg-light"
                  value={user.email}
                  disabled
                />
                <small className="text-muted mt-1 d-block">
                  Este campo no es editable.
                </small>
              </div>

              <div className="row mb-4">
                <div className="col-md-6 mb-3 mb-md-0">
                  <label className="form-label-custom">Nombre</label>
                  <input
                    type="text"
                    className="form-control form-control-custom"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label-custom">Teléfono</label>
                  <input
                    type="tel"
                    className="form-control form-control-custom"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    placeholder="Ej. 2291234567"
                  />
                </div>
              </div>

              <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                <button type="submit" className="profile-save-btn">
                  <FiSave /> Guardar cambios
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}

export default Perfil;
