# CLAUDE.md — jfcarpio.com
v1.131 · 2026-04-24 · Author: JFC + Claude

---

## Project

Static website + Cloudflare Workers deployed at jfcarpio.com.
Branch for feature work: `claude/high-contrast-white-design-VK5kk`. Base: `main`.

**Key files:**
- `index.html` — Dark theme homepage (current production)
- `index-white-contrast.html` — High-contrast white theme (B version)
- `worker.js` + `wrangler.toml` — Cloudflare Worker
- `network-*.jpg`, `fotojfc.png`, `og-jfcarpio.png` — Assets

**Timestamped backups are intentional and must never be removed.**

---

## Absolute Rules (never change without JFC explicit approval)

### Colors — Dark Theme
- Background: `#060E1D`
- Primary text: `#FFFFFF`
- Secondary text: `#CCCCCC` minimum
- Accents: `#E86040` (orange) · `#E8A020` (gold) · `#28ECAA` (green) · `#3B7EE8` (blue)

### Colors — White Theme (index-white-contrast.html)
- Background: `#FFFFFF`
- Primary text: `#000000`
- Secondary text: `#333333` minimum
- Accents: same as dark theme

### Typography
- Body prose: `Lora` (serif)
- UI / labels / monospace: `Space Mono`
- Bento headlines: `Barlow Condensed`
- Minimum font size: `.82rem` — no exceptions, ever

### Layout
- Mobile-first: base styles target 320px, enhance up with `min-width`
- Touch targets: 44px minimum
- Content max-width: 1300px

### Animation (CRITICAL — breaking these hides content permanently)
- Reveal gate: `document.documentElement.className+=' js-rv'` must stay in script
- Only `.js-rv .reveal { opacity:0 }` is safe — never set `opacity:0` on `.reveal` bare
- Never re-add inline `revEl.style.opacity='0'` pattern

### Image Paths (CRITICAL — must always be absolute URLs)
- `fotojfc.png` → `https://jfcarpio.com/fotojfc.png` (NEVER URL-encoded filenames)
- `network-*.jpg` → `https://jfcarpio.com/network-*.jpg`
- `og-*.png` → `https://jfcarpio.com/og-*.png`
- Pexels CDN → `https://images.pexels.com/...` (unchanged)
- **Pre-flight check:** After any git pull, grep for `src="[^h]` to catch relative/corrupted paths before editing

### i18n
- Every translatable element: `data-t="key"` attribute
- Strings: `var T = { es:{...}, en:{...} }` — both objects must have identical keys
- Textarea placeholders: `data-t-placeholder` (separate attribute)

---

## Versioning

Current: **v1.131**. Increment by 0.1 for each meaningful change. Update the CSS master block comment header on every version bump.

---

## Git

```bash
git status
git diff index.html
git log --oneline -10
git add <specific-files>   # never git add -A blindly
```

Commit format:
```
vX.XXX: Short description of what changed

- Why bullet
- Why bullet

https://claude.ai/code/session_[ID]
```

---

## Workflow rules for Claude

1. **Propose before acting.** Present the plan, wait for JFC approval, then execute.
2. **JFC's word is final** unless a request is genuinely technically impossible.
3. **No unsolicited refactoring.** Only change what was asked.
4. **No removing backups.** Timestamped files are intentional safety nets.
5. **Commit after each version bump**, not in bulk.
