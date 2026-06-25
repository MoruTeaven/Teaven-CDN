export interface CdnEnv {
  CDN_DOMAIN: string
  GLOBAL_CDN_DOMAIN: string
}

export type PackageRecord = Record<string, unknown> & {
  file_path: string
}

export function withCdnUrls<T extends PackageRecord>(pkg: T, env: CdnEnv) {
  const path = pkg.file_path.startsWith('/') ? pkg.file_path : `/${pkg.file_path}`
  return {
    ...pkg,
    cdn_url: `https://${env.CDN_DOMAIN}${path}`,
    global_cdn_url: `https://${env.GLOBAL_CDN_DOMAIN}${path}`
  }
}
