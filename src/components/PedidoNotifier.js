import { useContext, useEffect, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import { useMessage } from "../context/MessageContext";

function PedidoNotifier() {
  const { user } = useContext(AuthContext);
  const { showMessage } = useMessage();

  const pedidosPrevios = useRef([]);

  const estadosTexto = {
    1: "Pendiente",
    2: "Preparando",
    3: "En camino",
    4: "Entregado",
    5: "Cancelado",
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
          const pedidoPrevio = pedidosPrevios.current.find(
            (p) => p.id_pedido === pedidoActual.id_pedido,
          );

          const estadoGuardado = localStorage.getItem(
            `pedido_${pedidoActual.id_pedido}`,
          );

          // 🔥 Detectar cambio incluso al volver a entrar
          if (
            estadoGuardado &&
            estadoGuardado !== String(pedidoActual.estatus)
          ) {
            showMessage({
              title: "Actualización de pedido 📦",
              message: `Tu pedido #${pedidoActual.id_pedido} ahora está en estado "${estadosTexto[pedidoActual.estatus] || "Actualizado"}"`,
              type: "info",
            });
          }

          // 🔥 Detectar cambios en tiempo real
          if (pedidoPrevio && pedidoPrevio.estatus !== pedidoActual.estatus) {
            showMessage({
              title: "Actualización de pedido 📦",
              message: `Tu pedido #${pedidoActual.id_pedido} ahora está en estado "${estadosTexto[pedidoActual.estatus] || "Actualizado"}"`,
              type: "info",
            });
          }

          // 🔥 Guardar estado actual
          localStorage.setItem(
            `pedido_${pedidoActual.id_pedido}`,
            pedidoActual.estatus,
          );
        });

        pedidosPrevios.current = pedidosActuales;
      } catch (error) {
        console.error("Error verificando pedidos:", error);
      }
    };

    // 🔥 Ejecutar al entrar
    verificarPedidos();

    // 🔥 Verificar automáticamente cada 15 segundos
    const interval = setInterval(verificarPedidos, 15000);

    return () => clearInterval(interval);
  }, [user, showMessage]);

  return null;
}

export default PedidoNotifier;
