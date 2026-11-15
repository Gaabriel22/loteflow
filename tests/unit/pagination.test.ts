import { describe, expect, it } from "vitest"
import { getPageWindow } from "../../src/domain/pagination"

describe("CSV pagination", () => {
  it("handles empty documents without negative indexes", () => {
    expect(getPageWindow(0, 10)).toEqual({
      page: 0,
      pageCount: 1,
      offset: 0,
      end: 0,
      start: 0,
    })
  })
  it("keeps global indexes on a partial last page", () => {
    expect(getPageWindow(101, 1)).toEqual({
      page: 1,
      pageCount: 2,
      offset: 100,
      end: 101,
      start: 101,
    })
  })
  it("clamps pages after a list shrinks", () => {
    expect(getPageWindow(200, 2)).toMatchObject({
      page: 1,
      offset: 100,
      end: 200,
    })
    expect(getPageWindow(20_000, 999)).toMatchObject({
      page: 199,
      offset: 19_900,
      end: 20_000,
    })
    expect(getPageWindow(105, -1).page).toBe(0)
  })
  it("ignores unsafe requested page numbers", () => {
    expect(getPageWindow(105, Infinity).page).toBe(0)
    expect(getPageWindow(105, NaN).page).toBe(0)
  })
})
