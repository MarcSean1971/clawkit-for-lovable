# Product Strategy

## Category

ClawKit Studio for Lovable is the OpenClaw control layer for serious Lovable.dev users. It lets Lovable.dev be great at UI generation without forcing Lovable.dev to own every engineering task, every fix, every GitHub workflow, or every production-readiness decision.

ClawKit is an early public release and should be positioned honestly. The product is useful today, but the fastest route to quality is constructive feedback from real rescue, hardening, and shipping workflows.

## Wedge

The first winning use case is:

> Stop wasting Lovable.dev credits. Tell me what should go back to Lovable.dev and what OpenClaw should fix in code.

An equally strong, and likely more immediately painful, use case is:

> Rescue my existing Lovable.dev app.

This is stronger than "control Lovable.dev from OpenClaw" because it speaks to real Lovable.dev pain: repeated prompts, invisible results, blank screens, brittle code, weak architecture, GitHub confusion, and no clear path from exciting prototype to maintainable app. The durable output is a repo, branch, verification notes, visible-result proof, project memory, and a pull request.

## Pain-Point Positioning

Lead with the pain, not the tool list:

- Lovable.dev is fast, but repeated fixes can become expensive.
- Lovable.dev can say "done" while the screen remains wrong or unchanged.
- Lovable.dev-generated code often needs refactoring before it is scalable, maintainable, or reviewable.
- Lovable.dev is not a complete GitHub, testing, CI, security, debugging, and delivery workflow.
- Users need a layer that chooses the best tool: Lovable.dev for UI/product shape, OpenClaw for exact engineering.
- Users need a plan that spends Lovable.dev credits on product shape instead of preventable repair loops.

Core market line:

> ClawKit turns Lovable.dev from a credit-hungry prototype generator into one useful tool inside an OpenClaw-powered plan, build, rescue, refactor, verify, and ship workflow.

## Product Modes

ClawKit should expose seven simple modes:

- **Plan**: turn a rough idea into a credit-smart Lovable.dev prompt sequence before spending credits.
- **Start**: build a new Lovable.dev app from an idea.
- **Rescue**: fix an existing Lovable.dev app that is broken, invisible, messy, or hard to extend.
- **Harden**: refactor and prepare generated code for production review.
- **Ship**: turn Lovable.dev output into a verified GitHub PR.
- **Remember**: keep project memory, decision logs, session briefs, and next-action plans across Lovable.dev, GitHub, checks, risks, and next actions.
- **Inside**: add safe OpenClaw-powered assistant features to the app.

Rescue is probably the highest-conversion mode because the user already has pain and a project to save.

Plan is the best first-use mode because it protects users before the pain starts. It should make this promise obvious:

> Spend Lovable.dev credits on product shape, not on repair loops OpenClaw can solve with GitHub, tests, browser checks, and code.

## Ideal Customer

- Founders who prototype in Lovable.dev but need production-quality code afterward.
- Agencies that build many client apps and want repeatable delivery.
- Builders operating OpenClaw from chat/phone who want remote product creation.
- Teams that like Lovable.dev's UI velocity but need GitHub review, CI, tests, and auditability.
- Lovable.dev users frustrated by credits spent on fixes that should have been code changes.
- Non-developers who need OpenClaw to tell them when Lovable.dev is no longer the right tool for the next step.

## Differentiation

Most automations either prompt Lovable.dev or edit code. This plugin does both, with a routing policy:

- Lovable.dev handles taste, layout, page scaffolds, and quick product iteration.
- OpenClaw handles exact implementation, repo control, tests, CI, browser verification, refactoring, maintainability, security, and delivery.
- GitHub remains the source of truth.
- Project Memory preserves what was decided so the project does not drift after each prompt.

## MVP Definition

The MVP is successful when a user can:

1. Give OpenClaw a product idea.
2. Get a strong Lovable.dev prompt and build URL.
3. Generate the app in Lovable.dev.
4. Export/sync to GitHub.
5. Have OpenClaw continue with code, verification, and a PR.

The next improvement is now a first-class Project Memory layer: ClawKit should carry a reusable brief with the project goal, Lovable.dev URL, GitHub repo, local path, stack, verification commands, deployment target, risks, blockers, do-not-touch rules, and next action. It should also keep a decision log, summarize what changed since last time, and choose the next safest action. This keeps OpenClaw oriented across multi-session Lovable.dev/GitHub work without the plugin reading files or calling external APIs itself.

## Feedback Loop

Early users should be invited to share:

- Failed rescue cases.
- Confusing workflow steps.
- Missing visible-result checks.
- Incorrect Lovable.dev-vs-code routing decisions.
- Better PR/client-reporting needs.

These should become the core product learning loop.

## Next Wedge: ClawKit Sync Doctor

The next product layer is Sync Doctor:

> The safety layer between Lovable.dev speed and production code.

This solves the pain serious users feel when Lovable.dev UI iteration, GitHub sync, local code edits, and PR review start to overlap.

Sync Doctor should become the habit:

