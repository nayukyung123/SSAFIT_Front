import { register, getSessionUser } from '../services/usersService.js'
import { setFormErrors } from '../utils/dom.js'
import { email as emailV, passwordStrength } from '../utils/validate.js'
import { showToast } from '../utils/toast.js'

export default function RegisterPage(el) {
  if (getSessionUser()) { location.hash = '#/videos'; return }
  el.innerHTML = `
    <div class="row justify-content-center py-4">
      <div class="col-12 col-sm-10 col-md-7 col-lg-5 col-xl-4">
        <div class="card shadow-sm">
          <div class="card-body p-4 p-md-5">
            <h3 class="h5 mb-4 text-center">회원가입</h3>
            <form aria-label="회원가입 폼" novalidate>
              <div class="form-floating mb-3">
                <input id="name" name="name" class="form-control" placeholder="홍길동" required autocomplete="name" />
                <label for="name">이름</label>
              </div>
              <div class="form-floating mb-3">
                <input id="email" name="email" type="email" class="form-control" placeholder="name@example.com" required autocomplete="email" />
                <label for="email">이메일</label>
              </div>
              <div class="form-floating mb-1">
                <input id="password" name="password" type="password" class="form-control" placeholder="••••••••" required autocomplete="new-password" />
                <label for="password">비밀번호</label>
              </div>
              <div class="form-text mb-3">대소문자/숫자를 포함한 8자 이상</div>
              <div class="d-grid gap-2 mt-2">
                <button class="btn btn-primary btn-lg" type="submit">가입</button>
                <a class="btn btn-outline-primary btn-lg" href="#/login" role="button" aria-label="로그인으로 이동">로그인</a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `
  const form = el.querySelector('form')
  const submitBtn = form.querySelector('button[type="submit"]')

  // Live-clear validation on input
  form.addEventListener('input', (ev) => {
    const t = ev.target
    if (!(t && t.name)) return
    setFormErrors(form, { [t.name]: '' })
  })

  form.addEventListener('submit', (e) => {
    e.preventDefault()
    const fd = new FormData(form)
    const errs = {}
    const emailErr = emailV(fd.get('email'))
    const pwErr = passwordStrength(fd.get('password'))
    if (emailErr) errs.email = emailErr
    if (pwErr) errs.password = pwErr
    if (!fd.get('name')) errs.name = '이름은 필수입니다.'
    if (Object.keys(errs).length) {
      setFormErrors(form, errs)
      const first = form.querySelector('.is-invalid')
      first?.focus()
      return
    }

    // Submit UX
    form.setAttribute('aria-busy', 'true')
    const prev = submitBtn.innerHTML
    submitBtn.disabled = true
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>가입 중...'
    try {
      register({ name: fd.get('name'), email: fd.get('email'), password: fd.get('password') })
      showToast('가입되었습니다. 환영합니다!', 'success')
      location.hash = '#/videos'
    } catch (err) {
      setFormErrors(form, { email: err.message })
      const first = form.querySelector('.is-invalid')
      first?.focus()
    } finally {
      form.setAttribute('aria-busy', 'false')
      submitBtn.disabled = false
      submitBtn.innerHTML = prev
    }
  })
}
