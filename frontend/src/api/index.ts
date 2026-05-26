export interface PackageItem {
  id: number
  name: string
  version: string
  file_name: string
  file_path: string
  source_url?: string
  source_type?: string
  file_size?: number
  content_type?: string
  created_at: string
  cdn_url?: string
  global_cdn_url?: string
}

export interface SearchResult {
  name: string
  versions: string[]
  latest: string
}

export const api = {
  async search(q: string): Promise<SearchResult> {
    const response = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
    if (!response.ok) {
      throw new Error('Search failed')
    }
    return await response.json()
  },

  async favorite(name: string, version: string): Promise<{ success: boolean, package: PackageItem }> {
    const response = await fetch('/api/favorite', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, version })
    })
    if (!response.ok) {
      throw new Error('Favorite failed')
    }
    return await response.json()
  },

  async getPackages(): Promise<{ packages: PackageItem[] }> {
    const response = await fetch('/api/packages')
    if (!response.ok) {
      throw new Error('Get packages failed')
    }
    return await response.json()
  },

  async deletePackage(id: number): Promise<void> {
    const response = await fetch(`/api/packages/${id}`, {
      method: 'DELETE'
    })
    if (!response.ok) {
      throw new Error('Delete failed')
    }
  }
}
