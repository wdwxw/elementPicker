import { injectStyles, removeStyles, PANEL_ID } from './styles.js';
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

  let copyMode = 'origin'; // 'origin' | 'format'

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
  };

  selector.callbacks.onUnlock = () => {
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
    const ok = await copyElementHTML(el, copyMode);
    if (ok) {
      const modeLabel = copyMode === 'origin' ? 'Origin' : 'Formatted';
      showToast(ui.toast, `${modeLabel} HTML copied!`);
    } else {
      showToast(ui.toast, 'Copy failed', 1500);
    }
  });

  // --- Clear button ---

  ui.btnClear.addEventListener('click', () => {
    selector.clearLock();
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
})();
