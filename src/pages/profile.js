import { getSessionUser, updateProfile } from '../services/usersService.js'
import * as followsRepo from '../repos/followsRepo.js'
import * as usersRepo from '../repos/usersRepo.js'

export default function ProfilePage(el) {
  const me = getSessionUser(); if (!me) { location.hash = '#/login'; return }
  const followers = followsRepo.listFollowers(me.id)
  const followings = followsRepo.listFollowings(me.id)
  el.innerHTML = `
    <h3 class="h5 mb-3">프로필</h3>
    <form class="row g-3" aria-label="프로필 수정">
      <div class="col-12 col-md-6">
        <label for="name" class="form-label">이름</label>
        <input id="name" name="name" class="form-control" value="${me.name||''}" />
      </div>
      <div class="col-12 col-md-6">
        <label for="email" class="form-label">이메일</label>
        <input id="email" name="email" type="email" class="form-control" value="${me.email||''}" />
      </div>
      <div class="col-12 d-flex gap-2">
        <button class="btn btn-primary" type="submit">저장</button>
        <a class="btn btn-outline-secondary" href="#/videos">목록</a>
      </div>
    </form>
    <hr />
    <div class="row g-3">
      <div class="col-12 col-md-6">
        <h6>팔로워 (${followers.length})</h6>
        <ul class="list-group small" id="followers"></ul>
      </div>
      <div class="col-12 col-md-6">
        <h6>팔로잉 (${followings.length})</h6>
        <ul class="list-group small" id="followings"></ul>
      </div>
    </div>
  `
  const form = el.querySelector('form')
  form.addEventListener('submit', (e) => {
    e.preventDefault(); const fd = new FormData(form)
    try { updateProfile({ name: fd.get('name'), email: fd.get('email') }); alert('저장되었습니다.') } catch (e) { alert(e.message) }
  })

  const users = usersRepo.getAll()
  const ulFollowers = el.querySelector('#followers')
  followers.forEach(f => {
    const u = users.find(x => x.id === f.followerId)
    const li = document.createElement('li'); li.className = 'list-group-item'; li.textContent = u?.name || u?.email || 'Unknown'
    ulFollowers.appendChild(li)
  })
  const ulFollowings = el.querySelector('#followings')
  followings.forEach(f => {
    const u = users.find(x => x.id === f.followeeId)
    const li = document.createElement('li'); li.className = 'list-group-item'; li.textContent = u?.name || u?.email || 'Unknown'
    ulFollowings.appendChild(li)
  })
}

