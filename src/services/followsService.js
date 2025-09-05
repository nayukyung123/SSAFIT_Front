import * as followsRepo from '../repos/followsRepo.js'
import { getSessionUser } from './usersService.js'

export function isFollowing(targetUserId) {
  const me = getSessionUser(); if (!me) return false
  return followsRepo.isFollowing(me.id, targetUserId)
}

export function toggle(targetUserId) {
  const me = getSessionUser(); if (!me) throw new Error('로그인이 필요합니다.')
  return followsRepo.toggle(me.id, targetUserId)
}

export function listFollowers(userId) { return followsRepo.listFollowers(userId) }
export function listFollowings(userId) { return followsRepo.listFollowings(userId) }

