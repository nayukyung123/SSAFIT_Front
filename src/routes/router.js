import HomePage from '../pages/home.js'
import VideosListPage from '../pages/videosList.js'
import VideoDetailPage from '../pages/videoDetail.js'
import LoginPage from '../pages/login.js'
import RegisterPage from '../pages/register.js'
import FavoritesPage from '../pages/favorites.js'
import CommunityListPage from '../pages/communityList.js'
import CommunityEditPage from '../pages/communityEdit.js'
import CommunityDetailPage from '../pages/communityDetail.js'
import PlansPage from '../pages/plans.js'
import ProfilePage from '../pages/profile.js'
import DataPage from '../pages/data.js'

const routes = [
  { path: '/', component: HomePage },
  { path: '/videos', component: VideosListPage },
  { path: '/videos/new', component: VideoDetailPage, meta: { mode: 'create' } },
  { path: '/videos/:id', component: VideoDetailPage },
  { path: '/videos/:id/edit', component: VideoDetailPage, meta: { mode: 'edit' } },
  { path: '/favorites', component: FavoritesPage },
  { path: '/community', component: CommunityListPage },
  { path: '/community/new', component: CommunityEditPage, meta: { mode: 'create' } },
  { path: '/community/:id', component: CommunityDetailPage },
  { path: '/community/:id/edit', component: CommunityEditPage, meta: { mode: 'edit' } },
  { path: '/plans', component: PlansPage },
  { path: '/data', component: DataPage },
  { path: '/profile', component: ProfilePage },
  { path: '/login', component: LoginPage },
  { path: '/register', component: RegisterPage },
]

let currentUnmount = null

function compile(pat) {
  const keys = []
  const rx = new RegExp('^' + pat.replace(/:[^/]+/g, m => { keys.push(m.slice(1)); return '([^/]+)'; }) + '$')
  return { rx, keys }
}

function matchRoute(hash) {
  const path = (hash || location.hash || '#/').replace(/^#/, '') || '/'
  for (const r of routes) {
    const { rx, keys } = compile(r.path)
    const m = path.match(rx)
    if (m) {
      const params = {}
      keys.forEach((k, i) => params[k] = decodeURIComponent(m[i + 1]))
      return { r, params }
    }
  }
  return { r: routes[1], params: {} } // default /videos
}

export function initRouter(onAfter) {
  async function render() {
    const app = document.getElementById('app')
    const { r, params } = matchRoute(location.hash)
    if (currentUnmount) { try { currentUnmount() } catch { } currentUnmount = null }
    app.innerHTML = ''
    const meta = r.meta || {}
    const unmount = await r.component(app, { params, meta })
    if (typeof unmount === 'function') currentUnmount = unmount
    app.focus()
    onAfter?.()
  }
  window.addEventListener('hashchange', render)
  if (!location.hash) location.hash = '#/videos'
  render()
}
