export function showToast(message, type = 'primary', delay = 2300) {
  const root = document.getElementById('toast-container')
  if (!root) return alert(message)
  const el = document.createElement('div')
  el.className = `toast align-items-center text-bg-${type} border-0`
  el.setAttribute('role', 'status')
  el.setAttribute('aria-live', 'polite')
  el.setAttribute('aria-atomic', 'true')
  el.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">${message}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>`
  root.appendChild(el)
  const t = bootstrap.Toast.getOrCreateInstance(el, { delay })
  el.addEventListener('hidden.bs.toast', () => el.remove())
  t.show()
}

