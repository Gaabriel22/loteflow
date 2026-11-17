import { readFile } from "node:fs/promises"
import AxeBuilder from "@axe-core/playwright"
import { expect, test } from "@playwright/test"

test("edita registro 101 sem alterar registro 1 e exporta análise entre páginas", async ({
  page,
}) => {
  await page.goto("/#importar-csv")
  const rows = Array.from(
    { length: 205 },
    (_, i) => `SKU-${i + 1};Produto ${i + 1};1,00`,
  )
  rows[100] = "SKU-1;Produto 101;inválido"
  rows[204] = "SKU-205;Produto 205;inválido"
  await page.getByLabel("Arquivo CSV ou XLSX", { exact: true }).setInputFiles({
    name: "paginas.csv",
    mimeType: "text/csv",
    buffer: Buffer.from(["SKU;Descrição;Preço", ...rows].join("\n")),
  })
  for (const [field, option] of [
    ["SKU", "Coluna 1: SKU"],
    ["Preço", "Coluna 3: Preço"],
  ]) {
    await page.getByRole("combobox", { name: field, exact: true }).click()
    await page.getByRole("option", { name: option, exact: true }).click()
  }
  const results = page.getByRole("region", {
    name: "Validação genérica do arquivo",
    exact: true,
  })
  await expect(results.getByRole("status")).toContainText("Apontamentos: 4.")
  const mapped = page.getByRole("navigation", {
    name: "Paginação dos campos mapeados",
    exact: true,
  })
  await page
    .getByRole("button", { name: "Editar valores", exact: true })
    .click()
  await mapped
    .getByRole("button", { name: "Próxima página", exact: true })
    .click()
  const sku101 = page.getByRole("textbox", {
    name: "Registro 101, SKU",
    exact: true,
  })
  await sku101.fill("SKU-101")
  await expect(results.getByRole("status")).toContainText("Apontamentos: 2.")
  await mapped
    .getByRole("button", { name: "Primeira página", exact: true })
    .click()
  await expect(
    page.getByRole("textbox", { name: "Registro 1, SKU", exact: true }),
  ).toHaveValue("SKU-1")
  await mapped
    .getByRole("button", { name: "Próxima página", exact: true })
    .click()
  await expect(sku101).toHaveValue("SKU-101")
  await page
    .getByRole("button", { name: "Restaurar todas as alterações", exact: true })
    .click()
  await expect(results.getByRole("status")).toContainText("Apontamentos: 4.")
  const raw = page.getByRole("navigation", {
    name: "Paginação do arquivo",
    exact: true,
  })
  await raw.getByRole("button", { name: "Próxima página", exact: true }).focus()
  await page.keyboard.press("Enter")
  const original = page.getByRole("region", {
    name: "Prévia do arquivo. Role na horizontal para consultar todas as colunas.",
    exact: true,
  })
  await expect(
    original.getByRole("rowheader", { name: "101", exact: true }),
  ).toBeVisible()
  await expect(original).toContainText("SKU-1")
  await expect(original.locator("tbody tr")).toHaveCount(100)
  await page.getByLabel("Buscar nos apontamentos", { exact: true }).fill("205")
  await expect(
    results
      .getByRole("table")
      .getByRole("rowheader", { name: "205", exact: true }),
  ).toBeVisible()
  const downloading = page.waitForEvent("download")
  await page
    .getByRole("button", { name: "Baixar relatório CSV", exact: true })
    .click()
  const download = await downloading
  const csv = await readFile((await download.path())!, "utf8")
  expect(csv).toContain("101;SKU;")
  expect(csv).toContain("205;Preço;")
  expect(csv).toContain("1;SKU;")
  expect(download.suggestedFilename()).toBe("loteflow-apontamentos.csv")
})

test("pagina apontamentos, reinicia com filtros e limita página quando lista encolhe", async ({
  page,
}) => {
  await page.goto("/#importar-csv")
  await page.getByLabel("Arquivo CSV ou XLSX", { exact: true }).setInputFiles({
    name: "apontamentos.csv",
    mimeType: "text/csv",
    buffer: Buffer.from(
      ["Preço", ...Array.from({ length: 201 }, () => "grátis")].join("\n"),
    ),
  })
  await page.getByRole("combobox", { name: "Preço", exact: true }).click()
  await page
    .getByRole("option", { name: "Coluna 1: Preço", exact: true })
    .click()
  const results = page.getByRole("region", {
    name: "Validação genérica do arquivo",
    exact: true,
  })
  const navigation = results.getByRole("navigation", {
    name: "Paginação dos apontamentos",
    exact: true,
  })
  await navigation
    .getByRole("button", { name: "Última página", exact: true })
    .click()
  await expect(
    navigation.getByRole("button", { name: "Última página", exact: true }),
  ).toBeFocused()
  await expect(
    results.getByRole("rowheader", { name: "201", exact: true }),
  ).toBeVisible()
  const search = page.getByLabel("Buscar nos apontamentos", { exact: true })
  await search.fill("numerico")
  await expect(
    results.getByRole("rowheader", { name: "1", exact: true }),
  ).toBeVisible()
  await page
    .getByRole("button", { name: "Limpar filtros", exact: true })
    .click()
  await navigation
    .getByRole("button", { name: "Última página", exact: true })
    .click()
  const mapped = page.getByRole("navigation", {
    name: "Paginação dos campos mapeados",
    exact: true,
  })
  await mapped
    .getByRole("button", { name: "Última página", exact: true })
    .click()
  await page
    .getByRole("button", { name: "Editar valores", exact: true })
    .click()
  await page
    .getByRole("textbox", { name: "Registro 201, Preço", exact: true })
    .fill("1,00")
  await expect(navigation).toContainText("Página 2 de 2")
  await expect(
    results.getByRole("rowheader", { name: "101", exact: true }),
  ).toBeVisible()
  await expect(results.locator("tbody tr")).toHaveCount(100)
  const accessibility = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze()
  expect(accessibility.violations).toEqual([])
})

test("cancela relatório e troca arquivo sem download tardio", async ({
  page,
}) => {
  await page.goto("/#importar-csv")
  const file = page.getByLabel("Arquivo CSV ou XLSX", { exact: true })
  await file.setInputFiles("tests/fixtures/validacao-previa.csv")
  await page.getByRole("combobox", { name: "SKU", exact: true }).click()
  await page.getByRole("option", { name: "Coluna 1: SKU", exact: true }).click()
  const downloads: string[] = []
  page.on("download", (download) =>
    downloads.push(download.suggestedFilename()),
  )
  await page.route("**/*.js*", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 500))
    await route.continue()
  })
  await page
    .getByRole("button", { name: "Baixar relatório CSV", exact: true })
    .click()
  await page
    .getByRole("button", { name: "Cancelar relatório", exact: true })
    .click()
  await expect(
    page.getByRole("button", { name: "Baixar relatório CSV", exact: true }),
  ).toBeFocused()
  await page.unrouteAll({ behavior: "wait" })
  await file.setInputFiles({
    name: "novo.csv",
    mimeType: "text/csv",
    buffer: Buffer.from("SKU\nNOVO"),
  })
  await expect(page.locator("#csv-column-mapping-status")).toContainText(
    "0 de 5",
  )
  expect(downloads).toEqual([])
})
