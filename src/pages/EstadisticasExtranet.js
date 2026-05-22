import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const EstadisticasExtranet = () => {
  const { user } = useContext(AuthContext);
  const [data, setData] = useState([]);

  useEffect(() => {
    if (user && user.rfc) {
      // Usamos el RFC del usuario logueado
      fetch(`https://proyecto-e-commerce-ventasperrunas.onrender.com//api/pedidos/?rol=4&rfc=${user.rfc}`)
        .then(res => res.json())
        .then(json => {
          console.log("🔥 JSON RECIBIDO:", json);
          setData(json);
        })
        .catch(err => console.error("Error:", err));
    }
  }, [user]);

  return (
    <div className="p-4">
      <h3>Pedidos Recibidos (Debug)</h3>
      <pre>{JSON.stringify(data, null, 2)}</pre>
      {data.length === 0 && <p>No hay pedidos vinculados a este RFC: {user?.rfc}</p>}
    </div>
  );
};
export default EstadisticasExtranet;