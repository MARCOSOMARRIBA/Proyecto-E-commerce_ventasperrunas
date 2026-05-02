import React, { useState, useEffect } from 'react';
import { FiLayers, FiCheck, FiX, FiBox } from 'react-icons/fi';

const InventarioIntranet = () => {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/productos/');
      if (res.ok) {
        const data = await res.json();
        setProductos(data);
      }
    } catch (error) {
      console.error("Error cargando inventario:", error);
    } finally {
      setCargando(false);
    }
  };

  // Función mágica para cambiar el estado con un solo clic (Usa método PATCH)
  const cambiarStock = async (id_producto, stockActual) => {
    const nuevoStock = !stockActual;

    // Actualizamos la UI inmediatamente para que se sienta súper rápido
    setProductos(productos.map(p => p.id_producto === id_producto ? { ...p, stock: nuevoStock } : p));

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/productos/${id_producto}/`, {
        method: 'PATCH', // Usamos PATCH para actualizar solo un campo de la base de datos
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: nuevoStock })
      });

      if (!res.ok) {
        // Si falla en el backend, regresamos el switch a como estaba
        alert("Error al actualizar la base de datos.");
        setProductos(productos.map(p => p.id_producto === id_producto ? { ...p, stock: stockActual } : p));
      }
    } catch (error) {
      console.error("Error de conexión:", error);
    }
  };

  return (
    <div className="p-4 animate__animated animate__fadeIn">
      <div className="mb-4">
        <h2 className="fw-bold m-0 d-flex align-items-center gap-2 text-dark">
          <FiLayers className="text-primary" /> Control de Stock Rápido
        </h2>
        <p className="text-muted small m-0">Activa o desactiva la disponibilidad de los productos en la tienda pública.</p>
      </div>

      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-body p-0 overflow-auto">
          <table className="table table-hover align-middle mb-0 bg-white">
            <thead className="bg-dark text-white small">
              <tr>
                <th className="ps-4 py-3">PRODUCTO</th>
                <th>CATEGORÍA</th>
                <th>PRECIO</th>
                <th className="text-center pe-4">DISPONIBILIDAD (STOCK)</th>
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr><td colSpan="4" className="text-center py-5 text-muted">Cargando inventario...</td></tr>
              ) : productos.length === 0 ? (
                <tr><td colSpan="4" className="text-center py-5 text-muted">Aún no hay productos registrados.</td></tr>
              ) : (
                productos.map(prod => (
                  <tr key={prod.id_producto}>
                    <td className="ps-4">
                      <div className="d-flex align-items-center gap-3">
                        {prod.imagen ? (
                          <img src={prod.imagen} alt="prod" style={{width: '45px', height: '45px', objectFit: 'cover', borderRadius: '10px'}} />
                        ) : (
                          <div className="bg-light d-flex align-items-center justify-content-center text-muted" style={{width: '45px', height: '45px', borderRadius: '10px'}}><FiBox/></div>
                        )}
                        <div>
                          <strong className="d-block text-dark">{prod.nombre}</strong>
                          <small className="text-muted">ID: #{prod.id_producto}</small>
                        </div>
                      </div>
                    </td>
                    <td><span className="badge bg-light text-secondary border">Cat: {prod.id_categoria}</span></td>
                    <td className="fw-bold text-success">${parseFloat(prod.precio).toLocaleString()}</td>
                    <td className="text-center pe-4">
                      
                      {/* BOTÓN MÁGICO DE STOCK */}
                      <button 
                        onClick={() => cambiarStock(prod.id_producto, prod.stock)}
                        className={`btn btn-sm px-4 py-2 rounded-pill fw-bold border-0 d-inline-flex align-items-center gap-2 ${prod.stock ? 'btn-success bg-opacity-25 text-success' : 'btn-danger bg-opacity-25 text-danger'}`}
                        style={{ width: '140px', justifyContent: 'center', transition: 'all 0.2s ease' }}
                      >
                        {prod.stock ? (
                          <><FiCheck size={18}/> En Stock</>
                        ) : (
                          <><FiX size={18}/> Agotado</>
                        )}
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

export default InventarioIntranet;