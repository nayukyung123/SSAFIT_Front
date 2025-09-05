import { uuid } from '../utils/id.js'
const KEY = 'ssafit:reviews'

const read = () => { try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch { return [] } }
const write = (arr) => localStorage.setItem(KEY, JSON.stringify(arr))

export function getAll() { return read() }
export function getById(id) { return read().find(r => r.id === id) || null }
export function listByVideoId(videoId) { return read().filter(r => r.videoId === videoId) }
export function listByAuthorId(authorId) { return read().filter(r => r.authorId === authorId) }

export function create({ videoId, authorId, content, rating }) {
  const now = Date.now()
  const rec = { id: uuid(), videoId, authorId, content, rating: Number(rating)||0, createdAt: now, updatedAt: now }
  write([rec, ...read()])
  return rec
}

export function update(id, patch) {
  const arr = read()
  const idx = arr.findIndex(r => r.id === id)
  if (idx === -1) return null
  const updated = { ...arr[idx], ...patch, updatedAt: Date.now() }
  const next = [...arr]; next[idx] = updated; write(next)
  return updated
}

export function remove(id) { write(read().filter(r => r.id !== id)) }
export function removeByVideoId(videoId) { write(read().filter(r => r.videoId !== videoId)) }

