# Product Strategy

## Category

ClawKit for Lovable is an agentic app-building control plane. It lets Lovable be great at UI generation without forcing Lovable to own every engineering task.

## Wedge

The first winning use case is:

> Take my app idea to a GitHub PR.

An equally strong, and likely more immediately painful, use case is:

> Rescue my existing Lovable app.

This is stronger than "control Lovable from OpenClaw" because it produces durable engineering output: a repo, branch, verification notes, visible-result proof, and a pull request.

## Product Modes

ClawKit should expose five simple modes:

- **Start**: build a new Lovable app from an idea.
- **Rescue**: fix an existing Lovable app that is broken, invisible, messy, or hard to extend.
- **Harden**: refactor and prepare generated code for production review.
- **Ship**: turn Lovable output into a verified GitHub PR.
- **Inside**: add safe OpenClaw-powered assistant features to the app.

Rescue is probably the highest-conversion mode because the user already has pain and a project to save.

## Ideal Customer

- Founders who prototype in Lovable but need production-quality code afterward.
- Agencies that build many client apps and want repeatable delivery.
- Builders operating OpenClaw from chat/phone who want remote product creation.
- Teams that like Lovable's UI velocity but need GitHub review, CI, tests, and auditability.

## Differentiation

Most automations either prompt Lovable or edit code. This plugin does both, with a routing policy:

- Lovable handles taste, layout, page scaffolds, and quick product iteration.
- OpenClaw handles exact implementation, repo control, tests, CI, refactoring, maintainability, security, and delivery.
- GitHub remains the source of truth.

## MVP Definition

The MVP is successful when a user can:

1. Give OpenClaw a product idea.
2. Get a strong Lovable prompt and build URL.
3. Generate the app in Lovable.
4. Export/sync to GitHub.
5. Have OpenClaw continue with code, verification, and a PR.

## Next Wedge: ClawKit Sync Doctor

The next product layer is Sync Doctor:

> The safety layer between Lovable speed and production code.

This solves the pain serious users feel when Lovable UI iteration, GitHub sync, local code edits, and PR review start to overlap.

Sync Doctor should become the habit:

1. Lovable creates or updates UI.
2. User syncs/exports to GitHub.
3. OpenClaw runs `lovable_repo_doctor`.
4. OpenClaw reports whether the repo is safe for another Lovable pass or should move into code hardening.
5. OpenClaw opens a PR with clear generated-vs-engineered notes.

## Product Expansion: OpenClaw Inside

An optional expansion is letting the app being built include OpenClaw-powered features for its own users.

This should not mean exposing OpenClaw directly in the browser. The winning version is:

> OpenClaw Inside: secure, scoped assistant features mediated by the app backend.

Lovable creates the assistant UI and approval surfaces. OpenClaw implements the backend adapter, permissions, audit log, tests, and safety policy in GitHub.

This turns the plugin from a builder tool into an app capability generator: every Lovable app can optionally ship with a safe AI operator built in.

## Usability Layer: Guided Framework

The product should feel less like a plugin and more like a friendly framework:

> Tell ClawKit what you want to build, and it teaches you the safe path from idea to visible app to maintainable PR.

The key feature is not another command. It is the starter experience:

- Explain what Lovable is good for.
- Explain what OpenClaw is good for.
- Show copyable example requests.
- Let the user choose model/profile, browser opening, GitHub handoff, and OpenClaw Inside.
- Warn that Lovable's "done" is not enough until the change is visible.

## Verification Layer

ClawKit should become known for not trusting fake completion. Every Lovable result should pass:

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

The user should not need to say "use Lovable" or "use GitHub" every time. OpenClaw should choose:

- If the change is visual, product-facing, or fuzzy: Lovable.
- If the change is exact, risky, testable, or structural: GitHub/code tools.

## Naming

Product name: **ClawKit for Lovable**

Package name: `@clawkit/clawkit-for-lovable`

Technical plugin id: `clawkit-for-lovable`

## Pricing Possibilities

- Free: prompt builder and Build-with-URL launch.
- Pro: GitHub handoff memory, screenshots, session tracking, PR summaries.
- Team: shared project workspaces, approval policies, Slack/Discord review.
- Enterprise: audit trails, SSO, private Lovable/GitHub policy controls.

## Next Technical Milestones

1. Browser automation adapter for logged-in Lovable sessions.
2. Screenshot capture and UI regression notes.
3. GitHub repo creation/export helpers.
4. Build/test command detection.
5. PR generation with generated-vs-coded change sections.
6. Approval hooks for publish, deploy, billing, and production branches.
