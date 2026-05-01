# Security

ClawKit for Lovable is an independent OpenClaw plugin. Treat plugin installs like running local code.

## Security Model

- Local-first by default.
- Browser opening is optional and should be performed by OpenClaw's trusted browser tools, not direct shell execution inside the plugin.
- GitHub remains the source of truth.
- Publishing, billing, production writes, destructive changes, and secret handling should require explicit user approval.
- Lovable prompts should not include secrets, private customer data, production credentials, or sensitive internal data.

## What The Plugin Does Not Do

- It does not bundle LLM access.
- It does not collect analytics.
- It does not require a hosted ClawKit account.
- It does not intentionally send secrets to Lovable, GitHub, OpenClaw, or any third party.

## Reporting Issues

Please open a private security advisory on GitHub or contact the maintainers before publicly disclosing security-sensitive issues.
