import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { FiEdit, FiTrash2, FiPlus, FiPackage, FiShoppingCart, FiTruck, FiSettings, FiHelpCircle, FiSearch } from 'react-icons/fi';
import VistaOrdenesClientes from './OrdenesClientesIntranet';
import VistaPedidosProveedor from './PedidosProveedorIntranet';

function DashboardIntranet() {
  const { user } = useContext(AuthContext);
  const [vistaActiva, setVistaActiva] = useState('inventario');

  // Seguridad estricta: Solo permite entrar a Admin (Rol 3)
  if (!user || user.rol !== '3') return <Navigate to="/" />;

  // ==========================================
  // 1. VISTA: INVENTARIO (Conectado a PostgreSQL)
  // ==========================================
  const VistaInventario = () => {
    const [productos, setProductos] = useState([]);
    const [cargando, setCargando] = useState(true);

    // Efecto para traer los datos reales de tu tabla 'producto'
    useEffect(() => {
      const fetchProductos = async () => {
        try {
          const res = await fetch('http://127.0.0.1:8000/api/productos/');
          if (res.ok) {
            const data = await res.json();
            setProductos(data);
          }
        } catch (error) {
          console.error("Error al cargar inventario:", error);
        } finally {
          setCargando(false);
        }
      };
      fetchProductos();
    }, []);

    return (
      <div className="animate__animated animate__fadeIn p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold m-0">Gestión de Inventario</h2>
            <p className="text-muted">Control total de productos y stock.</p>
          </div>
          <button className="btn btn-success fw-bold d-flex align-items-center gap-2 hover-scale">
            <FiPlus /> Nuevo Producto
          </button>
        </div>

        <div className="card shadow-sm border-0 fade-in-up">
          <div className="card-body p-0">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light text-muted small">
                <tr>
                  <th className="ps-4 py-3">ID PRODUCTO</th>
                  <th>NOMBRE</th>
                  <th>PRECIO</th>
                  <th>STOCK</th>
                  <th className="text-center">ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {cargando ? (
                  <tr><td colSpan="5" className="text-center py-4 text-muted">Cargando base de datos...</td></tr>
                ) : productos.length > 0 ? (
                  productos.map((prod) => (
                    <tr key={prod.id_producto}>
                      <td className="ps-4 text-muted"><code>{prod.id_producto}</code></td>
                      <td className="fw-bold">{prod.nombre}</td>
                      <td className="text-primary fw-bold">${parseFloat(prod.precio).toFixed(2)}</td>
                      <td>
                        <span className="text-success fw-medium">En Stock</span>
                      </td>
                      <td className="text-center">
                        <button className="btn btn-sm btn-light text-primary me-2 hover-scale"><FiEdit /></button>
                        <button className="btn btn-sm btn-light text-danger hover-scale"><FiTrash2 /></button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-5 text-muted">
                      No hay productos registrados en la base de datos.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

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
              { id: 'pedidos', label: 'Pedidos Proveedor', icon: <FiTruck /> }
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
          </div>
        </div>

      </div>
    </div>
  );
}

export default DashboardIntranet;