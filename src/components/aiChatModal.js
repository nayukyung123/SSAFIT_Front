import { getApiKey, setApiKey, generate, getHistory, saveHistory, clearHistory, exportHistory } from '../services/aiService.js'

export function openAiChatModal() {
  const root = document.getElementById('modal-root')
  const id = `ai-${Date.now()}`
  root.innerHTML = `
    <div class="modal fade" id="${id}" tabindex="-1" aria-labelledby="${id}-label" aria-hidden="true">
      <div class="modal-dialog modal-dialog-scrollable modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h1 class="modal-title fs-6 d-flex align-items-center gap-2" id="${id}-label">
              <span class="avatar-circle" aria-hidden="true">AI</span>
              <span>SSAFIT AI 코치</span>
            </h1>
            <div class="btn-group me-2" role="group">
              <button type="button" class="btn btn-sm btn-outline-secondary" id="${id}-keybtn" aria-controls="${id}-keyarea" aria-expanded="false">API 키</button>
              <button type="button" class="btn btn-sm btn-outline-secondary" id="${id}-clear">새 대화</button>
              <button type="button" class="btn btn-sm btn-outline-secondary" id="${id}-export">내보내기</button>
            </div>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="닫기"></button>
          </div>
          <div class="modal-body ai-chat">
            <div class="collapse" id="${id}-keyarea">
              <div class="input-group mb-2">
                <span class="input-group-text">GEMINI API KEY</span>
                <input id="${id}-apikey" type="password" class="form-control" placeholder="API KEY를 입력해주세요" />
                <button class="btn btn-outline-primary" id="${id}-savekey">저장</button>
              </div>
              <div class="form-text">키가 없으면 모의 코치 응답이 제공됩니다.</div>
              <hr/>
            </div>
            <div class="messages" id="${id}-msgs" aria-live="polite"></div>
            <div class="input-group">
              <input id="${id}-input" class="form-control" placeholder="운동 루틴/계획을 물어보세요" />
              <button class="btn btn-primary" id="${id}-send" type="button"><i class="bi bi-send"></i></button>
            </div>
          </div>
        </div>
      </div>
    </div>`

  const el = root.firstElementChild
  const modal = new bootstrap.Modal(el, { backdrop: 'static' })
  const keybtn = el.querySelector(`#${id}-keybtn`)
  const keyarea = el.querySelector(`#${id}-keyarea`)
  const apikey = el.querySelector(`#${id}-apikey`)
  const savekey = el.querySelector(`#${id}-savekey`)
  const msgs = el.querySelector(`#${id}-msgs`)
  const input = el.querySelector(`#${id}-input`)
  const send = el.querySelector(`#${id}-send`)
  const btnClear = el.querySelector(`#${id}-clear`)
  const btnExport = el.querySelector(`#${id}-export`)

  // collapse toggle
  keybtn.addEventListener('click', () => {
    const c = bootstrap.Collapse.getOrCreateInstance(keyarea, { toggle: false })
    c.toggle()
  })
  apikey.value = getApiKey()
  savekey.addEventListener('click', () => {
    setApiKey(apikey.value.trim())
    alert('API 키가 저장되었습니다.')
  })

  let history = getHistory()
  function append(role, text) {
    const item = document.createElement('div')
    item.className = `msg ${role}`
    item.innerHTML = `
      <div class="avatar">${role==='ai'?'AI':'Me'}</div>
      <div class="bubble">${escapeHtml(text)}</div>
    `
    msgs.appendChild(item)
    msgs.scrollTop = msgs.scrollHeight
    if (role === 'ai') attachActions(item, text)
  }
  function escapeHtml(s) {
    return String(s).replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]))
  }

  // Render existing history
  if (history.length) {
    history.forEach(m => append(m.role === 'assistant' ? 'ai' : 'user', m.content))
  } else {
    append('ai', '안녕하세요! 저는 SSAFIT AI 코치입니다. 어떤 루틴을 원하시는지 알려 주세요. (예: 전신 15분, 하체 20분, 코어 10분)')
    history.push({ role: 'assistant', content: '도움이 필요하시면 편하게 질문해 주세요!' })
    saveHistory(history)
  }

  async function onSend() {
    const q = input.value.trim()
    if (!q) return
    const now = Date.now()
    if (q === lastSentText && now - lastSentAt < 600) return
    lastSentText = q; lastSentAt = now
    input.value = ''
    append('user', q)
    history.push({ role: 'user', content: q })
    saveHistory(history)
    send.disabled = true
    try {
      const text = await generate(history)
      append('ai', text)
      history.push({ role: 'assistant', content: text })
      saveHistory(history)
    } catch (e) {
      append('ai', '오류가 발생했습니다. 잠시 후 다시 시도해 주세요.')
    } finally { send.disabled = false }
  }

  // IME(한글 등) 조합 입력 중 Enter로 인한 중복 전송 방지 + 디바운스
  let composing = false
  input.addEventListener('compositionstart', () => { composing = true })
  input.addEventListener('compositionend', () => { composing = false })
  send.addEventListener('click', onSend)
  let lastSentText = ''
  let lastSentAt = 0
  input.addEventListener('keyup', (e) => {
    if (e.isComposing || composing) return
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSend(); }
  })

  el.addEventListener('hidden.bs.modal', () => el.remove())
  modal.show()
  // Clear & export
  btnClear.addEventListener('click', () => {
    if (!confirm('대화 내용을 모두 지울까요?')) return
    clearHistory(); history = [];
    msgs.innerHTML = ''
    append('ai', '새 대화를 시작합니다. 원하시는 운동 목표를 알려주세요!')
  })
  btnExport.addEventListener('click', () => {
    const { filename, blob } = exportHistory()
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob); a.download = filename; a.click(); URL.revokeObjectURL(a.href)
  })

  // Simple action extraction from AI message
  function attachActions(container, text) {
    const lower = (text||'').toLowerCase()
    const actions = []
    if (/(전신|full)/i.test(text)) actions.push({ part: '전신', title: '전신 루틴 계획 추가' })
    if (/(하체|leg)/i.test(text)) actions.push({ part: '하체', title: '하체 루틴 계획 추가' })
    if (/(코어|복부|core|abs)/i.test(text)) actions.push({ part: '코어', title: '코어 루틴 계획 추가' })
    if (!actions.length) return

    const wrap = document.createElement('div')
    wrap.className = 'mt-2'
    actions.forEach(a => {
      const btn = document.createElement('button')
      btn.type = 'button'
      btn.className = 'btn btn-sm btn-outline-primary me-2'
      btn.textContent = a.title
      btn.addEventListener('click', () => applyPlanForPart(a.part))
      wrap.appendChild(btn)
    })
    container.querySelector('.bubble')?.appendChild(wrap)
  }

  async function applyPlanForPart(part) {
    const { default: plansService } = await import('../services/plansService.js')
    const vidsRepo = await import('../repos/videosRepo.js')
    const day = (await import('../utils/date.js'))
    const today = day.ymd?.() || new Date().toISOString().slice(0,10)
    const vids = vidsRepo.getAll?.().filter(v => v.bodyPart === part).slice(0,3).map(v=>v.id)
    const title = `${part} 루틴`
    try {
      const ps = await import('../services/plansService.js')
      ps.create({ date: today, title, videoIds: vids })
      append('ai', `${title}을(를) 오늘(${today}) 일정에 추가했어요. 계획 페이지에서 확인하세요.`)
    } catch (e) {
      append('ai', '일정 추가에 실패했어요. 로그인 상태를 확인해 주세요.')
    }
  }
}
