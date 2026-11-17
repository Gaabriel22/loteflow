import { expect, test } from "@playwright/test"

test("lê tabulação com BOM, aspas, acentos e identificadores como texto", async ({
  page,
}) => {
  const sentRequests: string[] = []
  page.on("request", (request) => {
    if (request.method() !== "GET") sentRequests.push(request.url())
  })
  await page.goto("/#importar-csv")
  await page.getByLabel("Arquivo CSV ou XLSX", { exact: true }).setInputFiles({
    name: "tabulado.csv",
    mimeType: "text/csv",
    buffer: Buffer.from(
      '\uFEFFSKU\tDescrição\tPreço\r\n000123\t"Café\t😀; com vírgula, e ""aspas""\r\nsegunda linha"\t19,90\r\n000456\t=1+1\t2,00',
    ),
  })
  await expect(page.locator("#csv-import-status")).toContainText(
    "2 registros e 3 colunas",
  )
  const table = page.getByRole("table")
  await expect(
    table.getByRole("columnheader", { name: "SKU", exact: true }),
  ).toBeVisible()
  await expect(table).toContainText("000123")
  await expect(table).toContainText(
    'Café 😀; com vírgula, e "aspas" segunda linha',
  )
  await expect(table).toContainText("=1+1")
  expect(sentRequests).toEqual([])
})

test("rejeita codificações incompatíveis e bytes inválidos tardios e recupera seleção", async ({
  page,
}) => {
  await page.goto("/#importar-csv")
  const file = page.getByLabel("Arquivo CSV ou XLSX", { exact: true })
  await file.setInputFiles("tests/fixtures/produtos.csv")
  await expect(page.getByRole("table")).toBeVisible()
  const incompatibleFiles = [
    Buffer.from("SKU,Descrição\n001,Café", "latin1"),
    Buffer.from("\uFEFFSKU,Nome\n001,Café", "utf16le"),
    Buffer.from("SKU,Nome\n001,Café", "utf16le"),
    Buffer.concat([Buffer.from("SKU,Nome\n001,"), Buffer.from([0xe2, 0x82])]),
    Buffer.concat([
      Buffer.from("SKU,Nome\n" + "001,Café\n".repeat(105)),
      Buffer.from([0xff]),
    ]),
  ]
  for (const buffer of incompatibleFiles) {
    await file.setInputFiles({
      name: "incompativel.csv",
      mimeType: "text/csv",
      buffer,
    })
    await expect(
      page.locator("#importar-csv").getByRole("alert"),
    ).toContainText("Salve uma cópia CSV em UTF-8")
    await expect(page.getByRole("table")).toHaveCount(0)
    await expect(file).toBeEnabled()
  }
  await file.setInputFiles("tests/fixtures/produtos.csv")
  await expect(page.locator("#importar-csv").getByRole("alert")).toHaveCount(0)
  await expect(page.getByRole("table")).toContainText("Café, torrado")
})
