import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useMessage } from '../context/MessageContext';

const CrearUsuarioAdmin = () => {
  const { user } = useContext(AuthContext);
  const { showMessage } = useMessage();
  const [cargando, setCargando] = useState(false);
  
  // 🚀 1. Nuevo estado para guardar la contraseña que nos devuelve Django
  const [passwordGenerada, setPasswordGenerada] = useState(null);

  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    rol: '2' // Por defecto Empleado
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    setPasswordGenerada(null); // Limpiamos contraseñas anteriores al intentar crear uno nuevo

    try {
      const res = await fetch('http://localhost:8000/api/usuarios/crear-admin/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          id_admin: user.id // Mandamos el ID del admin por seguridad/auditoría
        })
      });

      const data = await res.json();

      if (res.ok) {
        showMessage({ title: "Éxito", message: data.mensaje, type: "success" });
        
        // 🚀 2. Guardamos la contraseña en el estado para mostrarla en pantalla
        setPasswordGenerada(data.password_temporal);
        
        // Limpiamos el formulario
        setFormData({ nombre: '', correo: '', rol: '2' });
      } else {
        showMessage({ title: "Error", message: data.error, type: "error" });
      }
    } catch (error) {
      showMessage({ title: "Error", message: "Fallo la conexión con el servidor", type: "error" });
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="card shadow-sm border-0 rounded-4 p-4 mt-4 position-relative" style={{ maxWidth: '500px', margin: '0 auto' }}>
      <h4 className="fw-bold mb-4 text-primary">Alta de Nuevo Personal</h4>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label text-secondary fw-bold small">Nombre Completo</label>
          <input 
            type="text" 
            className="form-control bg-light" 
            name="nombre"
            value={formData.nombre} 
            onChange={handleChange} 
            required 
            placeholder="Ej. Juan Pérez"
          />
        </div>

        <div className="mb-3">
          <label className="form-label text-secondary fw-bold small">Correo Electrónico</label>
          <input 
            type="email" 
            className="form-control bg-light" 
            name="correo"
            value={formData.correo} 
            onChange={handleChange} 
            required 
            placeholder="empleado@ventasperrunas.com"
          />
        </div>

        <div className="mb-4">
          <label className="form-label text-secondary fw-bold small">Asignar Rol</label>
          <select 
            className="form-select bg-light" 
            name="rol"
            value={formData.rol} 
            onChange={handleChange}
          >
            <option value="2">Empleado (Operaciones)</option>
            <option value="4">Proveedor (Extranet)</option>
          </select>
        </div>

        <button 
          type="submit" 
          className="btn btn-primary w-100 fw-bold rounded-pill mb-3" 
          disabled={cargando}
        >
          {cargando ? 'Registrando...' : 'Crear Usuario'}
        </button>
      </form>

      {/* 🚀 3. PANEL DE ÉXITO Y CONTRASEÑA */}
      {passwordGenerada && (
        <div className="alert alert-success mt-2 border-success bg-success bg-opacity-10 shadow-sm fade-in-up" role="alert">
          <h5 className="alert-heading fw-bold text-success mb-2">¡Credenciales Generadas!</h5>
          <p className="mb-3 text-dark" style={{ fontSize: '0.9rem' }}>
            Copia esta contraseña temporal y entrégala al nuevo usuario. <strong>Por seguridad, no se volverá a mostrar.</strong>
          </p>
          <div className="bg-white p-3 rounded text-center border border-success border-opacity-50">
            <span className="fs-3 fw-bold font-monospace text-dark user-select-all" style={{ letterSpacing: '2px' }}>
              {passwordGenerada}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CrearUsuarioAdmin;