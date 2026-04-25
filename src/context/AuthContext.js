import React, { createContext, useState } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // --- CONEXIÓN REAL AL BACKEND PARA INICIO DE SESIÓN ---
  const loginReal = async (credentials) => {
    try {
      const respuesta = await fetch('http://127.0.0.1:8000/api/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          correo: credentials.email,
          contrasena: credentials.password
        })
      });

      const datosBackend = await respuesta.json();

      if (respuesta.ok) {
        // Generamos el avatar profesional usando el nombre que viene de la BD
        const nombreParaAvatar = datosBackend.nombre_usuario || "V P";
        const iniciales = nombreParaAvatar.substring(0, 2).toUpperCase();
        const avatarUrl = `https://ui-avatars.com/api/?name=${iniciales}&background=0D8ABC&color=fff&size=200&rounded=true&font-size=0.4`;

        // Guardamos los datos reales del usuario en el estado global
        setUser({
          id: datosBackend.id_usuario,
          nombre: datosBackend.nombre_usuario,
          email: datosBackend.correo,
          rol: datosBackend.rol,
          avatarUrl: avatarUrl,
          username: (datosBackend.correo || "usuario").split('@')[0]
        });

        return true;
      } else {
        alert("Error de acceso: " + (datosBackend.error || "Credenciales incorrectas"));
        return false;
      }
    } catch (error) {
      console.error("Error al conectar con el servidor:", error);
      alert("No se pudo establecer conexión con el servidor de autenticación.");
      return false;
    }
  };

  const logout = () => {
    setUser(null);
  };

  const updateProfile = (newData) => {
    setUser({ ...user, ...newData });
  };

  const registroReal = async (datosUsuario) => {
    try {
      const idGenerado = Date.now().toString(); 
      const fechaActual = new Date().toISOString();

      const respuesta = await fetch('http://127.0.0.1:8000/api/usuarios/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id_usuario: idGenerado,
          nombre_usuario: datosUsuario.nombre,
          correo: datosUsuario.email,
          contrasena: datosUsuario.password,
          rol: "1",
          fecha_registro: fechaActual
        })
      });
      
      const datosBackend = await respuesta.json();

      if (respuesta.ok) {
        alert("¡Cuenta creada con éxito! Ya puedes iniciar sesión.");
        return true; 
      } else {
        alert("Error en el registro: " + JSON.stringify(datosBackend));
        return false;
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      alert("Error al conectar con el servidor 8000.");
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loginReal, logout, updateProfile, registroReal }}>
      {children}
    </AuthContext.Provider>
  );
};