import React, { useState, useEffect } from 'react';

const CarruselPromociones = () => {
  const [banners, setBanners] = useState([]);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8000/api/secciones-extranet/');
        if (res.ok) {
          const data = await res.json();
          // Filtramos para mostrar SOLO los que están marcados como activos
          const bannersActivos = data.filter(b => b.estatus === true);
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
    <div id="carruselPromociones" className="carousel slide mb-5 shadow rounded-4 overflow-hidden" data-bs-ride="carousel">
      <div className="carousel-inner">
        {banners.map((banner, index) => (
          <div className={`carousel-item ${index === 0 ? 'active' : ''}`} key={banner.id_seccion}>
            {/* Si el proveedor le puso un link, la imagen será clickeable */}
            <a href={banner.url_destino || '#'} target={banner.url_destino ? "_blank" : "_self"} rel="noreferrer" style={{ textDecoration: 'none' }}>
              <div
                style={{
                  height: '350px',
                  backgroundImage: `url(${banner.imagen_banner})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundColor: '#f8fafc' // Color de fondo por si la imagen tarda en cargar
                }}
                className="w-100 d-flex align-items-end justify-content-center pb-5 position-relative"
              >
                {/* Filtro oscuro transparente para que las letras blancas siempre se lean bien */}
                <div className="position-absolute top-0 start-0 w-100 h-100" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}></div>
                
                {/* Textos del Banner */}
                <div className="text-center text-white position-relative" style={{ zIndex: 1 }}>
                  <h1 className="fw-bold" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
                    {banner.titulo_pagina}
                  </h1>
                  <p className="fs-5 mb-0" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}>
                    {banner.texto_bienvenida}
                  </p>
                </div>
              </div>
            </a>
          </div>
        ))}
      </div>
      
      {/* Las flechitas de siguiente/anterior solo salen si hay más de 1 banner */}
      {banners.length > 1 && (
        <>
          <button className="carousel-control-prev" type="button" data-bs-target="#carruselPromociones" data-bs-slide="prev">
            <span className="carousel-control-prev-icon" aria-hidden="true"></span>
            <span className="visually-hidden">Anterior</span>
          </button>
          <button className="carousel-control-next" type="button" data-bs-target="#carruselPromociones" data-bs-slide="next">
            <span className="carousel-control-next-icon" aria-hidden="true"></span>
            <span className="visually-hidden">Siguiente</span>
          </button>
        </>
      )}
    </div>
  );
};

export default CarruselPromociones;