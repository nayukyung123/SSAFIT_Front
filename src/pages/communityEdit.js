import * as communityService from '../services/communityService.js'
import { getSessionUser } from '../services/usersService.js'
import { showToast } from '../utils/toast.js'

export default function CommunityEditPage(el, { params, meta } = {}) {
  const me = getSessionUser(); if (!me) { location.hash = '#/login'; return }
  const mode = meta?.mode || (params?.id ? 'edit' : 'create')
  const post = params?.id ? communityService.get(params.id) : null
  if (params?.id && !post) { el.innerHTML = '<div class="py-5 text-center text-muted">게시글이 없습니다.</div>'; return }
  if (params?.id && post.authorId !== me.id) { el.innerHTML = '<div class="py-5 text-center text-muted">수정 권한이 없습니다.</div>'; return }
  el.innerHTML = `
    <div class="row justify-content-center py-3">
      <div class="col-12 col-lg-10">
        <div class="card shadow-sm">
          <div class="card-body p-4 p-md-5">
            <h3 class="h5 mb-4">${mode==='create'?'글쓰기':'글 수정'}</h3>
            <form aria-label="게시글 ${mode==='create'?'작성':'수정'}" novalidate>
              <div class="form-floating mb-3">
                <input id="title" name="title" class="form-control" placeholder="제목" value="${post?.title||''}" required />
                <label for="title">제목</label>
              </div>
              <div class="row g-3">
                <div class="col-12 col-md-4">
                  <div class="form-floating">
                    <select id="category" name="category" class="form-select" aria-label="분류">
                      ${['공지','후기','팁','질문','잡담'].map(c=>`<option value="${c}" ${post?.category===c?'selected':''}>${c}</option>`).join('')}
                    </select>
                    <label for="category">분류</label>
                  </div>
                </div>
                <div class="col-12 col-md-8">
                  <div class="form-floating">
                    <input id="tags" name="tags" class="form-control" placeholder="태그" value="${Array.isArray(post?.tags)?post.tags.join(', '):''}" />
                    <label for="tags">태그 (쉼표로 구분)</label>
                  </div>
                </div>
              </div>
              <div class="form-floating mb-3">
                <textarea id="content" name="content" class="form-control" style="height: 220px" placeholder="내용을 입력하세요" required>${post?.content||''}</textarea>
                <label for="content">내용</label>
              </div>
              <div class="d-flex flex-wrap gap-2">
                <button class="btn btn-primary" type="submit">${mode==='create'?'등록':'저장'}</button>
                <a class="btn btn-outline-secondary" href="#/community">목록</a>
                ${mode==='edit'?'<button class="btn btn-outline-danger btn-del" type="button">삭제</button>':''}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>`
  const form = el.querySelector('form')
  form.addEventListener('submit', (e) => {
    e.preventDefault()
    const fd = new FormData(form)
    const tags = String(fd.get('tags')||'').split(',').map(s=>s.trim()).filter(Boolean)
    try {
      if (mode==='create') communityService.create({ title: fd.get('title'), content: fd.get('content'), category: fd.get('category')||'잡담', tags })
      else communityService.update(post.id, { title: fd.get('title'), content: fd.get('content'), category: fd.get('category')||'잡담', tags })
      showToast(mode==='create'?'등록되었습니다.':'수정되었습니다.', 'success')
      location.hash = '#/community'
    } catch (err) { showToast(err.message,'danger') }
  })
  el.querySelector('.btn-del')?.addEventListener('click', () => {
    if (!confirm('삭제하시겠습니까?')) return
    try { communityService.remove(post.id); showToast('삭제되었습니다.','success'); location.hash = '#/community' } catch (e) { showToast(e.message,'danger') }
  })
}
