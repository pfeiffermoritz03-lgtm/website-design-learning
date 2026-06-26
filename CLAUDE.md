# CLAUDE.md — AI Assistant Guide

## Project Overview

**website-design-learning** is a structured learning resource for web design using pure Vanilla HTML, CSS, and JavaScript — no frameworks, no build tools, no external dependencies. The project is maintained in German (`pfeiffermoritz03@gmail.com`) but this guide is written in English for AI assistants.

Repository: `pfeiffermoritz03-lgtm/website-design-learning`
Primary language: German (UI text, comments, content)
Stack: Vanilla HTML5 / CSS3 / ES6+ JavaScript

---

## Core Constraint

**No external libraries or frameworks.** Every feature must be implemented with the native browser platform:
- No React, Vue, Angular, Svelte, or any JS framework
- No Bootstrap, Tailwind, or CSS utility libraries
- No npm packages (there is no `package.json`)
- No build step, bundler, or transpiler
- Everything runs directly in the browser by opening HTML files

---

## Repository Structure (intended)

```
website-design-learning/
├── CLAUDE.md               # This file
├── README.md               # Short project description (German)
├── index.html              # Main entry point / table of contents
├── basics/                 # HTML & CSS fundamentals
│   ├── 01-html-structure/
│   ├── 02-css-selectors/
│   ├── 03-box-model/
│   └── ...
├── layouts/                # Layout techniques
│   ├── flexbox/
│   ├── grid/
│   └── responsive/
├── components/             # Reusable UI patterns (pure CSS/JS)
│   ├── navigation/
│   ├── cards/
│   ├── modals/
│   └── ...
├── animations/             # CSS animations and JS-driven effects
├── projects/               # Larger end-to-end example projects
└── assets/                 # Shared images, fonts, global CSS
    ├── css/
    ├── fonts/
    └── images/
```

Each lesson folder typically contains:
- `index.html` — the example or exercise
- `style.css` — styles scoped to that lesson
- `script.js` — JavaScript for that lesson (only if needed)
- `README.md` — brief explanation in German

---

## File & Code Conventions

### HTML
- Use semantic HTML5 elements (`<header>`, `<main>`, `<section>`, `<article>`, `<nav>`, `<footer>`)
- Always include `<!DOCTYPE html>` and `lang="de"` on `<html>`
- Indent with 2 spaces
- Use double quotes for attributes
- Self-close void elements: `<img />`, `<input />`

### CSS
- Indent with 2 spaces
- Use kebab-case for class names: `.card-header`, `.nav-link`
- Prefer CSS custom properties (variables) in `:root` for colors and spacing
- Mobile-first media queries: write base styles for mobile, use `min-width` breakpoints to scale up
- Avoid `!important` unless overriding a browser default that cannot be targeted otherwise
- Group properties: layout → box model → typography → visual → animation

### JavaScript
- Use `const` by default; `let` only when reassignment is needed; never `var`
- Use `addEventListener` rather than inline event attributes (`onclick="..."`)
- Prefer `querySelector`/`querySelectorAll` over `getElementById`/`getElementsByClassName`
- Keep JS files small and focused; one concept per file
- No `console.log` left in committed code
- ES modules (`type="module"`) are acceptable for larger examples

### Comments
- Write comments in German to match the learning material language
- Comment the *why*, not the *what* — code should be self-explanatory
- Each lesson's HTML file should have a `<!-- Lernziel: ... -->` comment near the top explaining the learning objective

---

## Git Workflow

- **Main branch:** `main` — stable, reviewed content only
- **Feature branches:** `feature/<topic>` for new lessons or sections
- **Fix branches:** `fix/<description>` for corrections
- Development branch for AI work: `claude/claude-md-docs-kndale`

### Commit messages
Use German imperative mood, present tense, max 72 characters:
```
Lektion zu CSS Flexbox hinzufügen
Box-Modell Beispiel korrigieren
README aktualisieren
```

No ticket numbers, no "WIP", no emoji unless the project adopts them explicitly.

---

## Development Workflow

Since there is no build step, development is simple:

1. Open any `index.html` directly in a browser (file:// protocol works)
2. Edit HTML/CSS/JS in your editor
3. Refresh the browser to see changes
4. Use browser DevTools for debugging

No server is required unless a lesson specifically demonstrates fetch/CORS behavior, in which case use Python's built-in server:
```bash
python3 -m http.server 8080
```

---

## Adding New Content

When adding a new lesson:
1. Create a folder under the appropriate category (e.g., `layouts/css-grid/`)
2. Add `index.html`, `style.css` (if needed), `script.js` (if needed), and `README.md`
3. Link the new lesson from the root `index.html` table of contents
4. Keep examples focused on one concept — avoid teaching multiple things at once
5. Include at least one working live demo and one broken/before version if the lesson is about fixing something

---

## What AI Assistants Should Avoid

- **Do not introduce npm, webpack, Vite, or any build tooling** — this project deliberately avoids them
- **Do not add external CDN links** for libraries (e.g., no jQuery, no Bootstrap CDN)
- **Do not use TypeScript** — all JavaScript must be plain `.js`
- **Do not refactor working examples** unnecessarily — learners need to read and understand the code as written
- **Do not translate German content to English** unless specifically asked
- **Do not add excessive comments** — code should be readable; only add comments when something is non-obvious
- **Do not push to `main` directly** — always use a feature branch and get it reviewed first
