import React, { useState, useEffect } from 'react';
import { FiPackage, FiEye, FiList, FiPlus, FiSend, FiTrash2, FiSearch, FiShoppingCart } from 'react-icons/fi';

const PedidosProveedorIntranet = () => {
  const [pedidos, setPedidos] = useState([]);
  const [productosBase, setProductosBase] = useState([]); 
  const [proveedoresBase, setProveedoresBase] = useState([]); 
  const [detalles, setDetalles] = useState([]);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [cargando, setCargando] = useState(true);

  const [nuevaOrden, setNuevaOrden] = useState({
    rfc: '',
    descripcion: '',
    items: [{ id_producto: '', cantidad: 1, precio_unitario: 0 }]
  });

  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  const cargarDatosIniciales = async () => {
    try {
      const [resPedidos, resProds, resProv] = await Promise.all([
        fetch('http://127.0.0.1:8000/api/pedidos/'),
        fetch('http://127.0.0.1:8000/api/productos/'),
        fetch('http://127.0.0.1:8000/api/proveedores/')
      ]);
      
      if (resPedidos.ok) setPedidos(await resPedidos.json());
      if (resProds.ok) setProductosBase(await resProds.json());
      if (resProv.ok) setProveedoresBase(await resProv.json());
    } catch (error) {
      console.error("Error al sincronizar datos:", error);
    } finally {
      setCargando(false);
    }
  };

  // Función para ver detalles reales de la tabla detalle_pedido [cite: 26]
  const verDetalles = async (idPedido) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/pedidos/${idPedido}/detalles/`);
      if (res.ok) {
        const data = await res.json();
        setDetalles(data);
        setPedidoSeleccionado(pedidos.find(p => p.id_pedido === idPedido));
      }
    } catch (error) {
      alert("Error al conectar con la base de datos para obtener detalles.");
    }
  };

  const manejarCambioItem = (index, field, value) => {
    const nuevosItems = [...nuevaOrden.items];
    if (field === 'id_producto') {
      const prodEncontrado = productosBase.find(p => p.id_producto === value);
      nuevosItems[index].precio_unitario = prodEncontrado ? prodEncontrado.precio : 0;
    }
    nuevosItems[index][field] = value;
    setNuevaOrden({ ...nuevaOrden, items: nuevosItems });
  };

  const quitarItem = (index) => {
    const filtrados = nuevaOrden.items.filter((_, i) => i !== index);
    setNuevaOrden({ ...nuevaOrden, items: filtrados });
  };

  return (
    <div className="p-4 animate__animated animate__fadeIn" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-dark m-0">Órdenes de Compra</h2>
          <p className="text-muted small">Gestión de abastecimiento y relación con proveedores</p>
        </div>
        <button 
          onClick={() => setMostrarFormulario(true)} 
          className="btn btn-primary d-flex align-items-center gap-2 px-4 shadow-sm fw-bold"
        >
          <FiPlus /> Nueva Orden de Surtido
        </button>
      </div>

      <div className="card shadow-sm border-0" style={{ borderRadius: '15px' }}>
        <div className="card-body p-0">
          <table className="table table-hover align-middle mb-0">
            <thead style={{ backgroundColor: '#2d3436', color: 'white' }}>
              <tr>
                <th className="ps-4 py-3">FOLIO</th>
                <th>FECHA DE EMISIÓN</th>
                <th>PROVEEDOR</th>
                <th>INVERSIÓN TOTAL</th>
                <th>ESTADO</th>
                <th className="text-center">GESTIÓN</th>
              </tr>
            </thead>
            <tbody className="text-dark">
              {pedidos.map(ped => (
                <tr key={ped.id_pedido}>
                  <td className="ps-4 fw-bold">#{ped.id_pedido}</td>
                  <td>{new Date(ped.fecha_compra).toLocaleDateString()}</td>
                  <td className="text-muted">{ped.rfc}</td>
                  <td className="fw-bold text-primary">${parseFloat(ped.total_compra).toLocaleString()}</td>
                  <td>
                    <span className={`badge rounded-pill px-3 py-2 bg-${ped.estatus === '1' ? 'warning' : 'success'}`}>
                      {ped.estatus === '1' ? 'Pendiente' : 'Recibido en Almacén'}
                    </span>
                  </td>
                  <td className="text-center">
                    <button onClick={() => verDetalles(ped.id_pedido)} className="btn btn-sm btn-light border shadow-sm">
                      <FiEye className="me-1" /> Ver Detalle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: NUEVA ORDEN */}
      {mostrarFormulario && (
        <>
          <div className="modal-backdrop fade show" style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)', zIndex: 1040 }}></div>
          <div className="modal d-block" tabIndex="-1" style={{ zIndex: 1050 }}>
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content bg-white border-0 shadow-lg" style={{ borderRadius: '15px' }}>
                <div className="modal-header bg-primary text-white border-0 py-3">
                  <h5 className="modal-title fw-bold d-flex align-items-center">
                    <FiShoppingCart className="me-2"/> Generar Orden de Abastecimiento
                  </h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setMostrarFormulario(false)}></button>
                </div>
                <div className="modal-body p-4 bg-white text-dark">
                  <div className="row g-3 mb-4">
                    <div className="col-md-6">
                      <label className="form-label fw-bold text-secondary small">SELECCIONAR PROVEEDOR</label>
                      <select className="form-select border-2" required value={nuevaOrden.rfc} onChange={(e) => setNuevaOrden({...nuevaOrden, rfc: e.target.value})}>
                        <option value="">Elegir empresa proveedora...</option>
                        {proveedoresBase.map(prov => (
                          <option key={prov.rfc} value={prov.rfc}>{prov.nombre_empresa} ({prov.rfc})</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold text-secondary small">REFERENCIA / MEMORÁNDUM</label>
                      <input type="text" className="form-control border-2" placeholder="Ej: Resurtido Alimento Mayo" onChange={(e) => setNuevaOrden({...nuevaOrden, descripcion: e.target.value})} />
                    </div>
                  </div>
                  <h6 className="fw-bold mb-3 d-flex align-items-center"><FiList className="me-2 text-primary"/> Partidas de la Orden</h6>
                  {nuevaOrden.items.map((item, index) => (
                    <div className="row g-2 mb-2 align-items-center" key={index}>
                      <div className="col-md-5">
                        <select className="form-select form-select-sm" value={item.id_producto} onChange={(e) => manejarCambioItem(index, 'id_producto', e.target.value)} required>
                          <option value="">Seleccionar Producto...</option>
                          {productosBase.map(p => <option key={p.id_producto} value={p.id_producto}>{p.nombre}</option>)}
                        </select>
                      </div>
                      <div className="col-md-2">
                        <input type="number" className="form-control form-control-sm text-center" min="1" required value={item.cantidad} onChange={(e) => manejarCambioItem(index, 'cantidad', e.target.value)} />
                      </div>
                      <div className="col-md-3">
                        <div className="input-group input-group-sm">
                          <span className="input-group-text">$</span>
                          <input type="number" className="form-control" step="0.01" required value={item.precio_unitario} onChange={(e) => manejarCambioItem(index, 'precio_unitario', e.target.value)} />
                        </div>
                      </div>
                      <div className="col-md-2 text-end">
                        <button type="button" onClick={() => quitarItem(index)} className="btn btn-sm btn-outline-danger border-0" disabled={nuevaOrden.items.length === 1}><FiTrash2 /></button>
                      </div>
                    </div>
                  ))}
                  <button type="button" onClick={() => setNuevaOrden({...nuevaOrden, items: [...nuevaOrden.items, {id_producto: '', cantidad: 1, precio_unitario: 0}]})} className="btn btn-sm btn-link text-decoration-none fw-bold p-0 mt-2">+ Agregar otra partida</button>
                </div>
                <div className="modal-footer border-0 p-4 pt-0">
                  <button type="button" className="btn btn-light fw-bold" onClick={() => setMostrarFormulario(false)}>Descartar</button>
                  <button type="button" className="btn btn-primary px-4 fw-bold shadow"><FiSend className="me-2"/> Enviar Orden</button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* MODAL DE DETALLES: Recuperado para ver productos reales de PostgreSQL */}
      {pedidoSeleccionado && (
        <>
          <div className="modal-backdrop fade show" style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(4px)', zIndex: 1040 }}></div>
          <div className="modal d-block" tabIndex="-1" style={{ zIndex: 1050 }}>
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content bg-white border-0 shadow-lg" style={{ borderRadius: '16px', position: 'relative' }}>
                <div className="modal-header bg-dark text-white border-0">
                  <h5 className="modal-title fw-bold"><FiList className="me-2"/> Detalle del Pedido #{pedidoSeleccionado.id_pedido}</h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setPedidoSeleccionado(null)}></button>
                </div>
                <div className="modal-body p-4 bg-light text-dark">
                  <div className="row mb-4">
                    <div className="col-md-6">
                      <p className="mb-1 text-muted small fw-bold">FECHA DE EMISIÓN</p>
                      <p className="fw-bold">{new Date(pedidoSeleccionado.fecha_compra).toLocaleDateString()}</p>
                    </div>
                    <div className="col-md-6 text-end">
                      <p className="mb-1 text-muted small fw-bold">PROVEEDOR (RFC)</p>
                      <p className="fw-bold">{pedidoSeleccionado.rfc}</p>
                    </div>
                  </div>
                  <table className="table table-sm table-bordered bg-white shadow-sm align-middle">
                    <thead className="table-secondary text-dark small">
                      <tr>
                        <th>ID PRODUCTO (13 DÍGITOS)</th>
                        <th className="text-center">CANTIDAD</th>
                        <th>COSTO UNITARIO</th>
                        <th>SUBTOTAL</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detalles.map((det, i) => (
                        <tr key={i}>
                          <td className="text-secondary fw-medium"><code>{det.id_producto}</code></td>
                          <td className="text-center fw-bold">{det.cantidad}</td>
                          <td>${parseFloat(det.precio_unitario).toFixed(2)}</td>
                          <td className="fw-bold text-primary">${parseFloat(det.precio_subtotal).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="table-light border-top border-2">
                        <td colSpan="3" className="text-end fw-bold py-2">MONTO TOTAL DE LA ORDEN:</td>
                        <td className="fw-bold text-success fs-6 py-2">${parseFloat(pedidoSeleccionado.total_compra).toFixed(2)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PedidosProveedorIntranet;