import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { FiPackage, FiShoppingCart, FiTruck, FiSearch } from 'react-icons/fi';

// ¡Reutilizamos los componentes que ya programamos!
import VistaOrdenesClientes from './OrdenesClientesIntranet';
import VistaPedidosProveedor from './PedidosProveedorIntranet';
import VistaInventario from './InventarioIntranet';

function DashboardEmpleado() {
  const { user } = useContext(AuthContext);
  const [vistaActiva, setVistaActiva] = useState('ordenes'); // Por defecto los empleados ven las órdenes de clientes

  // =================================================================
  // 🛡️ SEGURIDAD RBAC: Solo permite entrar a Empleados (Rol 2)
  // =================================================================
  if (!user || user.rol !== '2') return <Navigate to="/" />;

  return (
    <div className="container-fluid p-0" style={{ backgroundColor: '#f8fafc', minHeight: 'calc(100vh - 70px)' }}>
      <div className="row g-0 h-100">
        
        {/* SIDEBAR OSCURO (Versión Empleado) */}
        <div className="col-auto d-flex flex-column shadow-sm" style={{ width: '260px', backgroundColor: '#1e293b', minHeight: 'calc(100vh - 70px)' }}>
          <div className="p-4 border-bottom border-secondary">
            <h5 className="text-white fw-bold m-0 text-center" style={{ color: '#38bdf8' }}>
              Ventas Perrunas
            </h5>
            <div className="text-center mt-2">
              {/* Etiqueta verde para diferenciarlo visualmente del Admin */}
              <span className="badge bg-success text-white px-3 py-2 rounded-pill">
                PANEL OPERATIVO
              </span>
            </div>
          </div>

          <ul className="nav flex-column mb-auto mt-3">
            {[
              { id: 'ordenes', label: 'Despacho de Clientes', icon: <FiShoppingCart /> },
              { id: 'inventario', label: 'Gestión de Stock', icon: <FiPackage /> },
              { id: 'pedidos', label: 'Resurtido (Proveedores)', icon: <FiTruck /> }
            ].map(item => (
              <li className="nav-item" key={item.id}>
                <button 
                  onClick={() => setVistaActiva(item.id)} 
                  className={`nav-link w-100 text-start px-4 py-3 d-flex align-items-center gap-3 border-0 ${vistaActiva === item.id ? 'text-white fw-bold' : 'text-secondary'}`}
                  style={{ 
                    backgroundColor: vistaActiva === item.id ? 'rgba(56, 189, 248, 0.1)' : 'transparent',
                    borderLeft: vistaActiva === item.id ? '4px solid #38bdf8' : '4px solid transparent',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {item.icon} {item.label}
                </button>
              </li>
            ))}
          </ul>
          
          <div className="p-4 mt-auto border-top border-secondary text-center">
            <small className="text-muted">Módulo de Empleados v1.0</small>
          </div>
        </div>

        {/* ÁREA DE CONTENIDO DINÁMICO */}
        <div className="col" style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 70px)' }}>
          
          {/* Top Bar interno */}
          <div className="bg-white border-bottom p-3 d-flex justify-content-between align-items-center sticky-top shadow-sm">
            <div className="input-group w-50">
              <span className="input-group-text bg-light border-0 text-muted"><FiSearch /></span>
              <input type="text" className="form-control bg-light border-0" placeholder="Buscar en el sistema operativo..." />
            </div>
            <div className="d-flex align-items-center gap-3">
              {/* Mostramos el nombre del empleado logueado */}
              <div className="text-end">
                <span className="fw-bold text-dark d-block" style={{ lineHeight: '1' }}>{user.nombre}</span>
                <small className="text-success fw-bold">Empleado de Piso</small>
              </div>
              <div className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center fw-bold fs-5" style={{width: '45px', height: '45px'}}>
                {user.nombre ? user.nombre.charAt(0).toUpperCase() : 'E'}
              </div>
            </div>
          </div>

          {/* Renderizado de Vistas (Reutilizando los componentes) */}
          <div className="p-2">
            {vistaActiva === 'ordenes' && <VistaOrdenesClientes />}
            {vistaActiva === 'inventario' && <VistaInventario />}
            {vistaActiva === 'pedidos' && <VistaPedidosProveedor />}
          </div>
        </div>

      </div>
    </div>
  );
}

export default DashboardEmpleado;