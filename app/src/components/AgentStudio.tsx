"use client";

import { useMemo, useState } from "react";
import {
  ActivityLogItem,
  AgentBlueprint,
  MissionConfig,
  MissionTimeframe,
  PlanStep,
  ToolRun,
  craftBlueprint,
  createActivity,
  runToolSimulation,
  searchKnowledge,
} from "@/lib/agent";
import {
  ArrowRight,
  BarChart3,
  Bolt,
  Brain,
  CheckCircle2,
  Clock4,
  Flame,
  Sparkles,
  Target,
  Telescope,
  Zap,
} from "lucide-react";

type Insight = {
  id: string;
  text: string;
  category: "signal" | "decision" | "note";
  createdAt: number;
};

const INITIAL_CONFIG: MissionConfig = {
  goal: "Launch an AI-native growth engine that doubles qualified pipeline within 90 days.",
  context:
    "B2B SaaS scaling to mid-market. Need rapid insights on buyer motion and automation opportunities.",
  timeframe: "90 days",
  intensity: "aggressive",
  guardrails: "Maintain brand trust and legal compliance while moving fast.",
};

const INITIAL_BLUEPRINT = craftBlueprint(INITIAL_CONFIG);

type PlanState = Record<string, "pending" | "active" | "done">;

const intensityOptions: MissionConfig["intensity"][] = [
  "aggressive",
  "balanced",
  "sustainable",
];

const timeframeOptions: MissionTimeframe[] = ["2 weeks", "30 days", "60 days", "90 days"];

function formatTime(timestamp: number) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(timestamp));
}

