import { Check, ChevronRight, Lock, MessagesSquare, Play, TriangleAlert, X } from "lucide-react";

import {
  EmojiBadge,
  Highlight,
  ScenarioArt,
  Overlay,
  SectionTitle,
  tintClass,
} from "@/components/common";
import { useCommContext } from "@/components/comunicacao/hooks";
import { BulletList, MessageCard } from "@/components/comunicacao/shared";
import { ToolLinks } from "@/components/tool-links";
import { features } from "@/lib/features";
import { Button } from "@/components/ui/button";
import type { AppLink } from "@/lib/app-link";
import { messageById } from "@/lib/comunicacao/rules";
import type { CommMessage } from "@/lib/comunicacao/types";
import { useJornada } from "@/lib/jornada/store";
import { dayContent } from "@/lib/plan";
import { currentDay, dayState } from "@/lib/progress";
import { scenarioById, type ScenarioId, type ScenarioPoint } from "@/lib/scenarios";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

function PointList({ items, tone }: { items: ScenarioPoint[]; tone: "do" | "avoid" }) {
  return (
    <ul className="space-y-2.5">
      {items.map((item) => (
        <li
          key={item.text}
          className={cn(
            "flex items-start gap-3 rounded-xl border px-4 py-3",
            tone === "do" ? "border-success/30 bg-success-soft" : "border-border bg-card",
          )}
        >
          <span
            className={cn(
              "grid size-7 shrink-0 place-items-center rounded-full",
              tone === "do" ? "bg-success text-primary-foreground" : "bg-primary-soft text-primary",
            )}
          >
            {tone === "do" ? <Check className="size-4" /> : <X className="size-4" />}
          </span>
          <span className="text-sm leading-6">
            <b>{item.text}.</b> <span className="text-muted-foreground">{item.why}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

/** Detalhe do cenário: explicação, desafios, o que fazer e evitar (com o porquê), exemplos,
 * sinais, mensagens da Central (com a mesma regra de uso da Central), quando parar, próximos
 * passos, conteúdos relacionados e os dias do plano ligados a ele. */
export function ScenarioPanel({
  id,
  onClose,
  openDay,
  openCentral,
  openMessage,
  openLink,
}: {
  id: ScenarioId;
  onClose: () => void;
  openDay: (day: number) => void;
  /** Abre a Central de Comunicação filtrada por este cenário. */
  openCentral: () => void;
  openMessage: (id: string) => void;
  openLink: (link: AppLink) => void;
}) {
  const { data, entitlements, setScenario, showToast } = useStore();
  const { data: jornada } = useJornada();
  const ctx = useCommContext();
  const scenario = scenarioById(id);
  const isCurrent = data.profile!.scenario === id;
  const today = currentDay(data);
  const messages = scenario.messages
    .map((messageId) => messageById(messageId))
    .filter((item): item is CommMessage => Boolean(item));

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

      <SectionTitle>Entenda a situação</SectionTitle>
      <div className="space-y-3">
        {scenario.understand.map((paragraph) => (
          <p key={paragraph} className="text-sm leading-6">
            {paragraph}
          </p>
        ))}
      </div>

      <SectionTitle>Principais desafios</SectionTitle>
      <BulletList items={scenario.challenges} tone="info" />

      <SectionTitle>O que fazer</SectionTitle>
      <PointList items={scenario.do} tone="do" />

      <SectionTitle>O que evitar</SectionTitle>
      <PointList items={scenario.avoid} tone="avoid" />

      <SectionTitle>Exemplos</SectionTitle>
      <div className="space-y-3">
        {scenario.examples.map((example) => (
          <div key={example.situation} className="rounded-card bg-tint-lavender p-4">
            <p className="eyebrow mb-1">Situação ilustrativa</p>
            <p className="text-sm leading-6">{example.situation}</p>
            <p className="mt-2 rounded-xl bg-card px-3 py-2 text-sm leading-6">
              <b>O que ajuda:</b> {example.better}
            </p>
          </div>
        ))}
      </div>

      <SectionTitle>Sinais de abertura</SectionTitle>
      <BulletList items={scenario.openSignals} tone="do" />
      <SectionTitle>Sinais de limite</SectionTitle>
      <BulletList items={scenario.limitSignals} tone="avoid" />

      <SectionTitle>Mensagens da Central</SectionTitle>
      {messages.length > 0 ? (
        <>
          <p className="-mt-1 mb-4 text-[13px] leading-5 text-muted-foreground">
            Pontos de partida. O selo mostra se cada uma faz sentido no seu momento. Ajuste com as
            suas palavras e passe pela Pausa antes de enviar.
          </p>
          <div className="space-y-3">
            {messages.map((message) => (
              <MessageCard
                key={message.id}
                message={message}
                ctx={ctx}
                favorite={Boolean(jornada.messages.favorites[message.id])}
                onOpen={openMessage}
              />
            ))}
          </div>
          {(ctx.stance === "conversa" || ctx.stance === "sem_diagnostico") && (
            <div className="mt-4">
              <Highlight emoji="celular">Envie uma. Depois, solte o celular.</Highlight>
            </div>
          )}
        </>
      ) : (
        <div className="flex items-center gap-3 rounded-card bg-muted p-4">
          <EmojiBadge name="escudo" tint="sage" size="sm" />
          <p className="text-sm leading-6">{scenario.noMessages}</p>
        </div>
      )}
      <Button
        variant="outline"
        className="mt-3 h-11 w-full rounded-xl bg-card font-bold"
        onClick={openCentral}
      >
        <MessagesSquare />
        {messages.length > 0 ? "Mais orientações na Central" : "Orientações na Central"}
      </Button>

      <SectionTitle>Quando parar</SectionTitle>
      <div className="rounded-card bg-card p-4 text-sm font-semibold leading-6 shadow-soft">
        {scenario.stop}
      </div>

      <SectionTitle>Próximos passos</SectionTitle>
      <ol className="space-y-2">
        {scenario.next.map((step, index) => (
          <li
            key={step}
            className="flex gap-3 rounded-xl bg-card px-4 py-3 text-sm leading-6 shadow-soft"
          >
            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary-soft text-[11px] font-extrabold text-primary">
              {index + 1}
            </span>
            {step}
          </li>
        ))}
      </ol>

      <SectionTitle>Conteúdos relacionados</SectionTitle>
      <ToolLinks links={scenario.links} onOpen={openLink} />

      {/* Dias do plano: ocultos com o plano de 21 dias (lib/features.ts) */}
      {features.plan21 && (
        <>
          <SectionTitle>Dias do plano para este cenário</SectionTitle>
          <div className="space-y-3">
            {scenario.days.map((day) => {
              const content = dayContent(day);
              const state = dayState(data, day, { allDays: entitlements.allDays });
              const available = state === "done" || state === "open";
              const status =
                state === "done"
                  ? "done"
                  : state === "open" && day === today
                    ? "current"
                    : "locked";
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
        </>
      )}
    </Overlay>
  );
}
