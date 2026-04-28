import React, { useState } from "react";
import {
  FaPaw,
  FaWhatsapp,
  FaEnvelope,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaClock,
  FaPaperPlane,
  FaFacebook,
  FaInstagram,
  FaTwitter,
} from "react-icons/fa";
import { useMessage } from "../context/MessageContext";

const WHATSAPP_NUMERO = "5212291234567";
// Cambia este número por el real.
// Formato: 52 + 1 + lada + número.
// Ejemplo Veracruz: 5212291234567

const Contacto = () => {
  const { showMessage } = useMessage();

  const [formulario, setFormulario] = useState({
    nombre: "",
    correo: "",
    telefono: "",
    asunto: "",
    mensaje: "",
  });

  const abrirWhatsApp = () => {
    const mensaje = encodeURIComponent(
      "Hola, me gustaría recibir información de Ventas Perrunas.",
    );

    window.open(`https://wa.me/${WHATSAPP_NUMERO}?text=${mensaje}`, "_blank");
  };

  const manejarCambio = (e) => {
    const { name, value } = e.target;

    setFormulario({
      ...formulario,
      [name]: value,
    });
  };

  const enviarFormulario = (e) => {
    e.preventDefault();

    if (
      formulario.nombre.trim() === "" ||
      formulario.correo.trim() === "" ||
      formulario.asunto.trim() === "" ||
      formulario.mensaje.trim() === ""
    ) {
      showMessage({
        title: "Campos incompletos",
        message: "Debes llenar nombre, correo, asunto y mensaje.",
        type: "warning",
      });
      return;
    }

    showMessage({
      title: "Mensaje enviado",
      message:
        "Tu mensaje fue registrado correctamente. Pronto nos pondremos en contacto contigo.",
      type: "success",
    });

    setFormulario({
      nombre: "",
      correo: "",
      telefono: "",
      asunto: "",
      mensaje: "",
    });
  };

  return (
    <main className="contacto-page">
      <section className="contacto-hero">
        <div>
          <span className="contacto-tag">
            <FaPaw /> Contacto
          </span>

          <h1>Estamos aquí para ayudarte</h1>

          <p>
            ¿Tienes dudas sobre productos, servicios, pedidos o atención para tu
            mascota? Escríbenos y con gusto te atenderemos.
          </p>
        </div>
      </section>

      <section className="contacto-layout">
        <div className="contacto-info-panel">
          <h2>Ventas Perrunas</h2>
          <p>
            Comunícate con nosotros por el medio que prefieras. Nuestro equipo
            está listo para orientarte.
          </p>

          <div className="contacto-info-list">
            <div className="contacto-info-item">
              <span>
                <FaMapMarkerAlt />
              </span>

              <div>
                <h3>Dirección</h3>
                <p>123 Calle Perruna, Colonia Mascotas, Veracruz</p>
              </div>
            </div>

            <div className="contacto-info-item">
              <span>
                <FaPhoneAlt />
              </span>

              <div>
                <h3>Teléfono</h3>
                <p>(+52) 123-456-7890</p>
              </div>
            </div>

            <div className="contacto-info-item">
              <span>
                <FaEnvelope />
              </span>

              <div>
                <h3>Correo</h3>
                <p>info@ventasperrunas.mx</p>
              </div>
            </div>

            <div className="contacto-info-item">
              <span>
                <FaClock />
              </span>

              <div>
                <h3>Horario</h3>
                <p>Lunes a sábado, 9:00 a.m. - 7:00 p.m.</p>
              </div>
            </div>
          </div>

          <div className="contacto-actions">
            <button type="button" onClick={abrirWhatsApp}>
              <FaWhatsapp /> WhatsApp
            </button>

            <a href="mailto:info@ventasperrunas.mx">
              <FaEnvelope /> Correo
            </a>

            <a href="tel:+521234567890">
              <FaPhoneAlt /> Llamar
            </a>
          </div>

          <div className="contacto-redes">
            <a href="https://facebook.com" target="_blank" rel="noreferrer">
              <FaFacebook />
            </a>

            <a href="https://instagram.com" target="_blank" rel="noreferrer">
              <FaInstagram />
            </a>

            <a href="https://twitter.com" target="_blank" rel="noreferrer">
              <FaTwitter />
            </a>
          </div>
        </div>

        <div className="contacto-form-card">
          <h2>Envíanos un mensaje</h2>
          <p>Completa el formulario y te responderemos lo antes posible.</p>

          <form onSubmit={enviarFormulario}>
            <div className="contacto-form-row">
              <div className="contacto-form-group">
                <label>Nombre</label>
                <input
                  type="text"
                  name="nombre"
                  value={formulario.nombre}
                  onChange={manejarCambio}
                  placeholder="Tu nombre"
                />
              </div>

              <div className="contacto-form-group">
                <label>Teléfono</label>
                <input
                  type="text"
                  name="telefono"
                  value={formulario.telefono}
                  onChange={manejarCambio}
                  placeholder="Opcional"
                />
              </div>
            </div>

            <div className="contacto-form-group">
              <label>Correo electrónico</label>
              <input
                type="email"
                name="correo"
                value={formulario.correo}
                onChange={manejarCambio}
                placeholder="correo@ejemplo.com"
              />
            </div>

            <div className="contacto-form-group">
              <label>Asunto</label>
              <select
                name="asunto"
                value={formulario.asunto}
                onChange={manejarCambio}
              >
                <option value="">Selecciona una opción</option>
                <option value="productos">Información de productos</option>
                <option value="pedido">Consulta sobre pedido</option>
                <option value="servicios">Servicios para mascotas</option>
                <option value="soporte">Soporte o aclaración</option>
              </select>
            </div>

            <div className="contacto-form-group">
              <label>Mensaje</label>
              <textarea
                name="mensaje"
                value={formulario.mensaje}
                onChange={manejarCambio}
                rows="5"
                placeholder="Escribe tu mensaje..."
              />
            </div>

            <button type="submit" className="contacto-submit-btn">
              <FaPaperPlane /> Enviar mensaje
            </button>
          </form>
        </div>
      </section>

      <section className="contacto-mapa-section">
        <div className="contacto-mapa-info">
          <span>Ubicación</span>
          <h2>Visítanos en nuestra tienda</h2>
          <p>
            Estamos ubicados en Veracruz. Puedes contactarnos antes de
            visitarnos para confirmar disponibilidad de productos o servicios.
          </p>
        </div>

        <div className="contacto-mapa-box">
          <div>
            <FaMapMarkerAlt />
            <h3>Ventas Perrunas</h3>
            <p>123 Calle Perruna, Colonia Mascotas, Veracruz</p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Contacto;
