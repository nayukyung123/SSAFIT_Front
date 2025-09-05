import * as postsRepo from '../repos/postsRepo.js'
import { getSessionUser } from './usersService.js'

export function list({ q = '', category = 'ALL' } = {}) {
  let arr = postsRepo.getAll().slice().sort((a,b)=>b.createdAt-a.createdAt)
  if (q) {
    const needle = String(q).toLowerCase()
    arr = arr.filter(p => (
      (p.title||'').toLowerCase().includes(needle) ||
      (p.content||'').toLowerCase().includes(needle) ||
      (Array.isArray(p.tags) ? p.tags.join(' ').toLowerCase().includes(needle) : false)
    ))
  }
  if (category && category !== 'ALL') arr = arr.filter(p => p.category === category)
  return arr
}
export function get(id) { return postsRepo.getById(id) }
export function create({ title, content, category = '잡담', tags = [] }) {
  const me = getSessionUser(); if (!me) throw new Error('로그인이 필요합니다.')
  if (!title?.trim()) throw new Error('제목을 입력하세요.')
  if (!content?.trim()) throw new Error('내용을 입력하세요.')
  return postsRepo.create({ title: title.trim(), content: content.trim(), category, tags: Array.isArray(tags)?tags:[], authorId: me.id })
}
export function update(id, patch) {
  const me = getSessionUser(); if (!me) throw new Error('로그인이 필요합니다.')
  const post = postsRepo.getById(id); if (!post) throw new Error('게시글이 없습니다.')
  if (post.authorId !== me.id) throw new Error('수정 권한이 없습니다.')
  const clean = { ...patch }
  if (clean.tags && !Array.isArray(clean.tags)) clean.tags = []
  return postsRepo.update(id, clean)
}
export function remove(id) {
  const me = getSessionUser(); if (!me) throw new Error('로그인이 필요합니다.')
  const post = postsRepo.getById(id); if (!post) throw new Error('게시글이 없습니다.')
  if (post.authorId !== me.id) throw new Error('삭제 권한이 없습니다.')
  postsRepo.remove(id)
}

export function increaseViews(id) {
  const p = postsRepo.getById(id)
  if (!p) return
  const views = Number(p.views || 0) + 1
  postsRepo.update(id, { views })
}
