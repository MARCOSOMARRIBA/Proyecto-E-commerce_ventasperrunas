import React, { useState, useEffect } from "react";
import { FiActivity, FiClock, FiUser, FiInfo, FiSearch } from "react-icons/fi";

const AuditoriaEmpleados = () => {
  const [movimientos, setMovimientos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtro, setFiltro] = useState("");

  useEffect(() => {
    cargarMovimientos();
  }, []);

  const cargarMovimientos = async () => {
    try {
      // Conectamos con la ruta que ya tienes en tu urls.py
      const res = await fetch(
        "https://proyecto-e-commerce-ventasperrunas.onrender.com//api/pedidos/movimientos-recientes/",
      );
      if (res.ok) {
        const data = await res.json();
        setMovimientos(data);
      }
    } catch (error) {
      console.error("Error al cargar la auditoría:", error);
    } finally {
      setCargando(false);
    }
  };

  const movimientosFiltrados = movimientos.filter((mov) => {
    const textoBusqueda = filtro.toLowerCase();

    return (
      mov.usuario?.toLowerCase().includes(textoBusqueda) ||
      mov.accion?.toLowerCase().includes(textoBusqueda) ||
      mov.detalle?.toLowerCase().includes(textoBusqueda) ||
      mov.fecha_hora?.toLowerCase().includes(textoBusqueda)
    );
  });
  return (
    <div className="p-4 animate__animated animate__fadeIn">
      <div className="d-flex justify-content-between align-items-end mb-4">
        <div>
          <h2 className="fw-bold m-0 d-flex align-items-center gap-2 text-dark">
            <FiActivity className="text-primary" /> Auditoría de Empleados
          </h2>
          <p className="text-muted small m-0 mt-1">
            Bitácora en tiempo real de las acciones del personal operativo.
          </p>
        </div>

        <div className="input-group" style={{ width: "300px" }}>
          <span className="input-group-text bg-white border-end-0 text-muted">
            <FiSearch />
          </span>
          <input
            type="text"
            className="form-control border-start-0 ps-0"
            placeholder="Buscar por empleado o acción..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          />
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div
          className="card-body p-0 overflow-auto"
          style={{ maxHeight: "600px" }}
        >
          <table className="table table-hover align-middle mb-0 bg-white">
            <thead className="bg-dark text-white small sticky-top">
              <tr>
                <th className="ps-4 py-3">FECHA Y HORA</th>
                <th>EMPLEADO</th>
                <th>ACCIÓN REALIZADA</th>
                <th>DETALLES TÉCNICOS</th>
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr>
                  <td colSpan="4" className="text-center py-5 text-muted">
                    Cargando bitácora del servidor...
                  </td>
                </tr>
              ) : movimientosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-5 text-muted">
                    No se encontraron movimientos recientes.
                  </td>
                </tr>
              ) : (
                movimientosFiltrados.map((mov, index) => (
                  <tr key={index}>
                    <td className="ps-4 text-muted small">
                      <FiClock className="me-1" /> {mov.fecha_hora}
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2 fw-bold text-dark">
                        <div
                          className="bg-light rounded-circle d-flex justify-content-center align-items-center text-secondary"
                          style={{ width: "30px", height: "30px" }}
                        >
                          <FiUser />
                        </div>
                        {mov.usuario}
                      </div>
                    </td>
                    <td>
                      <span
                        className={`badge 
  ${
    mov.tipo === "ALERTA"
      ? "bg-danger"
      : mov.tipo === "SUCCESS"
        ? "bg-success"
        : mov.tipo === "WARNING"
          ? "bg-warning text-dark"
          : "bg-info"
  }  text-dark rounded-pill px-3 py-2 border`}
                      >
                        {mov.accion}
                      </span>
                    </td>
                    <td className="text-muted small">
                      <FiInfo className="me-1 text-primary" /> {mov.detalle}
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

export default AuditoriaEmpleados;
