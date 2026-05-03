# ClawHub / Marketplace Listing Draft

## Name

ClawKit Studio for Lovable

## Short Description

ClawKit Studio for Lovable adds a Brain for Lovable.dev projects: reduce wasted credits, rescue broken apps, verify visible results, hand off to GitHub, and refactor with OpenClaw.

## Long Description

ClawKit Studio for Lovable is an independent OpenClaw plugin for Lovable.dev users who are frustrated by wasted credits, repeated failed fixes, "done" messages that are not visible on screen, GitHub sync confusion, and generated code that becomes hard to maintain or scale.

It turns Lovable.dev into one specialized UI/product tool inside a broader OpenClaw workflow. Lovable.dev stays useful for fast screens, product flow, and visual iteration. OpenClaw handles the parts Lovable.dev is not best at: GitHub source-of-truth workflows, repo inspection, build/test/typecheck checks, browser and screenshot verification, debugging, refactoring, architecture cleanup, PR summaries, project memory, and delivery discipline.

Use it to build new Lovable.dev apps more safely, or to rescue existing Lovable.dev apps that are blank, stale, broken, messy, expensive to keep prompting, or not production-ready. ClawKit helps OpenClaw decide whether the next action should be a credit-smart Lovable.dev plan, a narrow Lovable.dev prompt, a GitHub/code fix, a visible-result check, a refactor pass, or a PR.

Credit-Smart Planning is the key workflow: ClawKit Studio turns a rough idea into a staged Lovable.dev plan, limits prompt count, defines evidence gates, warns when a proposed prompt is likely to waste credits, and tells OpenClaw when to stop prompting and switch to GitHub, code, tests, browser checks, or refactoring.

ClawKit Studio Brain is the user-friendly entry point. Users do not need to know tool names. They can describe the desired outcome in plain language, and the Brain chooses start, rescue, improve, harden, ship, or orient-user mode, then tells OpenClaw what to do next and what evidence is needed.

Search visibility note: the product name intentionally includes ClawKit, Studio, Lovable, and Lovable.dev positioning. The package stays `@clawkit/clawkit-for-lovable` for install stability, while the marketplace display name is **ClawKit Studio for Lovable**.

The product promise: use Lovable.dev for speed, then use ClawKit Studio and OpenClaw to plan, verify, clean up, harden, and ship.

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
  --display-name "ClawKit Studio for Lovable" \
  --version 0.1.9 \
  --source-repo MarcSean1971/clawkit-for-lovable \
  --source-commit "$(git rev-parse HEAD)" \
  --source-ref main \
  --changelog "Add ClawKit Studio Brain orchestration and user onboarding"
```

Dry-run validation passed with these values.

## Keywords

- Lovable
- Lovable.dev
- ClawKit Studio
- ClawKit Studio for Lovable
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
