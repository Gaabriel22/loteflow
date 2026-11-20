import { readFile } from "node:fs/promises"
import AxeBuilder from "@axe-core/playwright"
import { expect, test, type Page } from "@playwright/test"
import { parse } from "papaparse"
import { utils, write } from "xlsx"

async function mapField(page: Page, field: string, option: string) {
  await page.getByRole("combobox", { name: field, exact: true }).click()
  await page.getByRole("option", { name: option, exact: true }).click()
}

test("exporta avisos de cabeçalho sem registros nem mapeamento e filtra severidade", async ({
  page,
  baseURL,
}) => {
  const sent: string[] = []
  page.on("request", (request) => {
    if (
      request.method() !== "GET" ||
      new URL(request.url()).origin !== new URL(baseURL!).origin
    )
      sent.push(request.url())
  })
  await page.goto("/#importar-csv")
  await page.getByLabel("Arquivo CSV ou XLSX", { exact: true }).setInputFiles({
    name: "cabecalho.csv",
    mimeType: "text/csv",
    buffer: Buffer.from("SKU; sku ;Nome"),
  })
  const results = page.getByRole("region", {
    name: "Validação genérica do arquivo",
    exact: true,
  })
  await expect(results.getByRole("status")).toHaveText(
    "Registros analisados: 0. Registros para revisar: 0. Apontamentos: 2. Erros: 0. Avisos: 2.",
  )
  await expect(page.getByRole("checkbox")).toHaveCount(0)
  const table = results.getByRole("table", {
    name: "Cabeçalhos para revisar",
    exact: true,
  })
  await expect(table.locator("tbody tr")).toHaveCount(2)
  await page
    .getByRole("combobox", { name: "Filtrar por severidade", exact: true })
    .click()
  await page.getByRole("option", { name: "Erros", exact: true }).click()
  await expect(table).toHaveCount(0)
  const pending = page.waitForEvent("download")
  await results
    .getByRole("button", { name: "Baixar relatório CSV", exact: true })
    .click()
  const download = await pending
  const rows = parse<Record<string, string>>(
    await readFile((await download.path())!, "utf8"),
    { header: true, delimiter: ";" },
  ).data
  expect(rows).toHaveLength(2)
  expect(rows[0]).toMatchObject({
    "Registro do arquivo": "",
    "Linha de origem": "1",
    "Coluna de origem": "1 (A)",
    Severidade: "Aviso",
  })
  expect(rows[1]?.["Coluna de origem"]).toBe("2 (B)")
  await page
    .getByRole("button", { name: "Limpar filtros", exact: true })
    .click()
  await expect(table).toBeVisible()
  const audit = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze()
  expect(audit.violations).toEqual([])
  expect(sent).toEqual([])
})

test("configura obrigatoriedade por teclado, preserva sessão e localiza CSV multilinha", async ({
  page,
}) => {
  await page.goto("/#importar-csv")
  const file = {
    name: "multilinha.csv",
    mimeType: "text/csv",
    buffer: Buffer.from(
      'SKU;Preço;Descrição;Outra\r\n"00\r\n1";;Produto;texto\r\n002;grátis;Outro;texto',
    ),
  }
  const input = page.getByLabel("Arquivo CSV ou XLSX", { exact: true })
  await input.setInputFiles(file)
  await mapField(page, "SKU", "Coluna 1: SKU")
  await mapField(page, "Preço", "Coluna 2: Preço")
  const results = page.getByRole("region", {
    name: "Validação genérica do arquivo",
    exact: true,
  })
  const status = results.getByRole("status")
  await expect(status).toContainText("Erros: 2. Avisos: 0.")
  await expect(
    results
      .getByRole("row")
      .filter({ has: page.getByRole("rowheader", { name: "2", exact: true }) }),
  ).toContainText("Linha de origem: 4. Coluna de origem: 2 (B).")
  const required = page.getByRole("checkbox", {
    name: "Exigir Preço",
    exact: true,
  })
  await expect(required).toBeChecked()
  await required.focus()
  await page.keyboard.press("Space")
  await expect(required).not.toBeChecked()
  await expect(required).toBeFocused()
  await expect(status).toContainText("Erros: 1. Avisos: 0.")
  await mapField(page, "Preço", "Não mapeado")
  await mapField(page, "Preço", "Coluna 2: Preço")
  await expect(required).not.toBeChecked()
  await page
    .getByRole("button", { name: "Editar valores", exact: true })
    .click()
  await page
    .getByRole("textbox", { name: "Registro 2, Preço", exact: true })
    .fill("1,00")
  await expect(status).toContainText("Apontamentos: 0.")
  await page
    .getByRole("button", { name: "Restaurar todas as alterações", exact: true })
    .click()
  await expect(required).not.toBeChecked()
  await expect(status).toContainText("Erros: 1.")
  for (const width of [390, 195, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(width)
  }
  const audit = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze()
  expect(audit.violations).toEqual([])
  await input.setInputFiles(file)
  await mapField(page, "Preço", "Coluna 2: Preço")
  await expect(required).toBeChecked()
})

test("localiza XLSX na coluna original e reinicia configuração ao trocar aba", async ({
  page,
}) => {
  const workbook = utils.book_new()
  utils.book_append_sheet(
    workbook,
    utils.aoa_to_sheet([
      ["SKU", "SKU", "Preço"],
      ["001", "002", "x"],
    ]),
    "Produtos",
  )
  utils.book_append_sheet(
    workbook,
    utils.aoa_to_sheet([["Preço"], ["x"]]),
    "Outra",
  )
  await page.goto("/#importar-csv")
  await page.getByLabel("Arquivo CSV ou XLSX", { exact: true }).setInputFiles({
    name: "origem.xlsx",
    mimeType: "application/octet-stream",
    buffer: Buffer.from(write(workbook, { bookType: "xlsx", type: "array" })),
  })
  const picker = page.getByRole("combobox", {
    name: "Aba da planilha",
    exact: true,
  })
  await picker.click()
  await page.getByRole("option", { name: "Produtos", exact: true }).click()
  await page.getByRole("button", { name: "Abrir aba", exact: true }).click()
  await expect(
    page.getByRole("table", { name: "Cabeçalhos para revisar", exact: true }),
  ).toBeVisible()
  await mapField(page, "Preço", "Coluna 3: Preço")
  const results = page.getByRole("region", {
    name: "Validação genérica do arquivo",
    exact: true,
  })
  await expect(results).toContainText(
    "Linha de origem: 2. Coluna de origem: 3 (C).",
  )
  const required = page.getByRole("checkbox", {
    name: "Exigir Preço",
    exact: true,
  })
  await required.uncheck()
  await picker.click()
  await page.getByRole("option", { name: "Outra", exact: true }).click()
  await page.getByRole("button", { name: "Abrir aba", exact: true }).click()
  await mapField(page, "Preço", "Coluna 1: Preço")
  await expect(required).toBeChecked()
  await expect(
    page.getByRole("table", { name: "Cabeçalhos para revisar", exact: true }),
  ).toHaveCount(0)
  await expect(results).toContainText(
    "Linha de origem: 2. Coluna de origem: 1 (A).",
  )
})
