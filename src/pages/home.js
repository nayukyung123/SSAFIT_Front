import { recommendTop } from '../services/recoService.js'
import { videoCard } from '../components/videoCard.js'

export default async function HomePage(el) {
  el.innerHTML = `
    <section class="hero-ps mb-4">
      <div class="row g-4 align-items-center">
        <div class="col-12 col-md-7">
          <h1 class="title display-6 mb-2">오늘, <span class="accent">신선한</span> 루틴으로 시작하세요</h1>
          <p class="subtitle mb-3">가벼운 UI, 상쾌한 색감, 똑똑한 경험. SSAFIT과 함께 건강한 하루를 만드세요.</p>
          <div class="d-flex gap-2">
            <a href="#/videos" class="btn btn-primary btn-lg" aria-label="영상 목록으로 이동"><i class="bi bi-play-circle me-1"></i>영상 보러가기</a>
            <a href="#/plans" class="btn btn-outline-primary btn-lg" aria-label="운동 계획 세우기"><i class="bi bi-calendar-event me-1"></i>계획 세우기</a>
          </div>
        </div>
        <div class="col-12 col-md-5">
          <div id="heroCarousel" class="hero-carousel carousel slide" data-bs-ride="false" aria-label="메인 이미지 캐러셀">
            <div class="carousel-inner">
              <div class="carousel-item active">
                <img src="./assets/img/KirbyCurl.png" class="d-block w-100 hero-img" alt="덤벨 컬 동작 Kirby" />
              </div>
              <div class="carousel-item">
                <img src="./assets/img/KirbyDeadlift.png" class="d-block w-100 hero-img" alt="데드리프트 동작 Kirby" />
              </div>
              <div class="carousel-item">
                <img src="./assets/img/KirbyRun.png" class="d-block w-100 hero-img" alt="러닝 동작 Kirby" />
              </div>
            </div>
            <button class="carousel-control-prev" type="button" data-bs-target="#heroCarousel" data-bs-slide="prev" aria-label="이전">
              <span class="carousel-control-prev-icon" aria-hidden="true"></span>
              <span class="visually-hidden">이전</span>
            </button>
            <button class="carousel-control-next" type="button" data-bs-target="#heroCarousel" data-bs-slide="next" aria-label="다음">
              <span class="carousel-control-next-icon" aria-hidden="true"></span>
              <span class="visually-hidden">다음</span>
            </button>
            <div class="carousel-indicators">
              <button type="button" data-bs-target="#heroCarousel" data-bs-slide-to="0" class="active" aria-label="슬라이드 1"></button>
              <button type="button" data-bs-target="#heroCarousel" data-bs-slide-to="1" aria-label="슬라이드 2"></button>
              <button type="button" data-bs-target="#heroCarousel" data-bs-slide-to="2" aria-label="슬라이드 3"></button>
            </div>
          </div>
        </div>
      </div>
    </section>
    <section class="mt-4">
      <h5 class="mb-3">추천 영상</h5>
      <div class="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-3" id="reco"></div>
    </section>`
  const reco = recommendTop({ limit: 6 })
  const grid = el.querySelector('#reco')
  reco.forEach(v => {
    const col = document.createElement('div')
    col.className = 'col'
    col.appendChild(videoCard(v))
    grid.appendChild(col)
  })

  // Make clicking the carousel advance to next slide
  const carEl = el.querySelector('#heroCarousel')
  try {
    const car = bootstrap.Carousel.getOrCreateInstance(carEl, { interval: false, ride: false, wrap: true })
    carEl.addEventListener('click', (ev) => {
      const tag = (ev.target && ev.target.tagName) || ''
      if (tag !== 'BUTTON') car.next()
    })
  } catch {}
}
