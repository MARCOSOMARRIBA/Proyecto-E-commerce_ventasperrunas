import React, { useContext, useState } from "react";
import { CartContext } from "../context/CartContext";
import { Link } from "react-router-dom";
import SimuladorCobro from "../components/SimuladorCobro";

function Carrito() {
  const { cart, cartReady, removeFromCart, incrementQuantity, getCartTotal } =
    useContext(CartContext);

  const [mostrarCobro, setMostrarCobro] = useState(false);

  // 🔥 Evita render antes de cargar
  if (!cartReady) {
    return <div className="text-center mt-5">Cargando carrito...</div>;
  }

  return (
    <div className="container mt-5 mb-5 pb-5 pt-3">
      {/* Banner */}
      <div className="cart-banner">
        <div className="cart-banner-content">
          <span className="cart-badge">🛒 Ventas Perrunas</span>

          <h2>Tu carrito de compras</h2>

          <p>
            Revisa tus productos favoritos y finaliza tu compra de forma rápida
            y segura.
          </p>
        </div>

        <img
          src="https://images.vexels.com/media/users/3/298815/isolated/preview/a108df1e0dbb3a2cd7de385317b9b1e7-golden-retriever-dog-sitting-character.png"
          alt="Mascotas"
        />
      </div>

      <div className="cart-container">
        <div className="cart-header">
          <h2>Mi carrito</h2>
        </div>

        <div className="cart-body">
          {cart.length === 0 ? (
            <div className="empty-cart">
              <div className="empty-cart-icon">🐾</div>

              <h3>Tu carrito aún está vacío</h3>

              <p>
                Descubre alimentos, juguetes y accesorios para consentir a tu
                mascota.
              </p>

              <Link to="/" className="btn-pagar text-decoration-none">
                Explorar productos
              </Link>
            </div>
          ) : (
            <>
              {/* Labels */}
              <div className="row cart-labels d-none d-md-flex text-center">
                <div className="col-5 text-start">Descripción</div>
                <div className="col-3">Cantidad</div>
                <div className="col-2">Precio</div>
                <div className="col-2">Eliminar</div>
              </div>

              {/* Items */}
              {cart.map((item) => (
                <div
                  className="row cart-item text-center align-items-center"
                  key={item.id}
                >
                  <div className="col-12 col-md-5 d-flex align-items-center text-start mb-3 mb-md-0">
                    <img
                      src={
                        item.imagen ||
                        "https://via.placeholder.com/500x500.png?text=Sin+Imagen"
                      }
                      alt={item.nombre}
                    />

                    <span style={{ fontWeight: "600", fontSize: "0.95rem" }}>
                      {item.nombre}
                    </span>
                  </div>

                  {/* Cantidad */}
                  <div className="col-4 col-md-3 cart-controls">
                    <button
                      onClick={() => incrementQuantity(item.id, -1)}
                      disabled={item.cantidad <= 1}
                    >
                      -
                    </button>

                    <span className="mx-2 fw-bold">{item.cantidad}</span>

                    <button
                      onClick={() => incrementQuantity(item.id, 1)}
                      disabled={item.cantidad >= item.stock}
                    >
                      +
                    </button>
                  </div>

                  {/* Precio */}
                  <div className="col-4 col-md-2 fw-bold">
                    $ {(item.precio * item.cantidad).toFixed(2)}
                  </div>

                  {/* Eliminar */}
                  <div className="col-4 col-md-2">
                    <button
                      className="cart-delete"
                      onClick={() => removeFromCart(item.id)}
                    >
                      X
                    </button>
                  </div>
                </div>
              ))}

              {/* Total */}
              <div className="cart-footer">
                <h5 className="fw-bold mb-2">Total compra</h5>

                <h4 className="fw-bold mb-3">$ {getCartTotal().toFixed(2)}</h4>

                <button
                  className="btn-pagar"
                  onClick={() => setMostrarCobro(!mostrarCobro)}
                >
                  {mostrarCobro ? "Ocultar cobro" : "Pagar"}
                </button>
              </div>

              {/* Cobro */}
              {mostrarCobro && <SimuladorCobro />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Carrito;
