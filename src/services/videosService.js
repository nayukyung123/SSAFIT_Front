import * as videosRepo from '../repos/videosRepo.js'
import * as reviewsRepo from '../repos/reviewsRepo.js'
import * as favoritesRepo from '../repos/favoritesRepo.js'
import { getSessionUser } from './usersService.js'

const PARTS = ['상체','하체','전신','복부','코어','유산소','기타']

function derive(v) {
  const rs = reviewsRepo.listByVideoId(v.id)
  const reviewCount = rs.length
  const avg = reviewCount ? rs.reduce((s,r)=>s+(Number(r.rating)||0),0)/reviewCount : 0
  return { ...v, reviewCount, ratingAvg: Math.round(avg*10)/10 }
}

export function list({ keyword = '', bodyPart = 'all', sort = 'latest', page = 1, pageSize = 12 } = {}) {
  let arr = videosRepo.getAll().map(derive)
  if (keyword) {
    const q = keyword.toLowerCase()
    arr = arr.filter(v => (v.title||'').toLowerCase().includes(q))
  }
  if (bodyPart !== 'all') arr = arr.filter(v => v.bodyPart === bodyPart)
  switch (sort) {
    case 'views': arr.sort((a,b)=> (b.views||0)-(a.views||0)); break
    case 'reviewCount': arr.sort((a,b)=> b.reviewCount - a.reviewCount); break
    case 'rating': arr.sort((a,b)=> (b.ratingAvg||0) - (a.ratingAvg||0)); break
    default: arr.sort((a,b)=> b.createdAt - a.createdAt)
  }
  const total = arr.length
  const items = arr.slice((page-1)*pageSize, (page-1)*pageSize + pageSize)
  return { items, total }
}

export function get(id) { const v = videosRepo.getById(id); return v ? derive(v) : null }

export function create({ youtubeId, title, bodyPart, url }) {
  const me = getSessionUser(); if (!me) throw new Error('로그인이 필요합니다.')
  if (!youtubeId) throw new Error('YouTube ID는 필수입니다.')
  if (!title) throw new Error('제목은 필수입니다.')
  if (!PARTS.includes(bodyPart)) throw new Error('올바른 운동 부위가 아닙니다.')
  return videosRepo.create({ youtubeId, title, bodyPart, url: url||`https://www.youtube.com/embed/${youtubeId}`, thumbnailUrl: `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`, views: 0, tags: [], difficulty: ['전신','하체','상체'].includes(bodyPart)?'중급':'초급', authorId: me.id })
}

export function update(id, patch) {
  const me = getSessionUser(); if (!me) throw new Error('로그인이 필요합니다.')
  const cur = videosRepo.getById(id); if (!cur) throw new Error('영상이 없습니다.')
  if (cur.authorId && cur.authorId !== me.id) throw new Error('수정 권한이 없습니다.')
  if (patch.bodyPart && !PARTS.includes(patch.bodyPart)) throw new Error('올바른 운동 부위가 아닙니다.')
  if (patch.youtubeId) {
    patch.thumbnailUrl = `https://i.ytimg.com/vi/${patch.youtubeId}/hqdefault.jpg`
    patch.url = patch.url || `https://www.youtube.com/embed/${patch.youtubeId}`
  }
  return videosRepo.update(id, patch)
}

export function remove(id) {
  const me = getSessionUser(); if (!me) throw new Error('로그인이 필요합니다.')
  const cur = videosRepo.getById(id); if (!cur) throw new Error('영상이 없습니다.')
  if (cur.authorId && cur.authorId !== me.id) throw new Error('삭제 권한이 없습니다.')
  favoritesRepo.removeByVideoId(id)
  reviewsRepo.removeByVideoId(id)
  videosRepo.remove(id)
}

export function increaseViews(id) {
  const cur = videosRepo.getById(id); if (!cur) return
  videosRepo.update(id, { views: (cur.views||0) + 1 })
}

export function toggleFavorite(id) {
  const me = getSessionUser(); if (!me) throw new Error('로그인이 필요합니다.')
  return favoritesRepo.toggle(me.id, id)
}
export function isFavorite(id) { const me = getSessionUser(); return me ? favoritesRepo.isFavorite(me.id, id) : false }

