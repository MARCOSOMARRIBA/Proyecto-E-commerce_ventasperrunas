import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import {
  FiClock,
  FiPackage,
  FiTruck,
  FiCheckCircle,
  FiXCircle,
  FiShoppingBag,
  FiMapPin,
} from "react-icons/fi";
import { useMessage } from "../context/MessageContext";

function MisPedidos() {
  const { user } = useContext(AuthContext);
  const { showMessage } = useMessage();
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [detalle, setDetalle] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [ordenSeleccionada, setOrdenSeleccionada] = useState(null);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [ordenCancelar, setOrdenCancelar] = useState(null);

  const fetchPedidos = async () => {
    if (!user) return;
    try {
      // 🔥 CORRECCIÓN 1: URL LIMPIA
      const res = await fetch(
        `https://proyecto-e-commerce-ventasperrunas.onrender.com/api/mis-pedidos/${user.id}/`
      );
      const data = await res.json();
      console.log(data);
      setPedidos(data);
    } catch (error) {
      console.error("Error cargando pedidos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPedidos();
  }, [user]);

  const abrirDetalle = async (pedido) => {
    try {
      // 🔥 CORRECCIÓN 2: URL LIMPIA
      const res = await fetch(
        `https://proyecto-e-commerce-ventasperrunas.onrender.com/api/detalle-orden/${pedido.id}/`
      );
      const data = await res.json();

      console.log("DETALLE:", data);

      setDetalle(Array.isArray(data.productos) ? data.productos : []);
      setOrdenSeleccionada(pedido);
      setMostrarModal(true);
    } catch (error) {
      console.error("Error cargando detalle:", error);
    }
  };

  const handleCancelarOrden = async () => {
    if (!ordenCancelar) return;

    try {
      // 🔥 CORRECCIÓN 3: URL LIMPIA
      const res = await fetch(
        `https://proyecto-e-commerce-ventasperrunas.onrender.com/api/ordenes/cancelar/${ordenCancelar}/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await res.json();

      if (res.ok) {
        await fetchPedidos();

        showMessage({
          title: "Pedido cancelado",
          message: `La orden #${ordenCancelar} fue cancelada correctamente.`,
          type: "success",
        });

        setMostrarConfirmacion(false);
        setOrdenCancelar(null);
      } else {
        showMessage({
          title: "Error",
          message: data.error,
          type: "error",
        });
      }
    } catch (error) {
      console.error(error);

      showMessage({
        title: "Error de conexión",
        message: "No se pudo conectar con el servidor.",
        type: "error",
      });
    }
  };

  const getStatusBadge = (estatus) => {
    switch (String(estatus)) {
      case "1":
        return (
          <span className="badge bg-warning text-dark px-3 py-2 rounded-pill shadow-sm">
            <FiClock className="me-1" /> Pendiente
          </span>
        );
      case "2":
        return (
          <span className="badge bg-info text-dark px-3 py-2 rounded-pill shadow-sm">
            <FiTruck className="me-1" /> Enviado
          </span>
        );
      case "3":
        return (
          <span className="badge bg-success px-3 py-2 rounded-pill shadow-sm">
            <FiCheckCircle className="me-1" /> Recibido
          </span>
        );
      case "4":
        return (
          <span className="badge bg-danger text-white px-3 py-2 rounded-pill shadow-sm">
            <FiXCircle className="me-1" /> Cancelado
          </span>
        );
      default:
        return (
          <span className="badge bg-secondary px-3 py-2 rounded-pill shadow-sm">
            Procesando
          </span>
        );
    }
  };

  // 🎨 FUNCIÓN PARA EL TRACKER ESTILO MERCADO LIBRE
  const renderRastreador = (estatus) => {
    const estatusStr = String(estatus);

    // Si está cancelado, mostramos una alerta roja tipo Amazon/Mercado Libre
    if (estatusStr === "4") {
      return (
        <div className="alert alert-danger d-flex align-items-center gap-3 border-0 shadow-sm rounded-4 mb-4">
          <FiXCircle size={40} className="text-danger" />
          <div>
            <h5 className="m-0 fw-bold text-danger">Compra Cancelada</h5>
            <p className="m-0 small text-dark">
              Este pedido fue cancelado y el envío ha sido detenido.
            </p>
          </div>
        </div>
      );
    }

    // Calculamos qué tan llena está la barra de progreso
    let progressWidth = "0%";
    if (estatusStr === "2") progressWidth = "50%";
    if (estatusStr === "3") progressWidth = "100%";

    return (
      <div className="bg-white p-4 rounded-4 shadow-sm border mb-4">
        <h5 className="fw-bold mb-4 text-dark d-flex align-items-center gap-2">
          <FiPackage className="text-primary" /> Estado del Envío
        </h5>

        <div className="position-relative mx-3 mt-4 mb-5">
          {/* La línea gris de fondo */}
          <div
            className="progress"
            style={{
              height: "6px",
              backgroundColor: "#e9ecef",
              overflow: "visible",
            }}
          >
            {/* La línea verde que avanza */}
            <div
              className="progress-bar bg-success transition-all"
              role="progressbar"
              style={{
                width: progressWidth,
                transition: "width 0.6s ease-in-out",
              }}
            ></div>
          </div>

          {/* Los 3 círculos flotantes */}
          <div className="d-flex justify-content-between position-absolute top-50 start-0 w-100 translate-middle-y">
            {/* Paso 1: Pendiente/Preparación */}
            <div className="text-center position-relative">
              <div
                className={`rounded-circle d-flex align-items-center justify-content-center text-white border border-4 border-white shadow-sm ${estatusStr >= "1" ? "bg-success" : "bg-secondary"}`}
                style={{ width: "45px", height: "45px", margin: "0 auto" }}
              >
                <FiShoppingBag size={20} />
              </div>
              <div
                className="position-absolute top-100 start-50 translate-middle-x mt-2 w-100"
                style={{ minWidth: "100px" }}
              >
                <small className="fw-bold text-dark d-block">Preparación</small>
              </div>
            </div>

            {/* Paso 2: Enviado */}
            <div className="text-center position-relative">
              <div
                className={`rounded-circle d-flex align-items-center justify-content-center text-white border border-4 border-white shadow-sm ${estatusStr >= "2" ? "bg-success" : "bg-light text-muted"}`}
                style={{ width: "45px", height: "45px", margin: "0 auto" }}
              >
                <FiTruck size={20} />
              </div>
              <div
                className="position-absolute top-100 start-50 translate-middle-x mt-2 w-100"
                style={{ minWidth: "100px" }}
              >
                <small
                  className={`fw-bold d-block ${estatusStr >= "2" ? "text-dark" : "text-muted"}`}
                >
                  En camino
                </small>
              </div>
            </div>

            {/* Paso 3: Entregado */}
            <div className="text-center position-relative">
              <div
                className={`rounded-circle d-flex align-items-center justify-content-center border border-4 border-white shadow-sm ${estatusStr === "3" ? "bg-success text-white" : "bg-light text-muted"}`}
                style={{ width: "45px", height: "45px", margin: "0 auto" }}
              >
                <FiCheckCircle size={20} />
              </div>
              <div
                className="position-absolute top-100 start-50 translate-middle-x mt-2 w-100"
                style={{ minWidth: "100px" }}
              >
                <small
                  className={`fw-bold d-block ${estatusStr === "3" ? "text-dark" : "text-muted"}`}
                >
                  Entregado
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-warning" role="status"></div>
        <p className="mt-2 text-muted fw-bold">
          Rastreando tus pedidos perrunos...
        </p>
      </div>
    );
  }

  return (
    <div className="container mt-5 mb-5 animate__animated animate__fadeIn">
      <h2 className="mb-4 fw-bold" style={{ color: "#0084ff" }}>
        🐾 Mis Pedidos
      </h2>

      {pedidos.length === 0 ? (
        <div className="text-center p-5 bg-light rounded-4 shadow-sm">
          <h4 className="text-muted">
            Aún no has hecho ninguna compra para tu mascota 🐶
          </h4>
          <p className="mb-0">
            ¡Explora nuestra tienda y encuentra lo mejor para ellos!
          </p>
        </div>
      ) : (
        pedidos.map((pedido) => (
          <div
            key={pedido.id}
            className="card border-0 shadow-sm mb-4 rounded-4 overflow-hidden"
          >
            <div className="card-body p-4">
              <div className="row align-items-center">
                <div className="col-md-7 mb-3 mb-md-0">
                  <div className="d-flex align-items-center gap-3 mb-2">
                    <h5 className="fw-bold m-0 text-dark">
                      Orden #{pedido.id}
                    </h5>
                    {getStatusBadge(pedido.estado || pedido.estatus)}
                  </div>
                  <p className="text-muted small mb-1">
                    <FiClock className="me-1" /> Fecha de compra:{" "}
                    {new Date(pedido.fecha).toLocaleString()}
                  </p>
                  <p className="text-muted small mb-0">
                    <FiMapPin className="me-1" /> Dirección:{" "}
                    {pedido.direccion || "Recolección en sucursal"}
                  </p>
                </div>

                <div className="col-md-5 text-md-end">
                  <h4 className="fw-bold text-success mb-3">
                    ${Number(pedido.total).toFixed(2)}
                  </h4>
                  <div className="d-flex justify-content-md-end gap-2 flex-wrap">
                    <button
                      className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm hover-scale text-white"
                      onClick={() => abrirDetalle(pedido)} // 🚀 AHORA PASAMOS TODO EL PEDIDO
                    >
                      Seguir envío
                    </button>

                    {String(pedido.estado || pedido.estatus) !== "4" &&
                      String(pedido.estado || pedido.estatus) !== "3" && (
                        <button
                          className="btn btn-outline-danger rounded-pill px-3 fw-bold shadow-sm hover-scale"
                          onClick={() => {
                            setOrdenCancelar(pedido.id);
                            setMostrarConfirmacion(true);
                          }}
                        >
                          <FiXCircle className="me-1" /> Cancelar
                        </button>
                      )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))
      )}

      {/* 🔥 MODAL ESTILO MERCADO LIBRE */}
      {mostrarModal && ordenSeleccionada && (
        <div
          className="modal-overlay"
          style={{
            backgroundColor: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(3px)",
            zIndex: 1050,
          }}
        >
          <div
            className="modal-content border-0 rounded-4 shadow-lg p-0 fade-in-up"
            style={{
              maxWidth: "650px",
              width: "95%",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <div
              className="bg-primary text-white p-4"
              style={{
                borderTopLeftRadius: "15px",
                borderTopRightRadius: "15px",
              }}
            >
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h4 className="m-0 fw-bold">Detalle de tu envío</h4>
                  <small className="opacity-75">
                    Orden #{ordenSeleccionada.id}
                  </small>
                </div>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setMostrarModal(false)}
                ></button>
              </div>
            </div>

            <div className="p-4 bg-light">
              {renderRastreador(
                ordenSeleccionada.estado || ordenSeleccionada.estatus,
              )}

              <h6 className="fw-bold text-secondary mb-3 mt-4">
                Resumen de compra
              </h6>
              {!Array.isArray(detalle) || detalle.length === 0 ? (
                <div className="text-center py-4 text-muted">
                  Cargando productos...
                </div>
              ) : (
                <div className="bg-white rounded-4 shadow-sm border p-3">
                  {detalle.map((item, index) => (
                    <div
                      key={index}
                      className={`d-flex justify-content-between align-items-center py-3 ${index !== detalle.length - 1 ? "border-bottom" : ""}`}
                    >
                      <div className="d-flex align-items-center gap-3">
                        <div
                          className="bg-light rounded p-2 text-center"
                          style={{ width: "40px", height: "40px" }}
                        >
                          <span className="fw-bold text-primary">
                            {item.cantidad}x
                          </span>
                        </div>
                        <div>
                          <p className="fw-bold text-dark m-0">
                            {item.producto}
                          </p>
                          <small className="text-muted">
                            ${Number(item.precio).toFixed(2)} c/u
                          </small>
                        </div>
                      </div>
                      <div className="text-end">
                        <p className="fw-bold text-dark m-0">
                          ${Number(item.subtotal).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div className="border-top pt-3 mt-2 d-flex justify-content-between align-items-center">
                    <span className="fw-bold text-secondary">Total pagado</span>
                    <h5 className="fw-bold text-success m-0">
                      ${Number(ordenSeleccionada.total).toFixed(2)}
                    </h5>
                  </div>
                </div>
              )}
            </div>

            <div
              className="p-3 bg-white text-end rounded-bottom border-top"
              style={{
                borderBottomLeftRadius: "15px",
                borderBottomRightRadius: "15px",
              }}
            >
              <button
                className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm"
                onClick={() => setMostrarModal(false)}
              >
                Cerrar ventana
              </button>
            </div>
          </div>
        </div>
      )}
      {mostrarConfirmacion && (
        <div
          className="modal-overlay"
          style={{
            backgroundColor: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(3px)",
            zIndex: 2000,
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            className="bg-white p-4 rounded-4 shadow-lg"
            style={{
              width: "90%",
              maxWidth: "420px",
            }}
          >
            <div className="text-center">
              <div
                className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle bg-danger-subtle"
                style={{
                  width: "70px",
                  height: "70px",
                }}
              >
                <FiXCircle size={40} className="text-danger" />
              </div>

              <h4 className="fw-bold text-dark mb-3">Cancelar pedido</h4>

              <p className="text-muted mb-4">
                ¿Deseas cancelar la orden
                <span className="fw-bold"> #{ordenCancelar}</span>?
                <br />
                Esta acción no se puede deshacer.
              </p>

              <div className="d-flex gap-2">
                <button
                  className="btn btn-light border rounded-pill w-50 fw-bold"
                  onClick={() => {
                    setMostrarConfirmacion(false);
                    setOrdenCancelar(null);
                  }}
                >
                  Volver
                </button>

                <button
                  className="btn btn-danger rounded-pill w-50 fw-bold"
                  onClick={handleCancelarOrden}
                >
                  Cancelar pedido
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MisPedidos;