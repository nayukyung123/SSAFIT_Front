import * as usersRepo from '../repos/usersRepo.js'
import * as followsService from '../services/followsService.js'
import * as postsRepo from '../repos/postsRepo.js'
import * as videosRepo from '../repos/videosRepo.js'
import { getSessionUser } from '../services/usersService.js'

export function openProfileModal(userId) {
  const user = usersRepo.getById?.(userId)
  const me = getSessionUser()
  const root = document.getElementById('modal-root')
  const id = `profile-${Date.now()}`
  const isMe = me?.id === userId
  const followers = followsService.listFollowers(userId) || []
  const followings = followsService.listFollowings(userId) || []
  const followingOn = followsService.isFollowing(userId)

  if (!user) {
    alert('사용자를 찾을 수 없습니다.')
    return
  }

  root.innerHTML = `
    <div class="modal fade" id="${id}" tabindex="-1" aria-labelledby="${id}-label" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h1 class="modal-title fs-5 d-flex align-items-center gap-2" id="${id}-label">
              <span class="avatar-circle" aria-hidden="true">${(user.name||user.email||'U').slice(0,1).toUpperCase()}</span>
              <span>${user.name || user.email}</span>
            </h1>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="닫기"></button>
          </div>
          <div class="modal-body">
            <ul class="nav nav-tabs" id="${id}-tabs" role="tablist">
              <li class="nav-item" role="presentation">
                <button class="nav-link active" id="${id}-info-tab" data-bs-toggle="tab" data-bs-target="#${id}-info" type="button" role="tab" aria-controls="${id}-info" aria-selected="true">프로필</button>
              </li>
              <li class="nav-item" role="presentation">
                <button class="nav-link" id="${id}-activity-tab" data-bs-toggle="tab" data-bs-target="#${id}-activity" type="button" role="tab" aria-controls="${id}-activity" aria-selected="false">활동</button>
              </li>
              <li class="nav-item" role="presentation">
                <button class="nav-link" id="${id}-follow-tab" data-bs-toggle="tab" data-bs-target="#${id}-followpane" type="button" role="tab" aria-controls="${id}-followpane" aria-selected="false">팔로우</button>
              </li>
            </ul>
            <div class="tab-content pt-3">
              <div class="tab-pane fade show active" id="${id}-info" role="tabpanel" aria-labelledby="${id}-info-tab">
                <dl class="row mb-0">
                  <dt class="col-4">이름</dt><dd class="col-8">${user.name || '-'}</dd>
                  <dt class="col-4">이메일</dt><dd class="col-8">${user.email || '-'}</dd>
                  <dt class="col-4">팔로워</dt><dd class="col-8">${followers.length}명</dd>
                  <dt class="col-4">팔로잉</dt><dd class="col-8">${followings.length}명</dd>
                </dl>
              </div>
              <div class="tab-pane fade" id="${id}-activity" role="tabpanel" aria-labelledby="${id}-activity-tab">
                <div class="row g-3">
                  <div class="col-12 col-md-6">
                    <h6 class="mb-2">최근 글</h6>
                    <ul class="list-group small" id="${id}-posts"></ul>
                  </div>
                  <div class="col-12 col-md-6">
                    <h6 class="mb-2">최근 영상</h6>
                    <ul class="list-group small" id="${id}-videos"></ul>
                  </div>
                </div>
              </div>
              <div class="tab-pane fade" id="${id}-followpane" role="tabpanel" aria-labelledby="${id}-follow-tab">
                <div class="row g-3">
                  <div class="col-12 col-md-6">
                    <h6 class="mb-2">팔로워 ${followers.length}</h6>
                    <div class="d-flex flex-wrap gap-2" id="${id}-followers"></div>
                  </div>
                  <div class="col-12 col-md-6">
                    <h6 class="mb-2">팔로잉 ${followings.length}</h6>
                    <div class="d-flex flex-wrap gap-2" id="${id}-followings"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            ${isMe ? '' : `<button type="button" class="btn ${followingOn?'btn-outline-secondary':'btn-outline-primary'}" id="${id}-follow" aria-pressed="${followingOn}">${followingOn?'<i class="bi bi-person-check"></i> 팔로잉':'<i class="bi bi-person-plus"></i> 팔로우'}</button>`}
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">닫기</button>
          </div>
        </div>
      </div>
    </div>`

  const el = root.firstElementChild
  const modal = new bootstrap.Modal(el, { backdrop: 'static' })

  const btnFollow = el.querySelector(`#${id}-follow`)
  btnFollow?.addEventListener('click', () => {
    try {
      const on = followsService.toggle(userId)
      btnFollow.setAttribute('aria-pressed', String(on))
      btnFollow.classList.toggle('btn-outline-primary', !on)
      btnFollow.classList.toggle('btn-outline-secondary', on)
      btnFollow.innerHTML = on? '<i class="bi bi-person-check"></i> 팔로잉' : '<i class="bi bi-person-plus"></i> 팔로우'
    } catch (e) {
      alert(e.message || '오류가 발생했습니다.')
    }
  })

  el.addEventListener('hidden.bs.modal', () => el.remove())
  modal.show()

  // Fill activity lists
  const posts = (postsRepo.getAll?.() || []).filter(p => p.authorId === userId).slice(0,5)
  const vids = (videosRepo.getAll?.() || []).filter(v => v.authorId === userId).slice(0,5)
  const listPosts = el.querySelector(`#${id}-posts`)
  const listVids = el.querySelector(`#${id}-videos`)
  if (listPosts) {
    if (posts.length === 0) listPosts.innerHTML = '<li class="list-group-item text-muted">게시글이 없습니다.</li>'
    else posts.forEach(p => {
      const li = document.createElement('li')
      li.className = 'list-group-item d-flex justify-content-between align-items-center'
      li.innerHTML = `<span class="text-truncate">${p.title}</span><a class="btn btn-sm btn-outline-primary" href="#/community/${p.id}">보기</a>`
      listPosts.appendChild(li)
    })
  }
  if (listVids) {
    if (vids.length === 0) listVids.innerHTML = '<li class="list-group-item text-muted">영상이 없습니다.</li>'
    else vids.forEach(v => {
      const li = document.createElement('li')
      li.className = 'list-group-item d-flex justify-content-between align-items-center'
      li.innerHTML = `<span class="text-truncate">${v.title}</span><a class="btn btn-sm btn-outline-primary" href="#/videos/${v.id}">보기</a>`
      listVids.appendChild(li)
    })
  }

  // Fill followers/followings chips
  function chipHtml(u){ return `<button type="button" class="author-chip" data-user="${u}"><span class="avatar-circle-sm">${((usersRepo.getById?.(u)?.name||usersRepo.getById?.(u)?.email||'U').slice(0,1)||'U').toUpperCase()}</span>${usersRepo.getById?.(u)?.name || '사용자'}</button>` }
  const boxFers = el.querySelector(`#${id}-followers`)
  const boxFings = el.querySelector(`#${id}-followings`)
  if (boxFers){ boxFers.innerHTML = followers.map(r=>chipHtml(r.followerId)).join('') }
  if (boxFings){ boxFings.innerHTML = followings.map(r=>chipHtml(r.followeeId)).join('') }
  ;[...(el.querySelectorAll(`#${id}-followers .author-chip`)||[]), ...(el.querySelectorAll(`#${id}-followings .author-chip`)||[])].forEach(btn=>{
    btn.addEventListener('click', async ()=>{
      const uid = btn.getAttribute('data-user')
      if (uid) openProfileModal(uid)
    })
  })
}
