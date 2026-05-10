import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useMessage } from '../context/MessageContext';

const CrearUsuarioAdmin = () => {
  const { user } = useContext(AuthContext);
  const { showMessage } = useMessage();
  const [cargando, setCargando] = useState(false);

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
    <div className="card shadow-sm border-0 rounded-4 p-4 mt-4" style={{ maxWidth: '500px', margin: '0 auto' }}>
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
          className="btn btn-primary w-100 fw-bold rounded-pill" 
          disabled={cargando}
        >
          {cargando ? 'Registrando...' : 'Crear Usuario'}
        </button>
      </form>
    </div>
  );
};

export default CrearUsuarioAdmin;