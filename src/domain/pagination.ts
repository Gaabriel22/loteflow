export const CSV_PAGE_SIZE = 100

export function getPageWindow(totalCount: number, requestedPage: number) {
  const total = Math.max(0, Math.floor(totalCount))
  const pageCount = Math.max(1, Math.ceil(total / CSV_PAGE_SIZE))
  const safePage = Number.isSafeInteger(requestedPage) ? requestedPage : 0
  const page = Math.max(0, Math.min(safePage, pageCount - 1))
  const offset = page * CSV_PAGE_SIZE
  const end = Math.min(offset + CSV_PAGE_SIZE, total)

  return { page, pageCount, offset, end, start: total === 0 ? 0 : offset + 1 }
}
