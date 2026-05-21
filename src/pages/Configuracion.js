import React, { useContext, useState } from "react";
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
  const [passwordData, setPasswordData] = useState({
    actual: "",
    nueva: "",
    confirmar: "",
  });
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

  const cambiarPassword = async () => {
    if (
      !passwordData.actual ||
      !passwordData.nueva ||
      !passwordData.confirmar
    ) {
      showMessage({
        title: "Campos incompletos",
        message: "Completa todos los campos.",
        type: "error",
      });

      return;
    }

    if (passwordData.nueva !== passwordData.confirmar) {
      showMessage({
        title: "Contraseñas diferentes",
        message: "La nueva contraseña no coincide.",
        type: "error",
      });

      return;
    }

    try {
      console.log("USER COMPLETO:", user);

      const response = await fetch(
        "http://localhost:8000/api/usuarios/cambiar-password/",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            id_usuario: user.id,
            password_actual: passwordData.actual,
            password_nueva: passwordData.nueva,
          }),
        },
      );

      if (!response.ok) {
        throw new Error();
      }

      showMessage({
        title: "Contraseña actualizada",
        message: "Tu contraseña fue cambiada correctamente.",
        type: "success",
      });

      setPasswordData({
        actual: "",
        nueva: "",
        confirmar: "",
      });
    } catch (error) {
      showMessage({
        title: "Error",
        message: "No se pudo actualizar la contraseña.",
        type: "error",
      });
    }
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
              <FiSettings />
            </div>

            <div>
              <h2>Seguridad de la cuenta</h2>

              <p>Cambia tu contraseña y protege el acceso a tu cuenta.</p>
            </div>
          </div>

          <div className="config-password-form">
            <input
              type="password"
              placeholder="Contraseña actual"
              value={passwordData.actual}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  actual: e.target.value,
                })
              }
            />

            <input
              type="password"
              placeholder="Nueva contraseña"
              value={passwordData.nueva}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  nueva: e.target.value,
                })
              }
            />

            <input
              type="password"
              placeholder="Confirmar nueva contraseña"
              value={passwordData.confirmar}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  confirmar: e.target.value,
                })
              }
            />

            <small>
              Si recuperaste tu cuenta mediante una contraseña temporal, te
              recomendamos cambiarla inmediatamente.
            </small>

            <button
              type="button"
              className="config-save-btn"
              onClick={cambiarPassword}
            >
              <FiSave />
              Actualizar contraseña
            </button>
          </div>
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
