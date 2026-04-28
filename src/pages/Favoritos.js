import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { FaHeart, FaShoppingCart, FaTrashAlt } from "react-icons/fa";
import { FavoritesContext } from "../context/FavoritesContext";
import { CartContext } from "../context/CartContext";

const Favoritos = () => {
  const { favorites, removeFavorite, clearFavorites } =
    useContext(FavoritesContext);

  const { addToCart } = useContext(CartContext);

  return (
    <main className="favoritos-page">
      <section className="favoritos-header">
        <div>
          <span className="favoritos-tag">
            <FaHeart /> Mis favoritos
          </span>

          <h1>Productos que te gustan</h1>

          <p>
            Aquí puedes guardar productos para revisarlos después o agregarlos
            rápidamente al carrito.
          </p>
        </div>

        {favorites.length > 0 && (
          <button className="favoritos-clear-btn" onClick={clearFavorites}>
            <FaTrashAlt /> Vaciar favoritos
          </button>
        )}
      </section>

      {favorites.length === 0 ? (
        <section className="favoritos-empty">
          <FaHeart />
          <h2>No tienes productos favoritos</h2>
          <p>
            Explora la tienda y presiona el corazón en los productos que quieras
            guardar.
          </p>

          <Link to="/tienda" className="favoritos-empty-btn">
            Ir a la tienda
          </Link>
        </section>
      ) : (
        <section className="favoritos-grid">
          {favorites.map((producto) => (
            <article className="favorito-card" key={producto.id}>
              <Link
                to={`/producto/${producto.id}`}
                className="favorito-img-link"
              >
                <img
                  src={
                    producto.imagen ||
                    "https://placehold.co/500x500?text=Sin+Imagen"
                  }
                  alt={producto.nombre}
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://placehold.co/500x500?text=Sin+Imagen";
                  }}
                />
              </Link>

              <div className="favorito-info">
                <Link
                  to={`/producto/${producto.id}`}
                  className="favorito-nombre"
                >
                  {producto.nombre}
                </Link>

                <p>{producto.descripcion || "Producto para mascotas."}</p>

                <h3>${Number(producto.precio_final || 0).toFixed(2)}</h3>

                <div className="favorito-actions">
                  <button
                    className="favorito-cart-btn"
                    onClick={() => addToCart(producto)}
                  >
                    <FaShoppingCart /> Agregar
                  </button>

                  <button
                    className="favorito-remove-btn"
                    onClick={() => removeFavorite(producto.id)}
                  >
                    <FaTrashAlt />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
};

export default Favoritos;
