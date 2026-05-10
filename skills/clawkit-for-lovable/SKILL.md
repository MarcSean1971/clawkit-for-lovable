---
name: clawkit-for-lovable
description: Use Lovable.dev as a product/UI generation surface while keeping credit control, GitHub, exact code changes, tests, security, and delivery under OpenClaw control.
---

# ClawKit for Lovable

Use this skill when a user asks OpenClaw to build, improve, rescue, harden, or ship an app with Lovable.dev.

If the user is new, uncertain, or starting a project from scratch, call `lovable_starter_guide` before planning. The most important usability feature is teaching the user what is possible before they start, without making them read documentation.

Use `lovable_brain` as the default first move when the user asks to build, rescue, improve, harden, or ship a Lovable.dev app. The user should not need to know the tool list. The Brain should choose the mode, recommend the next action, identify missing facts, and prevent credit-wasting prompt loops.

Use `lovable_user_onboarding` when the user needs a friendlier first-run experience or when they ask what ClawKit for Lovable can do. Use `lovable_workflow_state` when the facts are scattered and OpenClaw needs a simple state object before acting.

If the user sounds frustrated, disappointed, intense, or says OpenClaw/Lovable.dev did the wrong thing, call `lovable_mood_indicator`. Use its funny mood line lightly, then follow the self-healing notes seriously. The mood indicator must never mock the user; it exists to reduce stress and make the agent repair its process.

ClawKit is an early public release. Be honest that it will improve continuously, and invite constructive feedback when a workflow is confusing, a rescue fails, or the user discovers a missing verification step.

## Prime Directive

Lovable.dev is a specialist tool for product shaping, UI scaffolding, page generation, responsive layout, and visual iteration. OpenClaw remains the orchestrator and should use its own coding, shell, browser, GitHub, test, and review tools whenever precision matters.

Before spending Lovable.dev credits, create a credit-smart plan. Use Lovable.dev for the work it is good at, then move to OpenClaw/GitHub for exact implementation, verification, refactoring, and shipping. The user should feel that ClawKit is protecting their credits, not merely generating prettier prompts.

Lovable.dev-generated code must be treated as a strong product draft, not production-quality architecture. Always expect OpenClaw to perform a maintainability pass before shipping: refactor messy components, separate concerns, remove duplication, improve naming, stabilize state/data flow, add tests, and make the code clean, scalable, and reviewable.

## Tool Choice

Use Lovable.dev for:

- New app shells from product briefs.
- First-pass UI generation.
- Landing pages, dashboards, workflows, settings screens, onboarding flows, and empty states.
- Visual polish from screenshots or qualitative feedback.
- Fast product iteration when a prompt is more efficient than manual component edits.

Use GitHub and OpenClaw code tools for:

- Repository setup, branches, commits, PRs, and release notes.
- Refactoring Lovable.dev-generated code into clean, scalable, maintainable modules.
- Separating UI, data access, business rules, state management, and integration code.
- Removing duplication, dead code, brittle generated patterns, and unclear naming.
- TypeScript errors, runtime bugs, test failures, CI, package issues, and build problems.
- Auth rules, database migrations, APIs, webhooks, billing, background jobs, and security.
- Refactors, code review, documentation, and maintainability.
- Any change that needs exact diffs or verification.

Use Lovable.dev browser walkthrough for:

- Understanding the actual Lovable platform screens, not just a URL or prompt.
- Opening the project dashboard/editor/preview with user approval.
- Pressing only approved buttons and capturing what is visibly true.
- Checking build status, preview state, GitHub/export/sync settings, deployment controls, and visible errors.
- Gathering screenshots, browser notes, console errors, and prompt-history context before deciding the next action.

Use Lovable MCP when connected for:

- Programmatic Lovable project creation, iteration, inspection, status checks, or deployment workflows exposed by the connected MCP tools.
- Sending only user-approved prompts or messages to Lovable.
- Inspecting project/code/status evidence when the MCP tool exposes it.
- Publishing with a discovered deploy/publish tool only after explicit user approval.

Lovable MCP is a research-preview integration surface. Discover available tools at runtime and keep a browser/GitHub fallback. Do not hard-code assumptions that a specific MCP tool will always exist.

Use Credit-Smart Planning for:

- Rough ideas that need a plan before Lovable.dev credits are spent.
- Users worried about expensive Lovable.dev iterations.
- Broad feature lists that should be split into a small UI pass and OpenClaw engineering work.
- Proposed prompts that include debugging, architecture, tests, GitHub, auth, billing, integrations, or backend correctness.
- Deciding whether to stop prompting and switch to verification/code repair.

