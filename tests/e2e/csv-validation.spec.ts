import AxeBuilder from "@axe-core/playwright"
import { expect, test, type Page } from "@playwright/test"

async function selectColumn(
  page: Page,
  fieldName: string,
  columnLabel: string,
) {
  const mapping = page.getByRole("region", {
    name: "Relacione colunas a campos de produto",
  })

  await mapping.getByRole("combobox", { name: fieldName }).click()
  await page.getByRole("option", { name: columnLabel }).click()
}

test("valida campos mapeados e preserva dados locais", async ({ page }) => {
  const requests: { method: string; url: string }[] = []
  page.on("request", (request) => {
    requests.push({ method: request.method(), url: request.url() })
  })

  await page.goto("/#importar-csv")
  const requestCountBeforeFile = requests.length
  await page
    .getByLabel("Arquivo CSV ou XLSX", { exact: true })
    .setInputFiles("tests/fixtures/validacao-previa.csv")

  await selectColumn(page, "SKU", "Coluna 1: SKU")
  await selectColumn(page, "GTIN", "Coluna 2: GTIN")
  await selectColumn(page, "Descrição", "Coluna 3: Descrição")
  await selectColumn(page, "Preço", "Coluna 4: Preço")
  await selectColumn(page, "Estoque", "Coluna 5: Estoque")

  const results = page.getByRole("region", {
    name: "Validação genérica do arquivo",
  })
  await expect(results.getByRole("status")).toHaveText(
    "Registros analisados: 4. Registros para revisar: 3. Apontamentos: 7.",
  )
  await expect(results).toContainText("Este SKU aparece mais de uma vez.")
  await expect(results).toContainText("Confira os dígitos verificadores")
  await expect(results).toContainText("Informe um preço numérico.")
  await expect(results).toContainText("Informe um estoque numérico.")
  await expect(results).toContainText("Registro")

  await selectColumn(page, "Preço", "Não mapeado")
  await expect(results.getByRole("status")).toHaveText(
    "Registros analisados: 4. Registros para revisar: 3. Apontamentos: 6.",
  )
  await expect(results).not.toContainText("Informe um preço numérico.")

  const selectionRequests = requests.slice(requestCountBeforeFile)
  expect(selectionRequests.some((request) => request.method === "POST")).toBe(
    false,
  )
  expect(
    selectionRequests.some((request) => /\/api(?:\/|$)/.test(request.url)),
  ).toBe(false)
})

test("analisa todo o arquivo, opera por teclado e cabe em viewports estreitos", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto("/#importar-csv")

  const records = Array.from({ length: 105 }, (_, index) => `SKU-${index};;;`)
  records[104] = "SKU-0;;;"

  await page.getByLabel("Arquivo CSV ou XLSX", { exact: true }).setInputFiles({
    name: "mais-de-100-registros.csv",
    mimeType: "text/csv",
    buffer: Buffer.from(["SKU;Descrição;Preço;Estoque", ...records].join("\n")),
  })
  await page.getByRole("combobox", { name: "SKU" }).focus()
  await page.keyboard.press("Enter")
  await page.keyboard.type("Coluna 1: SKU")
  await page.keyboard.press("Enter")

  const results = page.getByRole("region", {
    name: "Validação genérica do arquivo",
  })
  await expect(results.getByRole("status")).toHaveText(
    "Registros analisados: 105. Registros para revisar: 2. Apontamentos: 2.",
  )
  await expect(results).toContainText(
    "A análise cobre 105 registros do arquivo. Todos os registros do arquivo estão incluídos na análise.",
  )

  for (const width of [390, 640, 720, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    const documentWidth = await page.evaluate(
      () => document.documentElement.scrollWidth,
    )
    expect(documentWidth).toBeLessThanOrEqual(width)
  }
})

test("mantém tabela de apontamentos rolável e resultados acessíveis", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto("/#importar-csv")
  await page
    .getByLabel("Arquivo CSV ou XLSX", { exact: true })
    .setInputFiles("tests/fixtures/validacao-previa.csv")

  await selectColumn(page, "SKU", "Coluna 1: SKU")
  await selectColumn(page, "GTIN", "Coluna 2: GTIN")
  await selectColumn(page, "Descrição", "Coluna 3: Descrição")
  await selectColumn(page, "Preço", "Coluna 4: Preço")
  await selectColumn(page, "Estoque", "Coluna 5: Estoque")

  const tableRegion = page.getByRole("region", {
    name: "Apontamentos da prévia do arquivo. Role na horizontal para consultar todas as colunas.",
  })
  await expect(tableRegion).toBeVisible()

  const dimensions = await tableRegion.evaluate((region) => ({
    clientWidth: region.clientWidth,
    scrollWidth: region.scrollWidth,
  }))
  expect(dimensions.scrollWidth).toBeGreaterThan(dimensions.clientWidth)

  const results = await new AxeBuilder({ page })
    .withTags([
      "wcag2a",
      "wcag2aa",
      "wcag21a",
      "wcag21aa",
      "wcag22a",
      "wcag22aa",
    ])
    .analyze()

  expect(results.violations).toEqual([])
})
