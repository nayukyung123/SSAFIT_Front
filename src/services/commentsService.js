import * as commentsRepo from '../repos/commentsRepo.js'
import { getSessionUser } from './usersService.js'

export function listByPost(postId) { return commentsRepo.listByPost(postId) }
export function countByPost(postId) { return commentsRepo.countByPost(postId) }
export function create({ postId, content }) {
  const me = getSessionUser(); if (!me) throw new Error('로그인이 필요합니다.')
  if (!content?.trim()) throw new Error('내용을 입력하세요.')
  return commentsRepo.create({ postId, authorId: me.id, content: content.trim() })
}
export function update(id, { content }) {
  const me = getSessionUser(); if (!me) throw new Error('로그인이 필요합니다.')
  const cur = commentsRepo.getById(id); if (!cur) throw new Error('댓글이 없습니다.')
  if (cur.authorId !== me.id) throw new Error('수정 권한이 없습니다.')
  return commentsRepo.update(id, { content: String(content || '') })
}
export function remove(id) {
  const me = getSessionUser(); if (!me) throw new Error('로그인이 필요합니다.')
  const cur = commentsRepo.getById(id); if (!cur) throw new Error('댓글이 없습니다.')
  if (cur.authorId !== me.id) throw new Error('삭제 권한이 없습니다.')
  commentsRepo.remove(id)
}

