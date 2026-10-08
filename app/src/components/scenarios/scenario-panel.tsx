import { Check, ChevronRight, Copy, Hourglass, Lock, Play, TriangleAlert, X } from "lucide-react";

import {
  EmojiBadge,
  Highlight,
  ScenarioArt,
  Overlay,
  SectionTitle,
  tintClass,
} from "@/components/common";
import { Button } from "@/components/ui/button";
import { copyText } from "@/lib/clipboard";
import { dayContent } from "@/lib/plan";
import { currentDay, dayState } from "@/lib/progress";
import { scenarioById, type ScenarioId } from "@/lib/scenarios";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

/** Detalhe do cenário, no lugar do situation-screen do Calm Kids: explicação, faça / evite,
 * modelos de mensagem (quando cabe), quando parar e os dias do plano ligados a ele. */
export function ScenarioPanel({
  id,
  onClose,
  openDay,
  openPause,
}: {
  id: ScenarioId;
  onClose: () => void;
  openDay: (day: number) => void;
  openPause: (draft?: string) => void;
}) {
  const { data, entitlements, setScenario, showToast } = useStore();
  const scenario = scenarioById(id);
  const isCurrent = data.profile!.scenario === id;
  const today = currentDay(data);

  const copy = async (text: string) => {
    const ok = await copyText(text);
    showToast(
      ok ? "Mensagem copiada." : "Não foi possível copiar. Selecione o texto e copie.",
      ok ? "info" : "error",
    );
  };

  return (
    <Overlay eyebrow="Cenário" title={scenario.label} onClose={onClose}>
      <div className={cn("flex items-start gap-4 rounded-card p-4", tintClass[scenario.tint])}>
        <ScenarioArt id={id} className="size-24 shrink-0" />
        <p className="text-sm leading-6 text-foreground">{scenario.description}</p>
      </div>

      {scenario.alert && (
        <div
          role="note"
          className="mt-4 flex gap-3 rounded-xl border border-destructive/30 bg-destructive-soft px-4 py-3 text-sm leading-6 text-foreground"
        >
          <TriangleAlert className="mt-0.5 size-5 shrink-0 text-destructive" />
          <span>
            <b>Importante.</b> {scenario.alert}
          </span>
        </div>
      )}

      {!isCurrent && (
        <Button
          variant="outline"
          className="mt-4 h-11 w-full rounded-xl bg-card font-bold"
          onClick={() =>
            setScenario(id) && showToast("Cenário atualizado. O Início já mostra este.")
          }
        >
          Este é o meu cenário agora
        </Button>
      )}

      <SectionTitle>O que fazer</SectionTitle>
      <ul className="space-y-2.5">
        {scenario.do.map((item) => (
          <li
            key={item}
            className="flex items-center gap-3 rounded-xl border border-success/30 bg-success-soft px-4 py-3 text-sm font-semibold"
          >
            <span className="grid size-7 shrink-0 place-items-center rounded-full bg-success text-primary-foreground">
              <Check className="size-4" />
            </span>
            {item}
          </li>
        ))}
      </ul>

      <SectionTitle>O que evitar</SectionTitle>
      <ul className="space-y-2.5">
        {scenario.avoid.map((item) => (
          <li
            key={item}
            className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm font-semibold"
          >
            <span className="grid size-7 shrink-0 place-items-center rounded-full bg-primary-soft text-primary">
              <X className="size-4" />
            </span>
            {item}
          </li>
        ))}
      </ul>

      <SectionTitle>Modelos de mensagem</SectionTitle>
      {scenario.messages.length > 0 ? (
        <>
          <p className="-mt-1 mb-4 text-[13px] text-muted-foreground">
            Pontos de partida. Ajuste com as suas palavras e passe pela Pausa antes de enviar.
          </p>
          {scenario.messages.map((message) => (
            <div key={message} className="mb-4">
              <div className="ml-auto max-w-[88%] rounded-2xl rounded-br-md bg-primary px-4 py-3 text-sm font-semibold leading-6 text-primary-foreground shadow-soft">
                {message}
              </div>
              <div className="mt-2 flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 rounded-xl bg-card font-bold"
                  onClick={() => openPause(message)}
                >
                  <Hourglass /> Passar pela Pausa
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 rounded-xl bg-card font-bold"
                  onClick={() => void copy(message)}
                >
                  <Copy /> Copiar
                </Button>
              </div>
            </div>
          ))}
          <Highlight emoji="celular">Envie uma. Depois, solte o celular.</Highlight>
        </>
      ) : (
        <div className="flex items-center gap-3 rounded-card bg-muted p-4">
          <EmojiBadge name="escudo" tint="sage" size="sm" />
          <p className="text-sm leading-6">{scenario.noMessages}</p>
        </div>
      )}

      <SectionTitle>Quando parar</SectionTitle>
      <div className="rounded-card bg-card p-4 text-sm font-semibold leading-6 shadow-soft">
        {scenario.stop}
      </div>

      <SectionTitle>Dias do plano para este cenário</SectionTitle>
      <div className="space-y-3">
        {scenario.days.map((day) => {
          const content = dayContent(day);
          const state = dayState(data, day, { allDays: entitlements.allDays });
          const available = state === "done" || state === "open";
          const status =
            state === "done" ? "done" : state === "open" && day === today ? "current" : "locked";
          const inner = (
            <>
              <span
                className={cn(
                  "grid size-11 shrink-0 place-items-center rounded-full",
                  status === "done" && "bg-node-success text-success",
                  status === "current" && "bg-play-button text-primary-foreground",
                  status === "locked" && "bg-muted text-muted-foreground",
                )}
              >
                {status === "done" ? (
                  <Check className="size-5" strokeWidth={3} />
                ) : status === "current" ? (
                  <Play className="size-4 fill-current" />
                ) : (
                  <Lock className="size-4" />
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[11px] font-bold text-muted-foreground">
                  Fase {content.phase} · Dia {day}
                  {!available && " · ainda não liberado"}
                </span>
                <span className="block truncate font-display text-[15px] font-extrabold text-foreground">
                  {content.title}
                </span>
              </span>
            </>
          );
          return available ? (
            <button
              key={day}
              type="button"
              onClick={() => openDay(day)}
              className="flex w-full cursor-pointer items-center gap-3 rounded-card bg-card p-4 text-left shadow-soft transition-transform active:scale-[0.99]"
            >
              {inner}
              <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
            </button>
          ) : (
            <div key={day} className="flex items-center gap-3 rounded-card bg-card/70 p-4">
              {inner}
            </div>
          );
        })}
      </div>
    </Overlay>
  );
}
