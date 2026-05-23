import React, { useState, useEffect, useContext } from 'react';
import { FiDownload, FiTrendingUp } from 'react-icons/fi';
import { AuthContext } from '../context/AuthContext';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as TooltipChart, Legend, ResponsiveContainer,
  LineChart, Line 
} from 'recharts';

// 🚀 IMPORTAMOS LAS HERRAMIENTAS PARA EL PDF
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // 🚀 Importación explícita

const DashboardOverview = () => {
  const { user } = useContext(AuthContext);
  
  const [stats, setStats] = useState({ ventasTotales: 0, totalPedidos: 0, ordenesPendientes: 0, pedidosCompletados: 0 });
  const [datosVentas, setDatosVentas] = useState([]);
  const [topProductos, setTopProductos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (user?.rfc) cargarDatosCompletos();
  }, [user]);

const cargarDatosCompletos = async () => {
    try {
      // 1. Fetch de datos: Le pasamos los parámetros exactos a la URL para que Django no bloquee
      const parametrosFiltro = `?rol=${user.rol}&rfc=${user.rfc}`;
      
      const [resPedidos, resProductos] = await Promise.all([
        fetch(`https://proyecto-e-commerce-ventasperrunas.onrender.com/api/pedidos/${parametrosFiltro}`),
        fetch(`https://proyecto-e-commerce-ventasperrunas.onrender.com/api//productos/${parametrosFiltro}`)
      ]);

      if (!resPedidos.ok || !resProductos.ok) throw new Error("Fallo al cargar datos");

      const pedidosBD = await resPedidos.json();
      const productosBD = await resProductos.json();

      // 2. Diagnóstico: ¿Qué estamos comparando exactamente?
      const rfcUser = String(user.rfc).trim().toUpperCase();
      console.log("RFC Buscado (Usuario):", rfcUser);

      // 3. Filtrado Robusto
      const misPedidos = pedidosBD.filter(p => {
        const rfcPedido = String(p.rfc).trim().toUpperCase();
        return rfcPedido === rfcUser;
      });

      console.log("Pedidos encontrados tras filtrar:", misPedidos);

      if (misPedidos.length === 0) {
        console.warn("⚠️ Filtro devolvió 0 pedidos. Revisa si el RFC en BD coincide con:", rfcUser);
        setCargando(false);
        return;
      }

      // 4. Mapeo de productos
      const mapaProductos = {};
      productosBD.forEach(p => { mapaProductos[p.id_producto] = p.nombre; });

      // 5. Cálculos (usando misPedidos)
      let ingresos = 0, completados = 0, pendientes = 0;
      const ventasPorFecha = {}; 

      misPedidos.forEach(ped => {
        const total = parseFloat(ped.total_compra || 0);
        ingresos += total;
        
        const estatus = String(ped.estatus);
        // Estatus 4 es entregado, 1 o 2 son pendientes (ajusta si tus estatus son diferentes)
        if (estatus === '4') completados++;
        else if (estatus === '1' || estatus === '2') pendientes++;

        const fecha = ped.fecha_compra || 'Sin fecha';
        ventasPorFecha[fecha] = (ventasPorFecha[fecha] || 0) + total;
      });

      setStats({
        ventasTotales: ingresos,
        totalPedidos: misPedidos.length,
        ordenesPendientes: pendientes,
        pedidosCompletados: completados
      });

      const dataLinea = Object.keys(ventasPorFecha).sort().map(f => ({ fecha: f, Ingresos: ventasPorFecha[f] }));
      setDatosVentas(dataLinea);

      // --- CÁLCULO DE TOP PRODUCTOS ---
      // Obtenemos los detalles solo de "misPedidos" para que el top sea real
      const promesasDetalles = misPedidos.map(ped => 
        fetch(`https://proyecto-e-commerce-ventasperrunas.onrender.com/api/pedidos/${ped.id_pedido}/detalles/`).then(r => r.json())
      );
      const arraysDeDetalles = await Promise.all(promesasDetalles);
      const todosLosDetalles = arraysDeDetalles.flat();

      const conteoProductos = {};
      todosLosDetalles.forEach(detalle => {
        const idProd = detalle.id_producto;
        if (conteoProductos[idProd]) conteoProductos[idProd] += parseInt(detalle.cantidad || 0);
        else conteoProductos[idProd] = parseInt(detalle.cantidad || 0);
      });

      const dataBarras = Object.keys(conteoProductos).map(id => ({
        nombre: mapaProductos[id] || `Producto ${id}`, 
        Vendidos: conteoProductos[id]
      })).sort((a, b) => b.Vendidos - a.Vendidos).slice(0, 5);

      setTopProductos(dataBarras);
      
    } catch (error) {
      console.error("Error crítico:", error);
    } finally {
      setCargando(false);
    }
  };
  
  // 📄 FUNCIÓN MÁGICA: GENERAR PDF PROFESIONAL
  const exportarPDF = () => {
    const doc = new jsPDF();
    const fechaActual = new Date().toLocaleDateString('es-MX');

    // 1. Título y Encabezado
    doc.setFontSize(22);
    doc.setTextColor(44, 177, 255); // Color azul Petco
    doc.text("Reporte de Ventas B2B", 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Proveedor: ${user?.nombre_usuario || 'Pet Premium del Golfo'}`, 14, 28);
    doc.text(`RFC: ${user?.rfc || 'N/A'}`, 14, 33);
    doc.text(`Fecha de emisión: ${fechaActual}`, 14, 38);

    // Línea separadora
    doc.setDrawColor(200);
    doc.line(14, 42, 196, 42);

    // 2. Resumen Ejecutivo (Indicadores)
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text("Resumen Ejecutivo", 14, 52);

    doc.setFontSize(11);
    doc.setTextColor(80);
    doc.text(`• Ingresos Totales: $${stats.ventasTotales.toLocaleString()}`, 14, 60);
    doc.text(`• Total de Pedidos: ${stats.totalPedidos}`, 14, 66);
    doc.text(`• Órdenes Completadas: ${stats.pedidosCompletados}`, 14, 72);
    doc.text(`• Órdenes Pendientes: ${stats.ordenesPendientes}`, 14, 78);

    // 3. Tabla de Top Productos usando autoTable
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text("Top Productos Más Solicitados", 14, 95);

    // Convertimos nuestros datos del topProductos a un formato de tabla
    const columnasTabla = [["Posición", "Nombre del Producto", "Unidades Vendidas"]];
    const filasTabla = topProductos.map((prod, index) => [
      `#${index + 1}`,
      prod.nombre,
      prod.Vendidos
    ]);

    // 🚀 Usamos autoTable pasándole 'doc' como primer parámetro
    autoTable(doc, {
      startY: 100,
      head: columnasTabla,
      body: filasTabla,
      theme: 'grid',
      headStyles: { fillColor: [44, 177, 255] }, 
      styles: { fontSize: 10, cellPadding: 4 },
      alternateRowStyles: { fillColor: [248, 249, 250] } 
    });

    // 4. Pie de página
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(
        `Reporte generado automáticamente desde el Sistema Extranet • Página ${i} de ${pageCount}`,
        doc.internal.pageSize.width / 2, 
        doc.internal.pageSize.height - 10, 
        { align: 'center' }
      );
    }

    // 5. Descargar archivo
    doc.save(`Reporte_Ventas_${user?.rfc || 'Proveedor'}_${fechaActual}.pdf`);
  };

  return (
    <div className="animate__animated animate__fadeIn">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold m-0">Resumen General B2B</h2>
          <p className="text-muted">Indicadores clave de rendimiento para tu cuenta.</p>
        </div>
        {/* 🚀 AQUÍ CONECTAMOS LA FUNCIÓN AL BOTÓN */}
        <button onClick={exportarPDF} className="btn btn-outline-primary fw-bold d-flex align-items-center gap-2">
          <FiDownload /> Exportar PDF
        </button>
      </div>

      <div className="row mb-4">
        {[
          { label: 'VENTAS TOTALES', val: `$${stats.ventasTotales.toLocaleString()}`, color: '#2cb1ff' },
          { label: 'TOTAL PEDIDOS', val: stats.totalPedidos, color: '#10b981' },
          { label: 'ÓRDENES PENDIENTES', val: stats.ordenesPendientes, color: '#f59e0b' },
          { label: 'ÓRDENES COMPLETADAS', val: stats.pedidosCompletados, color: '#ef4444' }
        ].map((item, i) => (
          <div className="col-md-3" key={i}>
            <div className={`card border-0 shadow-sm p-4 h-100 fade-in-up hover-elevate delay-${i}`} style={{ borderTop: `4px solid ${item.color}` }}>
              <h6 className="text-muted small fw-bold mb-3">{item.label}</h6>
              <h3 className="fw-bold m-0">{item.val}</h3>
              <div className="mt-2 small text-muted"><FiTrendingUp /> Datos en tiempo real</div>
            </div>
          </div>
        ))}
      </div>

      {cargando ? (
        <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
      ) : (
        <div className="row g-4">
          
          <div className="col-md-7">
            <div className="card border-0 shadow-sm p-4 h-100 rounded-4">
              <h5 className="fw-bold mb-4">Tendencia de Ingresos</h5>
              {datosVentas.length > 0 ? (
                <div style={{ height: '300px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={datosVentas} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="fecha" tick={{fontSize: 12}} />
                      <YAxis tick={{fontSize: 12}} />
                      <TooltipChart cursor={{ fill: 'transparent' }} />
                      <Legend />
                      <Line type="monotone" dataKey="Ingresos" stroke="#2cb1ff" strokeWidth={3} activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="d-flex align-items-center justify-content-center h-100 text-muted" style={{backgroundColor: '#fdfdfd', border: '2px dashed #e2e8f0', borderRadius: '10px'}}>
                  No hay ventas registradas aún.
                </div>
              )}
            </div>
          </div>

          <div className="col-md-5">
            <div className="card border-0 shadow-sm p-4 h-100 rounded-4">
              <h5 className="fw-bold mb-4">Top 5 Productos Vendidos</h5>
              {topProductos.length > 0 ? (
                <div style={{ height: '300px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topProductos} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={true} vertical={false} />
                      <XAxis type="number" />
                      <YAxis dataKey="nombre" type="category" width={100} tick={{fontSize: 11}} />
                      <TooltipChart cursor={{ fill: '#f8f9fa' }} />
                      <Legend />
                      <Bar dataKey="Vendidos" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="d-flex align-items-center justify-content-center h-100 text-muted" style={{backgroundColor: '#fdfdfd', border: '2px dashed #e2e8f0', borderRadius: '10px'}}>
                  Aún no se han vendido productos.
                </div>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default DashboardOverview;