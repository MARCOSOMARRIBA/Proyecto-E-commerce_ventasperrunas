export const PLACEHOLDER_PRODUCT_IMAGE =
  "https://placehold.co/500x500?text=Sin+Imagen";

export const normalizeText = (text = "") =>
  text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

export const createSlug = (text = "") => normalizeText(text).replace(/\s+/g, "-");

export const getProductCategoryId = (product) => {
  if (!product) return null;

  if (typeof product.id_categoria === "object" && product.id_categoria !== null) {
    return product.id_categoria.id_categoria;
  }

  return product.id_categoria;
};

export const isProductAvailable = (product) =>
  Boolean(product?.activo && product?.stock);

export const toCartProduct = (product) => ({
  id: product.id_producto || product.id,
  nombre: product.nombre,
  imagen: product.imagen,
  precio_final: Number(product.precio || product.precio_final || 0),
});

export const getProductImage = (product, size = "500x500") =>
  product?.imagen || `https://placehold.co/${size}?text=Sin+Imagen`;

export const searchProducts = (products, query) => {
  const text = normalizeText(query);

  if (!text) return [];

  return products.filter((product) => {
    const searchableText = normalizeText(
      [
        product.id_producto,
        product.nombre,
        product.descripcion,
        product.precio,
        getProductCategoryId(product),
      ].join(" "),
    );

    return searchableText.includes(text);
  });
};
