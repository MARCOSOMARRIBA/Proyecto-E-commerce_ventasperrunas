import React, { useContext, useState, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { FiCamera, FiSave, FiAlertTriangle } from 'react-icons/fi';

function Perfil() {
  const { user, updateProfile } = useContext(AuthContext);
  
  // Referencia para simular el click en el input file (invisible)
  const fileInputRef = useRef(null);

  // 1. LOS HOOKS SIEMPRE VAN HASTA ARRIBA.
  // Estado local para el formulario de edición, inicia con los datos actuales
  const [formData, setFormData] = useState({
    nombre: user?.nombre || '',
    telefono: user?.telefono || '',
    direccion: user?.direccion || ''
  });
  
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });

  // 2. LA CONDICIÓN VA DESPUÉS DE LOS HOOKS.
  // Si tratamos de entrar aquí sin estar logueados, nos bota al inicio de inmediato.
  if (!user) {
    return <Navigate to="/" />;
  }

  // Lógica para el formulario de edición
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSaveForm = (e) => {
    e.preventDefault();
    updateProfile(formData); // Actualizamos la memoria global
    setMensaje({ texto: '¡Perfil actualizado con éxito!', tipo: 'success' });
    setTimeout(() => setMensaje({ texto: '', tipo: '' }), 3000); // Borramos el mensaje en 3 segundos
  };

  // --- LÓGICA DE SIMULACIÓN DEL CAMBIO DE FOTO ---
  const handlePhotoClick = () => {
    // Al hacer clic en el botón de la cámara, "disparamos" el input file invisible
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Como no tenemos backend, convertimos la imagen local a una URL base64 temporal
      const reader = new FileReader();
      reader.onloadend = () => {
        const nuevaUrl = reader.result; // Esta URL es local y temporal
        updateProfile({ avatarUrl: nuevaUrl }); // Actualizamos la memoria global
        setMensaje({ texto: 'Imagen de perfil simulada con éxito. (Falta Backend para guardado permanente)', tipo: 'info' });
        setTimeout(() => setMensaje({ texto: '', tipo: '' }), 4000); // Borramos el mensaje en 4 segundos
      };
      reader.readAsDataURL(file); // Leemos el archivo local
    }
  };

  return (
    <div className="profile-wrapper">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-11">
            <div className="card profile-card">
              <div className="row g-0">
                
                {/* Columna Izquierda (Sidebar: Resumen y Foto) */}
                <div className="col-lg-4 profile-sidebar">
                  
                  {/* Input File Invisible para simular la subida */}
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} accept="image/*" />

                  <div className="profile-avatar-container">
                    <img src={user.avatarUrl} alt="Avatar" className="profile-avatar" />
                    {/* Botón flotante para cambiar foto */}
                    <button className="btn-change-photo" title="Cambiar foto de perfil" onClick={handlePhotoClick}>
                      <FiCamera size={20} />
                    </button>
                  </div>

                  <h3 className="sidebar-name">{user.nombre}</h3>
                  <p className="sidebar-username">@{user.username}</p>
                  
                  <p className="sidebar-join-date text-muted">Miembro desde 2026</p>
                </div>

                {/* Columna Derecha (Details: Formulario) */}
                <div className="col-lg-8 profile-details">
                  
                  {mensaje.texto && (
                    <div className={`alert alert-${mensaje.tipo} d-flex align-items-center gap-2 mb-4`} role="alert">
                      {mensaje.tipo === 'info' && <FiAlertTriangle size={20} />}
                      {mensaje.texto}
                    </div>
                  )}

                  <div className="d-flex justify-content-between align-items-center mb-5">
                    <h2 className="mb-0">Editar Perfil</h2>
                    <span className="badge-account">Cuenta Verificada 🐾</span>
                  </div>

                  <form onSubmit={handleSaveForm}>
                    <div className="mb-4">
                      <label className="form-label-custom">Correo electrónico</label>
                      <input type="email" className="form-control form-control-custom bg-light" value={user.email} disabled />
                      <small className="text-muted mt-1 d-block">Este campo no es editable.</small>
                    </div>

                    <div className="row mb-4">
                      <div className="col-md-6 mb-3 mb-md-0">
                        <label className="form-label-custom">Nombre</label>
                        <input type="text" className="form-control form-control-custom" name="nombre" value={formData.nombre} onChange={handleChange} required />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label-custom">Teléfono</label>
                        <input type="text" className="form-control form-control-custom" name="telefono" value={formData.telefono} onChange={handleChange} />
                      </div>
                    </div>

                    <div className="mb-5">
                      <label className="form-label-custom">Dirección de Envío</label>
                      <textarea className="form-control form-control-custom" name="direccion" rows="3" value={formData.direccion} onChange={handleChange}></textarea>
                    </div>

                    <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                      <button type="submit" className="btn btn-cyan d-flex align-items-center gap-2" style={{backgroundColor: '#2cb1ff', color: 'white', border: 'none', padding: '12px 30px', borderRadius: '5px', fontWeight: '600'}}>
                        <FiSave /> Guardar Cambios
                      </button>
                    </div>
                  </form>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Perfil;