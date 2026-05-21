import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { useMessage } from "../context/MessageContext";

const CrearUsuarioAdmin = () => {
  const [nuevoRFC, setNuevoRFC] = useState("");
  const [nuevoProveedor, setNuevoProveedor] = useState({
    rfc: "",
    nombre_empresa: "",
    telefono: "",
    correo: "",
    direccion: "",
    activo: true,
  });
  const { user } = useContext(AuthContext);
  const { showMessage } = useMessage();
  const [mostrarModalProveedor, setMostrarModalProveedor] = useState(false);

  const [cargando, setCargando] = useState(false);

  const [passwordGenerada, setPasswordGenerada] = useState(null);

  const [proveedores, setProveedores] = useState([]);
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState("");

  const [formData, setFormData] = useState({
    nombre: "",
    correo: "",
    rol: "2",
  });

  const validarRFC = (rfc) => {
    const limpio = rfc.trim().toUpperCase();

    const regexRFC = /^([A-ZÑ&]{3,4})\d{6}([A-Z\d]{3})$/;

    return regexRFC.test(limpio);
  };

  useEffect(() => {
    const cargarProveedores = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/proveedores/");

        if (res.ok) {
          const data = await res.json();
          console.log("ERROR DJANGO:", data);
          setProveedores(data);
        }
      } catch (error) {
        console.error(error);
      }
    };

    cargarProveedores();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setCargando(true);

    setPasswordGenerada(null);

    try {
      const res = await fetch(
        "http://localhost:8000/api/usuarios/crear-admin/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            ...formData,

            proveedor_rfc: formData.rol === "4" ? proveedorSeleccionado : null,

            id_admin: user.id,
          }),
        },
      );

      const data = await res.json();

      if (res.ok) {
        showMessage({
          title: "Éxito",
          message: data.mensaje,
          type: "success",
        });

        setPasswordGenerada(data.password_temporal);

        setFormData({
          nombre: "",
          correo: "",
          rol: "2",
        });

        setProveedorSeleccionado("");
      } else {
        showMessage({
          title: "Error",
          message: data.error,
          type: "error",
        });
      }
    } catch (error) {
      showMessage({
        title: "Error",
        message: "Fallo la conexión con el servidor",
        type: "error",
      });
    } finally {
      setCargando(false);
    }
  };

  const guardarProveedor = async () => {
    try {
      console.log("PROVEEDOR:", nuevoProveedor);
      console.log("RFC:", nuevoProveedor.rfc);
      console.log("TIPO RFC:", typeof nuevoProveedor.rfc);

      const res = await fetch("http://localhost:8000/api/proveedores/", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          ...nuevoProveedor,
          id_usuario: null,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        showMessage({
          title: "Éxito",
          message: "Proveedor creado correctamente",
          type: "success",
        });

        setMostrarModalProveedor(false);

        setNuevoProveedor({
          rfc: "",
          nombre_empresa: "",
          telefono: "",
          correo: "",
          direccion: "",
          activo: true,
        });

        // RECARGAMOS PROVEEDORES
        const proveedoresRes = await fetch(
          "http://localhost:8000/api/proveedores/",
        );
        const proveedoresData = await proveedoresRes.json();

        setProveedores(proveedoresData);
      } else {
        console.log("ERROR DJANGO:", data);

        showMessage({
          title: "Error",
          message: JSON.stringify(data),
          type: "error",
        });
      }
    } catch (error) {
      console.error(error);

      showMessage({
        title: "Error",
        message: "No se pudo crear el proveedor.",
        type: "error",
      });
    }
  };

  console.log("PROVEEDORES:", proveedores);

  return (
    <div
      className="card shadow-sm border-0 rounded-4 p-4 mt-4 position-relative"
      style={{
        maxWidth: "500px",
        margin: "0 auto",
      }}
    >
      <h4 className="fw-bold mb-4 text-primary">Alta de Nuevo Personal</h4>

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label text-secondary fw-bold small">
            Nombre Completo
          </label>

          <input
            type="text"
            className="form-control bg-light"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
            placeholder="Ej. Juan Pérez"
          />
        </div>

        <div className="mb-3">
          <label className="form-label text-secondary fw-bold small">
            Correo Electrónico
          </label>

          <input
            type="email"
            className="form-control bg-light"
            name="correo"
            value={formData.correo}
            onChange={handleChange}
            required
            placeholder="empleado@ventasperrunas.com"
          />
        </div>

        <div className="mb-3">
          <label className="form-label text-secondary fw-bold small">
            Asignar Rol
          </label>

          <select
            className="form-select bg-light"
            name="rol"
            value={formData.rol}
            onChange={handleChange}
          >
            <option value="2">Empleado (Operaciones)</option>

            <option value="4">Proveedor (Extranet)</option>
          </select>
        </div>

        {formData.rol === "4" && (
          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <label className="form-label text-secondary fw-bold small mb-0">
                Seleccionar proveedor
              </label>

              <button
                type="button"
                className="btn btn-outline-primary rounded-pill"
                onClick={() => setMostrarModalProveedor(true)}
              >
                + Nuevo proveedor
              </button>
            </div>

            <select
              className="form-select"
              value={proveedorSeleccionado}
              onChange={(e) => setProveedorSeleccionado(e.target.value)}
            >
              <option value="">Seleccionar proveedor...</option>

              {proveedores.map((prov) => (
                <option key={prov.rfc} value={prov.rfc}>
                  {prov.nombre_empresa} ({prov.rfc})
                </option>
              ))}
            </select>
          </div>
        )}

        <button
          type="submit"
          className="btn btn-primary w-100 fw-bold rounded-pill mb-3"
          disabled={cargando}
        >
          {cargando ? "Registrando..." : "Crear Usuario"}
        </button>
      </form>

      {mostrarModalProveedor && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 9999,
          }}
        >
          <div
            className="bg-white p-4 rounded-4 shadow"
            style={{ width: "400px" }}
          >
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold m-0">Nuevo proveedor</h5>

              <button
                className="btn-close"
                onClick={() => setMostrarModalProveedor(false)}
              />
            </div>

            <input
              type="text"
              placeholder="RFC"
              className="form-control mb-3"
              value={nuevoProveedor.rfc}
              onChange={(e) =>
                setNuevoProveedor({
                  ...nuevoProveedor,
                  rfc: e.target.value,
                })
              }
            />

            <input
              type="text"
              placeholder="Nombre empresa"
              className="form-control mb-3"
              value={nuevoProveedor.nombre_empresa}
              onChange={(e) =>
                setNuevoProveedor({
                  ...nuevoProveedor,
                  nombre_empresa: e.target.value,
                })
              }
            />

            <input
              type="text"
              placeholder="Teléfono"
              className="form-control mb-3"
              value={nuevoProveedor.telefono}
              onChange={(e) =>
                setNuevoProveedor({
                  ...nuevoProveedor,
                  telefono: e.target.value,
                })
              }
            />

            <input
              type="email"
              placeholder="Correo"
              className="form-control mb-3"
              value={nuevoProveedor.correo}
              onChange={(e) =>
                setNuevoProveedor({
                  ...nuevoProveedor,
                  correo: e.target.value,
                })
              }
            />

            <input
              type="text"
              placeholder="Dirección"
              className="form-control mb-3"
              value={nuevoProveedor.direccion}
              onChange={(e) =>
                setNuevoProveedor({
                  ...nuevoProveedor,
                  direccion: e.target.value,
                })
              }
            />

            <div className="form-check form-switch mb-3">
              <input
                className="form-check-input"
                type="checkbox"
                checked={nuevoProveedor.activo}
                onChange={(e) =>
                  setNuevoProveedor({
                    ...nuevoProveedor,
                    activo: e.target.checked,
                  })
                }
              />

              <label className="form-check-label">Proveedor activo</label>
            </div>

            <button
              className="btn btn-primary w-100"
              onClick={guardarProveedor}
            >
              Guardar proveedor
            </button>
          </div>
        </div>
      )}

      {passwordGenerada && (
        <div
          className="alert alert-success mt-2 border-success bg-success bg-opacity-10 shadow-sm fade-in-up"
          role="alert"
        >
          <h5 className="alert-heading fw-bold text-success mb-2">
            ¡Credenciales Generadas!
          </h5>

          <p className="mb-3 text-dark" style={{ fontSize: "0.9rem" }}>
            Copia esta contraseña temporal y entrégala al nuevo usuario.
            <strong> Por seguridad, no se volverá a mostrar.</strong>
          </p>

          <div className="bg-white p-3 rounded text-center border border-success border-opacity-50">
            <span
              className="fs-3 fw-bold font-monospace text-dark user-select-all"
              style={{ letterSpacing: "2px" }}
            >
              {passwordGenerada}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CrearUsuarioAdmin;
