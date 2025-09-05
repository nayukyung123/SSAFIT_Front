// Export/Import LocalStorage state for keys starting with ssafit:
const PREFIX = 'ssafit:'

export function exportAll() {
  const dump = {}
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)
    if (!k?.startsWith(PREFIX)) continue
    dump[k] = localStorage.getItem(k)
  }
  const blob = new Blob([JSON.stringify(dump, null, 2)], { type: 'application/json' })
  const filename = `ssafit-export-${new Date().toISOString().replace(/[:.]/g,'-')}.json`
  return { blob, filename }
}

export async function importAll(file) {
  const text = await file.text()
  const obj = JSON.parse(text)
  Object.entries(obj).forEach(([k, v]) => {
    if (typeof v === 'string' && k.startsWith(PREFIX)) localStorage.setItem(k, v)
  })
}

