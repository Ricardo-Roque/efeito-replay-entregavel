import { ChevronRight } from "lucide-react";

import { EmojiBadge, ScenarioArt, tintClass } from "@/components/common";
import type { RulesSection } from "@/components/tools/rules-panel";
import { scenarios, type ScenarioId } from "@/lib/scenarios";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

/** Aba Cenários: os atalhos "O que vocês precisam agora?" do Calm Kids, em cards grandes. */
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
      <h1 className="font-display text-3xl font-black">Cenários</h1>
      <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
        Escolha o que está acontecendo agora. O plano se adapta ao seu cenário.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4">
        {scenarios.map((scenario) => {
          const selected = scenario.id === current;
          return (
            <button
              key={scenario.id}
              type="button"
              onClick={() => openScenario(scenario.id)}
              className="group flex min-w-0 cursor-pointer flex-col justify-start text-left"
            >
              <span
                className={cn(
                  "relative grid aspect-[1/0.86] place-items-center overflow-hidden rounded-card shadow-soft transition-transform group-active:scale-[0.98]",
                  tintClass[scenario.tint],
                  selected && "ring-4 ring-primary/40",
                )}
              >
                {selected && (
                  <span className="absolute left-3 top-3 rounded-full bg-card px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-primary">
                    Seu cenário
                  </span>
                )}
                <ScenarioArt id={scenario.id} className="mt-4 h-[82%] w-auto" />
              </span>
              <span className="mt-2.5 block px-1">
                <span className="block font-display text-[15px] font-extrabold leading-tight text-foreground">
                  {scenario.label}
                </span>
                <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">
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
