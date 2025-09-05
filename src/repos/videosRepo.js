import { uuid } from '../utils/id.js'
const KEY = 'ssafit:videos'

const read = () => { try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch { return [] } }
const write = (arr) => localStorage.setItem(KEY, JSON.stringify(arr))

export function getAll() { return read() }
export function getById(id) { return read().find(v => v.id === id) || null }
export function getByYoutubeId(yid) { return read().find(v => v.youtubeId === yid) || null }

export function create(data) {
  const now = Date.now()
  const item = { id: uuid(), createdAt: now, updatedAt: now, ...data }
  write([item, ...read()])
  return item
}

export function update(id, patch) {
  const arr = read()
  const idx = arr.findIndex(v => v.id === id)
  if (idx === -1) return null
  const updated = { ...arr[idx], ...patch, updatedAt: Date.now() }
  const next = [...arr]
  next[idx] = updated
  write(next)
  return updated
}

export function remove(id) { write(read().filter(v => v.id !== id)) }

export function bulkUpsert(list, byKey = 'id') {
  const arr = read()
  const map = new Map(arr.map(v => [v[byKey], v]))
  for (const v of list) map.set(v[byKey], { ...map.get(v[byKey]), ...v })
  write(Array.from(map.values()))
}

