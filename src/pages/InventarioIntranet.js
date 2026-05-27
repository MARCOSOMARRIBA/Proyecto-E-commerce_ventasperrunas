import React, { useState, useEffect } from "react";
import {
  FiLayers,
  FiCheck,
  FiX,
  FiBox,
  FiPlus,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";

const InventarioIntranet = () => {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Estados para el Modal de Agregar Producto
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarModalCategoria, setMostrarModalCategoria] = useState(false);

  // 🔥 1. Agregamos el campo 'imagen' al estado inicial
  const [nuevaCategoria, setNuevaCategoria] = useState({
    nombre: "",
    descripcion: "",
    imagen: "", 
  });
  
  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    imagen: "",
    id_categoria: "",
    stock: true,
    activo: true,
  });

  const subirImagenACloudinary = async (file) => {
    const formData = new FormData();
    formData.append("imagen", file);
    try {
      const res = await fetch("https://proyecto-e-commerce-ventasperrunas.onrender.com/api/subir-imagen/", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      return data.url; // Retorna la URL para guardarla en el estado
    } catch (error) {
      console.error("Error al subir:", error);
      return null;
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [resProd, resCat] = await Promise.all([
        fetch("https://proyecto-e-commerce-ventasperrunas.onrender.com/api/productos/"),
        fetch("https://proyecto-e-commerce-ventasperrunas.onrender.com/api/categorias/"),
      ]);

      if (resProd.ok) setProductos(await resProd.json());
      if (resCat.ok) setCategorias(await resCat.json());
    } catch (error) {
      console.error("Error cargando inventario:", error);
    } finally {
      setCargando(false);
    }
  };

  const cambiarStock = async (id_producto, stockActual) => {
    const nuevoStock = !stockActual;
    setProductos(
      productos.map((p) =>
        p.id_producto === id_producto ? { ...p, stock: nuevoStock } : p,
      ),
    );

    try {
      const res = await fetch(
        `https://proyecto-e-commerce-ventasperrunas.onrender.com/api/productos/${id_producto}/`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stock: nuevoStock }),
        }
      );
      if (!res.ok) throw new Error("Fallo en BD");
    } catch (error) {
      alert("Error al actualizar el stock en la base de datos.");
      setProductos(
        productos.map((p) =>
          p.id_producto === id_producto ? { ...p, stock: stockActual } : p,
        ),
      );
    }
  };

  const cambiarVisibilidad = async (id_producto, activoActual) => {
    const nuevoActivo = !activoActual;
    setProductos(
      productos.map((p) =>
        p.id_producto === id_producto ? { ...p, activo: nuevoActivo } : p,
      ),
    );

    try {
      const res = await fetch(
        `https://proyecto-e-commerce-ventasperrunas.onrender.com/api/productos/${id_producto}/`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ activo: nuevoActivo }),
        }
      );
      if (!res.ok) throw new Error("Fallo en BD");
    } catch (error) {
      alert("Error al actualizar la visibilidad en la base de datos.");
      setProductos(
        productos.map((p) =>
          p.id_producto === id_producto ? { ...p, activo: activoActual } : p,
        ),
      );
    }
  };

  const guardarProducto = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("https://proyecto-e-commerce-ventasperrunas.onrender.com/api/productos/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevoProducto),
      });

      if (res.ok) {
        setMostrarModal(false);
        setNuevoProducto({
          nombre: "",
          descripcion: "",
          precio: "",
          imagen: "",
          id_categoria: "",
          stock: true,
          activo: true,
        });
        cargarDatos();
      } else {
        const errorData = await res.json();
        console.error("Error detallado de Django:", errorData);
        alert(
          "El servidor rebotó el producto por esto: " +
            JSON.stringify(errorData),
        );
      }
    } catch (error) {
      console.error("Error al guardar:", error);
    }
  };

  const guardarCategoria = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("https://proyecto-e-commerce-ventasperrunas.onrender.com/api/categorias/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(nuevaCategoria),
      });

      if (res.ok) {
        const categoriaCreada = await res.json();

        setCategorias([...categorias, categoriaCreada]);

        // 🔥 2. Limpiamos también la imagen al terminar
        setNuevaCategoria({
          nombre: "",
          descripcion: "",
          imagen: "",
        });

        setMostrarModalCategoria(false);
      } else {
        const errorData = await res.json();
        alert("Error al crear categoría: " + JSON.stringify(errorData));
      }
    } catch (error) {
      console.error(error);
      alert("Error de conexión");
    }
  };

  return (
    <div className="p-4 animate__animated animate__fadeIn">
      {/* HEADER DE LA PANTALLA */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold m-0 d-flex align-items-center gap-2 text-dark">
            <FiLayers className="text-primary" /> Control de Stock y Catálogo
          </h2>
          <p className="text-muted small m-0">
            Gestiona la disponibilidad y añade nuevos productos a la tienda.
          </p>
        </div>
        <div className="d-flex gap-2">
          <button
            onClick={() => setMostrarModalCategoria(true)}
            className="btn btn-outline-dark fw-bold shadow-sm px-4"
          >
            <FiPlus className="me-2" />
            Nueva Categoría
          </button>

          <button
            onClick={() => setMostrarModal(true)}
            className="btn btn-primary fw-bold shadow-sm px-4"
          >
            <FiPlus className="me-2" />
            Añadir Producto
          </button>
        </div>
      </div>

      {/* MODAL PARA AGREGAR PRODUCTO */}
      {mostrarModal && (
        <div
          className="modal show d-block"
          style={{
            backgroundColor: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(3px)",
            zIndex: 1050,
          }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="modal-header bg-primary text-white border-0">
                <h5 className="modal-title fw-bold">
                  <FiBox className="me-2" /> Añadir Nuevo Producto
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setMostrarModal(false)}
                ></button>
              </div>
              <form onSubmit={guardarProducto}>
                <div className="modal-body p-4 bg-light">
                  <div className="mb-3">
                    <label className="small fw-bold text-dark">
                      Nombre del Producto
                    </label>
                    <input
                      type="text"
                      className="form-control bg-white"
                      required
                      value={nuevoProducto.nombre}
                      onChange={(e) =>
                        setNuevoProducto({
                          ...nuevoProducto,
                          nombre: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="small fw-bold text-dark">
                        Precio ($)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        className="form-control bg-white"
                        required
                        value={nuevoProducto.precio}
                        onChange={(e) =>
                          setNuevoProducto({
                            ...nuevoProducto,
                            precio: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="small fw-bold text-dark">
                        Categoría
                      </label>
                      <select
                        className="form-select bg-white"
                        required
                        value={nuevoProducto.id_categoria}
                        onChange={(e) =>
                          setNuevoProducto({
                            ...nuevoProducto,
                            id_categoria: e.target.value,
                          })
                        }
                      >
                        <option value="">Seleccionar...</option>
                        {categorias.map((cat) => (
                          <option
                            key={cat.id_categoria}
                            value={cat.id_categoria}
                          >
                            {cat.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="small fw-bold text-dark">
                      Descripción (Opcional)
                    </label>
                    <textarea
                      className="form-control bg-white"
                      rows="2"
                      value={nuevoProducto.descripcion}
                      onChange={(e) =>
                        setNuevoProducto({
                          ...nuevoProducto,
                          descripcion: e.target.value,
                        })
                      }
                    ></textarea>
                  </div>
                  <div className="mb-3">
                    <label className="small fw-bold text-dark">
                      Imagen del Producto
                    </label>

                    {/* Input donde se guardará la URL automáticamente */}
                    <input
                      type="text"
                      className="form-control bg-light mb-2"
                      readOnly
                      placeholder="Sube una imagen para obtener la URL..."
                      value={nuevoProducto.imagen}
                    />

                    {/* Input de archivo para el usuario */}
                    <input
                      type="file"
                      className="form-control"
                      onChange={async (e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const url = await subirImagenACloudinary(file);
                          if (url) {
                            setNuevoProducto({ ...nuevoProducto, imagen: url });
                          } else {
                            alert(
                              "Error al subir la imagen. Intenta de nuevo.",
                            );
                          }
                        }
                      }}
                    />

                    {/* Vista previa pequeña para confirmar */}
                    {nuevoProducto.imagen && (
                      <img
                        src={nuevoProducto.imagen}
                        alt="preview"
                        className="mt-2 rounded"
                        style={{
                          width: "60px",
                          height: "60px",
                          objectFit: "cover",
                        }}
                      />
                    )}
                  </div>
                </div>
                <div className="modal-footer border-0 bg-white">
                  <button
                    type="button"
                    className="btn btn-light fw-bold"
                    onClick={() => setMostrarModal(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary fw-bold px-4"
                  >
                    Guardar Producto
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PARA AGREGAR CATEGORÍA */}
      {mostrarModalCategoria && (
        <div
          className="modal show d-block"
          style={{
            backgroundColor: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(3px)",
            zIndex: 1050,
          }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="modal-header bg-dark text-white border-0">
                <h5 className="modal-title fw-bold">
                  <FiLayers className="me-2" />
                  Nueva Categoría
                </h5>

                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setMostrarModalCategoria(false)}
                />
              </div>

              <form onSubmit={guardarCategoria}>
                <div className="modal-body p-4 bg-light">
                  <div className="mb-3">
                    <label className="small fw-bold text-dark">
                      Nombre de la categoría
                    </label>

                    <input
                      type="text"
                      className="form-control bg-white"
                      required
                      value={nuevaCategoria.nombre}
                      onChange={(e) =>
                        setNuevaCategoria({
                          ...nuevaCategoria,
                          nombre: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="small fw-bold text-dark">
                      Descripción
                    </label>

                    <textarea
                      className="form-control bg-white"
                      rows="3"
                      value={nuevaCategoria.descripcion}
                      onChange={(e) =>
                        setNuevaCategoria({
                          ...nuevaCategoria,
                          descripcion: e.target.value,
                        })
                      }
                    />
                  </div>

                  {/* 🔥 3. Agregamos el sistema de subida de imagen para Categoría */}
                  <div className="mt-3">
                    <label className="small fw-bold text-dark">
                      Imagen de la Categoría
                    </label>

                    <input
                      type="text"
                      className="form-control bg-light mb-2"
                      readOnly
                      placeholder="Sube una imagen para obtener la URL..."
                      value={nuevaCategoria.imagen}
                    />

                    <input
                      type="file"
                      className="form-control"
                      onChange={async (e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const url = await subirImagenACloudinary(file);
                          if (url) {
                            setNuevaCategoria({ ...nuevaCategoria, imagen: url });
                          } else {
                            alert(
                              "Error al subir la imagen. Intenta de nuevo.",
                            );
                          }
                        }
                      }}
                    />

                    {nuevaCategoria.imagen && (
                      <img
                        src={nuevaCategoria.imagen}
                        alt="preview categoria"
                        className="mt-2 rounded"
                        style={{
                          width: "60px",
                          height: "60px",
                          objectFit: "cover",
                        }}
                      />
                    )}
                  </div>
                </div>

                <div className="modal-footer border-0 bg-white">
                  <button
                    type="button"
                    className="btn btn-light fw-bold"
                    onClick={() => setMostrarModalCategoria(false)}
                  >
                    Cancelar
                  </button>

                  <button type="submit" className="btn btn-dark fw-bold px-4">
                    Guardar Categoría
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* TABLA PRINCIPAL */}
      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-body p-0 overflow-auto">
          <table className="table table-hover align-middle mb-0 bg-white">
            <thead className="bg-dark text-white small">
              <tr>
                <th className="ps-4 py-3">PRODUCTO</th>
                <th>CATEGORÍA</th>
                <th>PRECIO</th>
                <th className="text-center">DISPONIBILIDAD (STOCK)</th>
                <th className="text-center pe-4">VISIBLE EN WEB</th>
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr>
                  <td colSpan="5" className="text-center py-5 text-muted">
                    Cargando inventario...
                  </td>
                </tr>
              ) : productos.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-5 text-muted">
                    Aún no hay productos registrados.
                  </td>
                </tr>
              ) : (
                productos.map((prod) => (
                  <tr key={prod.id_producto}>
                    {/* INFO PRODUCTO */}
                    <td className="ps-4">
                      <div className="d-flex align-items-center gap-3">
                        {prod.imagen ? (
                          <img
                            src={prod.imagen}
                            alt="prod"
                            style={{
                              width: "45px",
                              height: "45px",
                              objectFit: "cover",
                              borderRadius: "10px",
                            }}
                          />
                        ) : (
                          <div
                            className="bg-light d-flex align-items-center justify-content-center text-muted"
                            style={{
                              width: "45px",
                              height: "45px",
                              borderRadius: "10px",
                            }}
                          >
                            <FiBox />
                          </div>
                        )}
                        <div>
                          <strong className="d-block text-dark">
                            {prod.nombre}
                          </strong>
                          <small className="text-muted">
                            ID: #{prod.id_producto}
                          </small>
                        </div>
                      </div>
                    </td>

                    {/* CATEGORÍA Y PRECIO */}
                    <td>
                      <span className="badge bg-light text-secondary border">
                        Cat: {prod.id_categoria}
                      </span>
                    </td>
                    <td className="fw-bold text-success">
                      ${parseFloat(prod.precio).toLocaleString()}
                    </td>

                    {/* SWITCH DE STOCK */}
                    <td className="text-center">
                      <button
                        onClick={() =>
                          cambiarStock(prod.id_producto, prod.stock)
                        }
                        className={`btn btn-sm px-4 py-2 rounded-pill fw-bold border-0 d-inline-flex align-items-center gap-2 ${prod.stock ? "btn-success bg-opacity-25 text-success" : "btn-danger bg-opacity-25 text-danger"}`}
                        style={{
                          width: "130px",
                          justifyContent: "center",
                          transition: "all 0.2s ease",
                        }}
                      >
                        {prod.stock ? (
                          <>
                            <FiCheck size={18} /> En Stock
                          </>
                        ) : (
                          <>
                            <FiX size={18} /> Agotado
                          </>
                        )}
                      </button>
                    </td>

                    {/* SWITCH DE VISIBILIDAD */}
                    <td className="text-center pe-4">
                      <button
                        onClick={() =>
                          cambiarVisibilidad(prod.id_producto, prod.activo)
                        }
                        className={`btn btn-sm px-3 py-2 rounded-pill fw-bold border-0 d-inline-flex align-items-center gap-2 ${prod.activo ? "btn-primary text-white shadow-sm" : "btn-light text-secondary border"}`}
                        style={{
                          width: "120px",
                          justifyContent: "center",
                          transition: "all 0.2s ease",
                        }}
                        title="Decide si el cliente puede verlo en la tienda"
                      >
                        {prod.activo ? (
                          <>
                            <FiEye size={18} /> Visible
                          </>
                        ) : (
                          <>
                            <FiEyeOff size={18} /> Oculto
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InventarioIntranet;