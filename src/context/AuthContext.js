import React, { createContext, useState } from 'react';

// 1. Creamos el contexto (la nube)
export const AuthContext = createContext();

// 2. Creamos el proveedor (quien reparte los datos a la app)
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // null significa que nadie ha iniciado sesión

  // Función para simular el login.
  const login = (userData) => {
    // Generamos un avatar por defecto usando las iniciales.
    // Usamos el servicio UI Avatars, que es gratuito y profesional.
    const iniciales = (userData.nombre || "V P").substring(0, 2).toUpperCase();
    const avatarSimulado = `https://ui-avatars.com/api/?name=${iniciales}&background=0D8ABC&color=fff&size=200&rounded=true&font-size=0.4`;
    
    // Guardamos el usuario incluyendo el avatar predeterminado
    setUser({ ...userData, avatarUrl: avatarSimulado, username: (userData.email || "usuario").split('@')[0] });
  };

  // Función para cerrar sesión
  const logout = () => {
    setUser(null);
  };

  // Función para editar el perfil (actualiza datos locales en la memoria global)
  const updateProfile = (newData) => {
    setUser({ ...user, ...newData });
  };

// --- CONEXIÓN REAL AL BACKEND PARA REGISTRO ---
  const registroReal = async (datosUsuario) => {
    try {
      // Usamos fetch para tocar la puerta de Django
      // OJO: Tendrás que cambiar esta URL por la ruta exacta que hizo tu amigo
      // Generamos un ID único de 13 dígitos usando la fecha actual
      const idGenerado = Date.now().toString(); 
      const fechaActual = new Date().toISOString(); // <-- Creamos la fecha exacta de ahorita

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
          fecha_registro: fechaActual          // <--- Le mandamos la fecha para que Django no se queje
        })
      });
      
      const datosBackend = await respuesta.json();

      if (respuesta.ok) {
        alert("¡Conexión exitosa! El backend guardó al usuario.");
        console.log("Respuesta de Django:", datosBackend);
        // Aquí podrías guardar al usuario y loguearlo
        return true; 
      } else {
        alert("El backend conectó, pero rechazó los datos: " + JSON.stringify(datosBackend));
        return false;
      }
    } catch (error) {
      console.error("Error de conexión (¿Está prendido el servidor Django?):", error);
      alert("No se pudo conectar con el servidor 8000.");
      return false;
    }
  };

return (
    <AuthContext.Provider value={{ user, login, logout, updateProfile, registroReal }}>
      {children}
    </AuthContext.Provider>
  );
};