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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const cargarPedidosProveedor = async () => {
    if (!user) return; // Protegemos la petición hasta que haya usuario

    try {
      setCargando(true);
      // 🚀 INYECTAMOS EL FILTRO DE PRIVACIDAD EN LA URL
      const rfcSeguro = user?.rfc || "";
      const url = `https://proyecto-e-commerce-ventasperrunas.onrender.com/api/pedidos/?rol=${user.rol}&rfc=${rfcSeguro}`;
      
      const res = await fetch(url);

      if (res.ok) {
        const data = await res.json();
        // Ya no filtramos en el frontend, el backend nos manda exactamente lo que nos toca
        setPedidos(data);
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
      // 🔥 Actualizamos el estatus del pedido ENVIANDO CREDENCIALES en la URL para evitar el 404
      const rfcSeguro = user?.rfc || "";
      const urlPatch = `https://proyecto-e-commerce-ventasperrunas.onrender.com/api/pedidos/${id_pedido}/?rol=${user.rol}&rfc=${rfcSeguro}`;
      
      const res = await fetch(urlPatch, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estatus: nuevoEstatus }),
      });

      if (res.ok) {
        setPedidos((prevPedidos) =>
          prevPedidos.map((p) => p.id_pedido === id_pedido ? { ...p, estatus: nuevoEstatus } : p)
        );
        
        showMessage({
          title: "Estatus actualizado",
          message: `El pedido #${id_pedido} fue actualizado correctamente.`,
          type: "success",
        });

        // 🚀 AUTOMATIZACIÓN SILENCIOSA 🚀
        if (String(nuevoEstatus) === "4") {
          const resDetalles = await fetch(`https://proyecto-e-commerce-ventasperrunas.onrender.com/api/pedidos/${id_pedido}/detalles/`);
          
          if (resDetalles.ok) {
            const detalles = await resDetalles.json();
            
            if (detalles.length > 0) {
              const promesasDeActivacion = detalles.map(detalle => {
                const idProd = detalle.id_producto || detalle.producto_id || detalle.producto; 
                // Aseguramos que la actualización de stock también lleve permisos
                return fetch(`https://proyecto-e-commerce-ventasperrunas.onrender.com/api/api/productos/${idProd}/?rol=${user.rol}&rfc=${rfcSeguro}`, {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ stock: true, activo: true })
                });
              });
              
              await Promise.all(promesasDeActivacion);
            }
          }
        }

      } else {
        const errorData = await res.json();
        showMessage({ title: "Error", message: errorData.error || "No tienes permiso para modificar este pedido.", type: "error" });
      }
    } catch (error) {
      console.error("Error de red:", error);
      showMessage({ title: "Error", message: "Fallo de conexión.", type: "error" });
    }
  };

  // 🎨 UNIFICAMOS LOS COLORES CON LOS DEL ADMIN/EMPLEADO
  const getEstiloEstatus = (estatus) => {
    switch (String(estatus)) {
      case "1": return "border-warning text-warning"; // Solicitado
      case "2": return "border-info text-info";       // En Proceso
      case "3": return "border-danger text-danger";   // Rechazado/Cancelado
      case "4": return "border-success text-success"; // Entregado
      default: return "border-secondary text-secondary";
    }
  };

  return (
    <div className="animate__animated animate__fadeIn p-4">
      <div className="mb-4">
        <h2 className="fw-bold m-0 text-dark d-flex align-items-center gap-2">
          <FiPackage className="text-primary" /> Bandeja de Órdenes Recibidas
        </h2>

        <p className="text-muted">
          Actualiza el estatus de las solicitudes para notificar al administrador.
        </p>
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          
          {/* 🔥 ENVOLTURA RESPONSIVA PARA CELULARES AGREGADA */}
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0 bg-white" style={{ minWidth: "800px" }}>
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
                    <td colSpan="5" className="text-center py-4">Sincronizando con PostgreSQL...</td>
                  </tr>
                ) : pedidos.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-5 text-muted">No hay órdenes pendientes para tu RFC.</td>
                  </tr>
                ) : (
                  pedidos.map((pedido) => (
                    <tr key={pedido.id_pedido}>
                      <td className="ps-4 fw-bold">#{pedido.id_pedido}</td>

                      <td>{new Date(pedido.fecha_compra).toLocaleDateString()}</td>

                      <td className="fw-bold text-dark">Pet Market Local (Central)</td>

                      <td className="text-success fw-bold">
                        ${parseFloat(pedido.total_compra || 0).toLocaleString()}
                      </td>

                      <td style={{ width: "250px" }}>
                        <select
                          className={`form-select form-select-sm fw-bold border-2 ${getEstiloEstatus(pedido.estatus)}`}
                          value={String(pedido.estatus)}
                          onChange={(e) => actualizarEstatus(pedido.id_pedido, e.target.value)}
                        >
                          <option value="1">1 - Solicitado</option>
                          <option value="2">2 - En Proceso</option>
                          <option value="3">3 - Cancelado / Rechazado</option>
                          <option value="4">4 - Entregado</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {/* 🔥 FIN ENVOLTURA RESPONSIVA */}

        </div>
      </div>
    </div>
  );
};

export default OrdenesExtranet;