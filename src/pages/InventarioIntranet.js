import React, { useState, useEffect } from "react";
import {
  FiLayers,
  FiCheck,
  FiX,
  FiBox,
  FiPlus,
  FiEye,
  FiEyeOff,
  FiEdit,
  FiTrash2,
} from "react-icons/fi";

const InventarioIntranet = () => {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Estados para los Modales
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarModalCategoria, setMostrarModalCategoria] = useState(false);
  const [mostrarModalEditarCategoria, setMostrarModalEditarCategoria] = useState(false);

  const [nuevaCategoria, setNuevaCategoria] = useState({
    nombre: "",
    descripcion: "",
    imagen: "", 
  });

  const [categoriaEditada, setCategoriaEditada] = useState({
    id_categoria: "",
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
      return data.url; 
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

  const cambiarStock = async (idReal, stockActual) => {
    const nuevoStock = !stockActual;
    
    setProductos((prevProductos) =>
      prevProductos.map((p) =>
        (p.id || p.id_producto) === idReal ? { ...p, stock: nuevoStock } : p
      )
    );

    try {
      const res = await fetch(
        `https://proyecto-e-commerce-ventasperrunas.onrender.com/api/productos/${idReal}/`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stock: nuevoStock }),
        }
      );
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error("🚨 Django rechazó el cambio de Stock:", errorData);
        throw new Error("El servidor rechazó el cambio.");
      }
    } catch (error) {
      console.error("Error de red o servidor:", error);
      alert("No se pudo actualizar el stock. Revisa la consola (F12) para ver el error de Django.");
      
      setProductos((prevProductos) =>
        prevProductos.map((p) =>
          (p.id || p.id_producto) === idReal ? { ...p, stock: stockActual } : p
        )
      );
    }
  };

  const cambiarVisibilidad = async (idReal, activoActual) => {
    const nuevoActivo = !activoActual;
    
    setProductos((prevProductos) =>
      prevProductos.map((p) =>
        (p.id || p.id_producto) === idReal ? { ...p, activo: nuevoActivo } : p
      )
    );

    try {
      const res = await fetch(
        `https://proyecto-e-commerce-ventasperrunas.onrender.com/api/productos/${idReal}/`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ activo: nuevoActivo }),
        }
      );
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error("🚨 Django rechazó el cambio de Visibilidad:", errorData);
        throw new Error("El servidor rechazó el cambio.");
      }
    } catch (error) {
      console.error("Error de red o servidor:", error);
      alert("No se pudo actualizar la visibilidad. Revisa la consola (F12) para ver el error de Django.");
      
      setProductos((prevProductos) =>
        prevProductos.map((p) =>
          (p.id || p.id_producto) === idReal ? { ...p, activo: activoActual } : p
        )
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
        alert("El servidor rebotó el producto por esto: " + JSON.stringify(errorData));
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

  const actualizarCategoria = async (e) => {
    e.preventDefault();
    
    if (!categoriaEditada.id_categoria) {
      alert("Por favor, selecciona una categoría para editar.");
      return;
    }

    try {
      const res = await fetch(`https://proyecto-e-commerce-ventasperrunas.onrender.com/api/categorias/${categoriaEditada.id_categoria}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre: categoriaEditada.nombre,
          descripcion: categoriaEditada.descripcion,
          imagen: categoriaEditada.imagen
        }),
      });

      if (res.ok) {
        const categoriaActualizada = await res.json();
        
        setCategorias(categorias.map(cat => 
          cat.id_categoria === categoriaActualizada.id_categoria ? categoriaActualizada : cat
        ));

        setMostrarModalEditarCategoria(false);
        setCategoriaEditada({ id_categoria: "", nombre: "", descripcion: "", imagen: "" });
        alert("Categoría actualizada con éxito.");
      } else {
        const errorData = await res.json();
        console.error("Error de Django:", errorData);
        alert("Error al actualizar la categoría.");
      }
    } catch (error) {
      console.error(error);
      alert("Error de conexión al intentar actualizar.");
    }
  };

  const eliminarCategoria = async () => {
    if (!categoriaEditada.id_categoria) return;

    const confirmacion = window.confirm(
      "¿Estás seguro de que deseas eliminar esta categoría de forma permanente?\n\nNOTA: Si hay productos que actualmente pertenecen a esta categoría, el sistema no te permitirá borrarla."
    );

    if (!confirmacion) return;

    try {
      const res = await fetch(`https://proyecto-e-commerce-ventasperrunas.onrender.com/api/categorias/${categoriaEditada.id_categoria}/`, {
        method: "DELETE",
      });

      if (res.ok) {
        setCategorias(categorias.filter(cat => cat.id_categoria !== categoriaEditada.id_categoria));
        setMostrarModalEditarCategoria(false);
        setCategoriaEditada({ id_categoria: "", nombre: "", descripcion: "", imagen: "" });
        alert("Categoría eliminada exitosamente.");
      } else {
        alert("No se pudo eliminar la categoría. Es muy probable que aún existan productos vinculados a ella. Cambia los productos de categoría primero.");
      }
    } catch (error) {
      console.error(error);
      alert("Error de red al intentar eliminar.");
    }
  };

  // 🔥 SOLUCIÓN AQUÍ: Filtramos nulos para que React no se congele
  const handleSelectCategoriaEditada = (e) => {
    const idSelec = e.target.value;
    if (idSelec === "") {
      setCategoriaEditada({ id_categoria: "", nombre: "", descripcion: "", imagen: "" });
      return;
    }
    
    const catEncontrada = categorias.find(c => c.id_categoria == idSelec);
    if (catEncontrada) {
      setCategoriaEditada({ 
        id_categoria: catEncontrada.id_categoria,
        nombre: catEncontrada.nombre || "",
        descripcion: catEncontrada.descripcion || "",
        imagen: catEncontrada.imagen || "" // Esto previene el error si la BD manda null
      });
    }
  };

  return (
    <div className="p-4 animate__animated animate__fadeIn">
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
            onClick={() => setMostrarModalEditarCategoria(true)}
            className="btn btn-outline-secondary fw-bold shadow-sm px-3"
          >
            <FiEdit className="me-2" />
            Editar Categoría
          </button>

          <button
            onClick={() => setMostrarModalCategoria(true)}
            className="btn btn-outline-dark fw-bold shadow-sm px-3"
          >
            <FiPlus className="me-2" />
            Nueva Categoría
          </button>

          <button
            onClick={() => setMostrarModal(true)}
            className="btn btn-primary fw-bold shadow-sm px-3"
          >
            <FiPlus className="me-2" />
            Añadir Producto
          </button>
        </div>
      </div>

      {/* MODAL PARA AGREGAR PRODUCTO */}
      {mostrarModal && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(3px)", zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="modal-header bg-primary text-white border-0">
                <h5 className="modal-title fw-bold">
                  <FiBox className="me-2" /> Añadir Nuevo Producto
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setMostrarModal(false)}></button>
              </div>
              <form onSubmit={guardarProducto}>
                <div className="modal-body p-4 bg-light">
                  <div className="mb-3">
                    <label className="small fw-bold text-dark">Nombre del Producto</label>
                    <input type="text" className="form-control bg-white" required value={nuevoProducto.nombre || ""} onChange={(e) => setNuevoProducto({ ...nuevoProducto, nombre: e.target.value })} />
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="small fw-bold text-dark">Precio ($)</label>
                      <input type="number" step="0.01" className="form-control bg-white" required value={nuevoProducto.precio || ""} onChange={(e) => setNuevoProducto({ ...nuevoProducto, precio: e.target.value })} />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="small fw-bold text-dark">Categoría</label>
                      <select className="form-select bg-white" required value={nuevoProducto.id_categoria || ""} onChange={(e) => setNuevoProducto({ ...nuevoProducto, id_categoria: e.target.value })}>
                        <option value="">Seleccionar...</option>
                        {categorias.map((cat) => (
                          <option key={cat.id_categoria} value={cat.id_categoria}>{cat.nombre}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="small fw-bold text-dark">Descripción (Opcional)</label>
                    <textarea className="form-control bg-white" rows="2" value={nuevoProducto.descripcion || ""} onChange={(e) => setNuevoProducto({ ...nuevoProducto, descripcion: e.target.value })}></textarea>
                  </div>
                  <div className="mb-3">
                    <label className="small fw-bold text-dark">Imagen del Producto</label>
                    <input type="text" className="form-control bg-light mb-2" readOnly placeholder="Sube una imagen para obtener la URL..." value={nuevoProducto.imagen || ""} />
                    <input type="file" className="form-control" onChange={async (e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const url = await subirImagenACloudinary(file);
                        if (url) {
                          setNuevoProducto({ ...nuevoProducto, imagen: url });
                        } else {
                          alert("Error al subir la imagen. Intenta de nuevo.");
                        }
                      }
                    }} />
                    {nuevoProducto.imagen && (
                      <img src={nuevoProducto.imagen} alt="preview" className="mt-2 rounded" style={{ width: "60px", height: "60px", objectFit: "cover" }} />
                    )}
                  </div>
                </div>
                <div className="modal-footer border-0 bg-white">
                  <button type="button" className="btn btn-light fw-bold" onClick={() => setMostrarModal(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary fw-bold px-4">Guardar Producto</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PARA AGREGAR CATEGORÍA */}
      {mostrarModalCategoria && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(3px)", zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="modal-header bg-dark text-white border-0">
                <h5 className="modal-title fw-bold">
                  <FiLayers className="me-2" /> Nueva Categoría
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setMostrarModalCategoria(false)} />
              </div>
              <form onSubmit={guardarCategoria}>
                <div className="modal-body p-4 bg-light">
                  <div className="mb-3">
                    <label className="small fw-bold text-dark">Nombre de la categoría</label>
                    <input type="text" className="form-control bg-white" required value={nuevaCategoria.nombre || ""} onChange={(e) => setNuevaCategoria({ ...nuevaCategoria, nombre: e.target.value })} />
                  </div>
                  <div>
                    <label className="small fw-bold text-dark">Descripción</label>
                    <textarea className="form-control bg-white" rows="3" value={nuevaCategoria.descripcion || ""} onChange={(e) => setNuevaCategoria({ ...nuevaCategoria, descripcion: e.target.value })} />
                  </div>
                  <div className="mt-3">
                    <label className="small fw-bold text-dark">Imagen de la Categoría</label>
                    <input type="text" className="form-control bg-light mb-2" readOnly placeholder="Sube una imagen para obtener la URL..." value={nuevaCategoria.imagen || ""} />
                    <input type="file" className="form-control" onChange={async (e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const url = await subirImagenACloudinary(file);
                        if (url) {
                          setNuevaCategoria({ ...nuevaCategoria, imagen: url });
                        } else {
                          alert("Error al subir la imagen. Intenta de nuevo.");
                        }
                      }
                    }} />
                    {nuevaCategoria.imagen && (
                      <img src={nuevaCategoria.imagen} alt="preview categoria" className="mt-2 rounded" style={{ width: "60px", height: "60px", objectFit: "cover" }} />
                    )}
                  </div>
                </div>
                <div className="modal-footer border-0 bg-white">
                  <button type="button" className="btn btn-light fw-bold" onClick={() => setMostrarModalCategoria(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-dark fw-bold px-4">Guardar Categoría</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDITAR / ELIMINAR CATEGORÍA */}
      {mostrarModalEditarCategoria && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(3px)", zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="modal-header bg-secondary text-white border-0">
                <h5 className="modal-title fw-bold">
                  <FiEdit className="me-2" /> Editar Categoría Existente
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setMostrarModalEditarCategoria(false)} />
              </div>

              <form onSubmit={actualizarCategoria}>
                <div className="modal-body p-4 bg-light">
                  <div className="mb-4">
                    <label className="small fw-bold text-dark">1. Selecciona la categoría a editar:</label>
                    <select className="form-select border-primary" value={categoriaEditada.id_categoria || ""} onChange={handleSelectCategoriaEditada} required>
                      <option value="">Selecciona una categoría...</option>
                      {categorias.map((cat) => (
                        <option key={cat.id_categoria} value={cat.id_categoria}>{cat.nombre}</option>
                      ))}
                    </select>
                  </div>

                  {categoriaEditada.id_categoria && (
                    <div className="p-3 bg-white border rounded">
                      <div className="mb-3">
                        <label className="small fw-bold text-dark">Nombre</label>
                        <input type="text" className="form-control" value={categoriaEditada.nombre || ""} onChange={(e) => setCategoriaEditada({ ...categoriaEditada, nombre: e.target.value })} />
                      </div>
                      <div className="mb-3">
                        <label className="small fw-bold text-dark">Descripción</label>
                        <textarea className="form-control" rows="2" value={categoriaEditada.descripcion || ""} onChange={(e) => setCategoriaEditada({ ...categoriaEditada, descripcion: e.target.value })} />
                      </div>
                      <div className="mt-3">
                        <label className="small fw-bold text-dark">Imagen de la Categoría</label>
                        <input type="text" className="form-control bg-light mb-2" readOnly placeholder="Sin imagen actualmente..." value={categoriaEditada.imagen || ""} />
                        <input type="file" className="form-control" onChange={async (e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const url = await subirImagenACloudinary(file);
                            if (url) {
                              setCategoriaEditada({ ...categoriaEditada, imagen: url });
                            } else {
                              alert("Error al subir la imagen a Cloudinary.");
                            }
                          }
                        }} />
                        {categoriaEditada.imagen && (
                          <div className="mt-2 text-center">
                            <p className="small text-muted mb-1">Vista previa:</p>
                            <img src={categoriaEditada.imagen} alt="preview edit" className="rounded shadow-sm" style={{ width: "80px", height: "80px", objectFit: "cover" }} />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="modal-footer border-0 bg-white d-flex justify-content-between">
                  <button type="button" className="btn btn-outline-danger fw-bold d-flex align-items-center gap-2" disabled={!categoriaEditada.id_categoria} onClick={eliminarCategoria}>
                    <FiTrash2 /> Eliminar
                  </button>

                  <div>
                    <button type="button" className="btn btn-light fw-bold me-2" onClick={() => setMostrarModalEditarCategoria(false)}>
                      Cancelar
                    </button>
                    <button type="submit" className="btn btn-secondary fw-bold px-4" disabled={!categoriaEditada.id_categoria}>
                      Actualizar
                    </button>
                  </div>
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
                  <td colSpan="5" className="text-center py-5 text-muted">Cargando inventario...</td>
                </tr>
              ) : productos.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-5 text-muted">Aún no hay productos registrados.</td>
                </tr>
              ) : (
                productos.map((prod) => {
                  const idReal = prod.id || prod.id_producto;
                  return (
                    <tr key={idReal}>
                      <td className="ps-4">
                        <div className="d-flex align-items-center gap-3">
                          {prod.imagen ? (
                            <img src={prod.imagen} alt="prod" style={{ width: "45px", height: "45px", objectFit: "cover", borderRadius: "10px" }} />
                          ) : (
                            <div className="bg-light d-flex align-items-center justify-content-center text-muted" style={{ width: "45px", height: "45px", borderRadius: "10px" }}>
                              <FiBox />
                            </div>
                          )}
                          <div>
                            <strong className="d-block text-dark">{prod.nombre}</strong>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge bg-light text-secondary border">
                          {categorias.find(c => c.id_categoria === prod.id_categoria)?.nombre || "Sin Categoría"}
                        </span>
                      </td>
                      <td className="fw-bold text-success">${parseFloat(prod.precio).toLocaleString()}</td>
                      <td className="text-center">
                        <button onClick={() => cambiarStock(idReal, prod.stock)} className={`btn btn-sm px-4 py-2 rounded-pill fw-bold border-0 d-inline-flex align-items-center gap-2 ${prod.stock ? "btn-success bg-opacity-25 text-success" : "btn-danger bg-opacity-25 text-danger"}`} style={{ width: "130px", justifyContent: "center", transition: "all 0.2s ease" }}>
                          {prod.stock ? <><FiCheck size={18} /> En Stock</> : <><FiX size={18} /> Agotado</>}
                        </button>
                      </td>
                      <td className="text-center pe-4">
                        <button onClick={() => cambiarVisibilidad(idReal, prod.activo)} className={`btn btn-sm px-3 py-2 rounded-pill fw-bold border-0 d-inline-flex align-items-center gap-2 ${prod.activo ? "btn-primary text-white shadow-sm" : "btn-light text-secondary border"}`} style={{ width: "120px", justifyContent: "center", transition: "all 0.2s ease" }} title="Decide si el cliente puede verlo en la tienda">
                          {prod.activo ? <><FiEye size={18} /> Visible</> : <><FiEyeOff size={18} /> Oculto</>}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InventarioIntranet;