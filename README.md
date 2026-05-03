# ClawKit for Lovable

ClawKit for Lovable is an independent OpenClaw plugin that turns Lovable into one specialized tool inside a full-stack autonomous development workflow.

ClawKit is independent and is not affiliated with or endorsed by Lovable.dev.

## Early Public Release

ClawKit for Lovable is an early public release. It is useful now for building, rescuing, verifying, refactoring, and shipping Lovable.dev projects with OpenClaw, and it will be updated continuously.

Constructive feedback is very welcome, especially:

- Lovable apps ClawKit failed to rescue.
- Workflows that felt confusing.
- Missing verification checks.
- Places where OpenClaw should use Lovable versus code tools differently.
- Ideas for better agency/client delivery reports.

Open an issue or discussion on GitHub:

https://github.com/MarcSean1971/clawkit-for-lovable/issues

Lovable is excellent for UI scaffolding, visual iteration, product flow, and fast app generation. OpenClaw is better at exact code, GitHub, tests, CI, debugging, integrations, security, and shipping discipline. This plugin gives OpenClaw tools and a bundled skill for choosing the right surface at the right time.

The plugin assumes Lovable output is a product draft, not finished architecture. OpenClaw should refactor, harden, test, and review the generated code before the app is treated as production-ready.

## Product Promise

> Build with Lovable's speed, then finish with OpenClaw's engineering discipline.

> Lovable got you 80% there. ClawKit helps rescue the last 20%.

Users can ask:

> Build a polished SaaS onboarding app. Use Lovable for the UI, export it to GitHub, then implement auth checks, tests, and a PR yourself.

OpenClaw can then:

- Show users what is possible before they start.
- Help users choose a suitable configured OpenClaw model/profile.
- Turn rough app ideas into strong Lovable prompts.
- Diagnose and rescue existing Lovable apps that are broken, messy, invisible, or hard to extend.
- Launch Lovable's Build-with-URL flow.
- Connect a Lovable project to its GitHub repository workflow.
- Check whether the project is ready for Lovable UI work, OpenClaw engineering, PR, or deploy steps.
- Route UI/product work to Lovable.
- Verify that Lovable's promised changes actually appear on screen.
- Route exact engineering work to GitHub and local code tools.
- Keep a reusable project memory brief with URLs, repo state, stack, risks, and do-not-touch rules.
- Maintain a decision log and session brief so each new run starts from the latest agreed source of truth.
- Produce a handoff checklist for PR-quality delivery.
- Generate follow-up Lovable prompts from repo, test, or screenshot findings.

## Tools

| Tool | Purpose |
| --- | --- |
| `lovable_decide_route` | Decides which work belongs in Lovable, GitHub, or OpenClaw code tools. |
| `lovable_make_prompt` | Converts rough product ideas into Lovable-ready build prompts. |
| `lovable_build_url` | Creates a Lovable autosubmit Build-with-URL link. |
| `lovable_open_build_url` | Prepares a Lovable URL for OpenClaw's trusted browser tool to open after approval. |
| `lovable_github_handoff` | Creates the checklist for moving from Lovable output to GitHub/code work. |
| `lovable_connect_github_repo` | Plans the safe connection from Lovable project to GitHub repo, branch, checks, and PR workflow. |
| `lovable_project_readiness` | Scores whether the project has enough evidence to continue safely. |
| `lovable_project_context` | Creates a reusable project memory brief so OpenClaw can keep Lovable, GitHub, stack, verification, risk, and next-step context together. |
| `lovable_project_memory` | Creates durable project memory with source of truth, routes, bugs, refactor decisions, do-not-change rules, GitHub tasks, and release readiness. |
| `lovable_decision_log` | Records dated product, source-of-truth, refactor, visual QA, and delivery decisions. |
| `lovable_session_brief` | Summarizes what changed, what is true now, what not to touch, risks, and recommended tool order at the start of a session. |
| `lovable_next_action_plan` | Chooses the next safe action: ask the user, prompt Lovable, inspect GitHub, edit code, verify, prepare PR, or ship. |
| `lovable_iteration_brief` | Creates a focused follow-up prompt for Lovable UI iteration. |
| `lovable_repo_doctor` | Reviews caller-supplied Git/package evidence for Git state, framework, scripts, and risks without reading files itself. |
| `lovable_rescue_plan` | Diagnoses and plans repairs for existing Lovable apps. |
| `lovable_sync_risk_report` | Decides whether it is safe to prompt Lovable again without losing or tangling work. |
| `lovable_delivery_plan` | Plans the next best move: Lovable UI pass or OpenClaw engineering pass. |
| `lovable_pr_summary` | Drafts a PR body that separates Lovable-generated and OpenClaw-coded work. |
| `lovable_openclaw_integration_plan` | Plans an optional secure "OpenClaw Inside" feature for the app being built. |
| `lovable_visible_result_check` | Verifies that Lovable's claimed change actually builds and appears on screen. |
| `lovable_model_strategy` | Helps the user choose a configured OpenClaw model/profile for the task. |
| `lovable_starter_guide` | Educates the user before building with examples, workflow, choices, and guardrails. |
| `lovable_mood_indicator` | Adds a playful frustration meter plus serious self-healing notes for the agent. |

