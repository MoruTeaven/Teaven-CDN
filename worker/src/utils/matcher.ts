import { JsDelivrFile } from '../services/jsdelivr'

export function findEntryFile(name: string, files: JsDelivrFile[], defaultFile?: string): string | null {
  if (defaultFile) {
    const df = files.find(f => f.name === defaultFile)
    if (df) {
      return defaultFile
    }
  }

  const jsFiles = files.filter(f => f.name.endsWith('.js'))

  const minJs = jsFiles.find(f => f.name.endsWith('.min.js'))
  if (minJs) return minJs.name

  const distMinJs = jsFiles.find(f => f.name.startsWith('dist/') && f.name.endsWith('.min.js'))
  if (distMinJs) return distMinJs.name

  const umdMinJs = jsFiles.find(f => f.name.startsWith('umd/') && f.name.endsWith('.min.js'))
  if (umdMinJs) return umdMinJs.name

  const browserMinJs = jsFiles.find(f => f.name.startsWith('browser/') && f.name.endsWith('.min.js'))
  if (browserMinJs) return browserMinJs.name

  const distJs = jsFiles.find(f => f.name.startsWith('dist/'))
  if (distJs) return distJs.name

  const umdJs = jsFiles.find(f => f.name.startsWith('umd/'))
  if (umdJs) return umdJs.name

  const browserJs = jsFiles.find(f => f.name.startsWith('browser/'))
  if (browserJs) return browserJs.name

  if (jsFiles.length > 0) return jsFiles[0].name

  return null
}