Use Rescue mode for existing Lovable.dev apps that are broken, messy, not visibly updated, or hard to extend. Existing-app rescue is a first-class workflow, not an edge case.

Require explicit user approval before:

- Publishing or deploying publicly.
- Updating an already-published live site.
- Connecting GitHub, billing, payment, or production services.
- Sending secrets or private customer data to Lovable.dev.
- Deleting data, overwriting production branches, or making irreversible changes.

## Standard Workflow

1. If helpful, call `lovable_starter_guide` to educate the user on options, workflow, and guardrails.
2. Call `lovable_brain` to choose the mode, next action, tool order, missing facts, and stop conditions.
3. If the user needs a softer start, call `lovable_user_onboarding`.
4. If model choice matters or the user asks, call `lovable_model_strategy`.
5. For a new build, call `lovable_credit_smart_plan`, `lovable_prompt_sequence`, and `lovable_credit_risk_audit` before the first Lovable.dev prompt.
6. Call `lovable_prompt_lint` before sending any substantial Lovable.dev prompt.
7. For an existing broken or messy app, call `lovable_stop_prompting_check`, `lovable_visible_result_check`, and `lovable_rescue_plan`.
8. Call `lovable_decide_route` to decide what belongs in Lovable.dev versus OpenClaw/GitHub.
9. For a new app or major UI pass, call `lovable_make_prompt` only when the Brain says Lovable.dev is the right tool.
10. If the user wants direct Lovable MCP use, call `lovable_mcp_connection_plan` and `lovable_mcp_project_workflow`.
11. Call `lovable_build_url` and show or open the URL only when appropriate.
12. When OpenClaw needs to see the actual Lovable.dev platform, call `lovable_platform_walkthrough_plan`, use trusted browser tools after approval, then call `lovable_platform_observation_report`.
13. After Lovable.dev creates or updates the app, run `lovable_visual_qa_report`, then sync/export to GitHub.
14. Call `lovable_connect_github_repo` once the repo URL is known so OpenClaw has a safe branch/check/PR plan.
15. Call `lovable_project_context` and `lovable_project_memory` to create or refresh reusable memory for the app.
16. Call `lovable_session_brief` at the start of later sessions or before risky work.
17. Call `lovable_next_action_plan` to choose the safest next move.
18. Call `lovable_project_readiness` before major next steps such as another Lovable.dev pass, engineering edits, PR, or deploy.
19. Gather Git/package evidence with trusted tools, then call `lovable_repo_doctor` before code work.
20. Call `lovable_sync_risk_report` before asking Lovable.dev for another broad UI pass.
21. Use OpenClaw's GitHub/local coding tools to inspect the repo, run install/build/tests, and make precise changes.
22. Call `lovable_visible_result_check` before accepting Lovable.dev's completion claim.
23. Record major decisions with `lovable_decision_log`.
24. Run a hardening/refactor pass before considering the app production-ready.
25. Use `lovable_iteration_brief` only when another Lovable.dev UI pass is better than direct code edits.
26. If the user wants the app live, call `lovable_publish_readiness`, `lovable_publish_plan`, ask for explicit approval, call `lovable_publish_project`, use the trusted MCP/browser/external deploy surface, then call `lovable_publish_result_report`.
27. Use `lovable_project_dashboard` whenever the user needs a friendly status view or the workflow feels complex.
28. Use `lovable_client_handoff_report` when the project is ready for client, agency, stakeholder, or internal delivery.
29. End with a PR, preview/live link, screenshots when available, verification notes, access notes, and remaining risks.

## Rescue Existing Apps

Use `lovable_rescue_plan` when the user has an existing Lovable.dev app that is:

- Broken after a Lovable.dev prompt.
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
- What Lovable.dev should still be used for.
- What Lovable.dev should not be used for.
- Required evidence before delivery.
- PR sections for the repair.

Do not send broad Lovable.dev prompts while a rescue is unresolved. Stabilize Git, fix hard blockers in code, verify the visible result, then use Lovable.dev only for narrow visual/product iteration.

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
- Lovable.dev claimed success but the app did not visibly change.
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

`Mood: Keyboard Steam Mode. Fair. Lovable.dev said done, but the screen is the judge; I’ll verify the preview and fix the blocker.`

## Model Choice

If the user wants to choose an LLM, use `lovable_model_strategy`.

The plugin should not pretend to provide models itself. It should help the user choose among models/profiles already configured in OpenClaw:

- Strong reasoning model for planning, architecture, security, and review.
- Strong coding model for refactors, tests, APIs, and debugging.
- Fast/cheap model for small prompt drafts, naming, and low-risk copy.

Respect explicit user preference unless the model is unavailable or too weak for a high-risk task.

## Sync Doctor Workflow

