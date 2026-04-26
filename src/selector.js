import {
  PANEL_ID,
  INLINE_COPY_ID,
  HOVER_RING_ID,
  LOCK_RING_ID,
  HIGHLIGHT_CLASS,
  LOCKED_CLASS,
} from './styles.js';

const EXCLUDED_TAGS = new Set(['html', 'body', 'head', 'script', 'style']);

function isExcluded(el) {
  if (!el || el.nodeType !== 1) return true;
  if (el.id === PANEL_ID || el.closest(`#${PANEL_ID}`)) return true;
  if (el.id === INLINE_COPY_ID || el.closest(`#${INLINE_COPY_ID}`)) return true;
  if (EXCLUDED_TAGS.has(el.tagName.toLowerCase())) return true;
  if (el.tagName === 'INPUT' && el.type === 'password') return true;
  return false;
}

export function createSelector() {
  let hoveredEl = null;
  let lockedEl = null;
  let active = false;
  const hoverRing = createRing(HOVER_RING_ID);
  const lockRing = createRing(LOCK_RING_ID);

  const callbacks = { onLock: null, onUnlock: null };

  function clearHighlight() {
    if (hoveredEl) {
      hoveredEl.classList.remove(HIGHLIGHT_CLASS);
      hoveredEl = null;
    }
    hideRing(hoverRing);
  }

  function clearLock() {
    if (lockedEl) {
      lockedEl.classList.remove(LOCKED_CLASS);
      lockedEl = null;
      hideRing(lockRing);
      if (callbacks.onUnlock) callbacks.onUnlock();
    }
  }

  function lockElement(el) {
    if (!el || isExcluded(el)) return;
    clearHighlight();
    clearLock();
    lockedEl = el;
    lockedEl.classList.add(LOCKED_CLASS);
    placeRing(lockRing, lockedEl);
    if (callbacks.onLock) callbacks.onLock(lockedEl);
  }

  function handleMouseOver(e) {
    if (!active || lockedEl) return;
    const target = e.target;
    if (isExcluded(target)) return;
    if (target === hoveredEl) return;
    clearHighlight();
    hoveredEl = target;
    hoveredEl.classList.add(HIGHLIGHT_CLASS);
    placeRing(hoverRing, hoveredEl);
  }

  function handleMouseOut(e) {
    if (!active || lockedEl) return;
    if (e.target === hoveredEl) {
      clearHighlight();
    }
  }

  function handleViewportChange() {
    if (hoveredEl && !lockedEl) {
      placeRing(hoverRing, hoveredEl);
    }
    if (lockedEl) {
      placeRing(lockRing, lockedEl);
    }
  }

  function handleClick(e) {
    if (!active) return;
    const target = e.target;
    if (isExcluded(target)) return;
    e.preventDefault();
    e.stopPropagation();
    lockElement(target);
  }

  function handleKeyDown(e) {
    if (!active || !lockedEl) return;

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const parent = lockedEl.parentElement;
      if (parent && !isExcluded(parent)) {
        lockElement(parent);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const firstChild = Array.from(lockedEl.children).find(c => !isExcluded(c));
      if (firstChild) {
        lockElement(firstChild);
      }
    } else if (e.key === 'Escape') {
      if (lockedEl) {
        clearLock();
      } else {
        deactivate();
      }
    }
  }

  function activate() {
    if (active) return;
    active = true;
    document.addEventListener('mouseover', handleMouseOver, true);
    document.addEventListener('mouseout', handleMouseOut, true);
    document.addEventListener('click', handleClick, true);
    document.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('scroll', handleViewportChange, true);
    window.addEventListener('resize', handleViewportChange);
  }

  function deactivate() {
    active = false;
    clearHighlight();
    clearLock();
    hideRing(hoverRing);
    hideRing(lockRing);
    document.removeEventListener('mouseover', handleMouseOver, true);
    document.removeEventListener('mouseout', handleMouseOut, true);
    document.removeEventListener('click', handleClick, true);
    document.removeEventListener('keydown', handleKeyDown, true);
    window.removeEventListener('scroll', handleViewportChange, true);
    window.removeEventListener('resize', handleViewportChange);
  }

  function getLockedElement() {
    return lockedEl;
  }

  function isActive() {
    return active;
  }

  return {
    activate,
    deactivate,
    clearLock,
    getLockedElement,
    isActive,
    callbacks,
  };
}

function createRing(id) {
  const existed = document.getElementById(id);
  if (existed) existed.remove();
  const ring = document.createElement('div');
  ring.id = id;
  document.body.appendChild(ring);
  return ring;
}

function hideRing(ring) {
  ring.style.display = 'none';
}

function placeRing(ring, el) {
  if (!el) return;
  const rect = el.getBoundingClientRect();
  ring.style.display = 'block';
  ring.style.top = `${rect.top}px`;
  ring.style.left = `${rect.left}px`;
  ring.style.width = `${rect.width}px`;
  ring.style.height = `${rect.height}px`;
}
