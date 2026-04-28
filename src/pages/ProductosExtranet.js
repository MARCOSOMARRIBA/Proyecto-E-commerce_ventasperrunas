import React, { useState, useEffect } from 'react';
import { FiBox, FiPlus, FiTrash2, FiEdit, FiSave, FiX } from 'react-icons/fi';

const ProductosExtranet = () => {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [cargando, setCargando] = useState(true);

  // El estado inicial coincide con tu modelo Producto de Django
  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    stock: true, // true = Hay stock, false = Agotado
    imagen: '',
    activo: true,
    id_categoria: ''
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [resProds, resCat] = await Promise.all([
        fetch('http://127.0.0.1:8000/api/productos/'),
        fetch('http://127.0.0.1:8000/api/categorias/')
      ]);
      
      if (resProds.ok) setProductos(await resProds.json());
      if (resCat.ok) setCategorias(await resCat.json());
    } catch (error) {
      console.error("Error al cargar la base de datos:", error);
    } finally {
      setCargando(false);
    }
  };

  const manejarEnvio = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://127.0.0.1:8000/api/productos/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoProducto)
      });

      if (res.ok) {
        alert("¡Producto agregado al catálogo!");
        setMostrarFormulario(false);
        setNuevoProducto({ nombre: '', descripcion: '', precio: '', stock: true, imagen: '', activo: true, id_categoria: '' });
        cargarDatos(); // Recargar la tabla
      } else {
        const errorData = await res.json();
        alert("Error al guardar en Django:\n" + JSON.stringify(errorData, null, 2));
      }
    } catch (error) {
      console.error("Error al enviar:", error);
    }
  };

  const eliminarProducto = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este producto? Podría afectar a pedidos anteriores si no está en cascada.")) return;
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/productos/${id}/`, { method: 'DELETE' });
      if (res.ok) {
        setProductos(productos.filter(p => p.id_producto !== id));
      } else {
        alert("No se puede eliminar porque está asociado a un carrito o pedido.");
      }
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
  };

  // Función para obtener el nombre de la categoría a partir de su ID
  const obtenerNombreCategoria = (id_cat) => {
    const cat = categorias.find(c => c.id_categoria === id_cat);
    return cat ? cat.nombre : 'Sin Categoría';
  };

  return (
    <div className="p-4 animate__animated animate__fadeIn">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold m-0 d-flex align-items-center gap-2 text-dark">
            <FiBox className="text-primary" /> Catálogo de Productos
          </h2>
          <p className="text-muted small m-0">Gestiona los artículos, precios y disponibilidad.</p>
        </div>
        <button onClick={() => setMostrarFormulario(!mostrarFormulario)} className="btn btn-primary fw-bold shadow-sm">
          {mostrarFormulario ? <><FiX className="me-2"/> Cancelar</> : <><FiPlus className="me-2" /> Agregar Producto</>}
        </button>
      </div>

      {/* FORMULARIO DE ALTA DE PRODUCTO */}
      {mostrarFormulario && (
        <div className="card border-0 shadow-sm rounded-4 mb-4 bg-light">
          <div className="card-body p-4">
            <h5 className="fw-bold mb-3 text-primary">Detalles del Nuevo Producto</h5>
            <form onSubmit={manejarEnvio} className="row g-3">
              <div className="col-md-6">
                <label className="fw-bold small text-muted">Nombre del Producto</label>
                <input type="text" className="form-control border-2" required value={nuevoProducto.nombre} onChange={e => setNuevoProducto({...nuevoProducto, nombre: e.target.value})} />
              </div>
              <div className="col-md-3">
                <label className="fw-bold small text-muted">Precio ($)</label>
                <input type="number" step="0.01" className="form-control border-2" required value={nuevoProducto.precio} onChange={e => setNuevoProducto({...nuevoProducto, precio: e.target.value})} />
              </div>
              <div className="col-md-3">
                <label className="fw-bold small text-muted">Categoría</label>
                <select className="form-select border-2" required value={nuevoProducto.id_categoria} onChange={e => setNuevoProducto({...nuevoProducto, id_categoria: e.target.value})}>
                  <option value="">Seleccione...</option>
                  {categorias.map(c => <option key={c.id_categoria} value={c.id_categoria}>{c.nombre}</option>)}
                </select>
              </div>
              <div className="col-md-8">
                <label className="fw-bold small text-muted">Descripción Corta</label>
                <input type="text" className="form-control border-2" value={nuevoProducto.descripcion} onChange={e => setNuevoProducto({...nuevoProducto, descripcion: e.target.value})} />
              </div>
              <div className="col-md-4">
                <label className="fw-bold small text-muted">URL de la Imagen</label>
                <input type="url" className="form-control border-2" placeholder="https://..." value={nuevoProducto.imagen} onChange={e => setNuevoProducto({...nuevoProducto, imagen: e.target.value})} />
              </div>
              
              <div className="col-md-12 d-flex gap-4 mt-3">
                <div className="form-check form-switch fs-6">
                  <input className="form-check-input cursor-pointer" type="checkbox" checked={nuevoProducto.stock} onChange={e => setNuevoProducto({...nuevoProducto, stock: e.target.checked})} />
                  <label className="form-check-label ms-2 mt-1">¿Tiene Stock?</label>
                </div>
                <div className="form-check form-switch fs-6">
                  <input className="form-check-input cursor-pointer" type="checkbox" checked={nuevoProducto.activo} onChange={e => setNuevoProducto({...nuevoProducto, activo: e.target.checked})} />
                  <label className="form-check-label ms-2 mt-1">Visible en tienda</label>
                </div>
              </div>
              
              <div className="col-12 text-end mt-4">
                <button type="submit" className="btn btn-success px-4 fw-bold">
                  <FiSave className="me-2" /> Guardar Producto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TABLA DE PRODUCTOS */}
      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-body p-0 overflow-auto">
          <table className="table table-hover align-middle mb-0 bg-white">
            <thead className="bg-dark text-white small">
              <tr>
                <th className="ps-4 py-3">ID</th>
                <th>PRODUCTO</th>
                <th>CATEGORÍA</th>
                <th>PRECIO</th>
                <th>ESTADO</th>
                <th className="text-center pe-4">ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr><td colSpan="6" className="text-center py-5">Sincronizando inventario...</td></tr>
              ) : productos.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-5 text-muted">No hay productos registrados en la base de datos.</td></tr>
              ) : (
                productos.map(prod => (
                  <tr key={prod.id_producto}>
                    <td className="ps-4 text-muted small">#{prod.id_producto}</td>
                    <td>
                      <div className="d-flex align-items-center gap-3">
                        {prod.imagen ? (
                          <img src={prod.imagen} alt="prod" style={{width: '40px', height: '40px', objectFit: 'cover', borderRadius: '8px'}} />
                        ) : (
                          <div className="bg-light d-flex align-items-center justify-content-center text-muted" style={{width: '40px', height: '40px', borderRadius: '8px'}}><FiBox/></div>
                        )}
                        <div>
                          <strong className="d-block text-dark">{prod.nombre}</strong>
                          <span className="text-muted small">{prod.descripcion || 'Sin descripción'}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge bg-secondary rounded-pill">
                        {obtenerNombreCategoria(prod.id_categoria)}
                      </span>
                    </td>
                    <td className="fw-bold text-success">${parseFloat(prod.precio).toLocaleString()}</td>
                    <td>
                      {prod.stock ? <span className="text-primary fw-bold small"><span className="text-success">●</span> En Stock</span> : <span className="text-danger fw-bold small">● Agotado</span>}
                    </td>
                    <td className="text-center pe-4">
                      <button onClick={() => eliminarProducto(prod.id_producto)} className="btn btn-sm btn-outline-danger border-0">
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductosExtranet;