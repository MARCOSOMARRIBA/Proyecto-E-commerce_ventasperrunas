import React from "react";
import { Link } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";

function HeroBanner({
  titulo,
  descripcion,
  imagen,
  botonTexto,
  botonLink,
  badge = "DESTACADO",
  altura = "75vh",
}) {
  return (
    <div
      className="hero-banner"
      style={{
        backgroundImage: `url(${imagen})`,
        height: altura,
      }}
    >
      <div className="hero-overlay">
        <div className="hero-content container">
          <span className="badge bg-warning text-dark px-3 py-2 mb-3">
            {badge}
          </span>

          <h1>{titulo}</h1>

          <p>{descripcion}</p>

          {botonLink && (
            <Link to={botonLink} className="btn btn-warning btn-lg mt-3">
              {botonTexto}
              <FaArrowRight className="ms-2" />
            </Link>
          )}
        </div>
      </div>

      <style>{`
        .hero-banner {
          background-size: cover;
          background-position: center;
          position: relative;
          border-radius: 25px;
          overflow: hidden;
        }

        .hero-overlay {
          background: linear-gradient(
            to right,
            rgba(0,0,0,0.8),
            rgba(0,0,0,0.2)
          );
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
        }

        .hero-content {
          color: white;
          max-width: 650px;
        }

        .hero-content h1 {
          font-size: 4rem;
          font-weight: 800;
          margin-bottom: 20px;
        }

        .hero-content p {
          font-size: 1.2rem;
          opacity: 0.9;
          line-height: 1.7;
        }

        @media (max-width: 768px) {
          .hero-content h1 {
            font-size: 2.5rem;
          }

          .hero-banner {
            height: 60vh !important;
          }
        }
      `}</style>
    </div>
  );
}

export default HeroBanner;
