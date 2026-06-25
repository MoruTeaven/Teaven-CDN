import { JsDelivrFile } from '../services/jsdelivr'

const ENTRY_DIRS = ['dist/', 'umd/', 'browser/', 'build/', 'lib/', 'release/', 'out/', 'pkg/', 'bundles/']

export function findEntryFile(name: string, files: JsDelivrFile[], defaultFile?: string): string | null {
  if (defaultFile) {
    const df = files.find(f => f.name === defaultFile)
    if (df) {
      return defaultFile
    }
    if (/\.(js|mjs|cjs|css)$/.test(defaultFile)) {
      return defaultFile
    }
  }

  const jsFiles = files.filter(f => /\.(js|mjs|cjs)$/.test(f.name))
  const cssFiles = files.filter(f => /\.css$/.test(f.name))
  const allFiles = [...jsFiles, ...cssFiles]

  for (const suffix of ['.min.js', '.min.mjs', '.min.cjs', '.min.css']) {
    const min = allFiles.find(f => f.name.endsWith(suffix))
    if (min) return min.name
  }

  for (const dir of ENTRY_DIRS) {
    for (const suffix of ['.min.js', '.min.mjs', '.min.cjs', '.min.css']) {
      const found = allFiles.find(f => f.name.startsWith(dir) && f.name.endsWith(suffix))
      if (found) return found.name
    }
  }

  for (const dir of ENTRY_DIRS) {
    const found = allFiles.find(f => f.name.startsWith(dir))
    if (found) return found.name
  }

  if (jsFiles.length > 0) return jsFiles[0].name
  if (cssFiles.length > 0) return cssFiles[0].name

  return null
}
