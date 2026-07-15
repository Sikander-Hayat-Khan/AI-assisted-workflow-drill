# AI-Assisted Workflow Drill

> Same feature, two workflows: a lazy one-shot prompt vs. a spec'd explore → plan → code → verify loop. Diffs the output, documents what broke, and turns the lessons into reusable project rules.

## What This Is

An experiment comparing **vague vs. precise AI prompting** for building a user-settings form with Next.js. Two rounds were run against **Antigravity (Copilot)**, then repeated against **v0**, to measure how prompt specificity affects code quality, scope control, accessibility, and test coverage.

| | Round 1 — Vague Prompt | Round 2 — Precise Prompt |
|---|---|---|
| **Prompt** | "Build a settings form for the user." | Exact fields, `react-hook-form` + `zod`, a11y requirements, tests |
| **Scope** | Multi-tab settings page with unrequested features (password change, 2FA, avatar upload) | Exactly the 4 specified fields — name, email, theme, notifications |
| **Validation** | None — no error states anywhere | Zod schema rejects invalid email / short names, verified by tests |
| **A11y** | Labels wired (`htmlFor`) but no `aria-invalid` or `aria-describedby` | `aria-invalid` / `aria-describedby` / `role="alert"` on every field |
| **Tests** | None | 6 tests (Vitest + RTL) — valid submit, per-field validation, edge cases |
| **Time** | ~10 min, 0 fixes | ~25–30 min, 1 fix (Windows sandbox ACL, not a code bug) |

## Key Findings

- **Vague prompts produce hidden debt.** Round 1 was "faster" only because it deferred validation, testing, and scope-review costs to later.
- **Scope creep is the default.** Both Antigravity and v0 added unrequested features; precise prompting reduced it but didn't eliminate it entirely in v0.
- **Don't trust "tests passed" claims.** v0 self-reported 18/18 passing with no terminal output. Antigravity's first run caught a real (unrelated) failure — you need to see the runner output yourself.

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) 16 (App Router)
- **Language:** JavaScript (`.jsx`)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) v4
- **Validation:** [react-hook-form](https://react-hook-form.com/) + [zod](https://zod.dev/)
- **Testing:** [Vitest](https://vitest.dev/) + [React Testing Library](https://testing-library.com/)

## Project Structure

```
settings_form/
├── app/
│   ├── globals.css
│   ├── layout.js
│   └── page.js
├── public/
│   ├── antigravity – precise prompt.png
│   ├── antigravity – vague prompt.png
│   ├── v0 – precise prompt.png
│   └── v0 – vague prompt.png
├── rules/
│   └── rules-additions.md
├── round1-vs-round2.diff
├── WORKFLOW.md
├── V0_COMPARISON.md
└── package.json
```


## Screenshots

### Antigravity

| Vague Prompt | Precise Prompt |
|---|---|
| ![Antigravity – vague](public/antigravity%20–%20vague%20prompt.png) | ![Antigravity – precise](public/antigravity%20–%20precise%20prompt.png) |

### v0

| Vague Prompt | Precise Prompt |
|---|---|
| ![v0 – vague](public/v0%20–%20vague%20prompt.png) | ![v0 – precise](public/v0%20-%20precise%20prompt.png) |

## Getting Started

```bash
# Install dependencies
npm install

# Run the dev server
npm run dev

Open http://localhost:3000 to view the app.
