import React from "react";
import {
  FaPaw,
  FaHeart,
  FaShieldAlt,
  FaTruck,
  FaUsers,
  FaStar,
  FaDog,
  FaCat,
} from "react-icons/fa";
import { Link } from "react-router-dom";

const Nosotros = () => {
  return (
    <main className="nosotros-page">
      <section className="nosotros-hero">
        <div className="nosotros-hero-content">
          <span className="nosotros-tag">
            <FaPaw /> Ventas Perrunas
          </span>

          <h1>Pasión por las mascotas, compromiso con sus dueños</h1>

          <p>
            En Ventas Perrunas creemos que cada mascota merece amor, cuidado y
            productos de calidad. Por eso reunimos alimentos, accesorios,
            servicios y atención pensada para acompañarte en el bienestar de tu
            compañero peludo.
          </p>

          <div className="nosotros-hero-actions">
            <Link to="/tienda" className="nosotros-btn-primary">
              Ver productos
            </Link>

            <Link to="/contacto" className="nosotros-btn-secondary">
              Contáctanos
            </Link>
          </div>
        </div>

        <div className="nosotros-hero-image">
          <img
            src="https://images.unsplash.com/photo-1601758125946-6ec2ef64daf8?auto=format&fit=crop&w=900&q=80"
            alt="Mascotas felices"
          />
        </div>
      </section>

      <section className="nosotros-intro">
        <div className="nosotros-intro-card">
          <FaDog />
          <h3>Para perros</h3>
          <p>
            Productos, alimentos y accesorios para cuidar su energía, salud y
            felicidad.
          </p>
        </div>

        <div className="nosotros-intro-card">
          <FaCat />
          <h3>Para gatos</h3>
          <p>
            Artículos pensados para su comodidad, alimentación y
            entretenimiento.
          </p>
        </div>

        <div className="nosotros-intro-card">
          <FaHeart />
          <h3>Con cariño</h3>
          <p>
            Cada servicio está pensado para que tu mascota reciba la atención
            que merece.
          </p>
        </div>
      </section>

      <section className="nosotros-historia">
        <div className="nosotros-historia-img">
          <img
            src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=900&q=80"
            alt="Perros jugando"
          />
        </div>

        <div className="nosotros-historia-text">
          <span className="nosotros-subtitle">Nuestra historia</span>

          <h2>Una tienda creada para consentir a quienes más queremos</h2>

          <p>
            Ventas Perrunas nace con la idea de facilitar a los dueños de
            mascotas el acceso a productos confiables, servicios útiles y una
            experiencia de compra sencilla. Nuestro objetivo es que encuentres
            en un solo lugar todo lo necesario para cuidar, alimentar y
            consentir a tu mascota.
          </p>

          <p>
            Más que una tienda, buscamos ser un apoyo para las familias que
            consideran a sus mascotas como parte fundamental de su vida diaria.
          </p>
        </div>
      </section>

      <section className="nosotros-mision-vision">
        <article>
          <span className="nosotros-icon-circle">
            <FaStar />
          </span>
          <h2>Misión</h2>
          <p>
            Ofrecer productos y servicios de calidad para mascotas, brindando
            una experiencia de compra práctica, confiable y cercana para
            nuestros clientes.
          </p>
        </article>

        <article>
          <span className="nosotros-icon-circle">
            <FaShieldAlt />
          </span>
          <h2>Visión</h2>
          <p>
            Ser una tienda reconocida por su compromiso con el bienestar animal,
            la atención al cliente y la variedad de productos para mascotas.
          </p>
        </article>
      </section>

      <section className="nosotros-valores">
        <div className="nosotros-section-header">
          <span className="nosotros-subtitle">Lo que nos representa</span>
          <h2>Nuestros valores</h2>
          <p>
            Trabajamos con principios que nos ayudan a brindar una mejor
            experiencia a cada cliente y a cada mascota.
          </p>
        </div>

        <div className="nosotros-valores-grid">
          <div className="nosotros-valor-card">
            <FaHeart />
            <h3>Amor por las mascotas</h3>
            <p>
              Entendemos la importancia que tienen en cada hogar y buscamos
              contribuir a su bienestar.
            </p>
          </div>

          <div className="nosotros-valor-card">
            <FaShieldAlt />
            <h3>Confianza</h3>
            <p>
              Promovemos productos y servicios pensados para el cuidado
              responsable de los animales.
            </p>
          </div>

          <div className="nosotros-valor-card">
            <FaUsers />
            <h3>Atención cercana</h3>
            <p>
              Queremos que cada cliente encuentre orientación, apoyo y una
              compra sencilla.
            </p>
          </div>

          <div className="nosotros-valor-card">
            <FaTruck />
            <h3>Servicio eficiente</h3>
            <p>
              Buscamos que los productos lleguen de forma cómoda y oportuna a
              quienes los necesitan.
            </p>
          </div>
        </div>
      </section>

      <section className="nosotros-cta">
        <div>
          <h2>¿Listo para consentir a tu mascota?</h2>
          <p>
            Explora nuestro catálogo y encuentra productos ideales para su
            alimentación, cuidado y diversión.
          </p>
        </div>

        <Link to="/tienda" className="nosotros-btn-primary">
          Ir a la tienda
        </Link>
      </section>
    </main>
  );
};

export default Nosotros;
