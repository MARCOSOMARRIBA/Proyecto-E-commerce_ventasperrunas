import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
// 1. Agregamos el ícono FiUserPlus para el menú
import { FiPackage, FiShoppingCart, FiTruck, FiSettings, FiHelpCircle, FiSearch, FiActivity, FiUserPlus } from 'react-icons/fi';

import VistaOrdenesClientes from './OrdenesClientesIntranet';
import VistaPedidosProveedor from './PedidosProveedorIntranet';
import VistaInventario from './InventarioIntranet'; 
import AuditoriaEmpleados from './AuditoriaEmpleados';
// 2. IMPORTAMOS EL NUEVO COMPONENTE QUE CREASTE
import CrearUsuarioAdmin from './CrearUsuarioAdmin';

function DashboardIntranet() {
  const { user } = useContext(AuthContext);
  const [vistaActiva, setVistaActiva] = useState('inventario');

  // Seguridad estricta: Solo permite entrar a Admin (Rol 3)
  if (!user || user.rol !== '3') return <Navigate to="/" />;

  // ==========================================
  // RENDERIZADO PRINCIPAL (LAYOUT)
  // ==========================================
  return (
    <div className="container-fluid p-0" style={{ backgroundColor: '#f8fafc', minHeight: 'calc(100vh - 70px)' }}>
      <div className="row g-0 h-100">
        
        {/* SIDEBAR OSCURO PREMIUM */}
        <div className="col-auto d-flex flex-column shadow-sm" style={{ width: '260px', backgroundColor: '#111827', minHeight: 'calc(100vh - 70px)' }}>
          <div className="p-4 border-bottom border-secondary">
            <h5 className="text-white fw-bold m-0 text-center" style={{ color: '#2cb1ff' }}>
              Ventas Perrunas
            </h5>
            <div className="text-center mt-1">
              <span className="badge bg-info text-dark">INTRANET ADMIN</span>
            </div>
          </div>

          <ul className="nav flex-column mb-auto mt-3">
            {[
              { id: 'inventario', label: 'Inventario', icon: <FiPackage /> },
              { id: 'ordenes', label: 'Órdenes Clientes', icon: <FiShoppingCart /> },
              { id: 'pedidos', label: 'Pedidos Proveedor', icon: <FiTruck /> },
              { id: 'auditoria', label: 'Auditoría Empleados', icon: <FiActivity /> },
              // 3. AGREGAMOS EL BOTÓN AL MENÚ LATERAL
              { id: 'crear_usuario', label: 'Alta de Personal', icon: <FiUserPlus /> }
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
            <button className="btn btn-link text-secondary text-decoration-none d-flex align-items-center gap-2 small p-0 mb-2"><FiSettings /> Ajustes Globales</button>
            <button className="btn btn-link text-secondary text-decoration-none d-flex align-items-center gap-2 small p-0"><FiHelpCircle /> Soporte Empleados</button>
          </div>
        </div>

        {/* ÁREA DE CONTENIDO DINÁMICO */}
        <div className="col" style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 70px)' }}>
          
          {/* Top Bar interno */}
          <div className="bg-white border-bottom p-3 d-flex justify-content-between align-items-center sticky-top">
            <div className="input-group w-50">
              <span className="input-group-text bg-light border-0"><FiSearch /></span>
              <input type="text" className="form-control bg-light border-0" placeholder="Buscar en la intranet..." />
            </div>
            <div className="d-flex align-items-center gap-3">
              <span className="fw-bold text-dark">Admin: {user.nombre}</span>
            </div>
          </div>

          {/* Renderizado de Vistas */}
          <div className="p-2">
            {vistaActiva === 'inventario' && <VistaInventario />}
            {vistaActiva === 'ordenes' && <VistaOrdenesClientes />}
            {vistaActiva === 'pedidos' && <VistaPedidosProveedor />}
            {vistaActiva === 'auditoria' && <AuditoriaEmpleados/>}
            {/* 4. LE DECIMOS A REACT QUE MUESTRE EL FORMULARIO CUANDO SE SELECCIONE EL BOTÓN */}
            {vistaActiva === 'crear_usuario' && <CrearUsuarioAdmin />}
          </div>
        </div>

      </div>
    </div>
  );
}

export default DashboardIntranet;