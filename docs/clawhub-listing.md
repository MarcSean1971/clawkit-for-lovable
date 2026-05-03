# ClawHub / Marketplace Listing Draft

## Name

ClawKit for Lovable

## Short Description

Rescue Lovable apps from wasted credits, invisible changes, messy code, and weak architecture with OpenClaw.

## Long Description

ClawKit for Lovable is an independent OpenClaw plugin for Lovable users who are frustrated by wasted credits, repeated failed fixes, "done" messages that are not visible on screen, GitHub sync confusion, and generated code that becomes hard to maintain or scale.

It turns Lovable.dev into one specialized UI/product tool inside a broader OpenClaw workflow. Lovable stays useful for fast screens, product flow, and visual iteration. OpenClaw handles the parts Lovable is not best at: GitHub source-of-truth workflows, repo inspection, build/test/typecheck checks, browser and screenshot verification, debugging, refactoring, architecture cleanup, PR summaries, project memory, and delivery discipline.

Use it to build new Lovable apps more safely, or to rescue existing Lovable apps that are blank, stale, broken, messy, expensive to keep prompting, or not production-ready. ClawKit helps OpenClaw decide whether the next action should be a narrow Lovable prompt, a GitHub/code fix, a visible-result check, a refactor pass, or a PR.

The product promise: use Lovable for speed, then use ClawKit and OpenClaw to verify, clean up, harden, and ship.

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
  --version 0.1.6 \
  --source-repo MarcSean1971/clawkit-for-lovable \
  --source-commit "$(git rev-parse HEAD)" \
  --source-ref main \
  --changelog "Improve Lovable pain-point marketing and marketplace positioning"
```

Dry-run validation passed with these values.

## Keywords

- Lovable
- Lovable.dev
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
