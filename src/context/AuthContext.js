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

  return (
    <AuthContext.Provider value={{ user, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};