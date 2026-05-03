# Tool Contracts

## `lovable_decide_route`

Input: user request plus optional context about repo state and risk.

Output: JSON decision with:

- `useLovableFor`
- `useOpenClawFor`
- `useGithubFor`
- `nextSteps`
- `risks`

## `lovable_make_prompt`

Input: rough product details.

Output: a Lovable.dev-ready prompt that explicitly assigns UI/product work to Lovable.dev and deep engineering work to OpenClaw after GitHub handoff.

## `lovable_credit_smart_plan`

Input: rough app idea, target users, must-have features, nice-to-have features, integrations, data objects, design direction, budget sensitivity, and optional GitHub/local repo context.

Output: JSON plan with:

- Planning goal.
- Credit strategy.
- What Lovable.dev should do.
- What OpenClaw should do.
- What to defer until the product shape is clear.
- First prompt scope.
- Screen plan.
- Data model assumptions.
- Integration strategy.
- Acceptance criteria before another Lovable.dev prompt.
- Stop-prompting rules.
- Recommended tool order.
- Draft Lovable.dev prompt.

Use it before the first Lovable.dev prompt so OpenClaw spends credits on product shape, screens, and visual direction instead of debugging, refactoring, tests, GitHub sync, backend logic, auth, billing, integrations, or security.

## `lovable_prompt_sequence`

Input: project name, optional `lovable_credit_smart_plan` output, rough idea, maximum Lovable.dev prompt count, and whether to include GitHub handoff.

Output: JSON prompt sequence with:

- Maximum Lovable.dev prompts.
- Step-by-step prompt goals.
- Prompt text.
- Expected evidence after each prompt.
- Stop conditions after each prompt.
- After-sequence OpenClaw/GitHub work.

Use it to avoid endless Lovable.dev prompting. The default sequence is first app shell, one focused UI/product improvement, final polish, then OpenClaw/GitHub verification and engineering.

## `lovable_credit_risk_audit`

Input: proposed Lovable.dev prompt, planned features, integrations, known bugs, build/runtime/visible-result state, GitHub/local repo state, and credit sensitivity.

Output: JSON risk audit with:

- Risk level.
- Whether Lovable.dev should be used now.
- Likely credit wastes.
- Work OpenClaw should handle instead.
- Prompt-tightening rules.
- Recommended next action.

Use it before spending credits on a proposed prompt, especially when the prompt mentions TypeScript, runtime errors, tests, CI, auth, billing, webhooks, migrations, database behavior, security, refactoring, GitHub, integrations, or invisible changes.

## `lovable_stop_prompting_check`

Input: prompt count, whether the same issue repeated, build/runtime/visible-result state, GitHub/local repo state, architecture/refactor need, and user satisfaction state.

Output: JSON stop-prompting decision with:

- Whether to stop prompting Lovable.dev.
- Reason.
- What OpenClaw should switch to.
- Next OpenClaw steps.
- Evidence required before another Lovable.dev prompt.

Use it when Lovable.dev has claimed success but the result is not visible, the same issue keeps repeating, the build fails, runtime errors appear, or the next work is maintainability/refactoring.

## `lovable_build_url`

Input: prepared Lovable.dev prompt.

Output: Lovable.dev autosubmit URL.

## `lovable_open_build_url`

Input: prepared Lovable.dev prompt.

Side effect: none inside the plugin. It returns the URL and instructions for OpenClaw's trusted browser tool to open it.

This tool is optional because it has an external side effect.

## `lovable_github_handoff`

Input: project URL, repo URL, branch, and requested outcome.

Output: checklist for moving from Lovable.dev generation to GitHub source-of-truth engineering.

## `lovable_connect_github_repo`

Input: Lovable.dev project URL, GitHub repo URL, desired outcome, optional local repo path, optional trusted Git/package evidence, and optional preferred branch name.

Output: JSON plan with:

- Connection status.
- Project and repo URLs.
- Suggested local path.
- Recommended branch.
- Connection steps for OpenClaw's trusted GitHub/Git tools.
- Evidence OpenClaw should collect.
- Immediate verification checks.
- Safe Lovable.dev use.
- OpenClaw engineering use.
- Approval gates.
- Next prompt for the user.
- Repo doctor and sync-risk output when evidence is supplied.

This tool does not authenticate to GitHub, clone repositories, run Git, read files, or call network APIs. It plans the workflow and expects OpenClaw's trusted tools to perform the actual GitHub operations.

