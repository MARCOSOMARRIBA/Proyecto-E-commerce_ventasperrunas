const API_BASE_URL =
  process.env.REACT_APP_API_URL || "https://proyecto-e-commerce-ventasperrunas.onrender.com/api";

const buildUrl = (path) => {
  const normalizedBase = API_BASE_URL.replace(/\/+$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${normalizedBase}${normalizedPath}`;
};

export const apiFetch = async (path, options = {}) => {
  const url = buildUrl(path);
  
  // Esto nos dirá exactamente a qué dirección intenta ir antes de fallar
  console.log("🔍 [DEBUG] Intentando Fetch a:", url);

  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });
    
    console.log("✅ [DEBUG] Respuesta recibida");
    // ... el resto de tu lógica
  } catch (error) {
    console.error("❌ [DEBUG] Error capturado en fetch:", error);
    throw error;
  }
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
