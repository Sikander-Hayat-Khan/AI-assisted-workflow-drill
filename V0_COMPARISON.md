# Stretch: v0 vs. Antigravity Comparison

Same two prompts (vague, then precise) run against both tools. Antigravity
built inside the actual Next.js repo; v0 built in a fresh scaffold with no
existing codebase to match, so treat the comparison as directional, not a
strict apples-to-apples benchmark.

## Round 1 — vague prompt ("Build a settings form for the user.")

| | Antigravity | v0 |
|---|---|---|
| Validation | None — no error states anywhere in the file | Client-side validation with inline error messages, unprompted |
| Scope | Massive — full multi-tab settings page (Profile/Account/Notifications/Appearance), password change, 2FA, avatar upload, font size, language | Single-section form — profile picture, name, email, phone, location, bio |
| Persistence | `localStorage`, unconditional write on save | `localStorage`, with a visible "Settings saved successfully!" success banner |
| A11y | Labels correctly wired (`htmlFor`), but no error-state ARIA since there are no errors to describe | Labels present; no error-state ARIA visible in the screenshot (no invalid state was triggered to check) |

**Key finding:** the same one-sentence prompt produced *opposite* validation
defaults across tools — Antigravity shipped zero checks, v0 added its own
without being asked. Scope inflation happened on both, just in different
directions: Antigravity ballooned to unrelated account/security features,
v0 stayed within "profile settings" but still added more fields (phone,
location, bio) than the eventual precise spec asked for.

## Round 2 — precise prompt (name, email, theme, notification toggle; react-hook-form + zod; a11y; tests)

| | Antigravity | v0 |
|---|---|---|
| Fields delivered | Exactly the 4 specified — name, email, theme, notifications | The 4 specified, **plus an unrequested profile-picture upload** carried over from round 1 (visible in the screenshot: "Change Photo" + remove button) |
| Validation | zod schema, verified via passing tests | Zod + react-hook-form per v0's own summary; required-field asterisks visible in the UI |
| A11y | `aria-invalid` / `aria-describedby` / `role="alert"` explicitly wired, confirmed by test assertions | v0 claims WCAG 2.1 AA — `aria-invalid`, `aria-describedby`, `aria-checked`, `role="alert"` — but this is self-reported, not independently verified the way the RTL tests verified Antigravity's |
| Tests | 6 tests, watched run in a real terminal, one fix needed (unrelated Windows sandbox ACL issue) | v0 self-reports "18/18 tests passing... ~2-3 seconds" in its chat summary — never observed running, no terminal output to verify |
| Stack context | Matched the existing repo's `.jsx` convention, since it ran inside the real project | Generated fresh `.tsx` (TypeScript) — reasonable choice in isolation, but not matching an existing repo since v0 had none to match |

**Key finding — scope creep survived the precise prompt on v0, not on Antigravity.**
Even with an explicit 4-field spec, v0 kept the profile-picture feature from
round 1. Antigravity's round 2 matched the spec exactly. This is the same
failure pattern flagged as round 1's "AI mistake" in the main write-up —
just showing up one round later, for a different tool, despite an
unambiguous constraint telling it what fields to build.

**Key finding — unverified test claims are a real risk.** v0's "18/18
passing" claim was never checked against an actual test runner, unlike
Antigravity's round 2, where a real terminal run caught a genuine (if
unrelated) failure. This directly validates the rule already added to the
project rules file: don't trust an agent's "tests passed" claim without
seeing the runner output yourself.

## Overall takeaway

Precise prompting narrowed scope creep in both tools, but didn't eliminate
it in v0 — a spec constrains what an agent *adds new*, but doesn't
reliably make it *drop* something it already introduced in an earlier
round of context. That's a good reason to always start round 2 in a fresh
session with no carried-over scaffolding, exactly as the drill instructed.