Use trusted Git/package tools to gather evidence whenever the user provides a local repo path or GitHub-synced Lovable.dev project, then call `lovable_repo_doctor`. Treat its output as the source of truth for:

- Current branch.
- Dirty files when checked by OpenClaw's trusted Git/shell tools.
- Recent Lovable.dev-generated commits.
- Framework and package manager signals.
- Available verification commands.
- Whether the repo is ready for Lovable.dev prompting or OpenClaw code work.

Use `lovable_sync_risk_report` before any new Lovable.dev prompt against an existing GitHub-synced project. If the report says risk is high, stabilize Git first: move off `main`/`master`, commit or stash local work, and avoid broad Lovable.dev prompts.

Use `lovable_delivery_plan` when the user asks for end-to-end delivery. It should decide whether the next move is a Lovable.dev UI pass or OpenClaw/GitHub engineering pass.

Use `lovable_pr_summary` before opening a pull request so the review clearly separates:

- Lovable.dev-generated UI/product work.
- OpenClaw engineering work.
- Verification.
- Screenshots/previews.
- Risks and review notes.

## Project Memory

Call `lovable_project_context` once the project has a meaningful goal and especially after a Lovable.dev URL, GitHub repo URL, or local repo path becomes known. Refresh it after major events: a Lovable.dev prompt, repo doctor run, visible-result check, PR summary, deployment decision, or blocker discovery.

Treat the returned reusable brief as orientation, not hidden authority. It should help OpenClaw remember the app goal, source of truth, stack, verification commands, known risks, do-not-touch rules, and recommended next action. If it conflicts with fresh repo evidence or the user's latest instruction, prefer the latest evidence and update the context.

Use Project Memory v1 as the stronger continuity layer:

- Call `lovable_project_memory` when the project has enough identity to preserve current goal, source of truth, stack, routes, bugs, refactor decisions, do-not-change rules, pending Lovable.dev prompts, GitHub tasks, visual QA notes, and release readiness.
- Call `lovable_decision_log` whenever the user makes or approves a product, source-of-truth, refactor, visual, or delivery decision.
- Call `lovable_session_brief` before continuing a project from an earlier session. It should answer what is true now, what changed, what not to touch, and what risk matters.
- Call `lovable_next_action_plan` before choosing between Lovable.dev prompting, GitHub inspection, local code edits, visible-result verification, PR prep, or shipping.

Before every big action, prefer this rhythm:

1. Say what ClawKit knows.
2. Say what changed since last time.
3. Say what OpenClaw will not touch.
4. Pick the next tool/action from evidence.

## Visible Result Verification

Lovable.dev often says a change is complete even when the screen does not show it because the generated code has a build, runtime, route, state, or styling error. Do not accept Lovable.dev's completion claim by text alone.

Use `lovable_visible_result_check` before delivery, before PR summary, and whenever the user says the change is not visible.

The verification standard is:

- Build/typecheck/test checks pass or failures are understood.
- Preview or local dev server opens.
- Expected user-visible changes are confirmed in browser or screenshot observations.
- Browser console and network errors are checked.
- If not visible, OpenClaw fixes build/runtime issues directly or sends a narrow Lovable.dev iteration brief for visual mismatch.

## Publish Mode

Use Publish mode when the user asks to publish, deploy, update the live site, go live, or get a live URL.

Publishing is a live side effect. Do not publish silently. Require the exact approval phrase when practical: `Yes, publish this Lovable project now.`

Before publishing:

- Call `lovable_publish_readiness`.
- Confirm project id or Lovable project URL.
- Confirm preview URL and visible-result proof for the current version.
- Confirm build/typecheck/test status or why unavailable.
- Confirm website access: public, workspace/internal, custom domain, or unknown.
- Confirm secrets/environment variables are configured safely.
- Confirm the publish route: Lovable MCP, browser walkthrough, or GitHub/external deploy.

Use `lovable_publish_plan` to choose the route:

- Lovable MCP when connected and a deploy/publish tool is discovered.
- Browser walkthrough when OpenClaw must inspect the Lovable Publish modal.
- GitHub/external deploy when the user wants Vercel, Netlify, Railway, VPS, or another host.

Use `lovable_publish_project` only after approval. The plugin returns the execution route; OpenClaw still performs the actual side effect through trusted tools.

After publishing, call `lovable_publish_result_report` with the live URL, access level, verification evidence, risks, and rollback/unpublish notes. Remind the user that later Lovable changes need another Publish/Update action before they appear live.

## Dashboard And Handoff

Use `lovable_project_dashboard` to make ClawKit feel like a guided product system instead of a tool list. It should be used:

