import React from "react";

const WHATSAPP_NUMERO = "5212941694667";
// Cambia este número por el real.
// Formato recomendado para México:
// 52 + 1 + lada + número
// Ejemplo Veracruz: 5212291234567

const servicios = [
  {
    titulo: "Estética Canina",
    descripcion: "Cortes de pelo, baños y cuidado experto para tu peludo.",
    imagen:
      "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=900&q=80",
    mensaje:
      "Hola, me gustaría recibir información sobre el servicio de Estética Canina.",
  },
  {
    titulo: "Servicio Médico",
    descripcion:
      "Consultas, vacunas y revisiones de salud con nuestros veterinarios.",
    imagen:
      "https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&w=900&q=80",
    mensaje:
      "Hola, me gustaría recibir información sobre el Servicio Médico para mascotas.",
  },
  {
    titulo: "Servicio a Domicilio",
    descripcion:
      "Entregamos tus pedidos y medicamentos en la puerta de tu casa.",
    imagen:
      "https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=900&q=80",
    mensaje:
      "Hola, me gustaría recibir información sobre el Servicio a Domicilio.",
  },
];

const SeccionServicios = () => {
  const abrirWhatsApp = (mensaje) => {
    const mensajeCodificado = encodeURIComponent(mensaje);
    const url = `https://wa.me/${WHATSAPP_NUMERO}?text=${mensajeCodificado}`;

    window.open(url, "_blank");
  };

  return (
    <section className="servicios-section">
      <h2 className="servicios-title">CONOCE NUESTROS SERVICIOS</h2>

      <div className="servicios-grid">
        {servicios.map((servicio, index) => (
          <article className="servicio-card" key={index}>
            <button
              type="button"
              className="servicio-img-btn"
              onClick={() => abrirWhatsApp(servicio.mensaje)}
              title={`Contactar por WhatsApp: ${servicio.titulo}`}
            >
              <img
                src={servicio.imagen}
                alt={servicio.titulo}
                className="servicio-img"
              />

              <span className="servicio-whatsapp-label">
                Contactar por WhatsApp
              </span>
            </button>

            <div className="servicio-info">
              <h3>{servicio.titulo}</h3>
              <p>{servicio.descripcion}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default SeccionServicios;
