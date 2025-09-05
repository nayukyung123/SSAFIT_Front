export function renderPagination({ total, page, pageSize, onChange }) {
  const pages = Math.max(1, Math.ceil(total / pageSize))
  const nav = document.createElement('nav')
  nav.setAttribute('aria-label', '페이지네이션')
  const ul = document.createElement('ul')
  ul.className = 'pagination justify-content-center'
  const item = (p, label = p, disabled = false, active = false) => {
    const li = document.createElement('li')
    li.className = `page-item ${disabled?'disabled':''} ${active?'active':''}`
    const a = document.createElement('button')
    a.className = 'page-link'
    a.type = 'button'
    a.textContent = String(label)
    a.addEventListener('click', () => !disabled && !active && onChange?.(p))
    li.appendChild(a)
    return li
  }
  ul.appendChild(item(page - 1, '이전', page <= 1))
  for (let i = 1; i <= pages; i++) ul.appendChild(item(i, i, false, i === page))
  ul.appendChild(item(page + 1, '다음', page >= pages))
  nav.appendChild(ul)
  return nav
}

