import { login, getSessionUser } from '../services/usersService.js'
import { setFormErrors } from '../utils/dom.js'
import { showToast } from '../utils/toast.js'

export default function LoginPage(el) {
  if (getSessionUser()) { location.hash = '#/videos'; return }
  el.innerHTML = `
    <div class="row justify-content-center py-4">
      <div class="col-12 col-sm-10 col-md-7 col-lg-5 col-xl-4">
        <div class="card shadow-sm">
          <div class="card-body p-4 p-md-5">
            <h3 class="h5 mb-4 text-center">로그인</h3>
            <form aria-label="로그인 폼" novalidate>
              <div class="form-floating mb-3">
                <input id="email" name="email" type="email" class="form-control" placeholder="name@example.com" required autocomplete="username" />
                <label for="email">이메일</label>
              </div>
              <div class="form-floating mb-3">
                <input id="password" name="password" type="password" class="form-control" placeholder="••••••••" required autocomplete="current-password" />
                <label for="password">비밀번호</label>
              </div>
              <div class="d-grid gap-2 mt-2">
                <button class="btn btn-primary btn-lg" type="submit">로그인</button>
                <a class="btn btn-outline-primary btn-lg" href="#/register" role="button" aria-label="회원가입으로 이동">회원가입</a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `
  const form = el.querySelector('form')
  const submitBtn = form.querySelector('button[type="submit"]')

  form.addEventListener('input', (ev) => {
    const t = ev.target
    if (t && t.name) setFormErrors(form, { [t.name]: '' })
  })

  form.addEventListener('submit', (e) => {
    e.preventDefault()
    const fd = new FormData(form)
    form.setAttribute('aria-busy', 'true')
    const prev = submitBtn.innerHTML
    submitBtn.disabled = true
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>로그인 중...'
    try {
      login({ email: fd.get('email'), password: fd.get('password') })
      showToast('환영합니다!', 'success')
      location.hash = '#/videos'
    } catch (err) {
      setFormErrors(form, { email: err.message, password: err.message })
      form.querySelector('.is-invalid')?.focus()
    } finally {
      form.setAttribute('aria-busy', 'false')
      submitBtn.disabled = false
      submitBtn.innerHTML = prev
    }
  })
}
