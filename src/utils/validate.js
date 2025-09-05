export function required(value, label = '값') {
  if (value == null || String(value).trim() === '') return `${label}은(는) 필수입니다.`
  return null
}

export function email(value) {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || ''))) return '이메일 형식이 올바르지 않습니다.'
  return null
}

export function passwordStrength(value) {
  const v = String(value || '')
  if (v.length < 8) return '비밀번호는 8자 이상이어야 합니다.'
  if (!/[A-Z]/.test(v) || !/[a-z]/.test(v) || !/\d/.test(v)) return '대소문자/숫자를 포함해야 합니다.'
  return null
}

