import * as videosService from '../services/videosService.js'
import * as reviewsService from '../services/reviewsService.js'
import * as usersRepo from '../repos/usersRepo.js'
import { reviewList } from '../components/reviewList.js'
import { getSessionUser } from '../services/usersService.js'
import { setFormErrors } from '../utils/dom.js'
import { showToast } from '../utils/toast.js'

export default function VideoDetailPage(el, { params, meta } = {}) {
  const mode = meta?.mode
  if (mode === 'create') return renderCreate(el)
  if (mode === 'edit') return renderEdit(el, params.id)
  return renderShow(el, params.id)
}

function renderShow(el, id) {
  const v = videosService.get(id)
  if (!v) { el.innerHTML = '<div class="py-5 text-center">영상을 찾을 수 없습니다.</div>'; return }
  videosService.increaseViews(v.id)
  const favOn = videosService.isFavorite(v.id)
  const mine = getSessionUser()?.id === v.authorId
  const stats = reviewsService.stats(v.id)

  const author = v.authorId ? usersRepo.getById?.(v.authorId) : null
  el.innerHTML = `
    <div class="row g-4 align-items-start">
      <div class="col-12 col-lg-8">
        <div class="ratio ratio-16x9 video-frame">
          <iframe src="${v.url}" title="${v.title}" allowfullscreen></iframe>
        </div>
      </div>
      <div class="col-12 col-lg-4">
        <div class="d-flex justify-content-between align-items-start">
          <h2 class="h4">${v.title}</h2>
          <div class="btn-group">
            <button class="btn btn-outline-danger btn-fav" aria-pressed="${favOn}"><i class="bi ${favOn?'bi-heart-fill text-danger':'bi-heart'}"></i></button>
            ${mine ? `<a class="btn btn-outline-secondary" href="#/videos/${v.id}/edit"><i class="bi bi-pencil"></i></a>` : ''}
            ${mine ? `<button class="btn btn-outline-danger btn-del"><i class="bi bi-trash"></i></button>` : ''}
          </div>
        </div>
        <div class="small text-muted">
          <span class="badge text-bg-secondary">${v.bodyPart}</span>
          <span class="ms-2"><i class="bi bi-eye me-1"></i>${(v.views||0)+1}</span>
          <span class="ms-2" title="평균 별점"><i class="bi bi-star-fill rating-star me-1"></i>${stats.avg}</span>
          <span class="ms-2 text-muted">리뷰 ${stats.count}개</span>
          ${author? `<div class="mt-2"><button type="button" class="author-chip"><span class=\"avatar-circle-sm\">${((author.name||author.email||'U').slice(0,1)||'U').toUpperCase()}</span>${author.name || author.email}</button></div>`: ''}
        </div>
        <hr />
        <a class="btn btn-outline-primary btn-sm" href="#/videos">목록</a>
      </div>
    </div>
    <hr class="my-4" />
    <div id="reviews"></div>
  `
  el.querySelector('.btn-fav')?.addEventListener('click', () => {
    try {
      const on = videosService.toggleFavorite(v.id)
      const btn = el.querySelector('.btn-fav')
      btn.setAttribute('aria-pressed', on? 'true':'false')
      btn.querySelector('i').className = `bi ${on ? 'bi-heart-fill text-danger' : 'bi-heart'}`
    } catch { location.hash = '#/login' }
  })
  el.querySelector('.btn-del')?.addEventListener('click', () => {
    if (!confirm('삭제하시겠습니까?')) return
    try { videosService.remove(v.id); showToast('삭제되었습니다.','success'); location.hash = '#/videos' } catch (e) { showToast(e.message,'danger') }
  })
  el.querySelector('#reviews').appendChild(reviewList(v.id))

  // Author modal open
  el.querySelector('.author-chip')?.addEventListener('click', async () => {
    const { openProfileModal } = await import('../components/profileModal.js')
    if (v.authorId) openProfileModal(v.authorId)
  })
}

function renderCreate(el) {
  const me = getSessionUser(); if (!me) { location.hash = '#/login'; return }
  el.innerHTML = `
    <h3 class="h5 mb-3">새 영상</h3>
    <form class="row g-3" aria-label="영상 생성">
      <div class="col-12">
        <label for="title" class="form-label">제목</label>
        <input id="title" name="title" class="form-control" required />
        <div class="invalid-feedback"></div>
      </div>
      <div class="col-12 col-md-6">
        <label for="youtubeId" class="form-label">YouTube ID</label>
        <input id="youtubeId" name="youtubeId" class="form-control" required />
        <div class="invalid-feedback"></div>
      </div>
      <div class="col-12 col-md-6">
        <label for="bodyPart" class="form-label">운동 부위</label>
        <select id="bodyPart" name="bodyPart" class="form-select">
          <option>상체</option><option>하체</option><option>전신</option><option>복부</option><option>코어</option><option>유산소</option><option>기타</option>
        </select>
      </div>
      <div class="col-12">
        <label for="url" class="form-label">임베드 URL(선택)</label>
        <input id="url" name="url" class="form-control" placeholder="https://www.youtube.com/embed/..." />
      </div>
      <div class="col-12 d-flex gap-2">
        <button class="btn btn-primary" type="submit">등록</button>
        <a class="btn btn-outline-secondary" href="#/videos">취소</a>
      </div>
    </form>`
  const form = el.querySelector('form')
  form.addEventListener('submit', (e) => {
    e.preventDefault()
    const fd = new FormData(form)
    try {
      const created = videosService.create({ title: fd.get('title'), youtubeId: fd.get('youtubeId'), bodyPart: fd.get('bodyPart'), url: fd.get('url') })
      showToast('영상이 등록되었습니다.', 'success')
      location.hash = `#/videos/${created.id}`
    } catch (err) {
      const errors = {}
      if (err.message.includes('제목')) errors.title = err.message
      if (err.message.includes('YouTube')) errors.youtubeId = err.message
      if (err.message.includes('부위')) errors.bodyPart = err.message
      setFormErrors(form, errors)
      if (err.message.includes('로그인')) location.hash = '#/login'
    }
  })
}

