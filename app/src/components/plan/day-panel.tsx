import { useState } from "react";
import { ArrowRight, Check, CircleCheck } from "lucide-react";

import { Emoji, Overlay, SectionTitle } from "@/components/common";
import { Button } from "@/components/ui/button";
import { dayContent, phaseOf, type PlanTool } from "@/lib/plan";
import { dayState } from "@/lib/progress";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const toolLabel: Record<PlanTool, string> = {
  pause: "Abrir a Pausa antes de enviar",
  diary: "Abrir o Diário",
  rules: "Abrir as Regras de ouro",
};

/** Tela cheia do dia, no mesmo formato do painel de prática do Calm Kids: explicação, ação de
 * hoje, passos que ela marca e o botão de concluir. Só conclui se o dia estiver liberado. */
export function DayPanel({
  day,
  onClose,
  onCompleted,
  openTool,
}: {
  day: number;
  onClose: () => void;
  onCompleted: (day: number) => void;
  openTool: (tool: PlanTool) => void;
}) {
  const { data, entitlements, completeDay } = useStore();
  const content = dayContent(day);
  const phase = phaseOf(day);
  const state = dayState(data, day, { allDays: entitlements.allDays });
  const alreadyDone = state === "done";
  const [doneSteps, setDoneSteps] = useState<number[]>([]);
  const [confirming, setConfirming] = useState(false);

  const toggleStep = (index: number) =>
    setDoneSteps((current) =>
      current.includes(index) ? current.filter((item) => item !== index) : [...current, index],
    );

  const complete = () => {
    if (alreadyDone) return onClose();
    setConfirming(true);
    // Só fecha (e só então comemora) depois de salvar; se falhar, o aviso aparece e dá para tentar de novo.
    if (!completeDay(day)) {
      setConfirming(false);
      return;
    }
    window.setTimeout(() => {
      onClose();
      onCompleted(day);
    }, 650);
  };

  return (
    <Overlay eyebrow={`Fase ${phase.phase} · Dia ${day}`} title={content.title} onClose={onClose}>
      <div className="flex items-start gap-4 rounded-card bg-tint-rose p-4">
        <Emoji name={phase.emoji} className="size-16 shrink-0" />
        <div className="min-w-0 space-y-2">
          {content.lesson.map((paragraph) => (
            <p key={paragraph} className="text-sm leading-6 text-foreground">
              {paragraph}
            </p>
          ))}
          <p className="text-xs font-bold text-muted-foreground">
            {content.minutes} min · {phase.title}
          </p>
        </div>
      </div>

      <SectionTitle>Ação de hoje</SectionTitle>
      <div className="rounded-card bg-tint-honey p-4">
        <p className="text-[15px] font-bold leading-6 text-foreground">{content.action}</p>
        {content.tool && (
          <Button
            variant="outline"
            className="mt-4 h-11 w-full rounded-xl bg-card font-bold"
            onClick={() => openTool(content.tool!)}
          >
            {toolLabel[content.tool]} <ArrowRight />
          </Button>
        )}
      </div>

      <SectionTitle>O que você vai fazer</SectionTitle>
      <ol className="space-y-3">
        {content.checklist.map((step, index) => {
          const on = alreadyDone || doneSteps.includes(index);
          return (
            <li key={step}>
              <button
                type="button"
                aria-pressed={on}
                onClick={() => toggleStep(index)}
                className={cn(
                  "flex w-full cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 text-left transition-colors",
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
                <span className="text-sm leading-6">{step}</span>
              </button>
            </li>
          );
        })}
      </ol>

      <div className="mt-6 rounded-card bg-primary-soft p-6 text-center">
        <Emoji name={alreadyDone ? "ok" : "estrela"} className="mx-auto size-20" />
        <p className="eyebrow mt-2 tracking-widest">
          {alreadyDone ? "Dia concluído" : "Terminou o dia?"}
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          {alreadyDone
            ? "Você pode rever este dia sempre que quiser."
            : state === "open"
              ? "Marque como concluído. O próximo dia libera amanhã."
              : "Este dia ainda não está liberado."}
        </p>
        <Button
          className="mt-5 h-11 rounded-xl"
          onClick={complete}
          disabled={confirming || (!alreadyDone && state !== "open")}
        >
          <CircleCheck />
          {confirming ? "Concluído!" : alreadyDone ? "Fechar" : "Marcar como concluído"}
        </Button>
      </div>

      <p className="mt-6 text-center text-xs leading-5 text-muted-foreground">
        Conteúdo educativo. Não substitui acompanhamento psicológico.
      </p>
    </Overlay>
  );
}
