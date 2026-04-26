import { PANEL_ID } from './styles.js';

/**
 * Creates the floating tool panel.
 * Returns an object with references to each button and the panel element.
 */
export function createPanel() {
  if (document.getElementById(PANEL_ID)) {
    document.getElementById(PANEL_ID).remove();
  }

  const panel = document.createElement('div');
  panel.id = PANEL_ID;

  panel.innerHTML = `
    <div class="bm-toast" id="bm-toast"></div>
    <div class="bm-title">Element Picker</div>
    <div class="bm-btn-row">
      <button class="bm-btn primary" id="bm-btn-click">Click</button>
    </div>
    <div class="bm-btn-row">
      <button class="bm-btn active" id="bm-btn-origin">Origin</button>
      <button class="bm-btn" id="bm-btn-format">Format</button>
    </div>
    <div class="bm-btn-row">
      <button class="bm-btn" id="bm-btn-copy">Copy</button>
      <button class="bm-btn danger" id="bm-btn-clear">Clear</button>
    </div>
  `;

  document.body.appendChild(panel);
  initDrag(panel);

  return {
    panel,
    btnClick: panel.querySelector('#bm-btn-click'),
    btnOrigin: panel.querySelector('#bm-btn-origin'),
    btnFormat: panel.querySelector('#bm-btn-format'),
    btnCopy: panel.querySelector('#bm-btn-copy'),
    btnClear: panel.querySelector('#bm-btn-clear'),
    info: panel.querySelector('#bm-info'),
    toast: panel.querySelector('#bm-toast'),
  };
}

function initDrag(panel) {
  let isDragging = false;
  let startX, startY, origX, origY;

  panel.addEventListener('mousedown', (e) => {
    if (e.target.tagName === 'BUTTON') return;
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    const rect = panel.getBoundingClientRect();
    origX = rect.left;
    origY = rect.top;
    e.preventDefault();
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    panel.style.left = origX + dx + 'px';
    panel.style.top = origY + dy + 'px';
    panel.style.right = 'auto';
    panel.style.bottom = 'auto';
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
  });
}

export function showToast(toast, message, duration = 1500) {
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration);
}

export function updateInfo(info, text) {
  if (!info) return;
  info.textContent = text;
}

export function removePanel() {
  const panel = document.getElementById(PANEL_ID);
  if (panel) panel.remove();
}
