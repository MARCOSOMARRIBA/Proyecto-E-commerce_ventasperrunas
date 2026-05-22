import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useMessage } from "../context/MessageContext";
import {
  FiImage,
  FiPlus,
  FiTrash2,
  FiSend,
  FiLink,
  FiPower,
} from "react-icons/fi";

const BannersEmpleado = () => {
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

  const subirImagenACloudinary = async (file) => {
    console.log("📸 Archivo seleccionado:", file); // <--- ¿Aparece esto en la consola?

    const formData = new FormData();
    formData.append("imagen", file);

    try {
      const res = await fetch("https://proyecto-e-commerce-ventasperrunas.onrender.com//api/subir-imagen/", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      console.log("📩 Respuesta del servidor:", data); // <--- ¿Qué dice esto?

      if (res.ok) {
        setNuevoBanner((prev) => ({ ...prev, imagen_banner: data.url }));
        return data.url;
      } else {
        console.error("❌ Error de Django:", data);
      }
    } catch (error) {
      console.error("❌ Error de red (¿está encendido el backend?):", error);
    }
  };

  const API_URL = "https://proyecto-e-commerce-ventasperrunas.onrender.com//api/secciones-extranet/";

  useEffect(() => {
    cargarBanners();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const cargarBanners = async () => {
    if (!user) return;
    try {
      setCargando(true);
      const res = await fetch(`${API_URL}?rol=${user.rol}`);
      if (res.ok) {
        const data = await res.json();
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
    if (
      !nuevoBanner.titulo_pagina.trim() ||
      !nuevoBanner.imagen_banner.trim()
    ) {
      showMessage({
        title: "Faltan datos",
        message: "Llena el título y la imagen.",
        type: "warning",
      });
      return;
    }

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...nuevoBanner,
          id_usuario: user?.id || "ADM0000000001",
          portal_destino: user?.rol || "3",
        }),
      });

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
          title: "Éxito",
          message: "Banner de Intranet creado.",
          type: "success",
        });
      } else {
        // 🔥 MEJORA: Leer el error exacto de Django si falla
        const errorData = await res.json();
        console.error("Django rechazó la creación:", errorData);
        showMessage({
          title: "Error del servidor",
          message: "No se pudo crear. Revisa la consola.",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error al guardar:", error);
    }
  };

  const toggleEstatusBanner = async (banner) => {
    const nuevoEstatus = !banner.estatus;
    setBanners(
      banners.map((b) =>
        b.id_seccion === banner.id_seccion
          ? { ...b, estatus: nuevoEstatus }
          : b,
      ),
    );
    try {
      const res = await fetch(
        `${API_URL}${banner.id_seccion}/?rol=${user?.rol}&id_usuario=${user?.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ estatus: nuevoEstatus }),
        },
      );
      if (!res.ok) throw new Error("Fallo en la actualización");
    } catch (error) {
      // Si falla, revertimos el botón visualmente
      setBanners(
        banners.map((b) =>
          b.id_seccion === banner.id_seccion
            ? { ...b, estatus: banner.estatus }
            : b,
        ),
      );
      showMessage({
        title: "Error",
        message: "No se pudo cambiar el estatus.",
        type: "error",
      });
    }
  };

  const confirmarEliminacion = async () => {
    if (!bannerAEliminar) return;
    try {
      const res = await fetch(
        `${API_URL}${bannerAEliminar.id_seccion}/?rol=${user?.rol}&id_usuario=${user?.id}`,
        {
          method: "DELETE",
        },
      );

      // 🔥 CORRECCIÓN: Django REST Framework devuelve 204 (No Content) en los DELETE exitosos
      if (res.ok || res.status === 204) {
        setBanners(
          banners.filter((b) => b.id_seccion !== bannerAEliminar.id_seccion),
        );
        setBannerAEliminar(null);
        showMessage({
          title: "Eliminado",
          message: "Banner eliminado correctamente.",
          type: "success",
        });
      } else {
        console.error("Error devuelto por Django al intentar eliminar.");
        showMessage({
          title: "Error",
          message: "No se pudo eliminar el banner.",
          type: "error",
        });
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
            <FiImage className="text-primary" /> Banners Administrativos
            (Intranet)
          </h2>
          <p className="text-muted small m-0">
            Gestiona los banners exclusivos para administradores.
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
            <h5 className="fw-bold mb-3">Crear Nuevo Banner Admin</h5>
            <form onSubmit={manejarEnvio} className="row g-3">
              <div className="col-md-6">
                <label className="form-label fw-bold small text-muted">
                  TÍTULO
                </label>
                <input
                  type="text"
                  className="form-control border-2"
                  required
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
                <label className="form-label fw-bold small text-muted">
                  URL DE LA IMAGEN (Auto-generada)
                </label>
                {/* Este input ahora es de tipo TEXTO para que veas que la URL ya se cargó */}
                <input
                  type="text"
                  className="form-control border-2 bg-light"
                  readOnly
                  value={nuevoBanner.imagen_banner}
                  placeholder="Espera a que cargue la imagen..."
                />

                <label className="mt-2 small text-muted">
                  Subir nueva imagen:
                </label>
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
          <h5 className="text-muted fw-bold">No hay banners en la Intranet</h5>
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
                  }}
                  className="w-100 position-relative"
                >
                  {!banner.estatus && (
                    <span className="position-absolute top-0 end-0 m-2 badge bg-danger">
                      <FiPower /> Apagado
                    </span>
                  )}
                </div>
                <div className="card-body d-flex flex-column">
                  <h5 className="fw-bold text-truncate">
                    {banner.titulo_pagina}
                  </h5>
                  <div className="d-flex justify-content-between align-items-center mt-auto pt-3 border-top">
                    <div className="form-check form-switch m-0 p-0 d-flex align-items-center gap-2">
                      <input
                        className="form-check-input m-0 cursor-pointer shadow-none"
                        type="checkbox"
                        role="switch"
                        checked={banner.estatus}
                        onChange={() => toggleEstatusBanner(banner)}
                      />
                      <span className="small fw-bold text-muted">
                        {banner.estatus ? "Visible" : "Oculto"}
                      </span>
                    </div>
                    <button
                      onClick={() => setBannerAEliminar(banner)}
                      className="btn btn-sm btn-outline-danger border-0"
                    >
                      <FiTrash2 size={18} />
                    </button>
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
            <h3>Eliminar banner</h3>
            <div className="custom-confirm-actions">
              <button
                type="button"
                className="custom-confirm-cancel"
                onClick={() => setBannerAEliminar(null)}
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

export default BannersEmpleado;
