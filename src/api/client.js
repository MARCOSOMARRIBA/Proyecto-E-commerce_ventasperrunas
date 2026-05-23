const API_BASE_URL = "https://proyecto-e-commerce-ventasperrunas.onrender.com";

// client.js

export const apiFetch = async (path, options = {}) => {
  // RUTA HARCODEADA: Si esto no carga, nada cargará.
  const baseUrl = "https://proyecto-e-commerce-ventasperrunas.onrender.com";
  
  // Si el path no tiene /api/, se lo ponemos a la fuerza
  const finalPath = path.startsWith('/api') ? path : `/api${path}`;
  const url = `${baseUrl}${finalPath}`;

  console.log("URL FINAL:", url); // <--- MIRA LA CONSOLA: ¿Dice /api/productos/?

  const response = await fetch(url, {
    method: options.method || 'GET',
    headers: { 'Content-Type': 'application/json' },
    body: options.body
  });

  return await response.json();
};

export const api = {
  productos: {
    list: () => apiFetch("/productos/"), // Ahora se convertirá en /api/productos/
    detail: (id) => apiFetch(`/productos/${id}/`),
  },
  categorias: {
    list: () => apiFetch("/categorias/"),
  },
  auth: {
    login: (credentials) =>
      apiFetch("/login/", {
        method: "POST",
        body: JSON.stringify(credentials),
      }),

    register: (user) =>
      apiFetch("/usuarios/", {
        method: "POST",
        body: JSON.stringify(user),
      }),

    googleLogin: (data) =>
      apiFetch("/login-google/", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },
};
