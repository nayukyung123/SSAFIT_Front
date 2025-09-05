import { uuid } from '../utils/id.js'
const KEY = 'ssafit:users'
const SESSION_KEY = 'ssafit:session'

const read = () => { try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch { return [] } }
const write = (arr) => localStorage.setItem(KEY, JSON.stringify(arr))

export function getAll() { return read() }
export function getById(id) { return read().find(u => u.id === id) || null }
export function getByEmail(email) { return read().find(u => u.email === email) || null }
export function getByName(name) { return read().find(u => u.name === name) || null }

export function create({ name, email, password, role = 'user', nickname }) {
  const now = Date.now()
  const user = { id: uuid(), name, email, password, role, nickname: nickname||name, createdAt: now, updatedAt: now }
  write([user, ...read()])
  return user
}

export function update(id, patch) {
  const arr = read(); const idx = arr.findIndex(u => u.id === id)
  if (idx === -1) return null
  const updated = { ...arr[idx], ...patch, updatedAt: Date.now() }
  const next = [...arr]; next[idx] = updated; write(next)
  const sess = getSession()
  if (sess?.userId === id) localStorage.setItem(SESSION_KEY, JSON.stringify({ ...sess }))
  return updated
}

export function remove(id) { write(read().filter(u => u.id !== id)) }

export function setSession(userId) { localStorage.setItem(SESSION_KEY, JSON.stringify({ userId, ts: Date.now() })) }
export function clearSession() { localStorage.removeItem(SESSION_KEY) }
export function getSession() { try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null') } catch { return null } }

