import React, { useState, useEffect } from 'react';
import { FiDownload, FiTrendingUp } from 'react-icons/fi';

const DashboardOverview = () => {
  // Estado preparado para recibir datos de PostgreSQL
  const [stats, setStats] = useState({
    ventasTotales: 0,
    usuariosActivos: 0,
    ordenesPendientes: 0,
    stockBajo: 0
  });

  return (
    <div className="animate__animated animate__fadeIn">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold m-0">Resumen General</h2>
          <p className="text-muted">Indicadores clave de rendimiento.</p>
        </div>
        <button className="btn btn-outline-primary fw-bold d-flex align-items-center gap-2">
          <FiDownload /> Exportar Datos
        </button>
      </div>

      {/* Tarjetas de Indicadores */}
      {/* Tarjetas de Indicadores */}
      <div className="row mb-4">
        {[
          { label: 'VENTAS TOTALES', val: `$${stats.ventasTotales}`, color: '#2cb1ff' },
          { label: 'USUARIOS ACTIVOS', val: stats.usuariosActivos, color: '#10b981' },
          { label: 'ÓRDENES PENDIENTES', val: stats.ordenesPendientes, color: '#f59e0b' },
          { label: 'STOCK BAJO', val: stats.stockBajo, color: '#ef4444' }
        ].map((item, i) => (
          <div className="col-md-3" key={i}>
            {/* AQUÍ AGREGAMOS LAS ANIMACIONES: fade-in-up, hover-elevate y el delay dinámico */}
            <div className={`card border-0 shadow-sm p-4 h-100 fade-in-up hover-elevate delay-${i}`} style={{ borderTop: `4px solid ${item.color}` }}>
              <h6 className="text-muted small fw-bold mb-3">{item.label}</h6>
              <h3 className="fw-bold m-0">{item.val}</h3>
              <div className="mt-2 small text-muted"><FiTrendingUp /> Datos en tiempo real</div>
            </div>
          </div>
        ))}
      </div>

      {/* Área de Gráficas (Estructura lista para Chart.js o Recharts) */}
      <div className="card border-0 shadow-sm p-4">
        <h5 className="fw-bold mb-4">Tendencia de Ventas (PostgreSQL)</h5>
        <div style={{ height: '300px', backgroundColor: '#fdfdfd', border: '2px dashed #e2e8f0', borderRadius: '10px' }} className="d-flex align-items-center justify-content-center">
          <p className="text-muted">Conecta el endpoint de Django para renderizar la gráfica dinámica.</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;