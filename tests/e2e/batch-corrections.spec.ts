import { readFile } from "node:fs/promises"
import AxeBuilder from "@axe-core/playwright"
import { expect, test, type Page } from "@playwright/test"
import { parse } from "papaparse"
import { utils, write } from "xlsx"

async function uploadCsv(
  page: Page,
  body = 'SKU;Descrição;Preço;Extra\n" 0001 ";" Item  A ";00012,50;" keep "\n;;;\n0002;" Item B ";x;\n;;;proteger\n0003;" Item C ";1,234;',
) {
  await page.goto("/#importar-csv")
  await page.getByLabel("Arquivo CSV ou XLSX", { exact: true }).setInputFiles({
    name: "correcoes.csv",
    mimeType: "text/csv",
    buffer: Buffer.from(body),
  })
  await expect(
    page.getByRole("heading", { name: "Corrigir em lote", exact: true }),
  ).toBeVisible()
}

async function mapField(page: Page, field: string, column: string) {
  await page.getByRole("combobox", { name: field, exact: true }).click()
  await page.getByRole("option", { name: column, exact: true }).click()
}

async function selectCorrections(page: Page) {
  await page
    .getByRole("checkbox", { name: "Aparar Coluna 2: Descrição", exact: true })
    .check()
  await page
    .getByRole("checkbox", { name: "Aparar Coluna 4: Extra", exact: true })
    .check()
  await page
    .getByRole("checkbox", { name: "Normalizar Coluna 3: Preço", exact: true })
    .check()
  await page
    .getByRole("checkbox", {
      name: "Remover registros totalmente vazios em todas as colunas",
      exact: true,
    })
    .check()
}

async function generate(page: Page) {
  await page
    .getByRole("button", { name: "Gerar prévia de correções", exact: true })
    .click()
  await expect(
    page
      .getByRole("region", { name: "Corrigir em lote", exact: true })
      .getByRole("status"),
  ).toContainText("Prévia pronta")
}

test("confirma lote, preserva original e edições anteriores, desfaz e mantém origem no relatório", async ({
  page,
}) => {
  await uploadCsv(page)
  for (const [field, column] of [
    ["SKU", "Coluna 1: SKU"],
    ["Descrição", "Coluna 2: Descrição"],
    ["Preço", "Coluna 3: Preço"],
  ])
    await mapField(page, field, column)
  await page
    .getByRole("checkbox", { name: "Exigir Preço", exact: true })
    .uncheck()
  await page
    .getByRole("combobox", { name: "Perfil de validação", exact: true })
    .click()
  await page
    .getByRole("option", { name: "Bling experimental", exact: true })
    .click()
  await page
    .getByRole("button", { name: "Editar valores", exact: true })
    .click()
  await page
    .getByRole("textbox", { name: "Registro 3, Descrição", exact: true })
    .fill(" Manual B ")
  await expect(
    page.getByRole("button", {
      name: "Gerar prévia de correções",
      exact: true,
    }),
  ).toBeDisabled()
  await selectCorrections(page)
  await generate(page)
  const batch = page.getByRole("region", {
    name: "Corrigir em lote",
    exact: true,
  })
  await expect(batch).toContainText('" Manual B "')
  await expect(batch).toContainText('"Manual B"')
  await expect(batch).toContainText("Registros a remover: 1")
  await expect(batch).toContainText("ambíguo: 2")
  await expect(
    page.getByRole("textbox", { name: "Registro 3, Descrição", exact: true }),
  ).toHaveValue(" Manual B ")
  await page
    .getByRole("button", { name: "Aplicar correções da prévia", exact: true })
    .click()
  await expect(page.locator("#csv-edit-status")).toBeFocused()
  await expect(page.locator("#csv-edit-status")).toContainText(
    "4 registros na cópia de trabalho. 1 registro removido",
  )
  await expect(
    page.getByRole("textbox", { name: "Registro 2, Descrição", exact: true }),
  ).toHaveValue("Manual B")
  await expect(
    page.getByRole("textbox", { name: "Registro 1, SKU", exact: true }),
  ).toHaveValue(" 0001 ")
  await expect(
    page.getByRole("textbox", { name: "Registro 1, Preço", exact: true }),
  ).toHaveValue("00012.50")
  await expect(
    page.getByRole("combobox", { name: "Perfil de validação", exact: true }),
  ).toContainText("Bling experimental")
  await expect(
    page.getByRole("checkbox", { name: "Exigir Preço", exact: true }),
  ).not.toBeChecked()
  const original = page.getByRole("region", {
    name: "Prévia do arquivo. Role na horizontal para consultar todas as colunas.",
    exact: true,
  })
  await expect(original).toContainText("00012,50")
  await expect(original.getByRole("row")).toHaveCount(6)
  await page
    .getByRole("button", { name: "Desfazer último lote", exact: true })
    .click()
  await expect(
    page.getByRole("textbox", { name: "Registro 3, Descrição", exact: true }),
  ).toHaveValue(" Manual B ")
  await expect(page.locator("#csv-edit-status")).toContainText(
    "0 registros removidos",
  )
  await selectCorrections(page)
  await generate(page)
  await page
    .getByRole("button", { name: "Aplicar correções da prévia", exact: true })
    .click()
  const price = page.getByRole("textbox", {
    name: "Registro 2, Preço",
    exact: true,
  })
  await price.fill("1234")
  await expect(
    page.getByRole("button", { name: "Desfazer último lote", exact: true }),
  ).toHaveCount(0)
  await page
    .getByRole("button", {
      name: "Restaurar valor original do registro 2, campo Preço",
      exact: true,
    })
    .click()
  await expect(price).toHaveValue("x")
  const pending = page.waitForEvent("download")
  await page
    .getByRole("button", { name: "Baixar relatório CSV", exact: true })
    .click()
  const download = await pending
  const report = parse<Record<string, string>>(
    await readFile((await download.path())!, "utf8"),
    { header: true, delimiter: ";" },
  ).data
  expect(report).toContainEqual(
    expect.objectContaining({
      Campo: "Preço",
      "Registro do arquivo": "2",
      "Linha de origem": "4",
      "Total de registros do arquivo": "4",
      "Valor: Preço": "x",
      "Perfil de validação": "Bling experimental",
    }),
  )
  await page
    .getByRole("button", { name: "Restaurar todas as alterações", exact: true })
    .click()
  await expect(
    page.getByRole("textbox", { name: "Registro 3, Descrição", exact: true }),
  ).toHaveValue(" Item B ")
  await expect(page.locator("#csv-edit-status")).toContainText(
    "0 células alteradas. 5 registros",
  )
})

