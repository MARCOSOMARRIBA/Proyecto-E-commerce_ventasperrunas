import React, { useContext, useState } from "react";
import {
  FaCreditCard,
  FaMoneyBillWave,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaLock,
} from "react-icons/fa";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import { useMessage } from "../context/MessageContext";

const SimuladorCobro = () => {
  const { cart, getCartTotal, clearCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const { showMessage } = useMessage();

  const [metodoPago, setMetodoPago] = useState("1");
  const [nombreTitular, setNombreTitular] = useState("");
  const [numeroTarjeta, setNumeroTarjeta] = useState("");
  const [fechaVencimiento, setFechaVencimiento] = useState("");
  const [cvv, setCvv] = useState("");
  const [direccionEnvio, setDireccionEnvio] = useState("");
  const [procesando, setProcesando] = useState(false);
  const [resultado, setResultado] = useState(null);

  const subtotal = getCartTotal();
  const iva = subtotal * 0.16;
  const envio = subtotal >= 1000 ? 0 : 99;
  const total = subtotal + iva + envio;

  const generarReferencia = () => {
    const fecha = new Date();
    const random = Math.floor(Math.random() * 900000) + 100000;

    return `PAGO-${fecha.getFullYear()}${String(fecha.getMonth() + 1).padStart(
      2,
      "0",
    )}${String(fecha.getDate()).padStart(2, "0")}-${random}`;
  };

  const validarFormulario = () => {
    if (!user) {
      showMessage({
        title: "Inicia sesión",
        message: "Debes iniciar sesión para realizar el cobro.",
        type: "warning",
      });
      return false;
    }

    if (cart.length === 0) {
      showMessage({
        title: "Carrito vacío",
        message:
          "Tu carrito está vacío. Agrega productos antes de realizar el cobro.",
        type: "info",
      });
      return false;
    }

    if (direccionEnvio.trim() === "") {
      showMessage({
        title: "Dirección requerida",
        message: "Debes escribir una dirección de envío.",
        type: "warning",
      });
      return false;
    }

    if (metodoPago === "1" || metodoPago === "2") {
      if (
        nombreTitular.trim() === "" ||
        numeroTarjeta.trim() === "" ||
        fechaVencimiento.trim() === "" ||
        cvv.trim() === ""
      ) {
        showMessage({
          title: "Datos incompletos",
          message: "Debes llenar todos los datos de la tarjeta.",
          type: "warning",
        });
        return false;
      }

      if (numeroTarjeta.replace(/\s/g, "").length < 16) {
        showMessage({
          title: "Tarjeta inválida",
          message: "El número de tarjeta debe tener 16 dígitos.",
          type: "warning",
        });
        return false;
      }

      if (cvv.length < 3) {
        showMessage({
          title: "CVV inválido",
          message: "El CVV debe tener al menos 3 dígitos.",
          type: "warning",
        });
        return false;
      }
    }

    return true;
  };

  const simularCobro = (e) => {
    e.preventDefault();

    if (!validarFormulario()) return;

    setProcesando(true);
    setResultado(null);

    setTimeout(() => {
      let estatusCobro = "1";
      let mensaje = "Pago aceptado correctamente.";
      let tipo = "aceptado";

      if (metodoPago === "3") {
        estatusCobro = "3";
        mensaje = "Pago pendiente. Se generó una referencia para pago en OXXO.";
        tipo = "pendiente";
      } else if (numeroTarjeta.endsWith("0000")) {
        estatusCobro = "2";
        mensaje = "Pago rechazado por el banco emisor.";
        tipo = "rechazado";
      }

      const referencia = generarReferencia();

      setResultado({
        tipo,
        estatusCobro,
        referencia,
        metodoPago,
        monto: total,
        mensaje,
      });

      setProcesando(false);

      if (tipo === "aceptado") {
        clearCart();
      }

      showMessage({
        title:
          tipo === "aceptado"
            ? "Pago aceptado"
            : tipo === "rechazado"
              ? "Pago rechazado"
              : "Pago pendiente",
        message:
          tipo === "aceptado"
            ? `Tu pago fue aceptado correctamente. Referencia: ${referencia}`
            : tipo === "rechazado"
              ? "El pago fue rechazado por el banco emisor. Intenta con otra tarjeta."
              : `Se generó una referencia para pago en OXXO: ${referencia}`,
        type:
          tipo === "aceptado"
            ? "success"
            : tipo === "rechazado"
              ? "error"
              : "info",
      });
    }, 1800);
  };

  const obtenerNombreMetodo = () => {
    if (metodoPago === "1") return "Tarjeta de débito";
    if (metodoPago === "2") return "Tarjeta de crédito";
    return "Pago en OXXO / transferencia";
  };

  return (
    <section className="simulador-cobro-card">
      <div className="simulador-cobro-header">
        <div>
          <h3>Simulador de cobro</h3>
          <p>Realiza una prueba de pago para tu carrito.</p>
        </div>

        <div className="simulador-cobro-secure">
          <FaLock /> Pago simulado
        </div>
      </div>

      <form onSubmit={simularCobro}>
        <div className="simulador-resumen">
          <h4>Resumen de compra</h4>

          <div className="simulador-row">
            <span>Subtotal</span>
            <strong>${subtotal.toFixed(2)}</strong>
          </div>

          <div className="simulador-row">
            <span>IVA 16%</span>
            <strong>${iva.toFixed(2)}</strong>
          </div>

          <div className="simulador-row">
            <span>Envío</span>
            <strong>{envio === 0 ? "Gratis" : `$${envio.toFixed(2)}`}</strong>
          </div>

          <div className="simulador-row simulador-total">
            <span>Total a pagar</span>
            <strong>${total.toFixed(2)}</strong>
          </div>
        </div>

        <div className="simulador-form-group">
          <label>Dirección de envío</label>
          <textarea
            value={direccionEnvio}
            onChange={(e) => setDireccionEnvio(e.target.value)}
            placeholder="Calle, número, colonia, código postal y referencias"
            rows="3"
          />
        </div>

        <div className="simulador-form-group">
          <label>Método de pago</label>

          <div className="simulador-metodos">
            <button
              type="button"
              className={metodoPago === "1" ? "metodo-activo" : ""}
              onClick={() => setMetodoPago("1")}
            >
              <FaCreditCard /> Débito
            </button>

            <button
              type="button"
              className={metodoPago === "2" ? "metodo-activo" : ""}
              onClick={() => setMetodoPago("2")}
            >
              <FaCreditCard /> Crédito
            </button>

            <button
              type="button"
              className={metodoPago === "3" ? "metodo-activo" : ""}
              onClick={() => setMetodoPago("3")}
            >
              <FaMoneyBillWave /> OXXO
            </button>
          </div>
        </div>

        {(metodoPago === "1" || metodoPago === "2") && (
          <div className="simulador-tarjeta">
            <div className="simulador-form-group">
              <label>Nombre del titular</label>
              <input
                type="text"
                value={nombreTitular}
                onChange={(e) => setNombreTitular(e.target.value)}
                placeholder="Ej. Pedro Domínguez"
              />
            </div>

            <div className="simulador-form-group">
              <label>Número de tarjeta</label>
              <input
                type="text"
                maxLength="19"
                value={numeroTarjeta}
                onChange={(e) => setNumeroTarjeta(e.target.value)}
                placeholder="1234 5678 9012 3456"
              />
              <small>
                Para simular rechazo, termina la tarjeta en{" "}
                <strong>0000</strong>.
              </small>
            </div>

            <div className="simulador-card-row">
              <div className="simulador-form-group">
                <label>Vencimiento</label>
                <input
                  type="text"
                  maxLength="5"
                  value={fechaVencimiento}
                  onChange={(e) => setFechaVencimiento(e.target.value)}
                  placeholder="MM/AA"
                />
              </div>

              <div className="simulador-form-group">
                <label>CVV</label>
                <input
                  type="password"
                  maxLength="4"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                  placeholder="123"
                />
              </div>
            </div>
          </div>
        )}

        {metodoPago === "3" && (
          <div className="simulador-oxxo-info">
            <FaClock />
            <div>
              <strong>Pago pendiente</strong>
              <p>
                Se generará una referencia ficticia para simular el pago en
                OXXO.
              </p>
            </div>
          </div>
        )}

        <button
          type="submit"
          className="simulador-btn-pagar"
          disabled={procesando || cart.length === 0}
        >
          {procesando
            ? "Procesando cobro..."
            : `Simular pago con ${obtenerNombreMetodo()}`}
        </button>
      </form>

      {resultado && (
        <div className={`simulador-resultado ${resultado.tipo}`}>
          {resultado.tipo === "aceptado" && <FaCheckCircle />}
          {resultado.tipo === "rechazado" && <FaTimesCircle />}
          {resultado.tipo === "pendiente" && <FaClock />}

          <div>
            <h4>{resultado.mensaje}</h4>
            <p>
              <strong>Referencia:</strong> {resultado.referencia}
            </p>
            <p>
              <strong>Monto:</strong> ${resultado.monto.toFixed(2)}
            </p>
            <p>
              <strong>Estatus cobro:</strong> {resultado.estatusCobro}
            </p>
          </div>
        </div>
      )}
    </section>
  );
};

export default SimuladorCobro;
