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
    if (user?.rfc) {
      cargarDatosCompletos();
    }
  }, [user]);

  const cargarDatosCompletos = async () => {
    try {
      // 1. Traemos TODOS los pedidos y TODOS los productos del catálogo
      const [resPedidos, resProductos] = await Promise.all([
        fetch('http://127.0.0.1:8000/api/pedidos/'),
        fetch('http://127.0.0.1:8000/api/productos/')
      ]);

      if (!resPedidos.ok || !resProductos.ok) throw new Error("Fallo al cargar datos");

      const pedidosBD = await resPedidos.json();
      const productosBD = await resProductos.json();

      // Diccionario para saber el nombre de cada producto rápido
      const mapaProductos = {};
      productosBD.forEach(p => { mapaProductos[p.id_producto] = p.nombre; });

      // Filtramos solo los de este proveedor
      const misPedidos = pedidosBD.filter(p => p.rfc === user.rfc);

      // --- CÁLCULO DE TARJETAS SUPERIORES ---
      let ingresos = 0, completados = 0, pendientes = 0;
      const ventasPorFecha = {}; // Para la gráfica de líneas

      misPedidos.forEach(ped => {
        const total = parseFloat(ped.total_compra || 0);
        ingresos += total;
        
        if (ped.estatus === '4') completados++;
        else pendientes++;

        // Agrupamos ventas por fecha
        const fecha = ped.fecha_compra;
        if (ventasPorFecha[fecha]) ventasPorFecha[fecha] += total;
        else ventasPorFecha[fecha] = total;
      });

      setEstadisticas({
        ingresosTotales: ingresos,
        pedidosCompletados: completados,
        pedidosPendientes: pendientes,
        totalPedidos: misPedidos.length
      });

      // Convertimos el objeto de fechas a un Array para Recharts
      const dataLinea = Object.keys(ventasPorFecha).sort().map(fecha => ({
        fecha: fecha,
        Ingresos: ventasPorFecha[fecha]
      }));
      setDatosVentas(dataLinea);

      // --- CÁLCULO DE PRODUCTOS MÁS VENDIDOS (BARRAS) ---
      // Traemos los detalles de todos los pedidos de este proveedor al mismo tiempo
      const promesasDetalles = misPedidos.map(ped => 
        fetch(`http://127.0.0.1:8000/api/pedidos/${ped.id_pedido}/detalles/`).then(r => r.json())
      );
      
      const arraysDeDetalles = await Promise.all(promesasDetalles);
      const todosLosDetalles = arraysDeDetalles.flat(); // Juntamos todo en una sola lista

      const conteoProductos = {};
      todosLosDetalles.forEach(detalle => {
        const idProd = detalle.id_producto; // Podría ser id_producto_id dependiendo de tu Django
        const cantidad = detalle.cantidad;
        
        if (conteoProductos[idProd]) conteoProductos[idProd] += cantidad;
        else conteoProductos[idProd] = cantidad;
      });

      // Convertimos a Array, le ponemos el nombre real y ordenamos de mayor a menor
      const dataBarras = Object.keys(conteoProductos).map(id => ({
        nombre: mapaProductos[id] || `ID: ${id}`, // Si no encuentra el nombre, pone el ID
        Vendidos: conteoProductos[id]
      })).sort((a, b) => b.Vendidos - a.Vendidos).slice(0, 5); // Tomamos el Top 5

      setTopProductos(dataBarras);

    } catch (error) {
      console.error("Error al procesar gráficas:", error);
    } finally {
      setCargando(false);
    }
  };

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