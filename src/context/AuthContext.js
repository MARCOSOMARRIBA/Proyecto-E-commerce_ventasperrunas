import React, { createContext, useState } from "react";
import { api } from "../api/client";
import { useMessage } from "./MessageContext";

export const AuthContext = createContext();

const USER_STORAGE_KEY = "usuarioMascotas";

const buildAvatarUrl = (name = "V P") => {
  const initials = name.substring(0, 2).toUpperCase();

  return `https://ui-avatars.com/api/?name=${initials}&background=0D8ABC&color=fff&size=200&rounded=true&font-size=0.4`;
};

const mapBackendUser = (backendUser) => ({
  id: backendUser.id_usuario,
  nombre: backendUser.nombre_usuario,
  email: backendUser.correo,
  rol: backendUser.rol,
  rfc: backendUser.rfc,
  avatarUrl: buildAvatarUrl(backendUser.nombre_usuario),
  username: (backendUser.correo || "usuario").split("@")[0],
});

export const AuthProvider = ({ children }) => {
  const { showMessage } = useMessage();

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem(USER_STORAGE_KEY);

    if (!savedUser) return null;

    try {
      return JSON.parse(savedUser);
    } catch (error) {
      localStorage.removeItem(USER_STORAGE_KEY);
      return null;
    }
  });

  const loginReal = async (credentials) => {
    try {
      const backendUser = await api.auth.login({
        correo: credentials.email,
        contrasena: credentials.password,
      });

      const loggedUser = mapBackendUser(backendUser);

      setUser(loggedUser);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(loggedUser));

      showMessage({
        title: "Inicio de sesión exitoso",
        message: `Bienvenido, ${loggedUser.nombre}.`,
        type: "success",
      });

      return true;
    } catch (error) {
      console.error("Error al iniciar sesión:", error);

      showMessage({
        title: "Error de acceso",
        message: error.message || "Credenciales incorrectas.",
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
    const updatedUser = {
      ...user,
      ...newData,
    };

    setUser(updatedUser);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));

    showMessage({
      title: "Perfil actualizado",
      message: "Tu información se actualizó correctamente.",
      type: "success",
    });
  };

  const registroReal = async (userData) => {
    try {
      const generatedId = Date.now().toString();

      await api.auth.register({
        id_usuario: generatedId,
        nombre_usuario: userData.nombre,
        correo: userData.email,
        contrasena: userData.password,
        rol: "1",
        fecha_registro: new Date().toISOString(),
      });

      showMessage({
        title: "Cuenta creada",
        message: "Tu cuenta fue creada con éxito. Ya puedes iniciar sesión.",
        type: "success",
      });

      return true;
    } catch (error) {
      console.error("Error al registrar usuario:", error);

      showMessage({
        title: "Error en el registro",
        message: error.message || "No se pudo registrar la cuenta.",
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
