import React, { useState, useEffect, useContext } from 'react';
import { FiBell } from 'react-icons/fi';
import { AuthContext } from '../context/AuthContext';

const NotificadorAdmin = () => {
  const { user } = useContext(AuthContext);
  const [notificaciones, setNotificaciones] = useState(0);

  useEffect(() => {
    // Función para consultar a Django/Postgres
    const revisarMovimientos = async () => {
      try {
        // Consultamos pedidos que ya no estén en estatus '1' (Solicitado) 
        // y que hayan tenido movimientos recientes
        const res = await fetch(`https://proyecto-e-commerce-ventasperrunas.onrender.com//api/pedidos/movimientos-recientes/`);
        if (res.ok) {
          const data = await res.json();
          setNotificaciones(data.nuevos_movimientos);
        }
      } catch (error) {
        console.error("Error al consultar movimientos en Postgres:", error);
      }
    };

    // Consultar cada 30 segundos (Polling) para mantener datos reales
    const intervalo = setInterval(revisarMovimientos, 30000);
    revisarMovimientos(); // Consulta inicial

    return () => clearInterval(intervalo);
  }, []);

  return (
    <div className="position-relative me-3">
      <FiBell size={22} className="text-white" style={{ cursor: 'pointer' }} />
      {notificaciones > 0 && (
        <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.7rem' }}>
          {notificaciones}
        </span>
      )}
    </div>
  );
};

export default NotificadorAdmin;