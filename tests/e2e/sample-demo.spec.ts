import { expect, test } from "@playwright/test"

test("carrega a demonstração fictícia sem enviar dados", async ({ page }) => {
  const externalRequests: string[] = []
  const requests: string[] = []
  const consoleErrors: string[] = []
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text())
  })
  page.on("pageerror", (error) => consoleErrors.push(error.message))
  page.on("request", (request) => {
    requests.push(request.url())
    if (new URL(request.url()).host !== "127.0.0.1:3100") {
      externalRequests.push(request.url())
    }
  })

  await page.goto("/#demonstracao")
  const requestCountBeforeLoad = requests.length
  await page.getByRole("button", { name: "Carregar exemplo" }).focus()
  await page.keyboard.press("Enter")

  await expect(page.getByRole("status")).toHaveText(
    "22 linhas fictícias analisadas. 7 apontamentos em 6 linhas.",
  )
  await expect(page.getByRole("table")).toBeVisible()
  await expect(page.getByRole("row")).toHaveCount(7)
  await expect(page.getByRole("columnheader", { name: "SKU" })).toBeVisible()
  await expect(
    page.getByRole("columnheader", { name: "Apontamentos" }),
  ).toBeVisible()
  await expect(
    page
      .getByRole("row")
      .filter({ hasText: "Bolsa de lona" })
      .getByText("GTIN", { exact: true }),
  ).toBeVisible()

  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport)
    const pageWidth = await page
      .locator("body")
      .evaluate((body) => body.scrollWidth)
    expect(pageWidth).toBeLessThanOrEqual(viewport.width)

    const tableDimensions = await page
      .getByRole("region", { name: /resultados da demonstração/i })
      .evaluate((region) => ({
        clientWidth: region.clientWidth,
        scrollWidth: region.scrollWidth,
        width: region.getBoundingClientRect().width,
      }))
    expect(tableDimensions.width).toBeLessThanOrEqual(viewport.width)

    if (viewport.width < 640) {
      expect(tableDimensions.scrollWidth).toBeGreaterThan(
        tableDimensions.clientWidth,
      )
    }
  }

  expect(externalRequests).toEqual([])
  expect(requests.slice(requestCountBeforeLoad)).toEqual([])
  expect(consoleErrors).toEqual([])
})
