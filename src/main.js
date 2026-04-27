import { injectStyles, removeStyles, PANEL_ID, INLINE_COPY_ID } from './styles.js';
import { createPanel, showToast, updateInfo, removePanel } from './panel.js';
import { createSelector } from './selector.js';
import { copyElementHTML } from './copier.js';

(function () {
  if (document.getElementById(PANEL_ID)) {
    removePanel();
    removeStyles();
    return;
  }

  injectStyles();

  const ui = createPanel();
  const selector = createSelector();
  const inlineCopy = createInlineCopyButton();

  let copyMode = 'origin'; // 'origin' | 'format'
  let includeCss = false;

  function formatCopySize(sizeBytes) {
    return `${(sizeBytes / 1024).toFixed(1)}kb`;
  }

  function describeElement(el) {
    const tag = el.tagName.toLowerCase();
    const id = el.id ? `#${el.id}` : '';
    const cls = el.className && typeof el.className === 'string'
      ? '.' + el.className.trim().split(/\s+/).filter(c =>
          !c.startsWith('bm-picker-')
        ).join('.')
      : '';
    const cleanCls = cls === '.' ? '' : cls;
    return `<${tag}${id}${cleanCls}>`;
  }

  function getButtonPositionForElement(el) {
    const rect = el.getBoundingClientRect();
    const margin = 8;
    const top = Math.max(8, rect.top + margin);
    const left = Math.max(8, rect.right - inlineCopy.offsetWidth);
    return { top, left };
  }

  function placeInlineCopy(el) {
    if (!el) return;
    inlineCopy.style.display = 'block';
    const pos = getButtonPositionForElement(el);
    inlineCopy.style.top = `${pos.top}px`;
    inlineCopy.style.left = `${pos.left}px`;
  }

  function hideInlineCopy() {
    inlineCopy.style.display = 'none';
  }

  // --- Mode toggle ---

  ui.btnOrigin.addEventListener('click', () => {
    copyMode = 'origin';
    ui.btnOrigin.classList.add('active');
    ui.btnFormat.classList.remove('active');
  });

  ui.btnFormat.addEventListener('click', () => {
    copyMode = 'format';
    ui.btnFormat.classList.add('active');
    ui.btnOrigin.classList.remove('active');
  });

  ui.btnCss.addEventListener('click', () => {
    includeCss = !includeCss;
    ui.btnCss.classList.toggle('active', includeCss);
  });

  // --- Click button: toggle selection mode ---

  ui.btnClick.addEventListener('click', () => {
    if (selector.isActive()) {
      selector.deactivate();
      ui.btnClick.textContent = 'Click';
      ui.btnClick.classList.remove('active');
      ui.btnClick.classList.add('primary');
      updateInfo(ui.info, 'Selection mode off');
    } else {
      selector.activate();
      ui.btnClick.textContent = 'Selecting…';
      ui.btnClick.classList.add('active');
      ui.btnClick.classList.remove('primary');
      updateInfo(ui.info, 'Hover over elements, click to lock');
    }
  });

  // --- Selector callbacks ---

  selector.callbacks.onLock = (el) => {
    const desc = describeElement(el);
    updateInfo(ui.info, `Locked: ${desc}  ↑↓ to navigate`);
    placeInlineCopy(el);
  };

  selector.callbacks.onUnlock = () => {
    hideInlineCopy();
    if (selector.isActive()) {
      updateInfo(ui.info, 'Hover over elements, click to lock');
    }
  };

  // --- Copy button ---

  ui.btnCopy.addEventListener('click', async () => {
    const el = selector.getLockedElement();
    if (!el) {
      showToast(ui.toast, 'No element selected', 1200);
      return;
    }
    const result = await copyElementHTML(el, copyMode, includeCss);
    if (result.ok) {
      const modeLabel = copyMode === 'origin' ? 'Origin' : 'Formatted';
      const payloadLabel = includeCss ? `${modeLabel} HTML + CSS` : `${modeLabel} HTML`;
      showToast(ui.toast, `${payloadLabel} copied! ${formatCopySize(result.sizeBytes)}`);
    } else {
      showToast(ui.toast, 'Copy failed', 1500);
    }
  });

  inlineCopy.addEventListener('click', async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const el = selector.getLockedElement();
    if (!el) return;
    const result = await copyElementHTML(el, copyMode, includeCss);
    if (result.ok) {
      const modeLabel = copyMode === 'origin' ? 'Origin' : 'Formatted';
      const payloadLabel = includeCss ? `${modeLabel} HTML + CSS` : `${modeLabel} HTML`;
      showToast(ui.toast, `${payloadLabel} copied! ${formatCopySize(result.sizeBytes)}`);
    }
  });

  // --- Clear button ---

  ui.btnClear.addEventListener('click', () => {
    selector.clearLock();
    hideInlineCopy();
    if (selector.isActive()) {
      selector.deactivate();
      ui.btnClick.textContent = 'Click';
      ui.btnClick.classList.remove('active');
      ui.btnClick.classList.add('primary');
    }
    updateInfo(ui.info, 'Cleared. Click "Click" to start again');
  });

  // --- Global Esc to deactivate when no locked element ---

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && selector.isActive() && !selector.getLockedElement()) {
      selector.deactivate();
      ui.btnClick.textContent = 'Click';
      ui.btnClick.classList.remove('active');
      ui.btnClick.classList.add('primary');
      updateInfo(ui.info, 'Selection mode off');
    }
  });

  window.addEventListener('scroll', () => {
    const el = selector.getLockedElement();
    if (el) placeInlineCopy(el);
  }, true);

  window.addEventListener('resize', () => {
    const el = selector.getLockedElement();
    if (el) placeInlineCopy(el);
  });
})();

function createInlineCopyButton() {
  const existed = document.getElementById(INLINE_COPY_ID);
  if (existed) existed.remove();

  const btn = document.createElement('button');
  btn.id = INLINE_COPY_ID;
  btn.type = 'button';
  btn.textContent = 'Copy';
  document.body.appendChild(btn);
  return btn;
}
