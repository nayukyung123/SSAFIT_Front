export function formatDate(ts) {
  try { return dayjs(ts).format('YYYY-MM-DD HH:mm') } catch { return '' }
}

export function ymd(ts = Date.now()) {
  try { return dayjs(ts).format('YYYY-MM-DD') } catch { return '' }
}

