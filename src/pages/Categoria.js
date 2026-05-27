import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Categorias() {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("https://proyecto-e-commerce-ventasperrunas.onrender.com/api/categorias/")
      .then((res) => res.json())
      .then((data) => {
        setCategorias(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error cargando categorías:", err);
        setLoading(false);
      });
  }, []);

  // 🔥 FUNCIÓN INTELIGENTE PARA LAS IMÁGENES
  const obtenerUrlImagen = (imagen) => {
    // Si la categoría no tiene imagen, mostramos un placeholder
    if (!imagen) return "https://via.placeholder.com/400x300.png?text=Sin+Imagen";
    
    // Si la imagen viene de Cloudinary (empieza con http), la usamos directo
    if (imagen.startsWith("http")) return imagen;
    
    // Si es una imagen vieja guardada en el servidor de Django, le pegamos la URL de Render
    return `https://proyecto-e-commerce-ventasperrunas.onrender.com/media/${imagen}`;
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-warning"></div>
        <p>Cargando categorías...</p>
      </div>
    );
  }

  return (
    <div className="container mt-5 mb-5">
      <h2 className="mb-4 text-white">Categorías</h2>

      <div className="row">
        {categorias.map((cat) => (
          <div key={cat.id_categoria} className="col-md-4 mb-4">
            <div
              className="card categoria-card h-100 shadow-sm"
              onClick={() => navigate(`/tienda?categoria=${cat.id_categoria}`)}
              style={{ cursor: "pointer", transition: "transform 0.2s" }}
            >
              {/* 🔥 AQUÍ USAMOS LA NUEVA FUNCIÓN Y LE DAMOS ESTILO PARA QUE NO SE DEFORME */}
              <img
                src={obtenerUrlImagen(cat.imagen)}
                className="card-img-top"
                alt={cat.nombre}
                style={{ height: "200px", objectFit: "cover" }}
              />

              <div className="card-body">
                <h5 className="card-title fw-bold">{cat.nombre}</h5>
                <p className="card-text text-muted">{cat.descripcion}</p>
              </div>

              <div className="card-footer bg-white border-0 text-end pb-3">
                <span className="text-warning fw-bold">Ver productos →</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Categorias;