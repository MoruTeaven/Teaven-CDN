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

export async function searchPackages(q: string): Promise<JsDelivrPackage> {
  const response = await fetch(`https://data.jsdelivr.com/v1/package/npm/${encodeURIComponent(q)}`)
  if (!response.ok) {
    throw new Error('Package not found')
  }
  return await response.json()
}

export async function getPackageVersion(name: string, version: string): Promise<JsDelivrPackageVersion> {
  const response = await fetch(`https://data.jsdelivr.com/v1/package/npm/${encodeURIComponent(name)}@${encodeURIComponent(version)}`)
  if (!response.ok) {
    throw new Error('Version not found')
  }
  return await response.json()
}

export function getFileUrl(name: string, version: string, file: string): string {
  return `https://cdn.jsdelivr.net/npm/${encodeURIComponent(name)}@${encodeURIComponent(version)}/${file}`
}
