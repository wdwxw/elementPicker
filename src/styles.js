const PANEL_ID = 'bm-picker-panel';
const HIGHLIGHT_CLASS = 'bm-picker-highlight';
const LOCKED_CLASS = 'bm-picker-locked';

const CSS = `
#${PANEL_ID} {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 2147483647;
  background: #1b1b1f;
  color: #eeeef0;
  border-radius: 8px;
  padding: 12px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 13px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06);
  user-select: none;
  cursor: move;
  min-width: 200px;
  border: none;
}

#${PANEL_ID} .bm-title {
  font-size: 11px;
  font-weight: 500;
  color: #6b6f76;
  margin-bottom: 8px;
  letter-spacing: 0.3px;
  pointer-events: none;
}

#${PANEL_ID} .bm-btn-row {
  display: flex;
  gap: 4px;
  margin-bottom: 4px;
}

#${PANEL_ID} .bm-btn-row:last-child {
  margin-bottom: 0;
}

#${PANEL_ID} .bm-btn {
  flex: 1;
  padding: 6px 8px;
  border: none;
  border-radius: 6px;
  background: rgba(255,255,255,0.06);
  color: #b4b5b9;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  text-align: center;
  transition: all 0.12s ease;
  line-height: 1.2;
}

#${PANEL_ID} .bm-btn:hover {
  background: rgba(255,255,255,0.1);
  color: #eeeef0;
}

#${PANEL_ID} .bm-btn:active {
  transform: scale(0.97);
}

#${PANEL_ID} .bm-btn.active {
  background: #5e6ad2;
  color: #fff;
  font-weight: 500;
}

#${PANEL_ID} .bm-btn.active:hover {
  background: #6c78e0;
}

#${PANEL_ID} .bm-btn.primary {
  background: #5e6ad2;
  color: #fff;
  font-weight: 500;
}

#${PANEL_ID} .bm-btn.primary:hover {
  background: #6c78e0;
}

#${PANEL_ID} .bm-btn.danger {
  background: transparent;
  color: #e5484d;
}

#${PANEL_ID} .bm-btn.danger:hover {
  background: rgba(229, 72, 77, 0.12);
  color: #f16a6e;
}

#${PANEL_ID} .bm-info {
  font-size: 11px;
  color: #5c5f66;
  margin-top: 6px;
  line-height: 1.4;
  pointer-events: none;
}

#${PANEL_ID} .bm-toast {
  position: absolute;
  top: -32px;
  left: 50%;
  transform: translateX(-50%);
  background: #5e6ad2;
  color: #fff;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 500;
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.15s ease;
  pointer-events: none;
}

#${PANEL_ID} .bm-toast.show {
  opacity: 1;
}

.${HIGHLIGHT_CLASS} {
  outline: 2px solid #5e6ad2 !important;
  outline-offset: -1px !important;
  background-color: rgba(94, 106, 210, 0.06) !important;
  cursor: pointer !important;
  transition: outline-color 0.1s !important;
}

.${LOCKED_CLASS} {
  outline: 2px solid #e5484d !important;
  outline-offset: -1px !important;
  background-color: rgba(229, 72, 77, 0.06) !important;
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

export { PANEL_ID, HIGHLIGHT_CLASS, LOCKED_CLASS };
