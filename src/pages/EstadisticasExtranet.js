import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { FiTrendingUp, FiBox, FiClock, FiCheckSquare } from 'react-icons/fi';
// Importamos los componentes de Recharts
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as TooltipChart, Legend, ResponsiveContainer,
  LineChart, Line 
} from 'recharts';

const EstadisticasExtranet = () => {
  const { user } = useContext(AuthContext);
  const [estadisticas, setEstadisticas] = useState({
    ingresosTotales: 0,
    pedidosCompletados: 0,
    pedidosPendientes: 0,
    totalPedidos: 0
  });

  const [datosVentas, setDatosVentas] = useState([]);
  const [topProductos, setTopProductos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    // Solo cargamos si el usuario ya está listo en el contexto
    if (user?.rfc) {
      cargarDatosCompletos();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

const cargarDatosCompletos = async () => {
    try {
      setCargando(true);
      const rfcSeguro = user?.rfc || ""; 
const parametrosFiltro = `?rol=${user.rol}&rfc=${rfcSeguro}`;
console.log("🔍 [DEBUG] URL de petición final:", `http://127.0.0.1:8000/api/pedidos/${parametrosFiltro}`);
      
      console.log("🔍 [DEBUG] Buscando datos con RFC:", user.rfc);

      const [resPedidos, resProductos] = await Promise.all([
        fetch(`http://127.0.0.1:8000/api/pedidos/${parametrosFiltro}`),
        fetch(`http://127.0.0.1:8000/api/productos/${parametrosFiltro}`)
      ]);

      const misPedidos = await resPedidos.json();
      const productosBD = await resProductos.json();

      console.log("📦 [DEBUG] Pedidos recibidos:", misPedidos);
      console.log("📦 [DEBUG] Productos del catálogo:", productosBD);

      if (misPedidos.length === 0) {
        console.warn("⚠️ [DEBUG] No hay pedidos para este RFC en la respuesta de Django");
        setCargando(false);
        return;
      }

      // --- CÁLCULO ---
      let ingresos = 0, completados = 0, pendientes = 0;
      const ventasPorFecha = {};

      misPedidos.forEach(ped => {
        const total = parseFloat(ped.total_compra || 0);
        ingresos += total;
        
        // Estatus 4 = Entregado
        if (String(ped.estatus) === '4') completados++;
        else pendientes++;

        const fecha = ped.fecha_compra ? ped.fecha_compra.split('T')[0] : 'Desconocido';
        ventasPorFecha[fecha] = (ventasPorFecha[fecha] || 0) + total;
      });

      setEstadisticas({ ingresosTotales: ingresos, pedidosCompletados: completados, pedidosPendientes: pendientes, totalPedidos: misPedidos.length });
      setDatosVentas(Object.keys(ventasPorFecha).map(f => ({ fecha: f, Ingresos: ventasPorFecha[f] })));

      // --- TOP PRODUCTOS ---
      // Obtenemos detalles de TODOS los pedidos de una vez
      const promesasDetalles = misPedidos.map(ped => 
        fetch(`http://127.0.0.1:8000/api/pedidos/${ped.id_pedido}/detalles/`).then(r => r.json())
      );
      
      const arraysDeDetalles = await Promise.all(promesasDetalles);
      const todosLosDetalles = arraysDeDetalles.flat();

      const conteoProductos = {};
      todosLosDetalles.forEach(d => {
        // Buscamos ID, intentando varias llaves por si acaso
        const idProd = d.id_producto || d.producto_id || d.id_producto_id;
        if (idProd) {
            conteoProductos[idProd] = (conteoProductos[idProd] || 0) + parseInt(d.cantidad || 0);
        }
      });

      const dataBarras = Object.keys(conteoProductos).map(id => ({
        nombre: productosBD.find(p => String(p.id_producto) === String(id))?.nombre || `Prod ${id}`,
        Vendidos: conteoProductos[id]
      })).sort((a, b) => b.Vendidos - a.Vendidos).slice(0, 5);

      setTopProductos(dataBarras);
    } catch (error) {
      console.error("Error crítico en estadísticas:", error);
    } finally {
      setCargando(false);
    }
  };

// --- CÁLCULO DE TARJETAS SUPERIORES ---
      let ingresos = 0, completados = 0, pendientes = 0;
      const ventasPorFecha = {};

      misPedidos.forEach(ped => {
        const total = parseFloat(ped.total_compra || 0);
        ingresos += total;
        
        // Convertimos a string para comparar sin importar si es número o texto
        const estatus = String(ped.estatus);
        if (estatus === '4') completados++;
        else pendientes++;

        // 🔥 Limpiamos la fecha para que siempre sea YYYY-MM-DD
        const fecha = ped.fecha_compra ? ped.fecha_compra.split('T')[0] : 'Sin fecha';
        ventasPorFecha[fecha] = (ventasPorFecha[fecha] || 0) + total;
      });

      // --- CÁLCULO DE PRODUCTOS MÁS VENDIDOS ---
      const conteoProductos = {};
      arraysDeDetalles.forEach(lista => {
         lista.forEach(detalle => {
            // 🔥 Buscamos el ID en cualquier variante posible
            const idProd = detalle.id_producto || detalle.producto_id || detalle.id_producto_id;
            const cantidad = parseInt(detalle.cantidad || 0);
            
            if (idProd) {
               conteoProductos[idProd] = (conteoProductos[idProd] || 0) + cantidad;
            }
         });
      });

  return (
    <div className="animate__animated animate__fadeIn">
      
      {/* LAS 4 TARJETAS SUPERIORES */}
      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm rounded-4 text-dark h-100 p-3">
            <h6 className="text-muted fw-bold mb-3">Total de Ventas</h6>
            <h2 className="fw-bold m-0 d-flex align-items-center text-primary">
              ${estadisticas.ingresosTotales.toLocaleString()} 
              <FiTrendingUp className="text-success ms-2" size={24}/>
            </h2>
            <small className="text-muted mt-2">Ingresos acumulados B2B</small>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm rounded-4 text-dark h-100 p-3">
            <h6 className="text-muted fw-bold mb-3"><FiClock className="me-2"/> Pendientes</h6>
            <h2 className="fw-bold m-0 text-warning">{estadisticas.pedidosPendientes}</h2>
            <small className="text-muted mt-2">Órdenes por entregar</small>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm rounded-4 text-dark h-100 p-3">
            <h6 className="text-muted fw-bold mb-3"><FiCheckSquare className="me-2"/> Completadas</h6>
            <h2 className="fw-bold m-0 text-success">{estadisticas.pedidosCompletados}</h2>
            <small className="text-muted mt-2">Órdenes entregadas</small>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm rounded-4 text-dark h-100 p-3">
            <h6 className="text-muted fw-bold mb-3"><FiBox className="me-2"/> Volumen Histórico</h6>
            <h2 className="fw-bold m-0 text-dark">{estadisticas.totalPedidos}</h2>
            <small className="text-muted mt-2">Total de pedidos recibidos</small>
          </div>
        </div>
      </div>

      {cargando ? (
        <div className="text-center py-5"><div className="spinner-border text-primary"></div><p className="mt-2 text-muted">Procesando datos del inventario...</p></div>
      ) : (
        <div className="row g-4">
          
          {/* GRÁFICA DE LÍNEAS: TENDENCIA DE INGRESOS */}
          <div className="col-md-7">
            <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
              <h5 className="fw-bold mb-4 text-dark">Tendencia de Ingresos</h5>
              {datosVentas.length > 0 ? (
                <div style={{ height: '300px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={datosVentas} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="fecha" tick={{fontSize: 12}} />
                      <YAxis tick={{fontSize: 12}} />
                      <TooltipChart cursor={{ fill: 'transparent' }} />
                      <Legend />
                      <Line type="monotone" dataKey="Ingresos" stroke="#0d6efd" strokeWidth={3} activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="d-flex align-items-center justify-content-center h-100 text-muted">No hay ventas registradas aún.</div>
              )}
            </div>
          </div>

          {/* GRÁFICA DE BARRAS: PRODUCTOS MÁS PEDIDOS */}
          <div className="col-md-5">
            <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
              <h5 className="fw-bold mb-4 text-dark">Top 5 Productos Demandados</h5>
              {topProductos.length > 0 ? (
                <div style={{ height: '300px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topProductos} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={true} vertical={false} />
                      <XAxis type="number" />
                      <YAxis dataKey="nombre" type="category" width={100} tick={{fontSize: 11}} />
                      <TooltipChart cursor={{ fill: '#f8f9fa' }} />
                      <Legend />
                      <Bar dataKey="Vendidos" fill="#198754" radius={[0, 4, 4, 0]} barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="d-flex align-items-center justify-content-center h-100 text-muted">Aún no se han vendido productos.</div>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default EstadisticasExtranet;