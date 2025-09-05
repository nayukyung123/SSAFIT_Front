import * as plansService from '../services/plansService.js'
import { getSessionUser } from '../services/usersService.js'
import { confirmModal } from '../components/modal.js'

export default function PlansPage(el) {
  const me = getSessionUser(); if (!me) { location.hash = '#/login'; return }
  const today = dayjs();

  if (window.FullCalendar?.Calendar) {
    // FullCalendar enhanced UI
    el.innerHTML = `
      <div class="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
        <div class="d-flex align-items-center gap-3">
          <h3 class="h5 mb-0">운동계획</h3>
          <span class="badge text-bg-light">오늘: ${today.format('YYYY-MM-DD')}</span>
        </div>
      </div>
      <div id="calendar"></div>
    `
    const calendarEl = el.querySelector('#calendar')

    const getEvents = (start, end) => {
      const rows = plansService.listMine()
      return rows
        .filter(p => {
          const d = dayjs(p.date)
          return (!start || d.isAfter(start.subtract(1,'day'))) && (!end || d.isBefore(end.add(1,'day')))
        })
        .map(p => ({ id: p.id, title: p.title, start: p.date, allDay: true }))
    }

    const calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: 'dayGridMonth',
      height: 'auto',
      firstDay: 0,
      locale: 'ko',
      dayMaxEvents: true,
      displayEventTime: false,
      headerToolbar: { left: 'prev,next today', center: 'title', right: '' },
      buttonText: { today: '오늘' },
      events: (info, success) => {
        success(getEvents(dayjs(info.start), dayjs(info.end)))
      },
      dateClick: async (info) => {
        const dateStr = dayjs(info.date).format('YYYY-MM-DD')
        const body = document.createElement('div')
        body.innerHTML = `
          <label class="form-label" for="planTitle">제목</label>
          <input id="planTitle" class="form-control" placeholder="예: 하체 루틴" required />
          <div class="form-text">${dateStr} 에 등록됩니다.</div>
        `
        const ok = await confirmModal({ title: '계획 추가', body, confirmText: '추가' })
        const title = body.querySelector('#planTitle').value.trim()
        if (!ok || !title) return
        plansService.create({ date: dateStr, title, videoIds: [] })
        calendar.refetchEvents()
      },
      eventClick: (info) => {
        const ev = info.event
        if (confirm(`삭제하시겠습니까?\n- ${ev.title}`)) {
          plansService.remove(ev.id)
          calendar.refetchEvents()
        }
      }
    })
    calendar.render()
    return
  }

  // Fallback lightweight calendar (no FullCalendar)
  const cursor = { value: dayjs() }
  el.innerHTML = `
    <div class="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
      <div class="d-flex align-items-center gap-3">
        <h3 class="h5 mb-0">운동계획</h3>
        <span class="badge text-bg-light">오늘: ${today.format('YYYY-MM-DD')}</span>
      </div>
      <div class="d-flex align-items-center gap-2">
        <input id="monthPicker" type="month" class="form-control form-control-sm" aria-label="월 선택" style="width: 160px;" />
        <div class="btn-group" role="group" aria-label="월 이동">
          <button class="btn btn-outline-secondary btn-sm btn-today" type="button">오늘</button>
          <button class="btn btn-outline-secondary btn-sm btn-prev" type="button" aria-label="이전 달"><i class="bi bi-chevron-left"></i></button>
          <button class="btn btn-outline-secondary btn-sm btn-next" type="button" aria-label="다음 달"><i class="bi bi-chevron-right"></i></button>
        </div>
      </div>
    </div>
    <div class="mb-2 text-muted" id="ym"></div>
    <section class="calendar">
      <div class="dow">
        <div class="name sun">일</div>
        <div class="name">월</div>
        <div class="name">화</div>
        <div class="name">수</div>
        <div class="name">목</div>
        <div class="name">금</div>
        <div class="name sat">토</div>
      </div>
      <div class="grid" id="grid"></div>
    </section>
  `
  const monthPicker = el.querySelector('#monthPicker')
  monthPicker.value = cursor.value.format('YYYY-MM')

  async function addPlanModal(dateStr) {
    const body = document.createElement('div')
    body.innerHTML = `
      <label class="form-label" for="planTitle">제목</label>
      <input id="planTitle" class="form-control" placeholder="예: 하체 루틴" required />
      <div class="form-text">${dateStr} 에 등록됩니다.</div>
    `
    await confirmModal({ title: '계획 추가', body, confirmText: '추가' })
    const title = body.querySelector('#planTitle').value.trim()
    if (!title) return false
    plansService.create({ date: dateStr, title, videoIds: [] })
    return true
  }

  function render() {
    el.querySelector('#ym').textContent = cursor.value.format('YYYY년 MM월')
    monthPicker.value = cursor.value.format('YYYY-MM')
    const start = cursor.value.startOf('month')
    const end = cursor.value.endOf('month')
    const firstWeekday = start.day()
    const days = end.date()
    const plans = plansService.listMine()
    const monthly = plans.filter(p => p.date.startsWith(cursor.value.format('YYYY-MM')))
    const byDate = monthly.reduce((m, p) => { (m[p.date] ||= []).push(p); return m }, {})
    const grid = el.querySelector('#grid')
    grid.innerHTML = ''
    for (let i = 0; i < firstWeekday; i++) {
      const ghost = document.createElement('div')
      ghost.className = 'cell muted'
      grid.appendChild(ghost)
    }
    for (let d = 1; d <= days; d++) {
      const date = cursor.value.date(d)
      const dateStr = date.format('YYYY-MM-DD')
      const cell = document.createElement('div')
      const isToday = date.isSame(today, 'date') && date.isSame(today, 'month') && date.isSame(today, 'year')
      const dow = date.day()
      cell.className = `cell ${isToday ? 'today' : ''}`
      cell.innerHTML = `
        <div class="d-flex justify-content-between align-items-center">
          <div class="date ${dow===0?'sun':''} ${dow===6?'sat':''}">${d}${isToday?'<span class="badge text-bg-primary ms-2">오늘</span>':''}</div>
          <button class="btn btn-sm btn-outline-primary add" type="button" aria-label="${dateStr} 계획 추가"><i class="bi bi-plus-lg"></i></button>
        </div>
        <div class="events" id="ev-${d}"></div>
      `
      cell.querySelector('.add')?.addEventListener('click', async () => { const ok = await addPlanModal(dateStr); if (ok) render() })
      const listEl = cell.querySelector(`#ev-${d}`)
      for (const p of byDate[dateStr] || []) {
        const div = document.createElement('div')
        div.className = 'event'
        div.innerHTML = `<i class="bi bi-check2-square"></i><span class="text-truncate">${p.title}</span>`
        div.addEventListener('click', () => { if (!confirm(`삭제하시겠습니까?\n- ${p.title}`)) return; plansService.remove(p.id); render() })
        listEl.appendChild(div)
      }
      grid.appendChild(cell)
    }
  }
  el.querySelector('.btn-prev')?.addEventListener('click', () => { cursor.value = cursor.value.subtract(1, 'month'); render() })
  el.querySelector('.btn-next')?.addEventListener('click', () => { cursor.value = cursor.value.add(1, 'month'); render() })
  el.querySelector('.btn-today')?.addEventListener('click', () => { cursor.value = dayjs(); render() })
  monthPicker?.addEventListener('change', () => { const v = monthPicker.value; if (v) { const [y, m] = v.split('-'); cursor.value = dayjs(`${y}-${m}-01`); render() } })
  render()
}
