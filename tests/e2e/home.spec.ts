import { expect, test } from "@playwright/test"

test("página inicial informa o estado do produto em telas desktop e mobile", async ({
  page,
}) => {
  const externalRequests: string[] = []
  page.on("request", (request) => {
    if (new URL(request.url()).host !== "127.0.0.1:3100") {
      externalRequests.push(request.url())
    }
  })

  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport)
    await page.goto("/")

    await expect(
      page.getByRole("heading", {
        level: 1,
        name: /mais clareza ao preparar planilhas/i,
      }),
    ).toBeVisible()
    await expect(
      page.getByText(/a análise de arquivos ainda não está disponível/i),
    ).toBeVisible()
    await expect(
      page.getByRole("link", { name: /conheça os princípios de privacidade/i }),
    ).toBeVisible()
    await expect(page).toHaveTitle(/LoteFlow/)
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
      "content",
      /LoteFlow/,
    )

    const pageWidth = await page
      .locator("body")
      .evaluate((body) => body.scrollWidth)
    expect(pageWidth).toBeLessThanOrEqual(viewport.width)
  }

  expect(externalRequests).toEqual([])

  await page.keyboard.press("Tab")
  await expect(
    page.getByRole("link", { name: "LoteFlow, página inicial" }),
  ).toBeFocused()
  await expect
    .poll(() =>
      page.evaluate(
        () => getComputedStyle(document.activeElement!).outlineStyle,
      ),
    )
    .toBe("solid")

  await page.emulateMedia({ reducedMotion: "reduce" })
  await expect
    .poll(() =>
      page
        .locator("html")
        .evaluate((element) => getComputedStyle(element).scrollBehavior),
    )
    .toBe("auto")
  const transitionDurations = await page
    .locator('[data-slot="button"]')
    .evaluate((element) =>
      getComputedStyle(element)
        .transitionDuration.split(",")
        .map((duration) => Number.parseFloat(duration)),
    )
  expect(transitionDurations.every((duration) => duration <= 0.00001)).toBe(
    true,
  )
})
