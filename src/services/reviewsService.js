import * as reviewsRepo from '../repos/reviewsRepo.js'
import { getSessionUser } from './usersService.js'

export function listByVideo(videoId) { return reviewsRepo.listByVideoId(videoId).sort((a,b)=>b.createdAt-a.createdAt) }

export function stats(videoId) {
  const list = reviewsRepo.listByVideoId(videoId)
  const count = list.length
  const avg = count ? Math.round((list.reduce((s,r)=>s+(Number(r.rating)||0),0)/count)*10)/10 : 0
  return { count, avg }
}

export function create({ videoId, content, rating }) {
  const me = getSessionUser(); if (!me) throw new Error('로그인이 필요합니다.')
  if (!content || !String(content).trim()) throw new Error('내용을 입력하세요.')
  const rate = Math.max(1, Math.min(5, Number(rating)||0))
  return reviewsRepo.create({ videoId, authorId: me.id, content: String(content), rating: rate })
}

export function update(id, patch) {
  const me = getSessionUser(); if (!me) throw new Error('로그인이 필요합니다.')
  const cur = reviewsRepo.getById(id); if (!cur) throw new Error('리뷰가 없습니다.')
  if (cur.authorId !== me.id) throw new Error('수정 권한이 없습니다.')
  if (patch.rating != null) patch.rating = Math.max(1, Math.min(5, Number(patch.rating)||0))
  return reviewsRepo.update(id, patch)
}

export function remove(id) {
  const me = getSessionUser(); if (!me) throw new Error('로그인이 필요합니다.')
  const cur = reviewsRepo.getById(id); if (!cur) throw new Error('리뷰가 없습니다.')
  if (cur.authorId !== me.id) throw new Error('삭제 권한이 없습니다.')
  reviewsRepo.remove(id)
}

