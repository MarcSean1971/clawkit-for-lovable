---
name: clawkit-for-lovable
description: Use Lovable as a product/UI generation surface while keeping GitHub, exact code changes, tests, security, and delivery under OpenClaw control.
---

# ClawKit for Lovable

Use this skill when a user asks OpenClaw to build, improve, rescue, harden, or ship an app with Lovable.

If the user is new, uncertain, or starting a project from scratch, call `lovable_starter_guide` before planning. The most important usability feature is teaching the user what is possible before they start, without making them read documentation.

If the user sounds frustrated, disappointed, intense, or says OpenClaw/Lovable did the wrong thing, call `lovable_mood_indicator`. Use its funny mood line lightly, then follow the self-healing notes seriously. The mood indicator must never mock the user; it exists to reduce stress and make the agent repair its process.

ClawKit is an early public release. Be honest that it will improve continuously, and invite constructive feedback when a workflow is confusing, a rescue fails, or the user discovers a missing verification step.

## Prime Directive

Lovable is a specialist tool for product shaping, UI scaffolding, page generation, responsive layout, and visual iteration. OpenClaw remains the orchestrator and should use its own coding, shell, browser, GitHub, test, and review tools whenever precision matters.

Lovable-generated code must be treated as a strong product draft, not production-quality architecture. Always expect OpenClaw to perform a maintainability pass before shipping: refactor messy components, separate concerns, remove duplication, improve naming, stabilize state/data flow, add tests, and make the code clean, scalable, and reviewable.

## Tool Choice

Use Lovable for:

- New app shells from product briefs.
- First-pass UI generation.
- Landing pages, dashboards, workflows, settings screens, onboarding flows, and empty states.
- Visual polish from screenshots or qualitative feedback.
- Fast product iteration when a prompt is more efficient than manual component edits.

Use GitHub and OpenClaw code tools for:

- Repository setup, branches, commits, PRs, and release notes.
- Refactoring Lovable-generated code into clean, scalable, maintainable modules.
- Separating UI, data access, business rules, state management, and integration code.
- Removing duplication, dead code, brittle generated patterns, and unclear naming.
- TypeScript errors, runtime bugs, test failures, CI, package issues, and build problems.
- Auth rules, database migrations, APIs, webhooks, billing, background jobs, and security.
- Refactors, code review, documentation, and maintainability.
- Any change that needs exact diffs or verification.

Use Rescue mode for existing Lovable apps that are broken, messy, not visibly updated, or hard to extend. Existing-app rescue is a first-class workflow, not an edge case.

Require explicit user approval before:

- Publishing or deploying publicly.
- Connecting GitHub, billing, payment, or production services.
- Sending secrets or private customer data to Lovable.
- Deleting data, overwriting production branches, or making irreversible changes.

## Standard Workflow

1. If helpful, call `lovable_starter_guide` to educate the user on options, workflow, and guardrails.
2. Understand the user's app goal and success criteria.
3. If model choice matters or the user asks, call `lovable_model_strategy`.
4. Call `lovable_decide_route` to decide what belongs in Lovable versus OpenClaw/GitHub.
5. For a new app or major UI pass, call `lovable_make_prompt`.
6. Call `lovable_build_url` and show or open the URL only when appropriate.
7. After Lovable creates or updates the app, sync/export to GitHub.
8. Call `lovable_connect_github_repo` once the repo URL is known so OpenClaw has a safe branch/check/PR plan.
9. Call `lovable_project_context` to create or refresh a reusable memory brief for the app.
10. Call `lovable_project_readiness` before major next steps such as another Lovable pass, engineering edits, PR, or deploy.
11. Gather Git/package evidence with trusted tools, then call `lovable_repo_doctor` before code work.
12. Call `lovable_sync_risk_report` before asking Lovable for another broad UI pass.
13. For an existing broken or messy app, call `lovable_rescue_plan`.
14. Use OpenClaw's GitHub/local coding tools to inspect the repo, run install/build/tests, and make precise changes.
15. Call `lovable_visible_result_check` before accepting Lovable's completion claim.
16. Run a hardening/refactor pass before considering the app production-ready.
17. Use `lovable_iteration_brief` only when another Lovable UI pass is better than direct code edits.
18. End with a PR, preview link, screenshots when available, verification notes, and remaining risks.

