import { readFile } from "node:fs/promises"
import { expect, test } from "@playwright/test"

test("combina filtros sem alterar análise ou relatório, e permite limpar", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto("/#importar-csv")
  await page
    .getByLabel("Arquivo CSV", { exact: true })
    .setInputFiles("tests/fixtures/validacao-previa.csv")
  for (const [index, field] of [
    "SKU",
    "GTIN",
    "Descrição",
    "Preço",
    "Estoque",
  ].entries()) {
    await page.getByRole("combobox", { name: field, exact: true }).click()
    await page
      .getByRole("option", {
        name: `Coluna ${index + 1}: ${field}`,
        exact: true,
      })
      .click()
  }
  const results = page.getByRole("region", {
    name: "Validação genérica da prévia",
    exact: true,
  })
  const search = page.getByLabel("Buscar nos apontamentos", { exact: true })
  const select = page.getByRole("combobox", {
    name: "Filtrar por campo",
    exact: true,
  })
  await select.focus()
  await page.keyboard.press("Enter")
  await page.keyboard.type("Preço")
  await page.keyboard.press("Enter")
  await search.fill("GRATIS")
  await expect(search).toBeFocused()
  await expect(page.locator("#csv-findings-filter-summary")).toHaveText(
    "Registros visíveis: 1 de 3. Apontamentos visíveis: 1 de 7.",
  )
  await expect(results.getByRole("status")).toContainText("Apontamentos: 7.")
  await search.fill("sem correspondencia")
  await expect(results).toContainText(
    "Nenhum apontamento corresponde aos filtros.",
  )
  const downloading = page.waitForEvent("download")
  await page
    .getByRole("button", {
      name: "Baixar relatório CSV da prévia",
      exact: true,
    })
    .click()
  const download = await downloading
  const csv = await readFile((await download.path())!, "utf8")
  expect(csv).toContain("Este SKU aparece mais de uma vez.")
  expect(csv).toContain("Informe um preço numérico.")
  await page
    .getByRole("button", { name: "Limpar filtros", exact: true })
    .click()
  await expect(search).toHaveValue("")
  await expect(select).toContainText("Todos os campos")
  await expect(page.locator("#csv-findings-filter-summary")).toContainText(
    "Apontamentos visíveis: 7 de 7.",
  )
})

test("mantém filtros durante edição e restauração e reinicia ao remapear ou trocar arquivo", async ({
  page,
}) => {
  await page.goto("/#importar-csv")
  const file = page.getByLabel("Arquivo CSV", { exact: true })
  await file.setInputFiles("tests/fixtures/validacao-previa.csv")
  await page.getByRole("combobox", { name: "Preço", exact: true }).click()
  await page
    .getByRole("option", { name: "Coluna 4: Preço", exact: true })
    .click()
  const search = page.getByLabel("Buscar nos apontamentos", { exact: true })
  await search.fill("gratis")
  await page
    .getByRole("button", { name: "Editar valores", exact: true })
    .click()
  await page
    .getByRole("textbox", { name: "Registro 2, Preço", exact: true })
    .fill("12,00")
  await expect(search).toHaveValue("gratis")
  await expect(page.locator("#csv-findings-filter-summary")).toContainText(
    "Apontamentos visíveis: 0",
  )
  await page
    .getByRole("button", { name: "Restaurar todas as alterações", exact: true })
    .click()
  await expect(page.locator("#csv-findings-filter-summary")).toContainText(
    "Apontamentos visíveis: 1",
  )
  await page.getByRole("combobox", { name: "Preço", exact: true }).click()
  await page
    .getByRole("option", { name: "Coluna 5: Estoque", exact: true })
    .click()
  await expect(search).toHaveValue("")
  await search.fill("varios")
  await file.setInputFiles("tests/fixtures/validacao-previa.csv")
  await page.getByRole("combobox", { name: "Preço", exact: true }).click()
  await page
    .getByRole("option", { name: "Coluna 4: Preço", exact: true })
    .click()
  await expect(search).toHaveValue("")
})
