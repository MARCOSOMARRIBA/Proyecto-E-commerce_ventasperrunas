import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { Carousel, Card, Container, Row, Col, Spinner } from "react-bootstrap";
import { FiStar, FiAlertCircle, FiHeart } from "react-icons/fi";
import SeccionServicios from "../components/SeccionServicios";
import { CartContext } from "../context/CartContext";
import { FavoritesContext } from "../context/FavoritesContext";
import CarruselPromociones from "../components/CarruselPromociones";

function Inicio() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const { addToCart } = useContext(CartContext);
  const { toggleFavorite, isFavorite } = useContext(FavoritesContext);

  useEffect(() => {
    const obtenerProductos = async () => {
      try {
        const respuesta = await fetch("http://127.0.0.1:8000/api/productos/");

        if (!respuesta.ok) {
          throw new Error("No se pudo conectar con el servidor");
        }

        const datos = await respuesta.json();
        setProductos(datos);
      } catch (err) {
        setError(err.message);
      } finally {
        setCargando(false);
      }
    };

    obtenerProductos();
  }, []);

  const agregarAlCarrito = (prod) => {
    addToCart({
      id: prod.id_producto,
      nombre: prod.nombre,
      imagen: prod.imagen,
      precio_final: Number(prod.precio),
    });
  };

  const handleImageError = (e) => {
    e.target.src = "https://via.placeholder.com/500x500.png?text=Sin+Imagen";
  };

  return (
    <div>
  <CarruselPromociones />

      <Container className="mt-5 pb-5">
        <h2 className="text-center section-title mb-5">Nuestros Productos</h2>

        {cargando ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="info" />
            <p className="mt-3 text-muted">Consultando base de datos...</p>
          </div>
        ) : error ? (
          <div className="text-center py-5 text-danger">
            <FiAlertCircle size={40} />
            <p className="mt-2">Error: {error}</p>
          </div>
        ) : (
          <Row>
            {productos.map((prod, i) => {
              const disponible = prod.activo && prod.stock;
              const esFavorito = isFavorite(prod.id_producto);

              return (
                <Col
                  key={prod.id_producto}
                  lg={3}
                  md={4}
                  sm={6}
                  className="mb-4"
                >
                  <Card
                    className={`product-card shadow-sm border-0 fade-in-up delay-${
                      i % 4
                    } hover-elevate position-relative`}
                  >
                    <button
                      type="button"
                      className={`producto-favorito-btn ${
                        esFavorito ? "active" : ""
                      }`}
                      onClick={() => toggleFavorite(prod)}
                      title={
                        esFavorito
                          ? "Quitar de favoritos"
                          : "Guardar en favoritos"
                      }
                    >
                      <FiHeart />
                    </button>

                    <Link
                      to={`/producto/${prod.id_producto}`}
                      className="producto-link-detalle"
                    >
                      <Card.Img
                        variant="top"
                        src={prod.imagen || "https://via.placeholder.com/500"}
                        alt={prod.nombre}
                        onError={handleImageError}
                        style={{ height: "200px", objectFit: "cover" }}
                      />
                    </Link>

                    <Card.Body>
                      <Link
                        to={`/producto/${prod.id_producto}`}
                        className="producto-link-detalle"
                      >
                        <Card.Title className="fw-bold producto-nombre-click">
                          {prod.nombre}
                        </Card.Title>
                      </Link>

                      <h4 className="text-primary fw-bold">
                        ${Number(prod.precio || 0).toFixed(2)}
                      </h4>

                      <div className="estrellas mb-3">
                        {[...Array(5)].map((_, index) => (
                          <FiStar key={index} className="text-warning" />
                        ))}
                      </div>

                      <div className="mb-3">
                        {disponible ? (
                          <span className="badge bg-success">Disponible</span>
                        ) : (
                          <span className="badge bg-secondary">
                            No disponible
                          </span>
                        )}
                      </div>

                      <button
                        className="btn-add-to-cart w-100"
                        onClick={() => agregarAlCarrito(prod)}
                        disabled={!disponible}
                      >
                        {disponible ? "AGREGAR" : "NO DISPONIBLE"}
                      </button>

                      <Link
                        to={`/producto/${prod.id_producto}`}
                        className="btn-ver-detalle-producto mt-2"
                      >
                        Ver información
                      </Link>
                    </Card.Body>
                  </Card>
                </Col>
              );
            })}
          </Row>
        )}
      </Container>

      <div className="bg-light py-2">
        <SeccionServicios />
      </div>
    </div>
  );
}

export default Inicio;
