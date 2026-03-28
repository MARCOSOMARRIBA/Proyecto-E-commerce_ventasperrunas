import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';

function Footer() {
  return (
    <footer className="footer-custom mt-5 pt-5 pb-3">
      <div className="container">
        <div className="row">
          
          {/* Columna 1: Enlaces de Secciones */}
          <div className="col-md-3 mb-4 mb-md-0">
            <h5 className="text-uppercase mb-3">Secciones</h5>
            <ul className="list-unstyled">
              <li><Link to="/">Inicio</Link></li>
              <li><Link to="/tienda">Tienda</Link></li>
              <li><Link to="/nosotros">Nosotros</Link></li>
              <li><Link to="/servicios">Servicios</Link></li>
              <li><Link to="/contacto">Contacto</Link></li>
            </ul>
          </div>

          {/* Columna 2: Catálogos Específicos */}
          <div className="col-md-3 mb-4 mb-md-0">
            <h5 className="text-uppercase mb-3">Catálogos</h5>
            <ul className="list-unstyled">
              <li><Link to="/tienda/perro">Alimento Perro</Link></li>
              <li><Link to="/tienda/gato">Alimento Gato</Link></li>
              <li><Link to="/tienda/juguetes">Juguetes</Link></li>
              <li><Link to="/tienda/farmacia">Farmacia</Link></li>
            </ul>
          </div>

          {/* Columna 3: Información de Contacto */}
          <div className="col-md-3 mb-4 mb-md-0">
            <h5 className="text-uppercase mb-3">Contacto</h5>
            <p>123 Calle Perruna<br/>Colonia Mascotas, Veracruz</p>
            <p>info@ventasperrunas.mx</p>
            <p>(+52) 123-456-7890</p>
          </div>

          {/* Columna 4: Redes Sociales */}
          <div className="col-md-3 text-md-end">
            <h5 className="text-uppercase mb-3">Síguenos</h5>
            <div className="d-flex justify-content-md-end gap-3 social-icons">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"><FaFacebook /></a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"><FaTwitter /></a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"><FaInstagram /></a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"><FaLinkedin /></a>
            </div>
          </div>

        </div>

        {/* Línea divisoria y Copyright */}
        <div className="row mt-4 pt-3 border-top text-center text-muted copyright">
          <div className="col">
            &copy; 2026 Ventas Perrunas Online. Todos los derechos reservados.
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;