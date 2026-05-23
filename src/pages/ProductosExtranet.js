import React, { useState, useEffect, useContext } from "react";
import { FiBox, FiPlus, FiTrash2, FiSave, FiX } from "react-icons/fi";
import { useMessage } from "../context/MessageContext";
import { AuthContext } from "../context/AuthContext"; 

const ProductosExtranet = () => {
  const { showMessage } = useMessage();
  const { user } = useContext(AuthContext); 

  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [productoAEliminar, setProductoAEliminar] = useState(null);

  const [nuevoProducto, setNuevoProducto] = useState({
    id_producto: "",
    nombre: "",
    descripcion: "",
    precio: "",
    stock: true,
    imagen: "",
    activo: true,
    id_categoria: "",
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
      return data.url; 
    } catch (error) {
      console.error("Error al subir:", error);
      return null;
    }
  };

  const API_PRODUCTOS = "https://proyecto-e-commerce-ventasperrunas.onrender.com/api/api/productos/";
  const API_CATEGORIAS = "https://proyecto-e-commerce-ventasperrunas.onrender.com/api/categorias/";

  useEffect(() => {
    cargarDatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]); 

  const cargarDatos = async () => {
    if (!user) return; 

    try {
      setCargando(true);

      // 🚀 INYECTAMOS ROL Y RFC DE MANERA SEGURA PARA EL FILTRO
      const rfcSeguro = user?.rfc || "";
      const urlProductosFiltrada = `${API_PRODUCTOS}?rol=${user.rol}&rfc=${rfcSeguro}`;

      const [resProds, resCat] = await Promise.all([
        fetch(urlProductosFiltrada),
        fetch(API_CATEGORIAS),
      ]);

      if (!resProds.ok) {
        throw new Error("No se pudieron cargar los productos.");
      }

      if (!resCat.ok) {
        throw new Error("No se pudieron cargar las categorías.");
      }

      const dataProductos = await resProds.json();
      const dataCategorias = await resCat.json();

      setProductos(dataProductos);
      setCategorias(dataCategorias);
    } catch (error) {
      console.error("Error al cargar la base de datos:", error);

      showMessage({
        title: "Error al cargar datos",
        message: error.message || "No se pudieron cargar los productos o categorías desde el servidor.",
        type: "error",
      });
    } finally {
      setCargando(false);
    }
  };

  const limpiarFormulario = () => {
    setNuevoProducto({
      id_producto: "",
      nombre: "",
      descripcion: "",
      precio: "",
      stock: true,
      imagen: "",
      activo: true,
      id_categoria: "",
    });
  };

  const validarProducto = () => {
    const idLimpio = String(nuevoProducto.id_producto).trim();

    if (!/^\d{13}$/.test(idLimpio)) {
      showMessage({
        title: "ID inválido",
        message: "El ID del producto debe tener exactamente 13 dígitos.",
        type: "warning",
      });
      return false;
    }

    if (nuevoProducto.nombre.trim() === "") {
      showMessage({
        title: "Nombre requerido",
        message: "Debes escribir el nombre del producto.",
        type: "warning",
      });
      return false;
    }

    if (Number(nuevoProducto.precio) < 0 || nuevoProducto.precio === "") {
      showMessage({
        title: "Precio inválido",
        message: "Debes escribir un precio válido mayor o igual a 0.",
        type: "warning",
      });
      return false;
    }

    if (!nuevoProducto.id_categoria) {
      showMessage({
        title: "Categoría requerida",
        message: "Debes seleccionar una categoría para el producto.",
        type: "warning",
      });
      return false;
    }

    return true;
  };

  const manejarEnvio = async (e) => {
    e.preventDefault();

    if (!validarProducto()) return;

    // 🔥 BLOQUEO DE SEGURIDAD: Validamos que el RFC no esté vacío en caché
    if (String(user?.rol) === "4" && !user?.rfc) {
      showMessage({
        title: "Error de Sesión",
        message: "Tu cuenta no tiene un RFC asignado en la sesión. Por favor, cierra sesión y vuelve a entrar.",
        type: "error",
      });
      return;
    }

    try {
      const rfcSeguro = user?.rfc || "";
      const productoParaEnviar = {
        ...nuevoProducto,
        id_producto: Number(nuevoProducto.id_producto),
        precio: Number(nuevoProducto.precio),
        id_categoria: Number(nuevoProducto.id_categoria),
        // 🚀 ENVIAMOS EL RFC EN AMBOS FORMATOS PARA QUE DJANGO NO FALLE
        rfc: rfcSeguro, 
        rfc_id: rfcSeguro
      };

      console.log("📦 PAYLOAD A DJANGO:", productoParaEnviar);

      const res = await fetch(API_PRODUCTOS, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productoParaEnviar),
      });

      if (res.ok) {
        showMessage({
          title: "Producto agregado",
          message: "El producto fue agregado al catálogo correctamente.",
          type: "success",
        });

        setMostrarFormulario(false);
        limpiarFormulario();
        cargarDatos();
      } else {
        const errorData = await res.json();
        showMessage({
          title: "Error al guardar",
          message: errorData.error || errorData.detail || JSON.stringify(errorData, null, 2),
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error al enviar:", error);
      showMessage({
        title: "Error de conexión",
        message: "No se pudo conectar con el servidor para guardar el producto.",
        type: "error",
      });
    }
  };

  const pedirConfirmacionEliminar = (producto) => {
    setProductoAEliminar(producto);
  };

  const cancelarEliminacion = () => {
    setProductoAEliminar(null);
  };

  const confirmarEliminacion = async () => {
    if (!productoAEliminar) return;

    try {
      const res = await fetch(
        `${API_PRODUCTOS}${productoAEliminar.id_producto}/`,
        {
          method: "PATCH", // Cambiamos DELETE por PATCH
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ activo: false }), // Lo ocultamos
        }
      );

      if (res.ok) {
        // Lo quitamos de la vista actual
        setProductos((prevProductos) =>
          prevProductos.filter((p) => p.id_producto !== productoAEliminar.id_producto)
        );

        showMessage({
          title: "Producto desactivado",
          message: "El producto fue retirado del catálogo, pero se mantiene en el historial de pedidos.",
          type: "success",
        });

        setProductoAEliminar(null);
      } else {
        showMessage({
          title: "Error",
          message: "No se pudo actualizar el estado del producto.",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error al eliminar (desactivar):", error);

      showMessage({
        title: "Error de conexión",
        message: "No se pudo conectar con el servidor.",
        type: "error",
      });
    }
  };

  const obtenerNombreCategoria = (idCat) => {
    const categoria = categorias.find((c) => String(c.id_categoria) === String(idCat));
    return categoria ? categoria.nombre : "Sin Categoría";
  };

  return (
    <div className="p-4 animate__animated animate__fadeIn">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold m-0 d-flex align-items-center gap-2 text-dark">
            <FiBox className="text-primary" /> Catálogo de Productos
          </h2>
          <p className="text-muted small m-0">
            Gestiona los artículos, precios y disponibilidad.
          </p>
        </div>

        <button
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
          className="btn btn-primary fw-bold shadow-sm"
        >
          {mostrarFormulario ? (
            <>
              <FiX className="me-2" /> Cancelar
            </>
          ) : (
            <>
              <FiPlus className="me-2" /> Agregar Producto
            </>
          )}
        </button>
      </div>

      {mostrarFormulario && (
        <div className="card border-0 shadow-sm rounded-4 mb-4 bg-light">
          <div className="card-body p-4">
            <h5 className="fw-bold mb-3 text-primary">
              Detalles del Nuevo Producto
            </h5>

            <form onSubmit={manejarEnvio} className="row g-3">
              <div className="col-md-3">
                <label className="fw-bold small text-muted">ID Producto</label>
                <input
                  type="text"
                  maxLength="13"
                  className="form-control border-2"
                  required
                  placeholder="13 dígitos"
                  value={nuevoProducto.id_producto}
                  onChange={(e) =>
                    setNuevoProducto({
                      ...nuevoProducto,
                      id_producto: e.target.value.replace(/\D/g, ""),
                    })
                  }
                />
              </div>

              <div className="col-md-5">
                <label className="fw-bold small text-muted">Nombre del Producto</label>
                <input
                  type="text"
                  className="form-control border-2"
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

              <div className="col-md-2">
                <label className="fw-bold small text-muted">Precio ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="form-control border-2"
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

              <div className="col-md-2">
                <label className="fw-bold small text-muted">Categoría</label>
                <select
                  className="form-select border-2"
                  required
                  value={nuevoProducto.id_categoria}
                  onChange={(e) =>
                    setNuevoProducto({
                      ...nuevoProducto,
                      id_categoria: e.target.value,
                    })
                  }
                >
                  <option value="">Seleccione...</option>
                  {categorias.map((c) => (
                    <option key={c.id_categoria} value={c.id_categoria}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-8">
                <label className="fw-bold small text-muted">Descripción Corta</label>
                <input
                  type="text"
                  className="form-control border-2"
                  value={nuevoProducto.descripcion}
                  onChange={(e) =>
                    setNuevoProducto({
                      ...nuevoProducto,
                      descripcion: e.target.value,
                    })
                  }
                />
              </div>

              <div className="mb-3">
                <label className="small fw-bold text-dark">Imagen del Producto</label>
                
                <input 
                  type="text" 
                  className="form-control bg-light mb-2" 
                  readOnly 
                  placeholder="Sube una imagen para obtener la URL..." 
                  value={nuevoProducto.imagen} 
                />

                <input 
                  type="file" 
                  className="form-control" 
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const url = await subirImagenACloudinary(file);
                      if (url) {
                        setNuevoProducto({...nuevoProducto, imagen: url});
                      } else {
                        alert("Error al subir la imagen. Intenta de nuevo.");
                      }
                    }
                  }} 
                />
                
                {nuevoProducto.imagen && (
                  <img src={nuevoProducto.imagen} alt="preview" className="mt-2 rounded" style={{width: '60px', height: '60px', objectFit: 'cover'}} />
                )}
              </div>

              <div className="col-md-12 d-flex gap-4 mt-3">
                <div className="form-check form-switch fs-6">
                  <input
                    className="form-check-input cursor-pointer"
                    type="checkbox"
                    checked={nuevoProducto.stock}
                    onChange={(e) =>
                      setNuevoProducto({
                        ...nuevoProducto,
                        stock: e.target.checked,
                      })
                    }
                  />
                  <label className="form-check-label ms-2 mt-1">
                    ¿Tiene Stock?
                  </label>
                </div>

                <div className="form-check form-switch fs-6">
                  <input
                    className="form-check-input cursor-pointer"
                    type="checkbox"
                    checked={nuevoProducto.activo}
                    onChange={(e) =>
                      setNuevoProducto({
                        ...nuevoProducto,
                        activo: e.target.checked,
                      })
                    }
                  />
                  <label className="form-check-label ms-2 mt-1">
                    Visible en tienda
                  </label>
                </div>
              </div>

              <div className="col-12 text-end mt-4">
                <button type="submit" className="btn btn-success px-4 fw-bold">
                  <FiSave className="me-2" /> Guardar Producto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-body p-0 overflow-auto">
          
          {/* 🔥 ENVOLTURA RESPONSIVA PARA CELULARES */}
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0 bg-white" style={{ minWidth: "800px" }}>
              <thead className="bg-dark text-white small">
                <tr>
                  <th className="ps-4 py-3">ID</th>
                  <th>PRODUCTO</th>
                  <th>CATEGORÍA</th>
                  <th>PRECIO</th>
                  <th>ESTADO</th>
                  <th className="text-center pe-4">ACCIONES</th>
                </tr>
              </thead>

              <tbody>
                {cargando ? (
                  <tr>
                    <td colSpan="6" className="text-center py-5">
                      Sincronizando inventario...
                    </td>
                  </tr>
                ) : productos.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-5 text-muted">
                      No hay productos registrados en la base de datos.
                    </td>
                  </tr>
                ) : (
                  productos.map((prod) => (
                    <tr key={prod.id_producto}>
                      <td className="ps-4 text-muted small">
                        #{prod.id_producto}
                      </td>

                      <td>
                        <div className="d-flex align-items-center gap-3">
                          {prod.imagen ? (
                            <img
                              src={prod.imagen}
                              alt={prod.nombre}
                              style={{
                                width: "40px",
                                height: "40px",
                                objectFit: "cover",
                                borderRadius: "8px",
                              }}
                            />
                          ) : (
                            <div
                              className="bg-light d-flex align-items-center justify-content-center text-muted"
                              style={{
                                width: "40px",
                                height: "40px",
                                borderRadius: "8px",
                              }}
                            >
                              <FiBox />
                            </div>
                          )}

                          <div>
                            <strong className="d-block text-dark">
                              {prod.nombre}
                            </strong>
                            <span className="text-muted small">
                              {prod.descripcion || "Sin descripción"}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="badge bg-secondary rounded-pill">
                          {obtenerNombreCategoria(prod.id_categoria)}
                        </span>
                      </td>

                      <td className="fw-bold text-success">
                        ${parseFloat(prod.precio || 0).toLocaleString()}
                      </td>

                      <td>
                        {prod.stock ? (
                          <span className="text-primary fw-bold small">
                            <span className="text-success">●</span> En Stock
                          </span>
                        ) : (
                          <span className="text-danger fw-bold small">
                            ● Agotado
                          </span>
                        )}
                      </td>

                      <td className="text-center pe-4">
                        <button
                          onClick={() => pedirConfirmacionEliminar(prod)}
                          className="btn btn-sm btn-outline-danger border-0"
                          title="Eliminar producto"
                        >
                          <FiTrash2 />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {/* 🔥 FIN ENVOLTURA RESPONSIVA */}
          
        </div>
      </div>

      {productoAEliminar && (
        <div className="custom-confirm-backdrop">
          <div className="custom-confirm-box">
            <div className="custom-confirm-icon">
              <FiTrash2 />
            </div>

            <h3>Eliminar producto</h3>

            <p>
              ¿Estás seguro de eliminar{" "}
              <strong>{productoAEliminar.nombre}</strong>?
            </p>

            <div className="custom-confirm-actions">
              <button
                type="button"
                className="custom-confirm-cancel"
                onClick={cancelarEliminacion}
              >
                Cancelar
              </button>

              <button
                type="button"
                className="custom-confirm-delete"
                onClick={confirmarEliminacion}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductosExtranet;