import * as videosService from '../services/videosService.js'
import { videoCard } from '../components/videoCard.js'
import { renderPagination } from '../components/pagination.js'

const PARTS = ['all','상체','하체','전신','복부','코어','유산소','기타']

export default function VideosListPage(el) {
  let page = 1, pageSize = 12
  let keyword = '', bodyPart = 'all', sort = 'latest'

  el.innerHTML = `
    <div class="d-flex flex-wrap gap-2 justify-content-between align-items-end mb-3">
      <form class="row g-2 flex-grow-1" id="filter" role="search" aria-label="영상 검색">
        <div class="col-12 col-md-4">
          <label class="form-label" for="q">검색어</label>
          <input id="q" name="q" class="form-control" placeholder="제목 검색" />
        </div>
        <div class="col-6 col-md-3">
          <label class="form-label" for="part">부위</label>
          <select id="part" name="part" class="form-select">${PARTS.map(p=>`<option value="${p}">${p==='all'?'전체':p}</option>`).join('')}</select>
        </div>
        <div class="col-6 col-md-3">
          <label class="form-label" for="sort">정렬</label>
          <select id="sort" name="sort" class="form-select">
            <option value="latest">최신순</option>
            <option value="views">조회순</option>
            <option value="reviewCount">리뷰많은순</option>
            <option value="rating">평점높은순</option>
          </select>
        </div>
        <div class="col-12 col-md-2 d-grid">
          <label class="form-label">&nbsp;</label>
          <button class="btn btn-primary" type="submit">적용</button>
        </div>
      </form>
      <a href="#/videos/new" class="btn btn-outline-primary" aria-label="영상 생성"><i class="bi bi-plus-lg"></i> 새 영상</a>
    </div>
    <div id="info" class="small text-muted mb-2"></div>
    <div class="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-3" id="grid"></div>
    <div id="pager" class="mt-3"></div>
  `

  const form = el.querySelector('#filter')
  const grid = el.querySelector('#grid')
  const pager = el.querySelector('#pager')
  const info = el.querySelector('#info')

  function render() {
    const { items, total } = videosService.list({ keyword, bodyPart, sort, page, pageSize })
    info.textContent = `총 ${total}개`
    grid.innerHTML = ''
    items.forEach(v => { const col = document.createElement('div'); col.className = 'col'; col.appendChild(videoCard(v)); grid.appendChild(col) })
    pager.innerHTML = ''
    pager.appendChild(renderPagination({ total, page, pageSize, onChange: (p) => { page = p; render() } }))
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(form)
    keyword = fd.get('q') || ''
    bodyPart = fd.get('part') || 'all'
    sort = fd.get('sort') || 'latest'
    page = 1
    render()
  })

  render()
}

