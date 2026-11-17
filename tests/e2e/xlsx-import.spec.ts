import { readFile } from "node:fs/promises"
import AxeBuilder from "@axe-core/playwright"
import { expect, test } from "@playwright/test"
import { utils, write } from "xlsx"

function workbookFile() {
  const workbook = utils.book_new()
  const sheet = utils.aoa_to_sheet([
    ["SKU", "Preço", "Produto"],
    ["00123", "grátis", "<b>Texto</b>"],
    [123, 1, "Café"],
  ])
  sheet.A3.z = "00000"
  utils.book_append_sheet(workbook, sheet, "Produtos")
  utils.book_append_sheet(
    workbook,
    utils.aoa_to_sheet([["SKU"], ["OUTRA"]]),
    "Outra aba",
  )
  const formula = utils.aoa_to_sheet([["SKU"], [2]])
  formula.A2.f = "1+1"
  utils.book_append_sheet(workbook, formula, "Fórmulas")
  return {
    name: "produtos.xlsx",
    mimeType:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    buffer: Buffer.from(
      write(workbook, { type: "array", bookType: "xlsx", compression: true }),
    ),
  }
}

test("seletor com nome longo cabe no mobile e no reflow equivalente a 200%", async ({
  page,
}) => {
  const workbook = utils.book_new()
  utils.book_append_sheet(
    workbook,
    utils.aoa_to_sheet([["SKU"], ["001"]]),
    "Produtos com identificadores",
  )
  await page.goto("/#importar-csv")
  await page.getByLabel("Arquivo CSV ou XLSX", { exact: true }).setInputFiles({
    name: "nome-longo.xlsx",
    mimeType: "application/octet-stream",
    buffer: Buffer.from(write(workbook, { type: "array", bookType: "xlsx" })),
  })
  const picker = page.getByRole("combobox", {
    name: "Aba da planilha",
    exact: true,
  })
  await picker.click()
  await page
    .getByRole("option", { name: "Produtos com identificadores", exact: true })
    .click()
  for (const width of [390, 195, 720, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    await picker.scrollIntoViewIfNeeded()
    await picker.click()
    const bounds = await page.getByRole("listbox").boundingBox()
    expect(bounds).not.toBeNull()
    expect(bounds!.x).toBeGreaterThanOrEqual(0)
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width)
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(width)
    await page.keyboard.press("Escape")
    await expect(picker).toBeFocused()
  }
})

test("escolhe aba, preserva zeros, revisa e exporta sem enviar conteúdo", async ({
  page,
  baseURL,
}) => {
  const requests: string[] = []
  page.on("request", (request) => {
    if (
      new URL(request.url()).origin !== new URL(baseURL!).origin ||
      !["GET", "HEAD"].includes(request.method())
    )
      requests.push(request.url())
  })
  await page.goto("/#importar-csv")
  await page
    .getByLabel("Arquivo CSV ou XLSX", { exact: true })
    .setInputFiles(workbookFile())
  const picker = page.getByRole("combobox", {
    name: "Aba da planilha",
    exact: true,
  })
  await expect(picker).toBeVisible()
  await expect(page.getByRole("table")).toHaveCount(0)
  await expect(
    page.getByRole("button", { name: "Abrir aba", exact: true }),
  ).toBeDisabled()
  await picker.focus()
  await page.keyboard.press("ArrowDown")
  await page
    .getByRole("option", { name: "Produtos", exact: true })
    .press("Enter")
  await page
    .getByRole("button", { name: "Abrir aba", exact: true })
    .press("Enter")
  await expect(
    page.getByText("Aba aberta: Produtos", { exact: true }),
  ).toBeVisible()
  await expect(
    page.getByRole("cell", { name: "00123", exact: true }),
  ).toHaveCount(2)
  await expect(
    page.getByRole("cell", { name: "<b>Texto</b>", exact: true }),
  ).toBeVisible()
  await expect(page.locator("tbody b")).toHaveCount(0)
  await page.getByRole("combobox", { name: "SKU", exact: true }).click()
  await page.getByRole("option", { name: "Coluna 1: SKU", exact: true }).click()
  await page
    .getByRole("button", { name: "Editar valores", exact: true })
    .click()
  await page
    .getByRole("textbox", { name: "Registro 2, SKU", exact: true })
    .fill("00234")
  await page.getByRole("combobox", { name: "Preço", exact: true }).click()
  await page
    .getByRole("option", { name: "Coluna 2: Preço", exact: true })
    .click()
  const pending = page.waitForEvent("download")
  await page
    .getByRole("button", { name: "Baixar relatório CSV", exact: true })
    .click()
  const download = await pending
  const csv = await readFile((await download.path())!, "utf8")
  expect(csv).toContain("00123")
  expect(csv).not.toContain("OUTRA")
  const accessibility = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze()
  expect(accessibility.violations).toEqual([])
  await picker.click()
  await page.getByRole("option", { name: "Outra aba", exact: true }).click()
  await expect(page.getByRole("table")).toHaveCount(0)
  await page.getByRole("button", { name: "Abrir aba", exact: true }).click()
  await expect(page.locator("#csv-column-mapping-status")).toContainText(
    "0 de 5",
  )
  await expect(
    page.getByRole("cell", { name: "OUTRA", exact: true }),
  ).toBeVisible()
  expect(requests).toEqual([])
})

