import { Suspense, lazy, useEffect, useState, type ReactNode } from "react";
import { LoaderCircle } from "lucide-react";

import { BottomNav, type AppTab } from "@/components/home/bottom-nav";
import { HomeScreen } from "@/components/home/home-screen";
import { MilestoneCelebration } from "@/components/plan/milestone-celebration";
import type { RulesSection } from "@/components/tools/rules-panel";
import { Button } from "@/components/ui/button";
import { JornadaProvider } from "@/lib/jornada/store";
import type { CommCategoryId, ReplySituationId } from "@/lib/comunicacao/types";
import type { First48ActivityId, StepTarget } from "@/lib/jornada/types";
import type { AppLink } from "@/lib/app-link";
import type { BenefitId } from "@/lib/benefits";
import { MILESTONES, type Milestone } from "@/lib/plan";
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
  diagnosis: () => import("@/components/jornada/diagnosis-flow"),
  map: () => import("@/components/jornada/map-screen"),
  first48: () => import("@/components/jornada/first48-screen"),
  central: () => import("@/components/comunicacao/central-screen"),
  message: () => import("@/components/comunicacao/message-detail"),
  reply: () => import("@/components/comunicacao/reply-guide"),
  progress: () => import("@/components/progress-screen"),
  benefits: () => import("@/components/benefits-screen"),
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
const ResetScreen = lazy(() => loaders.reset().then((m) => ({ default: m.ResetScreen })));
const DiagnosisFlow = lazy(() => loaders.diagnosis().then((m) => ({ default: m.DiagnosisFlow })));
const MapScreen = lazy(() => loaders.map().then((m) => ({ default: m.MapScreen })));
const First48Screen = lazy(() => loaders.first48().then((m) => ({ default: m.First48Screen })));
const CentralScreen = lazy(() => loaders.central().then((m) => ({ default: m.CentralScreen })));
const MessageDetail = lazy(() => loaders.message().then((m) => ({ default: m.MessageDetail })));
const ReplyGuideScreen = lazy(() => loaders.reply().then((m) => ({ default: m.ReplyGuideScreen })));
const ProgressScreen = lazy(() => loaders.progress().then((m) => ({ default: m.ProgressScreen })));
const BenefitsScreen = lazy(() => loaders.benefits().then((m) => ({ default: m.BenefitsScreen })));

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

/** Indicador discreto que só aparece se a espera passar de 400 ms (em conexão boa, nada pisca). */
function Spinner() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(true), 400);
    return () => window.clearTimeout(timer);
  }, []);
  return (
    <div className="grid min-h-[60dvh] place-items-center" role="status">
      <LoaderCircle
        aria-hidden
        className={cn(
          "size-7 animate-spin text-primary/70 transition-opacity motion-reduce:animate-none",
          visible ? "opacity-100" : "opacity-0",
        )}
      />
      <span className="sr-only">Carregando</span>
    </div>
  );
}

/** Enquanto um pedaço carrega: o fundo do app e, se demorar, o indicador. */
function TabFallback() {
  return (
    <div className="min-h-dvh" aria-busy="true">
      <Spinner />
    </div>
  );
}
function LayerFallback() {
  return (
    <div className="fixed inset-0 z-50 bg-background" aria-busy="true">
      <Spinner />
    </div>
  );
}