## `lovable_project_readiness`

Input: booleans describing whether the workflow has Lovable.dev project URL, GitHub repo URL, local repo, clean Git state, safe branch, verification, visible-result proof, PR summary, and intended next step.

Output: JSON readiness report with:

- Readiness state.
- Evidence score.
- Blockers.
- Missing evidence.
- Recommended next action.
- Required evidence list.
- Safe idea-to-PR workflow.

Use it as a gate before another Lovable.dev UI pass, OpenClaw engineering pass, PR, or deploy.

## `lovable_project_context`

Input: project name, product goal, optional Lovable.dev URL, GitHub repo URL, local repo path, branch prefix, package manager, framework stack, verification commands, deployment target, last Lovable.dev prompt, last visible result status, repo doctor summary, PR summary, known risks, blockers, do-not-touch rules, and next goal.

Output: JSON project context with:

- Project brief.
- Source-of-truth guidance.
- Project profile.
- Session memory.
- Known risks.
- Do-not-touch rules.
- Recommended next action.
- Reusable brief for future OpenClaw/Lovable.dev sessions.
- Suggested tool order.

This tool does not read files, call GitHub, call Lovable.dev, persist data, or send anything over the network. It packages caller-supplied evidence into a clean memory brief.

## `lovable_project_memory`

Input: current goal, Lovable.dev URL, GitHub repo URL, local repo path, deployed URL, source-of-truth choice, stack, routes/screens, known bugs, refactor decisions, do-not-change rules, pending Lovable.dev prompts, GitHub tasks, visual QA notes, changes since last session, and release readiness.

Output: durable project memory with:

- Current project goal.
- Source-of-truth object.
- Stack and important routes.
- Known bugs.
- Refactor decisions.
- Do-not-change rules.
- Pending Lovable.dev prompts.
- GitHub tasks.
- Visual QA notes.
- Release readiness.
- Reusable summary.
- Suggested next memory updates.

Use it after major events: Lovable.dev prompts, GitHub commits, visible checks, PR updates, release decisions, and user-approved direction changes.

## `lovable_decision_log`

Input: existing decisions, optional new decision, reason, generated date, open questions, and do-not-forget notes.

Output: dated decision log with structured entries and markdown.

Use it for product decisions, source-of-truth changes, refactor decisions, visual QA choices, user-approved constraints, and delivery decisions.

## `lovable_session_brief`

Input: project memory, optional decision log, latest user goal, latest repo state, latest visual state, blockers, and risks.

Output: session-opening brief with:

- Opening summary.
- What changed since last time.
- Current truth.
- Do-not-touch rules.
- Risks.
- Recommended tool order.
- User check-in.

Use it at the beginning of repeat sessions or before major work on a messy Lovable.dev/GitHub project.

## `lovable_next_action_plan`

Input: project memory, requested change, and optional evidence about GitHub repo, local repo, visible issues, failing builds, pending Lovable.dev prompts, and PR readiness.

Output: next action plan choosing one of:

- Ask the user.
- Prompt Lovable.dev.
- Inspect GitHub.
- Edit code.
- Verify visible result.
- Prepare PR.
- Ship.

Also returns reason, immediate steps, what belongs in Lovable.dev, what belongs in OpenClaw, required evidence, and stop conditions.

## `lovable_iteration_brief`

Input: current state, problems, what to preserve, what to change, and what to avoid.

Output: focused Lovable.dev follow-up prompt for visual/product iteration.

## `lovable_repo_doctor`

Input: local repository path plus optional caller-supplied evidence such as current branch, remote URL, dirty files, recent commits, package manager, package scripts, and framework signals.

Output: JSON report with:

- Git repository state.
- Current branch.
- Origin remote.
- Dirty files when supplied by OpenClaw's trusted Git/shell tools.
- Recent commits.
- Lovable.dev-generated commit signals.
- Framework/package manager signals.
- Available package scripts.
- Recommended verification commands.
- Risks and next action.

This tool does not change files or branches. For marketplace safety it does not read local files, execute `git`, run shell commands, or make network requests. OpenClaw should use its own trusted shell/Git/package tools for dirty-file status, recent commit inspection, framework detection, and package script evidence, then pass that evidence into ClawKit.

## `lovable_rescue_plan`

Input: existing app problem, optional repo path, preview URL, expected visible changes, build status, screenshot observations, console errors, and user goal.

Output: JSON rescue plan with:

