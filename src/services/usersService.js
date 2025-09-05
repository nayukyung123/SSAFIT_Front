import * as usersRepo from '../repos/usersRepo.js'

export function getSession() {
  const s = usersRepo.getSession?.()
  if (s?.userId) {
    const u = usersRepo.getById(s.userId)
    return u ? { userId: u.id, user: u } : null
  }
  return null
}

export function getSessionUser() { return getSession()?.user || null }

export function register({ name, email, password, nickname }) {
  if (!name) throw new Error('이름은 필수입니다.')
  if (!email) throw new Error('이메일은 필수입니다.')
  if (!password) throw new Error('비밀번호는 필수입니다.')
  if (usersRepo.getByEmail(email)) throw new Error('이미 사용중인 이메일입니다.')
  const user = usersRepo.create({ name, email, password, nickname })
  usersRepo.setSession(user.id)
  return user
}

export function login({ email, password }) {
  const user = usersRepo.getByEmail(email)
  if (!user || user.password !== password) throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.')
  usersRepo.setSession(user.id)
  return user
}

export function logout() { usersRepo.clearSession() }

export function updateProfile(patch) {
  const me = getSessionUser(); if (!me) throw new Error('로그인이 필요합니다.')
  return usersRepo.update(me.id, patch)
}

