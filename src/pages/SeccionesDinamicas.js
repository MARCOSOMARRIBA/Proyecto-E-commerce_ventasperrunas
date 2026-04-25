import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card } from 'react-bootstrap';

function SeccionesDinamicas() {
  // Estado para guardar las secciones obtenidas de PostgreSQL (simulado aquí)
  const [secciones, setSecciones] = useState([]);

  useEffect(() => {
    // Aquí iría tu fetch al backend de Django para consultar la tabla 'seccion_extranet'
    // simulamos la respuesta de la base de datos:
    const mockSecciones = [
      {
        id_seccion: 1,
        titulo_pagina: "Temporada de Premios",
        imagen_banner: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=1200&q=80",
        texto_bienvenida: "Consiente a tu peludo con nuestros premios 100% naturales.",
        url_destino: "/tienda/premios",
        estatus: true
      }
    ];
    setSecciones(mockSecciones.filter(sec => sec.estatus === true));
  }, []);

  return (
    <Container className="mt-5 mb-5 pb-5 pt-3">
      <h2 className="text-center section-title mb-5">Novedades para tu Mascota</h2>
      
      {secciones.map((seccion) => (
        <Row key={seccion.id_seccion} className="mb-5 align-items-center extranet-banner" style={{ backgroundColor: '#f8f9fa', borderRadius: '15px', overflow: 'hidden' }}>
          <Col md={6} className="p-0">
            <img 
              src={seccion.imagen_banner} 
              alt={seccion.titulo_pagina} 
              style={{ width: '100%', height: '400px', objectFit: 'cover' }} 
            />
          </Col>
          <Col md={6} className="p-5 text-center text-md-start">
            <h1 style={{ color: '#0084ff', fontWeight: 'bold' }}>{seccion.titulo_pagina}</h1>
            <p className="lead mt-3 mb-4">{seccion.texto_bienvenida}</p>
            {seccion.url_destino && (
              <Link to={seccion.url_destino} className="btn-cyan" style={{ padding: '12px 30px', textDecoration: 'none', color: '#fff', backgroundColor: '#2cb1ff', borderRadius: '5px', fontWeight: 'bold' }}>
                DESCUBRIR MÁS
              </Link>
            )}
          </Col>
        </Row>
      ))}
    </Container>
  );
}

export default SeccionesDinamicas;