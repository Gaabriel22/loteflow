import { readFile } from "node:fs/promises"
import { expect, test, type Page } from "@playwright/test"
import AxeBuilder from "@axe-core/playwright"
import { parse } from "papaparse"
import { utils, write } from "xlsx"

async function chooseProfile(page: Page, label: string) {
  await page
    .getByRole("combobox", { name: "Perfil de validação", exact: true })
    .click()
  await page.getByRole("option", { name: label, exact: true }).click()
}
async function mapField(page: Page, field: string, option: string) {
  await page.getByRole("combobox", { name: field, exact: true }).click()
  await page.getByRole("option", { name: option, exact: true }).click()
}

test("alterna perfis sem perder trabalho e exporta snapshot completo com fonte", async ({
  page,
  baseURL,
}) => {
  const unexpected: string[] = []
  page.on("request", (request) => {
    if (
      request.method() !== "GET" ||
      new URL(request.url()).origin !== new URL(baseURL!).origin
    )
      unexpected.push(request.url())
  })
  await page.goto("/#importar-csv")
  const rows = Array.from({ length: 1001 }, (_, i) => `SKU-${i};1`)
  rows[0] = `${"A".repeat(61)};x`
  await page.getByLabel("Arquivo CSV ou XLSX", { exact: true }).setInputFiles({
    name: "perfis.csv",
    mimeType: "text/csv",
    buffer: Buffer.from(["SKU;Preço", ...rows].join("\n")),
  })
  const picker = page.getByRole("combobox", {
    name: "Perfil de validação",
    exact: true,
  })
  await expect(picker).toContainText("Genérico")
  await mapField(page, "SKU", "Coluna 1: SKU")
  await mapField(page, "Preço", "Coluna 2: Preço")
  const required = page.getByRole("checkbox", {
    name: "Exigir Preço",
    exact: true,
  })
  await required.uncheck()
  await page
    .getByRole("button", { name: "Editar valores", exact: true })
    .click()
  const sku = page.getByRole("textbox", {
    name: "Registro 1, SKU",
    exact: true,
  })
  await sku.fill("B".repeat(62))
  await picker.focus()
  await page.keyboard.press("ArrowDown")
  await page
    .getByRole("option", { name: "Bling experimental", exact: true })
    .press("Enter")
  const results = page.getByRole("region", {
    name: "Validação Bling experimental",
    exact: true,
  })
  await expect(results.getByRole("status")).toContainText(
    "Apontamentos: 3. Erros: 1. Avisos: 2.",
  )
  await expect(sku).toHaveValue("B".repeat(62))
  await expect(required).not.toBeChecked()
  await expect(
    page.getByRole("link", {
      name: "Guia oficial do Bling para cadastrar produtos simples por planilha",
      exact: true,
    }),
  ).toHaveAttribute("href", /ajuda\.bling\.com\.br/)
  await page
    .getByRole("combobox", { name: "Filtrar por campo", exact: true })
    .click()
  await page.getByRole("option", { name: "Arquivo", exact: true }).click()
  await expect(results.getByRole("table")).toHaveCount(0)
  await expect(results).toContainText("O documento tem 1.001 registros")
  const pending = page.waitForEvent("download")
  await page
    .getByRole("button", { name: "Baixar relatório CSV", exact: true })
    .click()
  const download = await pending
  const report = parse<Record<string, string>>(
    await readFile((await download.path())!, "utf8"),
    { header: true, delimiter: ";" },
  ).data
  expect(report).toHaveLength(3)
  expect(
    report.every(
      (row) =>
        row["Perfil de validação"] === "Bling experimental" &&
        row["Versão do perfil"] === "2026-11-20.1",
    ),
  ).toBe(true)
  expect(report[0]).toMatchObject({
    Campo: "Arquivo",
    "Registro do arquivo": "",
    "Linha de origem": "",
    "Coluna de origem": "",
  })
  await chooseProfile(page, "Genérico")
  await expect(
    page.getByRole("combobox", { name: "Filtrar por campo", exact: true }),
  ).toContainText("Todos os campos")
  await expect(sku).toHaveValue("B".repeat(62))
  await expect(required).not.toBeChecked()
  await expect(
    page
      .getByRole("region", {
        name: "Validação genérica do arquivo",
        exact: true,
      })
      .getByRole("status"),
  ).toContainText("Apontamentos: 1.")
  expect(unexpected).toEqual([])
})

