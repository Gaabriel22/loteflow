import AxeBuilder from "@axe-core/playwright"
import { expect, test } from "@playwright/test"

test("edita células mapeadas, recalcula validação e restaura valores locais", async ({
  page,
}) => {
  const requests: { method: string; url: string }[] = []
  page.on("request", (request) => {
    requests.push({ method: request.method(), url: request.url() })
  })

  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto("/#importar-csv")
  await page
    .getByLabel("Arquivo CSV", { exact: true })
    .setInputFiles("tests/fixtures/validacao-previa.csv")

  const mapping = page.getByRole("region", {
    name: "Relacione colunas a campos de produto",
  })
  await mapping.getByRole("combobox", { name: "SKU" }).click()
  await page.getByRole("option", { name: "Coluna 1: SKU" }).click()

  const results = page.getByRole("region", {
    name: "Validação genérica do arquivo",
  })
  await expect(results.getByRole("status")).toContainText("Apontamentos: 3.")
  await page.getByRole("button", { name: "Editar valores" }).click()

  const input = page.getByRole("textbox", { name: "Registro 2, SKU" })
  await input.focus()
  await page.keyboard.press("Control+A")
  await page.keyboard.type("SKU-99")
  await expect(input).toBeFocused()
  await expect(results.getByRole("status")).toContainText("Apontamentos: 1.")
  await expect(page.locator("#csv-edit-status")).toContainText(
    "1 célula alterada",
  )

  await expect(input).toHaveValue("SKU-99")
  const originalTable = page.getByRole("region", {
    name: "Prévia CSV. Role na horizontal para consultar todas as colunas.",
    exact: true,
  })
  await expect(originalTable).toContainText(" SKU-01 ")

  const axe = await new AxeBuilder({ page })
    .withTags([
      "wcag2a",
      "wcag2aa",
      "wcag21a",
      "wcag21aa",
      "wcag22a",
      "wcag22aa",
    ])
    .analyze()
  expect(axe.violations).toEqual([])

  await page.evaluate(() => {
    document.body.style.zoom = "200%"
  })
  const zoomedWidth = await page.evaluate(
    () => document.documentElement.scrollWidth,
  )
  expect(zoomedWidth).toBeLessThanOrEqual(390)
  await page.evaluate(() => {
    document.body.style.zoom = ""
  })

  await page.getByRole("button", { name: "Concluir edição" }).click()
  await page
    .getByRole("button", {
      name: "Restaurar valor original do registro 2, campo SKU",
    })
    .click()
  await expect(results.getByRole("status")).toContainText("Apontamentos: 3.")
  await expect(page.locator("#csv-edit-status")).toContainText(
    "0 células alteradas",
  )

  const capturedRequests = requests.filter(
    ({ method, url }) => method === "POST" || /\/api(?:\/|$)/.test(url),
  )
  expect(capturedRequests).toEqual([])
})

test("compartilha edição quando dois campos usam mesma coluna e restaura todas", async ({
  page,
}) => {
  await page.goto("/#importar-csv")
  await page
    .getByLabel("Arquivo CSV", { exact: true })
    .setInputFiles("tests/fixtures/validacao-previa.csv")

  for (const field of ["SKU", "GTIN"]) {
    await page.getByRole("combobox", { name: field }).click()
    await page.getByRole("option", { name: "Coluna 1: SKU" }).click()
  }

  await page.getByRole("button", { name: "Editar valores" }).click()
  await page.getByRole("textbox", { name: "Registro 1, SKU" }).fill("SKU-88")
  await expect(
    page.getByRole("textbox", { name: "Registro 1, GTIN" }),
  ).toHaveValue("SKU-88")

  await page
    .getByRole("button", { name: "Restaurar todas as alterações" })
    .click()
  await expect(
    page.getByRole("textbox", { name: "Registro 1, SKU" }),
  ).toHaveValue("SKU-01")
  await expect(page.locator("#csv-edit-status")).toContainText(
    "0 células alteradas",
  )

  await page.getByRole("button", { name: "Concluir edição" }).click()
  await page.getByRole("button", { name: "Limpar arquivo" }).click()
  await page
    .getByLabel("Arquivo CSV", { exact: true })
    .setInputFiles("tests/fixtures/validacao-previa.csv")
  await expect(page.locator("#csv-edit-status")).toContainText(
    "0 células alteradas",
  )
})