- Severity.
- Likely failure modes.
- First checks.
- What to fix directly in code.
- What to use Lovable.dev for.
- What to avoid using Lovable.dev for.
- Recommended rescue workflow.
- Required delivery evidence.
- Suggested PR sections.
- Repo doctor output when a repo path is provided.
- Visible-result check output.

Use it for existing Lovable.dev apps that are broken, invisible, messy, hard to extend, or not production-ready.

## `lovable_sync_risk_report`

Input: local repository path and optional intended action.

Output: JSON risk report with:

- Risk level.
- Findings.
- Recommended branch.
- Whether it is safe to prompt Lovable.dev again.
- Required approvals.
- Next steps.

## `lovable_delivery_plan`

Input: product goal, requested change, optional repo path, optional preview URL.

Output: end-to-end workflow deciding whether the next action should be Lovable.dev UI prompting or OpenClaw/GitHub engineering.

## `lovable_pr_summary`

Input: PR title, Lovable.dev changes, OpenClaw changes, verification, screenshots, and risks.

Output: markdown PR body that separates generated UI/product work from engineered changes.

## `lovable_openclaw_integration_plan`

Input: app purpose, desired in-app OpenClaw capabilities, roles, data sensitivity, deployment target, and whether autonomous actions are allowed.

Output: JSON plan for adding "OpenClaw Inside" to the app:

- Recommendation.
- Integration architecture.
- User-facing capabilities.
- Backend endpoints.
- Permission model.
- Safety controls.
- Lovable.dev prompt addendum for UI only.
- OpenClaw engineering tasks for backend/security/test work.
- Risks.

## `lovable_visible_result_check`

Input: expected visible changes, optional repo path, preview URL, build result, screenshot observations, and console errors.

Output: JSON verification report with:

- Status.
- Confidence.
- Findings.
- Required checks.
- Likely causes when not visible.
- Next steps.

Use this whenever Lovable.dev claims success or when the user says the change is not visible.

## `lovable_model_strategy`

Input: user preference, task type, available model/profile names, and cost sensitivity.

Output: model-choice guidance for OpenClaw roles:

- Product planner.
- Lovable.dev prompter.
- Code implementer.
- Reviewer.
- Fast iteration.

This tool guides selection among models already configured in OpenClaw. It does not provide model access itself.

## `lovable_workflow_state`

Input: user goal, app/repo evidence, prompt count, failure state, budget sensitivity, and optional user stress signal.

Output: JSON workflow state with:

- Mode: new build, rescue, improve, harden, ship, or unknown.
- Source of truth.
- App status.
- Repo status.
- Credit risk.
- User stress.
- Current blocker.
- Next best action.
- Known facts.
- Missing information.

Use it when a session feels messy and OpenClaw needs a simple state object before choosing tools.

## `lovable_studio_brain`

Input: user goal, latest message, project/app/repo evidence, credit sensitivity, frustration/stress hints, browser preference, and model-choice preference.

Output: JSON brain decision with:

- Mode: start, rescue, improve, harden, ship, or orient user.
- Confidence.
- User-facing summary.
- Next action and reason.
- Recommended tool order.
- Minimum questions to ask the user.
- What belongs in Lovable.dev.
- What belongs in OpenClaw/GitHub.
- Stop conditions.
- Evidence needed.
- Embedded workflow state.

Use it as the default first tool when the user asks ClawKit Studio to build, rescue, improve, harden, or ship a Lovable.dev app. The user should not need to know tool names.

## `lovable_user_onboarding`

Input: user level, goal, whether there is an existing app, and whether the user wants a fast start.

Output: friendly first-run guide with:

- Shortest path.
- Minimum first questions.
- Natural-language example requests.
- User choices.
- Reassuring rules.
- Next prompt.

Use it to make ClawKit Studio feel like a guided framework rather than a long plugin menu.

## `lovable_starter_guide`

Input: user level and optional goal.

Output: beginner-friendly onboarding guide with:

- What ClawKit does.
- Best first choices.
- Example requests.
- Workflow.
- User decisions.
- Guardrails.
- Suggested next prompt.

## `lovable_mood_indicator`

Input: latest user message, optional recent failure, optional agent mistake, and task stage.

Output: mood and self-healing object with:

- Mood label.
- Intensity.
- Humor line.
- User-care note.
- Agent self-healing notes.
- Better next-response guidance.
- De-escalation moves.
- Execution rules.

Use it when the user is frustrated or when OpenClaw/Lovable.dev likely missed the requested outcome.
