import { expect, test } from "@playwright/test"

test("aceita 20.000 registros, mantém prévia de 100 e rejeita 20.001 sem resultado parcial", async ({
  page,
}) => {
  const sent: string[] = []
  page.on("request", (request) => {
    if (request.method() !== "GET") sent.push(request.url())
  })
  await page.goto("/#importar-csv")
  const file = page.getByLabel("Arquivo CSV", { exact: true })
  const records = Array.from(
    { length: 20_000 },
    (_, index) => `SKU-${index},Café ${index},0000${index}`,
  )
  const csv = "SKU,Nome,Outra\n" + records.join("\n") + "\n"
  await file.setInputFiles({
    name: "limite.csv",
    mimeType: "text/csv",
    buffer: Buffer.from(csv),
  })
  await expect(page.locator("#csv-import-status")).toContainText(
    "20.000 registros e 3 colunas",
  )
  await expect(page.locator("tbody tr")).toHaveCount(100)
  await expect(
    page.getByText(
      "Edição, análise e relatório cobrem todos os registros deste arquivo.",
      {
        exact: false,
      },
    ),
  ).toBeVisible()
  await file.setInputFiles({
    name: "excesso.csv",
    mimeType: "text/csv",
    buffer: Buffer.from(csv + "EXTRA,Produto,0001\n"),
  })
  await expect(page.locator("#importar-csv").getByRole("alert")).toContainText(
    "mais de 20.000 registros",
  )
  await expect(page.getByRole("table")).toHaveCount(0)
  await expect(file).toBeEnabled()
  expect(sent).toEqual([])
})

test("cancela Worker por teclado e permite nova seleção sem resultado atrasado", async ({
  page,
}) => {
  await page.goto("/#importar-csv")
  // Retarda apenas scripts carregados após a página para tornar o cancelamento determinístico.
  await page.route("**/*.js*", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 500))
    await route.continue()
  })
  const file = page.getByLabel("Arquivo CSV", { exact: true })
  await file.setInputFiles("tests/fixtures/produtos.csv")
  const cancel = page.getByRole("button", {
    name: "Cancelar leitura",
    exact: true,
  })
  await cancel.focus()
  await page.keyboard.press("Enter")
  await expect(page.locator("#csv-import-status")).toContainText(
    "Leitura cancelada",
  )
  await expect(file).toBeFocused()
  await expect(page.getByRole("table")).toHaveCount(0)
  await page.unrouteAll({ behavior: "wait" })
  await file.setInputFiles({
    name: "novo.csv",
    mimeType: "text/csv",
    buffer: Buffer.from("SKU,Nome\nNOVO,Produto novo"),
  })
  await expect(page.getByRole("table")).toContainText("NOVO")
  await expect(page.getByRole("table")).not.toContainText("Café, torrado")
})

test("preserva linhas vazias explícitas sem criar registro pelo terminador final", async ({
  page,
}) => {
  await page.goto("/#importar-csv")
  const file = page.getByLabel("Arquivo CSV", { exact: true })
  await file.setInputFiles({
    name: "vazias.csv",
    mimeType: "text/csv",
    buffer: Buffer.from("SKU,Nome\n001,Produto\n,\n"),
  })
  await expect(page.locator("#csv-import-status")).toContainText(
    "2 registros e 2 colunas",
  )
  await expect(page.locator("tbody tr")).toHaveCount(2)
  await file.setInputFiles({
    name: "final.csv",
    mimeType: "text/csv",
    buffer: Buffer.from("SKU,Nome\n001,Produto\n"),
  })
  await expect(page.locator("#csv-import-status")).toContainText(
    "1 registro e 2 colunas",
  )
  await expect(page.locator("tbody tr")).toHaveCount(1)
})
