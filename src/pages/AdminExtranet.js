import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { FiGrid, FiImage, FiBox, FiShoppingCart, FiSettings, FiHelpCircle } from 'react-icons/fi';

// Importamos las vistas separadas
import DashboardOverview from './DashboardOverview';
import BannersExtranet from './BannersExtranet';
import ProductosExtranet from './ProductosExtranet';
import OrdenesExtranet from './OrdenesExtranet';

function AdminExtranet() {
  const { user } = useContext(AuthContext);
  const [vistaActiva, setVistaActiva] = useState('dashboard');

  // Seguridad estricta: Solo permite entrar a Proveedores (Rol 4)
  if (!user || user.rol !== '4') return <Navigate to="/" />;

  return (
    <div className="container-fluid p-0" style={{ backgroundColor: '#f8fafc', minHeight: 'calc(100vh - 70px)' }}>
      <div className="row g-0">
        
        {/* SIDEBAR OSCURO (Sin branding externo) */}
        <div className="col-auto d-flex flex-column" style={{ width: '260px', backgroundColor: '#111827', minHeight: 'calc(100vh - 70px)' }}>
          <div className="p-4 border-bottom border-secondary">
            <h5 className="text-white fw-bold m-0">Panel de Control</h5>
            <small className="text-info">Gestión Extranet</small>
          </div>

          <ul className="nav flex-column mb-auto mt-3">
            {[
              { id: 'dashboard', label: 'Estadísticas', icon: <FiGrid /> },
              { id: 'banners', label: 'Banners', icon: <FiImage /> },
              { id: 'productos', label: 'Productos', icon: <FiBox /> },
              { id: 'ordenes', label: 'Órdenes B2B', icon: <FiShoppingCart /> }
            ].map(item => (
              <li className="nav-item" key={item.id}>
                <button 
                  onClick={() => setVistaActiva(item.id)} 
                  className={`nav-link w-100 text-start px-4 py-3 d-flex align-items-center gap-3 border-0 ${vistaActiva === item.id ? 'text-white' : 'text-secondary'}`}
                  style={{ 
                    backgroundColor: vistaActiva === item.id ? 'rgba(44, 177, 255, 0.1)' : 'transparent',
                    borderLeft: vistaActiva === item.id ? '4px solid #2cb1ff' : '4px solid transparent'
                  }}
                >
                  {item.icon} {item.label}
                </button>
              </li>
            ))}
          </ul>
          
          <div className="p-4 mt-auto border-top border-secondary">
            <button className="btn btn-link text-secondary text-decoration-none d-flex align-items-center gap-2 small p-0 mb-2"><FiSettings /> Configuración</button>
            <button className="btn btn-link text-secondary text-decoration-none d-flex align-items-center gap-2 small p-0"><FiHelpCircle /> Soporte Técnico</button>
          </div>
        </div>

        {/* ÁREA DE CONTENIDO (Sin Header redundante) */}
        <div className="col" style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 70px)' }}>
          <div className="p-4">
            {vistaActiva === 'dashboard' && <DashboardOverview />}
            {vistaActiva === 'banners' && <BannersExtranet />}
            {vistaActiva === 'productos' && <ProductosExtranet />}
            {/* AQUÍ ESTÁ EL CAMBIO: Ya cargamos el componente real */}
            {vistaActiva === 'ordenes' && <OrdenesExtranet />}
          </div>
        </div>

      </div>
    </div>
  );
}

export default AdminExtranet;