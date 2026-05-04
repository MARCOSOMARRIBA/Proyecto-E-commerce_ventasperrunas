import React, { useContext, useEffect, useRef, useState } from "react";
import { Navigate } from "react-router-dom";
import {
  FiAlertTriangle,
  FiCamera,
  FiCheckCircle,
  FiHome,
  FiMapPin,
  FiPlus,
  FiSave,
  FiShield,
  FiStar,
  FiTrash2,
  FiUser,
} from "react-icons/fi";
import { AuthContext } from "../context/AuthContext";

const crearDireccionVacia = () => ({
  alias: "",
  destinatario: "",
  telefono: "",
  calle: "",
  colonia: "",
  ciudad: "",
  estado: "",
  codigoPostal: "",
  referencias: "",
});

function Perfil() {
  const { user, updateProfile } = useContext(AuthContext);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    nombre: user?.nombre || "",
    telefono: user?.telefono || "",
  });
  const [direcciones, setDirecciones] = useState([]);
  const [direccionForm, setDireccionForm] = useState(crearDireccionVacia);
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });

  const addressStorageKey = user ? `direcciones_mascotas_${user.id}` : null;

  useEffect(() => {
    if (!user) return;

    setFormData({
      nombre: user.nombre || "",
      telefono: user.telefono || "",
    });
  }, [user]);

  useEffect(() => {
    if (!addressStorageKey) return;

    const savedAddresses = localStorage.getItem(addressStorageKey);
    if (!savedAddresses) {
      setDirecciones([]);
      return;
    }

    try {
      setDirecciones(JSON.parse(savedAddresses));
    } catch (error) {
      localStorage.removeItem(addressStorageKey);
      setDirecciones([]);
    }
  }, [addressStorageKey]);

  if (!user) {
    return <Navigate to="/" />;
  }

  const guardarDirecciones = (nuevasDirecciones) => {
    setDirecciones(nuevasDirecciones);
    localStorage.setItem(addressStorageKey, JSON.stringify(nuevasDirecciones));
  };

  const mostrarMensaje = (texto, tipo = "success") => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje({ texto: "", tipo: "" }), 3500);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDireccionChange = (e) => {
    setDireccionForm({
      ...direccionForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleSaveForm = (e) => {
    e.preventDefault();
    updateProfile(formData);
    mostrarMensaje("Perfil actualizado con éxito.");
  };

  const agregarDireccion = (e) => {
    e.preventDefault();

    if (
      !direccionForm.alias.trim() ||
      !direccionForm.destinatario.trim() ||
      !direccionForm.calle.trim() ||
      !direccionForm.ciudad.trim()
    ) {
      mostrarMensaje("Completa alias, destinatario, calle y ciudad.", "warning");
      return;
    }

    const nuevaDireccion = {
      ...direccionForm,
      id: Date.now().toString(),
      principal: direcciones.length === 0,
    };

    guardarDirecciones([...direcciones, nuevaDireccion]);
    setDireccionForm(crearDireccionVacia());
    mostrarMensaje("Dirección guardada correctamente.");
  };

  const marcarPrincipal = (id) => {
    guardarDirecciones(
      direcciones.map((direccion) => ({
        ...direccion,
        principal: direccion.id === id,
      })),
    );
    mostrarMensaje("Dirección principal actualizada.");
  };

  const eliminarDireccion = (id) => {
    const restantes = direcciones.filter((direccion) => direccion.id !== id);
    const teniaPrincipal = direcciones.find((direccion) => direccion.id === id)
      ?.principal;

    if (teniaPrincipal && restantes.length > 0) {
      restantes[0].principal = true;
    }

    guardarDirecciones(restantes);
    mostrarMensaje("Dirección eliminada.", "info");
  };

  const handlePhotoClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      updateProfile({ avatarUrl: reader.result });
      mostrarMensaje("Imagen de perfil actualizada en este navegador.", "info");
    };
    reader.readAsDataURL(file);
  };

  const direccionPrincipal = direcciones.find((direccion) => direccion.principal);

  return (
    <div className="profile-wrapper">
      <div className="container">
        <div className="profile-card profile-account-layout">
          <aside className="profile-sidebar">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: "none" }}
              accept="image/*"
            />

            <div className="profile-avatar-container">
              <img src={user.avatarUrl} alt="Avatar" className="profile-avatar" />
              <button
                className="btn-change-photo"
                title="Cambiar foto de perfil"
                onClick={handlePhotoClick}
              >
                <FiCamera size={20} />
              </button>
            </div>

            <h3 className="sidebar-name">{user.nombre}</h3>
            <p className="sidebar-username">@{user.username}</p>

            <div className="profile-side-list">
              <div>
                <FiShield />
                <span>Cuenta verificada</span>
              </div>
              <div>
                <FiMapPin />
                <span>{direcciones.length} dirección(es)</span>
              </div>
              <div>
                <FiStar />
                <span>Cliente desde 2026</span>
              </div>
            </div>

            {direccionPrincipal && (
              <div className="profile-primary-address">
                <strong>Dirección principal</strong>
                <p>{direccionPrincipal.alias}</p>
                <span>
                  {direccionPrincipal.ciudad}, {direccionPrincipal.estado}
                </span>
              </div>
            )}
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
                <h2>Perfil y direcciones</h2>
                <p>
                  Mantén actualizados tus datos para agilizar compras, entregas
                  y contacto de la tienda.
                </p>
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

            <section className="profile-section-card">
              <div className="profile-section-heading">
                <h3>Libreta de direcciones</h3>
                <p>Guarda varias direcciones y marca una como principal.</p>
              </div>

              <div className="address-grid">
                {direcciones.length === 0 ? (
                  <div className="address-empty">
                    <FiHome />
                    <h4>Aún no tienes direcciones guardadas</h4>
                    <p>Agrega una dirección para usarla después en tus compras.</p>
                  </div>
                ) : (
                  direcciones.map((direccion) => (
                    <article className="address-card" key={direccion.id}>
                      <div className="address-card-header">
                        <div>
                          <h4>{direccion.alias}</h4>
                          <span>{direccion.destinatario}</span>
                        </div>
                        {direccion.principal && (
                          <span className="address-default-badge">
                            Principal
                          </span>
                        )}
                      </div>

                      <p>
                        {direccion.calle}
                        {direccion.colonia ? `, ${direccion.colonia}` : ""}
                      </p>
                      <p>
                        {direccion.ciudad}
                        {direccion.estado ? `, ${direccion.estado}` : ""}{" "}
                        {direccion.codigoPostal}
                      </p>
                      {direccion.referencias && (
                        <small>{direccion.referencias}</small>
                      )}

                      <div className="address-actions">
                        {!direccion.principal && (
                          <button
                            type="button"
                            onClick={() => marcarPrincipal(direccion.id)}
                          >
                            Usar como principal
                          </button>
                        )}
                        <button
                          type="button"
                          className="address-delete-btn"
                          onClick={() => eliminarDireccion(direccion.id)}
                          title="Eliminar dirección"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </article>
                  ))
                )}
              </div>

              <form className="address-form" onSubmit={agregarDireccion}>
                <h4>
                  <FiPlus /> Agregar dirección
                </h4>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label-custom">Alias</label>
                    <input
                      className="form-control form-control-custom"
                      name="alias"
                      value={direccionForm.alias}
                      onChange={handleDireccionChange}
                      placeholder="Casa, trabajo, veterinaria..."
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label-custom">Recibe</label>
                    <input
                      className="form-control form-control-custom"
                      name="destinatario"
                      value={direccionForm.destinatario}
                      onChange={handleDireccionChange}
                      placeholder="Nombre de quien recibe"
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-8 mb-3">
                    <label className="form-label-custom">Calle y número</label>
                    <input
                      className="form-control form-control-custom"
                      name="calle"
                      value={direccionForm.calle}
                      onChange={handleDireccionChange}
                    />
                  </div>
                  <div className="col-md-4 mb-3">
                    <label className="form-label-custom">Código postal</label>
                    <input
                      className="form-control form-control-custom"
                      name="codigoPostal"
                      value={direccionForm.codigoPostal}
                      onChange={handleDireccionChange}
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-4 mb-3">
                    <label className="form-label-custom">Colonia</label>
                    <input
                      className="form-control form-control-custom"
                      name="colonia"
                      value={direccionForm.colonia}
                      onChange={handleDireccionChange}
                    />
                  </div>
                  <div className="col-md-4 mb-3">
                    <label className="form-label-custom">Ciudad</label>
                    <input
                      className="form-control form-control-custom"
                      name="ciudad"
                      value={direccionForm.ciudad}
                      onChange={handleDireccionChange}
                    />
                  </div>
                  <div className="col-md-4 mb-3">
                    <label className="form-label-custom">Estado</label>
                    <input
                      className="form-control form-control-custom"
                      name="estado"
                      value={direccionForm.estado}
                      onChange={handleDireccionChange}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label-custom">Referencias</label>
                  <textarea
                    className="form-control form-control-custom"
                    name="referencias"
                    rows="2"
                    value={direccionForm.referencias}
                    onChange={handleDireccionChange}
                    placeholder="Color de fachada, entre calles, indicaciones para entrega..."
                  />
                </div>

                <button type="submit" className="address-add-btn">
                  <FiPlus /> Guardar dirección
                </button>
              </form>
            </section>
          </section>
        </div>
      </div>
    </div>
  );
}

export default Perfil;
