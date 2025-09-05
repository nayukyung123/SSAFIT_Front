import * as communityService from '../services/communityService.js'
import { getSessionUser } from '../services/usersService.js'
import * as usersRepo from '../repos/usersRepo.js'
import * as commentsService from '../services/commentsService.js'
import { formatDate } from '../utils/date.js'

export default function CommunityListPage(el) {
  const me = getSessionUser()
  el.innerHTML = `
    <section class="hero-ps mb-4">
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-2">
        <div>
          <h1 class="title h3 mb-1">커뮤니티</h1>
          <p class="subtitle mb-0">함께 운동하고, 서로의 경험을 나눠요.</p>
        </div>
        <div>
          <a class="btn btn-primary ${me?'':'disabled'}" href="#/community/new" aria-disabled="${me?'false':'true'}"><i class="bi bi-pencil-square me-1"></i>글쓰기</a>
        </div>
      </div>
    </section>

    <form class="row g-2 align-items-stretch mb-3" id="filter" role="search" aria-label="게시글 검색">
      <div class="col-12 col-md-6">
        <div class="form-floating">
          <input id="q" name="q" class="form-control" placeholder="검색" />
          <label for="q">검색어 (제목/내용/태그)</label>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="form-floating">
          <select id="category" name="category" class="form-select">
            ${['ALL','공지','후기','팁','질문','잡담'].map(c=>`<option value="${c}">${c==='ALL'?'전체':c}</option>`).join('')}
          </select>
          <label for="category">분류</label>
        </div>
      </div>
      <div class="col-12 col-md-3 d-grid">
        <button class="btn btn-primary btn-eq-floating w-100" type="submit" aria-label="검색 필터 적용">적용</button>
      </div>
    </form>

    <div class="row g-3" id="list"></div>
    <div id="sentinel" class="py-3 text-center text-muted">불러오는 중…</div>`

  const grid = el.querySelector('#list')
  const form = el.querySelector('#filter')
  const sentinel = el.querySelector('#sentinel')
  let state = { q: '', category: 'ALL' }
  let full = []
  let page = 0
  const pageSize = 9

  function renderChunk() {
    const start = page * pageSize
    const slice = full.slice(start, start + pageSize)
    slice.forEach(p => {
      const author = usersRepo.getById?.(p.authorId)
      const col = document.createElement('div')
      col.className = 'col-12 col-md-6 col-lg-4'
      const tagsHtml = Array.isArray(p.tags) && p.tags.length ? p.tags.map(t=>`<span class='badge rounded-pill bg-light text-dark border me-1'>#${t}</span>`).join('') : ''
      col.innerHTML = `
        <div class="card card-hover h-100">
        <div class="card-body d-flex flex-column">
          <div class="d-flex align-items-center justify-content-between mb-2">
            <span class="badge text-bg-secondary">${p.category || '커뮤니티'}</span>
            <span class="small text-muted">${formatDate(p.createdAt)}</span>
          </div>
          <h6 class="card-title mb-2 text-truncate" title="${p.title}">${p.title}</h6>
          <p class="card-text text-muted" style="min-height: 3rem;">${(p.content||'').slice(0, 80)}${(p.content||'').length>80?'…':''}</p>
          <div class="small text-muted mb-2">
            <span class="me-3"><i class="bi bi-eye me-1"></i>${p.views||0}</span>
            <span><i class="bi bi-chat-left-text me-1"></i>${commentsService.countByPost(p.id)}</span>
          </div>
          <div class="mb-2">${tagsHtml}</div>
          <div class="mt-auto d-flex align-items-center justify-content-between pt-2">
            <button type="button" class="author-chip" data-user="${author?.id || ''}"><span class="avatar-circle-sm">${((author?.name||author?.email||'U').slice(0,1) || 'U').toUpperCase()}</span>${author?.name || '익명'}</button>
            <a class="btn btn-outline-primary btn-sm" href="#/community/${p.id}">자세히</a>
          </div>
        </div>
      </div>`
      grid.appendChild(col)

      // Wire author profile modal open
      const chip = col.querySelector('.author-chip')
      chip?.addEventListener('click', async () => {
        const uid = chip.dataset.user
        if (!uid) return
        const { openProfileModal } = await import('../components/profileModal.js')
        openProfileModal(uid)
      })
    })
    page++
    if (page * pageSize >= full.length) {
      sentinel.textContent = '모두 불러왔습니다.'
      observer.disconnect()
    }
  }

  function applyFilter() {
    grid.innerHTML = ''
    page = 0
    full = communityService.list(state)
    if (full.length === 0) {
      sentinel.textContent = '게시글이 없습니다.'
      observer.disconnect()
      return
    }
    sentinel.textContent = '불러오는 중…'
    observer.observe(sentinel)
    renderChunk()
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault()
    const fd = new FormData(form)
    state.q = fd.get('q')||''
    state.category = fd.get('category')||'ALL'
    applyFilter()
  })

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) renderChunk()
    })
  }, { rootMargin: '200px 0px' })

  applyFilter()
}
