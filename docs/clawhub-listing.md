# ClawHub / Marketplace Listing Draft

## Name

ClawKit for Lovable

## Short Description

Build, rescue, verify, refactor, and ship Lovable.dev projects with OpenClaw.

## Long Description

ClawKit for Lovable is an independent OpenClaw plugin that turns Lovable.dev into one tool inside a safer full-stack delivery workflow. It helps OpenClaw create better Lovable prompts, optionally open Lovable in the browser, inspect and rescue existing Lovable apps, check GitHub sync risk, verify that claimed changes actually build and appear on screen, refactor generated code, prepare PR summaries, and plan secure OpenClaw Inside assistant features.

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
  --name clawkit-for-lovable \
  --display-name "ClawKit for Lovable" \
  --version 0.1.0 \
  --source-repo MarcSean1971/clawkit-for-lovable \
  --source-commit "$(git rev-parse HEAD)" \
  --source-ref main \
  --changelog "Initial public release"
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

## Safety Notes

ClawKit is independent and is not affiliated with or endorsed by Lovable.dev. It is designed around explicit user approval for risky actions, local-first inspection, optional browser opening through OpenClaw's trusted browser tools, and GitHub-based review. The plugin package avoids direct shell execution for marketplace safety.
