import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  FaCreditCard,
  FaMoneyBillWave,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaLock,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import { useMessage } from "../context/MessageContext";

function validarTarjeta(numero) {
  const limpio = numero.replace(/\s/g, "");
  if (!/^\d{16}$/.test(limpio)) return false;

  let suma = 0;
  let alternar = false;

  for (let i = limpio.length - 1; i >= 0; i--) {
    let n = parseInt(limpio[i]);

    if (alternar) {
      n *= 2;
      if (n > 9) n -= 9;
    }

    suma += n;
    alternar = !alternar;
  }
  return suma % 10 === 0;
}

function validarFecha(fecha) {
  if (!/^\d{2}\/\d{2}$/.test(fecha)) return false;

  const [mes, anio] = fecha.split("/").map(Number);
  const hoy = new Date();

  const mesActual = hoy.getMonth() + 1;
  const anioActual = hoy.getFullYear() % 100;

  if (mes < 1 || mes > 12) return false;
  if (anio < anioActual) return false;
  if (anio === anioActual && mes < mesActual) return false;

  return true;
}

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
  const [direccionesGuardadas, setDireccionesGuardadas] = useState([]);
  const [direccionSeleccionadaId, setDireccionSeleccionadaId] = useState("");

  const [dirManual, setDirManual] = useState({
    calle: "",
    numero: "",
    colonia: "",
    cp: "",
    ciudad: "",
    estado: "",
    referencias: "",
  });

  const [procesando, setProcesando] = useState(false);
  const [resultado, setResultado] = useState(null);

  const subtotal = getCartTotal();
  const iva = subtotal * 0.16;
  const envio = subtotal >= 1000 ? 0 : 99;
  const total = subtotal + iva + envio;

  const formatearDireccion = (direccion) => {
    if (!direccion) return "";
    return [
      direccion.calle,
      direccion.colonia,
      direccion.ciudad,
      direccion.estado,
      direccion.codigoPostal ? `C.P. ${direccion.codigoPostal}` : "",
      direccion.referencias ? `Referencias: ${direccion.referencias}` : "",
    ]
      .filter(Boolean)
      .join(", ");
  };

  useEffect(() => {
    if (!user) {
      setDireccionesGuardadas([]);
      setDireccionSeleccionadaId("");
      return;
    }

    const storageKey = `direcciones_mascotas_${user.id}`;
    const savedAddresses = localStorage.getItem(storageKey);

    if (!savedAddresses) {
      setDireccionesGuardadas([]);
      setDireccionSeleccionadaId("");
      return;
    }

    try {
      const parsedAddresses = JSON.parse(savedAddresses);
      const mainAddress =
        parsedAddresses.find((direccion) => direccion.principal) ||
        parsedAddresses[0];

      setDireccionesGuardadas(parsedAddresses);

      if (mainAddress) {
        setDireccionSeleccionadaId(mainAddress.id);
        setDireccionEnvio(formatearDireccion(mainAddress));
      }
    } catch (error) {
      localStorage.removeItem(storageKey);
      setDireccionesGuardadas([]);
      setDireccionSeleccionadaId("");
    }
  }, [user]);

  const direccionSeleccionada = useMemo(
    () =>
      direccionesGuardadas.find(
        (direccion) => direccion.id === direccionSeleccionadaId,
      ),
    [direccionesGuardadas, direccionSeleccionadaId],
  );

  const seleccionarDireccion = (direccion) => {
    setDireccionSeleccionadaId(direccion.id);
    setDireccionEnvio(formatearDireccion(direccion));
    // Limpiamos los inputs manuales si elige una guardada
    setDirManual({
      calle: "",
      numero: "",
      colonia: "",
      cp: "",
      ciudad: "",
      estado: "",
      referencias: "",
    });
  };

  const generarReferencia = () => {
    const fecha = new Date();
    const random = Math.floor(Math.random() * 900000) + 100000;
    return `PAGO-${fecha.getFullYear()}${String(fecha.getMonth() + 1).padStart(2, "0")}${String(fecha.getDate()).padStart(2, "0")}-${random}`;
  };

  // 🔥 NUEVO: Función para decidir si usamos la guardada o la manual
  const obtenerDireccionFinal = () => {
    if (direccionSeleccionadaId && direccionEnvio) {
      return direccionEnvio;
    }
    // Armamos la dirección de los inputs
    const { calle, numero, colonia, cp, ciudad, estado, referencias } =
      dirManual;
    const arr = [
      calle && numero ? `${calle} #${numero}` : calle,
      colonia,
      ciudad,
      estado,
      cp ? `C.P. ${cp}` : "",
      referencias ? `Ref: ${referencias}` : "",
    ].filter(Boolean);

    return arr.join(", ");
  };

  const generarOrden = (direccionFinalLista) => {
    return {
      id_usuario: user.id,
      direccion_envio: direccionFinalLista, // Enviamos la que calculamos
      total_orden: total,
      fecha_creacion: new Date(),
      metodo_pago: metodoPago,
      productos: cart.map((item) => ({
        id_producto: item.id,
        cantidad: item.cantidad,
        precio_unitario: item.precio,
        subtotal: item.precio * item.cantidad,
      })),
    };
  };

  const validarFormulario = (direccionFinalLista) => {
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
        message: "Tu carrito está vacío. Agrega productos.",
        type: "info",
      });
      return false;
    }

    if (direccionFinalLista.trim() === "") {
      showMessage({
        title: "Dirección requerida",
        message:
          "Selecciona una dirección guardada o llena los campos (Calle, Colonia, Ciudad, Estado).",
        type: "warning",
      });
      return false;
    }

    if (metodoPago === "1" || metodoPago === "2") {
      const numeroLimpio = numeroTarjeta.replace(/\s/g, "");

      if (!validarTarjeta(numeroTarjeta)) {
        showMessage({
          title: "Tarjeta inválida",
          message: "El número de tarjeta no es válido.",
          type: "warning",
        });
        return false;
      }
      if (!validarFecha(fechaVencimiento)) {
        showMessage({
          title: "Fecha inválida",
          message: "La fecha de vencimiento no es válida o ya expiró.",
          type: "warning",
        });
        return false;
      }
      if (!/^\d{3,4}$/.test(cvv)) {
        showMessage({
          title: "CVV inválido",
          message: "El CVV debe tener 3 o 4 dígitos.",
          type: "warning",
        });
        return false;
      }
    }

    return true;
  };

  const simularCobro = async (e) => {
    e.preventDefault();

    const direccionFinalLista = obtenerDireccionFinal();

    if (!validarFormulario(direccionFinalLista)) return;

    setProcesando(true);
    setResultado(null);

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

    const referenciaLocal = generarReferencia();

    try {
      const orden = generarOrden(direccionFinalLista);

      const response = await fetch("http://localhost:8000/api/checkout/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orden),
      });

      const data = await response.json();

      if (!response.ok)
        throw new Error(data.error || "Error al procesar la orden");

      const referenciaBackend = data.referencia || referenciaLocal;

      clearCart();

      setTimeout(() => {
        setResultado({
          tipo,
          estatusCobro,
          referencia: referenciaBackend,
          metodoPago,
          monto: total,
          direccionEnvio: direccionFinalLista, // Mostramos la dirección final en el resumen
          mensaje,
        });

        setProcesando(false);

        showMessage({
          title:
            tipo === "aceptado"
              ? "Pago aceptado"
              : tipo === "rechazado"
                ? "Pago rechazado"
                : "Pago pendiente",
          message:
            tipo === "aceptado"
              ? `Tu pago fue aceptado correctamente. Referencia: ${referenciaBackend}`
              : tipo === "rechazado"
                ? "El pago fue rechazado por el banco emisor."
                : `Se generó una referencia para pago en OXXO: ${referenciaBackend}`,
          type:
            tipo === "aceptado"
              ? "success"
              : tipo === "rechazado"
                ? "error"
                : "info",
        });
      }, 1200);
    } catch (error) {
      console.error("Error en checkout:", error);
      setProcesando(false);
      showMessage({
        title: "Error",
        message: error.message || "No se pudo conectar con el servidor",
        type: "error",
      });
    }
  };

  const obtenerNombreMetodo = () => {
    if (metodoPago === "1") return "Tarjeta de débito";
    if (metodoPago === "2") return "Tarjeta de crédito";
    return "Pago en OXXO / transferencia";
  };

  // Manejador genérico para cuando escribe a mano: Actualiza estado y quita la selección previa
  const handleInputManual = (campo, valor) => {
    setDirManual({ ...dirManual, [campo]: valor });
    setDireccionSeleccionadaId("");
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

          {direccionesGuardadas.length > 0 && (
            <div className="checkout-address-list">
              {direccionesGuardadas.map((direccion) => (
                <button
                  type="button"
                  key={direccion.id}
                  className={`checkout-address-option ${direccionSeleccionadaId === direccion.id ? "active" : ""}`}
                  onClick={() => seleccionarDireccion(direccion)}
                >
                  <span className="checkout-address-icon">
                    <FaMapMarkerAlt />
                  </span>
                  <span className="checkout-address-info">
                    <strong>
                      {direccion.alias}
                      {direccion.principal ? " · Principal" : ""}
                    </strong>
                    <small>{formatearDireccion(direccion)}</small>
                  </span>
                </button>
              ))}
            </div>
          )}

          {direccionSeleccionada && (
            <small className="checkout-address-helper">
              Puedes ajustar la dirección seleccionada antes de simular el pago
              o escribir una nueva abajo.
            </small>
          )}

          {/* 🔥 FORMULARIO MANUAL AHORA CONECTADO A REACT */}
          <div className="checkout-address-form mt-3">
            <h6 className="text-muted mb-3">O ingresa una nueva dirección:</h6>
            <div className="row g-3">
              <div className="col-md-8">
                <label className="checkout-label">Calle</label>
                <input
                  type="text"
                  className="checkout-input"
                  placeholder="Ej. Av. Siempre Viva"
                  value={dirManual.calle}
                  onChange={(e) => handleInputManual("calle", e.target.value)}
                />
              </div>

              <div className="col-md-4">
                <label className="checkout-label">Número</label>
                <input
                  type="text"
                  className="checkout-input"
                  placeholder="Ej. 742"
                  value={dirManual.numero}
                  onChange={(e) => handleInputManual("numero", e.target.value)}
                />
              </div>

              <div className="col-md-6">
                <label className="checkout-label">Colonia</label>
                <input
                  type="text"
                  className="checkout-input"
                  placeholder="Ej. Centro"
                  value={dirManual.colonia}
                  onChange={(e) => handleInputManual("colonia", e.target.value)}
                />
              </div>

              <div className="col-md-6">
                <label className="checkout-label">Código postal</label>
                <input
                  type="text"
                  className="checkout-input"
                  placeholder="Ej. 91700"
                  value={dirManual.cp}
                  onChange={(e) => handleInputManual("cp", e.target.value)}
                />
              </div>

              <div className="col-md-6">
                <label className="checkout-label">Ciudad</label>
                <input
                  type="text"
                  className="checkout-input"
                  placeholder="Ej. Veracruz"
                  value={dirManual.ciudad}
                  onChange={(e) => handleInputManual("ciudad", e.target.value)}
                />
              </div>

              <div className="col-md-6">
                <label className="checkout-label">Estado</label>
                <input
                  type="text"
                  className="checkout-input"
                  placeholder="Ej. Veracruz"
                  value={dirManual.estado}
                  onChange={(e) => handleInputManual("estado", e.target.value)}
                />
              </div>

              <div className="col-12">
                <label className="checkout-label">Referencias</label>
                <textarea
                  className="checkout-textarea"
                  rows="3"
                  placeholder="Color de la casa, entre qué calles está..."
                  value={dirManual.referencias}
                  onChange={(e) =>
                    handleInputManual("referencias", e.target.value)
                  }
                />
              </div>
            </div>
          </div>
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
                placeholder="1234 5678 9012 3456"
                onChange={(e) => {
                  let value = e.target.value.replace(/\D/g, "").slice(0, 16);
                  value = value.replace(/(\d{4})(?=\d)/g, "$1 ");
                  setNumeroTarjeta(value);
                }}
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
                  placeholder="MM/AA"
                  onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, "").slice(0, 4);
                    if (value.length >= 3) {
                      value = value.slice(0, 2) + "/" + value.slice(2);
                    }
                    setFechaVencimiento(value);
                  }}
                />
              </div>

              <div className="simulador-form-group">
                <label>CVV</label>
                <input
                  type="password"
                  maxLength="4"
                  value={cvv}
                  placeholder="123"
                  onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, "").slice(0, 3);
                    setCvv(value);
                  }}
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
            <p>
              <strong>Envío:</strong> {resultado.direccionEnvio}
            </p>
          </div>
        </div>
      )}
    </section>
  );
};

export default SimuladorCobro;
