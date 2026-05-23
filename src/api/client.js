// 1. URL base LIMPIA (sin el /api al final para controlarlo nosotros)
const API_BASE_URL = "https://proyecto-e-commerce-ventasperrunas.onrender.com";

export const apiFetch = async (path, options = {}) => {
  // 2. FORZAMOS el /api/ aquí mismo
  // Si el path no empieza con /api/, se lo ponemos a la fuerza
  const apiPath = path.startsWith("/api") ? path : `/api${path}`;
  const url = `${API_BASE_URL}${apiPath}`;
  
  console.log("🔍 Intentando conectar a:", url);

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    console.error("❌ Error en petición:", response.status, url);
    throw new Error(`Error ${response.status}: No se pudo completar la solicitud.`);
  }

  return await response.json();
};

export const api = {
  productos: {
    list: () => apiFetch("/api/productos/"),
    detail: (id) => apiFetch(`/api/productos/${id}/`),
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
