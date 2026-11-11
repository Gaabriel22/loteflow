import { expect, test } from "@playwright/test"

test("lê CSV local e mostra valores como texto", async ({ page }) => {
  const requests: { method: string; url: string }[] = []
  page.on("request", (request) => {
    requests.push({ method: request.method(), url: request.url() })
  })

  await page.goto("/#importar-csv")
  const requestCountBeforeSelection = requests.length
  const fileInput = page.getByLabel("Arquivo CSV", { exact: true })

  await fileInput.setInputFiles("tests/fixtures/produtos.csv")

  await expect(page.locator('#importar-csv [role="status"]')).toContainText(
    "Leitura concluída. 3 registros e 3 colunas.",
  )
  await expect(page.getByRole("table")).toBeVisible()
  await expect(page.getByRole("table")).toContainText("Café, torrado")
  await expect(page.getByRole("table")).toContainText("Chá preto")
  await expect(page.getByRole("table")).toContainText("folhas soltas")
  await expect(page.getByRole("table")).toContainText("=1+1")
  await expect(page.getByRole("table")).toContainText(
    '=HYPERLINK("https://example.invalid")',
  )

  await fileInput.setInputFiles({
    name: "utf8-com-bom.csv",
    mimeType: "text/csv",
    buffer: Buffer.from("\uFEFFSKU,Produto\nBOM-01,Café"),
  })
  await expect(page.getByRole("columnheader", { name: "SKU" })).toBeVisible()

  const requestsAfterSelection = requests.slice(requestCountBeforeSelection)
  expect(
    requestsAfterSelection.some((request) => request.method === "POST"),
  ).toBe(false)
  expect(
    requestsAfterSelection.some((request) => /\/api(?:\/|$)/.test(request.url)),
  ).toBe(false)
})

test("rejeita arquivo vazio, extensão não aceita e mais de 10 MiB", async ({
  page,
}) => {
  await page.goto("/#importar-csv")
  const fileInput = page.getByLabel("Arquivo CSV", { exact: true })

  await fileInput.setInputFiles({
    name: "produtos.xlsx",
    mimeType: "text/csv",
    buffer: Buffer.from("SKU,Nome\n1,Café"),
  })
  await expect(page.locator("#importar-csv").getByRole("alert")).toContainText(
    "Selecione um arquivo com extensão .csv.",
  )

  await fileInput.setInputFiles({
    name: "vazio.csv",
    mimeType: "text/csv",
    buffer: Buffer.alloc(0),
  })
  await expect(page.locator("#importar-csv").getByRole("alert")).toContainText(
    "O arquivo está vazio.",
  )

  await fileInput.setInputFiles({
    name: "grande.csv",
    mimeType: "text/csv",
    buffer: Buffer.alloc(10 * 1024 * 1024 + 1, 65),
  })
  await expect(page.locator("#importar-csv").getByRole("alert")).toContainText(
    "passa de 10 MiB",
  )
  await expect(page.getByRole("table")).toHaveCount(0)

  await fileInput.setInputFiles({
    name: "sem-cabecalho.csv",
    mimeType: "text/csv",
    buffer: Buffer.from("\n1,Produto"),
  })
  await expect(page.locator("#importar-csv").getByRole("alert")).toContainText(
    "primeira linha precisa conter os nomes das colunas",
  )
})

test("limita a prévia a 100 registros e informa o total", async ({ page }) => {
  const records = Array.from(
    { length: 105 },
    (_, index) => `SKU-${index},Produto ${index}`,
  )
  const csv = ["SKU,Produto", ...records].join("\n")

  await page.goto("/#importar-csv")
  await page.getByLabel("Arquivo CSV", { exact: true }).setInputFiles({
    name: "muitos-registros.csv",
    mimeType: "text/csv",
    buffer: Buffer.from(csv),
  })

  await expect(page.locator('#importar-csv [role="status"]')).toContainText(
    "105 registros e 2 colunas",
  )
  await expect(page.locator('#importar-csv [role="status"]')).toContainText(
    "A prévia mostra os primeiros 100 registros.",
  )
  await expect(page.locator("tbody tr")).toHaveCount(100)
})

test("avisa sobre registros malformados e rejeita CSV com mais de 100 colunas", async ({
  page,
}) => {
  const fileInput = page.getByLabel("Arquivo CSV", { exact: true })
  await page.goto("/#importar-csv")

  await fileInput.setInputFiles({
    name: "estrutura.csv",
    mimeType: "text/csv",
    buffer: Buffer.from("SKU,Produto\nA,Produto extra\nB,Produto,Campo extra"),
  })
  await expect(page.locator('#importar-csv [role="status"]')).toContainText(
    "1 registro precisa de revisão",
  )
  await expect(page.getByText("Revise os registros sinalizados")).toBeVisible()
  await expect(page.getByRole("table")).toBeVisible()

  const tooManyColumns = [
    Array.from({ length: 101 }, (_, index) => `Campo ${index + 1}`).join(","),
    "",
  ].join("\n")
  await fileInput.setInputFiles({
    name: "muitas-colunas.csv",
    mimeType: "text/csv",
    buffer: Buffer.from(tooManyColumns),
  })
  await expect(page.getByRole("table")).toHaveCount(0)
  await expect(page.locator("#importar-csv").getByRole("alert")).toContainText(
    "mais de 100 colunas",
  )
})

test("mantém rolagem horizontal dentro da tabela em viewport mobile", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto("/#importar-csv")
  await page
    .getByLabel("Arquivo CSV", { exact: true })
    .setInputFiles("tests/fixtures/produtos.csv")
  await expect(page.getByRole("table")).toBeVisible()

  const dimensions = await page.evaluate(() => {
    const region = document.querySelector<HTMLElement>(
      '[aria-label^="Prévia CSV"]',
    )

    return {
      pageWidth: document.documentElement.scrollWidth,
      viewportWidth: window.innerWidth,
      regionWidth: region?.clientWidth ?? 0,
      regionScrollWidth: region?.scrollWidth ?? 0,
    }
  })

  expect(dimensions.pageWidth).toBeLessThanOrEqual(dimensions.viewportWidth)
  expect(dimensions.regionScrollWidth).toBeGreaterThan(dimensions.regionWidth)
})

test("troca arquivo sem mostrar dados anteriores e permite limpar", async ({
  page,
}) => {
  const fileInput = page.getByLabel("Arquivo CSV", { exact: true })
  await page.goto("/#importar-csv")

  await fileInput.setInputFiles("tests/fixtures/produtos.csv")
  await expect(page.getByRole("table")).toContainText("Café, torrado")

  await fileInput.setInputFiles({
    name: "invalido.xlsx",
    mimeType: "text/csv",
    buffer: Buffer.from("SKU,Nome\n1,Café"),
  })
  await expect(page.getByRole("table")).toHaveCount(0)
  await expect(page.locator("#importar-csv").getByRole("alert")).toBeVisible()

  await page.getByRole("button", { name: "Limpar arquivo" }).click()
  await expect(page.locator("#importar-csv").getByRole("alert")).toHaveCount(0)
  await expect(page.getByText("invalido.xlsx")).toHaveCount(0)
  await expect(page.locator('#importar-csv [role="status"]')).toContainText(
    "Selecione um arquivo CSV para consultar uma prévia local.",
  )
})
