import React, { createContext, useState } from "react";
import { api } from "../api/client";
import { useMessage } from "./MessageContext";
import { signInWithPopup } from "firebase/auth";

import { auth, googleProvider, facebookProvider } from "../firebaseConfig";

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
  const [socialLoading, setSocialLoading] = useState(false);

  const [user, setUser] = useState(() => {
    const savedUser =
      localStorage.getItem(USER_STORAGE_KEY) ||
      sessionStorage.getItem(USER_STORAGE_KEY);

    if (!savedUser) return null;

    try {
      return JSON.parse(savedUser);
    } catch (error) {
      localStorage.removeItem(USER_STORAGE_KEY);
      sessionStorage.removeItem(USER_STORAGE_KEY);
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
      if (credentials.recordarme) {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(loggedUser));
      } else {
        sessionStorage.setItem(USER_STORAGE_KEY, JSON.stringify(loggedUser));
      }

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

  const loginGoogle = async () => {
    if (socialLoading) return;

    try {
      setSocialLoading(true);

      const result = await signInWithPopup(auth, googleProvider);

      const userFirebase = result.user;

      const backendUser = await api.auth.googleLogin({
        correo: userFirebase.email,
        nombre: userFirebase.displayName,
      });

      const loggedUser = mapBackendUser(backendUser);

      setUser(loggedUser);

      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(loggedUser));

      showMessage({
        title: "Inicio con Google exitoso",
        message: `Bienvenido, ${loggedUser.nombre}.`,
        type: "success",
      });

      return loggedUser;
    } catch (error) {
      console.error("Error login Google:", error);

      showMessage({
        title: "Error con Google",
        message: "No se pudo iniciar sesión.",
        type: "error",
      });

      return null;
    } finally {
      setSocialLoading(false);
    }
  };

  const loginFacebook = async () => {
    if (socialLoading) return;

    try {
      setSocialLoading(true);

      const result = await signInWithPopup(auth, facebookProvider);

      const userFirebase = result.user;

      const backendUser = await api.auth.googleLogin({
        correo: userFirebase.email,
        nombre: userFirebase.displayName,
      });

      const loggedUser = mapBackendUser(backendUser);

      setUser(loggedUser);

      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(loggedUser));

      showMessage({
        title: "Inicio con Facebook exitoso",
        message: `Bienvenido, ${loggedUser.nombre}.`,
        type: "success",
      });

      return loggedUser;
    } catch (error) {
      console.error("Error login Facebook:", error);

      showMessage({
        title: "Error con Facebook",
        message: "No se pudo iniciar sesión.",
        type: "error",
      });

      return null;
    } finally {
      setSocialLoading(false);
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

  const updateProfile = async (newData) => {
    const updatedUser = {
      ...user,
      nombre: newData.nombre,
    };

    setUser(updatedUser);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));

    showMessage({
      title: "Perfil actualizado",
      message: "Tus datos fueron actualizados correctamente.",
      type: "success",
    });

    try {
      await fetch(`http://https://proyecto-e-commerce-ventasperrunas.onrender.com/api/usuarios/actualizar/${user.id}/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre: newData.nombre,
        }),
      });
    } catch (error) {
      console.error(error);
      showMessage({
        title: "Error",
        message: "No se pudo sincronizar con el servidor.",
        type: "error",
      });
    }
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
      value={{
        user,
        loginReal,
        loginGoogle,
        loginFacebook,
        socialLoading,
        logout,
        updateProfile,
        registroReal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
