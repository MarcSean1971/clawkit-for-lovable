import { basename, resolve } from "node:path";
import { definePluginEntry } from "openclaw/plugin-sdk/plugin-entry";
import { Type } from "@sinclair/typebox";

type RouteDecision = {
  useLovableFor: string[];
  useOpenClawFor: string[];
  useGithubFor: string[];
  nextSteps: string[];
  risks: string[];
};

type PackageJson = {
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
};

type RepoEvidence = {
  repoPath: string;
  isGitRepo?: boolean;
  currentBranch?: string | null;
  remoteUrl?: string | null;
  dirtyFiles?: string[];
  recentCommits?: string[];
  frameworkSignals?: string[];
  packageManager?: string | null;
  availableScripts?: Record<string, string>;
};

type RepoDoctor = {
  repoPath: string;
  repoName: string;
  isGitRepo: boolean;
  currentBranch: string | null;
  remoteUrl: string | null;
  dirtyFiles: string[];
  recentCommits: string[];
  lovableSignals: string[];
  frameworkSignals: string[];
  packageManager: string | null;
  availableScripts: Record<string, string>;
  recommendedCommands: string[];
  risks: string[];
  nextAction: string;
};

type SyncRiskReport = {
  repoPath: string;
  branch: string | null;
  riskLevel: "low" | "medium" | "high";
  findings: string[];
  recommendedBranch: string;
  safeToPromptLovable: boolean;
  requiredApprovals: string[];
  nextSteps: string[];
};

type OpenClawIntegrationPlan = {
  appName: string;
  recommendation: "integrate" | "defer" | "do-not-integrate";
  integrationPattern: string;
  userFacingCapabilities: string[];
  architecture: string[];
  requiredBackendEndpoints: string[];
  permissionModel: string[];
  safetyControls: string[];
  implementationSteps: string[];
  lovablePromptAddendum: string;
  openClawEngineeringTasks: string[];
  risks: string[];
};

type VisibleResultCheck = {
  status: "verified" | "needs-browser-check" | "blocked-by-build" | "not-visible";
  confidence: "low" | "medium" | "high";
  findings: string[];
  requiredChecks: string[];
  likelyCauses: string[];
  nextSteps: string[];
};

type ModelStrategy = {
  canUserChooseModel: boolean;
  recommendation: string;
  roles: Record<string, string>;
  selectionGuidance: string[];
  configNotes: string[];
  fallbackPolicy: string[];
};

type StarterGuide = {
  headline: string;
  whatThisDoes: string[];
  bestFirstChoices: string[];
  exampleRequests: string[];
  workflow: string[];
  userDecisions: string[];
  guardrails: string[];
  nextPrompt: string;
};

type MoodIndicator = {
  mood: string;
  intensity: "calm" | "focused" | "heated" | "critical";
  humor: string;
  userCareNote: string;
  agentSelfHealingNotes: string[];
  betterNextResponse: string[];
  deEscalationMoves: string[];
  executionRules: string[];
};

type RescuePlan = {
  mode: "rescue";
  appName: string;
  problemSummary: string;
  severity: "low" | "medium" | "high";
  likelyFailureModes: string[];
  firstChecks: string[];
  fixInCode: string[];
  useLovableFor: string[];
  avoidLovableFor: string[];
  recommendedWorkflow: string[];
  expectedEvidence: string[];
  prSections: string[];
  repoDoctor: RepoDoctor | null;
  visibleResultCheck: VisibleResultCheck;
};

const text = (value: string) => ({
  content: [{ type: "text" as const, text: value }],
  details: {},
});

const jsonText = (value: unknown) => text(JSON.stringify(value, null, 2));

const optionalStringArray = (description: string) =>
  Type.Optional(Type.Array(Type.String(), { description }));

function asList(items: string[] | undefined, fallback: string[]): string[] {
  return items && items.length > 0 ? items : fallback;
}

