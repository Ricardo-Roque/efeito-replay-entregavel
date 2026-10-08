import { useEffect, useRef, useState } from "react";

import {
  DaySheet,
  FloatingDayCard,
  JourneyPath,
  PhaseHeader,
  type DayStatus,
} from "@/components/plan/journey";
import { dayContent, phaseOf, planDays, planPhases } from "@/lib/plan";
import { currentDay as currentDayOf, dayState, planProgress } from "@/lib/progress";
import { useStore } from "@/lib/store";

const DEFAULT_HEADER_HEIGHT = 220;

/** Mesma tela do Plano do CalmBaby: cabeçalho fixo da fase, trilha por fase e cartão flutuante
 * com o dia de hoje. Sem a navegação inferior; o botão de voltar leva ao Início. */
export function PlanScreen({
  onBack,
  openDay,
}: {
  onBack: () => void;
  openDay: (day: number) => void;
}) {
  const { data, entitlements } = useStore();
  const progress = planProgress(data);
  const today = currentDayOf(data);
  const [activePhase, setActivePhase] = useState(phaseOf(today).phase);
  const [sheetDay, setSheetDay] = useState<number | null>(null);
  const [headerHeight, setHeaderHeight] = useState(DEFAULT_HEADER_HEIGHT);
  const headerRef = useRef<HTMLElement | null>(null);
  const sectionRefs = useRef<Record<number, HTMLElement | null>>({});

  const statusOf = (day: number): DayStatus => {
    const state = dayState(data, day, { allDays: entitlements.allDays });
    if (state === "done") return "completed";
    if (state === "open") return day === today ? "current" : "open";
    return state;
  };

  // Abre direto na fase em que ela está hoje.
  useEffect(() => {
    sectionRefs.current[phaseOf(today).phase]?.scrollIntoView({ behavior: "auto", block: "start" });
    // só na abertura da tela
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const update = () =>
      setHeaderHeight(headerRef.current?.getBoundingClientRect().height ?? DEFAULT_HEADER_HEIGHT);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Fase "ativa" = a última seção cujo topo já passou por baixo do cabeçalho fixo.
  useEffect(() => {
    const lineY = headerHeight + 16;
    let frame = 0;
    const compute = () => {
      frame = 0;
      let current: (typeof planPhases)[number]["phase"] = 1;
      for (const phase of planPhases) {
        const el = sectionRefs.current[phase.phase];
        if (el && el.getBoundingClientRect().top <= lineY) current = phase.phase;
      }
      setActivePhase((previous) => (previous === current ? previous : current));
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(compute);
    };
    compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [headerHeight]);

  const phase = planPhases[activePhase - 1]!;
  const phaseDays = planDays.filter((item) => item.phase === activePhase);
  const phaseDone = phaseDays.filter((item) => data.completed[item.day]).length;
  const todayContent = dayContent(today);
  const sheetContent = sheetDay ? dayContent(sheetDay) : null;

  return (
    <div className="min-h-dvh pb-40">
      <PhaseHeader
        ref={headerRef}
        phase={phase}
        done={phaseDone}
        total={phaseDays.length}
        onBack={onBack}
      />
      <main>
        {planPhases.map((item) => (
          <section
            key={item.phase}
            ref={(el) => {
              sectionRefs.current[item.phase] = el;
            }}
            style={{ scrollMarginTop: headerHeight + 12 }}
            className="px-2 pb-4 pt-8"
          >
            <p className="mb-2 text-center text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground">
              Fase {item.phase} · {item.title}
            </p>
            <JourneyPath
              days={planDays.filter((day) => day.phase === item.phase)}
              statusOf={statusOf}
              onSelect={setSheetDay}
            />
          </section>
        ))}
        <p className="mx-auto max-w-xs px-4 pb-8 text-center text-xs leading-5 text-muted-foreground">
          Um dia por vez. Toque num dia para ver os detalhes.
        </p>
      </main>

      <FloatingDayCard
        day={todayContent}
        emoji={phaseOf(today).emoji}
        finished={progress.finished}
        waiting={dayState(data, today, { allDays: entitlements.allDays }) === "tomorrow"}
        onStart={() => openDay(today)}
      />

      <DaySheet
        day={sheetContent}
        status={sheetDay ? statusOf(sheetDay) : "locked"}
        open={sheetDay !== null}
        onOpenChange={(open) => !open && setSheetDay(null)}
        onStart={() => {
          if (!sheetDay) return;
          setSheetDay(null);
          openDay(sheetDay);
        }}
      />
    </div>
  );
}
