import { useContext, useEffect, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import { useMessage } from "../context/MessageContext";

function PedidoNotifier() {
  const { user } = useContext(AuthContext);
  const { showMessage } = useMessage();
  
  // 🔥 ESCUDO DEFINITIVO: Memoria temporal para bloquear duplicados exactos
  const alertasMostradas = useRef(new Set());

  // Diccionario dinámico de estados
  const estadosTexto = {
    "0": "Cancelado ❌",
    "1": "Pendiente 🕒",
    "2": "Enviado 🚚",
    "3": "Recibido ✅",
  };

  useEffect(() => {
    if (!user) return;

    const verificarPedidos = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/mis-pedidos/${user.id}/`);
        if (!res.ok) return;

        const pedidosActuales = await res.json();

        pedidosActuales.forEach((pedidoActual) => {
          const idReal = pedidoActual.id;
          
          // 🔥 Aplicamos .trim() por si la base de datos manda un espacio invisible como "3 "
          const estatusLimpio = String(pedidoActual.estatus).trim(); 
          
          // Usamos una llave única para tu sistema
          const claveLocal = `vp_pedido_memoria_${idReal}`;
          const estadoGuardado = localStorage.getItem(claveLocal);
          
          // Creamos la "huella" única de la alerta (ejemplo: "15-3")
          const huellaAlerta = `${idReal}-${estatusLimpio}`;

          // REGLA: Tiene que haber un estado viejo, tiene que ser diferente al nuevo, 
          // Y la alerta no debe estar registrada en el escudo anti-spam.
          if (
            estadoGuardado && 
            estadoGuardado !== estatusLimpio && 
            !alertasMostradas.current.has(huellaAlerta)
          ) {
            showMessage({
              title: "¡Actualización de pedido! 📦",
              message: `Tu orden #${idReal} ahora está en estado: ${estadosTexto[estatusLimpio] || "Actualizado"}`,
              type: "info",
            });
            
            // Registramos la alerta en el escudo para que no vuelva a sonar hoy
            alertasMostradas.current.add(huellaAlerta);
          }

          // Actualizamos la base de datos local
          localStorage.setItem(claveLocal, estatusLimpio);
        });

      } catch (error) {
        console.error("Error verificando pedidos:", error);
      }
    };

    // Ejecutar al entrar
    verificarPedidos();

    // Revisar automáticamente cada 10 segundos
    const interval = setInterval(verificarPedidos, 10000); 

    return () => clearInterval(interval);
    
  // Quitamos showMessage de las dependencias para evitar reinicios accidentales
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return null;
}

export default PedidoNotifier;