import React, { useContext } from "react";
import {
  FiSettings,
  FiBell,
  FiMoon,
  FiSun,
  FiMonitor,
  FiShoppingCart,
  FiRefreshCw,
  FiSave,
  FiTrash2,
} from "react-icons/fi";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";
import { useMessage } from "../context/MessageContext";
import { useAppearance } from "../context/AppearanceContext";

const Configuracion = () => {
  const { user } = useContext(AuthContext);
  const { clearCart } = useContext(CartContext);
  const { showMessage } = useMessage();
  const {
    configuracion,
    actualizarConfiguracion,
    guardarConfiguracion: guardarPreferencias,
    restablecerConfiguracion: restablecerPreferencias,
  } = useAppearance();

  const guardarConfiguracion = () => {
    guardarPreferencias();

    showMessage({
      title: "Configuración guardada",
      message: "Tus preferencias fueron guardadas correctamente.",
      type: "success",
    });
  };

  const restablecerConfiguracion = () => {
    restablecerPreferencias();

    showMessage({
      title: "Configuración restablecida",
      message: "Las preferencias volvieron a sus valores iniciales.",
      type: "info",
    });
  };

  const borrarCarritoGuardado = () => {
    clearCart();

    if (user) {
      localStorage.removeItem(`carrito_mascotas_${user.id}`);
    }

    showMessage({
      title: "Carrito eliminado",
      message: "Se borró el carrito guardado de este navegador.",
      type: "info",
    });
  };

  return (
    <main className="config-page">
      <section className="config-header">
        <div>
          <span className="config-tag">
            <FiSettings /> Preferencias
          </span>
          <h1>Configuración</h1>
          <p>
            Ajusta el comportamiento general de tu cuenta en este navegador.
            Para cambiar nombre, foto o datos personales, usa la sección de
            perfil.
          </p>
        </div>
      </section>

      <section className="config-grid">
        <article className="config-card">
          <div className="config-card-header">
            <div className="config-icon">
              <FiSun />
            </div>
            <div>
              <h2>Apariencia</h2>
              <p>Selecciona cómo quieres visualizar la tienda.</p>
            </div>
          </div>

          <div className="config-options">
            <button
              type="button"
              className={`config-option ${
                configuracion.tema === "claro" ? "active" : ""
              }`}
              onClick={() => actualizarConfiguracion("tema", "claro")}
            >
              <FiSun />
              Claro
            </button>

            <button
              type="button"
              className={`config-option ${
                configuracion.tema === "oscuro" ? "active" : ""
              }`}
              onClick={() => actualizarConfiguracion("tema", "oscuro")}
            >
              <FiMoon />
              Oscuro
            </button>

            <button
              type="button"
              className={`config-option ${
                configuracion.tema === "automatico" ? "active" : ""
              }`}
              onClick={() => actualizarConfiguracion("tema", "automatico")}
            >
              <FiMonitor />
              Automático
            </button>
          </div>

          <label className="config-switch-row">
            <div>
              <strong>Vista compacta</strong>
              <span>Reduce espacios en algunas tarjetas y listados.</span>
            </div>

            <input
              type="checkbox"
              checked={configuracion.vistaCompacta}
              onChange={(e) =>
                actualizarConfiguracion("vistaCompacta", e.target.checked)
              }
            />
          </label>
        </article>

        <article className="config-card">
          <div className="config-card-header">
            <div className="config-icon">
              <FiBell />
            </div>
            <div>
              <h2>Notificaciones</h2>
              <p>Controla qué avisos quieres mantener activos.</p>
            </div>
          </div>

          <label className="config-switch-row">
            <div>
              <strong>Promociones y novedades</strong>
              <span>
                Recibir avisos visuales sobre ofertas o banners activos.
              </span>
            </div>

            <input
              type="checkbox"
              checked={configuracion.notificacionesPromociones}
              onChange={(e) =>
                actualizarConfiguracion(
                  "notificacionesPromociones",
                  e.target.checked,
                )
              }
            />
          </label>

          <label className="config-switch-row">
            <div>
              <strong>Actualizaciones de pedidos</strong>
              <span>Mostrar avisos cuando cambie el estado de una orden.</span>
            </div>

            <input
              type="checkbox"
              checked={configuracion.notificacionesPedidos}
              onChange={(e) =>
                actualizarConfiguracion(
                  "notificacionesPedidos",
                  e.target.checked,
                )
              }
            />
          </label>
        </article>

        <article className="config-card">
          <div className="config-card-header">
            <div className="config-icon danger">
              <FiShoppingCart />
            </div>
            <div>
              <h2>Datos locales</h2>
              <p>Administra información guardada en este navegador.</p>
            </div>
          </div>

          <div className="config-danger-box">
            <h3>Borrar carrito guardado</h3>
            <p>
              Elimina los productos que se quedaron guardados en el carrito de
              esta cuenta.
            </p>

            <button
              type="button"
              className="config-danger-btn"
              onClick={borrarCarritoGuardado}
            >
              <FiTrash2 /> Borrar carrito
            </button>
          </div>
        </article>
      </section>

      <section className="config-actions">
        <button
          type="button"
          className="config-reset-btn"
          onClick={restablecerConfiguracion}
        >
          <FiRefreshCw /> Restablecer
        </button>

        <button
          type="button"
          className="config-save-btn"
          onClick={guardarConfiguracion}
        >
          <FiSave /> Guardar configuración
        </button>
      </section>
    </main>
  );
};

export default Configuracion;
