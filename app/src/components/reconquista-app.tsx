import { Suspense, lazy, useEffect, useState, type ReactNode } from "react";

import { BottomNav, type AppTab } from "@/components/home/bottom-nav";
import { HomeScreen } from "@/components/home/home-screen";
import { MilestoneCelebration } from "@/components/plan/milestone-celebration";
import type { RulesSection } from "@/components/tools/rules-panel";
import { Button } from "@/components/ui/button";
import { MILESTONES, type Milestone, type PlanTool } from "@/lib/plan";
import type { ScenarioId } from "@/lib/scenarios";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

// O Início vem no carregamento inicial; o resto (login, outras abas e ferramentas) vira pedaços
// separados, carregados sob demanda e pré-carregados quando o navegador fica ocioso.
const loaders = {
  login: () => import("@/components/login-screen"),
  plan: () => import("@/components/plan/plan-screen"),
  day: () => import("@/components/plan/day-panel"),
  scenarios: () => import("@/components/scenarios/scenarios-screen"),
  scenario: () => import("@/components/scenarios/scenario-panel"),
  diary: () => import("@/components/diary-screen"),
  more: () => import("@/components/more-screen"),
  pause: () => import("@/components/tools/pause-tool"),
  rules: () => import("@/components/tools/rules-panel"),
  reset: () => import("@/components/reset/reset-screen"),
};

const LoginScreen = lazy(() => loaders.login().then((m) => ({ default: m.LoginScreen })));
const PlanScreen = lazy(() => loaders.plan().then((m) => ({ default: m.PlanScreen })));
const DayPanel = lazy(() => loaders.day().then((m) => ({ default: m.DayPanel })));
const ScenariosScreen = lazy(() =>
  loaders.scenarios().then((m) => ({ default: m.ScenariosScreen })),
);
const ScenarioPanel = lazy(() => loaders.scenario().then((m) => ({ default: m.ScenarioPanel })));
const DiaryScreen = lazy(() => loaders.diary().then((m) => ({ default: m.DiaryScreen })));
const MoreScreen = lazy(() => loaders.more().then((m) => ({ default: m.MoreScreen })));
const PauseTool = lazy(() => loaders.pause().then((m) => ({ default: m.PauseTool })));
const RulesPanel = lazy(() => loaders.rules().then((m) => ({ default: m.RulesPanel })));
const CommitmentPanel = lazy(() => loaders.rules().then((m) => ({ default: m.CommitmentPanel })));
const ResetScreen = lazy(() => loaders.reset().then((m) => ({ default: m.ResetScreen })));

/** Pré-carrega todos os pedaços quando o navegador estiver livre, para trocar de aba sem espera. */
function usePrefetch() {
  useEffect(() => {
    const run = () => Object.values(loaders).forEach((load) => void load().catch(() => {}));
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(run, { timeout: 3000 });
      return () => window.cancelIdleCallback(id);
    }
    const timer = window.setTimeout(run, 1500);
    return () => window.clearTimeout(timer);
  }, []);
}

/** Enquanto um pedaço carrega: tela vazia com o fundo do app (sem piscar conteúdo). */
function TabFallback() {
  return <div className="min-h-dvh" aria-busy="true" />;
}
function LayerFallback() {
  return <div className="fixed inset-0 z-50 bg-background" aria-busy="true" />;
}

/** Pilha de camadas, igual à do CalmBaby: cada ferramenta abre por cima e fechar volta para onde estava. */
type Layer =
  | { kind: "day"; day: number }
  | { kind: "scenario"; id: ScenarioId }
  | { kind: "pause"; draft: string }
  | { kind: "rules"; section?: RulesSection }
  | { kind: "commitment" }
  | { kind: "reset" };

/** Aviso no topo (erro de gravação ou confirmação curta), como o SaveErrorToast do CalmBaby. */
function Toast() {
  const { toast, clearToast } = useStore();
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(clearToast, toast.kind === "error" ? 6000 : 3000);
    return () => window.clearTimeout(timer);
  }, [toast, clearToast]);
  if (!toast) return null;
  return (
    <div
      role={toast.kind === "error" ? "alert" : "status"}
      className={cn(
        "pointer-events-none fixed inset-x-0 top-3 z-[60] mx-auto w-[calc(100%-2rem)] max-w-[400px] rounded-xl px-4 py-3 text-sm font-bold shadow-float",
        toast.kind === "error"
          ? "border border-destructive/30 bg-destructive-soft text-destructive"
          : "bg-foreground text-primary-foreground",
      )}
    >
      {toast.text}
    </div>
  );
}

function FullScreenMessage({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-dvh place-items-center bg-background px-6 text-center">
      <div className="max-w-xs">{children}</div>
    </div>
  );
}

