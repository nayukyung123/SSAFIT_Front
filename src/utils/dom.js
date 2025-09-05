export const qs = (sel, root = document) => root.querySelector(sel)
export const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel))

export function el(tag, attrs = {}, children = []) {
  const n = document.createElement(tag)
  Object.entries(attrs).forEach(([k, v]) => {
    if (k === 'class') n.className = v
    else if (k.startsWith('on') && typeof v === 'function') n.addEventListener(k.slice(2), v)
    else if (k === 'dataset') Object.assign(n.dataset, v)
    else if (k === 'style' && typeof v === 'object') Object.assign(n.style, v)
    else if (v === true) n.setAttribute(k, '')
    else if (v !== false && v != null) n.setAttribute(k, String(v))
  })
  if (!Array.isArray(children)) children = [children]
  children.forEach(c => n.append(c instanceof Node ? c : document.createTextNode(String(c ?? ''))))
  return n
}

export function formToObject(form) {
  const data = {}
  const fd = new FormData(form)
  fd.forEach((v, k) => {
    if (k in data) data[k] = Array.isArray(data[k]) ? [...data[k], v] : [data[k], v]
    else data[k] = v
  })
  return data
}

export function setFormErrors(form, errors = {}) {
  Object.entries(errors).forEach(([name, msg]) => {
    const input = form.querySelector(`[name="${name}"]`)
    if (!input) return
    const invalid = !!msg
    input.setAttribute('aria-invalid', invalid ? 'true' : 'false')
    input.classList.toggle('is-invalid', invalid)
    // Place invalid-feedback correctly for form-floating
    const wrap = input.closest('.form-floating')
    let fb
    if (wrap) {
      // try to find an existing feedback just after the floating wrapper
      fb = wrap.nextElementSibling
      if (!fb || !fb.classList || !fb.classList.contains('invalid-feedback')) {
        fb = document.createElement('div')
        fb.className = 'invalid-feedback'
        wrap.insertAdjacentElement('afterend', fb)
      }
    } else {
      fb = input.nextElementSibling
      if (!fb || !fb.classList || !fb.classList.contains('invalid-feedback')) {
        fb = document.createElement('div')
        fb.className = 'invalid-feedback'
        input.insertAdjacentElement('afterend', fb)
      }
    }
    fb.textContent = msg || ''
  })
}
