import React, { useState, useEffect, useContext } from 'react';
// 🔥 Importamos el contexto
import { AuthContext } from '../context/AuthContext'; 
import { db } from '../firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { FiPlus, FiEye, FiPackage, FiClock, FiCheckCircle, FiX, FiShoppingBag, FiSave } from 'react-icons/fi';

const PedidosProveedorIntranet = () => {
  const { user } = useContext(AuthContext);

  const [pedidosBD, setPedidosBD] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  
  const [modalDetalle, setModalDetalle] = useState(false);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [detallesPedido, setDetallesPedido] = useState([]);
  const [cargandoDetalles, setCargandoDetalles] = useState(false);

  const [proveedores, setProveedores] = useState([]);
  const [productosDisponibles, setProductosDisponibles] = useState([]);
  const [nuevaOrden, setNuevaOrden] = useState({
    rfc_proveedor: '',
    descripcion: '',
    productosSeleccionados: []
  });
  const [itemActual, setItemActual] = useState({ id_producto: '', cantidad: 1, precio: 0 });

  useEffect(() => {
    // 🔥 Aseguramos que el usuario esté cargado antes de hacer fetch
    if (user) {
      cargarHistorialPedidos();
      cargarCatalogos();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const cargarCatalogos = async () => {
    try {
      const [resProv, resProd] = await Promise.all([
        fetch('https://proyecto-e-commerce-ventasperrunas.onrender.com/api/proveedores/'),
        // 🚀 INYECTAMOS ROL PARA QUE EL ADMIN VEA TODOS LOS PRODUCTOS
        fetch(`https://proyecto-e-commerce-ventasperrunas.onrender.com/api//productos/?rol=${user.rol}&rfc=${user.rfc || ''}`)
      ]);
      if (resProv.ok) setProveedores(await resProv.json());
      if (resProd.ok) setProductosDisponibles(await resProd.json());
    } catch (error) { console.error("Error catalogos:", error); }
  };

  const cargarHistorialPedidos = async () => {
    try {
      // 🚀 INYECTAMOS ROL PARA QUE EL ADMIN VEA TODOS LOS PEDIDOS
      const res = await fetch(`https://proyecto-e-commerce-ventasperrunas.onrender.com/api/pedidos/?rol=${user.rol}&rfc=${user.rfc || ''}`);
      if (res.ok) setPedidosBD(await res.json());
    } catch (error) { console.error("Error historial:", error); }
  };

  const agregarProductoALista = () => {
    if (!itemActual.id_producto || itemActual.cantidad <= 0) {
      alert("Selecciona un producto y una cantidad válida.");
      return;
    }
    
    const prodInfo = productosDisponibles.find(p => p.id_producto === parseInt(itemActual.id_producto));
    
    setNuevaOrden(ordenPrevia => {
      // 1. Buscamos si el producto ya está en la tablita
      const indexExistente = ordenPrevia.productosSeleccionados.findIndex(p => p.id_producto === itemActual.id_producto);

      if (indexExistente >= 0) {
        // 2. Si ya existe, NO lo duplicamos. Solo le sumamos la nueva cantidad.
        const listaActualizada = [...ordenPrevia.productosSeleccionados];
        listaActualizada[indexExistente].cantidad += itemActual.cantidad;
        
        return {
          ...ordenPrevia,
          productosSeleccionados: listaActualizada
        };
      } else {
        // 3. Si es un producto nuevo, lo agregamos normalmente
        return {
          ...ordenPrevia,
          productosSeleccionados: [
            ...ordenPrevia.productosSeleccionados, 
            { 
              id_producto: itemActual.id_producto,
              nombre: prodInfo.nombre,
              cantidad: itemActual.cantidad,
              precio: itemActual.precio 
            }
          ]
        };
      }
    });

    // Limpiamos los inputs para el siguiente producto
    setItemActual({ id_producto: '', cantidad: 1, precio: 0 });
  };

  const enviarOrdenBD = async (e) => {
    e.preventDefault();
    
    const total = nuevaOrden.productosSeleccionados.reduce((acc, p) => acc + (p.cantidad * p.precio), 0);
    const cantidadArticulos = nuevaOrden.productosSeleccionados.reduce((acc, p) => acc + p.cantidad, 0);
    const fechaHoy = new Date().toISOString().split('T')[0];

    const detallesFormateados = nuevaOrden.productosSeleccionados.map(p => ({
      id_producto: p.id_producto,
      cantidad: p.cantidad,
      precio_unitario: p.precio,
      precio_subtotal: (p.cantidad * p.precio),
      estatus: '1' 
    }));

    const payload = {
      rfc: nuevaOrden.rfc_proveedor,
      descripcion: nuevaOrden.descripcion,
      total_compra: total,
      estatus: '1', 
      fecha_compra: fechaHoy,
      id_usuario: user?.id_usuario || user?.id,
      detalles: detallesFormateados 
    };

    try {
      const res = await fetch('https://proyecto-e-commerce-ventasperrunas.onrender.com/api/pedidos/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        // Auditoría en Firebase
        await addDoc(collection(db, "auditoria_pedidos"), {
          ...payload,
          fecha_auditoria: serverTimestamp(),
          tipo_movimiento: "CREACION_ADMIN" 
        });

        // Notificación B2B
        await addDoc(collection(db, "pedidos_b2b"), {
          id_proveedor: nuevaOrden.rfc_proveedor,
          estado: '1',
          articulos_totales: cantidadArticulos,
          mensaje_admin: nuevaOrden.descripcion || "Nuevo resurtido solicitado",
          fecha: serverTimestamp()
        });
        
        // 🚀 MAGIA SILENCIOSA: Solo cerramos el modal, limpiamos y recargamos la tabla
        setMostrarFormulario(false);
        setNuevaOrden({ rfc_proveedor: '', descripcion: '', productosSeleccionados: [] });
        cargarHistorialPedidos();
        
      } else {
        const errorData = await res.json();
        console.error("Error del servidor:", errorData);
        alert("Ocurrió un error al guardar. Revisa la consola.");
      }
    } catch (error) { 
        console.error(error);
        alert("Error de conexión con el servidor."); 
    }
  };

  const abrirDetalles = async (pedido) => {
    setPedidoSeleccionado(pedido);
    setModalDetalle(true);
    setCargandoDetalles(true);
    try {
      const res = await fetch(`https://proyecto-e-commerce-ventasperrunas.onrender.com/api/pedidos/${pedido.id_pedido}/detalles/`);
      setDetallesPedido(res.ok ? await res.json() : []);
    } catch (error) { console.error(error); } finally { setCargandoDetalles(false); }
  };

  const getBadgeEstatus = (estatus) => {
    switch(String(estatus)) {
      case '1': return <span className="badge bg-warning text-dark rounded-pill"><FiClock/> Solicitado</span>;
      case '2': return <span className="badge bg-info text-dark rounded-pill"><FiPackage/> En Proceso</span>;
      case '3': return <span className="badge bg-danger rounded-pill"><FiX/> Cancelado</span>;
      case '4': return <span className="badge bg-success rounded-pill"><FiCheckCircle/> Entregado</span>;
      default: return <span className="badge bg-secondary rounded-pill">Desconocido</span>;
    }
  };

  // 🔥 LÓGICA NUEVA: Filtramos los productos según el proveedor seleccionado en el modal
  const productosDelProveedor = productosDisponibles.filter(
    (producto) => producto.rfc === nuevaOrden.rfc_proveedor || producto.rfc_id === nuevaOrden.rfc_proveedor
  );

  return (
    <div className="p-4 animate__animated animate__fadeIn">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold m-0 d-flex align-items-center gap-2 text-dark">
            <FiPackage className="text-primary" /> Historial de Resurtido B2B
          </h2>
          <p className="text-muted small m-0">Gestiona las órdenes de resurtido a proveedores.</p>
        </div>
        <button onClick={() => setMostrarFormulario(true)} className="btn btn-primary fw-bold shadow-sm px-4">
          <FiPlus className="me-2" /> Nueva Orden
        </button>
      </div>

      {/* MODAL GENERAR ORDEN */}
      {mostrarFormulario && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 p-2">
              <div className="modal-header border-0">
                <h5 className="fw-bold"><FiPlus className="text-primary"/> Generar Nueva Orden de Compra</h5>
                <button className="btn-close" onClick={() => setMostrarFormulario(false)}></button>
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="small fw-bold">Proveedor</label>
                    <select 
                      className="form-select bg-light" 
                      value={nuevaOrden.rfc_proveedor} 
                      onChange={(e) => {
                        // Limpiamos los productos al cambiar de proveedor
                        setNuevaOrden({...nuevaOrden, rfc_proveedor: e.target.value});
                        setItemActual({ id_producto: '', cantidad: 1, precio: 0 });
                      }}
                    >
                      <option value="">Selecciona Proveedor...</option>
                      {/* 🔥 CAMBIO APLICADO: Mostramos nombre_empresa */}
                      {proveedores.map(p => (
                        <option key={p.rfc} value={p.rfc}>
                          {p.nombre_empresa || p.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="small fw-bold">Notas/Descripción</label>
                    <input type="text" className="form-control bg-light" placeholder="Ej: Resurtido mensual" value={nuevaOrden.descripcion} onChange={(e) => setNuevaOrden({...nuevaOrden, descripcion: e.target.value})}/>
                  </div>
                  
                  <hr />
                  
                  <div className="col-md-5">
                    <label className="small fw-bold">Producto</label>
                    <select 
                      className="form-select" 
                      value={itemActual.id_producto} 
                      disabled={!nuevaOrden.rfc_proveedor} // 🔥 Se bloquea si no hay proveedor
                      onChange={(e) => {
                        const id = e.target.value;
                        const productoEncontrado = productosDelProveedor.find(p => String(p.id_producto) === String(id));
                        setItemActual({
                          ...itemActual, 
                          id_producto: id, 
                          precio: productoEncontrado ? parseFloat(productoEncontrado.precio) || 0 : 0 
                        });
                      }}
                    >
                      {/* 🔥 CAMBIO APLICADO: Aviso dinámico y lista filtrada */}
                      <option value="">
                        {!nuevaOrden.rfc_proveedor ? "Primero selecciona un proveedor" : "Elegir producto..."}
                      </option>
                      {productosDelProveedor.map(p => <option key={p.id_producto} value={p.id_producto}>{p.nombre}</option>)}
                    </select>
                  </div>
                  <div className="col-md-3">
                    <label className="small fw-bold">Cant.</label>
                    <input type="number" className="form-control" value={itemActual.cantidad} onChange={(e) => setItemActual({...itemActual, cantidad: parseInt(e.target.value) || ''})}/>
                  </div>
                  <div className="col-md-3">
                    <label className="small fw-bold">Costo Unit.</label>
                    <input type="number" className="form-control" value={itemActual.precio} onChange={(e) => setItemActual({...itemActual, precio: parseFloat(e.target.value) || ''})}/>
                  </div>
                  <div className="col-md-1 d-flex align-items-end">
                    <button className="btn btn-dark w-100" onClick={agregarProductoALista} disabled={!itemActual.id_producto}><FiPlus/></button>
                  </div>

                  <div className="col-12">
                    <div className="bg-light p-3 rounded-3 mt-2">
                      <table className="table table-sm m-0">
                        <thead><tr><th>Producto</th><th>Cant.</th><th>Costo</th><th>Subtotal</th></tr></thead>
                        <tbody>
                          {nuevaOrden.productosSeleccionados.map((p, i) => (
                            <tr key={i}>
                              <td>{p.nombre}</td>
                              <td>{p.cantidad}</td>
                              <td>${p.precio}</td>
                              <td className="fw-bold text-primary">${p.cantidad * p.precio}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer border-0">
                <button className="btn btn-primary w-100 fw-bold py-2 rounded-3" onClick={enviarOrdenBD} disabled={nuevaOrden.productosSeleccionados.length === 0}><FiSave className="me-2"/> Guardar y Enviar Orden</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TABLA PRINCIPAL */}
      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-body p-0 overflow-auto">
          <table className="table table-hover align-middle mb-0 bg-white">
            <thead className="bg-dark text-white small">
              <tr>
                <th className="ps-4">FOLIO</th>
                <th>FECHA</th>
                <th>PROVEEDOR</th>
                <th>TOTAL</th>
                <th>ESTATUS</th>
                <th className="text-center">DETALLE</th>
              </tr>
            </thead>
            <tbody>
              {pedidosBD.map(pedido => (
                <tr key={pedido.id_pedido}>
                  <td className="ps-4 fw-bold">#{pedido.id_pedido}</td>
                  <td>{pedido.fecha_compra}</td>
                  <td>{pedido.rfc}</td>
                  <td className="fw-bold text-primary">${parseFloat(pedido.total_compra).toLocaleString()}</td>
                  <td>{getBadgeEstatus(pedido.estatus)}</td>
                  <td className="text-center">
                    <button onClick={() => abrirDetalles(pedido)} className="btn btn-sm btn-outline-primary border-0 rounded-circle"><FiEye size={20} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DETALLES */}
      {modalDetalle && pedidoSeleccionado && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(3px)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="modal-header border-0 bg-primary text-white p-4">
                <div>
                  <h4 className="modal-title fw-bold mb-1 d-flex align-items-center gap-2">
                    <FiShoppingBag /> Detalles de Orden #{pedidoSeleccionado.id_pedido}
                  </h4>
                  <small className="opacity-75">Proveedor: {pedidoSeleccionado.rfc} | Fecha: {pedidoSeleccionado.fecha_compra}</small>
                </div>
                <button type="button" className="btn text-white fs-4" onClick={() => setModalDetalle(false)}><FiX /></button>
              </div>
              <div className="modal-body p-4 bg-light">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h6 className="fw-bold text-muted m-0">MEMORÁNDUM: {pedidoSeleccionado.descripcion}</h6>
                  {getBadgeEstatus(pedidoSeleccionado.estatus)}
                </div>

                {cargandoDetalles ? (
                  <div className="text-center py-5 text-muted">Cargando partidas...</div>
                ) : detallesPedido.length === 0 ? (
                  <div className="text-center py-5 text-muted bg-white rounded-3 shadow-sm">No se encontraron productos para esta orden.</div>
                ) : (
                  <div className="row g-3">
                    {detallesPedido.map((detalle, idx) => (
                      <div className="col-md-6" key={idx}>
                        <div className="card border-0 shadow-sm h-100 rounded-3">
                          <div className="card-body d-flex justify-content-between align-items-center">
                            <div>
                              <small className="text-muted d-block mb-1">Producto ID: {detalle.id_producto}</small>
                              <h6 className="fw-bold m-0 text-dark">
                                {detalle.cantidad} <span className="text-muted fw-normal">unidades x</span> ${parseFloat(detalle.precio_unitario).toLocaleString()}
                              </h6>
                            </div>
                            <div className="text-end">
                              <small className="text-muted d-block mb-1">Subtotal</small>
                              <h5 className="fw-bold text-primary m-0">${parseFloat(detalle.precio_subtotal).toLocaleString()}</h5>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="modal-footer border-0 p-4 bg-white d-flex justify-content-between align-items-center">
                <button type="button" className="btn btn-light border fw-bold" onClick={() => setModalDetalle(false)}>Cerrar</button>
                <div className="text-end">
                  <span className="text-muted fw-bold me-3">TOTAL A PAGAR:</span>
                  <span className="fs-3 fw-bold text-primary">${parseFloat(pedidoSeleccionado.total_compra).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PedidosProveedorIntranet;