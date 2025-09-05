import { uuid } from '../utils/id.js'
const KEY = 'ssafit:plans'
const read = () => { try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch { return [] } }
const write = (arr) => localStorage.setItem(KEY, JSON.stringify(arr))

// plan: { id, userId, date: 'YYYY-MM-DD', title, videoIds: string[] }
export function listByUser(userId) { return read().filter(p => p.userId === userId) }
export function create({ userId, date, title, videoIds = [] }) {
  const now = Date.now(); const plan = { id: uuid(), userId, date, title, videoIds, createdAt: now, updatedAt: now }
  write([plan, ...read()]); return plan
}
export function update(id, patch) {
  const arr = read(); const idx = arr.findIndex(p => p.id === id)
  if (idx === -1) return null
  const updated = { ...arr[idx], ...patch, updatedAt: Date.now() }
  const next = [...arr]; next[idx] = updated; write(next); return updated
}
export function remove(id) { write(read().filter(p => p.id !== id)) }

