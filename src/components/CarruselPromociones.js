import React, { useState, useEffect } from "react";

const CarruselPromociones = () => {
  const [banners, setBanners] = useState([]);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        // 🔥 AQUI ESTÁ LA MAGIA: Apuntamos a la ruta blindada para el público (Rol 1)
        const res = await fetch(
          "https://proyecto-e-commerce-ventasperrunas.onrender.com//api/banners/1/"
        );
        if (res.ok) {
          const data = await res.json();
          // Filtramos para mostrar SOLO los que están marcados como activos
          const bannersActivos = data.filter((b) => b.estatus === true);
          setBanners(bannersActivos);
        }
      } catch (error) {
        console.error("Error cargando banners:", error);
      }
    };
    fetchBanners();
  }, []);

  // Si no hay ningún banner activo en la base de datos, el carrusel se oculta y no estorba
  if (banners.length === 0) return null;

  return (
    <div
      id="carruselPromociones"
      className="carousel slide carousel-fade mb-5"
      data-bs-ride="carousel"
      data-bs-interval="4000"
      data-bs-pause="false"
    >
      {/* INDICADORES */}
      {banners.length > 1 && (
        <div className="carousel-indicators">
          {banners.map((_, index) => (
            <button
              key={index}
              type="button"
              data-bs-target="#carruselPromociones"
              data-bs-slide-to={index}
              className={index === 0 ? "active" : ""}
              aria-current={index === 0 ? "true" : "false"}
            />
          ))}
        </div>
      )}

      {/* SLIDES */}
      <div className="carousel-inner rounded-4 overflow-hidden shadow-lg">
        {banners.map((banner, index) => (
          <div
            className={`carousel-item ${index === 0 ? "active" : ""}`}
            key={banner.id_seccion}
          >
            <a
              href={banner.url_destino || "#"}
              target={banner.url_destino ? "_blank" : "_self"}
              rel="noreferrer"
              style={{ textDecoration: "none" }}
            >
              <div
                className="position-relative d-flex align-items-center justify-content-center"
                style={{
                  height: "500px",
                  backgroundImage: `url(${banner.imagen_banner})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                {/* Overlay oscuro */}
                <div
                  className="position-absolute top-0 start-0 w-100 h-100"
                  style={{
                    background:
                      "linear-gradient(rgba(0,0,0,0.35), rgba(0,0,0,0.55))",
                  }}
                ></div>

                {/* Contenido */}
                <div
                  className="text-center text-white position-relative px-3"
                  style={{ zIndex: 2, maxWidth: "900px" }}
                >
                  <h1
                    className="fw-bold mb-3"
                    style={{
                      fontSize: "clamp(2rem, 5vw, 4rem)",
                      textShadow: "0 4px 12px rgba(0,0,0,0.7)",
                    }}
                  >
                    {banner.titulo_pagina}
                  </h1>

                  <p
                    className="mb-4"
                    style={{
                      fontSize: "clamp(1rem, 2vw, 1.4rem)",
                      textShadow: "0 2px 8px rgba(0,0,0,0.7)",
                    }}
                  >
                    {banner.texto_bienvenida}
                  </p>

                  {banner.url_destino && (
                    <span className="btn btn-light btn-lg rounded-pill px-4 fw-semibold">
                      Ver más
                    </span>
                  )}
                </div>
              </div>
            </a>
          </div>
        ))}
      </div>

      {/* FLECHA IZQUIERDA */}
      {banners.length > 1 && (
        <>
          <button
            className="carousel-control-prev"
            type="button"
            data-bs-target="#carruselPromociones"
            data-bs-slide="prev"
          >
            <span
              className="carousel-control-prev-icon bg-dark rounded-circle p-4"
              aria-hidden="true"
            ></span>
          </button>

          {/* FLECHA DERECHA */}
          <button
            className="carousel-control-next"
            type="button"
            data-bs-target="#carruselPromociones"
            data-bs-slide="next"
          >
            <span
              className="carousel-control-next-icon bg-dark rounded-circle p-4"
              aria-hidden="true"
            ></span>
          </button>
        </>
      )}
    </div>
  );
};

export default CarruselPromociones;