import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaShoppingCart,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";

const API_URL = "http://127.0.0.1:8000/api/productos/";

const DetalleProducto = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { addToCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);

  const [producto, setProducto] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargarProducto = async () => {
      try {
        setCargando(true);
        setError("");

        const respuesta = await fetch(`${API_URL}${id}/`);
        const data = await respuesta.json();

        if (!respuesta.ok) {
          throw new Error("No se pudo cargar el producto.");
        }

        setProducto(data);
      } catch (error) {
        console.error(error);
        setError("No se encontró el producto solicitado.");
      } finally {
        setCargando(false);
      }
    };

    cargarProducto();
  }, [id]);

  const agregarAlCarrito = () => {
    if (!producto) return;

    if (!user) {
      alert("Debes iniciar sesión para agregar productos al carrito.");
      navigate("/login");
      return;
    }

    addToCart({
      id: producto.id_producto,
      nombre: producto.nombre,
      imagen: producto.imagen,
      precio_final: Number(producto.precio),
    });

    alert(`${producto.nombre} fue agregado al carrito.`);
  };

  if (cargando) {
    return (
      <main className="detalle-producto-page">
        <div className="detalle-producto-estado">
          <h2>Cargando producto...</h2>
        </div>
      </main>
    );
  }

  if (error || !producto) {
    return (
      <main className="detalle-producto-page">
        <div className="detalle-producto-estado">
          <h2>{error}</h2>
          <button onClick={() => navigate("/")} className="detalle-btn-volver">
            <FaArrowLeft /> Volver al inicio
          </button>
        </div>
      </main>
    );
  }

  const disponible = producto.activo && producto.stock;

  return (
    <main className="detalle-producto-page">
      <button className="detalle-btn-regresar" onClick={() => navigate(-1)}>
        <FaArrowLeft /> Regresar
      </button>

      <section className="detalle-producto-card">
        <div className="detalle-producto-imagen-box">
          <img
            src={
              producto.imagen || "https://placehold.co/600x600?text=Sin+Imagen"
            }
            alt={producto.nombre}
            className="detalle-producto-imagen"
            onError={(e) => {
              e.currentTarget.src =
                "https://placehold.co/600x600?text=Sin+Imagen";
            }}
          />
        </div>

        <div className="detalle-producto-info">
          <span className="detalle-producto-categoria">
            Categoría #{producto.id_categoria}
          </span>

          <h1>{producto.nombre}</h1>

          <p className="detalle-producto-descripcion">
            {producto.descripcion ||
              "Este producto no tiene descripción disponible."}
          </p>

          <p className="detalle-producto-precio">
            ${Number(producto.precio).toFixed(2)}
          </p>

          <div
            className={`detalle-producto-disponibilidad ${disponible ? "disponible" : "no-disponible"}`}
          >
            {disponible ? (
              <>
                <FaCheckCircle /> Producto disponible
              </>
            ) : (
              <>
                <FaTimesCircle /> Producto no disponible
              </>
            )}
          </div>

          <div className="detalle-producto-datos">
            <p>
              <strong>ID del producto:</strong> {producto.id_producto}
            </p>
            <p>
              <strong>Activo para venta:</strong>{" "}
              {producto.activo ? "Sí" : "No"}
            </p>
            <p>
              <strong>Stock:</strong>{" "}
              {producto.stock ? "Disponible" : "Sin disponibilidad"}
            </p>
          </div>

          <button
            className="detalle-btn-carrito"
            onClick={agregarAlCarrito}
            disabled={!disponible}
          >
            <FaShoppingCart />
            {disponible ? "Agregar al carrito" : "No disponible"}
          </button>
        </div>
      </section>
    </main>
  );
};

export default DetalleProducto;
