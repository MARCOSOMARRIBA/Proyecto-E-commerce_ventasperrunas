import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { FiTrendingUp, FiBox, FiClock, FiCheckSquare } from 'react-icons/fi';

const EstadisticasExtranet = () => {
  const { user } = useContext(AuthContext);
  const [estadisticas, setEstadisticas] = useState({
    ingresosTotales: 0,
    pedidosCompletados: 0,
    pedidosPendientes: 0,
    totalPedidos: 0
  });

  useEffect(() => {
    if (user?.rfc) {
      cargarEstadisticas();
    }
  }, [user]);

  const cargarEstadisticas = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/pedidos/`);
      if (res.ok) {
        const data = await res.json();
        
        // Filtramos para que este proveedor solo vea sus propios pedidos
        const misPedidos = data.filter(p => p.rfc === user.rfc);
        
        let ingresos = 0;
        let completados = 0;
        let pendientes = 0;

        misPedidos.forEach(ped => {
          // Sumamos todo el dinero de los pedidos. 
          // Ojo: En un futuro, podrías sumar solo los Estatus 4 (Pagados)
          ingresos += parseFloat(ped.total_compra || 0);
          
          if (ped.estatus === '4') { 
            completados++;
          } else if (ped.estatus === '1' || ped.estatus === '2') {
            pendientes++;
          }
        });

        setEstadisticas({
          ingresosTotales: ingresos,
          pedidosCompletados: completados,
          pedidosPendientes: pendientes,
          totalPedidos: misPedidos.length
        });
      }
    } catch (error) {
      console.error("Error cargando estadísticas:", error);
    }
  };

  return (
    <div className="animate__animated animate__fadeIn">
      
      {/* LAS 4 TARJETAS SUPERIORES */}
      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm rounded-4 text-dark h-100 p-3">
            <h6 className="text-muted fw-bold mb-3">Total de Ventas</h6>
            <h2 className="fw-bold m-0 d-flex align-items-center">
              ${estadisticas.ingresosTotales.toLocaleString()} 
              <FiTrendingUp className="text-success ms-2" size={24}/>
            </h2>
            <small className="text-muted mt-2">Datos en tiempo real</small>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm rounded-4 text-dark h-100 p-3">
            <h6 className="text-muted fw-bold mb-3">Órdenes Pendientes</h6>
            <h2 className="fw-bold m-0 text-warning">{estadisticas.pedidosPendientes}</h2>
            <small className="text-muted mt-2">Datos en tiempo real</small>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm rounded-4 text-dark h-100 p-3">
            <h6 className="text-muted fw-bold mb-3">Órdenes Completadas</h6>
            <h2 className="fw-bold m-0 text-success">{estadisticas.pedidosCompletados}</h2>
            <small className="text-muted mt-2">Datos en tiempo real</small>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm rounded-4 text-dark h-100 p-3">
            <h6 className="text-muted fw-bold mb-3">Volumen Histórico</h6>
            <h2 className="fw-bold m-0 text-primary">{estadisticas.totalPedidos}</h2>
            <small className="text-muted mt-2">Datos en tiempo real</small>
          </div>
        </div>
      </div>

      {/* EL RECUADRO INFERIOR (Tendencia) */}
      <div className="card border-0 shadow-sm rounded-4 p-4">
        <h5 className="fw-bold mb-4">Tendencia de Ventas (PostgreSQL)</h5>
        <div className="d-flex justify-content-center align-items-center bg-light rounded" style={{ height: '300px', border: '2px dashed #dee2e6' }}>
           {estadisticas.totalPedidos > 0 ? (
             <div className="text-center">
               <FiBox size={50} className="text-primary mb-3" />
               <h4 className="fw-bold text-dark">¡Tienes {estadisticas.totalPedidos} pedidos registrados!</h4>
               <p className="text-muted">Instala una librería como <code>recharts</code> o <code>chart.js</code> para convertir estos datos en barras visuales.</p>
             </div>
           ) : (
             <span className="text-muted">Aún no hay suficientes datos para graficar. Espera tu primer pedido.</span>
           )}
        </div>
      </div>

    </div>
  );
};

export default EstadisticasExtranet;