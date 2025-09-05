const SYS_PROMPT = `당신은 SSAFIT의 AI 코치입니다. 다음 원칙을 지키세요:
- 사용자는 한국어를 사용합니다. 한국어로 친근하고 간결하게 답하세요.
- 제공 기능: 운동 루틴 추천(부위/난이도/시간), 영상 선택 가이드, 리뷰 요약, 주간 운동계획 제안(요일/휴식 포함), 초보자/중급자 변형 동작 안내.
- 보안/의학 주의: 의학적 진단/치료 대신 운동 가이드만 제시하고, 통증/질환 시 전문가 상담 권고.
- 데이터 한계: 서버는 없고 브라우저 LocalStorage만 사용합니다. 필요한 경우 사용자의 선호(부위/시간/난이도)를 물어보고 점진적으로 계획을 제안하세요.
- 출력 형식: 핵심을 먼저 bullet로, 그 다음 선택적 세부 팁을 제공.
`;

export function getApiKey() {
  return localStorage.getItem('ssafit:ai.key') || '';
}
export function setApiKey(key) {
  if (!key) localStorage.removeItem('ssafit:ai.key');
  else localStorage.setItem('ssafit:ai.key', key);
}

const HIST_KEY = 'ssafit:ai.history';
export function getHistory() {
  try { return JSON.parse(localStorage.getItem(HIST_KEY) || '[]') } catch { return [] }
}
export function saveHistory(messages) {
  localStorage.setItem(HIST_KEY, JSON.stringify(messages||[]))
}
export function clearHistory() { localStorage.removeItem(HIST_KEY) }
export function exportHistory() {
  const messages = getHistory()
  const blob = new Blob([JSON.stringify(messages, null, 2)], { type: 'application/json' })
  const filename = `ssafit-ai-history-${new Date().toISOString().replace(/[:.]/g,'-')}.json`
  return { filename, blob }
}

// messages: [{role:'user'|'assistant', content:'...'}]
export async function generate(messages) {
  const key = getApiKey();
  if (!key) {
    // Fallback rule-based mock
    const last = messages[messages.length - 1]?.content?.toLowerCase?.() || '';
    return mockCoach(last);
  }
  try {
    const mod = await import('https://esm.sh/@google/generative-ai');
    const genAI = new mod.GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: { role: 'system', parts: [{ text: SYS_PROMPT }] }
    });
    const mapped = messages.map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] }));
    const past = mapped.slice(0, Math.max(0, mapped.length - 1));
    const last = mapped[mapped.length - 1] || { role: 'user', parts: [{ text: '' }] };
    const chat = model.startChat({ history: past });
    const result = await chat.sendMessage(last.parts[0].text);
    const text = result.response?.text?.() || '';
    return text || '(응답이 비어있어요)';
  } catch (e) {
    console.warn('Gemini call failed, using mock', e);
    const last = messages[messages.length - 1]?.content?.toLowerCase?.() || '';
    return mockCoach(last);
  }
}

// 환경변수/메타/전역에서 자동 키 로딩은 지원하지 않습니다.

function mockCoach(q) {
  // Very simple heuristic
  const t = q.toLowerCase();
  const parts = [];
  if (t.includes('전신') || t.includes('풀바디') || t.includes('full')) parts.push('전신 15분 루틴(스쿼트/푸시업/플랭크 3세트)');
  if (t.includes('하체') || t.includes('leg')) parts.push('하체 20분(스쿼트/런지/힙힌지 3세트)');
  if (t.includes('코어') || t.includes('복부') || t.includes('core') || t.includes('abs')) parts.push('코어 10분(플랭크/데드버그/버드독)');
  if (parts.length === 0) parts.push('가벼운 전신 10분 루틴으로 시작해보세요(스쿼트/푸시업/플랭크 각 30초×3세트).');
  return `추천 루틴\n- ${parts.join('\n- ')}\n\n추가 팁\n- 통증 없는 범위에서 진행하고, 세트 간 45~60초 휴식하세요.\n- 난이도가 높다면 횟수/시간을 70%로 낮춰 주세요.`;
}
