import { ChevronRight } from "lucide-react";

import { EmojiBadge, ScenarioArt, tintClass } from "@/components/common";
import type { RulesSection } from "@/components/tools/rules-panel";
import { scenarios, type ScenarioId } from "@/lib/scenarios";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

/** Aba Situações: orientações por cenário, nos cards grandes já usados no app. */
export function ScenariosScreen({
  openScenario,
  openRules,
}: {
  openScenario: (id: ScenarioId) => void;
  openRules: (section?: RulesSection) => void;
}) {
  const { data } = useStore();
  const current = data.profile!.scenario;

  return (
    <div className="px-5 pb-36 pt-[max(2rem,env(safe-area-inset-top))]">
      <h1 className="font-display text-3xl font-black">Situações especiais</h1>
      <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
        Escolha o que está acontecendo agora. As orientações se adaptam à sua situação.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4">
        {scenarios.map((scenario) => {
          const selected = scenario.id === current;
          return (
            <button
              key={scenario.id}
              type="button"
              onClick={() => openScenario(scenario.id)}
              aria-pressed={selected}
              className={cn(
                "group flex h-full min-w-0 cursor-pointer flex-col overflow-hidden rounded-card bg-card text-left shadow-soft transition-transform active:scale-[0.98]",
                selected && "ring-[3px] ring-primary",
              )}
            >
              {/* Mesmo formato do card "Especialmente para você": arte centralizada no painel. */}
              <span className={cn("relative block aspect-square w-full", tintClass[scenario.tint])}>
                <span
                  aria-hidden
                  className="absolute inset-0 bg-[radial-gradient(circle_at_50%_55%,rgba(255,255,255,0.8),transparent_62%)]"
                />
                <ScenarioArt
                  id={scenario.id}
                  className="absolute left-1/2 top-[56%] h-auto w-[72%] -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_10px_12px_rgba(90,20,38,0.18)] transition-transform duration-300 group-hover:scale-105"
                />
                {selected && (
                  <span className="absolute left-2.5 top-2.5 rounded-full bg-primary px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-primary-foreground shadow-sm">
                    Seu cenário
                  </span>
                )}
              </span>
              <span className="flex flex-1 flex-col px-3.5 pb-3.5 pt-3">
                <span className="block font-display text-[15px] font-extrabold leading-tight text-foreground">
                  {scenario.label}
                </span>
                <span className="mt-1 block text-xs leading-snug text-muted-foreground">
                  {scenario.short}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => openRules("signals")}
        className="mt-6 flex w-full cursor-pointer items-center gap-3 rounded-card bg-card p-4 text-left shadow-soft"
      >
        <EmojiBadge name="sinais" tint="lavender" />
        <span className="flex-1">
          <span className="block font-display text-[15px] font-extrabold">
            Sinais para observar
          </span>
          <span className="block text-xs text-muted-foreground">
            Abertura e alerta, sem interpretar demais.
          </span>
        </span>
        <ChevronRight className="size-4 text-muted-foreground" />
      </button>
    </div>
  );
}
