import React, { useState, useEffect } from 'react';
import { FiEye, FiShoppingBag, FiX } from 'react-icons/fi';

const OrdenesClientesIntranet = () => {
  const [ordenes, setOrdenes] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Estados para el Modal de Detalles
  const [modalDetalle, setModalDetalle] = useState(false);
  const [ordenSeleccionada, setOrdenSeleccionada] = useState(null);
  const [detallesOrden, setDetallesOrden] = useState([]);
  const [cargandoDetalles, setCargandoDetalles] = useState(false);

  useEffect(() => {
    const fetchOrdenes = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8000/api/ordenes/');
        if (res.ok) {
          const data = await res.json();
          setOrdenes(data);
        }
      } catch (error) {
        console.error("Error al cargar órdenes:", error);
      } finally {
        setCargando(false);
      }
    };
    fetchOrdenes();
  }, []);

  const actualizarEstatus = async (id_orden, nuevoEstatus) => {
    // Actualización visual rápida
    setOrdenes(ordenes.map(orden => 
      orden.id_orden === id_orden ? { ...orden, estatus: nuevoEstatus } : orden
    ));

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/ordenes/${id_orden}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estatus: nuevoEstatus }) // Manda '1', '2' o '3'
      });
      if (!res.ok) throw new Error("Error en servidor");
    } catch (error) {
      console.error("Error:", error);
      alert("No se pudo guardar el cambio en la base de datos.");
    }
  };

  // 🎨 Asignamos colores según las 3 reglas de tu manual
  const getColorPorEstado = (estado) => {
    switch (String(estado)) {
      case '1': return 'text-warning'; // Pendiente
      case '2': return 'text-info';    // Enviado
      case '3': return 'text-success'; // Recibido
      default: return 'text-secondary';
    }
  };

  const abrirDetalles = async (orden) => {
    setOrdenSeleccionada(orden);
    setModalDetalle(true);
    setCargandoDetalles(true);

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/detalle-orden/${orden.id_orden}/`);
      if (res.ok) {
        const data = await res.json();
        setDetallesOrden(data);
      } else {
        setDetallesOrden([]);
      }
    } catch (error) {
      console.error("Error cargando detalles:", error);
    } finally {
      setCargandoDetalles(false);
    }
  };

  return (
    <div className="animate__animated animate__fadeIn p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold m-0 text-primary">Órdenes de Clientes</h2>
          <p className="text-muted">Gestiona los pedidos y prepara los paquetes.</p>
        </div>
      </div>

      <div className="card shadow-sm border-0 fade-in-up rounded-4">
        <div className="card-body p-0 overflow-auto">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-dark text-white small">
              <tr>
                <th className="ps-4 py-3">ID ORDEN</th>
                <th>CLIENTE</th>
                <th>FECHA</th>
                <th>TOTAL</th>
                <th>ESTADO</th>
                <th className="text-center pe-4">DETALLES</th>
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr><td colSpan="6" className="text-center py-4 text-muted">Cargando órdenes...</td></tr>
              ) : ordenes.length > 0 ? (
                ordenes.map((orden) => (
                  <tr key={orden.id_orden}>
                    <td className="ps-4 fw-bold text-secondary">#{orden.id_orden}</td>
                    <td className="fw-medium text-dark">{orden.id_usuario}</td>
                    <td className="text-muted small">
                      {orden.fecha_creacion ? new Date(orden.fecha_creacion).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="fw-bold text-success">
                      ${parseFloat(orden.total_orden || 0).toLocaleString()}
                    </td>
                    
                    <td>
                      {/* 🔥 SELECTOR LIMITADO A LAS 3 OPCIONES OFICIALES */}
                      <select 
                        className={`form-select form-select-sm fw-bold ${getColorPorEstado(orden.estatus)}`}
                        style={{ width: '130px', backgroundColor: '#f8f9fa', border: 'none' }}
                        value={orden.estatus || "1"}
                        onChange={(e) => actualizarEstatus(orden.id_orden, e.target.value)}
                      >
                        <option value="1" className="text-dark">Pendiente</option>
                        <option value="2" className="text-dark">Enviado</option>
                        <option value="3" className="text-dark">Recibido</option>
                      </select>
                    </td>

                    <td className="text-center pe-4">
                      <button 
                        onClick={() => abrirDetalles(orden)}
                        className="btn btn-sm btn-outline-primary border-0 rounded-circle shadow-sm" 
                        title="Ver Detalles de Empaque"
                      >
                        <FiEye size={20} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="6" className="text-center py-5 text-muted">No hay órdenes registradas.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DE DETALLES */}
      {modalDetalle && ordenSeleccionada && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(3px)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="modal-header border-0 bg-primary text-white p-4">
                <div>
                  <h4 className="modal-title fw-bold mb-1 d-flex align-items-center gap-2">
                    <FiShoppingBag /> Empaque - Orden #{ordenSeleccionada.id_orden}
                  </h4>
                  <small className="opacity-75">Cliente ID: {ordenSeleccionada.id_usuario}</small>
                </div>
                <button type="button" className="btn text-white fs-4" onClick={() => setModalDetalle(false)}><FiX /></button>
              </div>
              <div className="modal-body p-4 bg-light">
                {cargandoDetalles ? (
                  <div className="text-center py-5 text-muted">Cargando productos a empacar...</div>
                ) : detallesOrden.length === 0 ? (
                  <div className="text-center py-5 text-muted bg-white rounded-3 shadow-sm">No se encontraron productos en esta orden.</div>
                ) : (
                  <div className="row g-3">
                    {detallesOrden.map((detalle, idx) => (
                      <div className="col-md-6" key={idx}>
                        <div className="card border-0 shadow-sm h-100 rounded-3">
                          <div className="card-body d-flex justify-content-between align-items-center">
                            <div>
                              <h6 className="fw-bold m-0 text-dark mb-2">{detalle.producto}</h6>
                              <span className="badge bg-primary rounded-pill px-3 py-2 fs-6">
                                {detalle.cantidad} Unidades
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdenesClientesIntranet;