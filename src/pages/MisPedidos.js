import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { FiClock, FiPackage, FiTruck, FiCheckCircle, FiXCircle } from "react-icons/fi"; // 🚀 Importamos íconos bonitos

function MisPedidos() {
  const { user } = useContext(AuthContext);
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detalle, setDetalle] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [ordenSeleccionada, setOrdenSeleccionada] = useState(null);

  useEffect(() => {
    if (!user) return;

    const fetchPedidos = async () => {
      try {
        const res = await fetch(
          `http://localhost:8000/api/mis-pedidos/${user.id}/`,
        );

        const data = await res.json();
        setPedidos(data);
      } catch (error) {
        console.error("Error cargando pedidos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPedidos();
  }, [user]);

  const abrirDetalle = async (idOrden) => {
    try {
      const res = await fetch(
        `http://localhost:8000/api/detalle-orden/${idOrden}/`,
      );

      const data = await res.json();

      setDetalle(data);
      setOrdenSeleccionada(idOrden);
      setMostrarModal(true);
    } catch (error) {
      console.error("Error cargando detalle:", error);
    }
  };


 // 🎨 FUNCIÓN PARA PINTAR ESTATUS CON LAS 3 REGLAS DEL MANUAL
  const getStatusBadge = (estatus) => {
    switch (String(estatus)) {
      case '1': 
        return <span className="badge bg-warning text-dark px-3 py-2 rounded-pill shadow-sm"><FiClock className="me-1"/> Pendiente</span>;
      case '2': 
        return <span className="badge bg-info text-dark px-3 py-2 rounded-pill shadow-sm"><FiTruck className="me-1"/> Enviado</span>;
      case '3': 
        return <span className="badge bg-success px-3 py-2 rounded-pill shadow-sm"><FiCheckCircle className="me-1"/> Recibido</span>;
      default: 
        return <span className="badge bg-secondary px-3 py-2 rounded-pill shadow-sm">Procesando</span>;
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-warning" role="status"></div>
        <p className="mt-2 text-muted fw-bold">Rastreando tus pedidos perrunos...</p>
      </div>
    );
  }

  return (
    <div className="container mt-5 mb-5 animate__animated animate__fadeIn">
      <h2 className="mb-4 fw-bold" style={{ color: '#0084ff' }}>🐾 Mis Pedidos</h2>

      {pedidos.length === 0 ? (
        <div className="text-center p-5 bg-light rounded-4 shadow-sm">
          <h4 className="text-muted">Aún no has hecho ninguna compra para tu mascota 🐶</h4>
          <p className="mb-0">¡Explora nuestra tienda y encuentra lo mejor para ellos!</p>
        </div>
      ) : (
        pedidos.map((pedido) => (
          <div key={pedido.id} className="card border-0 shadow-sm mb-4 rounded-4 overflow-hidden">
            <div className="card-body p-4">
              <div className="row align-items-center">
                
                {/* Info de la Orden */}
                <div className="col-md-7 mb-3 mb-md-0">
                  <div className="d-flex align-items-center gap-3 mb-2">
                    <h5 className="fw-bold m-0 text-dark">Orden #{pedido.id}</h5>
                    {getStatusBadge(pedido.estado || pedido.estatus)} 
                  </div>
                  <p className="text-muted small mb-1">
                    <FiClock className="me-1"/> Fecha de compra: {new Date(pedido.fecha).toLocaleString()}
                  </p>
                  <p className="text-muted small mb-0">
                    <FiTruck className="me-1"/> Dirección: {pedido.direccion || "Recolección en sucursal"}
                  </p>
                </div>

                {/* Total y Botón */}
                <div className="col-md-5 text-md-end">
                  <h4 className="fw-bold text-success mb-3">${Number(pedido.total).toFixed(2)}</h4>
                  <button
                    className="btn btn-outline-primary rounded-pill px-4 fw-bold shadow-sm hover-scale"
                    onClick={() => abrirDetalle(pedido.id)}
                  >
                    🔍 Ver detalle de productos
                  </button>
                </div>

              </div>
            </div>
          </div>
        ))
      )}

      {/* 🔥 MODAL (AHORA SÍ DENTRO DEL RETURN) */}
      {mostrarModal && (
        <div className="modal-overlay" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(3px)' }}>
          <div className="modal-content border-0 rounded-4 shadow-lg p-0" style={{ maxWidth: '600px', width: '90%' }}>
            
            {/* Header del Modal */}
            <div className="bg-primary text-white p-4 rounded-top" style={{ borderTopLeftRadius: '15px', borderTopRightRadius: '15px' }}>
              <div className="d-flex justify-content-between align-items-center">
                <h4 className="m-0 fw-bold">📦 Detalle de la orden #{ordenSeleccionada}</h4>
                <button type="button" className="btn-close btn-close-white" onClick={() => setMostrarModal(false)}></button>
              </div>
            </div>

            {/* Body del Modal */}
            <div className="p-4">
              {detalle.length === 0 ? (
                <div className="text-center py-4 text-muted">Cargando productos...</div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead className="table-light text-muted small">
                      <tr>
                        <th>PRODUCTO</th>
                        <th className="text-center">CANTIDAD</th>
                        <th className="text-end">PRECIO</th>
                        <th className="text-end">SUBTOTAL</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detalle.map((item, index) => (
                        <tr key={index}>
                          <td className="fw-medium text-dark">{item.producto}</td>
                          <td className="text-center fw-bold">{item.cantidad}</td>
                          <td className="text-end text-muted">${Number(item.precio).toFixed(2)}</td>
                          <td className="text-end fw-bold text-success">${Number(item.subtotal).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Footer del Modal */}
            <div className="p-3 bg-light text-end rounded-bottom" style={{ borderBottomLeftRadius: '15px', borderBottomRightRadius: '15px' }}>
              <button
                className="btn btn-secondary rounded-pill px-4 fw-bold"
                onClick={() => setMostrarModal(false)}
              >
                Cerrar
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

export default MisPedidos;