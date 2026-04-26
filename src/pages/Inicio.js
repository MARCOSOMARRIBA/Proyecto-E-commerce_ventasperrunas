import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Carousel, Card, Container, Row, Col, Spinner } from "react-bootstrap";
import { FiStar, FiAlertCircle } from "react-icons/fi";
import SeccionServicios from "../components/SeccionServicios";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";

function Inicio() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const { addToCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);

  const navigate = useNavigate();

  // EFECTO PARA TRAER PRODUCTOS REALES DE POSTGRESQL
  useEffect(() => {
    const obtenerProductos = async () => {
      try {
        const respuesta = await fetch("http://127.0.0.1:8000/api/productos/");
        if (!respuesta.ok)
          throw new Error("No se pudo conectar con el servidor");
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
    if (!user) {
      alert("Debes iniciar sesión para agregar productos al carrito.");
      navigate("/login");
      return;
    }

    addToCart({
      id: prod.id_producto,
      nombre: prod.nombre,
      imagen: prod.imagen,
      precio_final: Number(prod.precio),
    });

    alert(`${prod.nombre} fue agregado al carrito.`);
  };

  const handleImageError = (e) => {
    e.target.src = "https://via.placeholder.com/500x500.png?text=Sin+Imagen";
  };

  return (
    <div>
      {/* CAROUSEL */}
      <Carousel className="carousel-custom" interval={3000}>
        <Carousel.Item>
          <img
            className="d-block w-100"
            src="https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=1920&q=80"
            alt="Slide 1"
          />
          <div className="carousel-caption-custom">
            <h1>¡Lo mejor para tu pequeñín!</h1>
            <Link to="/tienda" className="btn-cyan">
              COMPRA AHORA
            </Link>
          </div>
        </Carousel.Item>

        <Carousel.Item>
          <img
            className="d-block w-100"
            src="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=1920&q=80"
            alt="Gato mirando"
          />
          <div className="carousel-caption-custom">
            <h1>Todo para consentir a tu michi</h1>
            <Link to="/tienda" className="btn-cyan">
              VER CATÁLOGO
            </Link>
          </div>
        </Carousel.Item>
      </Carousel>

      {/* SECCIÓN DE PRODUCTOS DESDE POSTGRESQL */}
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

              return (
                <Col
                  key={prod.id_producto}
                  lg={3}
                  md={4}
                  sm={6}
                  className="mb-4"
                >
                  <Card
                    className={`product-card shadow-sm border-0 fade-in-up delay-${i % 4} hover-elevate`}
                  >
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
                        {[...Array(5)].map((_, i) => (
                          <FiStar key={i} className="text-warning" />
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

      {/* 🐾 SECCIÓN DE SERVICIOS (Solo aquí en Inicio) */}
      <div className="bg-light py-2">
        <SeccionServicios />
      </div>
    </div>
  );
}

export default Inicio;
