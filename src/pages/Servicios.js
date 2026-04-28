import React from "react";
import {
  FaPaw,
  FaDog,
  FaCat,
  FaWhatsapp,
  FaTruck,
  FaStethoscope,
  FaBath,
  FaShieldAlt,
  FaClock,
  FaHeart,
} from "react-icons/fa";

const WHATSAPP_NUMERO = "5212291234567";
// Cambia este número por el real.
// Formato: 52 + 1 + lada + número.
// Ejemplo Veracruz: 5212291234567

const servicios = [
  {
    titulo: "Estética Canina",
    descripcion:
      "Servicio de baño, corte de pelo, limpieza y cuidado básico para que tu mascota luzca limpia, cómoda y saludable.",
    imagen:
      "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=1000&q=80",
    icono: <FaBath />,
    mensaje:
      "Hola, me gustaría recibir información sobre el servicio de Estética Canina.",
  },
  {
    titulo: "Servicio Médico",
    descripcion:
      "Orientación, consultas, vacunas y revisiones generales para apoyar el cuidado de la salud de tu mascota.",
    imagen:
      "https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?auto=format&fit=crop&w=1000&q=80",
    icono: <FaStethoscope />,
    mensaje:
      "Hola, me gustaría recibir información sobre el Servicio Médico para mascotas.",
  },
  {
    titulo: "Servicio a Domicilio",
    descripcion:
      "Entrega de productos, alimentos, accesorios y medicamentos directamente hasta la puerta de tu casa.",
    imagen:
      "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=1000&q=80",
    icono: <FaTruck />,
    mensaje:
      "Hola, me gustaría recibir información sobre el Servicio a Domicilio.",
  },
];

const Servicios = () => {
  const abrirWhatsApp = (mensaje) => {
    const mensajeCodificado = encodeURIComponent(mensaje);
    const url = `https://wa.me/${WHATSAPP_NUMERO}?text=${mensajeCodificado}`;
    window.open(url, "_blank");
  };

  return (
    <main className="servicios-page">
      <section className="servicios-hero-page">
        <div className="servicios-hero-content">
          <span className="servicios-tag">
            <FaPaw /> Servicios para mascotas
          </span>

          <h1>Cuidamos a tu mascota como parte de la familia</h1>

          <p>
            En Ventas Perrunas no solo encuentras productos, también servicios
            pensados para mejorar el bienestar, salud y comodidad de tus
            mascotas.
          </p>

          <button
            type="button"
            className="servicios-hero-btn"
            onClick={() =>
              abrirWhatsApp(
                "Hola, me gustaría recibir información sobre los servicios de Ventas Perrunas.",
              )
            }
          >
            <FaWhatsapp /> Contactar por WhatsApp
          </button>
        </div>

        <div className="servicios-hero-img">
          <img
            src="https://images.unsplash.com/photo-1601758125946-6ec2ef64daf8?auto=format&fit=crop&w=1000&q=80"
            alt="Mascotas felices"
          />
        </div>
      </section>

      <section className="servicios-main-section">
        <div className="servicios-section-header-page">
          <span>Lo que ofrecemos</span>
          <h2>Nuestros servicios</h2>
          <p>
            Selecciona el servicio que necesitas y comunícate con nosotros para
            recibir más información.
          </p>
        </div>

        <div className="servicios-page-grid">
          {servicios.map((servicio, index) => (
            <article className="servicios-page-card" key={index}>
              <div className="servicios-page-img-box">
                <img src={servicio.imagen} alt={servicio.titulo} />

                <div className="servicios-page-icon">{servicio.icono}</div>
              </div>

              <div className="servicios-page-info">
                <h3>{servicio.titulo}</h3>
                <p>{servicio.descripcion}</p>

                <button
                  type="button"
                  className="servicios-whatsapp-btn"
                  onClick={() => abrirWhatsApp(servicio.mensaje)}
                >
                  <FaWhatsapp /> Solicitar información
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="servicios-beneficios">
        <div className="servicios-section-header-page">
          <span>¿Por qué elegirnos?</span>
          <h2>Beneficios de nuestros servicios</h2>
          <p>
            Buscamos ofrecer una atención práctica, confiable y enfocada en el
            bienestar de tu mascota.
          </p>
        </div>

        <div className="servicios-beneficios-grid">
          <div className="servicio-beneficio-card">
            <FaHeart />
            <h3>Atención con cariño</h3>
            <p>
              Cada servicio se realiza pensando en la comodidad y tranquilidad
              de tu mascota.
            </p>
          </div>

          <div className="servicio-beneficio-card">
            <FaShieldAlt />
            <h3>Confianza</h3>
            <p>
              Te orientamos para elegir productos y servicios adecuados para tu
              mascota.
            </p>
          </div>

          <div className="servicio-beneficio-card">
            <FaClock />
            <h3>Practicidad</h3>
            <p>
              Puedes solicitar información o agendar atención directamente por
              WhatsApp.
            </p>
          </div>

          <div className="servicio-beneficio-card">
            <FaTruck />
            <h3>Comodidad</h3>
            <p>
              Nuestro servicio a domicilio facilita que recibas productos sin
              salir de casa.
            </p>
          </div>
        </div>
      </section>

      <section className="servicios-mascotas-banner">
        <div>
          <span>
            <FaDog /> <FaCat />
          </span>
          <h2>Tu mascota merece lo mejor</h2>
          <p>
            Escríbenos y con gusto te orientamos sobre el servicio ideal para tu
            perro o gato.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            abrirWhatsApp(
              "Hola, quiero saber qué servicio recomiendan para mi mascota.",
            )
          }
        >
          <FaWhatsapp /> Escribir ahora
        </button>
      </section>
    </main>
  );
};

export default Servicios;
