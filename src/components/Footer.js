import React from "react";
import { Link } from "react-router-dom";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";

function Footer() {
  return (
    <footer className="footer-custom mt-5 pt-5 pb-3">
      <div className="container">
        <div className="row">
          {/* Columna 1: Enlaces de Secciones */}
          <div className="col-md-3 mb-4 mb-md-0">
            <h5 className="text-uppercase mb-3">Secciones</h5>
            <ul className="list-unstyled">
              <li>
                <Link to="/">Inicio</Link>
              </li>
              <li>
                <Link to="/tienda">Tienda</Link>
              </li>
              <li>
                <Link to="/nosotros">Nosotros</Link>
              </li>
              <li>
                <Link to="/servicios">Servicios</Link>
              </li>
              <li>
                <Link to="/contacto">Contacto</Link>
              </li>
            </ul>
          </div>

          {/* Columna 2: Catálogos Específicos */}
          <div className="col-md-3 mb-4 mb-md-0">
            <h5 className="text-uppercase mb-3">Catálogos</h5>
            <ul className="list-unstyled">
              <li>
                <Link to="/tienda/Perro">Alimento Perro</Link>
              </li>
              <li>
                <Link to="/tienda/Gato">Alimento Gato</Link>
              </li>
              <li>
                <Link to="/tienda/accesorios">Accesorios</Link>
              </li>
              <li>
                <Link to="/tienda/salud">Salud</Link>
              </li>
            </ul>
          </div>

          {/* Columna 3: Información de Contacto */}
          <div className="col-md-3 mb-4 mb-md-0">
            <h5 className="text-uppercase mb-3">Contacto</h5>
            <p>
              Lopez Mateos #21
              <br />
              Colonia Lopez Arias 91820
              <br />
              Veracruz, Veracruz
            </p>
            <p>info@ventasperrunas.mx</p>
            <p>2293503297</p>
          </div>

          {/* Columna 4: Redes Sociales */}
          <div className="col-md-3 text-md-end">
            <h5 className="text-uppercase mb-3">Síguenos</h5>
            <div className="d-flex justify-content-md-end gap-3 social-icons">
              <a
                href="https://www.facebook.com/marco.aurelio.somarriba"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaFacebook />
              </a>
              <a
                href="https://x.com/pyrox456"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaTwitter />
              </a>
              <a
                href="https://www.instagram.com/auresoma_/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaInstagram />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaLinkedin />
              </a>
            </div>
          </div>
        </div>

        {/* Línea divisoria y Copyright */}
        <div className="row mt-4 pt-3 border-top text-center text-muted copyright">
          <div className="col">
            &copy; 2026 Ventas Perrunas Online. Todos los derechos reservados a
            Jesus Alvarado Hernandez y Marco Aurelio Somarriba Cadena.
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
