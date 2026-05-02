import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { FiPlus, FiEye, FiPackage, FiCalendar, FiClock, FiCheckCircle, FiX, FiShoppingBag } from 'react-icons/fi';

const PedidosProveedorIntranet = () => {
  const [pedidosBD, setPedidosBD] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [alertaExito, setAlertaExito] = useState(false);
  
  // Estados para el Modal de Detalles "Bonito"
  const [modalDetalle, setModalDetalle] = useState(false);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [detallesPedido, setDetallesPedido] = useState([]);
  const [cargandoDetalles, setCargandoDetalles] = useState(false);

  // Estados del formulario (Omitidos para no hacer el código gigante, mantén los tuyos de productosBase y proveedoresBase)
  // ... (Asegúrate de mantener aquí tus variables de estado de nuevaOrden, productosBase, proveedoresBase y la función enviarOrdenBD)

  useEffect(() => {
    cargarHistorialPedidos();
  }, []);

  const cargarHistorialPedidos = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/pedidos/');
      if (res.ok) {
        const data = await res.json();
        setPedidosBD(data);
      }
    } catch (error) {
      console.error("Error cargando historial:", error);
    }
  };

  // Función para abrir el modal bonito
  const abrirDetalles = async (pedido) => {
    setPedidoSeleccionado(pedido);
    setModalDetalle(true);
    setCargandoDetalles(true);

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/pedidos/${pedido.id_pedido}/detalles/`);
      if (res.ok) {
        const data = await res.json();
        setDetallesPedido(data);
      } else {
        setDetallesPedido([]);
      }
    } catch (error) {
      console.error("Error cargando detalles:", error);
    } finally {
      setCargandoDetalles(false);
    }
  };

  // Función auxiliar para las etiquetas de estado
  const getBadgeEstatus = (estatus) => {
    switch(estatus) {
      case '1': return <span className="badge bg-warning text-dark px-3 py-2 rounded-pill"><FiClock className="me-1"/> Solicitado</span>;
      case '2': return <span className="badge bg-info text-dark px-3 py-2 rounded-pill"><FiPackage className="me-1"/> En Proceso</span>;
      case '4': return <span className="badge bg-success px-3 py-2 rounded-pill"><FiCheckCircle className="me-1"/> Entregado</span>;
      default: return <span className="badge bg-secondary px-3 py-2 rounded-pill">Desconocido</span>;
    }
  };

  return (
    <div className="p-4 animate__animated animate__fadeIn">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold m-0 d-flex align-items-center gap-2 text-dark">
            <FiPackage className="text-primary" /> Historial de Resurtido B2B
          </h2>
          <p className="text-muted small m-0">Gestiona las órdenes enviadas a tus proveedores.</p>
        </div>
        <button onClick={() => setMostrarFormulario(true)} className="btn btn-primary fw-bold shadow-sm px-4">
          <FiPlus className="me-2" /> Nueva Orden
        </button>
      </div>

      {/* AQUÍ IRÍA TU MODAL DE "GENERAR ORDEN" (Mantenlo igual a como lo tenías) */}
      
      {/* TABLA DE HISTORIAL DE PEDIDOS */}
      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-body p-0 overflow-auto">
          <table className="table table-hover align-middle mb-0 bg-white">
            <thead className="bg-dark text-white small">
              <tr>
                <th className="ps-4 py-3">FOLIO</th>
                <th>FECHA</th>
                <th>PROVEEDOR (RFC)</th>
                <th>TOTAL</th>
                <th>ESTATUS</th>
                <th className="text-center pe-4">DETALLE</th>
              </tr>
            </thead>
            <tbody>
              {pedidosBD.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-5 text-muted">Aún no hay órdenes registradas.</td></tr>
              ) : (
                pedidosBD.map(pedido => (
                  <tr key={pedido.id_pedido}>
                    <td className="ps-4 fw-bold text-secondary">#{pedido.id_pedido}</td>
                    <td><FiCalendar className="text-muted me-2"/> {pedido.fecha_compra}</td>
                    <td><span className="badge bg-light text-dark border border-secondary">{pedido.rfc}</span></td>
                    <td className="fw-bold text-success">${parseFloat(pedido.total_compra).toLocaleString()}</td>
                    <td>{getBadgeEstatus(pedido.estatus)}</td>
                    <td className="text-center pe-4">
                      <button onClick={() => abrirDetalles(pedido)} className="btn btn-sm btn-outline-primary border-0 rounded-circle" title="Ver recibo">
                        <FiEye size={20} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL MODERNO DE DETALLES (Adiós formato Excel) */}
      {modalDetalle && pedidoSeleccionado && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(3px)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
              {/* Encabezado del Modal */}
              <div className="modal-header border-0 bg-primary text-white p-4">
                <div>
                  <h4 className="modal-title fw-bold mb-1 d-flex align-items-center gap-2">
                    <FiShoppingBag /> Detalles de Orden #{pedidoSeleccionado.id_pedido}
                  </h4>
                  <small className="opacity-75">Proveedor: {pedidoSeleccionado.rfc} | Fecha: {pedidoSeleccionado.fecha_compra}</small>
                </div>
                <button type="button" className="btn text-white fs-4" onClick={() => setModalDetalle(false)}><FiX /></button>
              </div>

              {/* Cuerpo del Modal */}
              <div className="modal-body p-4 bg-light">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h6 className="fw-bold text-muted m-0">MEMORÁNDUM: {pedidoSeleccionado.descripcion}</h6>
                  {getBadgeEstatus(pedidoSeleccionado.estatus)}
                </div>

                {cargandoDetalles ? (
                  <div className="text-center py-5 text-muted">Cargando partidas...</div>
                ) : detallesPedido.length === 0 ? (
                  <div className="text-center py-5 text-muted bg-white rounded-3 shadow-sm">No se encontraron productos para esta orden.</div>
                ) : (
                  <div className="row g-3">
                    {/* Tarjetas de productos en lugar de tabla de Excel */}
                    {detallesPedido.map((detalle, idx) => (
                      <div className="col-md-6" key={idx}>
                        <div className="card border-0 shadow-sm h-100 rounded-3">
                          <div className="card-body d-flex justify-content-between align-items-center">
                            <div>
                              <small className="text-muted d-block mb-1">Producto ID: {detalle.id_producto}</small>
                              <h6 className="fw-bold m-0 text-dark">
                                {detalle.cantidad} <span className="text-muted fw-normal">unidades x</span> ${parseFloat(detalle.precio_unitario).toLocaleString()}
                              </h6>
                            </div>
                            <div className="text-end">
                              <small className="text-muted d-block mb-1">Subtotal</small>
                              <h5 className="fw-bold text-success m-0">${parseFloat(detalle.precio_subtotal).toLocaleString()}</h5>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Pie del Modal con el Total Gigante */}
              <div className="modal-footer border-0 p-4 bg-white d-flex justify-content-between align-items-center">
                <button type="button" className="btn btn-light border fw-bold" onClick={() => setModalDetalle(false)}>Cerrar</button>
                <div className="text-end">
                  <span className="text-muted fw-bold me-3">TOTAL A PAGAR:</span>
                  <span className="fs-3 fw-bold text-success">${parseFloat(pedidoSeleccionado.total_compra).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PedidosProveedorIntranet;