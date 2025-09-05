import * as videosRepo from '../repos/videosRepo.js'
import * as favoritesRepo from '../repos/favoritesRepo.js'
import { getSessionUser } from './usersService.js'

export function recommendTop({ limit = 6 } = {}) {
  const me = getSessionUser()
  const all = videosRepo.getAll()
  if (!all.length) return []
  let preferred = null
  if (me) {
    const favs = favoritesRepo.listByUser(me.id)
    const counts = {}
    favs.forEach(f => {
      const v = all.find(x => x.id === f.videoId)
      if (v) counts[v.bodyPart] = (counts[v.bodyPart] || 0) + 1
    })
    preferred = Object.entries(counts).sort((a,b)=>b[1]-a[1])[0]?.[0] || null
  }
  const scored = all.map(v => ({ v, score: (v.views||0) + (preferred && v.bodyPart===preferred ? 1000 : 0) }))
    .sort((a,b)=>b.score-a.score)
    .slice(0, limit)
    .map(x=>x.v)
  return scored
}

