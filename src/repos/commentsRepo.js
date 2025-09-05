import { uuid } from '../utils/id.js'
const KEY = 'ssafit:comments'
const read = () => { try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch { return [] } }
const write = (arr) => localStorage.setItem(KEY, JSON.stringify(arr))

export function listByPost(postId) { return read().filter(c => c.postId === postId).sort((a,b)=>b.createdAt-a.createdAt) }
export function countByPost(postId) { return read().filter(c => c.postId === postId).length }
export function getById(id) { return read().find(c => c.id === id) || null }
export function create({ postId, authorId, content }) {
  const now = Date.now()
  const rec = { id: uuid(), postId, authorId, content, createdAt: now, updatedAt: now }
  write([rec, ...read()])
  return rec
}
export function update(id, patch) {
  const arr = read()
  const idx = arr.findIndex(c => c.id === id)
  if (idx === -1) return null
  const upd = { ...arr[idx], ...patch, updatedAt: Date.now() }
  const next = [...arr]; next[idx] = upd; write(next); return upd
}
export function remove(id) { write(read().filter(c => c.id !== id)) }