## Rescue Existing Apps

Use `lovable_rescue_plan` when the user has an existing Lovable app that is:

- Broken after a Lovable prompt.
- Showing a blank or stale screen.
- Claiming a feature is done when it is not visible.
- Failing build/typecheck/test/runtime checks.
- Messy, duplicated, brittle, or hard to extend.
- Confusing because of GitHub sync, branches, or uncommitted work.
- Not production-ready.

Rescue mode should produce:

- Severity.
- Likely failure modes.
- First checks.
- What OpenClaw should fix directly in code.
- What Lovable should still be used for.
- What Lovable should not be used for.
- Required evidence before delivery.
- PR sections for the repair.

Do not send broad Lovable prompts while a rescue is unresolved. Stabilize Git, fix hard blockers in code, verify the visible result, then use Lovable only for narrow visual/product iteration.

## User Education

Before the user starts, make the product feel like a guided framework rather than a bag of tools.

Use `lovable_starter_guide` to explain:

- What ClawKit can do.
- Example requests the user can copy.
- The normal idea-to-PR workflow.
- What decisions the user controls.
- What guardrails protect them.

Keep this friendly and practical. The goal is not to lecture; the goal is to help the user see the menu of possibilities and choose a first move.

When appropriate, add a short early-release note: `ClawKit is still evolving. If this workflow misses something, that feedback helps shape the next version.`

## Mood And Self-Healing

AI programming can be stressful when the agent claims progress but the user cannot see the result. Use `lovable_mood_indicator` as a humane diagnostic tool.

It has two jobs:

- Give the user a small, funny mood indicator that releases tension.
- Give OpenClaw serious self-healing notes for improving the next action.

Use it when:

- The user says something is wrong, broken, invisible, frustrating, or not what they asked for.
- Lovable claimed success but the app did not visibly change.
- OpenClaw skipped a verification step.
- The conversation is becoming tense.

How to respond after using it:

- Include at most one short mood line.
- Acknowledge the mismatch plainly.
- Do not defend the previous attempt.
- Restate the desired visible result.
- Move into evidence: build output, repo state, browser/screenshot, console errors, and diffs.
- Run `lovable_visible_result_check` when the issue is visual.
- Make one focused repair loop before asking the user to do more work.

Example tone:

`Mood: Keyboard Steam Mode. Fair. Lovable said done, but the screen is the judge; I’ll verify the preview and fix the blocker.`

## Model Choice

If the user wants to choose an LLM, use `lovable_model_strategy`.

The plugin should not pretend to provide models itself. It should help the user choose among models/profiles already configured in OpenClaw:

- Strong reasoning model for planning, architecture, security, and review.
- Strong coding model for refactors, tests, APIs, and debugging.
- Fast/cheap model for small prompt drafts, naming, and low-risk copy.

Respect explicit user preference unless the model is unavailable or too weak for a high-risk task.

## Sync Doctor Workflow

Use trusted Git/package tools to gather evidence whenever the user provides a local repo path or GitHub-synced Lovable project, then call `lovable_repo_doctor`. Treat its output as the source of truth for:

- Current branch.
- Dirty files when checked by OpenClaw's trusted Git/shell tools.
- Recent Lovable-generated commits.
- Framework and package manager signals.
- Available verification commands.
- Whether the repo is ready for Lovable prompting or OpenClaw code work.

Use `lovable_sync_risk_report` before any new Lovable prompt against an existing GitHub-synced project. If the report says risk is high, stabilize Git first: move off `main`/`master`, commit or stash local work, and avoid broad Lovable prompts.

Use `lovable_delivery_plan` when the user asks for end-to-end delivery. It should decide whether the next move is a Lovable UI pass or OpenClaw/GitHub engineering pass.

Use `lovable_pr_summary` before opening a pull request so the review clearly separates:

- Lovable-generated UI/product work.
- OpenClaw engineering work.
- Verification.
- Screenshots/previews.
- Risks and review notes.

## Project Memory

