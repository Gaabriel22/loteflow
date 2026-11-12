import { expect, test } from "@playwright/test"

test("mapeia colunas repetidas e preserva os valores originais", async ({
  page,
}) => {
  const requests: { method: string; url: string }[] = []
  page.on("request", (request) =>
    requests.push({ method: request.method(), url: request.url() }),
  )

  await page.goto("/#importar-csv")
  const requestCountBeforeSelection = requests.length
  await page
    .getByLabel("Arquivo CSV", { exact: true })
    .setInputFiles("tests/fixtures/mapeamento-colunas.csv")

  const mapping = page.getByRole("region", {
    name: "Relacione colunas a campos de produto",
  })
  await expect(mapping.getByRole("status")).toHaveText(
    "0 de 5 campos mapeados.",
  )
  await expect(mapping.getByRole("table")).toHaveCount(0)

  await mapping.getByRole("combobox", { name: "SKU" }).click()
  await page.getByRole("option", { name: "Coluna 1: SKU" }).click()
  await mapping.getByRole("combobox", { name: "Descrição" }).click()
  await page.getByRole("option", { name: "Coluna 3: Produto" }).click()
  await mapping.getByRole("combobox", { name: "Preço" }).click()
  await page.getByRole("option", { name: "Coluna 4: Valor" }).click()
  await mapping.getByRole("combobox", { name: "SKU" }).click()
  await page.getByRole("option", { name: "Coluna 2: Produto" }).click()
  await mapping.getByRole("combobox", { name: "SKU" }).click()
  await page.getByRole("option", { name: "Coluna 1: SKU" }).click()

  const mappedTable = mapping.getByRole("table")
  await expect(mapping.getByRole("status")).toHaveText(
    "3 de 5 campos mapeados.",
  )
  await expect(mapping.getByRole("combobox", { name: "SKU" })).toContainText(
    "Coluna 1: SKU",
  )
  await expect(mappedTable).toContainText("000123")
  await expect(mappedTable).toContainText("Produto correto")
  await expect(mappedTable).toContainText("=1+1")
  await expect(page.getByRole("table")).toHaveCount(2)
  const selectionRequests = requests.slice(requestCountBeforeSelection)
  expect(selectionRequests.some((request) => request.method === "POST")).toBe(
    false,
  )
  expect(
    selectionRequests.some((request) => /\/api(?:\/|$)/.test(request.url)),
  ).toBe(false)
})

test("limpa o mapeamento ao trocar ou limpar arquivo", async ({ page }) => {
  await page.goto("/#importar-csv")
  const fileInput = page.getByLabel("Arquivo CSV", { exact: true })
  await fileInput.setInputFiles("tests/fixtures/mapeamento-colunas.csv")

  const mapping = page.getByRole("region", {
    name: "Relacione colunas a campos de produto",
  })
  await mapping.getByRole("combobox", { name: "SKU" }).click()
  await page.getByRole("option", { name: "Coluna 1: SKU" }).click()
  await expect(mapping.getByRole("status")).toContainText("1 de 5")

  await fileInput.setInputFiles({
    name: "novo.csv",
    mimeType: "text/csv",
    buffer: Buffer.from("Código,Nome\n001,Novo produto"),
  })
  await expect(mapping.getByRole("status")).toHaveText(
    "0 de 5 campos mapeados.",
  )
  await expect(mapping.getByRole("table")).toHaveCount(0)

  await mapping.getByRole("combobox", { name: "SKU" }).click()
  await page.getByRole("option", { name: "Coluna 1: Código" }).click()
  await page.getByRole("button", { name: "Limpar arquivo" }).click()
  await expect(mapping).toHaveCount(0)
})

test("permite navegar pelos seletores com teclado e rolar tabela no mobile", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto("/#importar-csv")
  await page
    .getByLabel("Arquivo CSV", { exact: true })
    .setInputFiles("tests/fixtures/mapeamento-colunas.csv")

  const mapping = page.getByRole("region", {
    name: "Relacione colunas a campos de produto",
  })
  const skuSelect = mapping.getByRole("combobox", { name: "SKU" })
  await skuSelect.focus()
  await page.keyboard.press("Enter")
  await page.keyboard.type("Coluna 1: SKU")
  await page.keyboard.press("Enter")
  await expect(mapping.getByRole("status")).toContainText("1 de 5")

  const dimensions = await page.evaluate(() => {
    const documentWidth = document.documentElement.scrollWidth
    const viewportWidth = window.innerWidth
    const tableRegion = [
      ...document.querySelectorAll<HTMLElement>('[role="region"]'),
    ].find((region) =>
      region.getAttribute("aria-label")?.startsWith("Prévia mapeada"),
    )

    return {
      documentWidth,
      viewportWidth,
      regionWidth: tableRegion?.clientWidth ?? 0,
      regionScrollWidth: tableRegion?.scrollWidth ?? 0,
    }
  })

  expect(dimensions.documentWidth).toBeLessThanOrEqual(dimensions.viewportWidth)
  expect(dimensions.regionScrollWidth).toBeGreaterThan(dimensions.regionWidth)

  for (const width of [640, 720, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    const pageWidth = await page.evaluate(
      () => document.documentElement.scrollWidth,
    )
    expect(pageWidth).toBeLessThanOrEqual(width)
  }
})