test("prévia integral paginada, descarte, teclado, axe e reflow", async ({
  page,
}) => {
  await uploadCsv(
    page,
    [
      "Descrição",
      ...Array.from({ length: 205 }, (_, index) => ` Item ${index + 1} `),
    ].join("\n"),
  )
  await mapField(page, "Descrição", "Coluna 1: Descrição")
  const checkbox = page.getByRole("checkbox", {
    name: "Aparar Coluna 1: Descrição",
    exact: true,
  })
  await checkbox.focus()
  await page.keyboard.press("Space")
  await expect(checkbox).toBeChecked()
  await generate(page)
  const table = page.getByRole("table", {
    name: "Prévia das correções",
    exact: true,
  })
  await expect(table.getByRole("row")).toHaveCount(101)
  const pagination = page.getByRole("navigation", {
    name: "Paginação da prévia de correções",
    exact: true,
  })
  await pagination
    .getByRole("button", { name: "Última página", exact: true })
    .click()
  await expect(table.getByRole("row")).toHaveCount(6)
  await expect(table).toContainText('" Item 205 "')
  const picker = page.getByRole("combobox", {
    name: "Usar separador decimal",
    exact: true,
  })
  for (const width of [1440, 390, 195]) {
    await page.setViewportSize({ width, height: 900 })
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
  await page
    .getByRole("button", { name: "Descartar prévia", exact: true })
    .click()
  await expect(table).toHaveCount(0)
  await expect(
    page.getByRole("button", {
      name: "Gerar prévia de correções",
      exact: true,
    }),
  ).toBeFocused()
  await expect(page.locator("#csv-edit-status")).toContainText(
    "0 células alteradas",
  )
  await generate(page)
  await page
    .getByRole("button", { name: "Aplicar correções da prévia", exact: true })
    .click()
  await expect(page.locator("#csv-edit-status")).toContainText(
    "205 células alteradas",
  )
})

test("cancela Worker, impede prévia obsoleta e permite recuperar falha", async ({
  page,
}) => {
  await uploadCsv(page)
  const checkbox = page.getByRole("checkbox", {
    name: "Aparar Coluna 2: Descrição",
    exact: true,
  })
  await checkbox.check()
  let release!: () => void
  const blocked = new Promise<void>((resolve) => {
    release = resolve
  })
  await page.route("**/*.js*", async (route) => {
    await blocked
    await route.continue()
  })
  await page
    .getByRole("button", { name: "Gerar prévia de correções", exact: true })
    .click()
  await expect(
    page.getByRole("button", { name: "Cancelar prévia", exact: true }),
  ).toBeVisible()
  await page
    .getByRole("button", { name: "Cancelar prévia", exact: true })
    .click()
  await expect(
    page.getByRole("button", {
      name: "Gerar prévia de correções",
      exact: true,
    }),
  ).toBeFocused()
  release()
  await page.unrouteAll({ behavior: "wait" })
  await expect(
    page.getByRole("table", { name: "Prévia das correções", exact: true }),
  ).toHaveCount(0)
  await page.route("**/*.js*", (route) => route.abort())
  await page
    .getByRole("button", { name: "Gerar prévia de correções", exact: true })
    .click()
  await expect(
    page
      .getByRole("alert")
      .filter({ hasText: "Não foi possível gerar a prévia" }),
  ).toBeVisible()
  await page.unrouteAll()
  await generate(page)
  await checkbox.uncheck()
  await expect(
    page.getByRole("button", {
      name: "Aplicar correções da prévia",
      exact: true,
    }),
  ).toHaveCount(0)
  await checkbox.check()
  await generate(page)
  await mapField(page, "Descrição", "Coluna 2: Descrição")
  await expect(
    page.getByRole("button", {
      name: "Aplicar correções da prévia",
      exact: true,
    }),
  ).toHaveCount(0)
  await checkbox.check()
  await generate(page)
  await page
    .getByRole("button", { name: "Editar valores", exact: true })
    .click()
  await page
    .getByRole("textbox", { name: "Registro 1, Descrição", exact: true })
    .fill("Manual")
  await expect(
    page.getByRole("button", {
      name: "Aplicar correções da prévia",
      exact: true,
    }),
  ).toHaveCount(0)
  await page
    .getByRole("button", { name: "Limpar arquivo", exact: true })
    .click()
  await expect(
    page.getByRole("heading", { name: "Corrigir em lote", exact: true }),
  ).toHaveCount(0)
})

test("corrige aba XLSX inteira e descarta estado ao trocar aba", async ({
  page,
}) => {
  const workbook = utils.book_new()
  for (const name of ["Primeira", "Segunda"])
    utils.book_append_sheet(
      workbook,
      utils.aoa_to_sheet([["Descrição"], [" A "], [" "], [" B "]]),
      name,
    )
  await page.goto("/#importar-csv")
  await page.getByLabel("Arquivo CSV ou XLSX", { exact: true }).setInputFiles({
    name: "correcoes.xlsx",
    mimeType: "application/octet-stream",
    buffer: Buffer.from(write(workbook, { bookType: "xlsx", type: "array" })),
  })
  const picker = page.getByRole("combobox", {
    name: "Aba da planilha",
    exact: true,
  })
  await picker.click()
  await page.getByRole("option", { name: "Primeira", exact: true }).click()
  await page.getByRole("button", { name: "Abrir aba", exact: true }).click()
  await mapField(page, "Descrição", "Coluna 1: Descrição")
  await page
    .getByRole("checkbox", { name: "Aparar Coluna 1: Descrição", exact: true })
    .check()
  await page
    .getByRole("checkbox", {
      name: "Remover registros totalmente vazios em todas as colunas",
      exact: true,
    })
    .check()
  await generate(page)
  await page
    .getByRole("button", { name: "Aplicar correções da prévia", exact: true })
    .click()
  await expect(page.locator("#csv-edit-status")).toContainText(
    "2 registros na cópia de trabalho",
  )
  await picker.click()
  await page.getByRole("option", { name: "Segunda", exact: true }).click()
  await page.getByRole("button", { name: "Abrir aba", exact: true }).click()
  await expect(page.locator("#csv-edit-status")).toContainText(
    "0 células alteradas. 3 registros",
  )
  await expect(
    page.getByRole("button", { name: "Desfazer último lote", exact: true }),
  ).toHaveCount(0)
})

test("aplicar lote cancela relatório pendente sem iniciar download obsoleto", async ({
  page,
}) => {
  await uploadCsv(page)
  await mapField(page, "Preço", "Coluna 3: Preço")
  await page
    .getByRole("checkbox", { name: "Aparar Coluna 2: Descrição", exact: true })
    .check()
  await generate(page)
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
  await page
    .getByRole("button", { name: "Aplicar correções da prévia", exact: true })
    .click()
  release()
  await page.unrouteAll({ behavior: "wait" })
  await expect(
    page.getByRole("button", { name: "Cancelar relatório", exact: true }),
  ).toHaveCount(0)
  expect(downloads).toEqual([])
  await expect(page.locator("#csv-edit-status")).toContainText(
    "Correções aplicadas",
  )
})
