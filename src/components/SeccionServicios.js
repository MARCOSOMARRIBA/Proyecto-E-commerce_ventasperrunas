import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';

const SeccionServicios = () => {
  const servicios = [
    {
      titulo: "Estética Canina",
      desc: "Cortes de pelo, baños y cuidado experto para tu peludo.",
      img: "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=800&q=80"
    },
    {
      titulo: "Servicio Médico",
      desc: "Consultas, vacunas y revisiones de salud con nuestros veterinarios.",
      img: "https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?auto=format&fit=crop&w=800&q=80"
    },
    {
      titulo: "Servicio a Domicilio",
      desc: "Entregamos tus pedidos y medicamentos en la puerta de tu casa.",
      img: "https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=800&q=80"
    }
  ];

  return (
    <Container className="mt-5 pt-5 pb-5">
      <h2 className="text-center section-title mb-5 fade-in-up">CONOCE NUESTROS SERVICIOS</h2>
      <Row>
        {servicios.map((ser, i) => (
          <Col md={4} key={i} className="mb-4">
            {/* Clases de animación aplicadas: fade-in-up con delay y hover-elevate */}
            <Card className={`category-card text-center border-0 shadow-sm fade-in-up hover-elevate delay-${i}`}>
              <Card.Img 
                variant="top" 
                src={ser.img} 
                alt={ser.titulo} 
                style={{ height: '220px', objectFit: 'cover' }}
              />
              <Card.Body className="p-4">
                <h4 className="fw-bold">{ser.titulo}</h4>
                <p className="text-muted">{ser.desc}</p>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default SeccionServicios;