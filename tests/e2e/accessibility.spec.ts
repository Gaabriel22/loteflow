import AxeBuilder from "@axe-core/playwright"
import { expect, test } from "@playwright/test"

test("página inicial não tem violações WCAG 2.2 A/AA detectáveis por axe", async ({
  page,
}) => {
  await page.goto("/")

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

test("demonstração carregada não tem violações WCAG 2.2 A/AA detectáveis por axe", async ({
  page,
}) => {
  await page.goto("/#demonstracao")
  await page.getByRole("button", { name: "Carregar exemplo" }).click()

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

test("prévia CSV não tem violações WCAG 2.2 A/AA detectáveis por axe", async ({
  page,
}) => {
  await page.goto("/#importar-csv")
  await page
    .getByLabel("Arquivo CSV", { exact: true })
    .setInputFiles("tests/fixtures/produtos.csv")
  await expect(page.getByRole("table")).toBeVisible()

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

test("mapeamento CSV não tem violações WCAG 2.2 A/AA detectáveis por axe", async ({
  page,
}) => {
  await page.goto("/#importar-csv")
  await page
    .getByLabel("Arquivo CSV", { exact: true })
    .setInputFiles("tests/fixtures/mapeamento-colunas.csv")
  await page.getByRole("combobox", { name: "SKU" }).click()
  await page.getByRole("option", { name: "Coluna 1: SKU" }).click()

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
