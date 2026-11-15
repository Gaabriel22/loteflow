import { readFile } from "node:fs/promises"
import { expect, test } from "@playwright/test"

test("baixa relatório atual por teclado sem enviar dados", async ({ page }) => {
  const requests: string[] = []
  page.on("request", (request) => {
    if (request.method() !== "GET") requests.push(request.url())
  })
  await page.goto("/#importar-csv")
  await page
    .getByLabel("Arquivo CSV", { exact: true })
    .setInputFiles("tests/fixtures/validacao-previa.csv")
  await page.getByRole("combobox", { name: "SKU", exact: true }).click()
  await page.getByRole("option", { name: "Coluna 1: SKU", exact: true }).click()
  await page
    .getByRole("button", { name: "Editar valores", exact: true })
    .click()
  await page
    .getByRole("textbox", { name: "Registro 2, SKU", exact: true })
    .fill("SKU-99")
  const button = page.getByRole("button", {
    name: "Baixar relatório CSV",
    exact: true,
  })
  await button.focus()
  const downloaded = page.waitForEvent("download")
  await page.keyboard.press("Enter")
  const download = await downloaded
  expect(download.suggestedFilename()).toBe("loteflow-apontamentos.csv")
  const path = await download.path()
  const csv = await readFile(path!, "utf8")
  expect(csv).toContain("Registro do arquivo;Campo;Apontamento")
  expect(csv).toContain("3;Linha;Esta linha não contém dados.;4;4;")
  expect(csv).not.toContain("Este SKU aparece mais de uma vez.")
  expect(requests).toEqual([])

  await page.evaluate(() => {
    URL.createObjectURL = () => {
      throw new Error("download unavailable")
    }
  })
  await button.click()
  await expect(
    page
      .getByRole("alert")
      .filter({ hasText: "Não foi possível iniciar o download" }),
  ).toBeVisible()
  await expect(button).toBeEnabled()
})

test("explica escopo integral e desabilita relatório sem apontamentos", async ({
  page,
}) => {
  await page.goto("/#importar-csv")
  await page.getByLabel("Arquivo CSV", { exact: true }).setInputFiles({
    name: "parcial.csv",
    mimeType: "text/csv",
    buffer: Buffer.from(
      [
        "SKU",
        ...Array.from({ length: 105 }, (_, index) => `SKU-${index}`),
      ].join("\n"),
    ),
  })
  await page.getByRole("combobox", { name: "SKU", exact: true }).click()
  await page.getByRole("option", { name: "Coluna 1: SKU", exact: true }).click()
  await expect(page.locator("#csv-report-scope")).toContainText(
    "105 de 105 registros",
  )
  await expect(
    page.getByRole("button", {
      name: "Baixar relatório CSV",
      exact: true,
    }),
  ).toBeDisabled()
})