/** Pilha de camadas, igual à do CalmBaby: cada ferramenta abre por cima e fechar volta para onde estava. */
type Layer =
  | { kind: "day"; day: number }
  | { kind: "scenario"; id: ScenarioId }
  | { kind: "pause"; draft: string }
  | { kind: "rules"; section?: RulesSection }
  | { kind: "reset" }
  | { kind: "diagnosis" }
  | { kind: "map" }
  | { kind: "first48"; activity?: First48ActivityId }
  | { kind: "central"; category?: CommCategoryId; scenario?: ScenarioId }
  | { kind: "message"; id: string }
  | { kind: "reply"; situation?: ReplySituationId }
  | { kind: "progress" }
  | { kind: "benefits"; only?: BenefitId };

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
        <LoaderCircle
          aria-hidden
          className="mx-auto size-7 animate-spin text-primary/70 motion-reduce:animate-none"
        />
        <p className="mt-3 text-sm text-muted-foreground">Carregando…</p>
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
  /** Troca a camada do topo (ex.: o diagnóstico concluído vira o mapa, e o mapa refeito vira o diagnóstico). */
  const replaceTop = (layer: Layer) => setLayers((current) => [...current.slice(0, -1), layer]);
  const goTab = (next: AppTab) => {
    setLayers([]);
    setTab(next);
  };
  const openDay = (day: number) => push({ kind: "day", day });
  const openScenario = (id: ScenarioId) => push({ kind: "scenario", id });
  const openPause = (draft = "") => push({ kind: "pause", draft });
  const openRules = (section?: RulesSection) =>
    push(section ? { kind: "rules", section } : { kind: "rules" });
  const openReset = () => push({ kind: "reset" });
  const openDiagnosis = () => push({ kind: "diagnosis" });
  const openMap = () => push({ kind: "map" });
  const openFirst48 = (activity?: First48ActivityId) =>
    push(activity ? { kind: "first48", activity } : { kind: "first48" });
  const openCentral = (filter: { category?: CommCategoryId; scenario?: ScenarioId } = {}) =>
    push({ kind: "central", ...filter });
  const openMessage = (id: string) => push({ kind: "message", id });
  const openReply = (situation?: ReplySituationId) =>
    push(situation ? { kind: "reply", situation } : { kind: "reply" });
  const openProgress = () => push({ kind: "progress" });
  const openBenefits = (only?: BenefitId) =>
    push(only ? { kind: "benefits", only } : { kind: "benefits" });
  /** Atalhos do plano de 21 dias e dos cenários (lib/app-link.ts). */
  const openLink = (link: AppLink) => {
    if (link.kind === "pause") openPause();
    else if (link.kind === "diary") goTab("diary");
    else if (link.kind === "rules") openRules(link.section);
    else if (link.kind === "central") openCentral(link.category ? { category: link.category } : {});
    else if (link.kind === "message") openMessage(link.id);
    else if (link.kind === "reply") openReply(link.situation);
    else if (link.kind === "scenario") {
      const id = link.id ?? data.profile?.scenario;
      if (id) openScenario(id);
      else goTab("scenarios");
    } else if (link.kind === "day") openDay(link.day);
    else if (link.kind === "map") openMap();
    else openDiagnosis();
  };
  /** Destino do primeiro passo do Mapa e dos atalhos do Meu Plano Pessoal. */
  const openStep = (target: StepTarget, scenario: ScenarioId) => {
    if (target === "plan") goTab("plan");
    else if (target === "diary") goTab("diary");
    else if (target === "pause") openPause();
    else if (target === "rules") openRules();
    else if (target === "signals" || target === "never") openRules(target);
    else if (target === "scenario") openScenario(scenario);
    else goTab("more");
  };

  const renderLayer = (layer: Layer) => {
    if (layer.kind === "day")
      return (
        <DayPanel
          day={layer.day}
          onClose={pop}
          openLink={openLink}
          onCompleted={(day) => setMilestone(MILESTONES.find((item) => item.day === day) ?? null)}
        />
      );
    if (layer.kind === "scenario")
      return (
        <ScenarioPanel
          id={layer.id}
          onClose={pop}
          openDay={openDay}
          openCentral={() => openCentral({ scenario: layer.id })}
          openMessage={openMessage}
          openLink={openLink}
        />
      );
    if (layer.kind === "pause")
      return <PauseTool initialDraft={layer.draft} onClose={pop} openScenario={openScenario} />;
    if (layer.kind === "rules") return <RulesPanel section={layer.section} onClose={pop} />;
    if (layer.kind === "reset") return <ResetScreen onClose={pop} />;
    if (layer.kind === "diagnosis")
      return <DiagnosisFlow onClose={pop} onDone={() => replaceTop({ kind: "map" })} />;
    if (layer.kind === "map")
      return (
        <MapScreen
          onClose={pop}
          redo={() => replaceTop({ kind: "diagnosis" })}
          go={openStep}
          openScenario={openScenario}
          openFirst48={() => openFirst48()}
          openCentral={() => openCentral()}
        />
      );
    if (layer.kind === "first48")
      return (
        <First48Screen
          initial={layer.activity}
          onClose={pop}
          openStep={openStep}
          openMap={openMap}
          openPause={openPause}
          openDay={openDay}
          openPlan={() => goTab("plan")}
          openCentral={() => openCentral()}
        />
      );
    if (layer.kind === "central")
      return (
        <CentralScreen
          initialCategory={layer.category}
          initialScenario={layer.scenario}
          onClose={pop}
          openMessage={openMessage}
          openReply={() => openReply()}
          openPause={openPause}
          openDiagnosis={openDiagnosis}
        />
      );
    if (layer.kind === "message")
      return (
        <MessageDetail
          id={layer.id}
          onClose={pop}
          openMessage={openMessage}
          openReply={() => openReply()}
          openPause={openPause}
        />
      );
    if (layer.kind === "reply")
      return (
        <ReplyGuideScreen
          initial={layer.situation}
          onClose={pop}
          openMessage={openMessage}
          openPause={openPause}
          openDiagnosis={openDiagnosis}
          openCentral={(category) => openCentral({ category })}
          openScenario={openScenario}
          openDay={openDay}
          openRules={openRules}
        />
      );
    if (layer.kind === "progress")
      return (
        <ProgressScreen
          onClose={pop}
          openDiagnosis={openDiagnosis}
          openMap={openMap}
          openFirst48={() => openFirst48()}
          openPlan={() => goTab("plan")}
          openDiary={() => goTab("diary")}
        />
      );
    return <BenefitsScreen only={layer.only} onClose={pop} openReset={openReset} />;
  };

  return (
    <JornadaProvider>
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
                      openMore={() => setTab("more")}
                      openDiagnosis={openDiagnosis}
                      openMap={openMap}
                      openStep={openStep}
                      openFirst48={openFirst48}
                      openCentral={() => openCentral()}
                      openReply={() => openReply()}
                      openProgress={openProgress}
                      openBenefits={openBenefits}
                    />
                  )}
                  {tab === "scenarios" && (
                    <ScenariosScreen openScenario={openScenario} openRules={openRules} />
                  )}
                  {tab === "diary" && (
                    <DiaryScreen openPause={openPause} openReply={() => openReply()} />
                  )}
                  {tab === "more" && (
                    <MoreScreen
                      openScenarios={() => setTab("scenarios")}
                      openRules={() => openRules()}
                      openReset={openReset}
                      openDiagnosis={openDiagnosis}
                      openMap={openMap}
                      openFirst48={() => openFirst48()}
                      openCentral={() => openCentral()}
                      openProgress={openProgress}
                      openBenefits={openBenefits}
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
    </JornadaProvider>
  );
}
