const VOID_ELEMENTS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'param', 'source', 'track', 'wbr'
]);

/**
 * Lightweight HTML formatter — indents nested tags for readability.
 * No external dependencies so the bookmarklet stays small.
 */
export function formatHTML(raw) {
  let result = '';
  let indent = 0;
  const tab = '  ';

  const tokens = tokenize(raw);

  for (const token of tokens) {
    if (token.type === 'closetag') {
      indent = Math.max(0, indent - 1);
      result += tab.repeat(indent) + token.text + '\n';
    } else if (token.type === 'opentag') {
      result += tab.repeat(indent) + token.text + '\n';
      if (!token.selfClose && !VOID_ELEMENTS.has(token.tagName)) {
        indent++;
      }
    } else if (token.type === 'text') {
      const trimmed = token.text.trim();
      if (trimmed) {
        result += tab.repeat(indent) + trimmed + '\n';
      }
    } else {
      result += tab.repeat(indent) + token.text + '\n';
    }
  }

  return result.trimEnd();
}

function tokenize(html) {
  const tokens = [];
  let i = 0;

  while (i < html.length) {
    if (html[i] === '<') {
      const end = html.indexOf('>', i);
      if (end === -1) {
        tokens.push({ type: 'text', text: html.slice(i) });
        break;
      }

      const tag = html.slice(i, end + 1);
      i = end + 1;

      if (tag.startsWith('<!--')) {
        tokens.push({ type: 'comment', text: tag });
      } else if (tag.startsWith('<!')) {
        tokens.push({ type: 'doctype', text: tag });
      } else if (tag.startsWith('</')) {
        const tagName = tag.replace(/<\/\s*(\w+).*>/, '$1').toLowerCase();
        tokens.push({ type: 'closetag', text: tag, tagName });
      } else {
        const selfClose = tag.endsWith('/>');
        const tagName = tag.replace(/<\s*(\w+).*/, '$1').toLowerCase();
        tokens.push({ type: 'opentag', text: tag, tagName, selfClose });
      }
    } else {
      const next = html.indexOf('<', i);
      const text = next === -1 ? html.slice(i) : html.slice(i, next);
      tokens.push({ type: 'text', text });
      i = next === -1 ? html.length : next;
    }
  }

  return tokens;
}
