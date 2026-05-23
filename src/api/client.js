const API_BASE_URL = "https://proyecto-e-commerce-ventasperrunas.onrender.com";

export const apiFetch = async (path, options = {}) => {
  // Limpiamos el path: si empieza con /api/, se lo quitamos antes de sumar
  const cleanPath = path.startsWith('/api') ? path.replace('/api', '') : path;
  
  // Ahora construimos la URL: BASE + /api + PATH LIMPIO
  const url = `${API_BASE_URL}/api${cleanPath}`;
  
  console.log("🔍 URL REAL:", url);

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) throw new Error(`Error ${response.status}`);
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
