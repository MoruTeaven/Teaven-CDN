export interface JsDelivrFile {
  name: string
  hash: string
  size: number
}

export interface JsDelivrPackage {
  name: string
  versions: string[]
  tags: Record<string, string>
}

export interface JsDelivrPackageVersion {
  name: string
  version: string
  default?: string
  files: JsDelivrFile[]
}

export interface NpmSearchResult {
  package: {
    name: string
    version: string
    description?: string
    keywords?: string[]
    date?: string
    links?: {
      npm?: string
      homepage?: string
      repository?: string
    }
  }
}

export interface NpmSearchResponse {
  total: number
  objects: NpmSearchResult[]
}

const MIRROR_URLS: Record<string, string> = {
  npmjs: 'https://registry.npmjs.org',
  npmmirror: 'https://registry.npmmirror.com'
}

export async function searchPackages(q: string): Promise<JsDelivrPackage> {
  const response = await fetch(`https://data.jsdelivr.com/v1/package/npm/${encodeURIComponent(q)}`)
  if (!response.ok) {
    throw new Error('Package not found')
  }
  return await response.json()
}

export async function searchPackagesFuzzy(q: string, mirror: string = 'npmjs'): Promise<NpmSearchResponse> {
  const baseUrl = MIRROR_URLS[mirror] || MIRROR_URLS.npmjs
  const url = mirror === 'npmmirror'
    ? `${baseUrl}/-/v1/search?text=${encodeURIComponent(q)}&size=20`
    : `${baseUrl}/-/v1/search?text=${encodeURIComponent(q)}&size=20`
  
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 10000)
  
  try {
    const response = await fetch(url, { signal: controller.signal })
    clearTimeout(timeoutId)
    
    if (!response.ok) {
      const mirrorLabel = mirror === 'npmmirror' ? '淘宝镜像' : 'npm 官方'
      throw new Error(`${mirrorLabel}请求失败 (${response.status})`)
    }
    return await response.json()
  } catch (e) {
    clearTimeout(timeoutId)
    if (e instanceof Error && e.name === 'AbortError') {
      const mirrorLabel = mirror === 'npmmirror' ? '淘宝镜像' : 'npm 官方'
      throw new Error(`${mirrorLabel}请求超时，请尝试切换镜像源`)
    }
    throw e
  }
}

function flattenFiles(items: any[], prefix = ''): JsDelivrFile[] {
  const result: JsDelivrFile[] = []
  for (const item of items) {
    const path = prefix ? `${prefix}/${item.name}` : item.name
    if (item.type === 'directory' && item.files) {
      result.push(...flattenFiles(item.files, path))
    } else {
      result.push({ name: path, hash: item.hash || '', size: item.size || 0 })
    }
  }
  return result
}

export async function getPackageVersion(name: string, version: string): Promise<JsDelivrPackageVersion> {
  const response = await fetch(`https://data.jsdelivr.com/v1/package/npm/${encodeURIComponent(name)}@${encodeURIComponent(version)}`)
  if (!response.ok) {
    throw new Error('Version not found')
  }
  const data = await response.json()
  return {
    name: data.name,
    version: data.version,
    default: data.default,
    files: flattenFiles(data.files || [])
  }
}

export function getFileUrl(name: string, version: string, file: string): string {
  return `https://cdn.jsdelivr.net/npm/${encodeURIComponent(name)}@${encodeURIComponent(version)}/${file}`
}
