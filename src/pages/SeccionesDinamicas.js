import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap";
import axios from "axios";

function SeccionesDinamicas() {
  const [secciones, setSecciones] = useState([]);

  useEffect(() => {
    obtenerSecciones();
  }, []);

  const obtenerSecciones = async () => {
    try {
      const response = await axios.get(
        "http://127.0.0.1:8000/api/extranet/banners/",
      );

      const seccionesActivas = response.data.filter(
        (sec) => sec.estatus === true,
      );

      setSecciones(seccionesActivas);
    } catch (error) {
      console.error("Error al obtener banners:", error);
    }
  };

  return (
    <Container className="mt-5 mb-5 pb-5 pt-3">
      <h2 className="text-center section-title mb-5">
        Novedades para tu Mascota
      </h2>

      {secciones.map((seccion) => (
        <Row
          key={seccion.id_seccion}
          className="mb-5 align-items-center extranet-banner"
          style={{
            backgroundColor: "#f8f9fa",
            borderRadius: "15px",
            overflow: "hidden",
          }}
        >
          <Col md={6} className="p-0">
            <img
              src={seccion.imagen_banner}
              alt={seccion.titulo_pagina}
              style={{
                width: "100%",
                height: "400px",
                objectFit: "cover",
              }}
            />
          </Col>

          <Col md={6} className="p-5 text-center text-md-start">
            <h1
              style={{
                color: "#0084ff",
                fontWeight: "bold",
              }}
            >
              {seccion.titulo_pagina}
            </h1>

            <p className="lead mt-3 mb-4">{seccion.texto_bienvenida}</p>

            {seccion.url_destino && (
              <Link
                to={seccion.url_destino}
                className="btn-cyan"
                style={{
                  padding: "12px 30px",
                  textDecoration: "none",
                  color: "#fff",
                  backgroundColor: "#2cb1ff",
                  borderRadius: "5px",
                  fontWeight: "bold",
                }}
              >
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