## Install For Local Development

```bash
npm install
npm run build
openclaw plugins install -l .
openclaw gateway restart
```

## Install From ClawHub

```bash
openclaw plugins install @clawkit/clawkit-for-lovable
openclaw plugins enable clawkit-for-lovable
openclaw gateway restart
```

## Install From npm

```bash
openclaw plugins install npm:@clawkit/clawkit-for-lovable
openclaw plugins enable clawkit-for-lovable
openclaw gateway restart
```

Browser opening is optional. `lovable_build_url` returns a URL without opening anything. `lovable_open_build_url` prepares the URL for OpenClaw's trusted browser tool; the plugin itself does not execute shell or browser commands.

```json
{
  "tools": {
    "allow": ["clawkit-for-lovable"]
  }
}
```

## Suggested User Flow

1. OpenClaw shows `lovable_starter_guide` when the user needs orientation.
2. User describes the product or existing app problem.
3. OpenClaw optionally calls `lovable_model_strategy`.
4. OpenClaw calls `lovable_decide_route`.
5. OpenClaw calls `lovable_make_prompt`.
6. OpenClaw calls `lovable_build_url` or, with approval, `lovable_open_build_url`.
7. User or OpenClaw monitors the Lovable result.
8. Lovable project is synced/exported to GitHub.
9. OpenClaw calls `lovable_connect_github_repo` with the repo URL and creates/opens a safe branch with trusted GitHub tools.
10. OpenClaw calls `lovable_project_context` and `lovable_project_memory` to create or refresh reusable project memory.
11. OpenClaw calls `lovable_session_brief` at the start of each later session.
12. OpenClaw calls `lovable_next_action_plan` to choose the safest next move.
13. OpenClaw calls `lovable_project_readiness` to check whether enough evidence exists for the next step.
14. OpenClaw gathers Git/package evidence with trusted tools, then runs `lovable_repo_doctor` and `lovable_sync_risk_report`.
15. For existing broken apps, OpenClaw calls `lovable_rescue_plan`.
16. OpenClaw uses GitHub/local tools for code, tests, CI, security, and PR.
17. OpenClaw runs `lovable_visible_result_check` to confirm the change is actually visible.
18. OpenClaw records important choices with `lovable_decision_log`.
19. OpenClaw refactors Lovable-generated code for maintainability before shipping.
20. OpenClaw uses `lovable_iteration_brief` for another UI pass only when useful.
21. OpenClaw uses `lovable_pr_summary` before opening a PR.

## GitHub Connection

ClawKit does not log in to GitHub, clone repositories, or call GitHub APIs itself. It stays marketplace-safe and tells OpenClaw how to use its trusted GitHub/Git tools.

`lovable_connect_github_repo` turns a Lovable project URL, GitHub repo URL, and optional trusted repo evidence into a clear plan:

- confirm the repo belongs to the Lovable project;
- clone or open it with OpenClaw's trusted tools;
- create a safe working branch;
- pull Lovable-synced changes;
- run repo doctor and verification checks;
- decide whether the next action belongs in Lovable or code;
- prepare PR-ready evidence.

`lovable_project_readiness` then acts as a gate before major actions. It checks whether there is a Lovable URL, GitHub repo URL, local repo, clean Git state, safe branch, verification output, visible-result proof, and PR summary.

## Project Memory

`lovable_project_context` gives OpenClaw a reusable brief for each Lovable app. It records the product goal, Lovable URL, GitHub repo URL, local repo path, branch prefix, stack, package manager, verification commands, deployment target, last Lovable prompt, last visible result, repo doctor summary, PR summary, known risks, blockers, and do-not-touch rules.

This is useful because Lovable builds, GitHub sync, local edits, browser verification, and PR work often happen across multiple sessions. The context brief gives OpenClaw a clean source of truth before it chooses whether the next move belongs in Lovable or in code.

Project Memory v1 adds a stronger continuity layer:

- `lovable_project_memory` records the current goal, source of truth, stack, routes, known bugs, refactor decisions, do-not-change rules, pending Lovable prompts, GitHub tasks, visual QA notes, release readiness, and what changed since last session.
- `lovable_decision_log` records what was decided, why, who owns it, whether it is accepted or needs revisiting, and follow-up work.
- `lovable_session_brief` gives OpenClaw a safe opening summary before work begins: current truth, recent changes, do-not-touch rules, risks, and tool order.
- `lovable_next_action_plan` decides whether the next move should be user clarification, Lovable prompting, GitHub inspection, local code work, visible-result verification, PR preparation, or shipping.

