import React, { useContext } from 'react';
import { CartContext } from '../context/CartContext';
import { Link } from 'react-router-dom';

function Carrito() {
  const { cart, removeFromCart, updateQuantity, getCartTotal } = useContext(CartContext);

  return (
    <div className="container mt-5 mb-5 pb-5 pt-3">
      
      {/* Banner superior */}
      <div className="cart-banner">
        <h2>¡Si a tu mascota quieres mimar, a Ventas Perrunas tienes que llegar!</h2>
        <img src="https://images.vexels.com/media/users/3/298815/isolated/preview/a108df1e0dbb3a2cd7de385317b9b1e7-golden-retriever-dog-sitting-character.png" alt="Mascotas" />
      </div>

      {/* Contenedor principal del carrito */}
      <div className="cart-container">
        <div className="cart-header">
          <h2>Mi carrito</h2>
        </div>

        <div className="cart-body">
          {cart.length === 0 ? (
            <div className="text-center py-5">
              <h4>Tu carrito está vacío 🐶</h4>
              <Link to="/" className="btn btn-pagar mt-3 text-decoration-none">Volver a la tienda</Link>
            </div>
          ) : (
            <>
              {/* Etiquetas de columna */}
              <div className="row cart-labels d-none d-md-flex text-center">
                <div className="col-5 text-start">Descripcion</div>
                <div className="col-3">Cantidad</div>
                <div className="col-2">Precio</div>
                <div className="col-2">Eliminar</div>
              </div>

              {/* Lista de productos */}
              {cart.map((item) => (
                <div className="row cart-item text-center align-items-center" key={item.id}>
                  
                  {/* Imagen y descripción */}
                  <div className="col-12 col-md-5 d-flex align-items-center text-start mb-3 mb-md-0">
                    <img src={item.imagen} alt={item.nombre} />
                    <span style={{ fontWeight: '600', fontSize: '0.95rem' }}>{item.nombre}</span>
                  </div>

                  {/* Controles de cantidad */}
                  <div className="col-4 col-md-3 cart-controls">
                    <button onClick={() => updateQuantity(item.id, 1)}>+</button>
                    <span className="mx-2" style={{ fontWeight: '600' }}>{item.cantidad}</span>
                    <button onClick={() => updateQuantity(item.id, -1)}>-</button>
                  </div>

                  {/* Precio */}
                  <div className="col-4 col-md-2" style={{ fontWeight: '600' }}>
                    $ {(item.precio_final * item.cantidad).toFixed(2)}
                  </div>

                  {/* Botón eliminar (X) */}
                  <div className="col-4 col-md-2">
                    <button className="cart-delete" onClick={() => removeFromCart(item.id)}>X</button>
                  </div>
                </div>
              ))}

              {/* Footer del Total */}
              <div className="cart-footer">
                <h5 className="fw-bold mb-2">Total compra</h5>
                <h4 className="fw-bold mb-3">$ {getCartTotal().toFixed(2)}</h4>
                <button className="btn-pagar">Pagar</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Carrito;