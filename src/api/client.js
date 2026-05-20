const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://127.0.0.1:8000/api";

const buildUrl = (path) => {
  const normalizedBase = API_BASE_URL.replace(/\/+$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${normalizedBase}${normalizedPath}`;
};

export const apiFetch = async (path, options = {}) => {
  const response = await fetch(buildUrl(path), {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : null;

  if (!response.ok) {
    const message =
      data?.error ||
      data?.detail ||
      "No se pudo completar la solicitud al servidor.";
    throw new Error(message);
  }

  return data;
};

export const api = {
  productos: {
    list: () => apiFetch("/productos/"),
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
