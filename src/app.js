import { initRouter } from './routes/router.js';
import { seedIfNeeded } from './utils/seed.js';
import { showToast } from './utils/toast.js';
import { getSessionUser, logout } from './services/usersService.js';

function updateAuthButtons() {
  const me = getSessionUser();
  const authBtn = document.getElementById('authBtn');
  const profileBtn = document.getElementById('profileBtn');
  if (me) {
    authBtn.textContent = '로그아웃';
    authBtn.classList.remove('btn-outline-light');
    authBtn.classList.add('btn-outline-danger');
    authBtn.removeAttribute('href');
    authBtn.onclick = (e) => { e?.preventDefault?.(); logout(); showToast('로그아웃 되었습니다.', 'info'); updateAuthButtons(); location.hash = '#/login'; };
    profileBtn.classList.remove('d-none');
    profileBtn.textContent = me.nickname || me.name || me.email;
  } else {
    authBtn.textContent = '로그인';
    authBtn.classList.remove('btn-outline-danger');
    authBtn.classList.add('btn-outline-light');
    authBtn.setAttribute('href', '#/login');
    authBtn.onclick = null;
    profileBtn.classList.add('d-none');
  }
}

(async function bootstrap() {
  await seedIfNeeded();
  // Also seed community and plans if applicable (seedIfNeeded handles videos/community; plans seeded via dedicated function)
  try { (await import('./utils/seed.js')).seedPlansIfNeeded?.() } catch {}
  updateAuthButtons();
  window.addEventListener('storage', (e) => { if (e.key === 'ssafit:session') updateAuthButtons(); });
  initRouter(() => updateAuthButtons());

  // AI floating button
  const fab = document.createElement('button')
  fab.className = 'btn btn-primary fab-ai'
  fab.setAttribute('type', 'button')
  fab.setAttribute('aria-label', 'AI 코치 열기')
  fab.innerHTML = '<i class="bi bi-chat-dots"></i>'
  document.body.appendChild(fab)
  fab.addEventListener('click', async () => {
    const { openAiChatModal } = await import('./components/aiChatModal.js')
    openAiChatModal()
  })
})();
