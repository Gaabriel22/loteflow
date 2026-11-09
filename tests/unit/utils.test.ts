import { describe, expect, it } from "vitest"
import { cn } from "../../src/lib/utils"

describe("cn", () => {
  it("combina classes condicionais e mantém a utilidade Tailwind mais recente", () => {
    expect(cn("text-sm p-2", false && "hidden", "p-4", "text-base")).toBe(
      "p-4 text-base",
    )
  })
})
