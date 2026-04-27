import { formatHTML } from './formatter.js';

/**
 * Copy the outerHTML of an element to the clipboard.
 * @param {HTMLElement} element
 * @param {'origin' | 'format'} mode
 * @param {boolean} includeCss
 * @returns {Promise<boolean>} true if copy succeeded
 */
export async function copyElementHTML(element, mode, includeCss = false) {
  if (!element) return false;

  const html = includeCss ? buildHTMLWithCSS(element, mode) : buildHTMLOnly(element, mode);

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

function buildHTMLOnly(element, mode) {
  let html = element.outerHTML;
  if (mode === 'format') {
    html = formatHTML(html);
  }
  return html;
}

function buildHTMLWithCSS(element, mode) {
  const cloneRoot = element.cloneNode(true);
  const rootId = ensureExportRootId(cloneRoot);
  const originalRules = collectMatchedOriginalCSSRules(element);
  const snapshotRules = buildComputedSnapshotRules(element, rootId);
  const cssRules = mergeRules(originalRules, snapshotRules);

  let html = cloneRoot.outerHTML;
  if (mode === 'format') {
    html = formatHTML(html);
  }

  const css = cssRules.join('\n\n');
  return `${html}\n<style>\n${css}\n</style>`;
}

function ensureExportRootId(root) {
  if (root.id) return root.id;
  const id = `bm-export-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  root.id = id;
  return id;
}

function safeGetComputedStyle(el, pseudo) {
  try {
    return window.getComputedStyle(el, pseudo);
  } catch {
    return null;
  }
}

function cssTextFromComputed(styleDecl) {
  let out = '';
  for (const prop of styleDecl) {
    const value = styleDecl.getPropertyValue(prop);
    if (!value) continue;
    const priority = styleDecl.getPropertyPriority(prop);
    out += `  ${prop}: ${value}${priority ? ' !important' : ''};\n`;
  }
  return out.trimEnd();
}

function shouldIncludePseudo(styleDecl) {
  const content = styleDecl.getPropertyValue('content');
  return content && content !== 'none' && content !== 'normal';
}

function collectMatchedOriginalCSSRules(root) {
  const out = [];
  const seen = new Set();
  const visitedSheets = new Set();

  for (const sheet of Array.from(document.styleSheets || [])) {
    const chunk = collectRulesFromSheet(sheet, root, visitedSheets);
    for (const text of chunk) {
      if (seen.has(text)) continue;
      seen.add(text);
      out.push(text);
    }
  }
  return out;
}

function collectRulesFromSheet(sheet, root, visitedSheets) {
  if (!sheet || visitedSheets.has(sheet)) return [];
  visitedSheets.add(sheet);

  let rules;
  try {
    rules = sheet.cssRules;
  } catch {
    return [];
  }

  return collectRulesFromRuleList(rules, root, visitedSheets);
}

function collectRulesFromRuleList(ruleList, root, visitedSheets) {
  const out = [];
  for (const rule of Array.from(ruleList || [])) {
    if (isStyleRule(rule)) {
      if (selectorMatchesTree(rule.selectorText, root)) {
        out.push(rule.cssText);
      }
      continue;
    }

    if (isMediaRule(rule) || isSupportsRule(rule)) {
      const nested = collectRulesFromRuleList(rule.cssRules, root, visitedSheets);
      if (nested.length > 0) {
        out.push(`${rule.cssText.slice(0, rule.cssText.indexOf('{')).trim()} {\n${indent(nested.join('\n\n'))}\n}`);
      }
      continue;
    }

    if (isImportRule(rule)) {
      out.push(...collectRulesFromSheet(rule.styleSheet, root, visitedSheets));
    }
  }
  return out;
}

function isStyleRule(rule) {
  return typeof CSSStyleRule !== 'undefined' && rule instanceof CSSStyleRule;
}

function isMediaRule(rule) {
  return typeof CSSMediaRule !== 'undefined' && rule instanceof CSSMediaRule;
}

function isSupportsRule(rule) {
  return typeof CSSSupportsRule !== 'undefined' && rule instanceof CSSSupportsRule;
}

function isImportRule(rule) {
  return typeof CSSImportRule !== 'undefined' && rule instanceof CSSImportRule;
}

function selectorMatchesTree(selectorText, root) {
  const selectors = splitTopLevelSelectors(selectorText);
  for (const selector of selectors) {
    if (!selector) continue;
    try {
      if (root.matches(selector)) return true;
      if (root.querySelector(selector)) return true;
    } catch {
      // Ignore invalid selectors for query APIs.
    }
  }
  return false;
}

function splitTopLevelSelectors(selectorText) {
  const out = [];
  let buf = '';
  let paren = 0;
  let bracket = 0;

  for (let i = 0; i < selectorText.length; i++) {
    const ch = selectorText[i];
    if (ch === '(') paren++;
    if (ch === ')') paren = Math.max(0, paren - 1);
    if (ch === '[') bracket++;
    if (ch === ']') bracket = Math.max(0, bracket - 1);

    if (ch === ',' && paren === 0 && bracket === 0) {
      out.push(buf.trim());
      buf = '';
      continue;
    }
    buf += ch;
  }

  if (buf.trim()) out.push(buf.trim());
  return out;
}

function buildComputedSnapshotRules(root, rootId) {
  const srcNodes = [root, ...root.querySelectorAll('*')];
  const out = [];

  for (let i = 0; i < srcNodes.length; i++) {
    const src = srcNodes[i];
    const selector = i === 0
      ? `#${cssEscape(rootId)}`
      : `#${cssEscape(rootId)} ${getNodePathSelector(root, src)}`;

    const computed = safeGetComputedStyle(src);
    if (computed) {
      const decl = cssTextFromComputed(computed);
      if (decl) out.push(`${selector} {\n${decl}\n}`);
    }

    for (const pseudo of ['::before', '::after']) {
      const pseudoStyle = safeGetComputedStyle(src, pseudo);
      if (!pseudoStyle || !shouldIncludePseudo(pseudoStyle)) continue;
      const pseudoDecl = cssTextFromComputed(pseudoStyle);
      if (pseudoDecl) {
        out.push(`${selector}${pseudo} {\n${pseudoDecl}\n}`);
      }
    }
  }
  return out;
}

function getNodePathSelector(root, node) {
  const parts = [];
  let current = node;
  while (current && current !== root) {
    parts.push(selectorPart(current));
    current = current.parentElement;
  }
  return parts.reverse().join(' > ');
}

function selectorPart(el) {
  const tag = el.tagName.toLowerCase();
  if (el.id) return `${tag}#${cssEscape(el.id)}`;

  const classes = Array.from(el.classList || []).map((c) => `.${cssEscape(c)}`).join('');
  const parent = el.parentElement;
  if (!parent) return `${tag}${classes}`;

  const siblings = Array.from(parent.children).filter((n) => n.tagName === el.tagName);
  const index = siblings.indexOf(el) + 1;
  return `${tag}${classes}:nth-of-type(${index})`;
}

function cssEscape(value) {
  if (typeof CSS !== 'undefined' && CSS.escape) return CSS.escape(value);
  return String(value).replace(/[^a-zA-Z0-9_-]/g, (m) => `\\${m}`);
}

function mergeRules(primary, fallback) {
  const out = [];
  const seen = new Set();
  for (const rule of [...primary, ...fallback]) {
    if (!rule || seen.has(rule)) continue;
    seen.add(rule);
    out.push(rule);
  }
  return out;
}

function indent(text) {
  return text.split('\n').map((line) => line ? `  ${line}` : line).join('\n');
}
