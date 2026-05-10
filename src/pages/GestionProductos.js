import React, { useState, useEffect } from 'react';
import { FiBox, FiPlus, FiEye, FiEyeOff, FiCheck, FiX } from 'react-icons/fi';

const GestionProductos = () => {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  
  // Estado para el nuevo producto
  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: '', descripcion: '', precio: '', imagen: '', id_categoria: '', stock: true, activo: true
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [resProd, resCat] = await Promise.all([
        fetch('http://127.0.0.1:8000/api/productos/'),
        fetch('http://127.0.0.1:8000/api/categorias/') // Asegúrate de tener esta ruta o quita las categorías si no las usas
      ]);
      if (resProd.ok) setProductos(await resProd.json());
      if (resCat.ok) setCategorias(await resCat.json());
    } catch (error) {
      console.error("Error al cargar datos:", error);
    } finally {
      setCargando(false);
    }
  };

  // 👁️ FUNCIÓN PARA MOSTRAR/OCULTAR EN LA WEB AL INSTANTE
  const toggleVisibilidad = async (producto) => {
    const nuevoEstado = !producto.activo;
    
    // Actualización visual rápida
    setProductos(productos.map(p => p.id_producto === producto.id_producto ? { ...p, activo: nuevoEstado } : p));

    try {
      await fetch(`http://127.0.0.1:8000/api/productos/${producto.id_producto}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activo: nuevoEstado })
      });
    } catch (error) {
      console.error("Error al cambiar visibilidad:", error);
      alert("Hubo un error al conectar con la base de datos.");
    }
  };

  const guardarProducto = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://127.0.0.1:8000/api/productos/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoProducto)
      });
      if (res.ok) {
        setMostrarModal(false);
        setNuevoProducto({ nombre: '', descripcion: '', precio: '', imagen: '', id_categoria: '', stock: true, activo: true });
        cargarDatos();
        alert("¡Producto agregado a la tienda!");
      }
    } catch (error) {
      console.error("Error al guardar:", error);
    }
  };

  return (
    <div className="p-4 animate__animated animate__fadeIn">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold m-0 text-primary d-flex align-items-center gap-2"><FiBox /> Catálogo de Productos</h2>
          <p className="text-muted small">Gestiona qué productos están disponibles y visibles para los clientes.</p>
        </div>
        <button onClick={() => setMostrarModal(true)} className="btn btn-primary fw-bold shadow-sm px-4">
          <FiPlus className="me-2" /> Añadir Producto
        </button>
      </div>

      <div className="card shadow-sm border-0 rounded-4">
        <div className="card-body p-0">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-dark text-white small">
              <tr>
                <th className="ps-4">PRODUCTO</th>
                <th>PRECIO</th>
                <th className="text-center">HAY STOCK</th>
                <th className="text-center">VISIBLE EN WEB</th>
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr><td colSpan="4" className="text-center py-4">Cargando catálogo...</td></tr>
              ) : productos.map(p => (
                <tr key={p.id_producto}>
                  <td className="ps-4">
                    <div className="fw-bold text-dark">{p.nombre}</div>
                    <small className="text-muted">{p.descripcion}</small>
                  </td>
                  <td className="fw-bold text-success">${parseFloat(p.precio).toLocaleString()}</td>
                  <td className="text-center">
                    {p.stock ? <span className="badge bg-success rounded-pill"><FiCheck/> Disponible</span> : <span className="badge bg-danger rounded-pill"><FiX/> Agotado</span>}
                  </td>
                  <td className="text-center">
                    {/* BOTÓN MÁGICO PARA MOSTRAR/OCULTAR EN TIENDA */}
                    <button 
                      onClick={() => toggleVisibilidad(p)}
                      className={`btn btn-sm fw-bold border-0 rounded-pill px-3 ${p.activo ? 'bg-primary text-white' : 'bg-light text-secondary border'}`}
                    >
                      {p.activo ? <><FiEye className="me-1"/> Visible</> : <><FiEyeOff className="me-1"/> Oculto</>}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL PARA AGREGAR PRODUCTO */}
      {mostrarModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(3px)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title fw-bold">Añadir Nuevo Producto</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setMostrarModal(false)}></button>
              </div>
              <form onSubmit={guardarProducto}>
                <div className="modal-body p-4 bg-light">
                  <div className="mb-3">
                    <label className="small fw-bold">Nombre del Producto</label>
                    <input type="text" className="form-control" required value={nuevoProducto.nombre} onChange={e => setNuevoProducto({...nuevoProducto, nombre: e.target.value})} />
                  </div>
                  <div className="mb-3">
                    <label className="small fw-bold">Precio</label>
                    <input type="number" step="0.01" className="form-control" required value={nuevoProducto.precio} onChange={e => setNuevoProducto({...nuevoProducto, precio: e.target.value})} />
                  </div>
                  <div className="mb-3">
                    <label className="small fw-bold">Descripción (Opcional)</label>
                    <input type="text" className="form-control" value={nuevoProducto.descripcion} onChange={e => setNuevoProducto({...nuevoProducto, descripcion: e.target.value})} />
                  </div>
                  <div className="mb-3">
                    <label className="small fw-bold">URL de la Imagen (Opcional)</label>
                    <input type="text" className="form-control" value={nuevoProducto.imagen} onChange={e => setNuevoProducto({...nuevoProducto, imagen: e.target.value})} />
                  </div>
                  <div className="mb-3">
                    <label className="small fw-bold">ID Categoría</label>
                    {/* Si tienes un endpoint de categorías pon un select, sino un input numérico sirve temporalmente */}
                    <input type="number" className="form-control" required value={nuevoProducto.id_categoria} onChange={e => setNuevoProducto({...nuevoProducto, id_categoria: e.target.value})} />
                  </div>
                </div>
                <div className="modal-footer border-0">
                  <button type="submit" className="btn btn-primary w-100 fw-bold">Guardar en Catálogo</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionProductos;