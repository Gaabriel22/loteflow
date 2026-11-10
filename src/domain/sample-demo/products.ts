export type SampleProduct = {
  id: string
  sku: string
  gtin: string
  description: string
  price: string
  stock: string
}

const productRows = [
  ["LOJA-001", "0000000000000", "Camiseta básica azul", "49,90", "18"],
  ["LOJA-002", "", "Caneca de cerâmica", "35,00", "24"],
  ["LOJA-003", "0000000000000", "Caderno pautado", "29,90", "12"],
  ["LOJA-004", "", "Garrafa térmica", "89,00", "9"],
  ["LOJA-005", "0000000000001", "Bolsa de lona", "74,90", "7"],
  ["LOJA-006", "", "Luminária de mesa", "quarenta", "5"],
  ["LOJA-007", "0000000000000", "Toalha de banho", "59,90", "16"],
  ["LOJA-006", "", "Organizador de mesa", "42,00", "11"],
  ["LOJA-009", "0000000000000", "Almofada estampada", "39,90", "14"],
  ["LOJA-010", "", "Jogo americano", "32,00", "20"],
  ["LOJA-011", "0000000000000", "Vaso de cerâmica", "65,00", "8"],
  ["LOJA-012", "", "", "45,00", "10"],
  ["LOJA-013", "0000000000000", "Mochila urbana", "159,90", "6"],
  ["LOJA-014", "", "Pote hermético", "28,00", "muitos"],
  ["LOJA-015", "0000000000000", "Manta de algodão", "139,00", "4"],
  ["", "", "", "", ""],
  ["LOJA-017", "0000000000000", "Saboneteira de vidro", "24,00", "13"],
  ["LOJA-018", "", "Bandeja de madeira", "79,90", "3"],
  ["LOJA-019", "0000000000000", "Estojo escolar", "22,00", "17"],
  ["LOJA-020", "", "Conjunto de pratos", "129,00", "5"],
  ["LOJA-021", "0000000000000", "Pano de prato", "15,00", "26"],
  ["LOJA-022", "", "Cesto organizador", "54,90", "8"],
] as const

export const SAMPLE_PRODUCTS: readonly SampleProduct[] = productRows.map(
  ([sku, gtin, description, price, stock], index) => ({
    id: `sample-${String(index + 1).padStart(3, "0")}`,
    sku,
    gtin,
    description,
    price,
    stock,
  }),
)
