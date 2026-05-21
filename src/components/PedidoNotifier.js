import { useContext, useEffect, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import { useMessage } from "../context/MessageContext";

function PedidoNotifier() {
  const { user } = useContext(AuthContext);
  const { showMessage } = useMessage();

  const alertasMostradas = useRef(new Set());

  const estadosTexto = {
    1: "Pendiente",
    2: "Enviado",
    3: "Recibido",
    4: "Cancelado",
  };

  useEffect(() => {
    if (!user) return;

    const verificarPedidos = async () => {
      try {
        const res = await fetch(
          `http://localhost:8000/api/mis-pedidos/${user.id}/`,
        );
        if (!res.ok) return;

        const pedidosActuales = await res.json();

        pedidosActuales.forEach((pedidoActual) => {
          const idReal = pedidoActual.id;

          const estatusLimpio = String(pedidoActual.estatus).trim();

          const claveLocal = `vp_pedido_memoria_${idReal}`;
          const estadoGuardado = localStorage.getItem(claveLocal);

          const huellaAlerta = `${idReal}-${estatusLimpio}`;

          if (
            estadoGuardado &&
            estadoGuardado !== estatusLimpio &&
            !alertasMostradas.current.has(huellaAlerta)
          ) {
            showMessage({
              title: "¡Actualización de pedido!",
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