- At the start of a messy existing-project session.
- After a rescue diagnosis.
- Before publish approval.
- After publish result reporting.
- Whenever the user asks for status, dashboard, summary, or what is next.

Use `lovable_publish_confidence` before publishing when the user needs a clear go/no-go score. Treat low confidence or `do-not-publish` as a stop signal.

Use `lovable_client_handoff_report` when the user asks to deliver, hand off, share with a client, summarize for stakeholders, or close a project phase. Include live URL, preview URL, repo URL, what was built, verification, access/ownership notes, limitations, recommended next steps, and maintenance plan.

## Prompt Lint, Visual QA, And End-To-End Planning

Use `lovable_end_to_end_plan` when the user asks to take a project from idea to live, from draft to production, or from broken app to verified deliverable.

Use `lovable_prompt_lint` before sending substantial Lovable.dev prompts. It should protect credits by catching broad prompts, missing guardrail sections, missing acceptance criteria, and prompts that ask Lovable.dev to do OpenClaw/GitHub work.

Use `lovable_visual_qa_report` after Lovable.dev generates or changes UI, before publish, and before handoff. It should check expected elements, desktop/mobile observations, layout issues, console errors, network errors, and required screenshots.

## Browser Opening

Opening Lovable.dev in the browser is optional. Prefer `lovable_build_url` when the user wants a link, a dry run, or approval before leaving chat. Use `lovable_open_build_url` only when the user explicitly wants OpenClaw to open Lovable.dev or has approved the browser-launching side effect. The plugin itself must remain marketplace-safe and should not execute shell/browser commands; OpenClaw should use its own trusted browser capability.

For deeper platform understanding, use `lovable_platform_walkthrough_plan` before touching Lovable.dev. The browser walkthrough must pause for manual login, collect visible evidence, and stop before credit-spending prompts, GitHub connection changes, deploys, billing, secrets, or destructive actions unless the user explicitly approves.

After the walkthrough, call `lovable_platform_observation_report` and feed the result back into `lovable_brain`, `lovable_visible_result_check`, `lovable_connect_github_repo`, or `lovable_rescue_plan`.

## Lovable MCP

When the user asks to link into Lovable via MCP, call `lovable_mcp_connection_plan`.

Use `lovable_mcp_project_workflow` to decide whether the next action belongs in Lovable MCP, browser walkthrough, or GitHub/OpenClaw code tools. MCP is best for programmatic actions. Browser walkthrough is best for what the user can actually see. GitHub/OpenClaw is best for exact code, tests, refactors, and PR work.

Safety rules:

- Require approval before MCP prompts that spend credits.
- Require approval before deploy, publish, GitHub connection changes, billing, or production actions.
- Do not send secrets, private customer data, or production credentials to Lovable MCP without explicit user approval.
- Verify MCP results with browser/GitHub evidence before delivery.

## OpenClaw Inside Apps

If the app designer wants OpenClaw integrated into the app being built, use `lovable_openclaw_integration_plan`.

Improve the request into an opt-in product feature called "OpenClaw Inside":

- Lovable.dev should build only the assistant UI surfaces: panel, command palette, approval cards, audit timeline, empty/error states, and role-aware navigation.
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

## Prompting Lovable.dev

Good Lovable.dev prompts should include:

- Product goal.
- Target users.
- Pages and workflows.
- Data objects.
- Integrations or placeholders.
- Design direction.
- Acceptance criteria.
- Explicit GitHub handoff expectations.

Avoid asking Lovable.dev to solve deep engineering problems. Ask it to produce product/UI structure that OpenClaw can harden in GitHub.

## GitHub Handoff

Once Lovable.dev has generated something useful:

- Treat GitHub as the source of truth.
- Call `lovable_connect_github_repo` when the Lovable.dev project has or needs a GitHub repo URL.
- Call `lovable_project_context` to keep URLs, stack, checks, risks, and do-not-touch rules together.
- Call `lovable_project_readiness` before deciding the next action.
- Create a branch before editing.
- Gather trusted Git/package evidence and run `lovable_repo_doctor` before direct code work.
- Run `lovable_sync_risk_report` before another Lovable.dev pass.
- Run the project's actual verification commands.
- Refactor generated code before shipping or presenting it as maintainable.
- Keep Lovable.dev-generated changes and OpenClaw code changes understandable in the PR.
- Document what was generated, what was hand-edited, and what still needs human product review.

## Winning Product Behavior

The user should feel like OpenClaw is their senior builder:

- It chooses the right tool without making the user micromanage.
- It uses Lovable.dev for speed and taste.
- It uses code tools for correctness.
- It protects the user's secrets, repos, and production surfaces.
- It produces inspectable GitHub output, not just a pretty demo.