test("perfil parcial tem controles acessíveis, reflow e reinicia ao trocar aba XLSX", async ({
  page,
}) => {
  const workbook = utils.book_new()
  for (const name of ["Primeira", "Segunda"])
    utils.book_append_sheet(
      workbook,
      utils.aoa_to_sheet([["SKU"], ["A".repeat(61)]]),
      name,
    )
  await page.goto("/#importar-csv")
  await page.getByLabel("Arquivo CSV ou XLSX", { exact: true }).setInputFiles({
    name: "perfis.xlsx",
    mimeType: "application/octet-stream",
    buffer: Buffer.from(write(workbook, { bookType: "xlsx", type: "array" })),
  })
  const sheet = page.getByRole("combobox", {
    name: "Aba da planilha",
    exact: true,
  })
  await sheet.click()
  await page.getByRole("option", { name: "Primeira", exact: true }).click()
  await page.getByRole("button", { name: "Abrir aba", exact: true }).click()
  await mapField(page, "SKU", "Coluna 1: SKU")
  await chooseProfile(page, "Bling experimental")
  await expect(
    page.getByRole("region", {
      name: "Validação Bling experimental",
      exact: true,
    }),
  ).toContainText("O SKU ultrapassa 60 caracteres")
  const picker = page.getByRole("combobox", {
    name: "Perfil de validação",
    exact: true,
  })
  for (const width of [390, 195, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    await picker.scrollIntoViewIfNeeded()
    await picker.click()
    const bounds = await page.getByRole("listbox").boundingBox()
    expect(bounds!.x).toBeGreaterThanOrEqual(0)
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width)
    await page.keyboard.press("Escape")
    await expect(picker).toBeFocused()
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(width)
  }
  const audit = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze()
  expect(audit.violations).toEqual([])
  await sheet.click()
  await page.getByRole("option", { name: "Segunda", exact: true }).click()
  await page.getByRole("button", { name: "Abrir aba", exact: true }).click()
  await expect(picker).toContainText("Genérico")
  await chooseProfile(page, "Bling experimental")
  await page
    .getByLabel("Arquivo CSV ou XLSX", { exact: true })
    .setInputFiles("tests/fixtures/produtos.csv")
  await expect(picker).toContainText("Genérico")
})

test("trocar perfil cancela relatório anterior e a nova geração usa perfil atual", async ({
  page,
}) => {
  await page.goto("/#importar-csv")
  await page.getByLabel("Arquivo CSV ou XLSX", { exact: true }).setInputFiles({
    name: "cancelar.csv",
    mimeType: "text/csv",
    buffer: Buffer.from(`SKU;Preço\n${"A".repeat(61)};x`),
  })
  await mapField(page, "SKU", "Coluna 1: SKU")
  await mapField(page, "Preço", "Coluna 2: Preço")
  await chooseProfile(page, "Bling experimental")
  const downloads: string[] = []
  page.on("download", (download) =>
    downloads.push(download.suggestedFilename()),
  )
  let release!: () => void
  const blocked = new Promise<void>((resolve) => {
    release = resolve
  })
  await page.route("**/*.js*", async (route) => {
    await blocked
    await route.continue()
  })
  await page
    .getByRole("button", { name: "Baixar relatório CSV", exact: true })
    .click()
  await expect(
    page.getByRole("button", { name: "Cancelar relatório", exact: true }),
  ).toBeVisible()
  await chooseProfile(page, "Genérico")
  release()
  await page.unrouteAll({ behavior: "wait" })
  expect(downloads).toEqual([])
  const pending = page.waitForEvent("download")
  await page
    .getByRole("button", { name: "Baixar relatório CSV", exact: true })
    .click()
  const download = await pending
  const report = await readFile((await download.path())!, "utf8")
  expect(report).toContain("Genérico")
  expect(report).not.toContain("Bling experimental")
})
