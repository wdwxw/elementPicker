import { formatHTML } from './formatter.js';

/**
 * Copy the outerHTML of an element to the clipboard.
 * @param {HTMLElement} element
 * @param {'origin' | 'format'} mode
 * @returns {Promise<boolean>} true if copy succeeded
 */
export async function copyElementHTML(element, mode) {
  if (!element) return false;

  let html = element.outerHTML;
  if (mode === 'format') {
    html = formatHTML(html);
  }

  try {
    await navigator.clipboard.writeText(html);
    return true;
  } catch {
    return fallbackCopy(html);
  }
}

function fallbackCopy(text) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.cssText = 'position:fixed;left:-9999px;top:-9999px;opacity:0';
  document.body.appendChild(textarea);
  textarea.select();
  let ok = false;
  try {
    ok = document.execCommand('copy');
  } catch { /* ignore */ }
  textarea.remove();
  return ok;
}
