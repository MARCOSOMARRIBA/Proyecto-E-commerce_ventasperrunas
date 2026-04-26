import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { FiPackage, FiEye, FiCheck, FiTruck, FiClock, FiMessageSquare, FiBox } from 'react-icons/fi';

const OrdenesExtranet = () => {
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  
  // Estado para el Modal de Detalles
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);

  // ID simulado del proveedor logueado
  const RFC_PROVEEDOR_LOGUEADO = 'PUR980101XYZ';

  useEffect(() => {
    // Escuchar los pedidos dirigidos a este proveedor
    const q = query(
      collection(db, 'pedidos_b2b'),
      where('id_proveedor', '==', RFC_PROVEEDOR_LOGUEADO)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const listaPedidos = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        // Formatear la fecha para que sea legible
        const fechaFormat = data.fecha ? data.fecha.toDate().toLocaleString() : 'Reciente';
        listaPedidos.push({ id_firebase: doc.id, ...data, fechaFormateada: fechaFormat });
      });
      
      // Ordenamos para que los más recientes salgan arriba
      listaPedidos.sort((a, b) => b.fecha?.toMillis() - a.fecha?.toMillis());
      setPedidos(listaPedidos);
      setCargando(false);
    });

    return () => unsubscribe();
  }, []);

  // Función para cambiar el estado del pedido (Ej. de Solicitado a Enviado)
  const actualizarEstadoPedido = async (id, nuevoEstado) => {
    try {
      const pedidoRef = doc(db, 'pedidos_b2b', id);
      await updateDoc(pedidoRef, {
        estado: nuevoEstado
      });
      alert(`El pedido ha sido marcado como: ${nuevoEstado}`);
      setPedidoSeleccionado(null); // Cierra el modal
    } catch (error) {
      console.error("Error al actualizar el estado:", error);
      alert("Hubo un error al actualizar el pedido.");
    }
  };

  const getBadgeEstado = (estado) => {
    switch (estado) {
      case 'SOLICITADO': return <span className="badge bg-warning text-dark"><FiClock className="me-1"/> Nuevo Pedido</span>;
      case 'PREPARANDO': return <span className="badge bg-info text-dark"><FiBox className="me-1"/> En Preparación</span>;
      case 'ENVIADO': return <span className="badge bg-success"><FiTruck className="me-1"/> Enviado</span>;
      default: return <span className="badge bg-secondary">{estado}</span>;
    }
  };

  return (
    <div className="animate__animated animate__fadeIn p-4">
      <div className="mb-4">
        <h2 className="fw-bold m-0 text-dark d-flex align-items-center gap-2">
          <FiPackage className="text-warning" /> Bandeja de Pedidos B2B
        </h2>
        <p className="text-muted">Gestiona las solicitudes de resurtido de Ventas Perrunas.</p>
      </div>

      <div className="card shadow-sm border-0 fade-in-up">
        <div className="card-body p-0">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-dark text-white small">
              <tr>
                <th className="ps-4 py-3">FECHA Y HORA</th>
                <th>CLIENTE</th>
                <th>ARTÍCULOS</th>
                <th>MONTO ESTIMADO</th>
                <th>ESTADO</th>
                <th className="text-center">ACCIÓN</th>
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr><td colSpan="6" className="text-center py-5 text-muted">Cargando bandeja de entrada...</td></tr>
              ) : pedidos.length > 0 ? (
                pedidos.map((pedido) => (
                  <tr key={pedido.id_firebase} className={pedido.estado === 'SOLICITADO' ? 'table-warning' : ''}>
                    <td className="ps-4 text-muted small fw-bold">{pedido.fechaFormateada}</td>
                    <td className="fw-bold text-dark">Ventas Perrunas</td>
                    <td>{pedido.articulos_totales} unids.</td>
                    <td className="text-success fw-bold">${parseFloat(pedido.monto_estimado || 0).toFixed(2)}</td>
                    <td>{getBadgeEstado(pedido.estado)}</td>
                    <td className="text-center">
                      <button 
                        onClick={() => setPedidoSeleccionado(pedido)}
                        className="btn btn-sm btn-primary fw-bold shadow-sm hover-scale"
                      >
                        <FiEye className="me-1" /> Revisar
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-5 text-muted">
                    <FiCheck size={40} className="text-success mb-2 opacity-50" /><br/>
                    No tienes pedidos pendientes.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================
          MODAL DE DETALLES DEL PEDIDO (VISTA PROVEEDOR)
      ======================================================== */}
      {pedidoSeleccionado && (
        <>
          <div className="modal-backdrop fade show" style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(4px)', zIndex: 1040 }}></div>
          <div className="modal d-block" tabIndex="-1" style={{ zIndex: 1050 }}>
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content bg-white border-0 shadow-lg overflow-hidden" style={{ borderRadius: '16px' }}>
                
                <div className="bg-dark text-white p-4 d-flex justify-content-between align-items-center">
                  <h5 className="modal-title fw-bold m-0 d-flex align-items-center gap-2">
                    <FiPackage className="text-warning" /> Detalles de la Solicitud
                  </h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setPedidoSeleccionado(null)}></button>
                </div>
                
                <div className="modal-body p-4 bg-light">
                  
                  {/* Mensaje del Administrador */}
                  {pedidoSeleccionado.mensaje_admin && (
                    <div className="alert alert-info border-0 shadow-sm mb-4 d-flex gap-3">
                      <FiMessageSquare size={24} className="text-info mt-1" />
                      <div>
                        <strong className="d-block mb-1 text-dark">Nota del Cliente (Ventas Perrunas):</strong>
                        <span className="fst-italic text-secondary">"{pedidoSeleccionado.mensaje_admin}"</span>
                      </div>
                    </div>
                  )}

                  <h6 className="fw-bold text-muted mb-3">LISTA DE ARTÍCULOS REQUERIDOS</h6>
                  <div className="card border-0 shadow-sm mb-4">
                    <ul className="list-group list-group-flush">
                      {pedidoSeleccionado.detalle_productos?.map((item, index) => (
                        <li key={index} className="list-group-item d-flex justify-content-between align-items-center py-3">
                          <div className="d-flex align-items-center gap-3">
                            <span className="badge bg-dark rounded-pill fs-6">{item.cantidad}x</span>
                            <div>
                              <span className="fw-bold d-block">{item.nombre}</span>
                              <small className="text-muted">SKU/ID: {item.id}</small>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Acciones de cambio de estado */}
                  <div className="d-flex justify-content-end gap-3 mt-4 pt-3 border-top">
                    {pedidoSeleccionado.estado === 'SOLICITADO' && (
                      <button onClick={() => actualizarEstadoPedido(pedidoSeleccionado.id_firebase, 'PREPARANDO')} className="btn btn-info text-white fw-bold shadow-sm hover-scale">
                        <FiBox /> Marcar en Preparación
                      </button>
                    )}
                    
                    {(pedidoSeleccionado.estado === 'SOLICITADO' || pedidoSeleccionado.estado === 'PREPARANDO') && (
                      <button onClick={() => actualizarEstadoPedido(pedidoSeleccionado.id_firebase, 'ENVIADO')} className="btn btn-success fw-bold shadow-sm hover-scale">
                        <FiTruck /> Marcar como Enviado
                      </button>
                    )}
                  </div>

                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default OrdenesExtranet;