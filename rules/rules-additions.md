---
trigger: always_on
---

Project rules (learned from settings-form workflow drill)


Forms use react-hook-form + zod for validation; never raw
useState-only input handling. The vague-prompt round shipped a full
settings page — including password-change fields — with zero validation
of any kind, including on the fields where it mattered most.
Every form field gets aria-invalid and aria-describedby wired to a
role="alert" error message when invalid. The vague-prompt round had
correctly wired <label htmlFor> elements but no error-state a11y
wiring at all, because it had no error states.
New form/interactive components ship with tests (Vitest + React Testing
Library) covering: one valid submit, one validation failure per required
field, and one edge case (empty/whitespace/malformed input) — written
and passing before the component is considered done, not added later.
Stay in scope: build only the fields/behavior explicitly requested.
Do not add adjacent features (e.g. avatar upload, 2FA, password change)
unless asked — unrequested scope is extra surface area that ships
without the validation or review the requested scope got.
Don't trust an agent's "tests passed" claim without seeing the actual
runner output — a first test run failed for an unrelated Windows sandbox
ACL issue, not a code bug, and would have been missed without checking
the terminal output directly.