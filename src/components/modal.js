export function confirmModal({ title = '확인', body = '계속하시겠습니까?', confirmText = '확인', cancelText = '취소' } = {}) {
  return new Promise((resolve) => {
    const root = document.getElementById('modal-root');
    const id = `modal-${Date.now()}`;
    root.innerHTML = `
      <div class="modal fade" id="${id}" tabindex="-1" aria-labelledby="${id}-label" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h1 class="modal-title fs-5" id="${id}-label">${title}</h1>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="닫기"></button>
            </div>
            <div class="modal-body"></div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">${cancelText}</button>
              <button type="button" class="btn btn-primary" id="${id}-ok">${confirmText}</button>
            </div>
          </div>
        </div>
      </div>`;
    const el = root.firstElementChild;
    const bodyEl = el.querySelector('.modal-body');
    // Support Node or string body without coercing to "[object HTMLDivElement]"
    if (body instanceof Node) {
      bodyEl.innerHTML = '';
      bodyEl.appendChild(body);
    } else {
      bodyEl.innerHTML = String(body ?? '');
    }
    const modal = new bootstrap.Modal(el, { backdrop: 'static' });
    let resolved = false;
    el.addEventListener('hidden.bs.modal', () => { if (!resolved) resolve(false); }, { once: true });
    el.querySelector(`#${id}-ok`).addEventListener('click', () => { resolved = true; resolve(true); modal.hide(); });
    modal.show();
  });
}
