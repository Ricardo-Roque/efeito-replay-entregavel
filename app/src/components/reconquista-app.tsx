import { useEffect, useState } from "react";

import { DiaryScreen } from "@/components/diary-screen";
import { BottomNav, type AppTab } from "@/components/home/bottom-nav";
import { HomeScreen } from "@/components/home/home-screen";
import { MoreScreen } from "@/components/more-screen";
import { Onboarding } from "@/components/onboarding";
import { DayPanel } from "@/components/plan/day-panel";
import { MilestoneCelebration } from "@/components/plan/journey";
import { PlanScreen } from "@/components/plan/plan-screen";
import { ScenarioPanel } from "@/components/scenarios/scenario-panel";
import { ScenariosScreen } from "@/components/scenarios/scenarios-screen";
import { PauseTool } from "@/components/tools/pause-tool";
import { CommitmentPanel, RulesPanel, type RulesSection } from "@/components/tools/rules-panel";
import { MILESTONES, type Milestone, type PlanTool } from "@/lib/plan";
import type { ScenarioId } from "@/lib/scenarios";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

/** Pilha de camadas, igual à do CalmBaby: cada ferramenta abre por cima e fechar volta para onde estava. */
type Layer =
  | { kind: "day"; day: number }
  | { kind: "scenario"; id: ScenarioId }
  | { kind: "pause"; draft: string }
  | { kind: "rules"; section?: RulesSection }
  | { kind: "commitment" };

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

export function ReconquistaApp() {
  const { data } = useStore();
  const [tab, setTab] = useState<AppTab>("home");
  const [layers, setLayers] = useState<Layer[]>([]);
  const [milestone, setMilestone] = useState<Milestone | null>(null);

  useEffect(() => {
    if (tab !== "plan") window.scrollTo({ top: 0 });
  }, [tab]);

  // "Recomeçar do zero" apaga o perfil: não reaproveita telas abertas.
  useEffect(() => {
    if (!data.profile) {
      setTab("home");
      setLayers([]);
      setMilestone(null);
    }
  }, [data.profile]);

  if (!data.profile)
    return (
      <>
        <Onboarding />
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
  const openTool = (tool: PlanTool) => {
    if (tool === "diary") goTab("diary");
    else if (tool === "pause") openPause();
    else openRules();
  };

  return (
    <div className="min-h-dvh bg-app-shell text-foreground">
      <div className="mx-auto min-h-dvh max-w-[430px] overflow-x-clip bg-background md:shadow-app">
        {tab === "plan" ? (
          // Como no CalmBaby: tela própria, sem a navegação inferior, com o cartão flutuante.
          <PlanScreen onBack={() => setTab("home")} openDay={openDay} />
        ) : (
          <>
            <main>
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
                />
              )}
            </main>
            <BottomNav active={tab} onSelect={setTab} />
          </>
        )}
      </div>

      {layers.map((layer, index) => {
        const key = `${layer.kind}-${index}`;
        if (layer.kind === "day")
          return (
            <DayPanel
              key={key}
              day={layer.day}
              onClose={pop}
              openTool={openTool}
              onCompleted={(day) =>
                setMilestone(MILESTONES.find((item) => item.day === day) ?? null)
              }
            />
          );
        if (layer.kind === "scenario")
          return (
            <ScenarioPanel
              key={key}
              id={layer.id}
              onClose={pop}
              openDay={openDay}
              openPause={openPause}
            />
          );
        if (layer.kind === "pause")
          return (
            <PauseTool
              key={key}
              initialDraft={layer.draft}
              onClose={pop}
              openScenario={openScenario}
            />
          );
        if (layer.kind === "rules")
          return <RulesPanel key={key} section={layer.section} onClose={pop} />;
        return <CommitmentPanel key={key} onClose={pop} />;
      })}

      <MilestoneCelebration milestone={milestone} onClose={() => setMilestone(null)} />
      <Toast />
    </div>
  );
}
