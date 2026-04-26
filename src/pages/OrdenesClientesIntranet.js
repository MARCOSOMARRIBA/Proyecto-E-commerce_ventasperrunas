import React, { useState, useEffect } from 'react';
import { FiEye, FiCheck, FiX, FiClock } from 'react-icons/fi';

const OrdenesClientesIntranet = () => {
  const [ordenes, setOrdenes] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Efecto para traer los datos reales de tu tabla de órdenes/ventas
  useEffect(() => {
    const fetchOrdenes = async () => {
      try {
        // Asegúrate de que tu compañero de backend tenga esta ruta lista
        const res = await fetch('http://127.0.0.1:8000/api/ordenes/');
        if (res.ok) {
          const data = await res.json();
          setOrdenes(data);
        } else {
          // Si el backend aún no está listo, ponemos datos de prueba para que vayas maquetando
          setOrdenes([
            { id_orden: 'ORD-001', cliente: 'Juan Pérez', fecha: '2026-04-25', total: 1250.50, estado: 'Pendiente' },
            { id_orden: 'ORD-002', cliente: 'María Gómez', fecha: '2026-04-24', total: 840.00, estado: 'Enviado' },
            { id_orden: 'ORD-003', cliente: 'Carlos Ruiz', fecha: '2026-04-23', total: 2100.00, estado: 'Entregado' },
          ]);
        }
      } catch (error) {
        console.error("Error al cargar órdenes:", error);
      } finally {
        setCargando(false);
      }
    };
    fetchOrdenes();
  }, []);

  const getStatusBadge = (estado) => {
    switch (estado) {
      case 'Pendiente': return <span className="badge bg-warning text-dark"><FiClock className="me-1"/> Pendiente</span>;
      case 'Enviado': return <span className="badge bg-info text-white"><FiCheck className="me-1"/> Enviado</span>;
      case 'Entregado': return <span className="badge bg-success"><FiCheck className="me-1"/> Entregado</span>;
      case 'Cancelado': return <span className="badge bg-danger"><FiX className="me-1"/> Cancelado</span>;
      default: return <span className="badge bg-secondary">{estado}</span>;
    }
  };

  return (
    <div className="animate__animated animate__fadeIn p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold m-0">Órdenes de Clientes</h2>
          <p className="text-muted">Gestiona los pedidos realizados desde la tienda virtual.</p>
        </div>
      </div>

      <div className="card shadow-sm border-0 fade-in-up">
        <div className="card-body p-0">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light text-muted small">
              <tr>
                <th className="ps-4 py-3">ID ORDEN</th>
                <th>CLIENTE</th>
                <th>FECHA</th>
                <th>TOTAL</th>
                <th>ESTADO</th>
                <th className="text-center">ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr><td colSpan="6" className="text-center py-4 text-muted">Cargando órdenes...</td></tr>
              ) : ordenes.length > 0 ? (
                ordenes.map((orden) => (
                  <tr key={orden.id_orden}>
                    <td className="ps-4 text-primary fw-bold">#{orden.id_orden}</td>
                    <td className="fw-medium">{orden.cliente}</td>
                    <td className="text-muted">{orden.fecha}</td>
                    <td className="fw-bold">${parseFloat(orden.total).toFixed(2)}</td>
                    <td>{getStatusBadge(orden.estado)}</td>
                    <td className="text-center">
                      <button className="btn btn-sm btn-light text-primary hover-scale" title="Ver Detalles"><FiEye /></button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-5 text-muted">No hay órdenes registradas.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrdenesClientesIntranet;