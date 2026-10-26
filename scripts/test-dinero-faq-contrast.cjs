'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.join(__dirname, '..');
const css = fs.readFileSync(path.join(root, 'las7formas/styles.css'), 'utf8');
const globalCss = fs.readFileSync(path.join(root, 'editorial.css'), 'utf8');
const html = fs.readFileSync(path.join(root, 'las7formas/index.html'), 'utf8');
const rule = css.match(/\.section--faq\s+\.faq\s+details\s*>\s*summary\s*\{([^}]*)\}/);
assert(rule, 'FAQ needs a selector stronger than .editorial summary');
assert(globalCss.includes('.editorial summary{'), 'Global style context changed: re-check cascade');
const ink = rule[1].match(/color:\s*(#[a-f0-9]{6})\s*;/i)?.[1];
const paper = css.match(/--paper:\s*(#[a-f0-9]{6})\s*;/i)?.[1];
assert(ink && paper, 'Explicit ink and paper colors required');
function luminance(hex) {
  const rgb = [1, 3, 5].map(i => Number.parseInt(hex.slice(i, i + 2), 16) / 255);
  const channel = x => x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
  return rgb.map(channel).reduce((a, x, i) => a + x * [0.2126, 0.7152, 0.0722][i], 0);
}
const a = luminance(ink), b = luminance(paper);
const ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
assert(ratio >= 4.5, 'FAQ contrast must meet WCAG AA for normal text');
assert(html.includes('<body class="editorial money-reading">'));
assert.equal((html.match(/<summary\b/g) || []).length, 7, 'Keep all seven questions');
console.log('Dinero FAQ contrast: OK — ' + ratio.toFixed(2) + ':1; 7 questions preserved');