function detectFrameworksFromPackage(pkg: PackageJson | null): string[] {
  const deps = { ...(pkg?.dependencies ?? {}), ...(pkg?.devDependencies ?? {}) };
  const signals = new Set<string>();

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

function recommendedCommands(pkg: PackageJson | null, packageManager: string | null): string[] {
  if (!pkg || !packageManager) {
    return [];
  }

  const scripts = pkg.scripts ?? {};
  const runner = packageManager === "npm" ? "npm run" : packageManager;
  const commands: string[] = [];

  if (packageManager === "npm") {
    commands.push("npm install");
  } else if (packageManager === "pnpm") {
    commands.push("pnpm install");
  } else if (packageManager === "yarn") {
    commands.push("yarn install");
  } else if (packageManager === "bun") {
    commands.push("bun install");
  }

  for (const scriptName of ["lint", "typecheck", "test", "build"]) {
    if (scripts[scriptName]) {
      commands.push(`${runner} ${scriptName}`);
    }
  }

  return commands;
}

function hasLovableCommit(commit: string): boolean {
  return /lovable|lovable-dev|lovable bot|generated with lovable/i.test(commit);
}

async function inspectRepo(evidence: RepoEvidence): Promise<RepoDoctor> {
  const repoPath = resolve(evidence.repoPath);
  const packageManager = evidence.packageManager ?? null;
  const dirtyFiles = evidence.dirtyFiles ?? [];
  const recentCommits = evidence.recentCommits ?? [];
  const lovableSignals = recentCommits.filter(hasLovableCommit);
  const currentBranch = evidence.currentBranch ?? null;
  const remoteUrl = evidence.remoteUrl ?? null;
  const isGitRepo = evidence.isGitRepo ?? Boolean(currentBranch || remoteUrl || recentCommits.length > 0);
  const availableScripts = evidence.availableScripts ?? {};
  const pkg: PackageJson = { scripts: availableScripts };
  const frameworkSignals = evidence.frameworkSignals ?? detectFrameworksFromPackage(pkg);
  const commands = recommendedCommands(pkg, packageManager);
  const risks: string[] = [];

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

  const nextAction =
    risks.length > 0
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

function makeRiskReport(doctor: RepoDoctor, intendedAction?: string): SyncRiskReport {
  const findings: string[] = [];
  const requiredApprovals: string[] = [];

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
    recommendedBranch:
      riskLevel === "low" ? "lovable/ui-pass" : "openclaw/sync-stabilization",
    safeToPromptLovable: riskLevel === "low",
    requiredApprovals,
    nextSteps:
      riskLevel === "low"
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

function makeBuildUrl(prompt: string): string {
  const encoded = encodeURIComponent(prompt);
  return `https://lovable.dev/?autosubmit=true#prompt=${encoded}`;
}

function makePrompt(params: {
  productName?: string;
  idea: string;
  audience?: string;
  pages?: string[];
  dataModel?: string[];
  integrations?: string[];
  designDirection?: string;
  acceptanceCriteria?: string[];
  githubMode?: string;
}): string {
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

function decideRoute(params: {
  request: string;
  repoExists?: boolean;
  hasVisualWork?: boolean;
  hasPreciseCodeWork?: boolean;
  hasDeploymentRisk?: boolean;
}): RouteDecision {
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

function makeOpenClawIntegrationPlan(params: {
  appName?: string;
  appPurpose: string;
  desiredCapabilities?: string[];
  userRoles?: string[];
  dataSensitivity?: "low" | "medium" | "high";
  deploymentTarget?: string;
  allowAutonomousActions?: boolean;
}): OpenClawIntegrationPlan {
  const appName = params.appName ?? "the app";
  const capabilities = asList(params.desiredCapabilities, [
    "In-app assistant for explaining screens, data, and workflows",
    "Drafting actions for the user to review before execution",
    "Project/admin automation routed through OpenClaw with approval",
  ]);
  const roles = asList(params.userRoles, ["admin", "member"]);
  const sensitivity = params.dataSensitivity ?? "medium";
  const allowAutonomousActions = params.allowAutonomousActions === true;
  const recommendation =
    sensitivity === "high" && allowAutonomousActions ? "defer" : "integrate";
  const actionMode = allowAutonomousActions
    ? "approval-gated autonomous actions"
    : "user-reviewed suggestions and drafts";

  return {
    appName,
    recommendation,
    integrationPattern:
      "OpenClaw Inside: the app talks to a backend-owned OpenClaw gateway adapter, never directly from the browser to privileged OpenClaw tools.",
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

function makeVisibleResultCheck(params: {
  expectedChanges: string[];
  repoPath?: string;
  previewUrl?: string;
  buildPassed?: boolean;
  screenshotObservations?: string[];
  consoleErrors?: string[];
}): VisibleResultCheck {
  const findings: string[] = [];
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

  const status =
    params.buildPassed === false
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
    likelyCauses:
      status === "verified"
        ? []
        : [
            "Lovable generated code that does not compile.",
            "Runtime error prevents the changed route or component from rendering.",
            "The change landed on a different route, branch, or preview than the one being inspected.",
            "CSS/layout state hides the new element on the current viewport.",
            "Data/auth/loading state prevents the UI from reaching the expected screen.",
          ],
    nextSteps:
      status === "verified"
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

function makeModelStrategy(params: {
  userPreference?: string;
  taskType?: "product-planning" | "ui-prompting" | "coding" | "debugging" | "review" | "fast-iteration";
  availableModels?: string[];
  costSensitivity?: "low" | "medium" | "high";
}): ModelStrategy {
  const available = params.availableModels?.length ? params.availableModels : ["Use models configured in OpenClaw"];
  const taskType = params.taskType ?? "coding";
  const cost = params.costSensitivity ?? "medium";

  return {
    canUserChooseModel: true,
    recommendation:
      "Let the user choose an OpenClaw model/profile when OpenClaw supports that model in their config. The plugin should guide model choice by task role, but actual model availability belongs to the user's OpenClaw setup.",
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

function makeStarterGuide(params: {
  userLevel?: "beginner" | "builder" | "developer" | "agency";
  goal?: string;
}): StarterGuide {
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
    nextPrompt:
      "Tell me your app idea, whether this is a new or existing project, and whether you want OpenClaw to open Lovable or only prepare links.",
  };
}

function makeMoodIndicator(params: {
  userMessage: string;
  recentFailure?: string;
  agentMistake?: string;
  taskStage?: "planning" | "lovable-prompting" | "coding" | "verification" | "delivery";
}): MoodIndicator {
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
  const intensity: MoodIndicator["intensity"] =
    score >= 8 ? "critical" : score >= 5 ? "heated" : score >= 2 ? "focused" : "calm";
  const moodByIntensity: Record<MoodIndicator["intensity"], string> = {
    calm: "Sunny Build Mode",
    focused: "Raised Eyebrow Debug Mode",
    heated: "Keyboard Steam Mode",
    critical: "Red Alert, But Make It Useful",
  };
  const humorByIntensity: Record<MoodIndicator["intensity"], string> = {
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
    userCareNote:
      intensity === "calm"
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
    deEscalationMoves:
      intensity === "critical"
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

async function makeRescuePlan(params: {
  appName?: string;
  problemDescription: string;
  repoPath?: string;
  isGitRepo?: boolean;
  currentBranch?: string | null;
  remoteUrl?: string | null;
  dirtyFiles?: string[];
  recentCommits?: string[];
  frameworkSignals?: string[];
  packageManager?: string | null;
  availableScripts?: Record<string, string>;
  previewUrl?: string;
  expectedVisibleChanges?: string[];
  buildPassed?: boolean;
  screenshotObservations?: string[];
  consoleErrors?: string[];
  userGoal?: string;
}): Promise<RescuePlan> {
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
  const highSignals =
    visibleResultCheck.status === "blocked-by-build" ||
    consoleErrorCount > 0 ||
    /crash|blank|white screen|not loading|build fail|runtime|broken|database|auth|payment|production/i.test(problem);
  const severity: RescuePlan["severity"] = highSignals ? "high" : dirtyFileCount > 0 ? "medium" : "low";

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
  description:
    "Routes product/UI work through Lovable and precise engineering work through OpenClaw, GitHub, tests, and code tools.",
  register(api) {
    api.registerTool({
      name: "lovable_decide_route",
      label: "Decide Lovable Route",
      description:
        "Decide whether OpenClaw should use Lovable, GitHub, local code tools, or a combination for a product-building request.",
      parameters: Type.Object({
        request: Type.String({ description: "The user's app-building or change request." }),
        repoExists: Type.Optional(Type.Boolean({ description: "Whether a GitHub repository already exists." })),
        hasVisualWork: Type.Optional(Type.Boolean({ description: "Whether the request includes UI, layout, or visual polish." })),
        hasPreciseCodeWork: Type.Optional(Type.Boolean({ description: "Whether the request needs exact code, tests, APIs, migrations, or debugging." })),
        hasDeploymentRisk: Type.Optional(Type.Boolean({ description: "Whether the task could publish, deploy, charge money, or affect production." })),
      }),
      async execute(_id, params: any) {
        return jsonText(decideRoute(params));
      },
    });

    api.registerTool({
      name: "lovable_make_prompt",
      label: "Make Lovable Prompt",
      description:
        "Convert a rough user product idea into a Lovable-ready prompt that focuses Lovable on UI/product generation and leaves exact engineering to OpenClaw.",
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
      async execute(_id, params: any) {
        return text(makePrompt(params));
      },
    });

    api.registerTool({
      name: "lovable_build_url",
      label: "Create Lovable URL",
      description:
        "Create a Lovable Build-with-URL autosubmit link from a prepared prompt. This does not open the browser.",
      parameters: Type.Object({
        prompt: Type.String(),
      }),
      async execute(_id, params: any) {
        return jsonText({ url: makeBuildUrl(params.prompt) });
      },
    });

    api.registerTool(
      {
        name: "lovable_open_build_url",
        label: "Open Lovable URL",
        description:
          "Open Lovable with an autosubmitted build prompt in the user's default browser. Use only after user approval when the prompt is final.",
        parameters: Type.Object({
          prompt: Type.String(),
        }),
        async execute(_id, params: any) {
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
      },
      { optional: true },
    );

    api.registerTool({
      name: "lovable_github_handoff",
      label: "Plan GitHub Handoff",
      description:
        "Create a GitHub handoff checklist after Lovable generates or updates an app, so OpenClaw can continue with code, tests, and PR work.",
      parameters: Type.Object({
        projectUrl: Type.Optional(Type.String()),
        repoUrl: Type.Optional(Type.String()),
        branchName: Type.Optional(Type.String()),
        requestedOutcome: Type.String(),
      }),
      async execute(_id, params: any) {
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
      name: "lovable_iteration_brief",
      label: "Draft Lovable Iteration",
      description:
        "Turn OpenClaw's repo/test/screenshot findings into a concise follow-up prompt for Lovable UI iteration.",
      parameters: Type.Object({
        currentState: Type.String(),
        problems: Type.Array(Type.String()),
        keep: optionalStringArray("Existing parts Lovable should preserve."),
        change: optionalStringArray("Specific UI/product changes Lovable should make."),
        avoid: optionalStringArray("Things Lovable should avoid touching."),
      }),
      async execute(_id, params: any) {
        const brief = [
          "Improve the existing Lovable project with the following focused UI/product iteration.",
          "",
          "Current state:",
          params.currentState,
          "",
          "Problems to solve:",
          ...params.problems.map((problem: string) => `- ${problem}`),
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
      description:
        "Assess a Lovable/GitHub repository from caller-supplied Git/package evidence and report framework signals, Git state, Lovable commit signals, recommended verification commands, and next action.",
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
      async execute(_id, params: any) {
        return jsonText(await inspectRepo(params));
      },
    });

    api.registerTool({
      name: "lovable_rescue_plan",
      label: "Rescue Existing App",
      description:
        "Diagnose and plan repairs for an existing Lovable app that is broken, invisible, messy, hard to extend, or not production-ready.",
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
      async execute(_id, params: any) {
        return jsonText(await makeRescuePlan(params));
      },
    });

    api.registerTool({
      name: "lovable_sync_risk_report",
      label: "Report Sync Risk",
      description:
        "Assess whether it is safe to prompt Lovable again for a GitHub-synced project, especially when local changes, main branch work, or Lovable bot commits are present.",
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
      async execute(_id, params: any) {
        const doctor = await inspectRepo(params);
        return jsonText(makeRiskReport(doctor, params.intendedAction));
      },
    });

    api.registerTool({
      name: "lovable_delivery_plan",
      label: "Plan Delivery",
      description:
        "Create a safe end-to-end delivery plan that chooses between Lovable UI prompting and OpenClaw/GitHub engineering work.",
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
      async execute(_id, params: any) {
        const doctor = params.repoPath ? await inspectRepo(params) : null;
        const risk = doctor ? makeRiskReport(doctor, params.requestedChange) : null;
        const useLovable =
          /ui|screen|page|layout|visual|responsive|design|landing|dashboard|polish|style/i.test(params.requestedChange) &&
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
      description:
        "Generate a PR description that separates Lovable-generated UI work from OpenClaw engineering work, verification, screenshots, and risks.",
      parameters: Type.Object({
        title: Type.String(),
        lovableChanges: optionalStringArray("UI/product changes generated or prompted in Lovable."),
        openClawChanges: optionalStringArray("Code, test, integration, CI, or security changes made by OpenClaw."),
        verification: optionalStringArray("Commands run and outcomes."),
        screenshots: optionalStringArray("Preview or screenshot URLs/paths."),
        risks: optionalStringArray("Known limitations or review concerns."),
      }),
      async execute(_id, params: any) {
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
      description:
        "Plan an optional, secure OpenClaw integration inside the app being built, with Lovable handling UI and OpenClaw implementing backend, permissions, approvals, and auditability.",
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
      async execute(_id, params: any) {
        return jsonText(makeOpenClawIntegrationPlan(params));
      },
    });

    api.registerTool({
      name: "lovable_visible_result_check",
      label: "Verify Visible Result",
      description:
        "Double-check Lovable's completion claim by requiring build/runtime checks plus visible browser or screenshot confirmation before accepting that the change works.",
      parameters: Type.Object({
        expectedChanges: Type.Array(Type.String({ description: "User-visible changes that should appear in the app." })),
        repoPath: Type.Optional(Type.String({ description: "Local repository path, if available." })),
        previewUrl: Type.Optional(Type.String({ description: "Lovable preview, deployed URL, or local dev server URL." })),
        buildPassed: Type.Optional(Type.Boolean({ description: "Whether build/typecheck/test verification passed." })),
        screenshotObservations: optionalStringArray("What is actually visible on screen or in screenshots."),
        consoleErrors: optionalStringArray("Browser console or runtime errors observed."),
      }),
      async execute(_id, params: any) {
        return jsonText(makeVisibleResultCheck(params));
      },
    });

    api.registerTool({
      name: "lovable_model_strategy",
      label: "Choose Model Strategy",
      description:
        "Help the user choose which configured OpenClaw LLM/model profile to use for planning, Lovable prompting, coding, debugging, review, or fast iteration.",
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
      async execute(_id, params: any) {
        return jsonText(makeModelStrategy(params));
      },
    });

    api.registerTool({
      name: "lovable_starter_guide",
      label: "Show Starter Guide",
      description:
        "Educate the user before they start by explaining what ClawKit can do, the safest workflow, example requests, choices they can make, and guardrails.",
      parameters: Type.Object({
        userLevel: Type.Optional(Type.Union([
          Type.Literal("beginner"),
          Type.Literal("builder"),
          Type.Literal("developer"),
          Type.Literal("agency"),
        ])),
        goal: Type.Optional(Type.String()),
      }),
      async execute(_id, params: any) {
        return jsonText(makeStarterGuide(params));
      },
    });

    api.registerTool({
      name: "lovable_mood_indicator",
      label: "Read Build Mood",
      description:
        "Generate a playful user frustration/mood indicator plus serious self-healing notes that guide OpenClaw to repair misunderstandings, verify evidence, and improve the next response.",
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
      async execute(_id, params: any) {
        return jsonText(makeMoodIndicator(params));
      },
    });
  },
});
