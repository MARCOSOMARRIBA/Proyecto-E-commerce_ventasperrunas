import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Categorias() {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://https://proyecto-e-commerce-ventasperrunas.onrender.com/api/categorias/")
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
              className="card categoria-card h-100"
              onClick={() => navigate(`/tienda?categoria=${cat.id_categoria}`)}
              style={{ cursor: "pointer" }}
            >
              <img
                src={`http://https://proyecto-e-commerce-ventasperrunas.onrender.com/media/${cat.imagen}`}
                className="card-img-top"
                alt={cat.nombre}
              />

              <div className="card-body">
                <h5 className="card-title">{cat.nombre}</h5>
                <p className="card-text text-muted">{cat.descripcion}</p>
              </div>

              <div className="card-footer text-end">
                <span className="text-warning">Ver productos →</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Categorias;
