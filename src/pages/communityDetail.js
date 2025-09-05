import * as communityService from '../services/communityService.js'
import * as usersRepo from '../repos/usersRepo.js'
import * as commentsService from '../services/commentsService.js'
import * as followsService from '../services/followsService.js'
import { getSessionUser } from '../services/usersService.js'
import { formatDate } from '../utils/date.js'
import { showToast } from '../utils/toast.js'

export default function CommunityDetailPage(el, { params } = {}) {
  const post = communityService.get(params.id)
  if (!post) { el.innerHTML = '<div class="py-5 text-center text-muted">게시글이 없습니다.</div>'; return }
  const me = getSessionUser()
  const mine = me?.id === post.authorId
  const author = usersRepo.getById?.(post.authorId)

  const tagsHtml = Array.isArray(post.tags) && post.tags.length ? post.tags.map(t=>`<span class='badge rounded-pill bg-light text-dark border me-1'>#${t}</span>`).join('') : ''
  const comments = commentsService.listByPost(post.id)
  const cCount = comments.length
  const followed = followsService.isFollowing(post.authorId)

  // increase views on open
  communityService.increaseViews(post.id)
  el.innerHTML = `
    <section class="hero-ps mb-4">
          <div class="d-flex flex-wrap justify-content-between align-items-center gap-2">
            <div>
              <h1 class="title h3 mb-1">${post.title}</h1>
            <div class="d-flex align-items-center gap-3 subtitle">
              <span class="badge text-bg-secondary">${post.category || '커뮤니티'}</span>
              <button type="button" class="author-chip"><span class="avatar-circle-sm">${((author?.name||author?.email||'U').slice(0,1)||'U').toUpperCase()}</span>${author?.name || '익명'}</button>
              <span class="small text-muted">${formatDate(post.createdAt)}</span>
              <span class="small text-muted"><i class="bi bi-eye me-1"></i>${(post.views||0)+1}</span>
              <span class="small text-muted"><i class="bi bi-chat-left-text me-1"></i>${cCount}</span>
            </div>
            </div>
            <div class="d-flex gap-2">
            ${mine?`<a class="btn btn-outline-secondary" href="#/community/${post.id}/edit"><i class="bi bi-pencil"></i> 수정</a>`:''}
            ${mine?`<button class="btn btn-outline-danger" id="btn-del"><i class="bi bi-trash"></i> 삭제</button>`:''}
              <a class="btn btn-outline-primary" href="#/community">목록</a>
            </div>
          </div>
    </section>
    <div class="card shadow-sm">
      <div class="card-body p-4 p-md-5">
        ${tagsHtml ? `<div class="mb-3">${tagsHtml}</div>` : ''}
        <div class="fs-6" style="white-space:pre-wrap; line-height:1.7;">${post.content}</div>
      </div>
    </div>
    <section class="mt-4">
      <h5 class="mb-3">댓글 ${cCount}개</h5>
      <form class="row g-2 align-items-end" id="c-form" aria-label="댓글 작성">
        <div class="col-12 col-md-10">
          <div class="form-floating">
            <textarea id="c-content" name="content" class="form-control" placeholder="댓글을 입력하세요" style="height: 80px"></textarea>
            <label for="c-content">댓글을 입력하세요</label>
          </div>
        </div>
        <div class="col-12 col-md-2 d-grid"><button class="btn btn-primary" type="submit">등록</button></div>
      </form>
      <ul class="list-group mt-3" id="c-list"></ul>
    </section>
  `

  el.querySelector('#btn-del')?.addEventListener('click', () => {
    if (!confirm('삭제하시겠습니까?')) return
    try { communityService.remove(post.id); showToast('삭제되었습니다.','success'); location.hash = '#/community' } catch (e) { showToast(e.message,'danger') }
  })

  el.querySelector('.author-chip')?.addEventListener('click', async () => {
    const { openProfileModal } = await import('../components/profileModal.js')
    openProfileModal(post.authorId)
  })

  // Comments rendering
  const listEl = el.querySelector('#c-list')
  function renderComments() {
    const items = commentsService.listByPost(post.id)
    listEl.innerHTML = ''
    items.forEach(c => {
      const u = usersRepo.getById?.(c.authorId)
      const li = document.createElement('li')
      li.className = 'list-group-item'
      const mineC = me?.id === c.authorId
      li.innerHTML = `
        <div class="d-flex justify-content-between align-items-start">
          <div>
            <div class="fw-semibold small">${u?.name || '익명'} <span class="text-muted">· ${formatDate(c.createdAt)}</span></div>
            <div class="mt-1" style="white-space:pre-wrap;">${c.content}</div>
          </div>
          <div class="ms-2 ${mineC?'':'d-none'}">
            <button class="btn btn-sm btn-outline-secondary me-1 btn-edit">수정</button>
            <button class="btn btn-sm btn-outline-danger btn-del">삭제</button>
          </div>
        </div>
      `
      li.querySelector('.btn-edit')?.addEventListener('click', () => {
        const next = prompt('댓글 수정', c.content)
        if (next == null) return
        try { commentsService.update(c.id, { content: next }); renderComments(); }
        catch(e){ showToast(e.message,'danger') }
      })
      li.querySelector('.btn-del')?.addEventListener('click', () => {
        if (!confirm('삭제하시겠습니까?')) return
        try { commentsService.remove(c.id); renderComments(); }
        catch(e){ showToast(e.message,'danger') }
      })
      listEl.appendChild(li)
    })
  }
  renderComments()

  const form = el.querySelector('#c-form')
  form?.addEventListener('submit', (e) => {
    e.preventDefault()
    const ta = el.querySelector('#c-content')
    try {
      commentsService.create({ postId: post.id, content: ta.value })
      ta.value = ''
      renderComments()
    } catch (err) {
      showToast(err.message,'danger')
      if (String(err.message||'').includes('로그인')) location.hash = '#/login'
    }
  })
}
