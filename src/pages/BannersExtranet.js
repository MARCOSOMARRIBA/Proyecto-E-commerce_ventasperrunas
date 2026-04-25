import React, { useState } from 'react';
import { FiPlus, FiImage } from 'react-icons/fi';

const BannersExtranet = () => {
  const [banners, setBanners] = useState([]); // Iniciamos con lista vacía

  return (
    <div className="animate__animated animate__fadeIn">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold m-0">Gestión de Banners</h2>
          <p className="text-muted">Control de contenido dinámico para la Extranet.</p>
        </div>
        <button className="btn btn-dark fw-bold d-flex align-items-center gap-2">
          <FiPlus /> Nueva Sección
        </button>
      </div>

      <div className="card border-0 shadow-sm overflow-hidden">
        <table className="table table-hover align-middle mb-0">
          <thead className="bg-light text-muted small">
            <tr>
              <th className="ps-4 py-3">ID</th>
              <th>MINIATURA</th>
              <th>TÍTULO</th>
              <th>DESTINO</th>
              <th>ESTADO</th>
              <th className="text-end pe-4">ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {banners.length > 0 ? (
              banners.map(b => (
                <tr key={b.id_seccion}>
                  {/* Aquí irán las filas reales */}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-5 text-muted">
                  <FiImage size={40} className="mb-3 d-block mx-auto" />
                  No hay banners configurados en la tabla 'seccion_extranet'.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BannersExtranet;