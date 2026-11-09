const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL

export const siteUrl = configuredSiteUrl
  ? new URL(configuredSiteUrl)
  : undefined
