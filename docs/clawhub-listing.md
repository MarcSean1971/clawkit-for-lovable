# ClawHub / Marketplace Listing Draft

## Name

ClawKit for Lovable

## Short Description

ClawKit for Lovable adds a Brain for Lovable.dev projects: reduce wasted credits, walk the real Lovable platform, use Lovable MCP when connected, rescue broken apps, verify visible results, publish safely, hand off to GitHub, and refactor with OpenClaw.

## Long Description

ClawKit for Lovable is an independent OpenClaw plugin for Lovable.dev users who are frustrated by wasted credits, repeated failed fixes, "done" messages that are not visible on screen, GitHub sync confusion, and generated code that becomes hard to maintain or scale.

It turns Lovable.dev into one specialized UI/product tool inside a broader OpenClaw workflow. Lovable.dev stays useful for fast screens, product flow, and visual iteration. OpenClaw handles the parts Lovable.dev is not best at: GitHub source-of-truth workflows, repo inspection, build/test/typecheck checks, browser and screenshot verification, debugging, refactoring, architecture cleanup, PR summaries, project memory, and delivery discipline.

Use it to build new Lovable.dev apps more safely, or to rescue existing Lovable.dev apps that are blank, stale, broken, messy, expensive to keep prompting, or not production-ready. ClawKit helps OpenClaw decide whether the next action should be a credit-smart Lovable.dev plan, a narrow Lovable.dev prompt, a GitHub/code fix, a visible-result check, a refactor pass, or a PR.

Credit-Smart Planning is the key workflow: ClawKit for Lovable turns a rough idea into a staged Lovable.dev plan, limits prompt count, defines evidence gates, warns when a proposed prompt is likely to waste credits, and tells OpenClaw when to stop prompting and switch to GitHub, code, tests, browser checks, or refactoring.

The new walkthrough layer lets OpenClaw ask for approval, open Lovable.dev with trusted browser tools, inspect the actual platform screens, press only approved buttons, capture screenshots or browser notes, and understand project/editor/preview/GitHub/build status before deciding the next action.

The MCP layer helps OpenClaw connect to Lovable's research-preview MCP server when available, discover tools at runtime, and choose whether to use MCP, browser walkthrough, or GitHub/code tools for create, iterate, inspect, deploy, and handoff workflows.

ClawKit for Lovable Brain is the user-friendly entry point. Users do not need to know tool names. They can describe the desired outcome in plain language, and the Brain chooses start, rescue, improve, harden, ship, publish, or orient-user mode, then tells OpenClaw what to do next and what evidence is needed.

The latest release adds the wow layer: Publish Mode, publish confidence scoring, project dashboards, client handoff reports, prompt linting, visual QA, and an end-to-end idea-to-live planner.

Search visibility note: the product name intentionally stays **ClawKit for Lovable** to distinguish it from **ClawKit Creative Studio for Lovable**. The package stays `@clawkit/clawkit-for-lovable` for install stability.

The product promise: use Lovable.dev for speed, then use ClawKit for Lovable and OpenClaw to plan, verify, clean up, harden, publish, and ship.

This is an early public release. It is useful now, and it will be updated continuously. Constructive feedback, especially rescue cases and workflow suggestions, is welcome at:

https://github.com/MarcSean1971/clawkit-for-lovable/issues

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

## Publish Command

After logging in with `clawhub login`, publish with:

```bash
clawhub package publish . \
  --family code-plugin \
  --name @clawkit/clawkit-for-lovable \
  --display-name "ClawKit for Lovable" \
  --version 0.1.12 \
  --source-repo MarcSean1971/clawkit-for-lovable \
  --source-commit "$(git rev-parse HEAD)" \
  --source-ref main \
  --changelog "Add Publish Mode, dashboards, client handoff, prompt linting, visual QA, and end-to-end planning"
```

Dry-run validation passed with these values.

## Keywords

- Lovable
- Lovable.dev
- ClawKit for Lovable
- ClawKit for Lovable
- Lovable MCP
- Lovable browser automation
- OpenClaw
- GitHub
- AI app builder
- rescue
- refactor
- PR
- visible verification
- vibe coding
- wasted credits
- messy code
- maintainability
- architecture
- Lovable rescue

## Safety Notes

ClawKit is independent and is not affiliated with or endorsed by Lovable.dev. It is designed around explicit user approval for risky actions, evidence supplied by OpenClaw's trusted tools, optional browser opening through OpenClaw's trusted browser tools, and GitHub-based review. The plugin package avoids direct shell execution, local file reads, and network requests for marketplace safety.
