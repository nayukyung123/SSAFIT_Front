import * as plansRepo from '../repos/plansRepo.js'
import { getSessionUser } from './usersService.js'

export function listMine() {
  const me = getSessionUser(); if (!me) throw new Error('로그인이 필요합니다.')
  return plansRepo.listByUser(me.id)
}

export function create({ date, title, videoIds = [] }) {
  const me = getSessionUser(); if (!me) throw new Error('로그인이 필요합니다.')
  if (!date) throw new Error('날짜를 선택하세요.')
  if (!title?.trim()) throw new Error('제목을 입력하세요.')
  return plansRepo.create({ userId: me.id, date, title: title.trim(), videoIds })
}

export function update(id, patch) { return plansRepo.update(id, patch) }
export function remove(id) { return plansRepo.remove(id) }

