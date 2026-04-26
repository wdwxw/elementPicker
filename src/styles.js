const PANEL_ID = 'bm-picker-panel';
const INLINE_COPY_ID = 'bm-picker-inline-copy';
const HOVER_RING_ID = 'bm-picker-hover-ring';
const LOCK_RING_ID = 'bm-picker-lock-ring';
const HIGHLIGHT_CLASS = 'bm-picker-highlight';
const LOCKED_CLASS = 'bm-picker-locked';

const CSS = `
#${PANEL_ID} {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 2147483647;
  width: 260px;
  min-width: 260px;
  max-width: 260px;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.09);
  background: rgba(255, 255, 255, 0.96);
  color: #1a1a1a;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  font-size: 13px;
  user-select: none;
  cursor: move;
  box-shadow:
    0 0 0 1px rgba(0, 0, 0, 0.03),
    0 4px 6px -1px rgba(0, 0, 0, 0.06),
    0 16px 32px -4px rgba(0, 0, 0, 0.11);
  animation: bm-panel-in 180ms cubic-bezier(0.2, 0.9, 0.2, 1);
}

#${PANEL_ID} .bm-title {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 10px;
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  color: #b5b5b5;
  pointer-events: none;
}

#${PANEL_ID} .bm-title::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: #4ade80;
}

#${PANEL_ID} .bm-btn-row {
  display: flex;
  gap: 6px;
  margin-bottom: 6px;
}

#${PANEL_ID} .bm-btn-row:last-child {
  margin-bottom: 0;
}

#${PANEL_ID} .bm-btn {
  flex: 1;
  min-width: 0;
  padding: 7px 10px;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  background: #f7f7f7;
  color: #555;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.2;
  text-align: center;
  cursor: pointer;
  transition: color 100ms ease, background 100ms ease, border-color 100ms ease, transform 80ms ease;
}

#${PANEL_ID} .bm-btn:hover {
  background: #efefef;
  border-color: #dddddd;
  color: #222;
}

#${PANEL_ID} .bm-btn:active {
  transform: translateY(1px);
}

#${PANEL_ID} .bm-btn.active,
#${PANEL_ID} .bm-btn.primary {
  background: #111;
  border-color: #111;
  color: #fff;
}

#${PANEL_ID} .bm-btn.active:hover,
#${PANEL_ID} .bm-btn.primary:hover {
  background: #333;
  border-color: #333;
}

#${PANEL_ID} .bm-btn.danger {
  background: #f0f0f0;
  border-color: #e0e0e0;
  color: #666;
}

#${PANEL_ID} .bm-btn.danger:hover {
  background: #e6e6e6;
  border-color: #d6d6d6;
  color: #444;
}

#${PANEL_ID} .bm-toast {
  position: absolute;
  top: -34px;
  left: 50%;
  transform: translateX(-50%) translateY(4px);
  border-radius: 3px;
  padding: 4px 10px;
  white-space: nowrap;
  font-size: 10px;
  font-weight: 600;
  color: #fff;
  background: #111;
  opacity: 0;
  pointer-events: none;
  transition: opacity 120ms ease, transform 120ms ease;
}

#${PANEL_ID} .bm-toast.show {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

#${HOVER_RING_ID},
#${LOCK_RING_ID} {
  position: fixed;
  display: none;
  z-index: 2147483646;
  pointer-events: none;
  border-radius: 3px;
  box-sizing: border-box;
}

#${HOVER_RING_ID} {
  border: 1.5px dashed rgba(0, 0, 0, 0.22);
  background: rgba(0, 0, 0, 0.03);
  transition: opacity 80ms ease;
}

#${LOCK_RING_ID} {
  border: 1.5px dashed rgba(0, 0, 0, 0.22);
  background: rgba(0, 0, 0, 0.03);
  animation: bm-lock-in 180ms cubic-bezier(0.2, 0, 0.1, 1);
}

.${HIGHLIGHT_CLASS} {
  outline: none !important;
  box-shadow: none !important;
  background-color: rgba(0, 0, 0, 0.025) !important;
  cursor: pointer !important;
}

.${LOCKED_CLASS} {
  outline: none !important;
  box-shadow: none !important;
  background-color: rgba(0, 0, 0, 0.045) !important;
}

#${INLINE_COPY_ID} {
  position: fixed;
  z-index: 2147483647;
  display: none;
  padding: 3px 7px;
  border: none;
  border-radius: 4px;
  background: #333;
  color: #aaa;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  font-size: 10px;
  font-weight: 600;
  line-height: 1.2;
  cursor: pointer;
  user-select: none;
  letter-spacing: 0.01em;
  transition: background 100ms ease, color 100ms ease, transform 80ms ease;
}

#${INLINE_COPY_ID}:hover {
  background: #555;
  color: #fff;
}

#${INLINE_COPY_ID}:active {
  transform: translateY(1px);
}

@keyframes bm-panel-in {
  from {
    opacity: 0;
    transform: translate3d(0, 8px, 0) scale(0.985);
  }
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0) scale(1);
  }
}

@keyframes bm-lock-in {
  from {
    opacity: 0;
    transform: scale(1.05);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
`;

export function injectStyles() {
  if (document.getElementById('bm-picker-styles')) return;
  const style = document.createElement('style');
  style.id = 'bm-picker-styles';
  style.textContent = CSS;
  document.head.appendChild(style);
}

export function removeStyles() {
  const style = document.getElementById('bm-picker-styles');
  if (style) style.remove();
}

export { PANEL_ID, INLINE_COPY_ID, HOVER_RING_ID, LOCK_RING_ID, HIGHLIGHT_CLASS, LOCKED_CLASS };
