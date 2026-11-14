export const PRODUCT_FIELDS = [
  { key: "sku", label: "SKU" },
  { key: "gtin", label: "GTIN" },
  { key: "description", label: "Descrição" },
  { key: "price", label: "Preço" },
  { key: "stock", label: "Estoque" },
] as const

export type ProductField = (typeof PRODUCT_FIELDS)[number]["key"]

export type ProductValues = Record<ProductField, string>

export function createEmptyProductValues(): ProductValues {
  return {
    sku: "",
    gtin: "",
    description: "",
    price: "",
    stock: "",
  }
}