function InsightBadge({ category }: { category: Insight["category"] }) {
  const styles: Record<Insight["category"], string> = {
    signal: "bg-emerald-500/15 text-emerald-200 border border-emerald-500/30",
    decision: "bg-blue-500/15 text-blue-200 border border-blue-500/30",
    note: "bg-purple-500/15 text-purple-200 border border-purple-500/30",
  };

  const labels: Record<Insight["category"], string> = {
    signal: "Signal",
    decision: "Decision",
    note: "Note",
  };

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${styles[category]}`}>
      {labels[category]}
    </span>
  );
}

const categoryOptions: Insight["category"][] = ["signal", "decision", "note"];

type ToolHistory = Record<string, ToolRun[]>;

export function AgentStudio() {
  const [config, setConfig] = useState<MissionConfig>(INITIAL_CONFIG);
  const [blueprint, setBlueprint] =
    useState<AgentBlueprint>(INITIAL_BLUEPRINT);
  const [planStates, setPlanStates] = useState<PlanState>(() => {
    const next: PlanState = {};
    INITIAL_BLUEPRINT.plan.forEach((step, index) => {
      next[step.id] = index === 0 ? "active" : "pending";
    });
    return next;
  });
  const [activity, setActivity] = useState<ActivityLogItem[]>(() => [
    createActivity(
      "Agent Primed",
      "Mission seeded with default aggressive growth blueprint."
    ),
  ]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [insightDraft, setInsightDraft] = useState("");
  const [insightCategory, setInsightCategory] =
    useState<Insight["category"]>("signal");
  const [knowledgeQuery, setKnowledgeQuery] = useState("");
  const [toolHistory, setToolHistory] = useState<ToolHistory>({});

  const knowledgeResults = useMemo(
    () => searchKnowledge(knowledgeQuery),
    [knowledgeQuery]
  );

  const activeStep = useMemo(
    () => blueprint.plan.find((step) => planStates[step.id] === "active"),
    [blueprint.plan, planStates]
  );

  function handleGenerate() {
    const nextBlueprint = craftBlueprint(config);
    setBlueprint(nextBlueprint);
    const nextStates: PlanState = {};
    nextBlueprint.plan.forEach((step, index) => {
      nextStates[step.id] = index === 0 ? "active" : "pending";
    });
    setPlanStates(nextStates);
    setActivity((prev) => [
      createActivity(
        "Mission Rebuilt",
        `Agent recalibrated around "${config.goal || "new objective"}".`
      ),
      ...prev,
    ]);
  }

  function handleAdvance(step: PlanStep) {
    setPlanStates((prev) => {
      const next: PlanState = { ...prev, [step.id]: "done" };
      const currentIndex = blueprint.plan.findIndex((item) => item.id === step.id);
      const nextStep = blueprint.plan[currentIndex + 1];
      if (nextStep) {
        next[nextStep.id] = "active";
      }
      return next;
    });

    setActivity((prev) => [
      createActivity(
        "Step Advanced",
        `${step.title} marked complete. Catalyst: ${step.catalyst}.`
      ),
      ...prev,
    ]);
  }

  function handleInsightCreate() {
    if (!insightDraft.trim()) return;
    const entry: Insight = {
      id: `insight-${Date.now()}`,
      text: insightDraft.trim(),
      category: insightCategory,
      createdAt: Date.now(),
    };
    setInsights((prev) => [entry, ...prev]);
    setInsightDraft("");
    setActivity((prev) => [
      createActivity("Insight Captured", entry.text),
      ...prev,
    ]);
  }

  function handleToolRun(toolId: string, query: string) {
    const run = runToolSimulation(toolId, query);
    setToolHistory((prev) => {
      const history = prev[toolId] || [];
      return {
        ...prev,
        [toolId]: [run, ...history].slice(0, 5),
      };
    });
    setActivity((prev) => [
      createActivity("Tool Fired", `${toolId} returned ${run.headline}`),
      ...prev,
    ]);
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.16),transparent_55%)]" />
      <div className="relative mx-auto w-full max-w-6xl px-6 pb-20 pt-16">
        <header className="mb-12">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-3">
                <span className="rounded-full border border-cyan-400/40 bg-cyan-500/10 px-4 py-1 text-sm uppercase tracking-widest text-cyan-200">
                  Apex Operator
                </span>
                <span className="flex items-center gap-2 text-sm text-cyan-200/80">
                  <Sparkles className="h-4 w-4 text-cyan-300" />
                  Agent-grade strategy engine online
                </span>
              </div>
              <h1 className="text-4xl font-semibold tracking-tight text-slate-50 md:text-5xl">
                {blueprint.missionTitle}
              </h1>
              <p className="mt-4 max-w-2xl text-lg text-slate-300">
                {blueprint.missionSummary}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-5 text-sm text-cyan-100 md:text-base">
              <div>
                <div className="flex items-center gap-2 text-cyan-200/80">
                  <Flame className="h-4 w-4" />
                  Intensity
                </div>
                <p className="mt-2 font-semibold capitalize text-cyan-100">
                  {config.intensity}
                </p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-cyan-200/80">
                  <Clock4 className="h-4 w-4" />
                  Timeframe
                </div>
                <p className="mt-2 font-semibold text-cyan-100">{config.timeframe}</p>
              </div>
              <div className="col-span-2 flex items-center gap-2 text-cyan-200/80">
                <Zap className="h-4 w-4" />
                {blueprint.operatingMode}
              </div>
            </div>
          </div>
          <p className="mt-3 text-sm text-slate-400">{blueprint.missionArc}</p>
        </header>

        <div className="grid gap-8 lg:grid-cols-[360px,1fr]">
          <aside className="flex flex-col gap-8">
            <section className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-50">Mission Config</h2>
                <Bolt className="h-5 w-5 text-cyan-300" />
              </div>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="mb-2 block text-xs uppercase tracking-[0.2em] text-slate-400">
                    Mission Goal
                  </label>
                  <textarea
                    className="min-h-[96px] w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 outline-none ring-2 ring-transparent transition focus:border-cyan-400/50 focus:ring-cyan-500/30"
                    value={config.goal}
                    onChange={(event) =>
                      setConfig((prev) => ({ ...prev, goal: event.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs uppercase tracking-[0.2em] text-slate-400">
                    Operating Context
                  </label>
                  <textarea
                    className="min-h-[72px] w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 outline-none ring-2 ring-transparent transition focus:border-cyan-400/50 focus:ring-cyan-500/30"
                    value={config.context}
                    onChange={(event) =>
                      setConfig((prev) => ({ ...prev, context: event.target.value }))
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-2 block text-xs uppercase tracking-[0.2em] text-slate-400">
                      Timeframe
                    </label>
                    <select
                      className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-3 py-3 text-sm text-slate-100 outline-none ring-2 ring-transparent transition focus:border-cyan-400/50 focus:ring-cyan-500/30"
                      value={config.timeframe}
                      onChange={(event) =>
                        setConfig((prev) => ({
                          ...prev,
                          timeframe: event.target.value as MissionTimeframe,
                        }))
                      }
                    >
                      {timeframeOptions.map((option) => (
                        <option key={option} value={option} className="bg-slate-900">
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-xs uppercase tracking-[0.2em] text-slate-400">
                      Intensity
                    </label>
                    <select
                      className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-3 py-3 text-sm text-slate-100 outline-none ring-2 ring-transparent transition focus:border-cyan-400/50 focus:ring-cyan-500/30"
                      value={config.intensity}
                      onChange={(event) =>
                        setConfig((prev) => ({
                          ...prev,
                          intensity: event.target.value as MissionConfig["intensity"],
                        }))
                      }
                    >
                      {intensityOptions.map((option) => (
                        <option key={option} value={option} className="bg-slate-900">
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-xs uppercase tracking-[0.2em] text-slate-400">
                    Guardrails
                  </label>
                  <textarea
                    className="min-h-[60px] w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 outline-none ring-2 ring-transparent transition focus:border-cyan-400/50 focus:ring-cyan-500/30"
                    value={config.guardrails}
                    onChange={(event) =>
                      setConfig((prev) => ({ ...prev, guardrails: event.target.value }))
                    }
                  />
                </div>
                <button
                  onClick={handleGenerate}
                  className="group mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-cyan-400"
                >
                  Ignite Agent
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </button>
              </div>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-50">Tool Console</h2>
                <Brain className="h-5 w-5 text-cyan-300" />
              </div>
              <div className="space-y-5">
                {blueprint.tools.map((tool) => (
                  <div
                    key={tool.id}
                    className="rounded-2xl border border-white/10 bg-slate-900/60 p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-100">
                          {tool.name}
                        </h3>
                        <p className="mt-1 text-xs text-slate-400">{tool.description}</p>
                      </div>
                      <button
                        onClick={() => handleToolRun(tool.id, config.goal)}
                        className="rounded-full border border-cyan-500/40 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-200 transition hover:border-cyan-400 hover:bg-cyan-500/20"
                      >
                        Fire
                      </button>
                    </div>
                    <p className="mt-3 text-xs text-slate-400">{tool.scenario}</p>
                    {toolHistory[tool.id]?.length ? (
                      <div className="mt-4 space-y-3">
                        {toolHistory[tool.id].map((run) => (
                          <div
                            key={run.timestamp}
                            className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-3"
                          >
                            <div className="flex items-center justify-between text-xs text-cyan-200">
                              <span>{formatTime(run.timestamp)}</span>
                              <span>{run.signalStrength}% signal</span>
                            </div>
                            <p className="mt-2 text-sm font-semibold text-cyan-100">
                              {run.headline}
                            </p>
                            <p className="mt-1 text-xs text-cyan-100/80">{run.insight}</p>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-50">Knowledge Grid</h2>
                <Telescope className="h-5 w-5 text-cyan-300" />
              </div>
              <div className="space-y-4">
                <input
                  value={knowledgeQuery}
                  onChange={(event) => setKnowledgeQuery(event.target.value)}
                  placeholder="Search for frameworks, rituals, assets…"
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 outline-none ring-2 ring-transparent transition focus:border-cyan-400/50 focus:ring-cyan-500/30"
                />
                <div className="space-y-3">
                  {knowledgeResults.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-white/10 bg-slate-900/60 p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-sm font-semibold text-slate-100">
                          {item.title}
                        </h3>
                        <span className="rounded-full border border-slate-500/40 px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-slate-300">
                          Asset
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-slate-400">{item.summary}</p>
                      <div className="mt-3 flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.2em] text-slate-400">
                        {item.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full border border-white/10 bg-white/5 px-2 py-1"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </aside>

          <main className="flex flex-col gap-8">
            <section className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-50">
                    Adaptive Plan Timeline
                  </h2>
                  <p className="mt-1 text-sm text-slate-400">
                    {blueprint.cadence}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-cyan-200">
                  <Target className="h-4 w-4" />
                  {activeStep ? `Current focus: ${activeStep.title}` : "All steps complete"}
                </div>
              </div>
              <div className="space-y-4">
                {blueprint.plan.map((step, index) => {
                  const status = planStates[step.id] ?? "pending";
                  const isActive = status === "active";
                  const isDone = status === "done";
                  return (
                    <div
                      key={step.id}
                      className={`relative overflow-hidden rounded-3xl border p-6 transition ${
                        isActive
                          ? "border-cyan-400/50 bg-cyan-500/10"
                          : isDone
                          ? "border-emerald-500/30 bg-emerald-500/10"
                          : "border-white/10 bg-slate-900/60"
                      }`}
                    >
                      <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-cyan-400/80 to-cyan-600/40" />
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-300">
                              Phase {index + 1}
                            </span>
                            <span className="text-xs uppercase tracking-[0.2em] text-slate-400">
                              {step.duration}
                            </span>
                          </div>
                          <h3 className="mt-3 text-xl font-semibold text-slate-50">
                            {step.title}
                          </h3>
                          <p className="mt-2 text-sm text-slate-300">{step.narrative}</p>
                          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                            <span className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1 uppercase tracking-[0.2em]">
                              <Bolt className="h-3 w-3 text-cyan-300" />
                              {step.leverage}
                            </span>
                            <span className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1 uppercase tracking-[0.2em]">
                              <BarChart3 className="h-3 w-3 text-emerald-300" />
                              {step.confidence}% confidence
                            </span>
                            <span className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1 uppercase tracking-[0.2em]">
                              <Flame className="h-3 w-3 text-amber-300" />
                              {step.energy} energy
                            </span>
                            <span className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1 uppercase tracking-[0.2em]">
                              <Sparkles className="h-3 w-3 text-pink-300" />
                              Catalyst: {step.catalyst}
                            </span>
                          </div>
                        </div>
                        <div className="flex w-full flex-col gap-3 md:w-[180px]">
                          <button
                            disabled={!isActive}
                            onClick={() => handleAdvance(step)}
                            className={`flex items-center justify-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                              isActive
                                ? "bg-cyan-500 text-slate-900 hover:bg-cyan-400"
                                : isDone
                                ? "bg-emerald-500/20 text-emerald-200"
                                : "bg-slate-800 text-slate-400"
                            }`}
                          >
                            {isDone ? (
                              <>
                                Completed
                                <CheckCircle2 className="h-4 w-4" />
                              </>
                            ) : isActive ? (
                              <>
                                Mark Complete
                                <CheckCircle2 className="h-4 w-4" />
                              </>
                            ) : (
                              <>
                                Locked
                                <LockIcon />
                              </>
                            )}
                          </button>
                          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-slate-300">
                            Dependencies:{" "}
                            {step.dependencies.length ? step.dependencies.join(", ") : "None"}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <h2 className="text-lg font-semibold text-slate-50">Strategic Anchors</h2>
              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <Bolt className="h-4 w-4 text-cyan-300" />
                    Immediate Quick Wins
                  </div>
                  <div className="mt-4 space-y-4">
                    {blueprint.quickActions.map((action) => (
                      <div key={action.id}>
                        <p className="text-sm font-semibold text-slate-100">
                          {action.label}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">{action.objective}</p>
                        <p className="mt-1 text-xs text-slate-300">
                          Value: {action.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <Target className="h-4 w-4 text-cyan-300" />
                    Success Metrics
                  </div>
                  <div className="mt-4 space-y-4">
                    {blueprint.metrics.map((metric) => (
                      <div key={metric.id}>
                        <p className="text-sm font-semibold text-slate-100">
                          {metric.label}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">{metric.target}</p>
                        <p className="mt-1 text-xs text-slate-300">
                          Cadence: {metric.cadence}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <h2 className="text-lg font-semibold text-slate-50">Focus Vector Map</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {blueprint.focusMap.map((focus) => (
                  <div
                    key={focus.id}
                    className="rounded-2xl border border-white/10 bg-slate-900/60 p-4"
                  >
                    <div className="flex items-center justify-between text-sm text-slate-300">
                      <span>{focus.label}</span>
                      <span className="text-cyan-200">{focus.score}</span>
                    </div>
                    <p className="mt-3 text-xs text-slate-400">{focus.driver}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-slate-50">
                    Insight Stream
                  </h2>
                  <p className="mt-1 text-sm text-slate-400">
                    Capture emergent signals and decisions to maintain institutional memory.
                  </p>
                  <div className="mt-4 space-y-3">
                    <select
                      className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 outline-none ring-2 ring-transparent transition focus:border-cyan-400/50 focus:ring-cyan-500/30"
                      value={insightCategory}
                      onChange={(event) =>
                        setInsightCategory(event.target.value as Insight["category"])
                      }
                    >
                      {categoryOptions.map((category) => (
                        <option key={category} value={category} className="bg-slate-900">
                          {category}
                        </option>
                      ))}
                    </select>
                    <textarea
                      value={insightDraft}
                      onChange={(event) => setInsightDraft(event.target.value)}
                      placeholder="Record a decisive signal, choice, or nuance…"
                      className="min-h-[100px] w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 outline-none ring-2 ring-transparent transition focus:border-cyan-400/50 focus:ring-cyan-500/30"
                    />
                    <button
                      onClick={handleInsightCreate}
                      className="flex items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-cyan-400"
                    >
                      Capture Insight
                      <Sparkles className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-300">
                      Insight Ledger
                    </h3>
                    <span className="text-xs text-slate-400">
                      {insights.length} entries
                    </span>
                  </div>
                  <div className="mt-4 space-y-3 max-h-[260px] overflow-y-auto pr-2">
                    {insights.length === 0 ? (
                      <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 text-sm text-slate-400">
                        Insights you capture will appear here with their context.
                      </div>
                    ) : (
                      insights.map((insight) => (
                        <div
                          key={insight.id}
                          className="rounded-2xl border border-white/10 bg-slate-900/60 p-4"
                        >
                          <div className="flex items-center justify-between">
                            <InsightBadge category={insight.category} />
                            <span className="text-[11px] text-slate-400">
                              {formatTime(insight.createdAt)}
                            </span>
                          </div>
                          <p className="mt-3 text-sm text-slate-200">{insight.text}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <h2 className="text-lg font-semibold text-slate-50">Activity Stream</h2>
              <div className="mt-4 space-y-3 max-h-[240px] overflow-y-auto pr-2">
                {activity.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 rounded-2xl border border-white/10 bg-slate-900/60 p-4"
                  >
                    <div className="mt-1 h-2.5 w-2.5 rounded-full bg-cyan-400" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-slate-100">
                          {item.label}
                        </p>
                        <span className="text-xs text-slate-400">
                          {formatTime(item.timestamp)}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-400">{item.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}

function LockIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-slate-400"
    >
      <path
        d="M7 10V7C7 4.79086 8.79086 3 11 3C13.2091 3 15 4.79086 15 7V10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <rect
        x="5.5"
        y="10"
        width="11"
        height="10.5"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M12 14.5V17.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default AgentStudio;
