import { getSessionUser } from '../services/usersService.js'
import * as favoritesRepo from '../repos/favoritesRepo.js'
import * as videosRepo from '../repos/videosRepo.js'
import { videoCard } from '../components/videoCard.js'

export default function FavoritesPage(el) {
  const me = getSessionUser(); if (!me) { location.hash = '#/login'; return }
  el.innerHTML = `<h3 class="h5 mb-3">내 찜</h3><div class="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-3" id="grid"></div>`
  const favs = favoritesRepo.listByUser(me.id)
  const all = videosRepo.getAll()
  const items = favs.map(f => all.find(v => v.id === f.videoId)).filter(Boolean)
  const grid = el.querySelector('#grid')
  items.forEach(v => { const col = document.createElement('div'); col.className='col'; col.appendChild(videoCard(v)); grid.appendChild(col) })
}