1. Lovable.dev creates or updates UI.
2. User syncs/exports to GitHub.
3. OpenClaw runs `lovable_connect_github_repo`.
4. OpenClaw runs or refreshes `lovable_project_context`.
5. OpenClaw runs `lovable_project_readiness`.
6. OpenClaw runs `lovable_repo_doctor`.
7. OpenClaw reports whether the repo is safe for another Lovable.dev pass or should move into code hardening.
8. OpenClaw opens a PR with clear generated-vs-engineered notes.

## Product Expansion: Project Memory

Project Memory is the practical bridge between a fun demo and a repeatable delivery framework. Users should not need to restate the same Lovable.dev URL, GitHub repo, local branch habit, package manager, verification commands, deployment target, and risk rules every session.

The memory brief should stay transparent and editable. It should never pretend to be a database or hidden state store; it is a structured summary that OpenClaw can refresh whenever the project changes.

Project Memory v1 adds four habits:

- `lovable_project_memory`: durable project state.
- `lovable_decision_log`: dated decisions and follow-ups.
- `lovable_session_brief`: safe orientation at the start of work.
- `lovable_next_action_plan`: evidence-based next move selection.

The product line should make this sentence true: before every big action, ClawKit can say what it knows, what changed, and what it will not touch.

## Product Expansion: Credit-Smart Planning

Credit-Smart Planning turns ClawKit from a prompt helper into a project framework.

The user gives a rough idea. ClawKit turns it into:

- A staged Lovable.dev build plan.
- A limited prompt sequence.
- Evidence gates after each prompt.
- A list of work Lovable.dev should not attempt.
- A handoff point where OpenClaw/GitHub should take over.
- Stop-prompting rules when credits are being wasted.

This is commercially important because it is easy for users to blame themselves when Lovable.dev output drifts or breaks. ClawKit should make the safer path explicit before money is spent:

1. Use Lovable.dev for product direction, screens, UI structure, and visual iteration.
2. Use OpenClaw for GitHub, debugging, exact code, architecture, tests, integrations, security, PRs, and shipping.
3. Return to Lovable.dev only with a narrow UI/product prompt after verification.

## Product Expansion: OpenClaw Inside

An optional expansion is letting the app being built include OpenClaw-powered features for its own users.

This should not mean exposing OpenClaw directly in the browser. The winning version is:

> OpenClaw Inside: secure, scoped assistant features mediated by the app backend.

Lovable.dev creates the assistant UI and approval surfaces. OpenClaw implements the backend adapter, permissions, audit log, tests, and safety policy in GitHub.

This turns the plugin from a builder tool into an app capability generator: every Lovable.dev app can optionally ship with a safe AI operator built in.

## Usability Layer: Guided Framework

The product should feel less like a plugin and more like a friendly framework:

> Tell ClawKit what you want to build, and it teaches you the safe path from idea to visible app to maintainable PR.

The key feature is not another command. It is the starter experience:

- Explain what Lovable.dev is good for.
- Explain what OpenClaw is good for.
- Show copyable example requests.
- Let the user choose model/profile, browser opening, GitHub handoff, and OpenClaw Inside.
- Warn that Lovable.dev's "done" is not enough until the change is visible.

## Verification Layer

ClawKit should become known for not trusting fake completion. Every Lovable.dev result should pass:

1. GitHub sync check.
2. Build/typecheck/test check.
3. Visible browser/screenshot check.
4. Console/network error check.
5. Maintainability hardening pass.

This is the difference between a fun demo and a product people trust.

## Delight Layer: Mood Indicator

ClawKit should feel emotionally easier to work with than raw AI coding. The mood indicator is a small but memorable feature:

- It notices when instructions get intense.
- It gives a funny build mood.
- It converts frustration into agent self-correction.

This is not decorative. It creates trust by making the agent admit uncertainty, gather evidence, and repair its process instead of bluffing.

## UX Principle

The user should not need to say "use Lovable.dev" or "use GitHub" every time. OpenClaw should choose:

- If the change is visual, product-facing, or fuzzy: Lovable.dev.
- If the change is exact, risky, testable, or structural: GitHub/code tools.

## Naming

Product name: **ClawKit Studio for Lovable**

Package name: `@clawkit/clawkit-for-lovable`

Technical plugin id: `clawkit-for-lovable`

Marketplace display name: **ClawKit Studio for Lovable**

The display name should stay Studio-branded for visibility. It includes the terms users are likely to search for: ClawKit, Studio, Lovable, and Lovable.dev. Do not rename the package id casually; the package id is the stable install surface.

## Pricing Possibilities

- Free: prompt builder and Build-with-URL launch.
- Pro: GitHub handoff memory, screenshots, session tracking, PR summaries.
- Team: shared project workspaces, approval policies, Slack/Discord review.
- Enterprise: audit trails, SSO, private Lovable.dev/GitHub policy controls.

## Next Technical Milestones

1. Browser automation adapter for logged-in Lovable.dev sessions.
2. Screenshot capture and UI regression notes.
3. Persistable project memory handoff files when the user approves writing into the repo.
4. GitHub repo creation/export helpers.
5. Build/test command detection.
6. PR generation with generated-vs-coded change sections.
7. Approval hooks for publish, deploy, billing, and production branches.
