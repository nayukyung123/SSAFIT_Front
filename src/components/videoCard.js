import { isFavorite as isFav, toggleFavorite } from '../services/videosService.js'

export function videoCard(video) {
  const wrap = document.createElement('div')
  wrap.className = 'card card-hover h-100 position-relative card-video'
  wrap.innerHTML = `
    <img src="${video.thumbnailUrl}" class="card-img-top" alt="${video.title} 썸네일" />
    <button class="btn btn-light rounded-circle favorite-toggle" aria-pressed="${isFav(video.id)}" aria-label="찜 토글">
      <i class="bi ${isFav(video.id) ? 'bi-heart-fill text-danger' : 'bi-heart'}"></i>
    </button>
    <div class="card-body">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <span class="badge text-bg-secondary">${video.bodyPart}</span>
        <span class="text-muted small"><i class="bi bi-eye me-1"></i>${video.views || 0}</span>
      </div>
      <h6 class="card-title text-truncate" title="${video.title}">${video.title}</h6>
      <div class="small text-muted d-flex gap-3">
        <span title="평균 평점"><i class="bi bi-star-fill rating-star me-1"></i>${video.ratingAvg || 0}</span>
        <span title="리뷰 수"><i class="bi bi-chat-left-text me-1"></i>${video.reviewCount || 0}</span>
      </div>
    </div>
    <div class="card-footer bg-transparent border-0">
      <a class="btn btn-outline-primary w-100" href="#/videos/${video.id}" aria-label="상세보기">자세히</a>
    </div>`

  const favBtn = wrap.querySelector('.favorite-toggle')
  favBtn.addEventListener('click', (e) => {
    e.preventDefault(); e.stopPropagation()
    try {
      const on = toggleFavorite(video.id)
      favBtn.setAttribute('aria-pressed', on ? 'true' : 'false')
      favBtn.querySelector('i').className = `bi ${on ? 'bi-heart-fill text-danger' : 'bi-heart'}`
    } catch {
      location.hash = '#/login'
    }
  })

  return wrap
}
