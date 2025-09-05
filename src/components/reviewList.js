import * as reviewsService from '../services/reviewsService.js'
import { getSessionUser } from '../services/usersService.js'
import { showToast } from '../utils/toast.js'

export function reviewList(videoId) {
  const wrap = document.createElement('div')
  wrap.innerHTML = `
    <h5 class="mb-3">리뷰</h5>
    <form class="row g-2 align-items-end mb-3" aria-label="리뷰 작성">
      <div class="col-12 col-md-8">
        <label for="rv-content" class="form-label">내용</label>
        <textarea id="rv-content" name="content" class="form-control" rows="2" required aria-required="true"></textarea>
      </div>
      <div class="col-6 col-md-2">
        <label for="rv-rating" class="form-label">평점</label>
        <select id="rv-rating" name="rating" class="form-select">
          <option value="5">★★★★★</option>
          <option value="4">★★★★☆</option>
          <option value="3">★★★☆☆</option>
          <option value="2">★★☆☆☆</option>
          <option value="1">★☆☆☆☆</option>
        </select>
      </div>
      <div class="col-6 col-md-2">
        <button class="btn btn-primary w-100" type="submit">등록</button>
      </div>
    </form>
    <ul class="list-group" aria-live="polite"></ul>
  `

  const listEl = wrap.querySelector('.list-group')
  const form = wrap.querySelector('form')

  function render() {
    const rs = reviewsService.listByVideo(videoId)
    listEl.innerHTML = ''
    rs.forEach(r => {
      const mine = getSessionUser()?.id === r.authorId
      const li = document.createElement('li')
      li.className = 'list-group-item'
      li.innerHTML = `
        <div class="d-flex justify-content-between align-items-center">
          <div><span class="me-2">${'★'.repeat(r.rating)}${'☆'.repeat(5-r.rating)}</span>${r.content}</div>
          <div class="small text-muted">${new Date(r.createdAt).toLocaleString()}</div>
        </div>
        <div class="mt-2 d-flex gap-2 ${mine ? '' : 'd-none'}">
          <button class="btn btn-sm btn-outline-secondary btn-edit">수정</button>
          <button class="btn btn-sm btn-outline-danger btn-del">삭제</button>
        </div>`
      li.querySelector('.btn-edit')?.addEventListener('click', () => {
        const content = prompt('리뷰 내용', r.content)
        if (content == null) return
        const rating = Number(prompt('평점(1~5)', r.rating) || r.rating)
        try { reviewsService.update(r.id, { content, rating }); render(); showToast('리뷰를 수정했습니다.', 'success') } catch (e) { showToast(e.message, 'danger') }
      })
      li.querySelector('.btn-del')?.addEventListener('click', () => {
        if (!confirm('삭제하시겠습니까?')) return
        try { reviewsService.remove(r.id); render(); showToast('리뷰를 삭제했습니다.', 'success') } catch (e) { showToast(e.message, 'danger') }
      })
      listEl.appendChild(li)
    })
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault()
    const fd = new FormData(form)
    try {
      reviewsService.create({ videoId, content: fd.get('content'), rating: Number(fd.get('rating')) })
      form.reset(); render(); showToast('리뷰가 등록되었습니다.', 'success')
    } catch (e) {
      if (String(e.message || '').includes('로그인')) location.hash = '#/login'
      else showToast(e.message, 'danger')
    }
  })

  render()
  return wrap
}