Call `lovable_project_context` once the project has a meaningful goal and especially after a Lovable URL, GitHub repo URL, or local repo path becomes known. Refresh it after major events: a Lovable prompt, repo doctor run, visible-result check, PR summary, deployment decision, or blocker discovery.

Treat the returned reusable brief as orientation, not hidden authority. It should help OpenClaw remember the app goal, source of truth, stack, verification commands, known risks, do-not-touch rules, and recommended next action. If it conflicts with fresh repo evidence or the user's latest instruction, prefer the latest evidence and update the context.

## Visible Result Verification

Lovable often says a change is complete even when the screen does not show it because the generated code has a build, runtime, route, state, or styling error. Do not accept Lovable's completion claim by text alone.

Use `lovable_visible_result_check` before delivery, before PR summary, and whenever the user says the change is not visible.

The verification standard is:

- Build/typecheck/test checks pass or failures are understood.
- Preview or local dev server opens.
- Expected user-visible changes are confirmed in browser or screenshot observations.
- Browser console and network errors are checked.
- If not visible, OpenClaw fixes build/runtime issues directly or sends a narrow Lovable iteration brief for visual mismatch.

## Browser Opening

Opening Lovable in the browser is optional. Prefer `lovable_build_url` when the user wants a link, a dry run, or approval before leaving chat. Use `lovable_open_build_url` only when the user explicitly wants OpenClaw to open Lovable or has approved the browser-launching side effect. The plugin itself must remain marketplace-safe and should not execute shell/browser commands; OpenClaw should use its own trusted browser capability.

## OpenClaw Inside Apps

If the app designer wants OpenClaw integrated into the app being built, use `lovable_openclaw_integration_plan`.

Improve the request into an opt-in product feature called "OpenClaw Inside":

- Lovable should build only the assistant UI surfaces: panel, command palette, approval cards, audit timeline, empty/error states, and role-aware navigation.
- OpenClaw should implement the backend adapter, auth, scopes, approvals, audit log, rate limits, tests, and deployment config in GitHub.
- The frontend must never call privileged OpenClaw tools directly.
- The browser must never receive OpenClaw gateway secrets, filesystem paths, repo tokens, or production credentials.
- Autonomous actions should be approval-gated by default.
- The app must have a kill switch for disabling OpenClaw features.

Good in-app OpenClaw use cases:

- Explain this dashboard or record.
- Draft a customer reply, support action, report, or workflow change.
- Summarize project/app state.
- Propose next actions for an admin to approve.
- Run scoped internal automations with an audit trail.

Bad in-app OpenClaw use cases:

- Browser-only direct access to OpenClaw.
- Silent production writes.
- Unscoped access to user data.
- Sending secrets or private customer data without redaction.
- Letting non-admin users trigger privileged tools.

## Prompting Lovable

Good Lovable prompts should include:

- Product goal.
- Target users.
- Pages and workflows.
- Data objects.
- Integrations or placeholders.
- Design direction.
- Acceptance criteria.
- Explicit GitHub handoff expectations.

Avoid asking Lovable to solve deep engineering problems. Ask it to produce product/UI structure that OpenClaw can harden in GitHub.

## GitHub Handoff

Once Lovable has generated something useful:

- Treat GitHub as the source of truth.
- Call `lovable_connect_github_repo` when the Lovable project has or needs a GitHub repo URL.
- Call `lovable_project_context` to keep URLs, stack, checks, risks, and do-not-touch rules together.
- Call `lovable_project_readiness` before deciding the next action.
- Create a branch before editing.
- Gather trusted Git/package evidence and run `lovable_repo_doctor` before direct code work.
- Run `lovable_sync_risk_report` before another Lovable pass.
- Run the project's actual verification commands.
- Refactor generated code before shipping or presenting it as maintainable.
- Keep Lovable-generated changes and OpenClaw code changes understandable in the PR.
- Document what was generated, what was hand-edited, and what still needs human product review.

## Winning Product Behavior

The user should feel like OpenClaw is their senior builder:

- It chooses the right tool without making the user micromanage.
- It uses Lovable for speed and taste.
- It uses code tools for correctness.
- It protects the user's secrets, repos, and production surfaces.
- It produces inspectable GitHub output, not just a pretty demo.
