import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaShoppingCart,
  FaCheckCircle,
  FaTimesCircle,
  FaTruck,
  FaShieldAlt,
  FaHeart,
} from "react-icons/fa";
import { api } from "../api/client";
import { CartContext } from "../context/CartContext";
import {
  getProductImage,
  getProductCategoryId,
  isProductAvailable,
  toCartProduct,
} from "../utils/products";

const DetalleProducto = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);

  const [producto, setProducto] = useState(null);
  const [categoriaNombre, setCategoriaNombre] = useState("Producto para mascotas");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargarProducto = async () => {
      try {
        setCargando(true);
        setError("");

        const [dataProducto, dataCategorias] = await Promise.all([
          api.productos.detail(id),
          api.categorias.list(),
        ]);
        const categoriaId = getProductCategoryId(dataProducto);
        const categoria = dataCategorias.find(
          (item) => String(item.id_categoria) === String(categoriaId),
        );

        setProducto(dataProducto);
        setCategoriaNombre(categoria?.nombre || "Producto para mascotas");
      } catch (err) {
        console.error(err);
        setError(err.message || "No se encontró el producto solicitado.");
      } finally {
        setCargando(false);
      }
    };

    cargarProducto();
  }, [id]);

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

  const disponible = isProductAvailable(producto);

  return (
    <main className="detalle-producto-page">
      <button className="detalle-btn-regresar" onClick={() => navigate(-1)}>
        <FaArrowLeft /> Regresar
      </button>

      <section className="detalle-producto-card">
        <div className="detalle-producto-imagen-box">
          <img
            src={getProductImage(producto, "600x600")}
            alt={producto.nombre}
            className="detalle-producto-imagen"
            onError={(e) => {
              e.currentTarget.src = getProductImage(null, "600x600");
            }}
          />
        </div>

        <div className="detalle-producto-info">
          <span className="detalle-producto-categoria">
            {categoriaNombre}
          </span>

          <h1>{producto.nombre}</h1>

          <p className="detalle-producto-descripcion">
            {producto.descripcion ||
              "Producto seleccionado para el cuidado y bienestar de tu mascota."}
          </p>

          <p className="detalle-producto-precio">
            ${Number(producto.precio || 0).toFixed(2)}
          </p>

          <div
            className={`detalle-producto-disponibilidad ${
              disponible ? "disponible" : "no-disponible"
            }`}
          >
            {disponible ? (
              <>
                <FaCheckCircle /> Disponible para compra
              </>
            ) : (
              <>
                <FaTimesCircle /> No disponible por ahora
              </>
            )}
          </div>

          <div className="detalle-producto-beneficios">
            <div className="detalle-beneficio-item">
              <span>
                <FaTruck />
              </span>
              <div>
                <strong>Entrega práctica</strong>
                <p>Recibe tu pedido o coordina la entrega con la tienda.</p>
              </div>
            </div>

            <div className="detalle-beneficio-item">
              <span>
                <FaShieldAlt />
              </span>
              <div>
                <strong>Compra segura</strong>
                <p>Tu carrito se conserva en este navegador al iniciar sesión.</p>
              </div>
            </div>

            <div className="detalle-beneficio-item">
              <span>
                <FaHeart />
              </span>
              <div>
                <strong>Bienestar para tu mascota</strong>
                <p>Productos pensados para acompañar su cuidado diario.</p>
              </div>
            </div>
          </div>

          <button
            className="detalle-btn-carrito"
            onClick={() => addToCart(toCartProduct(producto))}
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