The practical promise is: before every big action, OpenClaw can say what it knows, what changed, and what it will not touch.

## Rescue Existing Apps

ClawKit is not only for new builds. It can inspect and fix existing Lovable apps, which is often where users feel the most pain.

Use `lovable_rescue_plan` when:

- The Lovable app builds but the screen is blank.
- Lovable says a feature exists but it is not visible.
- The app has TypeScript, runtime, route, auth, or data-loading errors.
- The generated code is messy, duplicated, brittle, or hard to extend.
- GitHub sync has become confusing.
- The user wants to make a Lovable app production-ready.

Rescue mode tells OpenClaw what to fix directly in code, what to send back to Lovable as a narrow UI prompt, what evidence is needed, and how to prepare the PR.

## Starter Guide

The most important usability feature is education before action. Users should not need to know the tool names.

`lovable_starter_guide` gives them:

- What ClawKit can do.
- Best first choices.
- Copyable example requests.
- A simple idea-to-PR workflow.
- Decisions they control, including model choice and browser opening.
- Guardrails that explain why the workflow is safer than raw Lovable prompting.

This makes the plugin feel like a friendly framework, not a command list.

## Visible Result Verification

Lovable may claim a change is complete while the app screen does not show it because of a programming, routing, state, CSS, or runtime error.

`lovable_visible_result_check` makes completion evidence-based:

- Build/typecheck/test status.
- Preview URL or local dev server.
- Screenshot/browser observations.
- Console errors.
- Expected visible changes.

If the result is not visible, OpenClaw should fix code errors directly or send Lovable a narrow iteration brief.

## Mood Indicator

Programming with AI can feel stressful when the agent misses the point or claims success too early. `lovable_mood_indicator` turns that moment into a repair loop.

It returns:

- A funny mood label.
- A light humor line.
- A user-care note.
- Self-healing notes for OpenClaw.
- Better next-response guidance.
- De-escalation moves.
- Execution rules for the current stage.

The mood indicator must be kind. It should never mock the user. Its real purpose is to make OpenClaw slow down, verify evidence, and repair the mismatch.

## Model Choice

Users can choose the LLM/model profile if their OpenClaw setup has multiple configured models. This plugin does not provide model access itself; it guides selection.

Recommended pattern:

- Strong reasoning model for planning, architecture, security, and review.
- Strong coding model for refactors, tests, APIs, and debugging.
- Fast/cheap model for small prompt drafts and low-risk copy.

## ClawKit Sync Doctor

The Sync Doctor is the core product wedge. It helps users avoid the common Lovable/GitHub failure mode: fast visual iteration mixed with unclear Git state.

It checks:

- Whether the folder is a Git repo.
- Current branch and remote.
- Uncommitted changes when checked by OpenClaw's trusted Git/shell tools.
- Recent Lovable-looking commits.
- Framework and package manager.
- Available verification scripts.
- Whether another Lovable prompt is safe.

Use it after every Lovable-to-GitHub sync and before every new broad Lovable prompt.

## Code Quality Doctrine

Lovable should be used for speed, UI shape, and product imagination. It should not be trusted to produce clean, scalable, maintainable architecture by default.

OpenClaw should own:

- Refactoring generated components.
- Separating UI, state, data access, business rules, and integrations.
- Removing duplication and dead code.
- Improving names, file boundaries, and module structure.
- Adding tests and verification scripts.
- Reviewing auth, data access, secrets, and production risks.

## OpenClaw Inside

Some apps should include OpenClaw as a feature for their own users. This is powerful, but it must be opt-in and designed safely.

Use `lovable_openclaw_integration_plan` to design it.

Recommended pattern:

- Lovable builds the assistant UI only.
- The app backend mediates all OpenClaw access.
- OpenClaw implements scoped backend endpoints, auth, approval gates, audit logs, tests, and deployment controls.
- The browser never receives OpenClaw secrets or broad tool authority.
- Risky actions require human approval.

## Safety Model

The plugin intentionally does not treat Lovable as the source of truth. Lovable is the product/UI accelerator; GitHub is the durable record.

Require user approval before:

- Publishing or deploying.
- Connecting paid services.
- Connecting GitHub on the user's behalf.
- Sending secrets or private production data to Lovable.
- Overwriting production branches or deleting data.

## Package Shape

- `src/index.ts`: OpenClaw plugin entry and registered tools.
- `openclaw.plugin.json`: native OpenClaw manifest.
- `skills/clawkit-for-lovable/SKILL.md`: agent behavior policy.
- `docs/product-strategy.md`: positioning and roadmap.

## Roadmap

- Playwright-backed Lovable session adapter.
- Project URL and screenshot extraction.
- GitHub App/OAuth assisted handoff.
- PR templates with before/after screenshots.
- Policy engine for approval-gated actions.
- Lovable project memory for active builds.
