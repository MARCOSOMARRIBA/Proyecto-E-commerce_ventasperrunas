const API_BASE_URL = "https://proyecto-e-commerce-ventasperrunas.onrender.com";

export const apiFetch = async (path, options = {}) => {
  // 1. Limpieza agresiva: Nos aseguramos de que no haya un /api// jamás
  let cleanPath = path;
  if (cleanPath.startsWith('/api/')) {
    cleanPath = cleanPath.replace('/api/', '/');
  } else if (!cleanPath.startsWith('/')) {
    cleanPath = '/' + cleanPath;
  }
  
  // 2. URL Final blindada
  const url = `${API_BASE_URL}/api${cleanPath}`;
  console.log("🔍 URL FINAL AL SERVIDOR:", url);

  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    // 3. Si hay error, extraemos el mensaje real de Django (vital para el carrito)
    if (!response.ok) {
      let errorMessage = `Error ${response.status}`;
      try {
        const errorData = await response.json();
        console.error("❌ ERROR DE DJANGO:", errorData);
        errorMessage = errorData.detail || errorData.error || JSON.stringify(errorData);
      } catch (e) {
        console.error("❌ ERROR DEL SERVIDOR (Sin JSON):", response.statusText);
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error("❌ ERROR FATAL EN FETCH:", error.message);
    throw error;
  }
};

export const api = {
  productos: {
    list: () => apiFetch("/productos/"),
    detail: (id) => apiFetch(`/productos/${id}/`),
    // Agregado porque salía 404 en tus logs
    mas_vendidos: () => apiFetch("/productos/mas_vendidos/"), 
  },
  categorias: {
    list: () => apiFetch("/categorias/"),
  },
  banners: {
    // Agregado porque salía en tus logs
    list: () => apiFetch("/banners/"),
    detail: (id) => apiFetch(`/banners/${id}/`),
  },
  cart: {
    // AQUÍ ESTÁ LO DEL CARRITO
    agregar: (productId, quantity = 1) => 
      apiFetch("/cart/agregar/", {
        method: "POST",
        body: JSON.stringify({ product_id: productId, quantity }),
      }),
    ver: () => apiFetch("/cart/"),
  },
  checkout: {
    // AQUÍ ESTÁ LO DEL CHECKOUT
    procesar: (datos) => apiFetch("/checkout/", {
        method: "POST",
        body: JSON.stringify(datos)
    })
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