import { uuid } from './id.js'
import * as videosRepo from '../repos/videosRepo.js'
import * as usersRepo from '../repos/usersRepo.js'
import * as postsRepo from '../repos/postsRepo.js'
import * as plansRepo from '../repos/plansRepo.js'

const META_KEY = 'ssafit:meta'
const SEED_VERSION = 1
const ALLOWED_PARTS = ['상체','하체','전신','복부','코어','유산소','기타']

function pickDifficulty(part) {
  if (['전신','하체','상체'].includes(part)) return '중급'
  if (['복부','코어'].includes(part)) return '초급'
  return '초급'
}

function ensureChannelUser(channelName) {
  if (!channelName) return null
  const existing = usersRepo.getByName?.(channelName) || usersRepo.getByNickname?.(channelName)
  if (existing) return existing.id
  const user = usersRepo.create({ name: channelName, email: `${channelName.replace(/\s+/g,'').toLowerCase()}@channel.local`, password: 'channel' })
  return user.id
}

async function tryFetch(url) {
  try { const res = await fetch(url); if (!res.ok) return null; return await res.json() } catch { return null }
}

export async function seedIfNeeded() {
  const meta = JSON.parse(localStorage.getItem(META_KEY) || '{}')
  let changed = false

  // Video seed (idempotent via youtubeId upsert)
  if (!(meta.lastSeedVersion >= SEED_VERSION && videosRepo.getAll().length > 0)) {
    const sources = [
      './pjt/[SSAFIT] 제공파일/video.json',
      './pjt/[SSAFIT]%20제공파일/video.json',
      './assets/data/videos.json'
    ]
    let data = null
    for (const s of sources) { data = await tryFetch(s); if (data) break }
    if (!Array.isArray(data)) data = [ { id:'dQw4w9WgXcQ', title:'전신 유산소 홈트 15분', part:'전신', channelName:'SSAFIT Official', url:'https://www.youtube.com/embed/dQw4w9WgXcQ' } ]

    const now = Date.now()
    const mapped = data.map(d => {
      const youtubeId = d.id
      const part = ALLOWED_PARTS.includes(d.part) ? d.part : '기타'
      const authorId = ensureChannelUser(d.channelName)
      return {
        id: uuid(),
        youtubeId,
        title: d.title,
        bodyPart: part,
        url: d.url || `https://www.youtube.com/embed/${youtubeId}`,
        thumbnailUrl: `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`,
        views: 0,
        tags: [],
        difficulty: pickDifficulty(part),
        authorId,
        createdAt: now,
        updatedAt: now
      }
    })
    videosRepo.bulkUpsert(mapped, 'youtubeId')
    meta.lastSeedVersion = SEED_VERSION
    changed = true
  }

  // Community posts seed (idempotent via meta flag or existing posts)
  if (!meta.communitySeeded && postsRepo.getAll().length === 0) {
    const authorName = 'SSAFIT 운영자'
    const author = usersRepo.getByName?.(authorName) || usersRepo.create({ name: authorName, email: 'admin@ssafit.local', password: 'admin' })
    const samples = [
      { title: '처음 오셨나요? 커뮤니티 이용 가이드', category: '공지', tags: ['안내','규칙'], content: '환영합니다! 커뮤니티 이용 규칙과 공지를 확인해 주세요. 서로 존중하며 즐거운 운동 문화 만들어요 💪' },
      { title: '전신 루틴 2주 해본 후기', category: '후기', tags: ['전신','홈트'], content: '하루 15분 전신 루틴으로 2주 진행해봤는데 체력이 많이 좋아졌어요! 여러분은 어떤 루틴 추천하시나요?' },
      { title: '하체 루틴 팁 공유합니다', category: '팁', tags: ['하체','팁'], content: '스쿼트/런지 위주 구성 + 마무리 스트레칭 추천. 무릎 각도와 발끝 방향 유의!' },
      { title: '복부 운동은 매일 해도 되나요?', category: '질문', tags: ['복부','코어'], content: '코어 활성화 목적 저강도는 매일도 OK. 다만 통증 시 충분히 휴식하세요.' },
      { title: '이번 주 목표 공유해요', category: '잡담', tags: ['목표','동기'], content: '저는 이번 주 3회 루틴 완수! 여러분의 목표는 무엇인가요? 함께 꾸준히 가봐요 😊' }
    ]
    samples.forEach(s => postsRepo.create({ title: s.title, content: s.content, category: s.category, tags: s.tags, authorId: author.id }))
    meta.communitySeeded = true
    changed = true
  }

  if (changed) localStorage.setItem(META_KEY, JSON.stringify(meta))
}

// Seed sample workout plans to show on calendar (for admin user)
export function seedPlansIfNeeded() {
  const meta = JSON.parse(localStorage.getItem(META_KEY) || '{}')
  if (meta.plansSeeded) return
  if (plansRepo.listByUser ? plansRepo.listByUser('dummy-check').length : plansRepo.listByUser?.length) {
    // If API shape differs, ignore. We'll fall back to count below.
  }
  // If any plans already exist, mark seeded
  try {
    const anyPlans = JSON.parse(localStorage.getItem('ssafit:plans')||'[]')
    if (Array.isArray(anyPlans) && anyPlans.length > 0) {
      localStorage.setItem(META_KEY, JSON.stringify({ ...(meta||{}), plansSeeded: true }))
      return
    }
  } catch {}

  // Determine target user (admin or create)
  const adminName = 'SSAFIT 운영자'
  const admin = usersRepo.getByName?.(adminName) || usersRepo.create({ name: adminName, email: 'admin@ssafit.local', password: 'admin' })
  const userId = admin.id

  // Build simple weekly plan for the current month (Mon/Wed/Fri)
  const now = dayjs()
  const ym = now.format('YYYY-MM')
  const start = now.startOf('month')
  const end = now.endOf('month')

  const vids = videosRepo.getAll()
  const byPart = (part) => vids.filter(v => v.bodyPart === part).slice(0, 3).map(v => v.id)
  const pick = (arr) => arr.length ? arr[0] : null

  const planDates = []
  for (let d = start; d.isBefore(end) || d.isSame(end, 'day'); d = d.add(1, 'day')) {
    const dow = d.day() // 0 sun ... 6 sat
    if (dow === 1 || dow === 3 || dow === 5) planDates.push(d.format('YYYY-MM-DD'))
  }

  const sets = [
    { title: '전신 루틴', vids: byPart('전신') },
    { title: '하체 강화', vids: byPart('하체') },
    { title: '코어/복부', vids: [...byPart('코어'), ...byPart('복부')].slice(0,3) }
  ]

  planDates.slice(0, 9).forEach((dateStr, idx) => {
    const s = sets[idx % sets.length]
    const videoIds = s.vids.length ? s.vids : vids.slice(0,3).map(v=>v.id)
    plansRepo.create({ userId, date: dateStr, title: s.title, videoIds })
  })

  localStorage.setItem(META_KEY, JSON.stringify({ ...(meta||{}), plansSeeded: true }))
}
