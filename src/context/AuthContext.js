import React, { createContext, useState } from "react";
import { useMessage } from "./MessageContext";

export const AuthContext = createContext();

const USER_STORAGE_KEY = "usuarioMascotas";

export const AuthProvider = ({ children }) => {
  const { showMessage } = useMessage();

  const [user, setUser] = useState(() => {
    const usuarioGuardado = localStorage.getItem(USER_STORAGE_KEY);

    if (usuarioGuardado) {
      try {
        return JSON.parse(usuarioGuardado);
      } catch (error) {
        localStorage.removeItem(USER_STORAGE_KEY);
        return null;
      }
    }

    return null;
  });

  // --- CONEXIÓN REAL AL BACKEND PARA INICIO DE SESIÓN ---
  const loginReal = async (credentials) => {
    try {
      const respuesta = await fetch("http://127.0.0.1:8000/api/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          correo: credentials.email,
          contrasena: credentials.password,
        }),
      });

      const datosBackend = await respuesta.json();

      if (respuesta.ok) {
        const nombreParaAvatar = datosBackend.nombre_usuario || "V P";
        const iniciales = nombreParaAvatar.substring(0, 2).toUpperCase();

        const avatarUrl = `https://ui-avatars.com/api/?name=${iniciales}&background=0D8ABC&color=fff&size=200&rounded=true&font-size=0.4`;

        const usuarioLogueado = {
          id: datosBackend.id_usuario,
          nombre: datosBackend.nombre_usuario,
          email: datosBackend.correo,
          rol: datosBackend.rol,
          rfc: datosBackend.rfc,
          avatarUrl: avatarUrl,
          username: (datosBackend.correo || "usuario").split("@")[0],
        };

        setUser(usuarioLogueado);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(usuarioLogueado));

        showMessage({
          title: "Inicio de sesión exitoso",
          message: `Bienvenido, ${usuarioLogueado.nombre}.`,
          type: "success",
        });

        return true;
      } else {
        showMessage({
          title: "Error de acceso",
          message: datosBackend.error || "Credenciales incorrectas.",
          type: "error",
        });

        return false;
      }
    } catch (error) {
      console.error("Error al conectar con el servidor:", error);

      showMessage({
        title: "Error de conexión",
        message:
          "No se pudo establecer conexión con el servidor de autenticación.",
        type: "error",
      });

      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(USER_STORAGE_KEY);

    showMessage({
      title: "Sesión cerrada",
      message: "Has cerrado sesión correctamente.",
      type: "info",
    });
  };

  const updateProfile = (newData) => {
    const usuarioActualizado = {
      ...user,
      ...newData,
    };

    setUser(usuarioActualizado);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(usuarioActualizado));

    showMessage({
      title: "Perfil actualizado",
      message: "Tu información se actualizó correctamente.",
      type: "success",
    });
  };

  const registroReal = async (datosUsuario) => {
    try {
      const idGenerado = Date.now().toString();
      const fechaActual = new Date().toISOString();

      const respuesta = await fetch("http://127.0.0.1:8000/api/usuarios/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_usuario: idGenerado,
          nombre_usuario: datosUsuario.nombre,
          correo: datosUsuario.email,
          contrasena: datosUsuario.password,
          rol: "1",
          fecha_registro: fechaActual,
        }),
      });

      const datosBackend = await respuesta.json();

      if (respuesta.ok) {
        showMessage({
          title: "Cuenta creada",
          message: "Tu cuenta fue creada con éxito. Ya puedes iniciar sesión.",
          type: "success",
        });

        return true;
      } else {
        showMessage({
          title: "Error en el registro",
          message:
            datosBackend.error ||
            datosBackend.detail ||
            JSON.stringify(datosBackend),
          type: "error",
        });

        return false;
      }
    } catch (error) {
      console.error("Error de conexión:", error);

      showMessage({
        title: "Error de conexión",
        message: "No se pudo conectar con el servidor 8000.",
        type: "error",
      });

      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loginReal, logout, updateProfile, registroReal }}
    >
      {children}
    </AuthContext.Provider>
  );
};