test("recusa fórmula e arquivo incompatível, recupera com CSV e limpa seleção", async ({
  page,
}) => {
  await page.goto("/#importar-csv")
  const input = page.getByLabel("Arquivo CSV ou XLSX", { exact: true })
  await input.setInputFiles(workbookFile())
  const picker = page.getByRole("combobox", {
    name: "Aba da planilha",
    exact: true,
  })
  await picker.click()
  await page.getByRole("option", { name: "Fórmulas", exact: true }).click()
  await page.getByRole("button", { name: "Abrir aba", exact: true }).click()
  await expect(page.locator("#importar-csv").getByRole("alert")).toContainText(
    "fórmulas, erros ou células mescladas",
  )
  await expect(page.getByRole("table")).toHaveCount(0)
  await input.setInputFiles({
    name: "falso.xlsx",
    mimeType: "application/octet-stream",
    buffer: Buffer.from("SKU\n123"),
  })
  await expect(page.locator("#importar-csv").getByRole("alert")).toContainText(
    "XLSX válido, sem senha",
  )
  await expect(picker).toHaveCount(0)
  await input.setInputFiles({
    name: "antigo.xlsm",
    mimeType: "application/octet-stream",
    buffer: Buffer.from("dado"),
  })
  await expect(page.locator("#importar-csv").getByRole("alert")).toContainText(
    "extensão .csv ou .xlsx",
  )
  await input.setInputFiles("tests/fixtures/produtos.csv")
  await expect(page.getByRole("table")).toBeVisible()
  await page
    .getByRole("button", { name: "Limpar arquivo", exact: true })
    .click()
  await expect(page.getByRole("table")).toHaveCount(0)
})

test("cancela inspeção XLSX e ignora resultado anterior", async ({ page }) => {
  await page.goto("/#importar-csv")
  await page.route("**/*.js*", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 500))
    await route.continue()
  })
  const input = page.getByLabel("Arquivo CSV ou XLSX", { exact: true })
  await input.setInputFiles(workbookFile())
  await page
    .getByRole("button", { name: "Cancelar leitura", exact: true })
    .press("Enter")
  await expect(input).toBeFocused()
  await page.unrouteAll({ behavior: "wait" })
  await expect(
    page.getByRole("combobox", { name: "Aba da planilha", exact: true }),
  ).toHaveCount(0)
  await input.setInputFiles("tests/fixtures/produtos.csv")
  await expect(page.getByRole("table")).toBeVisible()
})
