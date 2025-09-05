import { exportAll, importAll } from '../utils/state.js'
import { seedIfNeeded } from '../utils/seed.js'
import { showToast } from '../utils/toast.js'

const COLLECTIONS = [
  { key: 'ssafit:videos', label: '영상', type: 'array' },
  { key: 'ssafit:reviews', label: '리뷰', type: 'array' },
  { key: 'ssafit:users', label: '사용자', type: 'array' },
  { key: 'ssafit:favorites', label: '찜', type: 'array' },
  { key: 'ssafit:follows', label: '팔로우', type: 'array' },
  { key: 'ssafit:posts', label: '커뮤니티', type: 'array' },
  { key: 'ssafit:plans', label: '운동계획', type: 'array' },
  { key: 'ssafit:session', label: '세션', type: 'object' },
  { key: 'ssafit:meta', label: '메타', type: 'object' }
]

function parseJson(text, fallback) {
  try { return JSON.parse(text) } catch { return fallback }
}

function countFor(key, type) {
  const str = localStorage.getItem(key)
  if (!str) return 0
  const data = parseJson(str, type === 'array' ? [] : null)
  if (Array.isArray(data)) return data.length
  if (data && typeof data === 'object') return Object.keys(data).length
  return 0
}

function download(filename, blob) {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = filename
  a.click()
  URL.revokeObjectURL(a.href)
}

export default function DataPage(el) {
  el.innerHTML = `
    <section class="hero-ps mb-4">
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-2">
        <div>
          <h1 class="title h3 mb-1">데이터 관리</h1>
          <p class="subtitle mb-0">LocalStorage 백업/복원 및 초기화</p>
        </div>
        <div class="btn-group" role="group" aria-label="전체 내보내기/가져오기">
          <button id="btn-export-all" class="btn btn-primary"><i class="bi bi-download me-1"></i>전체 내보내기</button>
          <label class="btn btn-outline-primary mb-0" for="file-import-all"><i class="bi bi-upload me-1"></i>전체 가져오기</label>
          <input id="file-import-all" type="file" class="visually-hidden" accept="application/json" />
        </div>
      </div>
    </section>

    <div class="row g-3" id="grid"></div>

    <section class="mt-4">
      <div class="card">
        <div class="card-body d-flex flex-wrap gap-2">
          <button id="btn-reset-content" class="btn btn-outline-danger"><i class="bi bi-trash3 me-1"></i>콘텐츠 초기화(영상/리뷰/찜/팔로우/커뮤니티/계획)</button>
          <button id="btn-reseed-videos" class="btn btn-outline-secondary"><i class="bi bi-arrow-repeat me-1"></i>영상 재시드</button>
          <button id="btn-reseed-community" class="btn btn-outline-secondary"><i class="bi bi-arrow-repeat me-1"></i>커뮤니티 재시드</button>
        </div>
      </div>
    </section>
  `

  const grid = el.querySelector('#grid')

  function renderCards() {
    grid.innerHTML = ''
    COLLECTIONS.forEach(({ key, label, type }) => {
      const col = document.createElement('div')
      col.className = 'col-12 col-md-6 col-lg-4'
      const count = countFor(key, type)
      const id = key.replace(/[:]/g,'-')
      col.innerHTML = `
        <div class="card h-100">
          <div class="card-body d-flex flex-column">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <h6 class="card-title mb-0">${label}</h6>
              <span class="badge text-bg-secondary">${count}건</span>
            </div>
            <p class="text-muted small mb-3">키: <code>${key}</code></p>
            <div class="mt-auto d-flex flex-wrap gap-2">
              <button class="btn btn-outline-primary btn-sm" id="exp-${id}"><i class="bi bi-download me-1"></i>내보내기</button>
              <label class="btn btn-outline-primary btn-sm mb-0" for="imp-${id}"><i class="bi bi-upload me-1"></i>가져오기</label>
              <input id="imp-${id}" type="file" class="visually-hidden" accept="application/json" />
              <button class="btn btn-outline-danger btn-sm" id="clr-${id}"><i class="bi bi-trash3 me-1"></i>비우기</button>
            </div>
          </div>
        </div>
      `
      grid.appendChild(col)

      // Wire actions
      col.querySelector(`#exp-${id}`)?.addEventListener('click', () => {
        const str = localStorage.getItem(key) || (type === 'array' ? '[]' : '{}')
        download(`${key}.json`, new Blob([str], { type: 'application/json' }))
      })
      col.querySelector(`#imp-${id}`)?.addEventListener('change', async (e) => {
        const f = e.target.files?.[0]; if (!f) return
        try {
          const text = await f.text()
          const parsed = parseJson(text, null)
          if (parsed == null) throw new Error('유효하지 않은 JSON')
          localStorage.setItem(key, JSON.stringify(parsed))
          showToast(`${label} 가져오기 완료`, 'success')
          renderCards()
        } catch (err) {
          showToast(`${label} 가져오기 실패: ${err.message||''}`, 'danger')
        } finally { e.target.value = '' }
      })
      col.querySelector(`#clr-${id}`)?.addEventListener('click', () => {
        if (!confirm(`${label} 데이터를 모두 삭제할까요?`)) return
        localStorage.removeItem(key)
        showToast(`${label} 삭제 완료`, 'success')
        renderCards()
      })
    })
  }

  // Top actions
  el.querySelector('#btn-export-all')?.addEventListener('click', () => {
    const { filename, blob } = exportAll()
    download(filename, blob)
    showToast('전체 내보내기 완료', 'success')
  })
  el.querySelector('#file-import-all')?.addEventListener('change', async (e) => {
    const f = e.target.files?.[0]; if (!f) return
    try {
      await importAll(f)
      showToast('전체 가져오기 완료. 새로고침합니다.', 'success')
      setTimeout(()=>location.reload(), 400)
    } catch (err) {
      showToast('전체 가져오기 실패', 'danger')
    } finally { e.target.value = '' }
  })

  // Reset & reseed
  el.querySelector('#btn-reset-content')?.addEventListener('click', async () => {
    if (!confirm('영상/리뷰/찜/팔로우/커뮤니티/계획 데이터를 모두 삭제합니다. 계속할까요?')) return
    ;['ssafit:videos','ssafit:reviews','ssafit:favorites','ssafit:follows','ssafit:posts','ssafit:plans'].forEach(k=>localStorage.removeItem(k))
    showToast('콘텐츠 초기화 완료', 'success')
    renderCards()
  })
  el.querySelector('#btn-reseed-videos')?.addEventListener('click', async () => {
    if (!confirm('영상 데이터를 초기 시드로 다시 주입할까요? 현재 영상은 삭제됩니다.')) return
    localStorage.removeItem('ssafit:videos')
    const meta = parseJson(localStorage.getItem('ssafit:meta')||'{}', {})
    delete meta.lastSeedVersion
    localStorage.setItem('ssafit:meta', JSON.stringify(meta))
    await seedIfNeeded()
    showToast('영상 재시드 완료', 'success')
    renderCards()
  })
  el.querySelector('#btn-reseed-community')?.addEventListener('click', async () => {
    if (!confirm('커뮤니티 샘플 글을 다시 주입할까요? 현재 커뮤니티 글은 삭제됩니다.')) return
    localStorage.removeItem('ssafit:posts')
    const meta = parseJson(localStorage.getItem('ssafit:meta')||'{}', {})
    delete meta.communitySeeded
    localStorage.setItem('ssafit:meta', JSON.stringify(meta))
    await seedIfNeeded()
    showToast('커뮤니티 재시드 완료', 'success')
    renderCards()
  })

  renderCards()
}

