import React, { useState, useEffect, useRef } from 'react';
import { db } from '../firebaseConfig';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { FiBell, FiPackage, FiMessageSquare } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const NotificadorProveedor = () => {
  const [pedidosNuevos, setPedidosNuevos] = useState([]);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const menuRef = useRef(null);

  // ID simulado del proveedor logueado. 
  // En producción, esto viene de tu AuthContext (ej. user.rfc)
  const RFC_PROVEEDOR_LOGUEADO = 'PUR980101XYZ'; 

  useEffect(() => {
    // Escuchamos a Firebase en tiempo real
    const q = query(
      collection(db, 'pedidos_b2b'),
      where('id_proveedor', '==', RFC_PROVEEDOR_LOGUEADO),
      where('estado', '==', 'SOLICITADO')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const pedidos = [];
      snapshot.forEach((doc) => {
        // Formateamos la fecha de Firebase para que se lea bonito
        const data = doc.data();
        const fecha = data.fecha ? data.fecha.toDate().toLocaleTimeString() : 'Hace un momento';
        pedidos.push({ id: doc.id, ...data, horaString: fecha });
      });
      setPedidosNuevos(pedidos); 
    });

    return () => unsubscribe();
  }, []);

  // Cerrar el menú al hacer clic afuera
  useEffect(() => {
    const handleClickFuera = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuAbierto(false);
      }
    };
    document.addEventListener("mousedown", handleClickFuera);
    return () => document.removeEventListener("mousedown", handleClickFuera);
  }, []);

  return (
    <div className="position-relative" ref={menuRef}>
      {/* BOTÓN DE LA CAMPANITA */}
      <button 
        onClick={() => setMenuAbierto(!menuAbierto)}
        className="btn btn-link text-white position-relative p-0 hover-scale me-3 border-0 shadow-none"
      >
        <FiBell size={24} />
        {pedidosNuevos.length > 0 && (
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger shadow-sm" style={{ fontSize: '0.7rem' }}>
            {pedidosNuevos.length}
          </span>
        )}
      </button>

      {/* MENÚ DESPLEGABLE DE NOTIFICACIONES */}
      {menuAbierto && (
        <div className="dropdown-menu show position-absolute end-0 mt-3 shadow-lg border-0 fade-in-up p-0" style={{ minWidth: '320px', borderRadius: '12px', zIndex: 1050 }}>
          
          <div className="px-4 py-3 border-bottom bg-light rounded-top" style={{ borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}>
            <h6 className="mb-0 fw-bold text-dark">Notificaciones de Resurtido</h6>
          </div>
          
          <div className="overflow-auto" style={{ maxHeight: '350px' }}>
            {pedidosNuevos.length === 0 ? (
              <div className="text-center py-4 text-muted small">
                <FiPackage size={30} className="mb-2 opacity-50" /><br/>
                No tienes nuevos pedidos pendientes.
              </div>
            ) : (
              <ul className="list-group list-group-flush">
                {pedidosNuevos.map((pedido) => (
                  <li key={pedido.id} className="list-group-item list-group-item-action p-3 border-bottom hover-bg-light cursor-pointer">
                    <div className="d-flex w-100 justify-content-between mb-1">
                      <strong className="text-primary d-flex align-items-center gap-1"><FiPackage /> Nuevo Pedido ({pedido.articulos_totales} arts.)</strong>
                      <small className="text-muted">{pedido.horaString}</small>
                    </div>
                    <p className="mb-1 small text-dark">Ventas Perrunas ha solicitado un nuevo resurtido.</p>
                    
                    {/* Caja del mensaje del administrador */}
                    {pedido.mensaje_admin && (
                      <div className="bg-light p-2 mt-2 rounded border border-info small text-secondary d-flex gap-2">
                        <FiMessageSquare className="text-info mt-1" />
                        <span className="fst-italic">"{pedido.mensaje_admin}"</span>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          <div className="p-2 border-top bg-light text-center" style={{ borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px' }}>
  <Link 
    to="/extranet" 
    onClick={() => setMenuAbierto(false)} 
    className="text-decoration-none small fw-bold text-primary"
  >
    Ir al Panel de Gestión
  </Link>
</div>
        </div>
      )}
    </div>
  );
};

export default NotificadorProveedor;