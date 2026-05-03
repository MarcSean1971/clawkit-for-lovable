import { basename, resolve } from "node:path";
import { definePluginEntry } from "openclaw/plugin-sdk/plugin-entry";
import { Type } from "@sinclair/typebox";
const text = (value) => ({
    content: [{ type: "text", text: value }],
    details: {},
});
const jsonText = (value) => text(JSON.stringify(value, null, 2));
const optionalStringArray = (description) => Type.Optional(Type.Array(Type.String(), { description }));
function asList(items, fallback) {
    return items && items.length > 0 ? items : fallback;
}
function detectFrameworksFromPackage(pkg) {
    const deps = { ...(pkg?.dependencies ?? {}), ...(pkg?.devDependencies ?? {}) };
    const signals = new Set();
    if ("vite" in deps) {
        signals.add("Vite");
    }
    if ("next" in deps) {
        signals.add("Next.js");
    }
    if ("react" in deps) {
        signals.add("React");
    }
    if ("typescript" in deps) {
        signals.add("TypeScript");
    }
    if ("tailwindcss" in deps) {
        signals.add("Tailwind CSS");
    }
    if ("@supabase/supabase-js" in deps) {
        signals.add("Supabase");
    }
    if ("stripe" in deps || "@stripe/stripe-js" in deps) {
        signals.add("Stripe");
    }
    return [...signals];
}
function recommendedCommands(pkg, packageManager) {
    if (!pkg || !packageManager) {
        return [];
    }
    const scripts = pkg.scripts ?? {};
    const runner = packageManager === "npm" ? "npm run" : packageManager;
    const commands = [];
    if (packageManager === "npm") {
        commands.push("npm install");
    }
    else if (packageManager === "pnpm") {
        commands.push("pnpm install");
    }
    else if (packageManager === "yarn") {
        commands.push("yarn install");
    }
    else if (packageManager === "bun") {
        commands.push("bun install");
    }
    for (const scriptName of ["lint", "typecheck", "test", "build"]) {
        if (scripts[scriptName]) {
            commands.push(`${runner} ${scriptName}`);
        }
    }
    return commands;
}
function hasLovableCommit(commit) {
    return /lovable|lovable-dev|lovable bot|generated with lovable/i.test(commit);
}
async function inspectRepo(evidence) {
    const repoPath = resolve(evidence.repoPath);
    const packageManager = evidence.packageManager ?? null;
    const dirtyFiles = evidence.dirtyFiles ?? [];
    const recentCommits = evidence.recentCommits ?? [];
    const lovableSignals = recentCommits.filter(hasLovableCommit);
    const currentBranch = evidence.currentBranch ?? null;
    const remoteUrl = evidence.remoteUrl ?? null;
    const isGitRepo = evidence.isGitRepo ?? Boolean(currentBranch || remoteUrl || recentCommits.length > 0);
    const availableScripts = evidence.availableScripts ?? {};
    const pkg = { scripts: availableScripts };
    const frameworkSignals = evidence.frameworkSignals ?? detectFrameworksFromPackage(pkg);
    const commands = recommendedCommands(pkg, packageManager);
    const risks = [];
    if (!isGitRepo) {
        risks.push("No Git evidence was supplied, so OpenClaw should confirm this is a repository before making changes.");
    }
    risks.push("ClawKit marketplace-safe mode does not read files or run Git. OpenClaw should supply repo evidence from its trusted shell/Git tools.");
    if (currentBranch === "main" || currentBranch === "master") {
        risks.push(`Current branch is ${currentBranch}. Create a feature branch before Lovable or OpenClaw changes code.`);
    }
    if (lovableSignals.length > 0 && dirtyFiles.length > 0) {
        risks.push("Recent Lovable-generated commits plus local changes increase overwrite/conflict risk.");
    }
    const nextAction = risks.length > 0
        ? "Stabilize the Git state first: create a branch, commit/stash local work, then run verification commands."
        : "Run the recommended verification commands, then decide whether the next change belongs in Lovable or direct code edits.";
    return {
        repoPath,
        repoName: basename(repoPath),
        isGitRepo,
        currentBranch,
        remoteUrl,
        dirtyFiles,
        recentCommits,
        lovableSignals,
        frameworkSignals,
        packageManager,
        availableScripts,
        recommendedCommands: commands,
        risks,
        nextAction,
    };
}
function makeRiskReport(doctor, intendedAction) {
    const findings = [];
    const requiredApprovals = [];
    if (!doctor.isGitRepo) {
        findings.push("No Git repository detected.");
    }
    if (!doctor.remoteUrl) {
        findings.push("No origin remote detected.");
    }
    if (doctor.dirtyFiles.length > 0) {
        findings.push(`${doctor.dirtyFiles.length} uncommitted file change(s) detected.`);
    }
    if (doctor.lovableSignals.length > 0) {
        findings.push(`${doctor.lovableSignals.length} recent commit(s) look Lovable-generated.`);
    }
    if (doctor.currentBranch === "main" || doctor.currentBranch === "master") {
        findings.push(`Current branch is protected-style branch ${doctor.currentBranch}.`);
        requiredApprovals.push(`Work directly on ${doctor.currentBranch}`);
    }
    if (/publish|deploy|production|stripe|billing|payment|delete|overwrite/i.test(intendedAction ?? "")) {
        findings.push("Requested action appears production, billing, or destructive.");
        requiredApprovals.push("Production, billing, publishing, or destructive action");
    }
    const highRisk = !doctor.isGitRepo || doctor.dirtyFiles.length > 0 || requiredApprovals.length > 0;
    const mediumRisk = doctor.lovableSignals.length > 0 || !doctor.remoteUrl;
    const riskLevel = highRisk ? "high" : mediumRisk ? "medium" : "low";
    return {
        repoPath: doctor.repoPath,
        branch: doctor.currentBranch,
        riskLevel,
        findings: findings.length ? findings : ["No obvious Git/Lovable sync risks detected."],
        recommendedBranch: riskLevel === "low" ? "lovable/ui-pass" : "openclaw/sync-stabilization",
        safeToPromptLovable: riskLevel === "low",
        requiredApprovals,
        nextSteps: riskLevel === "low"
            ? [
                "Create or switch to a Lovable UI branch.",
                "Prompt Lovable for the UI/product change.",
                "Pull/sync the GitHub result and run verification.",
            ]
            : [
                "Do not prompt Lovable broadly yet.",
                "Commit or stash local work and move off main/master.",
                "Run repo verification, then use Lovable only with a narrow iteration brief.",
            ],
    };
}
async function makeGithubConnectionPlan(params) {
    const repoDoctor = params.repoPath ? await inspectRepo({ ...params, repoPath: params.repoPath }) : null;
    const syncRisk = repoDoctor ? makeRiskReport(repoDoctor, params.desiredOutcome) : null;
    const repoUrl = params.repoUrl ?? repoDoctor?.remoteUrl ?? null;
    const recommendedBranch = params.preferredBranchName ??
        syncRisk?.recommendedBranch ??
        "openclaw/lovable-github-handoff";
    const status = !repoUrl
        ? "needs-repo-url"
        : repoDoctor && syncRisk?.riskLevel === "low"
            ? "connected-ready"
            : repoDoctor
                ? "connected-needs-stabilization"
                : "ready-to-connect";
    return {
        status,
        projectUrl: params.projectUrl ?? null,
        repoUrl,
        suggestedLocalPath: params.repoPath ?? (repoUrl ? "<workspace>/<repo-name>" : null),
        recommendedBranch,
        connectionSteps: repoUrl
            ? [
                "Confirm this is the GitHub repository connected to the Lovable project.",
                "OpenClaw should clone or open the repository using its trusted Git/GitHub tools.",
                `Create or switch to branch \`${recommendedBranch}\` before making changes.`,
                "Fetch/pull the latest Lovable-synced changes.",
                "Collect Git/package evidence and pass it to `lovable_repo_doctor`.",
                "Run verification commands before making engineering changes.",
            ]
            : [
                "Ask the user to connect or export the Lovable project to GitHub.",
                "Capture the GitHub repository URL from Lovable or GitHub.",
                "Run this tool again with `repoUrl`.",
            ],
        evidenceForOpenClaw: [
            "Repository URL and local path.",
            "Current branch and origin remote.",
            "Uncommitted changes from trusted Git tools.",
            "Recent commit subjects, especially Lovable-generated commits.",
            "Package manager and available scripts.",
            "Framework signals such as React, Vite, Next.js, TypeScript, Tailwind, Supabase, or Stripe.",
        ],
        immediateChecks: [
            "Confirm the repo is not on main/master before editing.",
            "Run install/build/typecheck/lint/test where available.",
            "Open the Lovable preview or local dev server and record visible-result evidence.",
            "Check console/runtime errors before accepting Lovable's completion claim.",
        ],
        safeLovableUse: status === "connected-ready"
            ? [
                "Focused UI/product iteration on a feature branch.",
                "Responsive layout, visual polish, empty/loading/error states.",
                "Screen-level design changes that can be reviewed as a GitHub diff.",
            ]
            : [
                "Avoid broad Lovable prompts until the repo URL, branch, and verification state are clear.",
                "Use Lovable only for narrow visual prompts after Git state is stabilized.",
            ],
        openClawEngineeringUse: [
            "Clone/open the repo, branch, and protect the Git state.",
            "Refactor generated code for maintainability.",
            "Fix build/runtime/type/auth/data issues directly in code.",
            "Add tests, CI notes, security checks, docs, and PR summary.",
        ],
        approvalGates: [
            "Connecting GitHub on the user's behalf.",
            "Pushing branches or opening PRs.",
            "Deploying, publishing, deleting data, or changing production/billing settings.",
            "Sending secrets, private customer data, or production credentials to Lovable.",
        ],
        nextPromptForUser: repoUrl
            ? `I found the GitHub repo. I should open it, create \`${recommendedBranch}\`, run verification, and then decide whether the next pass belongs in Lovable or code.`
            : "Please connect/export this Lovable project to GitHub and give me the repository URL. I will then inspect it, create a safe branch, run checks, and prepare the PR workflow.",
        repoDoctor,
        syncRisk,
    };
}
function makeProjectReadinessReport(params) {
    const requiredEvidence = [
        "Lovable project or preview URL.",
        "GitHub repository URL.",
        "Local repo path opened by OpenClaw's trusted Git tools.",
        "Safe working branch, not main/master.",
        "Clean or intentionally documented Git state.",
        "Build/typecheck/lint/test output where available.",
        "Visible-result evidence from preview, browser, or screenshots.",
        "PR summary separating Lovable UI work from OpenClaw engineering work.",
    ];
    const checks = [
        params.hasLovableProjectUrl,
        params.hasGithubRepoUrl,
        params.hasLocalRepo,
        params.hasCleanGitState,
        params.onSafeBranch,
        params.verificationPassed,
        params.visibleResultConfirmed,
        params.hasPrSummary,
    ];
    const score = checks.filter(Boolean).length;
    const missingEvidence = requiredEvidence.filter((_, index) => !checks[index]);
    const blockers = [];
    if (!params.hasGithubRepoUrl)
        blockers.push("No GitHub repository URL is connected yet.");
    if (!params.hasLocalRepo)
        blockers.push("OpenClaw has not opened/cloned the GitHub repo yet.");
    if (!params.onSafeBranch)
        blockers.push("Work is not confirmed on a safe feature branch.");
    if (params.hasCleanGitState === false)
        blockers.push("Git state is dirty or unclear.");
    if (params.verificationPassed === false)
        blockers.push("Verification has not passed.");
    if (params.visibleResultConfirmed === false)
        blockers.push("Visible result has not been confirmed.");
    if (params.intendedNextStep === "deploy" && (!params.verificationPassed || !params.visibleResultConfirmed)) {
        blockers.push("Deployment is blocked until verification and visible-result checks pass.");
    }
    const readiness = blockers.length > 0
        ? "not-ready"
        : params.intendedNextStep === "pr" && params.hasPrSummary
            ? "ready-for-pr"
            : params.intendedNextStep === "openclaw-engineering"
                ? "ready-for-engineering"
                : params.intendedNextStep === "lovable-ui"
                    ? "ready-for-lovable"
                    : "needs-checks";
    return {
        readiness,
        score,
        blockers,
        missingEvidence,
        recommendedNextAction: blockers.length > 0
            ? "Collect the missing evidence and stabilize Git before continuing."
            : readiness === "ready-for-lovable"
                ? "Use a narrow Lovable prompt, then sync to GitHub and re-run verification."
                : readiness === "ready-for-engineering"
                    ? "Proceed with OpenClaw code changes on the safe branch and keep verification evidence."
                    : readiness === "ready-for-pr"
                        ? "Open or update the PR with screenshots, verification, risks, and generated-vs-coded sections."
                        : "Run repo doctor and visible-result checks before choosing the next action.",
        requiredEvidence,
        workflow: [
            "Connect/export Lovable to GitHub.",
            "OpenClaw opens the repo and creates a safe branch.",
            "Run Sync Doctor and verification commands.",
            "Use Lovable for narrow UI work only when Git state is safe.",
            "Use OpenClaw for exact code, tests, refactors, integrations, and security.",
            "Verify the visible result in browser/screenshot evidence.",
            "Prepare the PR summary and review risks before delivery.",
        ],
    };
}
function makeProjectContext(params) {
    const projectName = params.projectName ?? "Lovable project";
    const knownRisks = asList(params.knownRisks, []);
    const blockers = asList(params.blockers, []);
    const doNotTouch = asList(params.doNotTouch, [
        "Secrets, production credentials, billing settings, production data, and destructive actions without explicit approval.",
    ]);
    const frameworkStack = asList(params.frameworkStack, ["Unknown until OpenClaw inspects package evidence."]);
    const verificationCommands = asList(params.verificationCommands, [
        "Use `lovable_repo_doctor` to infer install/build/typecheck/test commands from trusted package evidence.",
    ]);
    const sourceOfTruth = params.githubRepoUrl
        ? "GitHub repository is the source of truth. Lovable is a UI/product iteration surface."
        : "GitHub repository is not connected yet. Connect/export Lovable to GitHub before exact engineering work.";
    const recommendedNextAction = blockers.length > 0
        ? "Resolve blockers before another broad Lovable prompt."
        : params.githubRepoUrl
            ? "Open the repo with trusted GitHub/Git tools, run readiness checks, then choose Lovable UI pass or OpenClaw engineering."
            : "Ask the user for the Lovable project URL and GitHub repo URL, then run `lovable_connect_github_repo`.";
    const profile = {
        lovableProjectUrl: params.lovableProjectUrl ?? null,
        githubRepoUrl: params.githubRepoUrl ?? null,
        localRepoPath: params.localRepoPath ?? null,
        preferredBranchPrefix: params.preferredBranchPrefix ?? "clawkit",
        packageManager: params.packageManager ?? null,
        frameworkStack,
        verificationCommands,
        deploymentTarget: params.deploymentTarget ?? null,
    };
    const sessionMemory = {
        lastLovablePrompt: params.lastLovablePrompt ?? null,
        lastVisibleResultStatus: params.lastVisibleResultStatus ?? null,
        lastRepoDoctorSummary: params.lastRepoDoctorSummary ?? null,
        lastPrSummary: params.lastPrSummary ?? null,
        nextGoal: params.nextGoal ?? null,
        blockers,
    };
    const reusableBrief = [
        `Project: ${projectName}`,
        `Goal: ${params.productGoal}`,
        `Source of truth: ${sourceOfTruth}`,
        `Lovable URL: ${params.lovableProjectUrl ?? "not provided"}`,
        `GitHub repo: ${params.githubRepoUrl ?? "not connected"}`,
        `Local repo: ${params.localRepoPath ?? "not opened"}`,
        `Stack: ${frameworkStack.join(", ")}`,
        `Package manager: ${params.packageManager ?? "unknown"}`,
        `Verification: ${verificationCommands.join("; ")}`,
        `Deployment target: ${params.deploymentTarget ?? "unknown"}`,
        `Known risks: ${knownRisks.length ? knownRisks.join("; ") : "none recorded"}`,
        `Blockers: ${blockers.length ? blockers.join("; ") : "none recorded"}`,
        `Do not touch: ${doNotTouch.join("; ")}`,
        `Next goal: ${params.nextGoal ?? "not specified"}`,
    ].join("\n");
    return {
        projectName,
        projectBrief: params.productGoal,
        sourceOfTruth,
        projectProfile: profile,
        sessionMemory,
        knownRisks,
        doNotTouch,
        recommendedNextAction,
        reusableBrief,
        suggestedToolOrder: [
            "lovable_project_context",
            "lovable_connect_github_repo",
            "lovable_project_readiness",
            "lovable_repo_doctor",
            "lovable_sync_risk_report",
            "lovable_visible_result_check",
            "lovable_pr_summary",
        ],
    };
}
function makeProjectMemory(params) {
    const projectName = params.projectName ?? "Lovable project";
    const primary = params.primarySourceOfTruth ??
        (params.githubRepoUrl ? "github" : params.lovableProjectUrl ? "lovable" : params.localRepoPath ? "local-repo" : "unknown");
    const knownBugs = asList(params.knownBugs, []);
    const doNotChange = asList(params.doNotChange, [
        "Do not overwrite working Git changes, production data, secrets, billing settings, or user-approved UI decisions without explicit approval.",
    ]);
    const pendingLovablePrompts = asList(params.pendingLovablePrompts, []);
    const githubTasks = asList(params.githubTasks, []);
    const visualQaNotes = asList(params.visualQaNotes, []);
    const releaseReadiness = params.releaseReadiness ??
        (knownBugs.length > 0 ? "needs-work" : githubTasks.length > 0 || visualQaNotes.length > 0 ? "ready-for-verification" : "blocked");
    const reusableSummary = [
        `Project: ${projectName}`,
        `Current goal: ${params.currentGoal}`,
        `Primary source of truth: ${primary}`,
        `Lovable URL: ${params.lovableProjectUrl ?? "not recorded"}`,
        `GitHub repo: ${params.githubRepoUrl ?? "not recorded"}`,
        `Local repo: ${params.localRepoPath ?? "not recorded"}`,
        `Deployed URL: ${params.deployedUrl ?? "not recorded"}`,
        `Stack: ${asList(params.stack, ["not recorded"]).join(", ")}`,
        `Important routes/screens: ${asList(params.importantRoutes, ["not recorded"]).join("; ")}`,
        `Known bugs: ${knownBugs.length ? knownBugs.join("; ") : "none recorded"}`,
        `Refactor decisions: ${asList(params.refactorDecisions, ["none recorded"]).join("; ")}`,
        `Do not change: ${doNotChange.join("; ")}`,
        `Pending Lovable prompts: ${pendingLovablePrompts.length ? pendingLovablePrompts.join("; ") : "none recorded"}`,
        `GitHub tasks: ${githubTasks.length ? githubTasks.join("; ") : "none recorded"}`,
        `Visual QA notes: ${visualQaNotes.length ? visualQaNotes.join("; ") : "none recorded"}`,
        `Release readiness: ${releaseReadiness}`,
    ].join("\n");
    return {
        projectName,
        currentGoal: params.currentGoal,
        sourceOfTruth: {
            primary,
            lovableProjectUrl: params.lovableProjectUrl ?? null,
            githubRepoUrl: params.githubRepoUrl ?? null,
            localRepoPath: params.localRepoPath ?? null,
            deployedUrl: params.deployedUrl ?? null,
            notes: [
                primary === "github"
                    ? "Treat GitHub as canonical. Lovable should be used for focused UI/product prompts, then synced and verified."
                    : "Confirm the canonical source before major edits.",
                "Record any source-of-truth change in `lovable_decision_log`.",
            ],
        },
        stack: asList(params.stack, ["Unknown until OpenClaw inspects package evidence."]),
        importantRoutes: asList(params.importantRoutes, []),
        knownBugs,
        refactorDecisions: asList(params.refactorDecisions, []),
        doNotChange,
        pendingLovablePrompts,
        githubTasks,
        visualQaNotes,
        releaseReadiness,
        changedSinceLastSession: asList(params.changedSinceLastSession, []),
        nextMemoryUpdate: [
            "Update memory after every Lovable prompt, GitHub commit/PR, visible-result check, and release decision.",
            "Add new do-not-change rules immediately when the user approves or rejects a direction.",
            "Record why a tool was chosen when switching between Lovable, GitHub, local code, or deployed-app verification.",
        ],
        reusableSummary,
    };
}
function makeDecisionLog(params) {
    const projectName = params.projectName ?? "Lovable project";
    const generatedAt = params.generatedAt ?? "not dated";
    const entries = [
        ...(params.decisions ?? []),
        ...(params.newDecision
            ? [{
                    decision: params.newDecision,
                    reason: params.newReason,
                    owner: "shared",
                    status: "accepted",
                    followUp: [],
                }]
            : []),
    ].map((entry) => ({
        date: entry.date ?? generatedAt,
        decision: entry.decision,
        reason: entry.reason ?? "Reason not recorded.",
        owner: entry.owner ?? "shared",
        status: entry.status ?? "accepted",
        followUp: asList(entry.followUp, []),
    }));
    const openQuestions = asList(params.openQuestions, []);
    const doNotForget = asList(params.doNotForget, [
        "Keep GitHub as source of truth once connected.",
        "Verify visible results before accepting Lovable completion claims.",
        "Do not overwrite user or prior OpenClaw changes without approval.",
    ]);
    return {
        projectName,
        generatedAt,
        entries,
        openQuestions,
        doNotForget,
        markdown: [
            `# ${projectName} Decision Log`,
            "",
            `Generated: ${generatedAt}`,
            "",
            "## Decisions",
            ...(entries.length > 0
                ? entries.map((entry) => `- ${entry.date} [${entry.status}] ${entry.decision} Owner: ${entry.owner}. Reason: ${entry.reason}${entry.followUp.length ? ` Follow-up: ${entry.followUp.join("; ")}` : ""}`)
                : ["- No decisions recorded yet."]),
            "",
            "## Open Questions",
            ...(openQuestions.length ? openQuestions.map((item) => `- ${item}`) : ["- None recorded."]),
            "",
            "## Do Not Forget",
            ...doNotForget.map((item) => `- ${item}`),
        ].join("\n"),
    };
}
function makeSessionBrief(params) {
    const projectName = params.projectName ?? params.memory?.projectName ?? "Lovable project";
    const memory = params.memory;
    const blockers = asList(params.currentBlockers, memory?.knownBugs ?? []);
    const risks = asList(params.risks, [
        ...(memory?.knownBugs ?? []),
        ...(memory?.visualQaNotes ?? []),
    ]);
    return {
        projectName,
        openingSummary: [
            `Project: ${projectName}`,
            `Goal: ${params.latestUserGoal ?? memory?.currentGoal ?? "not recorded"}`,
            `Source of truth: ${memory?.sourceOfTruth.primary ?? "unknown"}`,
            `Repo state: ${params.latestRepoState ?? "not supplied"}`,
            `Visual state: ${params.latestVisualState ?? "not supplied"}`,
            `Release readiness: ${memory?.releaseReadiness ?? "unknown"}`,
        ].join("\n"),
        whatChangedSinceLastTime: asList(memory?.changedSinceLastSession, []),
        currentTruth: [
            ...(memory ? [memory.reusableSummary] : ["No project memory supplied yet. Run `lovable_project_memory`."]),
            ...(params.decisionLog?.entries.length
                ? [`Latest decision: ${params.decisionLog.entries[params.decisionLog.entries.length - 1]?.decision}`]
                : []),
        ],
        doNotTouch: asList(memory?.doNotChange, [
            "Ask before changing protected areas, source-of-truth assumptions, or previously approved UX decisions.",
        ]),
        risks,
        recommendedToolOrder: [
            "lovable_session_brief",
            "lovable_next_action_plan",
            "lovable_sync_risk_report",
            "lovable_visible_result_check",
            "lovable_decision_log",
            "lovable_project_memory",
        ],
        userCheckIn: blockers.length > 0
            ? "Before continuing, confirm which blocker should be handled first."
            : "Confirm the next goal and whether Lovable, GitHub, local code, or deployed-app verification should lead.",
    };
}
function makeNextActionPlan(params) {
    const projectName = params.projectName ?? params.memory?.projectName ?? "Lovable project";
    const hasRepo = params.hasGitHubRepo ?? Boolean(params.memory?.sourceOfTruth.githubRepoUrl);
    const hasLocalRepo = params.hasLocalRepo ?? Boolean(params.memory?.sourceOfTruth.localRepoPath);
    const blockers = params.memory?.knownBugs ?? [];
    const recommendedAction = !hasRepo
        ? "ask-user"
        : params.hasFailingBuild
            ? "edit-code"
            : params.hasVisibleIssue
                ? "verify-visible-result"
                : params.readyForPr
                    ? "prepare-pr"
                    : params.hasPendingLovablePrompt || params.requestedChange.toLowerCase().includes("ui")
                        ? "prompt-lovable"
                        : hasLocalRepo
                            ? "edit-code"
                            : "inspect-github";
    return {
        projectName,
        recommendedAction,
        reason: recommendedAction === "ask-user"
            ? "The project needs a confirmed GitHub/source-of-truth connection before exact engineering work."
            : recommendedAction === "prompt-lovable"
                ? "The change appears product/UI oriented and can be expressed as a focused Lovable prompt, then verified in GitHub."
                : recommendedAction === "verify-visible-result"
                    ? "There is a visible-result concern, so OpenClaw should confirm the actual screen before accepting completion."
                    : recommendedAction === "prepare-pr"
                        ? "The work appears ready to package with evidence, risks, screenshots, and generated-vs-coded notes."
                        : "OpenClaw should use GitHub/local code tools because the request needs exact implementation or verification.",
        immediateSteps: [
            "Restate the current project memory and source of truth.",
            "Confirm do-not-change rules before touching code or prompting Lovable.",
            ...(recommendedAction === "prompt-lovable"
                ? ["Create a narrow Lovable prompt with acceptance criteria.", "Sync or inspect generated changes in GitHub.", "Run visible-result verification."]
                : recommendedAction === "edit-code"
                    ? ["Inspect repo evidence.", "Create or confirm a safe branch.", "Run build/typecheck/tests after changes."]
                    : recommendedAction === "prepare-pr"
                        ? ["Draft PR summary.", "Attach verification and screenshot notes.", "List remaining risks."]
                        : ["Collect missing source-of-truth evidence."]),
            "Update `lovable_decision_log` and `lovable_project_memory` after the action.",
        ],
        useLovableFor: [
            "UI layout, product flow, visual hierarchy, responsive polish, and screenshot-driven design fixes.",
            "Narrow prompts that preserve approved behavior and do-not-change areas.",
        ],
        useOpenClawFor: [
            "Repo inspection, code edits, refactors, tests, runtime fixes, GitHub PRs, source-of-truth checks, and visible verification.",
            "Memory updates, decision logging, and deciding whether Lovable or code should lead next.",
        ],
        requiredEvidence: [
            "Lovable project URL or GitHub repo URL.",
            "Current branch and dirty-file state when code is involved.",
            "Build/test/typecheck result when implementation changed.",
            "Browser or screenshot evidence for user-visible changes.",
            "Decision log entry for major product, source-of-truth, or do-not-change decisions.",
        ],
        stopConditions: [
            "Stop before destructive Git operations or production changes without approval.",
            "Stop before broad Lovable prompts when local or user changes may be overwritten.",
            ...(blockers.length > 0 ? ["Stop if blockers are unrelated to the requested change and ask the user to prioritize."] : []),
        ],
    };
}
function makeCreditSmartPlan(params) {
    const projectName = params.projectName ?? "Lovable.dev project";
    const mustHave = asList(params.mustHaveFeatures, [
        "Primary user journey",
        "Core dashboard or workspace",
        "Settings or account flow",
    ]);
    const niceToHave = asList(params.niceToHaveFeatures, [
        "Secondary polish, advanced automation, analytics, and optional integrations",
    ]);
    const integrations = asList(params.integrations, [
        "Use placeholders first; connect real services after GitHub handoff and verification.",
    ]);
    const dataObjects = asList(params.dataObjects, [
        "User",
        "Project",
        "Item or task",
        "Activity/event",
    ]);
    const isHighSensitivity = params.budgetSensitivity === "high";
    const hasRepo = Boolean(params.githubRepoUrl || params.localRepoPath);
    const creditStrategy = [
        "Spend Lovable.dev credits on product shape, screen structure, interaction states, and visual direction.",
        "Do not spend Lovable.dev credits on repeated debugging loops, refactors, tests, GitHub sync confusion, CI, secrets, auth rules, billing, or exact backend behavior.",
        "Ask Lovable.dev for one coherent app shell first, then verify the visible result before buying more iteration.",
        "Move to OpenClaw/GitHub as soon as the UI direction is clear enough to inspect, refactor, and test.",
        ...(isHighSensitivity ? ["Use the smallest useful Lovable.dev prompt sequence and stop after any repeated failure."] : []),
    ];
    const firstPromptScope = [
        `Build the first usable product shell for ${projectName}.`,
        `Target users: ${params.targetUsers ?? "the primary users implied by the product idea"}.`,
        `Core idea: ${params.roughIdea}`,
        "Include only the must-have screens and workflow needed to prove the product direction.",
        "Use realistic sample data and empty states, but avoid fake production integrations or irreversible setup.",
    ];
    const screenPlan = [
        ...mustHave.map((feature) => `Must-have: ${feature}`),
        ...niceToHave.map((feature) => `Defer or stub: ${feature}`),
    ];
    const dataModelAssumptions = dataObjects.map((item) => `${item}: keep simple in Lovable.dev; OpenClaw can normalize, type, migrate, and secure it after GitHub handoff.`);
    const acceptanceCriteriaBeforeNextPrompt = [
        "The app builds or previews without a blank screen.",
        "The main workflow is visible in browser or screenshot evidence.",
        "Navigation between the primary screens works.",
        "No obvious console/runtime error blocks the requested experience.",
        "GitHub sync/export is ready before exact engineering work starts.",
    ];
    const promptDraft = [
        `Build ${projectName} in Lovable.dev as a credit-smart first pass.`,
        "",
        "Product idea:",
        params.roughIdea,
        "",
        "Target users:",
        params.targetUsers ?? "Infer from the product idea and optimize for a serious, production-minded first version.",
        "",
        "Spend effort on:",
        "- Clear product flow, screen layout, responsive behavior, visual hierarchy, empty states, and interaction states.",
        "",
        "Must-have features:",
        ...mustHave.map((feature) => `- ${feature}`),
        "",
        "Defer or stub for later OpenClaw/GitHub work:",
        ...niceToHave.map((feature) => `- ${feature}`),
        ...integrations.map((integration) => `- ${integration}`),
        "",
        "Data objects:",
        ...dataObjects.map((item) => `- ${item}`),
        "",
        "Design direction:",
        params.designDirection ?? "Modern, credible, practical product UI with strong workflow clarity and maintainable structure.",
        "",
        "Important:",
        "- Do not attempt deep backend correctness, production auth rules, billing, webhooks, migrations, CI, or test strategy.",
        "- Keep the project easy to sync/export to GitHub so OpenClaw can inspect, refactor, test, and implement exact logic.",
        "- Avoid broad rewrites after the first usable shell; preserve approved screens and behavior.",
    ].join("\n");
    return {
        projectName,
        planningGoal: "Convert a rough product idea into a Lovable.dev plan that reduces wasted credits over the full project lifecycle.",
        creditStrategy,
        useLovableDevFor: [
            "First product shell, screen architecture, layout, visual direction, responsive states, and fast UI iteration.",
            "Subjective product and design changes where a prompt is faster than exact component editing.",
            "Narrow follow-up UI prompts after OpenClaw confirms Git state and visible result evidence.",
        ],
        useOpenClawFor: [
            "GitHub connection, source-of-truth decisions, local code edits, exact bug fixes, tests, CI, security, backend rules, and PRs.",
            "Refactoring Lovable.dev output into cleaner modules, reusable components, typed data flow, and maintainable architecture.",
            "Browser verification, screenshots, console/runtime diagnosis, and deciding when to stop prompting Lovable.dev.",
            ...(hasRepo ? ["Inspect the connected repository before the next Lovable.dev prompt."] : ["Connect or export to GitHub after the first useful UI pass."]),
        ],
        deferUntilAfterShapeIsClear: [
            "Production authentication rules, billing, webhooks, migrations, permissions, analytics, email delivery, and third-party API keys.",
            "Advanced admin tools, complex reporting, automation, and large-scale state refactors.",
            "Any change that needs exact correctness more than product exploration.",
        ],
        firstPromptScope,
        screenPlan,
        dataModelAssumptions,
        integrationStrategy: integrations.map((integration) => `${integration}: represent visually or with safe placeholders in Lovable.dev; implement and test for real through OpenClaw after GitHub handoff.`),
        acceptanceCriteriaBeforeNextPrompt,
        stopPromptingRules: [
            "Stop after two Lovable.dev attempts at the same bug or invisible change.",
            "Stop immediately when build, runtime, routing, Git sync, auth, data, or TypeScript errors appear.",
            "Stop before broad prompts if GitHub/local changes are uncommitted or source of truth is unclear.",
            "Stop when the requested change needs exact code behavior rather than UI/product exploration.",
        ],
        recommendedToolOrder: [
            "lovable_credit_smart_plan",
            "lovable_prompt_sequence",
            "lovable_credit_risk_audit",
            "lovable_make_prompt or lovable_build_url",
            "lovable_connect_github_repo",
            "lovable_visible_result_check",
            "lovable_stop_prompting_check",
            "lovable_repo_doctor",
            "lovable_project_memory",
        ],
        lovablePromptDraft: promptDraft,
    };
}
function makePromptSequence(params) {
    const projectName = params.projectName ?? params.plan?.projectName ?? "Lovable.dev project";
    const maxLovablePrompts = Math.max(1, Math.min(params.maxLovablePrompts ?? 3, 5));
    const roughIdea = params.roughIdea ?? params.plan?.planningGoal ?? "Build the app shell from the approved ClawKit plan.";
    const basePrompt = params.plan?.lovablePromptDraft ?? [
        `Build ${projectName} in Lovable.dev.`,
        "",
        "Product idea:",
        roughIdea,
        "",
        "Focus Lovable.dev on UI/product shape. OpenClaw will handle exact code, tests, GitHub, refactoring, and production hardening.",
    ].join("\n");
    const sequence = [
        {
            step: 1,
            goal: "Create the first usable app shell without overbuilding.",
            prompt: basePrompt,
            expectedEvidence: [
                "Preview opens without a blank screen.",
                "Primary screens and navigation are visible.",
                "The main workflow can be demonstrated with safe sample data.",
            ],
            stopAfter: [
                "Stop if the app fails to render, throws runtime errors, or misses the main workflow.",
                "Stop and sync/export to GitHub before exact engineering starts.",
            ],
        },
        {
            step: 2,
            goal: "Make one focused UI/product improvement from visible evidence.",
            prompt: [
                `Improve the existing ${projectName} Lovable.dev app with one focused UI/product pass.`,
                "Preserve approved screens, navigation, data model assumptions, and working behavior.",
                "Only change the specific visual hierarchy, layout, responsive, empty-state, or workflow issues observed in screenshots/browser evidence.",
                "Do not attempt deep backend logic, auth, billing, tests, CI, or broad rewrites.",
            ].join("\n"),
            expectedEvidence: [
                "Before/after screenshot or browser observation shows the requested change.",
                "No approved behavior disappeared.",
                "OpenClaw can identify the generated diff in GitHub.",
            ],
            stopAfter: [
                "Stop if Lovable.dev claims completion but the change is not visible.",
                "Stop if GitHub sync state becomes unclear.",
            ],
        },
        {
            step: 3,
            goal: "Final narrow polish pass, then hand off to OpenClaw/GitHub.",
            prompt: [
                `Apply a final narrow polish pass to ${projectName}.`,
                "Keep all approved product behavior intact.",
                "Only address named visual polish issues, spacing, responsiveness, empty/loading/error states, and microcopy.",
                "Prepare the project for GitHub handoff so OpenClaw can refactor, test, secure, and ship.",
            ].join("\n"),
            expectedEvidence: [
                "Visible polish issues are fixed.",
                "The app remains usable on mobile and desktop.",
                "The repo is ready for OpenClaw verification and PR work.",
            ],
            stopAfter: [
                "Stop prompting Lovable.dev and move to OpenClaw engineering.",
                "Run visible-result verification and repo doctor before any more product prompts.",
            ],
        },
    ].slice(0, maxLovablePrompts);
    return {
        projectName,
        maxLovablePrompts,
        sequence,
        afterSequence: [
            ...(params.includeGitHubHandoff === false ? [] : ["Connect/sync/export to GitHub and make GitHub the source of truth."]),
            "Run `lovable_visible_result_check` and `lovable_repo_doctor`.",
            "Use OpenClaw for maintainability refactors, exact logic, tests, CI, security, and PR preparation.",
            "Only return to Lovable.dev with a new `lovable_credit_risk_audit` when the requested work is clearly UI/product exploration.",
        ],
    };
}
function makeCreditRiskAudit(params) {
    const projectName = params.projectName ?? "Lovable.dev project";
    const proposedPrompt = (params.proposedPrompt ?? "").toLowerCase();
    const plannedFeatures = asList(params.plannedFeatures, []);
    const integrations = asList(params.integrations, []);
    const knownBugs = asList(params.existingKnownBugs, []);
    const exactEngineeringSignals = [
        "typescript",
        "runtime",
        "test",
        "ci",
        "auth",
        "billing",
        "webhook",
        "migration",
        "database",
        "security",
        "refactor",
        "github",
        "api key",
    ];
    const promptHasExactSignals = exactEngineeringSignals.some((signal) => proposedPrompt.includes(signal));
    const blockers = [
        ...(params.hasFailingBuild ? ["Current build is failing."] : []),
        ...(params.hasRuntimeErrors ? ["Runtime or console errors are present."] : []),
        ...(params.hasInvisibleChanges ? ["Lovable.dev changes are not visibly appearing."] : []),
        ...(knownBugs.length ? knownBugs.map((bug) => `Known bug: ${bug}`) : []),
    ];
    const hasRepo = Boolean(params.hasGitHubRepo || params.hasLocalRepo);
    const riskScore = blockers.length +
        (promptHasExactSignals ? 2 : 0) +
        (integrations.length > 0 ? 1 : 0) +
        (params.creditSensitivity === "high" ? 1 : 0) +
        (!hasRepo ? 1 : 0);
    const riskLevel = riskScore >= 4 ? "high" : riskScore >= 2 ? "medium" : "low";
    const shouldUseLovableDev = riskLevel === "low" && !promptHasExactSignals && blockers.length === 0;
    return {
        projectName,
        riskLevel,
        shouldUseLovableDev,
        likelyCreditWastes: [
            ...blockers,
            ...(promptHasExactSignals ? ["The proposed prompt asks Lovable.dev for exact engineering work better handled by OpenClaw."] : []),
            ...(integrations.length ? integrations.map((item) => `Integration risk: ${item} should be stubbed in Lovable.dev and implemented/tested in code.`) : []),
            ...(!hasRepo ? ["No confirmed GitHub/local repo handoff, so repeated Lovable.dev prompting may hide source-of-truth problems."] : []),
            ...(plannedFeatures.length > 5 ? ["The planned feature list is broad; split it into one Lovable.dev UI pass plus OpenClaw engineering tasks."] : []),
        ],
        useOpenClawInsteadFor: [
            "Build/runtime/typecheck/test failures.",
            "GitHub sync, branch, PR, and source-of-truth work.",
            "Architecture, refactoring, maintainability, reusable components, and exact business logic.",
            "Production auth, billing, integrations, API keys, migrations, webhooks, CI, and security.",
        ],
        promptTighteningRules: [
            "Ask Lovable.dev for one visible UI/product outcome at a time.",
            "Tell Lovable.dev what to preserve and what not to touch.",
            "Use placeholders for risky integrations until OpenClaw handles real implementation.",
            "Require visible acceptance criteria before another Lovable.dev prompt.",
            "Avoid asking Lovable.dev to fix the same invisible or code-level issue repeatedly.",
        ],
        nextAction: shouldUseLovableDev
            ? "Proceed with a narrow Lovable.dev prompt, then verify the visible result and GitHub diff."
            : "Do not spend more Lovable.dev credits yet. Switch to OpenClaw verification, repo inspection, or code repair first.",
    };
}
function makeStopPromptingCheck(params) {
    const projectName = params.projectName ?? "Lovable.dev project";
    const attemptedPrompts = params.attemptedPrompts ?? 0;
    const reasons = [
        ...(attemptedPrompts >= 2 && params.sameIssueRepeated ? ["The same issue has already consumed multiple Lovable.dev prompts."] : []),
        ...(params.hasFailingBuild ? ["The app has a failing build, which should be fixed with OpenClaw code tools."] : []),
        ...(params.hasRuntimeErrors ? ["Runtime errors need diagnosis in browser/code, not another broad prompt."] : []),
        ...(params.hasInvisibleChanges ? ["The visible result does not match Lovable.dev's claimed completion."] : []),
        ...(params.needsArchitectureRefactor ? ["The next work is maintainability/refactoring, which belongs in OpenClaw/GitHub."] : []),
        ...(params.userStillUnsatisfied && attemptedPrompts >= 3 ? ["The user remains unsatisfied after several prompts, so the strategy needs evidence and repair, not more prompting."] : []),
    ];
    const hasRepo = Boolean(params.hasGitHubRepo || params.hasLocalRepo);
    const shouldStopPrompting = reasons.length > 0 || attemptedPrompts >= 4;
    return {
        projectName,
        shouldStopPrompting,
        reason: shouldStopPrompting
            ? reasons.join(" ") || "Lovable.dev prompt count is high enough that OpenClaw should verify and stabilize before continuing."
            : "Another narrow Lovable.dev UI/product prompt may be reasonable if acceptance criteria are clear.",
        switchTo: shouldStopPrompting
            ? [
                "OpenClaw browser verification.",
                "GitHub/local repo inspection.",
                "Build/typecheck/test diagnosis.",
                "Maintainability refactor or exact code fix.",
            ]
            : ["A single narrow Lovable.dev prompt with explicit preservation rules and visible acceptance criteria."],
        openClawNextSteps: [
            ...(hasRepo ? ["Confirm branch, dirty files, and latest Lovable.dev sync state."] : ["Connect or export the Lovable.dev project to GitHub before exact engineering work."]),
            "Run visible-result verification with screenshot/browser evidence.",
            "Inspect build/runtime errors and fix them directly in code.",
            "Refactor fragile generated code only as much as needed to make the requested change stable.",
            "Update project memory and decision log before any later Lovable.dev prompt.",
        ],
        evidenceBeforeAnotherPrompt: [
            "Clean or intentionally documented Git state.",
            "Build/runtime status.",
            "Browser or screenshot proof of current behavior.",
            "A one-screen or one-workflow prompt with preserve/change/avoid sections.",
            "A clear reason Lovable.dev is the best tool for the next step.",
        ],
    };
}
function estimateUserStress(message, explicit) {
    if (explicit) {
        return explicit;
    }
    const text = (message ?? "").toLowerCase();
    const strongSignals = ["angry", "frustrated", "terrible", "useless", "again", "broken", "not working", "waste"];
    const hits = strongSignals.filter((signal) => text.includes(signal)).length;
    const exclamations = (message?.match(/!/g) ?? []).length;
    const score = hits * 2 + exclamations;
    return score >= 7 ? "critical" : score >= 4 ? "heated" : score >= 1 ? "focused" : "calm";
}
function makeWorkflowState(params) {
    const projectName = params.projectName ?? "Lovable.dev project";
    const goal = (params.userGoal ?? "").toLowerCase();
    const userStress = estimateUserStress(params.userMessage ?? params.userGoal, params.userStress);
    const hasRepo = Boolean(params.hasGithubRepo || params.hasLocalRepo);
    const hasHardFailure = Boolean(params.hasFailingBuild || params.hasRuntimeErrors);
    const repeatedPromptRisk = Boolean((params.attemptedLovablePrompts ?? 0) >= 2 && params.sameIssueRepeated);
    const mode = params.readyForPr
        ? "ship"
        : params.hasFailingBuild || params.hasRuntimeErrors || params.hasInvisibleChanges || goal.includes("rescue") || goal.includes("fix")
            ? "rescue"
            : params.needsArchitectureRefactor || goal.includes("refactor") || goal.includes("maintain")
                ? "harden"
                : params.hasExistingApp || params.hasLovableProjectUrl || hasRepo
                    ? "improve"
                    : params.userGoal
                        ? "new-build"
                        : "unknown";
    const sourceOfTruth = params.hasLocalRepo ? "local-repo" : params.hasGithubRepo ? "github" : params.hasLovableProjectUrl ? "lovable.dev" : "unknown";
    const appStatus = params.readyForPr
        ? "ready-for-pr"
        : params.hasInvisibleChanges
            ? "invisible-change"
            : hasHardFailure
                ? "broken"
                : params.needsArchitectureRefactor
                    ? "needs-refactor"
                    : params.hasExistingApp || params.hasLovableProjectUrl || hasRepo
                        ? "generated"
                        : params.userGoal
                            ? "idea"
                            : "ready-for-verification";
    const repoStatus = params.hasDirtyGitState
        ? "dirty"
        : params.hasLocalRepo
            ? "local-repo-known"
            : params.hasGithubRepo
                ? "repo-url-known"
                : params.hasExistingApp || params.hasLovableProjectUrl
                    ? "none"
                    : "unknown";
    const creditRisk = params.budgetSensitivity === "high" || repeatedPromptRisk || hasHardFailure || params.hasInvisibleChanges
        ? "high"
        : params.budgetSensitivity === "medium" || params.needsArchitectureRefactor || !hasRepo
            ? "medium"
            : "low";
    const missingInfo = [
        ...(!params.userGoal ? ["User goal or desired visible outcome."] : []),
        ...(!params.hasLovableProjectUrl && mode !== "new-build" ? ["Lovable.dev project or preview URL."] : []),
        ...(!hasRepo && mode !== "new-build" ? ["GitHub repo URL or local repo path."] : []),
        ...(mode === "rescue" && !params.hasInvisibleChanges && !hasHardFailure ? ["Observed failure: blank screen, runtime error, failed build, or missing visible change."] : []),
    ];
    return {
        projectName,
        mode,
        sourceOfTruth,
        appStatus,
        repoStatus,
        creditRisk,
        userStress,
        currentBlocker: params.hasFailingBuild
            ? "Build is failing."
            : params.hasRuntimeErrors
                ? "Runtime or console errors are blocking the app."
                : params.hasInvisibleChanges
                    ? "Lovable.dev claimed a change but the screen does not show it."
                    : params.hasDirtyGitState
                        ? "Git state is dirty; avoid broad Lovable.dev prompts."
                        : !hasRepo && mode !== "new-build"
                            ? "GitHub/source-of-truth handoff is missing."
                            : "No hard blocker recorded yet.",
        nextBestAction: mode === "new-build"
            ? "Create a credit-smart plan, then a short Lovable.dev prompt sequence."
            : mode === "rescue"
                ? "Verify the visible result and inspect GitHub/local repo evidence before prompting Lovable.dev again."
                : mode === "harden"
                    ? "Use OpenClaw/GitHub for maintainability refactor, tests, and architecture cleanup."
                    : mode === "ship"
                        ? "Prepare PR summary with verification evidence and residual risks."
                        : mode === "improve"
                            ? "Run a credit-risk audit, then choose a narrow Lovable.dev UI pass or OpenClaw code work."
                            : "Orient the user and ask for the minimum project facts.",
        knownFacts: asList(params.knownFacts, [
            `Mode: ${mode}.`,
            `Source of truth: ${sourceOfTruth}.`,
            `App status: ${appStatus}.`,
            `Repo status: ${repoStatus}.`,
            `Credit risk: ${creditRisk}.`,
        ]),
        missingInfo,
    };
}
function makeStudioBrain(params) {
    const workflowState = makeWorkflowState(params);
    const mode = workflowState.mode === "new-build"
        ? "start"
        : workflowState.mode === "rescue"
            ? "rescue"
            : workflowState.mode === "harden"
                ? "harden"
                : workflowState.mode === "ship"
                    ? "ship"
                    : workflowState.mode === "improve"
                        ? "improve"
                        : "orient-user";
    const needsMood = workflowState.userStress === "heated" || workflowState.userStress === "critical";
    const needsRepo = workflowState.sourceOfTruth === "unknown" && mode !== "start";
    const stopPrompting = workflowState.creditRisk === "high" || params.hasFailingBuild || params.hasRuntimeErrors || params.hasInvisibleChanges || params.sameIssueRepeated;
    const recommendedToolOrder = [
        ...(needsMood ? ["lovable_mood_indicator"] : []),
        "lovable_studio_brain",
        ...(params.wantsModelChoice ? ["lovable_model_strategy"] : []),
        ...(mode === "orient-user" ? ["lovable_user_onboarding", "lovable_starter_guide"] : []),
        ...(mode === "start" ? ["lovable_credit_smart_plan", "lovable_prompt_sequence", "lovable_credit_risk_audit", "lovable_make_prompt"] : []),
        ...(params.wantsBrowserOpen && mode === "start" ? ["lovable_build_url or lovable_open_build_url"] : []),
        ...(mode === "rescue" ? ["lovable_stop_prompting_check", "lovable_visible_result_check", "lovable_connect_github_repo", "lovable_repo_doctor", "lovable_rescue_plan"] : []),
        ...(mode === "improve" ? ["lovable_credit_risk_audit", "lovable_next_action_plan", "lovable_sync_risk_report", "lovable_iteration_brief or OpenClaw code tools"] : []),
        ...(mode === "harden" ? ["lovable_repo_doctor", "lovable_sync_risk_report", "OpenClaw code tools", "lovable_visible_result_check"] : []),
        ...(mode === "ship" ? ["lovable_project_readiness", "lovable_visible_result_check", "lovable_pr_summary"] : []),
        "lovable_project_memory",
        "lovable_decision_log",
    ];
    return {
        projectName: workflowState.projectName,
        mode,
        confidence: workflowState.missingInfo.length > 2 ? "low" : workflowState.missingInfo.length ? "medium" : "high",
        userFacingSummary: mode === "start"
            ? "I will turn the idea into a credit-smart Lovable.dev plan before spending prompts, then hand off exact engineering to OpenClaw/GitHub."
            : mode === "rescue"
                ? "I will stop blind Lovable.dev prompting, verify what is actually visible, inspect the repo state, and fix the real blocker with OpenClaw where appropriate."
                : mode === "harden"
                    ? "I will treat the Lovable.dev output as a draft and use OpenClaw/GitHub to make the code cleaner, scalable, testable, and reviewable."
                    : mode === "ship"
                        ? "I will package the work for delivery with verification evidence, screenshots or browser notes, risks, and a PR summary."
                        : mode === "improve"
                            ? "I will decide whether the next improvement belongs in a narrow Lovable.dev UI prompt or in OpenClaw code tools."
                            : "I will ask only for the minimum details, then choose the correct ClawKit for Lovable workflow for the user.",
        nextAction: workflowState.nextBestAction,
        why: stopPrompting
            ? "The situation has high credit-waste risk, so OpenClaw should gather evidence before another Lovable.dev prompt."
            : mode === "start"
                ? "A rough idea is cheapest when planned first, then turned into a small prompt sequence."
                : "The current state determines whether Lovable.dev, GitHub, browser verification, code repair, or PR tooling should lead.",
        recommendedToolOrder,
        askUserFor: [
            ...workflowState.missingInfo,
            ...(params.wantsModelChoice ? ["Preferred OpenClaw model/profile, if the user cares."] : []),
            ...(params.wantsBrowserOpen === undefined ? ["Whether OpenClaw should open Lovable.dev in the browser or only prepare links."] : []),
        ],
        useLovableDevFor: [
            "New app shell, screen structure, visual direction, responsive layout, and narrow UI/product iteration.",
            "Subjective polish when the repo is safe and visible-result acceptance criteria are clear.",
        ],
        useOpenClawFor: [
            "Choosing the workflow, preserving project memory, and asking for missing facts.",
            "GitHub/source-of-truth handoff, build/runtime diagnosis, exact code changes, tests, security, refactoring, and PR delivery.",
            "Stopping Lovable.dev prompt loops when the same issue repeats or evidence is missing.",
        ],
        stopConditions: [
            "Stop before another broad Lovable.dev prompt if build/runtime errors, invisible changes, dirty Git state, or repeated failed prompts exist.",
            "Stop before destructive Git operations, production deploys, billing, secrets, or public publishing without explicit approval.",
            "Stop and ask the user when the desired visible result or source of truth is unclear.",
        ],
        evidenceNeeded: [
            "User goal and expected visible result.",
            "Lovable.dev project or preview URL when an app already exists.",
            "GitHub repo URL or local repo path before exact engineering work.",
            "Build/typecheck/test result when implementation changed.",
            "Browser or screenshot evidence before accepting completion.",
        ],
        workflowState,
    };
}
function makeUserOnboarding(params) {
    const level = params.userLevel ?? "beginner";
    const goal = params.goal ?? "build or rescue a Lovable.dev app";
    const existing = params.hasExistingApp === true;
    return {
        headline: "ClawKit for Lovable Brain lets you describe the outcome in plain language; OpenClaw chooses the Lovable.dev, GitHub, verification, or code workflow.",
        shortestPath: existing
            ? [
                "Tell OpenClaw what is broken or what should change.",
                "Provide the Lovable.dev URL and GitHub repo if available.",
                "Let ClawKit for Lovable verify the visible result before spending more Lovable.dev credits.",
                "Move exact fixes, refactors, tests, and PR work into OpenClaw/GitHub.",
            ]
            : [
                "Describe the app idea roughly.",
                "Let ClawKit for Lovable create a credit-smart plan before prompting Lovable.dev.",
                "Generate a short prompt sequence with evidence gates.",
                "Sync/export to GitHub when the product shape is clear.",
            ],
        askOnlyThisFirst: [
            `User level: ${level}.`,
            `Goal: ${goal}.`,
            existing ? "What is the Lovable.dev project/preview URL?" : "What is the rough app idea?",
            "Is there a GitHub repo already?",
            "Should OpenClaw open Lovable.dev in the browser, or only prepare links?",
            "Are you trying to save credits aggressively?",
        ],
        userCanSay: [
            "Build this properly with Lovable.dev and do not waste my credits.",
            "Rescue this Lovable.dev app and make it production-ready.",
            "Lovable.dev says it worked, but I cannot see the change.",
            "Turn this rough idea into a plan first, then tell me what to prompt.",
            "Check whether this should go to Lovable.dev or be fixed in code.",
        ],
        choices: [
            "New build, rescue, improve, harden, ship, or OpenClaw Inside.",
            "Browser opening: prepare link only, or open Lovable.dev after approval.",
            "Budget sensitivity: normal, careful, or very credit-conscious.",
            "Model/profile preference if OpenClaw has multiple configured models.",
        ],
        reassuringRules: [
            "The user does not need to know tool names.",
            "Lovable.dev is used for UI/product speed, not every engineering task.",
            "ClawKit for Lovable should stop prompt loops before they waste credits.",
            "OpenClaw verifies visible results before accepting done.",
            "GitHub becomes the durable source of truth for serious work.",
        ],
        nextPrompt: params.wantsFastStart
            ? "Tell me the app idea or existing problem, and I will choose the safest ClawKit for Lovable workflow."
            : "Tell me whether this is a new app or an existing Lovable.dev project, what outcome you want, and whether you already have a GitHub repo.",
    };
}
function makeBuildUrl(prompt) {
    const encoded = encodeURIComponent(prompt);
    return `https://lovable.dev/?autosubmit=true#prompt=${encoded}`;
}
function makePrompt(params) {
    const pages = asList(params.pages, [
        "Landing or main workspace",
        "Primary product workflow",
        "Settings or account area",
    ]);
    const criteria = asList(params.acceptanceCriteria, [
        "Responsive on mobile and desktop",
        "Polished first-run empty states",
        "Accessible labels and clear loading/error states",
        "No placeholder copy that looks unfinished",
    ]);
    return [
        `Build ${params.productName ? `"${params.productName}"` : "this product"} in Lovable.`,
        "",
        "Product goal:",
        params.idea,
        "",
        "Target audience:",
        params.audience ?? "Users who need a polished, production-minded app rather than a throwaway prototype.",
        "",
        "Use Lovable for:",
        "- UI structure, visual hierarchy, responsive layout, interaction states, and product polish.",
        "- First-pass app scaffolding that can later be exported or synced to GitHub.",
        "",
        "Do not over-focus Lovable on:",
        "- Deep backend correctness, complex business logic, CI, security hardening, or test strategy. OpenClaw will handle those in GitHub after the UI pass.",
        "",
        "Pages and views:",
        ...pages.map((page) => `- ${page}`),
        "",
        "Data model or key objects:",
        ...(params.dataModel?.length ? params.dataModel.map((item) => `- ${item}`) : ["- Infer a simple model from the product goal and keep it easy to evolve in code."]),
        "",
        "Integrations:",
        ...(params.integrations?.length ? params.integrations.map((item) => `- ${item}`) : ["- Add integration placeholders only when needed; avoid fake secrets or irreversible setup."]),
        "",
        "Design direction:",
        params.designDirection ?? "Modern, focused, credible SaaS/product UI. Prioritize clarity, density where useful, tasteful contrast, and real workflow ergonomics.",
        "",
        "Acceptance criteria:",
        ...criteria.map((criterion) => `- ${criterion}`),
        "",
        "GitHub handoff:",
        params.githubMode ??
            "Structure the project so OpenClaw can export or sync it to GitHub, inspect the generated code, add tests, implement exact logic, and open a PR.",
    ].join("\n");
}
function decideRoute(params) {
    const useLovableFor = [
        "Generate or reshape UI screens from the product brief.",
        "Create rapid product scaffolds, navigation, empty states, and responsive layout.",
        "Apply subjective visual/product polish from screenshots or feedback.",
    ];
    const useOpenClawFor = [
        "Inspect the repository, run builds/tests, and fix exact TypeScript/runtime failures.",
        "Refactor Lovable-generated code into clean modules, stable boundaries, maintainable state flow, and reusable components.",
        "Implement business logic, APIs, migrations, auth rules, security checks, and CI.",
        "Review generated code before merge or deployment.",
    ];
    const useGithubFor = [
        "Keep the repository as the source of truth.",
        "Create branches, commits, pull requests, reviews, and release notes.",
        "Preserve diffs between Lovable-generated UI changes and OpenClaw-coded changes.",
    ];
    const nextSteps = params.repoExists
        ? [
            "Inspect the GitHub repository and current branch.",
            "Use Lovable only for product/UI deltas that are faster to express visually.",
            "Run a maintainability pass on generated code before treating the project as production-ready.",
            "Apply exact engineering changes locally, run verification, then open or update a PR.",
        ]
        : [
            "Use Lovable to create the first app shell from a structured prompt.",
            "Export or sync the Lovable project to GitHub.",
            "Clone the repository locally, run verification, refactor generated code, and harden the implementation.",
        ];
    const risks = [
        "Do not send secrets, private customer data, or production credentials to Lovable prompts.",
        "Require explicit approval before publishing, connecting billing, overwriting production branches, or destructive GitHub operations.",
    ];
    if (params.hasDeploymentRisk) {
        risks.push("Treat deployment and public publishing as approval-gated actions.");
    }
    return { useLovableFor, useOpenClawFor, useGithubFor, nextSteps, risks };
}
function makeOpenClawIntegrationPlan(params) {
    const appName = params.appName ?? "the app";
    const capabilities = asList(params.desiredCapabilities, [
        "In-app assistant for explaining screens, data, and workflows",
        "Drafting actions for the user to review before execution",
        "Project/admin automation routed through OpenClaw with approval",
    ]);
    const roles = asList(params.userRoles, ["admin", "member"]);
    const sensitivity = params.dataSensitivity ?? "medium";
    const allowAutonomousActions = params.allowAutonomousActions === true;
    const recommendation = sensitivity === "high" && allowAutonomousActions ? "defer" : "integrate";
    const actionMode = allowAutonomousActions
        ? "approval-gated autonomous actions"
        : "user-reviewed suggestions and drafts";
    return {
        appName,
        recommendation,
        integrationPattern: "OpenClaw Inside: the app talks to a backend-owned OpenClaw gateway adapter, never directly from the browser to privileged OpenClaw tools.",
        userFacingCapabilities: capabilities,
        architecture: [
            "Frontend renders an optional assistant panel, command palette, or workflow copilot.",
            "Frontend sends user intent to the app backend with the active user/session context.",
            "Backend validates auth, role, tenant, rate limits, and allowed action scope.",
            "Backend calls an OpenClaw gateway/webhook adapter with a narrow task envelope.",
            "OpenClaw performs only the approved task class and returns a structured result.",
            "App stores an audit event for every request, approval, tool call class, and result.",
        ],
        requiredBackendEndpoints: [
            "POST /api/openclaw/sessions to create a scoped assistant session",
            "POST /api/openclaw/messages to send user-approved requests",
            "POST /api/openclaw/approvals to approve or reject proposed actions",
            "GET /api/openclaw/audit to show assistant activity to authorized users",
        ],
        permissionModel: [
            `Map app roles (${roles.join(", ")}) to explicit OpenClaw scopes.`,
            "Default to read-only or draft-only capability for non-admin users.",
            "Require server-side policy checks before every OpenClaw request.",
            "Never expose OpenClaw API keys, gateway tokens, filesystem paths, or tool credentials to the browser.",
        ],
        safetyControls: [
            "Human approval for external sends, deletes, purchases, production deploys, billing, and data exports.",
            "Prompt and attachment redaction before sending sensitive data to OpenClaw.",
            "Tenant isolation and per-user rate limits.",
            "Audit log with request, actor, scope, approval state, and final result.",
            "Kill switch to disable OpenClaw features without redeploying the app.",
        ],
        implementationSteps: [
            "Ask Lovable to create only the assistant UI surfaces and non-privileged interaction states.",
            "Export/sync to GitHub.",
            "Use OpenClaw code tools to implement the backend adapter, auth checks, schemas, tests, and audit log.",
            "Run `lovable_repo_doctor` and the app verification commands.",
            "Open a PR that separates Lovable UI work from OpenClaw integration code.",
        ],
        lovablePromptAddendum: [
            `Add an optional OpenClaw assistant experience to ${appName}.`,
            "Build only the UI: assistant panel, message states, approval cards, audit timeline, disabled/error states, and role-aware navigation.",
            "Do not add real secrets, gateway credentials, privileged browser calls, or fake production automation.",
            `Assume backend endpoints will support ${actionMode}; OpenClaw will implement those endpoints and security checks in GitHub after this UI pass.`,
        ].join("\n"),
        openClawEngineeringTasks: [
            "Design backend request/response schemas for scoped OpenClaw sessions.",
            "Implement server-side gateway/webhook adapter.",
            "Add role checks, tenant isolation, rate limits, and audit persistence.",
            "Add tests for authorization failures, approval-required actions, and redaction.",
            "Document deployment variables and operational kill switch.",
        ],
        risks: [
            "A browser-only integration would leak authority and should not be used.",
            "Autonomous actions must be approval-gated until the app has mature policy and audit controls.",
            "High-sensitivity data may require redaction, self-hosting, or a deferred integration.",
        ],
    };
}
function makeVisibleResultCheck(params) {
    const findings = [];
    const requiredChecks = [
        "Run install/build/typecheck/test checks from `lovable_repo_doctor`.",
        "Open the preview or local dev server in a browser.",
        "Compare visible UI against each expected change.",
        "Check browser console and network errors.",
        "Capture before/after screenshots for the PR when possible.",
    ];
    const consoleErrors = params.consoleErrors ?? [];
    const observations = params.screenshotObservations ?? [];
    if (params.buildPassed === false) {
        findings.push("Build or verification did not pass, so the visible result cannot be trusted.");
    }
    if (!params.previewUrl) {
        findings.push("No preview URL was provided for visual confirmation.");
    }
    if (observations.length === 0) {
        findings.push("No screenshot/browser observations were provided.");
    }
    if (consoleErrors.length > 0) {
        findings.push(`${consoleErrors.length} browser console error(s) were reported.`);
    }
    const missingExpected = params.expectedChanges.filter((change) => {
        const normalized = change.toLowerCase();
        return !observations.some((observation) => observation.toLowerCase().includes(normalized));
    });
    if (observations.length > 0 && missingExpected.length > 0) {
        findings.push(`${missingExpected.length} expected change(s) were not confirmed as visible.`);
    }
    const status = params.buildPassed === false
        ? "blocked-by-build"
        : observations.length === 0 || !params.previewUrl
            ? "needs-browser-check"
            : missingExpected.length > 0 || consoleErrors.length > 0
                ? "not-visible"
                : "verified";
    return {
        status,
        confidence: status === "verified" ? "high" : observations.length > 0 ? "medium" : "low",
        findings: findings.length ? findings : ["Expected changes were confirmed by the provided visible-result observations."],
        requiredChecks,
        likelyCauses: status === "verified"
            ? []
            : [
                "Lovable generated code that does not compile.",
                "Runtime error prevents the changed route or component from rendering.",
                "The change landed on a different route, branch, or preview than the one being inspected.",
                "CSS/layout state hides the new element on the current viewport.",
                "Data/auth/loading state prevents the UI from reaching the expected screen.",
            ],
        nextSteps: status === "verified"
            ? [
                "Record screenshots or preview link in the PR summary.",
                "Proceed to code hardening and maintainability review.",
            ]
            : [
                "Do not accept Lovable's completion claim yet.",
                "Use browser inspection or screenshots to identify what is actually visible.",
                "Fix build/runtime errors with OpenClaw code tools.",
                "If the issue is visual/product mismatch, send a narrow `lovable_iteration_brief`.",
                "Re-run this visible-result check before PR or delivery.",
            ],
    };
}
function makeModelStrategy(params) {
    const available = params.availableModels?.length ? params.availableModels : ["Use models configured in OpenClaw"];
    const taskType = params.taskType ?? "coding";
    const cost = params.costSensitivity ?? "medium";
    return {
        canUserChooseModel: true,
        recommendation: "Let the user choose an OpenClaw model/profile when OpenClaw supports that model in their config. The plugin should guide model choice by task role, but actual model availability belongs to the user's OpenClaw setup.",
        roles: {
            productPlanner: "Use a strong reasoning model for product requirements, routing, and delivery planning.",
            lovablePrompter: "Use a strong writing/reasoning model that produces structured, concise Lovable prompts.",
            codeImplementer: "Use the best coding model available for refactors, tests, integrations, and bug fixes.",
            reviewer: "Use a strong reasoning/coding model for PR review, security, and maintainability checks.",
            fastIteration: "Use a cheaper/faster model for small copy, naming, and low-risk UI prompt tweaks.",
        },
        selectionGuidance: [
            `Current task type: ${taskType}.`,
            `Cost sensitivity: ${cost}.`,
            `Available model hints: ${available.join(", ")}.`,
            params.userPreference
                ? `User preference: ${params.userPreference}. Respect it unless it is unavailable or unsafe for the task.`
                : "Ask the user for a preferred model/profile when the task is expensive, risky, or long-running.",
        ],
        configNotes: [
            "This plugin does not bundle or resell LLM access.",
            "Model choice should use OpenClaw's existing model/provider configuration.",
            "A future version can add a model-routing hook if the host exposes a stable per-tool override for external plugins.",
        ],
        fallbackPolicy: [
            "If no preference is given, use the user's default OpenClaw model.",
            "Escalate to the strongest configured coding/reasoning model for debugging, security, refactoring, and PR review.",
            "Use a fast/low-cost model only for reversible planning, copy, and simple prompt drafts.",
        ],
    };
}
function makeStarterGuide(params) {
    const level = params.userLevel ?? "beginner";
    const goal = params.goal ?? "build a useful app with Lovable and OpenClaw";
    return {
        headline: "ClawKit for Lovable turns Lovable into one tool inside a guided app-building framework.",
        whatThisDoes: [
            "Helps you decide what Lovable should do and what OpenClaw should do.",
            "Creates better Lovable prompts from rough ideas.",
            "Checks whether Lovable's result actually appears on screen.",
            "Moves the project into GitHub so code can be cleaned, tested, and reviewed.",
            "Can plan optional OpenClaw-powered features inside your app.",
            "Improves continuously from constructive feedback on real Lovable workflows.",
        ],
        bestFirstChoices: [
            "Start from a new app idea.",
            "Rescue an existing Lovable app that is broken, messy, or hard to extend.",
            "Improve an existing Lovable/GitHub project.",
            "Fix a Lovable app that says it is done but does not visibly work.",
            "Add OpenClaw Inside as an optional assistant feature.",
        ],
        exampleRequests: [
            "Build a polished CRM. Use Lovable for UI, then harden the code in GitHub.",
            "Rescue my existing Lovable app. It builds in Lovable but the dashboard is blank.",
            "Check this Lovable repo and tell me if it is safe to prompt Lovable again.",
            "Lovable says it added the dashboard, but I cannot see it. Verify and fix the real issue.",
            "Add an optional OpenClaw assistant panel to this app, but design it safely.",
            "Create a PR summary separating Lovable UI work from OpenClaw engineering work.",
        ],
        workflow: [
            "1. Choose a goal.",
            "2. Generate or refine the Lovable prompt.",
            "3. Optionally open Lovable in the browser.",
            "4. Sync/export to GitHub.",
            "5. Run Sync Doctor and visible-result checks.",
            "6. For existing apps, run Rescue mode before broad Lovable prompting.",
            "7. Let OpenClaw refactor, test, debug, and prepare the PR.",
        ],
        userDecisions: [
            `User level: ${level}.`,
            `Goal: ${goal}.`,
            "Choose whether OpenClaw may open Lovable in the browser or only return links.",
            "Choose preferred LLM/model profile if your OpenClaw setup has multiple models.",
            "Choose whether OpenClaw Inside should be included in the app.",
        ],
        guardrails: [
            "ClawKit is an early public release. It is useful today and will improve quickly from real feedback.",
            "Never trust 'done' until build and visible-screen checks pass.",
            "Never ship raw Lovable code without a maintainability pass.",
            "Never send secrets or private production data to Lovable prompts.",
            "Require approval for publishing, billing, production writes, and destructive operations.",
        ],
        nextPrompt: "Tell me your app idea, whether this is a new or existing project, and whether you want OpenClaw to open Lovable or only prepare links.",
    };
}
function makeMoodIndicator(params) {
    const message = params.userMessage.toLowerCase();
    const exclamationCount = (params.userMessage.match(/!/g) ?? []).length;
    const allCapsWords = params.userMessage.split(/\s+/).filter((word) => /^[A-Z]{3,}$/.test(word)).length;
    const strongWords = [
        "wrong",
        "broken",
        "useless",
        "stupid",
        "annoying",
        "frustrated",
        "angry",
        "again",
        "listen",
        "terrible",
        "hate",
        "not what i asked",
    ];
    const strongWordHits = strongWords.filter((word) => message.includes(word)).length;
    const score = exclamationCount + allCapsWords + strongWordHits * 2 + (params.recentFailure ? 2 : 0) + (params.agentMistake ? 2 : 0);
    const intensity = score >= 8 ? "critical" : score >= 5 ? "heated" : score >= 2 ? "focused" : "calm";
    const moodByIntensity = {
        calm: "Sunny Build Mode",
        focused: "Raised Eyebrow Debug Mode",
        heated: "Keyboard Steam Mode",
        critical: "Red Alert, But Make It Useful",
    };
    const humorByIntensity = {
        calm: "The vibes are passing typecheck.",
        focused: "The vibe linter found a few sharp edges, but nothing we cannot format.",
        heated: "The frustration gauge has entered hot-reload territory.",
        critical: "The build is emotionally failing CI. Time to stop improvising and produce evidence.",
    };
    const stage = params.taskStage ?? "verification";
    return {
        mood: moodByIntensity[intensity],
        intensity,
        humor: humorByIntensity[intensity],
        userCareNote: intensity === "calm"
            ? "Keep the user oriented and continue with concise progress."
            : "Acknowledge the friction plainly, reduce chatter, and move to concrete verification and repair.",
        agentSelfHealingNotes: [
            params.agentMistake
                ? `Likely agent mistake to correct: ${params.agentMistake}.`
                : "Identify whether the agent misunderstood the request, skipped verification, or trusted a tool claim too early.",
            params.recentFailure
                ? `Recent failure to account for: ${params.recentFailure}.`
                : "Ask what observable result the user expected if it is still ambiguous.",
            "Restate the target outcome in one sentence before changing more code or prompting Lovable again.",
            "Prefer evidence: repo status, build output, browser/screenshot observation, console errors, and exact file diffs.",
            "If Lovable claimed success but the UI is not visible, run `lovable_visible_result_check` and fix the real blocker.",
            "Do not defend the previous answer. Convert the complaint into a better next action.",
        ],
        betterNextResponse: [
            "Briefly acknowledge the mismatch.",
            "State what will be checked next.",
            "Name the evidence needed to prove the fix.",
            "Make one focused repair loop before asking the user for more input.",
        ],
        deEscalationMoves: intensity === "critical"
            ? [
                "Use shorter updates.",
                "Avoid cleverness except the single mood line.",
                "Do not introduce new scope.",
                "Prioritize visible proof over explanation.",
            ]
            : [
                "Keep a light tone.",
                "Use the mood line as a tiny pressure release.",
                "Then return immediately to the work.",
            ],
        executionRules: [
            `Current stage: ${stage}.`,
            "For planning: produce a sharper plan and confirm assumptions.",
            "For Lovable prompting: make the prompt narrower and include acceptance criteria.",
            "For coding: inspect diffs and run verification before summarizing.",
            "For verification: require build plus visible result evidence.",
            "For delivery: include residual risks and what was actually proven.",
        ],
    };
}
async function makeRescuePlan(params) {
    const repoDoctor = params.repoPath ? await inspectRepo({ ...params, repoPath: params.repoPath }) : null;
    const expectedChanges = asList(params.expectedVisibleChanges, [
        params.userGoal ?? "The app should visibly match the user's requested behavior.",
    ]);
    const visibleResultCheck = makeVisibleResultCheck({
        expectedChanges,
        repoPath: params.repoPath,
        previewUrl: params.previewUrl,
        buildPassed: params.buildPassed,
        screenshotObservations: params.screenshotObservations,
        consoleErrors: params.consoleErrors,
    });
    const problem = params.problemDescription.toLowerCase();
    const consoleErrorCount = params.consoleErrors?.length ?? 0;
    const dirtyFileCount = repoDoctor?.dirtyFiles.length ?? 0;
    const highSignals = visibleResultCheck.status === "blocked-by-build" ||
        consoleErrorCount > 0 ||
        /crash|blank|white screen|not loading|build fail|runtime|broken|database|auth|payment|production/i.test(problem);
    const severity = highSignals ? "high" : dirtyFileCount > 0 ? "medium" : "low";
    return {
        mode: "rescue",
        appName: params.appName ?? repoDoctor?.repoName ?? "Lovable app",
        problemSummary: params.problemDescription,
        severity,
        likelyFailureModes: [
            "Lovable generated code that does not compile or typecheck.",
            "A runtime error prevents the route or component from rendering.",
            "The visible change was generated on a different route, branch, or preview.",
            "State, auth, loading, or data conditions hide the expected UI.",
            "Generated components are too coupled or brittle to extend safely.",
            "GitHub sync or local branch state is masking the latest change.",
        ],
        firstChecks: [
            "Run `lovable_repo_doctor` on the GitHub-synced repo.",
            "Run install, build, typecheck, lint, and tests where available.",
            "Open the preview/local dev server and check console/network errors.",
            "Run `lovable_visible_result_check` against the user's expected visible result.",
            "Inspect the latest Lovable-looking commits and uncommitted local changes.",
        ],
        fixInCode: [
            "Build, typecheck, runtime, routing, auth, data-loading, and integration failures.",
            "Messy generated components that need separation of concerns.",
            "Duplicate code, unclear naming, fragile state flow, and hardcoded fake data.",
            "Tests, CI, security, environment variables, and production-readiness issues.",
        ],
        useLovableFor: [
            "Narrow UI/product iteration after the repo is clean and build/runtime blockers are fixed.",
            "Visual hierarchy, responsive layout, empty states, and interaction polish.",
            "Screen-level redesigns where prompt-driven iteration is faster than manual component edits.",
        ],
        avoidLovableFor: [
            "Fixing exact TypeScript/runtime errors.",
            "Security, auth, billing, migrations, webhooks, or production data behavior.",
            "Broad prompts while the repo has uncommitted work, failing builds, or unclear GitHub sync.",
        ],
        recommendedWorkflow: [
            "Stabilize Git first: create a rescue branch and preserve current work.",
            "Diagnose with repo doctor and visible-result checks.",
            "Fix hard blockers directly in code with OpenClaw.",
            "Refactor brittle Lovable-generated code enough to make the fix maintainable.",
            "Run verification commands and re-check the visible result.",
            "Use Lovable only for a narrow visual pass if the issue is product/UI mismatch.",
            "Open a PR with before/after notes, verification evidence, screenshots, and residual risks.",
        ],
        expectedEvidence: [
            "Clean or intentionally documented Git state.",
            "Build/typecheck/test/lint output where available.",
            "Preview URL or local dev server URL.",
            "Screenshot/browser observation proving the requested UI is visible.",
            "Console/network error status.",
            "PR summary separating Lovable-generated work from OpenClaw rescue fixes.",
        ],
        prSections: [
            "Problem",
            "Diagnosis",
            "Lovable-generated context",
            "OpenClaw rescue fixes",
            "Verification",
            "Screenshots/previews",
            "Remaining risks",
        ],
        repoDoctor,
        visibleResultCheck,
    };
}
export default definePluginEntry({
    id: "clawkit-for-lovable",
    name: "ClawKit for Lovable",
    description: "Plans Lovable.dev work with credit-smart prompts and routes precise engineering through OpenClaw, GitHub, tests, and code tools.",
    register(api) {
        api.registerTool({
            name: "lovable_decide_route",
            label: "Decide Lovable Route",
            description: "Decide whether OpenClaw should use Lovable, GitHub, local code tools, or a combination for a product-building request.",
            parameters: Type.Object({
                request: Type.String({ description: "The user's app-building or change request." }),
                repoExists: Type.Optional(Type.Boolean({ description: "Whether a GitHub repository already exists." })),
                hasVisualWork: Type.Optional(Type.Boolean({ description: "Whether the request includes UI, layout, or visual polish." })),
                hasPreciseCodeWork: Type.Optional(Type.Boolean({ description: "Whether the request needs exact code, tests, APIs, migrations, or debugging." })),
                hasDeploymentRisk: Type.Optional(Type.Boolean({ description: "Whether the task could publish, deploy, charge money, or affect production." })),
            }),
            async execute(_id, params) {
                return jsonText(decideRoute(params));
            },
        });
        api.registerTool({
            name: "lovable_make_prompt",
            label: "Make Lovable Prompt",
            description: "Convert a rough user product idea into a Lovable-ready prompt that focuses Lovable on UI/product generation and leaves exact engineering to OpenClaw.",
            parameters: Type.Object({
                productName: Type.Optional(Type.String()),
                idea: Type.String(),
                audience: Type.Optional(Type.String()),
                pages: optionalStringArray("Pages, workflows, or views Lovable should create."),
                dataModel: optionalStringArray("Important entities or records."),
                integrations: optionalStringArray("Integrations to include or leave placeholders for."),
                designDirection: Type.Optional(Type.String()),
                acceptanceCriteria: optionalStringArray("Concrete success criteria."),
                githubMode: Type.Optional(Type.String({ description: "How Lovable should prepare for GitHub handoff." })),
            }),
            async execute(_id, params) {
                return text(makePrompt(params));
            },
        });
        api.registerTool({
            name: "lovable_credit_smart_plan",
            label: "Create Credit-Smart Plan",
            description: "Turn a rough app idea into a Lovable.dev build plan that reduces wasted credits by separating UI/product prompting from OpenClaw/GitHub engineering work.",
            parameters: Type.Object({
                projectName: Type.Optional(Type.String()),
                roughIdea: Type.String({ description: "The user's rough app idea or product goal." }),
                targetUsers: Type.Optional(Type.String({ description: "Who the app is for." })),
                mustHaveFeatures: optionalStringArray("Features Lovable.dev should include in the first useful app shell."),
                niceToHaveFeatures: optionalStringArray("Features to defer, stub, or handle later."),
                integrations: optionalStringArray("Integrations or external services that may waste credits if built too early."),
                dataObjects: optionalStringArray("Main domain objects or records."),
                designDirection: Type.Optional(Type.String()),
                budgetSensitivity: Type.Optional(Type.Union([
                    Type.Literal("low"),
                    Type.Literal("medium"),
                    Type.Literal("high"),
                ])),
                hasExistingApp: Type.Optional(Type.Boolean({ description: "Whether this is for an existing Lovable.dev app rather than a new build." })),
                githubRepoUrl: Type.Optional(Type.String({ description: "Connected GitHub repository URL, if known." })),
                localRepoPath: Type.Optional(Type.String({ description: "Local repo path if OpenClaw already has the project open. ClawKit does not read this path." })),
            }),
            async execute(_id, params) {
                return jsonText(makeCreditSmartPlan(params));
            },
        });
        api.registerTool({
            name: "lovable_prompt_sequence",
            label: "Plan Prompt Sequence",
            description: "Create a short Lovable.dev prompt sequence with evidence gates so OpenClaw avoids expensive repeated prompting.",
            parameters: Type.Object({
                projectName: Type.Optional(Type.String()),
                plan: Type.Optional(Type.Any({ description: "Output from lovable_credit_smart_plan, if available." })),
                roughIdea: Type.Optional(Type.String()),
                maxLovablePrompts: Type.Optional(Type.Number({ description: "Maximum Lovable.dev prompts to allow before GitHub/OpenClaw verification. Clamped to 1-5." })),
                includeGitHubHandoff: Type.Optional(Type.Boolean({ description: "Whether the sequence should explicitly include GitHub handoff after Lovable.dev prompting." })),
            }),
            async execute(_id, params) {
                return jsonText(makePromptSequence(params));
            },
        });
        api.registerTool({
            name: "lovable_credit_risk_audit",
            label: "Audit Credit Risk",
            description: "Check whether a proposed Lovable.dev prompt is likely to waste credits and whether OpenClaw should verify or code first.",
            parameters: Type.Object({
                projectName: Type.Optional(Type.String()),
                proposedPrompt: Type.Optional(Type.String({ description: "The Lovable.dev prompt being considered." })),
                plannedFeatures: optionalStringArray("Features included in the next planned prompt."),
                integrations: optionalStringArray("Integrations or external services in scope."),
                existingKnownBugs: optionalStringArray("Known bugs or visible failures."),
                hasFailingBuild: Type.Optional(Type.Boolean()),
                hasGitHubRepo: Type.Optional(Type.Boolean()),
                hasLocalRepo: Type.Optional(Type.Boolean()),
                hasRuntimeErrors: Type.Optional(Type.Boolean()),
                hasInvisibleChanges: Type.Optional(Type.Boolean()),
                creditSensitivity: Type.Optional(Type.Union([
                    Type.Literal("low"),
                    Type.Literal("medium"),
                    Type.Literal("high"),
                ])),
            }),
            async execute(_id, params) {
                return jsonText(makeCreditRiskAudit(params));
            },
        });
        api.registerTool({
            name: "lovable_stop_prompting_check",
            label: "Check Stop Prompting",
            description: "Decide whether OpenClaw should stop spending Lovable.dev credits and switch to browser verification, GitHub inspection, code repair, or refactoring.",
            parameters: Type.Object({
                projectName: Type.Optional(Type.String()),
                attemptedPrompts: Type.Optional(Type.Number()),
                sameIssueRepeated: Type.Optional(Type.Boolean()),
                hasFailingBuild: Type.Optional(Type.Boolean()),
                hasRuntimeErrors: Type.Optional(Type.Boolean()),
                hasInvisibleChanges: Type.Optional(Type.Boolean()),
                hasGitHubRepo: Type.Optional(Type.Boolean()),
                hasLocalRepo: Type.Optional(Type.Boolean()),
                needsArchitectureRefactor: Type.Optional(Type.Boolean()),
                userStillUnsatisfied: Type.Optional(Type.Boolean()),
            }),
            async execute(_id, params) {
                return jsonText(makeStopPromptingCheck(params));
            },
        });
        api.registerTool({
            name: "lovable_build_url",
            label: "Create Lovable URL",
            description: "Create a Lovable Build-with-URL autosubmit link from a prepared prompt. This does not open the browser.",
            parameters: Type.Object({
                prompt: Type.String(),
            }),
            async execute(_id, params) {
                return jsonText({ url: makeBuildUrl(params.prompt) });
            },
        });
        api.registerTool({
            name: "lovable_open_build_url",
            label: "Open Lovable URL",
            description: "Open Lovable with an autosubmitted build prompt in the user's default browser. Use only after user approval when the prompt is final.",
            parameters: Type.Object({
                prompt: Type.String(),
            }),
            async execute(_id, params) {
                const url = makeBuildUrl(params.prompt);
                return jsonText({
                    opened: false,
                    url,
                    next: [
                        "OpenClaw should open this URL with its trusted browser tool or ask the user to open it manually.",
                        "Wait for Lovable generation to complete.",
                        "Capture the project URL and screenshots.",
                        "Export or sync to GitHub before exact engineering work.",
                    ],
                });
            },
        }, { optional: true });
        api.registerTool({
            name: "lovable_github_handoff",
            label: "Plan GitHub Handoff",
            description: "Create a GitHub handoff checklist after Lovable generates or updates an app, so OpenClaw can continue with code, tests, and PR work.",
            parameters: Type.Object({
                projectUrl: Type.Optional(Type.String()),
                repoUrl: Type.Optional(Type.String()),
                branchName: Type.Optional(Type.String()),
                requestedOutcome: Type.String(),
            }),
            async execute(_id, params) {
                return jsonText({
                    projectUrl: params.projectUrl ?? "Not provided yet",
                    repoUrl: params.repoUrl ?? "Create, connect, or export from Lovable before code work.",
                    branchName: params.branchName ?? "clawkit/lovable-handoff",
                    checklist: [
                        "Confirm the Lovable preview matches the intended product direction.",
                        "Sync or export the project to GitHub.",
                        "Clone or fetch the repository locally.",
                        "Create a branch for OpenClaw engineering changes.",
                        "Run install, lint, typecheck, tests, and build.",
                        "Implement exact logic, integrations, tests, security fixes, and documentation in code.",
                        "Use Lovable again only for UI/product iteration that is faster to prompt than code.",
                        "Open a PR with screenshots, verification notes, and residual risks.",
                    ],
                    requestedOutcome: params.requestedOutcome,
                });
            },
        });
        api.registerTool({
            name: "lovable_connect_github_repo",
            label: "Connect GitHub Repo",
            description: "Plan the safe connection between a Lovable project and its GitHub repository so OpenClaw can clone/open it, branch, verify, refactor, and prepare PR work.",
            parameters: Type.Object({
                projectUrl: Type.Optional(Type.String({ description: "Lovable project or preview URL, if known." })),
                repoUrl: Type.Optional(Type.String({ description: "GitHub repository URL connected to the Lovable project." })),
                desiredOutcome: Type.String({ description: "What the user wants to achieve after connecting the repo." }),
                repoPath: Type.Optional(Type.String({ description: "Local repo path if OpenClaw has already cloned/opened it. ClawKit does not read this path." })),
                isGitRepo: Type.Optional(Type.Boolean({ description: "Whether trusted Git tools confirmed this path is a Git repository." })),
                currentBranch: Type.Optional(Type.String({ description: "Current branch from trusted Git tools." })),
                remoteUrl: Type.Optional(Type.String({ description: "Origin remote URL from trusted Git tools, if safe to share." })),
                dirtyFiles: optionalStringArray("Uncommitted changed files from trusted Git tools."),
                recentCommits: optionalStringArray("Recent commit subjects from trusted Git tools."),
                frameworkSignals: optionalStringArray("Frameworks detected by trusted code/package inspection."),
                packageManager: Type.Optional(Type.String({ description: "Detected package manager: npm, pnpm, yarn, or bun." })),
                availableScripts: Type.Optional(Type.Record(Type.String(), Type.String(), { description: "Scripts from package.json supplied by trusted inspection." })),
                preferredBranchName: Type.Optional(Type.String({ description: "Preferred feature branch name for Lovable/OpenClaw work." })),
            }),
            async execute(_id, params) {
                return jsonText(await makeGithubConnectionPlan(params));
            },
        });
        api.registerTool({
            name: "lovable_project_readiness",
            label: "Check Project Readiness",
            description: "Score whether a Lovable/GitHub project has enough evidence to continue with Lovable UI work, OpenClaw engineering, PR, or deploy steps.",
            parameters: Type.Object({
                hasLovableProjectUrl: Type.Optional(Type.Boolean()),
                hasGithubRepoUrl: Type.Optional(Type.Boolean()),
                hasLocalRepo: Type.Optional(Type.Boolean()),
                hasCleanGitState: Type.Optional(Type.Boolean()),
                onSafeBranch: Type.Optional(Type.Boolean()),
                verificationPassed: Type.Optional(Type.Boolean()),
                visibleResultConfirmed: Type.Optional(Type.Boolean()),
                hasPrSummary: Type.Optional(Type.Boolean()),
                intendedNextStep: Type.Optional(Type.Union([
                    Type.Literal("lovable-ui"),
                    Type.Literal("openclaw-engineering"),
                    Type.Literal("pr"),
                    Type.Literal("deploy"),
                ])),
            }),
            async execute(_id, params) {
                return jsonText(makeProjectReadinessReport(params));
            },
        });
        api.registerTool({
            name: "lovable_project_context",
            label: "Create Project Context",
            description: "Create a reusable project memory brief for a Lovable/GitHub app so OpenClaw can carry project URLs, repo state, stack, verification commands, risks, and do-not-touch rules across sessions.",
            parameters: Type.Object({
                projectName: Type.Optional(Type.String()),
                productGoal: Type.String({ description: "What the app is meant to do." }),
                lovableProjectUrl: Type.Optional(Type.String()),
                githubRepoUrl: Type.Optional(Type.String()),
                localRepoPath: Type.Optional(Type.String()),
                preferredBranchPrefix: Type.Optional(Type.String()),
                packageManager: Type.Optional(Type.String()),
                frameworkStack: optionalStringArray("Known stack/frameworks, such as React, Vite, Supabase, Tailwind."),
                verificationCommands: optionalStringArray("Commands that prove the app is healthy."),
                deploymentTarget: Type.Optional(Type.String()),
                lastLovablePrompt: Type.Optional(Type.String()),
                lastVisibleResultStatus: Type.Optional(Type.String()),
                lastRepoDoctorSummary: Type.Optional(Type.String()),
                lastPrSummary: Type.Optional(Type.String()),
                knownRisks: optionalStringArray("Known technical, product, security, or delivery risks."),
                blockers: optionalStringArray("Current blockers that should stop broad prompting or delivery."),
                doNotTouch: optionalStringArray("Files, features, data, settings, or services Lovable/OpenClaw should avoid without approval."),
                nextGoal: Type.Optional(Type.String()),
            }),
            async execute(_id, params) {
                return jsonText(makeProjectContext(params));
            },
        });
        api.registerTool({
            name: "lovable_project_memory",
            label: "Create Project Memory",
            description: "Create or refresh durable project memory with source of truth, stack, routes, bugs, decisions, do-not-change rules, pending Lovable prompts, GitHub tasks, visual QA notes, and release readiness.",
            parameters: Type.Object({
                projectName: Type.Optional(Type.String()),
                currentGoal: Type.String({ description: "Current product or delivery goal." }),
                lovableProjectUrl: Type.Optional(Type.String()),
                githubRepoUrl: Type.Optional(Type.String()),
                localRepoPath: Type.Optional(Type.String()),
                deployedUrl: Type.Optional(Type.String()),
                primarySourceOfTruth: Type.Optional(Type.Union([
                    Type.Literal("lovable"),
                    Type.Literal("github"),
                    Type.Literal("local-repo"),
                    Type.Literal("deployed-app"),
                    Type.Literal("unknown"),
                ])),
                stack: optionalStringArray("Known framework, package, backend, auth, database, deployment, or integration stack."),
                importantRoutes: optionalStringArray("Important routes, screens, workflows, or app sections."),
                knownBugs: optionalStringArray("Known bugs or visible failures."),
                refactorDecisions: optionalStringArray("Maintainability or architecture decisions already made."),
                doNotChange: optionalStringArray("User-approved areas, behavior, styling, or code that must not be changed without approval."),
                pendingLovablePrompts: optionalStringArray("Lovable prompts prepared but not yet executed or verified."),
                githubTasks: optionalStringArray("GitHub issues, PR tasks, branch work, CI fixes, or repo actions."),
                visualQaNotes: optionalStringArray("Browser, screenshot, responsive, or visual QA notes."),
                changedSinceLastSession: optionalStringArray("What changed since the last ClawKit session."),
                releaseReadiness: Type.Optional(Type.Union([
                    Type.Literal("blocked"),
                    Type.Literal("needs-work"),
                    Type.Literal("ready-for-verification"),
                    Type.Literal("ready-to-ship"),
                ])),
            }),
            async execute(_id, params) {
                return jsonText(makeProjectMemory(params));
            },
        });
        api.registerTool({
            name: "lovable_decision_log",
            label: "Create Decision Log",
            description: "Create a dated decision log for product, source-of-truth, refactor, visual QA, and delivery decisions so future OpenClaw sessions know what was agreed.",
            parameters: Type.Object({
                projectName: Type.Optional(Type.String()),
                generatedAt: Type.Optional(Type.String()),
                decisions: Type.Optional(Type.Array(Type.Object({
                    date: Type.Optional(Type.String()),
                    decision: Type.String(),
                    reason: Type.Optional(Type.String()),
                    owner: Type.Optional(Type.Union([
                        Type.Literal("user"),
                        Type.Literal("openclaw"),
                        Type.Literal("lovable"),
                        Type.Literal("github"),
                        Type.Literal("shared"),
                    ])),
                    status: Type.Optional(Type.Union([
                        Type.Literal("proposed"),
                        Type.Literal("accepted"),
                        Type.Literal("superseded"),
                        Type.Literal("revisit"),
                    ])),
                    followUp: optionalStringArray("Follow-up work created by this decision."),
                }))),
                newDecision: Type.Optional(Type.String()),
                newReason: Type.Optional(Type.String()),
                openQuestions: optionalStringArray("Open questions still needing user or repo evidence."),
                doNotForget: optionalStringArray("Important memory notes to preserve across sessions."),
            }),
            async execute(_id, params) {
                return jsonText(makeDecisionLog(params));
            },
        });
        api.registerTool({
            name: "lovable_session_brief",
            label: "Create Session Brief",
            description: "Summarize what ClawKit knows at the start of a session: current goal, source of truth, changes since last time, do-not-touch rules, risks, and recommended tool order.",
            parameters: Type.Object({
                projectName: Type.Optional(Type.String()),
                memory: Type.Optional(Type.Any()),
                decisionLog: Type.Optional(Type.Any()),
                latestUserGoal: Type.Optional(Type.String()),
                latestRepoState: Type.Optional(Type.String()),
                latestVisualState: Type.Optional(Type.String()),
                currentBlockers: optionalStringArray("Current blockers or unresolved bugs."),
                risks: optionalStringArray("Risks OpenClaw should keep in view for this session."),
            }),
            async execute(_id, params) {
                return jsonText(makeSessionBrief(params));
            },
        });
        api.registerTool({
            name: "lovable_next_action_plan",
            label: "Plan Next Action",
            description: "Choose the safest next action from project memory: ask the user, prompt Lovable, inspect GitHub, edit code, verify the visible result, prepare a PR, or ship.",
            parameters: Type.Object({
                projectName: Type.Optional(Type.String()),
                memory: Type.Optional(Type.Any()),
                requestedChange: Type.String(),
                hasGitHubRepo: Type.Optional(Type.Boolean()),
                hasLocalRepo: Type.Optional(Type.Boolean()),
                hasVisibleIssue: Type.Optional(Type.Boolean()),
                hasFailingBuild: Type.Optional(Type.Boolean()),
                hasPendingLovablePrompt: Type.Optional(Type.Boolean()),
                readyForPr: Type.Optional(Type.Boolean()),
            }),
            async execute(_id, params) {
                return jsonText(makeNextActionPlan(params));
            },
        });
        api.registerTool({
            name: "lovable_iteration_brief",
            label: "Draft Lovable Iteration",
            description: "Turn OpenClaw's repo/test/screenshot findings into a concise follow-up prompt for Lovable UI iteration.",
            parameters: Type.Object({
                currentState: Type.String(),
                problems: Type.Array(Type.String()),
                keep: optionalStringArray("Existing parts Lovable should preserve."),
                change: optionalStringArray("Specific UI/product changes Lovable should make."),
                avoid: optionalStringArray("Things Lovable should avoid touching."),
            }),
            async execute(_id, params) {
                const brief = [
                    "Improve the existing Lovable project with the following focused UI/product iteration.",
                    "",
                    "Current state:",
                    params.currentState,
                    "",
                    "Problems to solve:",
                    ...params.problems.map((problem) => `- ${problem}`),
                    "",
                    "Preserve:",
                    ...asList(params.keep, ["Core app structure and working behavior already implemented in GitHub."]).map((item) => `- ${item}`),
                    "",
                    "Change:",
                    ...asList(params.change, ["Improve visual hierarchy, responsiveness, and interaction states without changing core business logic."]).map((item) => `- ${item}`),
                    "",
                    "Avoid:",
                    ...asList(params.avoid, ["Do not introduce fake secrets, destructive data actions, or broad rewrites unrelated to the UI iteration."]).map((item) => `- ${item}`),
                    "",
                    "After this UI pass, OpenClaw will review the GitHub diff, run tests/build, and handle exact engineering fixes.",
                ].join("\n");
                return text(brief);
            },
        });
        api.registerTool({
            name: "lovable_repo_doctor",
            label: "Run Sync Doctor",
            description: "Assess a Lovable/GitHub repository from caller-supplied Git/package evidence and report framework signals, Git state, Lovable commit signals, recommended verification commands, and next action.",
            parameters: Type.Object({
                repoPath: Type.String({ description: "Absolute or relative path to the local repository. ClawKit does not read this path; OpenClaw should provide evidence gathered by trusted tools." }),
                isGitRepo: Type.Optional(Type.Boolean({ description: "Whether trusted Git tools confirmed this path is a Git repository." })),
                currentBranch: Type.Optional(Type.String({ description: "Current branch from trusted Git tools." })),
                remoteUrl: Type.Optional(Type.String({ description: "Origin remote URL from trusted Git tools, if safe to share." })),
                dirtyFiles: optionalStringArray("Uncommitted changed files from trusted Git tools."),
                recentCommits: optionalStringArray("Recent commit subjects from trusted Git tools."),
                frameworkSignals: optionalStringArray("Frameworks detected by trusted code/package inspection, such as Vite, React, TypeScript, Supabase."),
                packageManager: Type.Optional(Type.String({ description: "Detected package manager: npm, pnpm, yarn, or bun." })),
                availableScripts: Type.Optional(Type.Record(Type.String(), Type.String(), { description: "Scripts from package.json supplied by trusted inspection." })),
            }),
            async execute(_id, params) {
                return jsonText(await inspectRepo(params));
            },
        });
        api.registerTool({
            name: "lovable_rescue_plan",
            label: "Rescue Existing App",
            description: "Diagnose and plan repairs for an existing Lovable app that is broken, invisible, messy, hard to extend, or not production-ready.",
            parameters: Type.Object({
                appName: Type.Optional(Type.String()),
                problemDescription: Type.String({ description: "What is wrong with the existing Lovable app." }),
                repoPath: Type.Optional(Type.String({ description: "Local GitHub-synced repository path, if available. ClawKit does not read this path; OpenClaw should provide trusted repo evidence separately." })),
                isGitRepo: Type.Optional(Type.Boolean({ description: "Whether trusted Git tools confirmed this path is a Git repository." })),
                currentBranch: Type.Optional(Type.String({ description: "Current branch from trusted Git tools." })),
                remoteUrl: Type.Optional(Type.String({ description: "Origin remote URL from trusted Git tools, if safe to share." })),
                dirtyFiles: optionalStringArray("Uncommitted changed files from trusted Git tools."),
                recentCommits: optionalStringArray("Recent commit subjects from trusted Git tools."),
                frameworkSignals: optionalStringArray("Frameworks detected by trusted code/package inspection."),
                packageManager: Type.Optional(Type.String({ description: "Detected package manager: npm, pnpm, yarn, or bun." })),
                availableScripts: Type.Optional(Type.Record(Type.String(), Type.String(), { description: "Scripts from package.json supplied by trusted inspection." })),
                previewUrl: Type.Optional(Type.String({ description: "Lovable preview, deployed URL, or local dev server URL." })),
                expectedVisibleChanges: optionalStringArray("What the user expects to see or be able to do in the app."),
                buildPassed: Type.Optional(Type.Boolean({ description: "Whether current build/typecheck/test verification passed." })),
                screenshotObservations: optionalStringArray("What is actually visible on screen or in screenshots."),
                consoleErrors: optionalStringArray("Browser console or runtime errors observed."),
                userGoal: Type.Optional(Type.String({ description: "The user's desired outcome after rescue." })),
            }),
            async execute(_id, params) {
                return jsonText(await makeRescuePlan(params));
            },
        });
        api.registerTool({
            name: "lovable_sync_risk_report",
            label: "Report Sync Risk",
            description: "Assess whether it is safe to prompt Lovable again for a GitHub-synced project, especially when local changes, main branch work, or Lovable bot commits are present.",
            parameters: Type.Object({
                repoPath: Type.String({ description: "Absolute or relative path to the local repository." }),
                intendedAction: Type.Optional(Type.String({ description: "What the user wants to do next." })),
                isGitRepo: Type.Optional(Type.Boolean({ description: "Whether trusted Git tools confirmed this path is a Git repository." })),
                currentBranch: Type.Optional(Type.String({ description: "Current branch from trusted Git tools." })),
                remoteUrl: Type.Optional(Type.String({ description: "Origin remote URL from trusted Git tools, if safe to share." })),
                dirtyFiles: optionalStringArray("Uncommitted changed files from trusted Git tools."),
                recentCommits: optionalStringArray("Recent commit subjects from trusted Git tools."),
                frameworkSignals: optionalStringArray("Frameworks detected by trusted code/package inspection."),
                packageManager: Type.Optional(Type.String({ description: "Detected package manager: npm, pnpm, yarn, or bun." })),
                availableScripts: Type.Optional(Type.Record(Type.String(), Type.String(), { description: "Scripts from package.json supplied by trusted inspection." })),
            }),
            async execute(_id, params) {
                const doctor = await inspectRepo(params);
                return jsonText(makeRiskReport(doctor, params.intendedAction));
            },
        });
        api.registerTool({
            name: "lovable_delivery_plan",
            label: "Plan Delivery",
            description: "Create a safe end-to-end delivery plan that chooses between Lovable UI prompting and OpenClaw/GitHub engineering work.",
            parameters: Type.Object({
                repoPath: Type.Optional(Type.String()),
                productGoal: Type.String(),
                requestedChange: Type.String(),
                previewUrl: Type.Optional(Type.String()),
                isGitRepo: Type.Optional(Type.Boolean({ description: "Whether trusted Git tools confirmed this path is a Git repository." })),
                currentBranch: Type.Optional(Type.String({ description: "Current branch from trusted Git tools." })),
                remoteUrl: Type.Optional(Type.String({ description: "Origin remote URL from trusted Git tools, if safe to share." })),
                dirtyFiles: optionalStringArray("Uncommitted changed files from trusted Git tools."),
                recentCommits: optionalStringArray("Recent commit subjects from trusted Git tools."),
                frameworkSignals: optionalStringArray("Frameworks detected by trusted code/package inspection."),
                packageManager: Type.Optional(Type.String({ description: "Detected package manager: npm, pnpm, yarn, or bun." })),
                availableScripts: Type.Optional(Type.Record(Type.String(), Type.String(), { description: "Scripts from package.json supplied by trusted inspection." })),
            }),
            async execute(_id, params) {
                const doctor = params.repoPath ? await inspectRepo(params) : null;
                const risk = doctor ? makeRiskReport(doctor, params.requestedChange) : null;
                const useLovable = /ui|screen|page|layout|visual|responsive|design|landing|dashboard|polish|style/i.test(params.requestedChange) &&
                    risk?.safeToPromptLovable !== false;
                return jsonText({
                    productGoal: params.productGoal,
                    requestedChange: params.requestedChange,
                    previewUrl: params.previewUrl ?? null,
                    recommendedMode: useLovable ? "Lovable UI pass, then GitHub verification" : "OpenClaw/GitHub engineering pass",
                    branchPlan: {
                        lovableBranch: "lovable/ui-pass",
                        engineeringBranch: "openclaw/engineering-pass",
                        releaseBranch: "release/candidate",
                    },
                    steps: useLovable
                        ? [
                            "Create or switch to a Lovable UI branch.",
                            "Use `lovable_iteration_brief` or `lovable_make_prompt` for a focused Lovable prompt.",
                            "Sync/export Lovable changes to GitHub.",
                            "Run `lovable_repo_doctor` after sync.",
                            "Use OpenClaw code tools for tests, exact logic, security, and PR cleanup.",
                            "Open a PR with generated-vs-engineered change notes.",
                        ]
                        : [
                            "Keep GitHub as source of truth and create an engineering branch.",
                            "Inspect the code locally and run the recommended verification commands.",
                            "Make exact code changes with OpenClaw tools.",
                            "Use Lovable only later for narrow UI polish if the repo is clean.",
                            "Open a PR with verification output and risks.",
                        ],
                    repoDoctor: doctor,
                    syncRisk: risk,
                });
            },
        });
        api.registerTool({
            name: "lovable_pr_summary",
            label: "Draft PR Summary",
            description: "Generate a PR description that separates Lovable-generated UI work from OpenClaw engineering work, verification, screenshots, and risks.",
            parameters: Type.Object({
                title: Type.String(),
                lovableChanges: optionalStringArray("UI/product changes generated or prompted in Lovable."),
                openClawChanges: optionalStringArray("Code, test, integration, CI, or security changes made by OpenClaw."),
                verification: optionalStringArray("Commands run and outcomes."),
                screenshots: optionalStringArray("Preview or screenshot URLs/paths."),
                risks: optionalStringArray("Known limitations or review concerns."),
            }),
            async execute(_id, params) {
                const body = [
                    `# ${params.title}`,
                    "",
                    "## Summary",
                    "This PR combines Lovable-assisted product/UI work with OpenClaw engineering hardening.",
                    "",
                    "## Lovable-generated UI/product work",
                    ...asList(params.lovableChanges, ["No Lovable-generated changes recorded."]).map((item) => `- ${item}`),
                    "",
                    "## OpenClaw engineering work",
                    ...asList(params.openClawChanges, ["No OpenClaw engineering changes recorded."]).map((item) => `- ${item}`),
                    "",
                    "## Verification",
                    ...asList(params.verification, ["Verification not run yet."]).map((item) => `- ${item}`),
                    "",
                    "## Screenshots / previews",
                    ...asList(params.screenshots, ["No screenshots or preview links attached yet."]).map((item) => `- ${item}`),
                    "",
                    "## Risks and review notes",
                    ...asList(params.risks, ["No known risks beyond normal product review."]).map((item) => `- ${item}`),
                ].join("\n");
                return text(body);
            },
        });
        api.registerTool({
            name: "lovable_openclaw_integration_plan",
            label: "Plan OpenClaw Inside",
            description: "Plan an optional, secure OpenClaw integration inside the app being built, with Lovable handling UI and OpenClaw implementing backend, permissions, approvals, and auditability.",
            parameters: Type.Object({
                appName: Type.Optional(Type.String()),
                appPurpose: Type.String({ description: "What the app does and why OpenClaw should be available inside it." }),
                desiredCapabilities: optionalStringArray("What users should be able to ask OpenClaw to help with inside the app."),
                userRoles: optionalStringArray("App roles that should have different OpenClaw permissions."),
                dataSensitivity: Type.Optional(Type.Union([
                    Type.Literal("low"),
                    Type.Literal("medium"),
                    Type.Literal("high"),
                ])),
                deploymentTarget: Type.Optional(Type.String()),
                allowAutonomousActions: Type.Optional(Type.Boolean({ description: "Whether OpenClaw should be allowed to take actions after approval." })),
            }),
            async execute(_id, params) {
                return jsonText(makeOpenClawIntegrationPlan(params));
            },
        });
        api.registerTool({
            name: "lovable_visible_result_check",
            label: "Verify Visible Result",
            description: "Double-check Lovable's completion claim by requiring build/runtime checks plus visible browser or screenshot confirmation before accepting that the change works.",
            parameters: Type.Object({
                expectedChanges: Type.Array(Type.String({ description: "User-visible changes that should appear in the app." })),
                repoPath: Type.Optional(Type.String({ description: "Local repository path, if available." })),
                previewUrl: Type.Optional(Type.String({ description: "Lovable preview, deployed URL, or local dev server URL." })),
                buildPassed: Type.Optional(Type.Boolean({ description: "Whether build/typecheck/test verification passed." })),
                screenshotObservations: optionalStringArray("What is actually visible on screen or in screenshots."),
                consoleErrors: optionalStringArray("Browser console or runtime errors observed."),
            }),
            async execute(_id, params) {
                return jsonText(makeVisibleResultCheck(params));
            },
        });
        api.registerTool({
            name: "lovable_model_strategy",
            label: "Choose Model Strategy",
            description: "Help the user choose which configured OpenClaw LLM/model profile to use for planning, Lovable prompting, coding, debugging, review, or fast iteration.",
            parameters: Type.Object({
                userPreference: Type.Optional(Type.String()),
                taskType: Type.Optional(Type.Union([
                    Type.Literal("product-planning"),
                    Type.Literal("ui-prompting"),
                    Type.Literal("coding"),
                    Type.Literal("debugging"),
                    Type.Literal("review"),
                    Type.Literal("fast-iteration"),
                ])),
                availableModels: optionalStringArray("Model/profile names available in the user's OpenClaw setup, if known."),
                costSensitivity: Type.Optional(Type.Union([
                    Type.Literal("low"),
                    Type.Literal("medium"),
                    Type.Literal("high"),
                ])),
            }),
            async execute(_id, params) {
                return jsonText(makeModelStrategy(params));
            },
        });
        api.registerTool({
            name: "lovable_workflow_state",
            label: "Create Workflow State",
            description: "Summarize a Lovable.dev project situation into a simple ClawKit for Lovable workflow state: mode, source of truth, app status, repo status, credit risk, stress level, blocker, and next action.",
            parameters: Type.Object({
                projectName: Type.Optional(Type.String()),
                userGoal: Type.Optional(Type.String()),
                hasExistingApp: Type.Optional(Type.Boolean()),
                hasLovableProjectUrl: Type.Optional(Type.Boolean()),
                hasGithubRepo: Type.Optional(Type.Boolean()),
                hasLocalRepo: Type.Optional(Type.Boolean()),
                hasDirtyGitState: Type.Optional(Type.Boolean()),
                hasFailingBuild: Type.Optional(Type.Boolean()),
                hasRuntimeErrors: Type.Optional(Type.Boolean()),
                hasInvisibleChanges: Type.Optional(Type.Boolean()),
                needsArchitectureRefactor: Type.Optional(Type.Boolean()),
                readyForPr: Type.Optional(Type.Boolean()),
                attemptedLovablePrompts: Type.Optional(Type.Number()),
                sameIssueRepeated: Type.Optional(Type.Boolean()),
                budgetSensitivity: Type.Optional(Type.Union([
                    Type.Literal("low"),
                    Type.Literal("medium"),
                    Type.Literal("high"),
                ])),
                userMessage: Type.Optional(Type.String()),
                userStress: Type.Optional(Type.Union([
                    Type.Literal("calm"),
                    Type.Literal("focused"),
                    Type.Literal("heated"),
                    Type.Literal("critical"),
                ])),
                knownFacts: optionalStringArray("Project facts already known to OpenClaw."),
            }),
            async execute(_id, params) {
                return jsonText(makeWorkflowState(params));
            },
        });
        api.registerTool({
            name: "lovable_brain",
            label: "Run Lovable Brain",
            description: "Choose the next ClawKit for Lovable workflow automatically from the user's situation, so they do not need to know tool names or decide between Lovable.dev, GitHub, verification, code repair, or PR work.",
            parameters: Type.Object({
                projectName: Type.Optional(Type.String()),
                userGoal: Type.Optional(Type.String()),
                userMessage: Type.Optional(Type.String()),
                hasExistingApp: Type.Optional(Type.Boolean()),
                hasLovableProjectUrl: Type.Optional(Type.Boolean()),
                hasGithubRepo: Type.Optional(Type.Boolean()),
                hasLocalRepo: Type.Optional(Type.Boolean()),
                hasDirtyGitState: Type.Optional(Type.Boolean()),
                hasFailingBuild: Type.Optional(Type.Boolean()),
                hasRuntimeErrors: Type.Optional(Type.Boolean()),
                hasInvisibleChanges: Type.Optional(Type.Boolean()),
                needsArchitectureRefactor: Type.Optional(Type.Boolean()),
                readyForPr: Type.Optional(Type.Boolean()),
                attemptedLovablePrompts: Type.Optional(Type.Number()),
                sameIssueRepeated: Type.Optional(Type.Boolean()),
                budgetSensitivity: Type.Optional(Type.Union([
                    Type.Literal("low"),
                    Type.Literal("medium"),
                    Type.Literal("high"),
                ])),
                userStress: Type.Optional(Type.Union([
                    Type.Literal("calm"),
                    Type.Literal("focused"),
                    Type.Literal("heated"),
                    Type.Literal("critical"),
                ])),
                wantsBrowserOpen: Type.Optional(Type.Boolean()),
                wantsModelChoice: Type.Optional(Type.Boolean()),
                knownFacts: optionalStringArray("Project facts already known to OpenClaw."),
            }),
            async execute(_id, params) {
                return jsonText(makeStudioBrain(params));
            },
        });
        api.registerTool({
            name: "lovable_studio_brain",
            label: "Run Studio Brain",
            description: "Choose the next ClawKit for Lovable workflow automatically from the user's situation, so they do not need to know tool names or decide between Lovable.dev, GitHub, verification, code repair, or PR work.",
            parameters: Type.Object({
                projectName: Type.Optional(Type.String()),
                userGoal: Type.Optional(Type.String()),
                userMessage: Type.Optional(Type.String()),
                hasExistingApp: Type.Optional(Type.Boolean()),
                hasLovableProjectUrl: Type.Optional(Type.Boolean()),
                hasGithubRepo: Type.Optional(Type.Boolean()),
                hasLocalRepo: Type.Optional(Type.Boolean()),
                hasDirtyGitState: Type.Optional(Type.Boolean()),
                hasFailingBuild: Type.Optional(Type.Boolean()),
                hasRuntimeErrors: Type.Optional(Type.Boolean()),
                hasInvisibleChanges: Type.Optional(Type.Boolean()),
                needsArchitectureRefactor: Type.Optional(Type.Boolean()),
                readyForPr: Type.Optional(Type.Boolean()),
                attemptedLovablePrompts: Type.Optional(Type.Number()),
                sameIssueRepeated: Type.Optional(Type.Boolean()),
                budgetSensitivity: Type.Optional(Type.Union([
                    Type.Literal("low"),
                    Type.Literal("medium"),
                    Type.Literal("high"),
                ])),
                userStress: Type.Optional(Type.Union([
                    Type.Literal("calm"),
                    Type.Literal("focused"),
                    Type.Literal("heated"),
                    Type.Literal("critical"),
                ])),
                wantsBrowserOpen: Type.Optional(Type.Boolean()),
                wantsModelChoice: Type.Optional(Type.Boolean()),
                knownFacts: optionalStringArray("Project facts already known to OpenClaw."),
            }),
            async execute(_id, params) {
                return jsonText(makeStudioBrain(params));
            },
        });
        api.registerTool({
            name: "lovable_user_onboarding",
            label: "Guide User Onboarding",
            description: "Give a friendly first-run guide that asks only the minimum questions and teaches users how to ask ClawKit for Lovable for new builds, rescues, improvements, hardening, and shipping.",
            parameters: Type.Object({
                userLevel: Type.Optional(Type.Union([
                    Type.Literal("beginner"),
                    Type.Literal("builder"),
                    Type.Literal("developer"),
                    Type.Literal("agency"),
                ])),
                goal: Type.Optional(Type.String()),
                hasExistingApp: Type.Optional(Type.Boolean()),
                wantsFastStart: Type.Optional(Type.Boolean()),
            }),
            async execute(_id, params) {
                return jsonText(makeUserOnboarding(params));
            },
        });
        api.registerTool({
            name: "lovable_starter_guide",
            label: "Show Starter Guide",
            description: "Educate the user before they start by explaining what ClawKit can do, the safest workflow, example requests, choices they can make, and guardrails.",
            parameters: Type.Object({
                userLevel: Type.Optional(Type.Union([
                    Type.Literal("beginner"),
                    Type.Literal("builder"),
                    Type.Literal("developer"),
                    Type.Literal("agency"),
                ])),
                goal: Type.Optional(Type.String()),
            }),
            async execute(_id, params) {
                return jsonText(makeStarterGuide(params));
            },
        });
        api.registerTool({
            name: "lovable_mood_indicator",
            label: "Read Build Mood",
            description: "Generate a playful user frustration/mood indicator plus serious self-healing notes that guide OpenClaw to repair misunderstandings, verify evidence, and improve the next response.",
            parameters: Type.Object({
                userMessage: Type.String({ description: "The latest user message or feedback." }),
                recentFailure: Type.Optional(Type.String({ description: "Recent failed build, invisible UI change, wrong output, or broken assumption." })),
                agentMistake: Type.Optional(Type.String({ description: "What OpenClaw may have done wrong, if known." })),
                taskStage: Type.Optional(Type.Union([
                    Type.Literal("planning"),
                    Type.Literal("lovable-prompting"),
                    Type.Literal("coding"),
                    Type.Literal("verification"),
                    Type.Literal("delivery"),
                ])),
            }),
            async execute(_id, params) {
                return jsonText(makeMoodIndicator(params));
            },
        });
    },
});
