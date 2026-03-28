import React from 'react';
import { Link } from 'react-router-dom';
import { Carousel, Card, Container, Row, Col } from 'react-bootstrap';
import { FiStar } from 'react-icons/fi';
import { mockProductos } from '../mock/productos'; 

function Inicio() {
  
 
  const handleImageError = (e) => {
    e.target.src = "https://via.placeholder.com/500x500.png?text=Foto+No+Disponible";
  };

  return (
    <div>
     
      <Carousel className="carousel-custom" interval={3000}>
        
        
        <Carousel.Item>
          <img
            className="d-block w-100"
            src="https://images.unsplash.com/photo-1583337130417-3346a1be7dee?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
            alt="Perro feliz Verano 2026"
          />
          <div className="carousel-caption-custom">
            <h4>Verano 2026</h4>
            <h1>Lo mejor para tu pequeñín!</h1>
            <p>Artículos de la más alta calidad para aquellas mascotas que nos llenan de felicidad.</p>
            <Link to="/tienda" className="btn-cyan">COMPRA AHORA</Link>
          </div>
        </Carousel.Item>
        
        {/* Slide 2 */}
        <Carousel.Item>
          <img
            className="d-block w-100"
            src="https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?q=80&w=1000&auto=format&fit=crop"
            alt="Alimento Nutri-Pet"
            style={{backgroundColor: '#e3f2fd'}} 
          />
          <div className="carousel-caption-custom">
            <h4>Alimento de Calidad</h4>
            <h1>CROQUETAS CHIDAS <br/> PARA TU MEJOR AMIGO!</h1>
            <p>Delicias para tu mascota / CROQUETAS PREMIUM</p>
            <Link to="/tienda/perro" className="btn-cyan">COMPRAR</Link>
          </div>
        </Carousel.Item>
      </Carousel>

      {/* 2. SECCIÓN EXPLORA NUESTROS PRODUCTOS */}
      <Container className="mt-5 pt-5 pb-5">
        <h2 className="text-center section-title">Explora nuestros productos</h2>
        <Row>
          <Col md={4} className="mb-4">
            <Link to="/tienda/perro" className="text-decoration-none">
              <Card className="category-card text-center">
                <Card.Img variant="top" src="https://images.unsplash.com/photo-1589883661923-6476cb0ae9f2?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" alt="Comida para Perro" />
                <Card.Body>
                  <h4>Alimento Perro</h4>
                </Card.Body>
              </Card>
            </Link>
          </Col>
          
          <Col md={4} className="mb-4">
            <Link to="/tienda/gato" className="text-decoration-none">
              <Card className="category-card text-center">
                <Card.Img variant="top" src="https://images.unsplash.com/photo-1583337130417-3346a1be7dee?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" alt="Comida para Gato" />
                <Card.Body>
                  <h4>Alimento Gato</h4>
                </Card.Body>
              </Card>
            </Link>
          </Col>
          
          <Col md={4} className="mb-4">
            <Link to="/tienda/juguetes" className="text-decoration-none">
              <Card className="category-card text-center">
                <Card.Img variant="top" src="https://images.unsplash.com/photo-1576201836106-db1758fd1c97?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" alt="Juguetes para Mascotas" />
                <Card.Body>
                  <h4>Juguetes para mascotas</h4>
                </Card.Body>
              </Card>
            </Link>
          </Col>
        </Row>
      </Container>

      {/* 3. SECCIÓN LA COMIDA FAVORITA (Mostrando TODOS los productos) */}
      <Container className="mt-5 pb-5">
        <h2 className="text-center section-title">La comida favorita de nuestras mascotas</h2>
        <Row>
          {/* Mapeamos mockProductos completo, sin slice y sin filtros */}
          {mockProductos.map(prod => (
            <Col key={prod.id} lg={3} md={4} sm={6} className="mb-4">
              <Card className="product-card">
                <Card.Img 
                  variant="top" 
                  src={prod.imagen} 
                  alt={prod.nombre} 
                  onError={handleImageError} 
                />
                <Card.Body>
                  <Card.Title>{prod.nombre}</Card.Title>
                  
                  <div className="d-flex align-items-center gap-2 mb-2">
                    {prod.precio_original > prod.precio_final && (
                      <span className="price-original">${prod.precio_original.toFixed(2)}</span>
                    )}
                    <span className="price-final">${prod.precio_final.toFixed(2)}</span>
                  </div>
                  
                  <div className="estrellas">
                    {[...Array(prod.estrellas)].map((_, i) => (
                      <FiStar key={i} />
                    ))}
                  </div>

                  <button className="btn-add-to-cart">AGREGAR AL CARRITO</button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>

      {/* 4. SECCIÓN CONOCE NUESTROS SERVICIOS */}
      <Container className="mt-5 pt-5 pb-5">
        <h2 className="text-center section-title">CONOCE NUESTROS SERVICIOS</h2>
        <Row>
          <Col md={4} className="mb-4">
            <Card className="category-card text-center">
              <Card.Img variant="top" src="https://placehold.co/800x600/2b3243/FFF?text=Estetica+Canina" alt="Estética Canina" />
              <Card.Body>
                <h4>Estética Canina</h4>
                <p className="text-muted">Cortes de pelo, baños y cuidado experto para tu peludo.</p>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={4} className="mb-4">
            <Card className="category-card text-center">
              <Card.Img variant="top" src="https://placehold.co/800x600/2b3243/FFF?text=Servicio+Medico" alt="Servicio Médico" />
              <Card.Body>
                <h4>Servicio Médico</h4>
                <p className="text-muted">Consultas, vacunas y revisiones de salud con nuestros veterinarios.</p>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={4} className="mb-4">
            <Card className="category-card text-center">
              <Card.Img variant="top" src="https://placehold.co/800x600/2b3243/FFF?text=Servicio+Domicilio" alt="Servicio a Domicilio" />
              <Card.Body>
                <h4>Servicio a Domicilio</h4>
                <p className="text-muted">Entregamos tus pedidos y medicamentos en la puerta de tu casa.</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Inicio;