export function ReconquistaApp() {
  const { status, data, reload } = useStore();
  const [tab, setTab] = useState<AppTab>("home");
  const [layers, setLayers] = useState<Layer[]>([]);
  const [milestone, setMilestone] = useState<Milestone | null>(null);

  useEffect(() => {
    if (tab !== "plan") window.scrollTo({ top: 0 });
  }, [tab]);

  // Ao sair (ou ao entrar com outra conta), não reaproveita telas abertas da conta anterior.
  useEffect(() => {
    if (status !== "ready") {
      setTab("home");
      setLayers([]);
      setMilestone(null);
    }
  }, [status]);

  usePrefetch();

  if (status === "loading")
    return (
      <FullScreenMessage>
        <p className="text-sm text-muted-foreground">Carregando…</p>
      </FullScreenMessage>
    );
  if (status === "error")
    return (
      <FullScreenMessage>
        <h1 className="font-display text-xl font-extrabold">Não foi possível carregar</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Confira a internet e tente de novo.
        </p>
        <Button className="mt-5 h-11 rounded-xl" onClick={reload}>
          Tentar de novo
        </Button>
      </FullScreenMessage>
    );
  if (status === "signed-out" || status === "no-access" || !data.profile)
    return (
      <>
        <Suspense fallback={<TabFallback />}>
          <LoginScreen
            {...(status === "no-access"
              ? {
                  notice:
                    "Não encontramos uma compra ativa para este acesso. Se você pediu reembolso, o acesso foi encerrado. Em caso de dúvida, fale com o suporte.",
                }
              : {})}
          />
        </Suspense>
        <Toast />
      </>
    );

  const push = (layer: Layer) => setLayers((current) => [...current, layer]);
  const pop = () => setLayers((current) => current.slice(0, -1));
  const goTab = (next: AppTab) => {
    setLayers([]);
    setTab(next);
  };
  const openDay = (day: number) => push({ kind: "day", day });
  const openScenario = (id: ScenarioId) => push({ kind: "scenario", id });
  const openPause = (draft = "") => push({ kind: "pause", draft });
  const openRules = (section?: RulesSection) =>
    push(section ? { kind: "rules", section } : { kind: "rules" });
  const openCommitment = () => push({ kind: "commitment" });
  const openReset = () => push({ kind: "reset" });
  const openTool = (tool: PlanTool) => {
    if (tool === "diary") goTab("diary");
    else if (tool === "pause") openPause();
    else openRules();
  };

  const renderLayer = (layer: Layer) => {
    if (layer.kind === "day")
      return (
        <DayPanel
          day={layer.day}
          onClose={pop}
          openTool={openTool}
          onCompleted={(day) => setMilestone(MILESTONES.find((item) => item.day === day) ?? null)}
        />
      );
    if (layer.kind === "scenario")
      return <ScenarioPanel id={layer.id} onClose={pop} openDay={openDay} openPause={openPause} />;
    if (layer.kind === "pause")
      return <PauseTool initialDraft={layer.draft} onClose={pop} openScenario={openScenario} />;
    if (layer.kind === "rules") return <RulesPanel section={layer.section} onClose={pop} />;
    if (layer.kind === "reset") return <ResetScreen onClose={pop} />;
    return <CommitmentPanel onClose={pop} />;
  };

  return (
    <div className="min-h-dvh bg-app-shell text-foreground">
      <div className="mx-auto min-h-dvh max-w-[430px] overflow-x-clip bg-background md:shadow-app">
        {tab === "plan" ? (
          // Como no CalmBaby: tela própria, sem a navegação inferior, com o cartão flutuante.
          <Suspense fallback={<TabFallback />}>
            <PlanScreen onBack={() => setTab("home")} openDay={openDay} />
          </Suspense>
        ) : (
          <>
            <main>
              <Suspense fallback={<TabFallback />}>
                {tab === "home" && (
                  <HomeScreen
                    openDay={openDay}
                    openPlan={() => setTab("plan")}
                    openPause={() => openPause()}
                    openRules={openRules}
                    openScenario={openScenario}
                    openScenarios={() => setTab("scenarios")}
                    openDiary={() => setTab("diary")}
                    openCommitment={openCommitment}
                    openReset={openReset}
                    openMore={() => setTab("more")}
                  />
                )}
                {tab === "scenarios" && (
                  <ScenariosScreen openScenario={openScenario} openRules={openRules} />
                )}
                {tab === "diary" && <DiaryScreen openPause={openPause} />}
                {tab === "more" && (
                  <MoreScreen
                    openScenarios={() => setTab("scenarios")}
                    openRules={() => openRules()}
                    openCommitment={openCommitment}
                    openReset={openReset}
                  />
                )}
              </Suspense>
            </main>
            <BottomNav active={tab} onSelect={setTab} />
          </>
        )}
      </div>

      {layers.map((layer, index) => (
        <Suspense key={`${layer.kind}-${index}`} fallback={<LayerFallback />}>
          {renderLayer(layer)}
        </Suspense>
      ))}

      <MilestoneCelebration milestone={milestone} onClose={() => setMilestone(null)} />
      <Toast />
    </div>
  );
}
