import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { FiImage, FiPlus, FiTrash2, FiSend, FiLink } from 'react-icons/fi';

const BannersExtranet = () => {
  const { user } = useContext(AuthContext);
  const [banners, setBanners] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [cargando, setCargando] = useState(true);

  // Estado para el nuevo banner (coincide con tu modelo SeccionExtranet)
  const [nuevoBanner, setNuevoBanner] = useState({
    titulo_pagina: '',
    imagen_banner: '',
    texto_bienvenida: '',
    url_destino: '',
    estatus: true
  });

  // URL de tu API (Asegúrate de que en urls.py de Django se llame así)
const API_URL = 'http://127.0.0.1:8000/api/secciones-extranet/';

  useEffect(() => {
    cargarBanners();
  }, []);

  const cargarBanners = async () => {
    try {
      const res = await fetch(API_URL);
      if (res.ok) {
        const data = await res.json();
        // Opcional: Filtrar solo los banners creados por este usuario
        // const misBanners = data.filter(b => b.id_usuario === user?.id);
        setBanners(data);
      }
    } catch (error) {
      console.error("Error al cargar banners:", error);
    } finally {
      setCargando(false);
    }
  };

  const manejarEnvio = async (e) => {
    e.preventDefault();
    
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...nuevoBanner,
          id_usuario: user?.id || 'ADM0000000001' // Forzamos el ID si no viene en sesión
        })
      });

      if (res.ok) {
        setMostrarFormulario(false);
        setNuevoBanner({ titulo_pagina: '', imagen_banner: '', texto_bienvenida: '', url_destino: '', estatus: true });
        cargarBanners(); // Recargamos la lista
        alert("¡Banner promocional creado con éxito!");
      } else {
        const errorData = await res.json();
        alert("Error de Django:\n" + JSON.stringify(errorData, null, 2));
      }
    } catch (error) {
      console.error("Error al guardar:", error);
    }
  };

  const eliminarBanner = async (id_seccion) => {
    if (!window.confirm("¿Estás seguro de eliminar esta promoción?")) return;

    try {
      const res = await fetch(`${API_URL}${id_seccion}/`, { method: 'DELETE' });
      if (res.ok) {
        setBanners(banners.filter(b => b.id_seccion !== id_seccion));
      }
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
  };

  return (
    <div className="p-4 animate__animated animate__fadeIn">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold m-0 d-flex align-items-center gap-2 text-dark">
            <FiImage className="text-primary" /> Gestión de Promociones
          </h2>
          <p className="text-muted small m-0">Crea y administra los banners que verán los usuarios</p>
        </div>
        <button onClick={() => setMostrarFormulario(!mostrarFormulario)} className="btn btn-primary fw-bold shadow-sm">
          {mostrarFormulario ? "Cancelar" : <><FiPlus className="me-2" /> Nuevo Banner</>}
        </button>
      </div>

      {/* FORMULARIO DE CREACIÓN */}
      {mostrarFormulario && (
        <div className="card border-0 shadow-sm rounded-4 mb-4 bg-light">
          <div className="card-body p-4">
            <h5 className="fw-bold mb-3">Crear Nueva Promoción</h5>
            <form onSubmit={manejarEnvio} className="row g-3">
              <div className="col-md-6">
                <label className="form-label fw-bold small text-muted">TÍTULO (Ej. Promo Croquetas)</label>
                <input type="text" className="form-control border-2" required value={nuevoBanner.titulo_pagina} onChange={e => setNuevoBanner({...nuevoBanner, titulo_pagina: e.target.value})} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold small text-muted">URL DE LA IMAGEN (Link de internet)</label>
                <input type="url" className="form-control border-2" required placeholder="https://..." value={nuevoBanner.imagen_banner} onChange={e => setNuevoBanner({...nuevoBanner, imagen_banner: e.target.value})} />
              </div>
              <div className="col-md-12">
                <label className="form-label fw-bold small text-muted">TEXTO PROMOCIONAL</label>
                <textarea className="form-control border-2" rows="2" value={nuevoBanner.texto_bienvenida} onChange={e => setNuevoBanner({...nuevoBanner, texto_bienvenida: e.target.value})} />
              </div>
              <div className="col-md-8">
                <label className="form-label fw-bold small text-muted">ENLACE DE DESTINO (Opcional)</label>
                <div className="input-group">
                  <span className="input-group-text bg-white border-2"><FiLink /></span>
                  <input type="text" className="form-control border-2" placeholder="/productos/ofertas" value={nuevoBanner.url_destino} onChange={e => setNuevoBanner({...nuevoBanner, url_destino: e.target.value})} />
                </div>
              </div>
              <div className="col-md-4 d-flex align-items-end">
                <div className="form-check form-switch fs-5 mb-2">
                  <input className="form-check-input cursor-pointer" type="checkbox" role="switch" checked={nuevoBanner.estatus} onChange={e => setNuevoBanner({...nuevoBanner, estatus: e.target.checked})} />
                  <label className="form-check-label ms-2 fs-6 mt-1">Banner Activo</label>
                </div>
              </div>
              <div className="col-12 text-end mt-4">
                <button type="submit" className="btn btn-success px-4 fw-bold">
                  <FiSend className="me-2" /> Publicar Banner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GALERÍA DE BANNERS ACTIVOS */}
      {cargando ? (
        <div className="text-center py-5 text-muted">Cargando banners...</div>
      ) : banners.length === 0 ? (
        <div className="text-center py-5 bg-white rounded-4 shadow-sm">
          <FiImage size={40} className="text-muted opacity-50 mb-3" />
          <h5 className="text-muted fw-bold">No hay banners activos</h5>
          <p className="text-muted small">Crea uno nuevo para que aparezca en la tienda.</p>
        </div>
      ) : (
        <div className="row g-4">
          {banners.map(banner => (
            <div className="col-md-6 col-lg-4" key={banner.id_seccion}>
              <div className="card border-0 shadow-sm rounded-4 h-100 overflow-hidden">
                <div 
                  style={{ 
                    height: '180px', 
                    backgroundImage: `url(${banner.imagen_banner})`, 
                    backgroundSize: 'cover', 
                    backgroundPosition: 'center',
                    backgroundColor: '#e9ecef'
                  }} 
                  className="w-100 position-relative"
                >
                  {!banner.estatus && (
                    <span className="position-absolute top-0 end-0 m-2 badge bg-danger">Inactivo</span>
                  )}
                </div>
                <div className="card-body">
                  <h5 className="fw-bold text-dark text-truncate">{banner.titulo_pagina}</h5>
                  <p className="text-muted small mb-3" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {banner.texto_bienvenida}
                  </p>
                  
                  <div className="d-flex justify-content-between align-items-center mt-auto">
                    {banner.url_destino ? (
                      <a href={banner.url_destino} target="_blank" rel="noreferrer" className="btn btn-sm btn-light border fw-bold text-primary">
                        Probar Link
                      </a>
                    ) : <span></span>}
                    
                    <button onClick={() => eliminarBanner(banner.id_seccion)} className="btn btn-sm btn-outline-danger border-0" title="Eliminar banner">
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BannersExtranet;