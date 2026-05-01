# Demo Script

## Title

Lovable got you 80% there. ClawKit rescues the last 20%.

## Storyboard

1. Start with an existing Lovable app.
2. Show the problem: Lovable says the dashboard exists, but the preview is blank or stale.
3. Ask OpenClaw: "Use ClawKit to rescue this Lovable app."
4. Run `lovable_rescue_plan`.
5. Show the diagnosis: build/runtime/visible-result risk.
6. Run `lovable_repo_doctor`.
7. Fix the real code issue with OpenClaw.
8. Run `lovable_visible_result_check`.
9. Show the dashboard now visible.
10. Generate `lovable_pr_summary`.

## Short Demo Voiceover

Lovable is great for getting an app started, but sometimes it says a feature is done and the screen disagrees. ClawKit for Lovable lets OpenClaw inspect the GitHub repo, diagnose sync and build issues, verify what is actually visible, fix the code directly, and prepare a clean PR. It is not a replacement for Lovable; it is the rescue, hardening, and shipping layer around it.

## Example Prompt

```text
Use ClawKit to rescue my existing Lovable app. Lovable says the dashboard was added, but the preview is blank. Check the repo, verify what is actually visible, fix the real blocker in code, and prepare a PR summary.
```
