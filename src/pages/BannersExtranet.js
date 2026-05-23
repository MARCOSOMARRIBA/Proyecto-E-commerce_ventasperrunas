import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useMessage } from "../context/MessageContext";
import { FiImage, FiPlus, FiTrash2, FiSend, FiLink, FiPower } from "react-icons/fi";

const BannersExtranet = () => {
  const { user } = useContext(AuthContext);
  const { showMessage } = useMessage();

  const [banners, setBanners] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [cargando, setCargando] = useState(true);

  const [bannerAEliminar, setBannerAEliminar] = useState(null);

  const [nuevoBanner, setNuevoBanner] = useState({
    titulo_pagina: "",
    imagen_banner: "",
    texto_bienvenida: "",
    url_destino: "",
    estatus: true,
  });

  const API_URL = "https://proyecto-e-commerce-ventasperrunas.onrender.com/api/secciones-extranet/";

  useEffect(() => {
    cargarBanners();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

const subirImagenACloudinary = async (file) => {
  console.log("📸 Archivo seleccionado:", file); // <--- ¿Aparece esto en la consola?
  
  const formData = new FormData();
  formData.append("imagen", file);

  try {
    const res = await fetch("https://proyecto-e-commerce-ventasperrunas.onrender.com/api/subir-imagen/", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    console.log("📩 Respuesta del servidor:", data); // <--- ¿Qué dice esto?

    if (res.ok) {
      setNuevoBanner(prev => ({ ...prev, imagen_banner: data.url }));
      return data.url;
    } else {
      console.error("❌ Error de Django:", data);
    }
  } catch (error) {
    console.error("❌ Error de red (¿está encendido el backend?):", error);
  }
};

  const cargarBanners = async () => {
    if (!user) return; // Esperamos a que el usuario exista
    try {
      setCargando(true);
      // 🔥 MAGIA 1: Le mandamos el rol y el ID exacto del proveedor para que vea SOLO los suyos
      const res = await fetch(`${API_URL}?rol=${user.rol}&id_usuario=${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setBanners(data);
      } else {
        showMessage({
          title: "Error al cargar banners",
          message: "No se pudieron obtener las promociones desde el servidor.",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error al cargar banners:", error);
      showMessage({
        title: "Error de conexión",
        message: "No se pudo conectar con el servidor para cargar los banners.",
        type: "error",
      });
    } finally {
      setCargando(false);
    }
  };

  const manejarEnvio = async (e) => {
    e.preventDefault();

    if (!nuevoBanner.titulo_pagina.trim()) {
      showMessage({
        title: "Título requerido",
        message: "Debes escribir un título para la promoción.",
        type: "warning",
      });
      return;
    }

    if (!nuevoBanner.imagen_banner.trim()) {
      showMessage({
        title: "Imagen requerida",
        message: "Debes agregar la URL de la imagen del banner.",
        type: "warning",
      });
      return;
    }

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...nuevoBanner,
          // 🔥 MAGIA 2: Envío correcto de credenciales a Django
          // ✅ Lo correcto: Toma el ID real de tu AuthContext
          id_usuario: user?.id,
          portal_destino: user?.rol || "4",
        }),
      });

      // 🔥 MAGIA 3: Soporte para código 201 (Created)
      if (res.ok || res.status === 201) {
        setMostrarFormulario(false);
        setNuevoBanner({
          titulo_pagina: "",
          imagen_banner: "",
          texto_bienvenida: "",
          url_destino: "",
          estatus: true,
        });

        cargarBanners();

        showMessage({
          title: "Promoción creada",
          message: "El banner promocional fue creado correctamente.",
          type: "success",
        });
      } else {
        // 🔥 Leer el error exacto si la imagen es muy larga u otro fallo
        const errorData = await res.json();
        console.error("Django rechazó la creación:", JSON.stringify(errorData));
        showMessage({
          title: "Error de Servidor",
          message: "Revisa la consola para ver qué dato rechazó la base de datos.",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error al guardar:", error);
      showMessage({
        title: "Error de conexión",
        message: "No se pudo guardar el banner promocional.",
        type: "error",
      });
    }
  };

  const toggleEstatusBanner = async (banner) => {
    const nuevoEstatus = !banner.estatus;
    setBanners(banners.map(b => b.id_seccion === banner.id_seccion ? { ...b, estatus: nuevoEstatus } : b));

    try {
      const res = await fetch(`${API_URL}${banner.id_seccion}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ estatus: nuevoEstatus }),
      });

      if (!res.ok) {
        setBanners(banners.map(b => b.id_seccion === banner.id_seccion ? { ...b, estatus: banner.estatus } : b));
        showMessage({
          title: "Error al actualizar",
          message: "No se pudo cambiar el estado de la promoción.",
          type: "error",
        });
      } else {
        showMessage({
          title: nuevoEstatus ? "Banner Activado" : "Banner Desactivado",
          message: `El banner ahora está ${nuevoEstatus ? 'visible' : 'oculto'} en la tienda principal.`,
          type: "success",
        });
      }
    } catch (error) {
      console.error("Error al actualizar estatus:", error);
      setBanners(banners.map(b => b.id_seccion === banner.id_seccion ? { ...b, estatus: banner.estatus } : b));
      showMessage({
        title: "Error de conexión",
        message: "Hubo un problema de red al intentar actualizar el banner.",
        type: "error",
      });
    }
  };

  const pedirConfirmacionEliminar = (banner) => {
    setBannerAEliminar(banner);
  };

  const cancelarEliminacion = () => {
    setBannerAEliminar(null);
  };

  const confirmarEliminacion = async () => {
    if (!bannerAEliminar) return;

    try {
      const res = await fetch(`${API_URL}${bannerAEliminar.id_seccion}/`, {
        method: "DELETE",
      });

      // 🔥 MAGIA 4: Manejo de código 204 (No Content) para eliminación limpia
      if (res.ok || res.status === 204) {
        setBanners((prevBanners) =>
          prevBanners.filter(
            (b) => b.id_seccion !== bannerAEliminar.id_seccion,
          ),
        );

        showMessage({
          title: "Promoción eliminada",
          message: "El banner fue eliminado correctamente.",
          type: "success",
        });

        setBannerAEliminar(null);
      } else {
        showMessage({
          title: "Error al eliminar",
          message: "No se pudo eliminar la promoción seleccionada.",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error al eliminar:", error);
      showMessage({
        title: "Error de conexión",
        message: "No se pudo conectar con el servidor para eliminar el banner.",
        type: "error",
      });
    }
  };

  return (
    <div className="p-4 animate__animated animate__fadeIn">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold m-0 d-flex align-items-center gap-2 text-dark">
            <FiImage className="text-primary" /> Gestión de Promociones
          </h2>
          <p className="text-muted small m-0">
            Crea y administra los banners que verán los usuarios
          </p>
        </div>

        <button
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
          className="btn btn-primary fw-bold shadow-sm"
        >
          {mostrarFormulario ? (
            "Cancelar"
          ) : (
            <>
              <FiPlus className="me-2" /> Nuevo Banner
            </>
          )}
        </button>
      </div>

      {mostrarFormulario && (
        <div className="card border-0 shadow-sm rounded-4 mb-4 bg-light">
          <div className="card-body p-4">
            <h5 className="fw-bold mb-3">Crear Nueva Promoción</h5>

            <form onSubmit={manejarEnvio} className="row g-3">
              <div className="col-md-6">
                <label className="form-label fw-bold small text-muted">
                  TÍTULO
                </label>
                <input
                  type="text"
                  className="form-control border-2"
                  required
                  placeholder="Ej. Promo Croquetas"
                  value={nuevoBanner.titulo_pagina}
                  onChange={(e) =>
                    setNuevoBanner({
                      ...nuevoBanner,
                      titulo_pagina: e.target.value,
                    })
                  }
                />
              </div>

<div className="col-md-6">
  <label className="form-label fw-bold small text-muted">URL DE LA IMAGEN (Auto-generada)</label>
  {/* Este input ahora es de tipo TEXTO para que veas que la URL ya se cargó */}
  <input 
    type="text" 
    className="form-control border-2 bg-light" 
    readOnly 
    value={nuevoBanner.imagen_banner} 
    placeholder="Espera a que cargue la imagen..." 
  />
  
  <label className="mt-2 small text-muted">Subir nueva imagen:</label>
  <input 
    type="file" 
    className="form-control"
    onChange={(e) => subirImagenACloudinary(e.target.files[0])} 
  />
</div>

              <div className="col-md-12">
                <label className="form-label fw-bold small text-muted">
                  TEXTO PROMOCIONAL
                </label>
                <textarea
                  className="form-control border-2"
                  rows="2"
                  value={nuevoBanner.texto_bienvenida}
                  onChange={(e) =>
                    setNuevoBanner({
                      ...nuevoBanner,
                      texto_bienvenida: e.target.value,
                    })
                  }
                />
              </div>

              <div className="col-md-8">
                <label className="form-label fw-bold small text-muted">
                  ENLACE DE DESTINO
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-white border-2">
                    <FiLink />
                  </span>
                  <input
                    type="text"
                    className="form-control border-2"
                    placeholder="/api/productos/ofertas"
                    value={nuevoBanner.url_destino}
                    onChange={(e) =>
                      setNuevoBanner({
                        ...nuevoBanner,
                        url_destino: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="col-md-4 d-flex align-items-end">
                <div className="form-check form-switch fs-5 mb-2">
                  <input
                    className="form-check-input cursor-pointer"
                    type="checkbox"
                    role="switch"
                    checked={nuevoBanner.estatus}
                    onChange={(e) =>
                      setNuevoBanner({
                        ...nuevoBanner,
                        estatus: e.target.checked,
                      })
                    }
                  />
                  <label className="form-check-label ms-2 fs-6 mt-1">
                    Banner Activo
                  </label>
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

      {cargando ? (
        <div className="text-center py-5 text-muted">Cargando banners...</div>
      ) : banners.length === 0 ? (
        <div className="text-center py-5 bg-white rounded-4 shadow-sm">
          <FiImage size={40} className="text-muted opacity-50 mb-3" />
          <h5 className="text-muted fw-bold">No hay banners activos</h5>
          <p className="text-muted small">
            Crea uno nuevo para que aparezca en la tienda.
          </p>
        </div>
      ) : (
        <div className="row g-4">
          {banners.map((banner) => (
            <div className="col-md-6 col-lg-4" key={banner.id_seccion}>
              <div className="card border-0 shadow-sm rounded-4 h-100 overflow-hidden">
                <div
                  style={{
                    height: "180px",
                    backgroundImage: `url(${banner.imagen_banner})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundColor: "#e9ecef",
                    opacity: banner.estatus ? 1 : 0.5,
                    transition: "opacity 0.3s ease"
                  }}
                  className="w-100 position-relative"
                >
                  {!banner.estatus && (
                    <span className="position-absolute top-0 end-0 m-2 badge bg-danger d-flex align-items-center gap-1">
                      <FiPower /> Apagado
                    </span>
                  )}
                </div>

                <div className="card-body d-flex flex-column">
                  <h5 className={`fw-bold text-truncate ${banner.estatus ? 'text-dark' : 'text-muted'}`}>
                    {banner.titulo_pagina}
                  </h5>

                  <p
                    className="text-muted small mb-3"
                    style={{
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {banner.texto_bienvenida}
                  </p>

                  <div className="d-flex justify-content-between align-items-center mt-auto pt-3 border-top">
                    <div className="form-check form-switch m-0 p-0 d-flex align-items-center gap-2" title="Encender/Apagar en la tienda">
                      <input
                        className="form-check-input m-0 cursor-pointer shadow-none"
                        type="checkbox"
                        role="switch"
                        checked={banner.estatus}
                        onChange={() => toggleEstatusBanner(banner)}
                        style={{ width: '2.5em', height: '1.2em' }}
                      />
                      <span className={`small fw-bold ${banner.estatus ? 'text-success' : 'text-muted'}`}>
                        {banner.estatus ? 'Visible' : 'Oculto'}
                      </span>
                    </div>

                    <div className="d-flex gap-2">
                      {banner.url_destino && (
                        <a
                          href={banner.url_destino}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-sm btn-light border fw-bold text-primary"
                          title="Probar enlace"
                        >
                          <FiLink />
                        </a>
                      )}

                      <button
                        onClick={() => pedirConfirmacionEliminar(banner)}
                        className="btn btn-sm btn-outline-danger border-0"
                        title="Eliminar banner"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {bannerAEliminar && (
        <div className="custom-confirm-backdrop">
          <div className="custom-confirm-box">
            <div className="custom-confirm-icon">
              <FiTrash2 />
            </div>

            <h3>Eliminar promoción</h3>

            <p>
              ¿Estás seguro de eliminar{" "}
              <strong>{bannerAEliminar.titulo_pagina}</strong>?
            </p>

            <div className="custom-confirm-actions">
              <button
                type="button"
                className="custom-confirm-cancel"
                onClick={cancelarEliminacion}
              >
                Cancelar
              </button>

              <button
                type="button"
                className="custom-confirm-delete"
                onClick={confirmarEliminacion}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BannersExtranet;