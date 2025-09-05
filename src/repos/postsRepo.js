import { uuid } from '../utils/id.js'
const KEY = 'ssafit:posts'
const read = () => { try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch { return [] } }
const write = (arr) => localStorage.setItem(KEY, JSON.stringify(arr))

export function getAll() { return read() }
export function getById(id) { return read().find(p => p.id === id) || null }
export function create({ title, content, authorId, category, tags }) {
  const now = Date.now()
  const post = { id: uuid(), title, content, authorId, category, tags, views: 0, createdAt: now, updatedAt: now }
  write([post, ...read()])
  return post
}
export function update(id, patch) {
  const arr = read(); const idx = arr.findIndex(p => p.id === id)
  if (idx === -1) return null
  const updated = { ...arr[idx], ...patch, updatedAt: Date.now() }
  const next = [...arr]; next[idx] = updated; write(next)
  return updated
}
export function remove(id) { write(read().filter(p => p.id !== id)) }