function renderEdit(el, id) {
  const v = videosService.get(id)
  const me = getSessionUser(); if (!v || v.authorId !== me?.id) { el.innerHTML = '<div class="py-5 text-center text-muted">수정 권한이 없습니다.</div>'; return }
  el.innerHTML = `
    <h3 class="h5 mb-3">영상 수정</h3>
    <form class="row g-3" aria-label="영상 수정">
      <div class="col-12">
        <label for="title" class="form-label">제목</label>
        <input id="title" name="title" class="form-control" value="${v.title}" required />
      </div>
      <div class="col-12 col-md-6">
        <label for="youtubeId" class="form-label">YouTube ID</label>
        <input id="youtubeId" name="youtubeId" class="form-control" value="${v.youtubeId}" />
      </div>
      <div class="col-12 col-md-6">
        <label for="bodyPart" class="form-label">운동 부위</label>
        <select id="bodyPart" name="bodyPart" class="form-select">
          ${['상체','하체','전신','복부','코어','유산소','기타'].map(p=>`<option value="${p}" ${v.bodyPart===p?'selected':''}>${p}</option>`).join('')}
        </select>
      </div>
      <div class="col-12">
        <label for="url" class="form-label">임베드 URL</label>
        <input id="url" name="url" class="form-control" value="${v.url}" />
      </div>
      <div class="col-12 d-flex gap-2">
        <button class="btn btn-primary" type="submit">저장</button>
        <a class="btn btn-outline-secondary" href="#/videos/${v.id}">취소</a>
      </div>
    </form>`
  const form = el.querySelector('form')
  form.addEventListener('submit', (e) => {
    e.preventDefault()
    const fd = new FormData(form)
    try {
      videosService.update(v.id, { title: fd.get('title'), youtubeId: fd.get('youtubeId'), bodyPart: fd.get('bodyPart'), url: fd.get('url') })
      showToast('수정되었습니다.', 'success')
      location.hash = `#/videos/${v.id}`
    } catch (err) { showToast(err.message, 'danger') }
  })
}
