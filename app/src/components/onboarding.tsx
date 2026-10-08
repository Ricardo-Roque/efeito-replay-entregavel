import { useState, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, Check, Play } from "lucide-react";

import { Brand, Character, EmojiBadge, ScenarioBadge } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { breakupOptions, commitment } from "@/lib/guide";
import type { Pose } from "@/lib/illustrations";
import { planPhases } from "@/lib/plan";
import { scenarios, type ScenarioId } from "@/lib/scenarios";
import { firstName, useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const TOTAL = 4;
const stepPose: Pose[] = ["acenando", "pensativa", "sorrindoCelular", "maoNoPeito"];

/** Primeiro acesso, no mesmo formato do onboarding do CalmBaby: uma pergunta por tela, barra de
 * progresso, ilustração à direita e, no fim, "o seu plano está pronto". */
export function Onboarding() {
  const { saveProfile } = useStore();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [breakup, setBreakup] = useState("");
  const [scenario, setScenario] = useState<ScenarioId | null>(null);
  const [accepted, setAccepted] = useState<number[]>([]);
  const next = () => setStep((current) => current + 1);

  const finish = () => {
    if (!scenario) return;
    saveProfile({ name: name.trim(), breakup, scenario, startedAt: new Date().toISOString() });
  };

  if (step === TOTAL) {
    return (
      <div className="min-h-dvh bg-app-shell">
        <div className="mx-auto flex min-h-dvh max-w-[430px] flex-col bg-background px-5 pb-8 pt-5 md:shadow-app">
          <Brand compact />
          <div className="mt-6 text-center">
            <Character pose="comemorando" className="mx-auto h-48" />
            <p className="eyebrow mt-3 tracking-widest">Tudo pronto</p>
            <h1 className="mt-1 font-display text-[26px] font-black leading-[1.12]">
              {firstName(name)}, o seu plano de 21 dias começa hoje!
            </h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Um dia por vez, em quatro fases. Cada dia novo libera no dia seguinte.
            </p>
          </div>
          <section className="mt-5 space-y-3 rounded-card bg-card p-5 shadow-soft">
            {planPhases.map((phase) => (
              <div key={phase.phase} className="flex items-center gap-3">
                <EmojiBadge name={phase.emoji} tint="rose" size="sm" />
                <div>
                  <p className="text-sm font-extrabold">{phase.title}</p>
                  <p className="text-xs font-semibold text-muted-foreground">
                    Dias {phase.first} a {phase.last}
                  </p>
                </div>
              </div>
            ))}
          </section>
          <div className="mt-auto pt-8">
            <Button className="h-12 w-full rounded-xl text-sm font-bold" onClick={finish}>
              <Play className="fill-current" /> Começar o dia 1
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const screens: { title: string; subtitle?: string; valid: boolean; body: ReactNode }[] = [
    {
      title: "Como você quer ser chamada?",
      subtitle: "Nesta versão, tudo o que você registrar fica só neste aparelho.",
      valid: name.trim().length > 0,
      body: (
        <Input
          autoFocus
          value={name}
          onChange={(event) => setName(event.target.value.slice(0, 30))}
          onKeyDown={(event) => event.key === "Enter" && name.trim() && next()}
          placeholder="Seu nome"
          className="h-12 rounded-xl bg-card text-base"
        />
      ),
    },
    {
      title: "Quando vocês terminaram?",
      valid: breakup !== "",
      body: (
        <Options
          options={breakupOptions}
          value={breakup}
          onPick={(value) => (setBreakup(value), next())}
        />
      ),
    },
    {
      title: "O que mais parece com o seu momento hoje?",
      subtitle: "Você pode trocar o cenário quando quiser.",
      valid: scenario !== null,
      body: (
        <div className="grid gap-3">
          {scenarios.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={scenario === item.id}
              onClick={() => setScenario(item.id)}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors",
                scenario === item.id
                  ? "border-primary bg-primary-soft text-primary"
                  : "border-border bg-card hover:bg-muted",
              )}
            >
              <ScenarioBadge id={item.id} tint={item.tint} size="sm" />
              <span className="text-sm font-bold">{item.label}</span>
            </button>
          ))}
        </div>
      ),
    },
    {
      title: "Meu compromisso",
      subtitle:
        "Este protocolo não é sobre manipular ninguém. É sobre mudar a sua forma de agir. Toque em cada item para confirmar.",
      valid: accepted.length === commitment.length,
      body: (
        <div className="grid gap-3">
          {commitment.map((item, index) => {
            const on = accepted.includes(index);
            return (
              <button
                key={item}
                type="button"
                aria-pressed={on}
                onClick={() =>
                  setAccepted((current) =>
                    current.includes(index)
                      ? current.filter((value) => value !== index)
                      : [...current, index],
                  )
                }
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 text-left transition-colors",
                  on ? "border-success/40 bg-success-soft" : "border-border bg-card hover:bg-muted",
                )}
              >
                <span
                  className={cn(
                    "grid size-7 shrink-0 place-items-center rounded-full text-[11px] font-extrabold",
                    on ? "bg-success text-primary-foreground" : "bg-primary-soft text-primary",
                  )}
                >
                  {on ? <Check className="size-4" /> : index + 1}
                </span>
                <span className="text-sm leading-6">{item}</span>
              </button>
            );
          })}
        </div>
      ),
    },
  ];
  const screen = screens[step]!;

  return (
    <div className="min-h-dvh bg-app-shell">
      <div className="mx-auto flex min-h-dvh max-w-[430px] flex-col bg-background px-5 pb-8 pt-5 md:shadow-app">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            aria-label="Voltar"
            className={cn("shrink-0 rounded-xl", step === 0 && "invisible")}
            onClick={() => setStep((current) => Math.max(0, current - 1))}
          >
            <ArrowLeft />
          </Button>
          <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${((step + 1) / TOTAL) * 100}%` }}
            />
          </div>
          <span className="w-10 text-right text-xs font-bold text-muted-foreground">
            {step + 1}/{TOTAL}
          </span>
        </div>

        <section className="relative mt-4 h-[170px]">
          <div className="relative z-10 max-w-[62%] pt-6">
            <p className="eyebrow tracking-widest">Código da Reconquista</p>
            <h1 className="mt-1 font-display text-[24px] font-black leading-[1.15]">
              {screen.title}
            </h1>
          </div>
          <Character
            pose={stepPose[step] ?? "acenando"}
            className="pointer-events-none absolute -bottom-6 right-2 h-[190px] drop-shadow-[0_14px_16px_rgba(90,20,38,0.14)]"
          />
        </section>

        <div className="relative z-10 rounded-card bg-card p-5 shadow-soft">
          {screen.subtitle && (
            <p className="mb-4 text-[13px] leading-snug text-muted-foreground">{screen.subtitle}</p>
          )}
          {screen.body}
        </div>
        <div className="mt-auto pt-8">
          <Button
            className="h-12 w-full rounded-xl text-sm font-bold"
            disabled={!screen.valid}
            onClick={next}
          >
            Continuar <ArrowRight />
          </Button>
        </div>
      </div>
    </div>
  );
}

function Options({
  options,
  value,
  onPick,
}: {
  options: string[];
  value: string;
  onPick: (value: string) => void;
}) {
  return (
    <div className="grid gap-3">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onPick(option)}
          className={cn(
            "cursor-pointer rounded-xl border px-4 py-3.5 text-left text-sm font-bold transition-colors",
            value === option
              ? "border-primary bg-primary-soft text-primary"
              : "border-border bg-card hover:bg-muted",
          )}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
