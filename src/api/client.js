const API_BASE_URL = "https://proyecto-e-commerce-ventasperrunas.onrender.com";

export const apiFetch = async (path, options = {}) => {
  // 1. FORZAMOS EL PREFIJO /api/ SIEMPRE
  // Si el path ya tiene /api/, no hacemos nada. Si no, se lo pegamos al principio.
  const apiPath = path.startsWith("/api") ? path : `/api${path}`;
  const url = `${API_BASE_URL}${apiPath}`;
  
  console.log("🔍 Intentando conectar a:", url); // Esto nos confirmará la ruta final

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    console.error("❌ Error en petición:", response.status, url);
    throw new Error(`Error ${response.status}`);
  }

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
