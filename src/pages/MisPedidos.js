import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

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

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-warning" role="status"></div>
        <p className="mt-2">Cargando tus pedidos...</p>
      </div>
    );
  }

  return (
    <div className="container mt-5 mb-5">
      <h2 className="mb-4">Mis pedidos</h2>

      {pedidos.length === 0 ? (
        <div className="text-center">
          <h5>No tienes pedidos aún 🐶</h5>
        </div>
      ) : (
        pedidos.map((pedido) => (
          <div key={pedido.id} className="card mb-3 p-3">
            <div className="d-flex justify-content-between">
              <div>
                <h5>Orden #{pedido.id}</h5>
                <p className="mb-1">
                  Fecha: {new Date(pedido.fecha).toLocaleString()}
                </p>
                <p className="mb-1">Dirección: {pedido.direccion}</p>
              </div>

              <div className="text-end">
                <h5>${Number(pedido.total).toFixed(2)}</h5>
                <span className="badge bg-primary">
                  {pedido.estatus === "1" ? "Completado" : "Pendiente de pago"}
                </span>
              </div>
            </div>

            <button
              className="btn btn-sm btn-outline-warning mt-2"
              onClick={() => abrirDetalle(pedido.id)}
            >
              🔍 Ver detalle
            </button>
          </div>
        ))
      )}

      {/* 🔥 MODAL (AHORA SÍ DENTRO DEL RETURN) */}
      {mostrarModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h4>Detalle de la orden #{ordenSeleccionada}</h4>

            {detalle.length === 0 ? (
              <p>No hay productos</p>
            ) : (
              <table className="table table-dark mt-3">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Cantidad</th>
                    <th>Precio</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {detalle.map((item, index) => (
                    <tr key={index}>
                      <td>{item.producto}</td>
                      <td>{item.cantidad}</td>
                      <td>${item.precio}</td>
                      <td>${item.subtotal}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <button
              className="btn btn-danger mt-3"
              onClick={() => setMostrarModal(false)}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MisPedidos;
