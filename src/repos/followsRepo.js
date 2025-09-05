const KEY = 'ssafit:follows'
const read = () => { try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch { return [] } }
const write = (arr) => localStorage.setItem(KEY, JSON.stringify(arr))

export function toggle(followerId, followeeId) {
  const arr = read();
  const idx = arr.findIndex(r => r.followerId === followerId && r.followeeId === followeeId)
  if (idx !== -1) { write(arr.filter((_,i)=>i!==idx)); return false }
  write([{ followerId, followeeId, createdAt: Date.now() }, ...arr]); return true
}
export function isFollowing(followerId, followeeId) { return read().some(r => r.followerId === followerId && r.followeeId === followeeId) }
export function listFollowers(userId) { return read().filter(r => r.followeeId === userId) }
export function listFollowings(userId) { return read().filter(r => r.followerId === userId) }

