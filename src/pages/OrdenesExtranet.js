import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useMessage } from "../context/MessageContext";
import { FiPackage } from "react-icons/fi";

const OrdenesExtranet = () => {
  const { user } = useContext(AuthContext);
  const { showMessage } = useMessage();

  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarPedidosProveedor();
  }, [user]);

  const cargarPedidosProveedor = async () => {
    try {
      setCargando(true);

      const res = await fetch("http://127.0.0.1:8000/api/pedidos/");

      if (res.ok) {
        const data = await res.json();

        // ==============================================================
        // HACK TEMPORAL PARA LA TABLA
        // Después lo cambiaremos por user?.rfc cuando el backend lo mande.
        // ==============================================================
        const RFC_PRUEBA = "DPG260401A1B";

        const misPedidos = data.filter((p) => p.rfc === RFC_PRUEBA);

        setPedidos(misPedidos);
      } else {
        showMessage({
          title: "Error al cargar órdenes",
          message: "No se pudieron obtener las órdenes desde PostgreSQL.",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error al cargar la bandeja:", error);

      showMessage({
        title: "Error de conexión",
        message: "No se pudo conectar con el servidor para cargar las órdenes.",
        type: "error",
      });
    } finally {
      setCargando(false);
    }
  };

  const actualizarEstatus = async (id_pedido, nuevoEstatus) => {
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/pedidos/${id_pedido}/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            estatus: nuevoEstatus,
          }),
        },
      );

      if (res.ok) {
        setPedidos((prevPedidos) =>
          prevPedidos.map((p) =>
            p.id_pedido === id_pedido ? { ...p, estatus: nuevoEstatus } : p,
          ),
        );

        showMessage({
          title: "Estatus actualizado",
          message: `El pedido #${id_pedido} fue actualizado correctamente.`,
          type: "success",
        });
      } else {
        const errorData = await res.json();

        showMessage({
          title: "Error al actualizar",
          message:
            errorData.error ||
            errorData.detail ||
            JSON.stringify(errorData, null, 2),
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error de red:", error);

      showMessage({
        title: "Error de conexión",
        message:
          "No se pudo conectar con el servidor para actualizar el pedido.",
        type: "error",
      });
    }
  };

  const getEstiloEstatus = (estatus) => {
    switch (estatus) {
      case "1":
        return "border-warning text-warning";
      case "2":
        return "border-info text-info";
      case "3":
        return "border-danger text-danger";
      case "4":
        return "border-success text-success";
      default:
        return "border-secondary text-secondary";
    }
  };

  return (
    <div className="animate__animated animate__fadeIn p-4">
      <div className="mb-4">
        <h2 className="fw-bold m-0 text-dark d-flex align-items-center gap-2">
          <FiPackage className="text-primary" /> Bandeja de Órdenes Recibidas
        </h2>

        <p className="text-muted">
          Actualiza el estatus de las solicitudes para notificar al
          administrador.
        </p>
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          <table className="table table-hover align-middle mb-0 bg-white">
            <thead className="bg-dark text-white small">
              <tr>
                <th className="ps-4 py-3">FOLIO</th>
                <th>FECHA</th>
                <th>CLIENTE</th>
                <th>TOTAL A COBRAR</th>
                <th>ESTATUS ACTUAL</th>
              </tr>
            </thead>

            <tbody>
              {cargando ? (
                <tr>
                  <td colSpan="5" className="text-center py-4">
                    Sincronizando con PostgreSQL...
                  </td>
                </tr>
              ) : pedidos.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-5 text-muted">
                    No hay órdenes pendientes para tu RFC.
                  </td>
                </tr>
              ) : (
                pedidos.map((pedido) => (
                  <tr key={pedido.id_pedido}>
                    <td className="ps-4 fw-bold">#{pedido.id_pedido}</td>

                    <td>
                      {new Date(pedido.fecha_compra).toLocaleDateString()}
                    </td>

                    <td className="fw-bold text-dark">
                      Pet Market Local (Central)
                    </td>

                    <td className="text-success fw-bold">
                      ${parseFloat(pedido.total_compra || 0).toLocaleString()}
                    </td>

                    <td style={{ width: "250px" }}>
                      <select
                        className={`form-select form-select-sm fw-bold border-2 ${getEstiloEstatus(
                          pedido.estatus,
                        )}`}
                        value={pedido.estatus}
                        onChange={(e) =>
                          actualizarEstatus(pedido.id_pedido, e.target.value)
                        }
                      >
                        <option value="1">1 - Solicitado / Pendiente</option>
                        <option value="2">2 - Aceptado / En Preparación</option>
                        <option value="3">3 - Rechazado / Cancelado</option>
                        <option value="4">4 - Enviado / Finalizado</option>
                      </select>
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

export default OrdenesExtranet;
