import React, { useState, useEffect } from "react";
import {
  FiEye,
  FiList,
  FiPlus,
  FiSend,
  FiTrash2,
  FiShoppingCart,
} from "react-icons/fi";
import { db } from "../firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useMessage } from "../context/MessageContext";

const PedidosProveedorIntranet = () => {
  const { showMessage } = useMessage();

  const [pedidos, setPedidos] = useState([]);
  const [productosBase, setProductosBase] = useState([]);
  const [proveedoresBase, setProveedoresBase] = useState([]);
  const [detalles, setDetalles] = useState([]);

  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const [nuevaOrden, setNuevaOrden] = useState({
    rfc: "",
    descripcion: "",
    items: [{ id_producto: "", cantidad: 1, precio_unitario: 0 }],
  });

  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  const cargarDatosIniciales = async () => {
    try {
      const [resPedidos, resProds, resProv] = await Promise.all([
        fetch("http://127.0.0.1:8000/api/pedidos/"),
        fetch("http://127.0.0.1:8000/api/productos/"),
        fetch("http://127.0.0.1:8000/api/proveedores/"),
      ]);

      if (resPedidos.ok) setPedidos(await resPedidos.json());
      if (resProds.ok) setProductosBase(await resProds.json());
      if (resProv.ok) setProveedoresBase(await resProv.json());
    } catch (error) {
      console.error("Error de conexión:", error);

      showMessage({
        title: "Error de conexión",
        message:
          "No se pudieron cargar los datos iniciales de pedidos, productos o proveedores.",
        type: "error",
      });
    }
  };

  const verDetalles = async (idPedido) => {
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/pedidos/${idPedido}/detalles/`,
      );

      if (res.ok) {
        setDetalles(await res.json());
        setPedidoSeleccionado(pedidos.find((p) => p.id_pedido === idPedido));
      } else {
        showMessage({
          title: "Error al cargar detalles",
          message:
            "No se pudieron obtener los detalles del pedido seleccionado.",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error al obtener detalles:", error);

      showMessage({
        title: "Error de conexión",
        message: "No se pudo conectar con el servidor para obtener detalles.",
        type: "error",
      });
    }
  };

  const manejarCambioItem = (index, field, value) => {
    const nuevosItems = [...nuevaOrden.items];

    if (field === "id_producto") {
      const prodEncontrado = productosBase.find(
        (p) => String(p.id_producto) === String(value),
      );

      nuevosItems[index].precio_unitario = prodEncontrado
        ? parseFloat(prodEncontrado.precio)
        : 0;
    }

    nuevosItems[index][field] = value;
    setNuevaOrden({ ...nuevaOrden, items: nuevosItems });
  };

  const enviarOrdenBD = async (e) => {
    e.preventDefault();

    if (!nuevaOrden.rfc) {
      showMessage({
        title: "Proveedor requerido",
        message: "Debes seleccionar un proveedor para generar la orden.",
        type: "warning",
      });
      return;
    }

    const itemsValidos = nuevaOrden.items.filter(
      (item) => item.id_producto && Number(item.cantidad) > 0,
    );

    if (itemsValidos.length === 0) {
      showMessage({
        title: "Productos requeridos",
        message: "Debes seleccionar al menos un producto para la orden.",
        type: "warning",
      });
      return;
    }

    const totalCalculado = itemsValidos.reduce(
      (sum, item) => sum + Number(item.cantidad) * Number(item.precio_unitario),
      0,
    );

    try {
      const resDjango = await fetch("http://127.0.0.1:8000/api/pedidos/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          descripcion: nuevaOrden.descripcion || "Pedido de resurtido B2B",
          fecha_compra: new Date().toISOString().split("T")[0],
          estatus: "1",
          total_compra: totalCalculado,
          rfc: nuevaOrden.rfc,
          id_usuario: "ADM0000000001",
        }),
      });

      if (!resDjango.ok) {
        const errorData = await resDjango.json();

        showMessage({
          title: "Django rechazó el pedido",
          message: JSON.stringify(errorData, null, 2),
          type: "error",
        });

        return;
      }

      const totalArts = itemsValidos.reduce(
        (sum, item) => sum + parseInt(item.cantidad || 0),
        0,
      );

      const nombreProv =
        proveedoresBase.find((p) => p.rfc === nuevaOrden.rfc)?.nombre_empresa ||
        "Proveedor";

      await addDoc(collection(db, "pedidos_b2b"), {
        id_proveedor: nuevaOrden.rfc,
        nombre_proveedor: nombreProv,
        articulos_totales: totalArts,
        monto_estimado: totalCalculado,
        mensaje_admin: nuevaOrden.descripcion,
        estado: "1",
        fecha: serverTimestamp(),
      });

      await cargarDatosIniciales();

      setMostrarFormulario(false);

      setNuevaOrden({
        rfc: "",
        descripcion: "",
        items: [{ id_producto: "", cantidad: 1, precio_unitario: 0 }],
      });

      showMessage({
        title: "Orden generada",
        message:
          "La orden fue registrada correctamente y el proveedor ha sido notificado.",
        type: "success",
      });
    } catch (error) {
      console.error("Error general:", error);

      showMessage({
        title: "Error al generar orden",
        message:
          "Ocurrió un problema al guardar la orden o notificar al proveedor.",
        type: "error",
      });
    }
  };

  const productosDelProveedor = nuevaOrden.rfc
    ? productosBase.filter(
        (p) => p.rfc_proveedor === nuevaOrden.rfc || !p.rfc_proveedor,
      )
    : [];

  return (
    <div
      className="p-4 animate__animated animate__fadeIn"
      style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}
    >
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-dark m-0">Órdenes de Compra</h2>
          <p className="text-muted small">Gestión de abastecimiento B2B</p>
        </div>

        <button
          onClick={() => setMostrarFormulario(true)}
          className="btn btn-primary px-4 fw-bold shadow-sm"
        >
          <FiPlus className="me-2" /> Nueva Orden de Surtido
        </button>
      </div>

      <div className="card shadow-sm border-0" style={{ borderRadius: "15px" }}>
        <div className="card-body p-0">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-dark">
              <tr>
                <th className="ps-4">FOLIO</th>
                <th>FECHA</th>
                <th>PROVEEDOR</th>
                <th>TOTAL</th>
                <th>ESTADO</th>
                <th className="text-center">GESTIÓN</th>
              </tr>
            </thead>

            <tbody>
              {pedidos.map((ped) => (
                <tr key={ped.id_pedido}>
                  <td className="ps-4 fw-bold">#{ped.id_pedido}</td>
                  <td>{new Date(ped.fecha_compra).toLocaleDateString()}</td>
                  <td className="text-muted">{ped.rfc}</td>
                  <td className="fw-bold text-primary">
                    ${parseFloat(ped.total_compra).toFixed(2)}
                  </td>
                  <td>
                    <span
                      className={`badge rounded-pill bg-${
                        ped.estatus === "1"
                          ? "warning"
                          : ped.estatus === "2"
                            ? "info"
                            : ped.estatus === "3"
                              ? "danger"
                              : "success"
                      }`}
                    >
                      {ped.estatus === "1"
                        ? "Pendiente"
                        : ped.estatus === "2"
                          ? "Aceptado"
                          : ped.estatus === "3"
                            ? "Cancelado"
                            : "Finalizado"}
                    </span>
                  </td>
                  <td className="text-center">
                    <button
                      onClick={() => verDetalles(ped.id_pedido)}
                      className="btn btn-sm btn-light border shadow-sm"
                    >
                      <FiEye /> Ver
                    </button>
                  </td>
                </tr>
              ))}

              {pedidos.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-muted">
                    No hay órdenes registradas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {mostrarFormulario && (
        <>
          <div
            className="modal-backdrop fade show"
            style={{
              backgroundColor: "rgba(0,0,0,0.8)",
              zIndex: 1040,
            }}
          ></div>

          <div className="modal d-block" tabIndex="-1" style={{ zIndex: 1050 }}>
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <form
                onSubmit={enviarOrdenBD}
                className="modal-content bg-white border-0 shadow-lg"
                style={{ borderRadius: "15px", opacity: 1 }}
              >
                <div className="modal-header bg-primary text-white border-0 py-3">
                  <h5 className="modal-title fw-bold">
                    <FiShoppingCart className="me-2" /> Generar Orden
                  </h5>

                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={() => setMostrarFormulario(false)}
                  ></button>
                </div>

                <div className="modal-body p-4 bg-white text-dark">
                  <div className="row g-3 mb-4">
                    <div className="col-md-6">
                      <label className="fw-bold text-secondary small">
                        PROVEEDOR
                      </label>
                      <select
                        className="form-select border-2"
                        required
                        value={nuevaOrden.rfc}
                        onChange={(e) =>
                          setNuevaOrden({
                            ...nuevaOrden,
                            rfc: e.target.value,
                          })
                        }
                      >
                        <option value="">Elegir empresa...</option>
                        {proveedoresBase.map((prov) => (
                          <option key={prov.rfc} value={prov.rfc}>
                            {prov.nombre_empresa}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="fw-bold text-secondary small">
                        MEMORÁNDUM
                      </label>
                      <input
                        type="text"
                        className="form-control border-2"
                        placeholder="Notas..."
                        value={nuevaOrden.descripcion}
                        onChange={(e) =>
                          setNuevaOrden({
                            ...nuevaOrden,
                            descripcion: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <h6 className="fw-bold mb-3 text-primary">
                    <FiList className="me-2" /> Partidas
                  </h6>

                  {nuevaOrden.items.map((item, index) => (
                    <div
                      className="row g-2 mb-2 align-items-center"
                      key={index}
                    >
                      <div className="col-md-6">
                        <select
                          className="form-select form-select-sm"
                          value={item.id_producto}
                          onChange={(e) =>
                            manejarCambioItem(
                              index,
                              "id_producto",
                              e.target.value,
                            )
                          }
                          required
                          disabled={!nuevaOrden.rfc}
                        >
                          <option value="">
                            {nuevaOrden.rfc
                              ? "Seleccionar Producto..."
                              : "Primero elige un proveedor"}
                          </option>

                          {productosDelProveedor.map((p) => (
                            <option key={p.id_producto} value={p.id_producto}>
                              {p.nombre}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-md-2">
                        <input
                          type="number"
                          className="form-control form-control-sm text-center"
                          min="1"
                          required
                          value={item.cantidad}
                          onChange={(e) =>
                            manejarCambioItem(index, "cantidad", e.target.value)
                          }
                          placeholder="Cant."
                        />
                      </div>

                      <div className="col-md-3">
                        <div className="input-group input-group-sm">
                          <span className="input-group-text bg-light text-muted">
                            $
                          </span>
                          <input
                            type="number"
                            className="form-control bg-light text-muted fw-bold border-1"
                            readOnly
                            disabled
                            value={item.precio_unitario}
                            style={{ cursor: "not-allowed" }}
                          />
                        </div>
                      </div>

                      <div className="col-md-1 text-end">
                        <button
                          type="button"
                          onClick={() => {
                            const filtrados = nuevaOrden.items.filter(
                              (_, i) => i !== index,
                            );
                            setNuevaOrden({
                              ...nuevaOrden,
                              items: filtrados,
                            });
                          }}
                          className="btn btn-sm btn-outline-danger border-0"
                          disabled={nuevaOrden.items.length === 1}
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() =>
                      setNuevaOrden({
                        ...nuevaOrden,
                        items: [
                          ...nuevaOrden.items,
                          {
                            id_producto: "",
                            cantidad: 1,
                            precio_unitario: 0,
                          },
                        ],
                      })
                    }
                    className="btn btn-sm btn-link fw-bold p-0 mt-2"
                  >
                    + Agregar producto
                  </button>
                </div>

                <div className="modal-footer border-0 p-4 pt-0">
                  <button
                    type="button"
                    className="btn btn-light"
                    onClick={() => setMostrarFormulario(false)}
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className="btn btn-primary px-4 fw-bold"
                  >
                    <FiSend className="me-2" /> Enviar Orden
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      {pedidoSeleccionado && (
        <>
          <div
            className="modal-backdrop fade show"
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.8)",
              zIndex: 1040,
            }}
          ></div>

          <div className="modal d-block" tabIndex="-1" style={{ zIndex: 1050 }}>
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div
                className="modal-content bg-white border-0 shadow-lg"
                style={{ borderRadius: "15px", opacity: 1 }}
              >
                <div className="modal-header bg-dark text-white border-0">
                  <h5 className="modal-title fw-bold">
                    <FiList className="me-2" /> Detalle del Pedido #
                    {pedidoSeleccionado.id_pedido}
                  </h5>

                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={() => setPedidoSeleccionado(null)}
                  ></button>
                </div>

                <div className="modal-body p-4 bg-light text-dark">
                  <table className="table table-sm table-bordered bg-white shadow-sm align-middle">
                    <thead className="table-secondary text-dark small">
                      <tr>
                        <th>ID PRODUCTO</th>
                        <th className="text-center">CANTIDAD</th>
                        <th>COSTO UNITARIO</th>
                        <th>SUBTOTAL</th>
                      </tr>
                    </thead>

                    <tbody>
                      {detalles.map((det, i) => (
                        <tr key={i}>
                          <td className="text-secondary fw-medium">
                            <code>{det.id_producto}</code>
                          </td>
                          <td className="text-center fw-bold">
                            {det.cantidad}
                          </td>
                          <td>${parseFloat(det.precio_unitario).toFixed(2)}</td>
                          <td className="fw-bold text-primary">
                            ${parseFloat(det.precio_subtotal).toFixed(2)}
                          </td>
                        </tr>
                      ))}

                      {detalles.length === 0 && (
                        <tr>
                          <td
                            colSpan="4"
                            className="text-center text-muted py-4"
                          >
                            No hay detalles registrados para este pedido.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PedidosProveedorIntranet;
