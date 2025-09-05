const KEY = 'ssafit:favorites'
const read = () => { try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch { return [] } }
const write = (arr) => localStorage.setItem(KEY, JSON.stringify(arr))

export function listByUser(userId) { return read().filter(f => f.userId === userId) }
export function isFavorite(userId, videoId) { return read().some(f => f.userId === userId && f.videoId === videoId) }
export function toggle(userId, videoId) {
  const arr = read();
  const idx = arr.findIndex(f => f.userId === userId && f.videoId === videoId)
  if (idx !== -1) { write(arr.filter((_,i)=>i!==idx)); return false }
  write([{ userId, videoId, createdAt: Date.now() }, ...arr]); return true
}
export function removeByVideoId(videoId) { write(read().filter(f => f.videoId !== videoId)) }

