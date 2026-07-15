# Workflow Comparison: Vague vs. Spec'd Prompting

## Setup
Feature: user settings form. Tool: Antigravity (Copilot). Stack: Next.js.
Branches: `round1-vague` vs `round2-precise`, each built in a fresh session
from `main` with no shared context.

## Round 1 (vague prompt)
Prompt was one sentence: "Build a settings form for the user." The agent
built far more than asked: a multi-section settings page (Profile, Account,
Notifications, Appearance) with avatar upload, password change, 2FA toggle,
font-size and language controls, persisted to `localStorage`. Labels are
wired correctly via `htmlFor`. Took 10+ min end-to-end, zero manual fixes
(accepted as-is, by design).

## Round 2 (spec'd + verified)
Prompt specified exact fields, `react-hook-form` + `zod`, a11y
requirements, and a test-writing verification step, run in plan mode. The
agent produced a scoped `components/SettingsForm.jsx` with a zod schema,
per-field `aria-invalid`/`aria-describedby` wiring, a disabled-while-invalid
submit button, and `__tests__/SettingsForm.test.jsx` covering all six
behaviors requested. Took 20-40 minutes end-to-end, including one fix
round — not a code bug, but a Windows sandbox ACL issue blocking the first
test run.

## Diffs that mattered

- **Correctness:** Round 1 has no validation of any kind — I checked every
  field in the diff and found no `required`, no format checks, no error
  states. Save writes straight to `localStorage` unconditionally, even for
  the password-change fields, which is the one place validation actually
  matters. Round 2's zod schema rejects invalid email/short names, verified
  by two passing tests (`SettingsForm.test.jsx`).
- **Accessibility:** Round 1's labels are correctly wired (`htmlFor`), but
  there is no `aria-invalid` or `aria-describedby` anywhere in the file —
  there are no error states to describe. Round 2 wires both on every field,
  tied to a `role="alert"` error message.
- **Edge cases:** Round 1 accepts empty, whitespace-only, or malformed
  input in every field with no feedback. Round 2 has explicit tests for
  min-length name rejection and invalid-email rejection without clearing
  other field values.
- **Review effort / time:** Round 1: ~10 min generation, 0 min fixing
  (untouched by design). Round 2: ~15 min prompting/plan review + ~10-15
  min fixing (mostly a sandbox ACL issue, not a code bug), ~25-30 min
  total.

## The AI mistake I caught
Round 1 silently expanded scope well beyond the one-sentence prompt —
adding password-change fields, avatar upload, and a 2FA toggle that were
never requested — while skipping the one thing that mattered most:
validation. Shipping unrequested, security-sensitive fields (password
change) with zero validation is a worse failure than simply doing less.
Separately, round 2's first test run failed for an unrelated reason (a
Windows sandbox ACL permissions issue in the test runner), which was a
useful reminder that "tests passed" claims from an agent still need to be
checked against the actual environment, not just trusted.

## Takeaway
Round 2 felt 2-3x slower, but most of round 1's "speed" was hidden debt —
no validation, no tests, unrequested scope — that would surface in review
before shipping. Counting that hidden cost, round 1 isn't actually faster
to a shippable state; it just defers the cost to review time not yet spent.
