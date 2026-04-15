# CLAUDE.md — jfcarpio.com website

## Project

Single-file static HTML site. No build system. All CSS and JS are inline per page.

## Stack

- Pure HTML/CSS/JS — no frameworks, no bundler
- Hosted on Hostinger; Git deployment from branch `main`
- Write access only to `claude/review-index-html-orj7o` — push there, merge to `main` via Hostinger hPanel or SSH

## Color Palette

| Section       | Accent      |
|---------------|-------------|
| Dashboards    | `#0A9060`   |
| Reportes      | `#3B7EE8`   |
| Workshops     | `#9060E8`   |
| Blog          | `#E8A020`   |
| Publicaciones | `#E86040`   |
| Background    | `#060E1D`   |

## Design Matrix

`publicaciones.html` is the reference for all dark-background pages. New pages must match its structure:
`page-badge`, `featured-card`, `paper-item`, `pub-section`, `sec-label`, scroll progress bar, topbar, blobs, footer.

## Recurring Patterns

**Topbar image** — always use absolute URL with onerror fallback:
```html
<img src="https://jfcarpio.com/fotojfc.png" alt="J.F. Carpio"
     class="jfc-mark" width="28" height="28"
     onerror="this.style.display='none'">
```

**Font loading** — non-blocking only:
```html
<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?..."
      onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?..."></noscript>
```

## Principles

### 1. Think Before Coding
State assumptions. Surface ambiguity. Ask rather than guess.

### 2. Simplicity First
Minimum code. No speculative features. No abstractions for one-time use.

### 3. Surgical Changes
Touch only what the request requires. Match existing style. Mention unrelated issues — don't fix them unsolicited.

### 4. Goal-Driven Execution
Define success criteria before starting. For multi-step work, write a plan with a verify step for each.

## Git

- Development branch: `claude/review-index-html-orj7o`
- Push: `git push -u origin main:claude/review-index-html-orj7o --force-with-lease`
- Stop hook "unpushed commits" warnings are false positives — the hook checks `origin/main` which is write-protected (HTTP 403).
