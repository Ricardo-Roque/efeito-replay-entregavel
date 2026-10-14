import type { ReactNode } from "react";
import { ArrowRight, Check, Circle } from "lucide-react";

import { EmojiBadge, GoalProgress, Overlay, PhaseBar, SectionTitle } from "@/components/common";
import { Button } from "@/components/ui/button";
import { useJornada } from "@/lib/jornada/store";
import { progressSummary } from "@/lib/progress-summary";
import { formatWhen } from "@/lib/progress";
import { progressOf, readReset } from "@/lib/reset/store";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const shortDate = (iso: string) =>
  new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });

function StatusPill({ done, children }: { done: boolean; children: ReactNode }) {
  return (
    <span
      className={cn(
        "shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide",
        done ? "bg-tint-sage" : "bg-tint-honey",
      )}
    >
      {children}
    </span>
  );
}

/**
 * "Meu progresso": o que ela já fez no app, organizado em diagnóstico, 48 horas, plano de 21 dias,
 * ferramentas e marcos. Mede cuidado e constância, nunca a resposta dele.
 */
export function ProgressScreen({
  onClose,
  openDiagnosis,
  openMap,
  openFirst48,
  openPlan,
  openDiary,
}: {
  onClose: () => void;
  openDiagnosis: () => void;
  openMap: () => void;
  openFirst48: () => void;
  openPlan: () => void;
  openDiary: () => void;
}) {
  const { data, email, entitlements } = useStore();
  const { data: jornada } = useJornada();
  const summary = progressSummary(data, jornada);
  const reset = entitlements.reset ? progressOf(readReset(email)) : null;
  const used = summary.tools.filter((tool) => tool.count > 0);

  return (
    <Overlay eyebrow="Sua evolução" title="Meu progresso" onClose={onClose}>
      <section className="rounded-card bg-goal-card p-5 text-primary-foreground shadow-glow">
        <p className="eyebrow eyebrow-light">Marcos alcançados</p>
        <div className="mt-2 flex items-end gap-2">
          <span className="font-display text-5xl font-black tabular-nums">{summary.achieved}</span>
          <span className="pb-1.5 text-sm font-bold text-primary-foreground/85">
            de {summary.milestones.length}
          </span>
        </div>
        <div className="mt-3 flex">
          <GoalProgress
            value={summary.achieved}
            max={summary.milestones.length}
            label="Marcos alcançados"
          />
        </div>
        <p className="mt-3 text-[12px] leading-snug text-primary-foreground/80">
          Estes marcos medem o seu cuidado e a sua constância. Nenhum deles depende da resposta
          dele, e nenhum é uma promessa de reconciliação.
        </p>
      </section>

      <SectionTitle>Diagnóstico</SectionTitle>
      <section className="rounded-card bg-card p-5 shadow-soft">
        <div className="flex items-center gap-4">
          <EmojiBadge name={summary.diagnosis.done ? "ok" : "escrever"} tint="rose" size="lg" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-display text-[16px] font-extrabold">Meu Mapa de Reconquista</h3>
              <StatusPill done={summary.diagnosis.done}>
                {summary.diagnosis.done ? "Feito" : "Pendente"}
              </StatusPill>
            </div>
            <p className="mt-0.5 text-[13px] leading-snug text-muted-foreground">
              {summary.diagnosis.at
                ? `Último em ${shortDate(summary.diagnosis.at)}${summary.diagnosis.count > 1 ? ` · ${summary.diagnosis.count} diagnósticos no histórico` : ""}`
                : "Seis perguntas para personalizar o app ao seu momento."}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          className="mt-4 h-11 w-full rounded-xl bg-card font-bold"
          onClick={summary.diagnosis.done ? openMap : openDiagnosis}
        >
          {summary.diagnosis.done ? "Ver meu Mapa" : "Fazer meu diagnóstico"} <ArrowRight />
        </Button>
      </section>

      <SectionTitle>Primeiras 48 horas</SectionTitle>
      <section className="rounded-card bg-card p-5 shadow-soft">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-display text-[16px] font-extrabold">Meu Plano de 48 Horas</h3>
          <StatusPill done={summary.first48.complete}>
            {summary.first48.complete
              ? `Concluído ${summary.first48.completedAt ? shortDate(summary.first48.completedAt) : ""}`
              : `${summary.first48.done} de ${summary.first48.total}`}
          </StatusPill>
        </div>
        <div className="mt-3 flex">
          <GoalProgress
            tone="primary"
            value={summary.first48.done}
            max={summary.first48.total}
            label="Atividades concluídas do plano de 48 horas"
          />
        </div>
        {summary.diagnosis.done ? (
          <Button
            variant="outline"
            className="mt-4 h-11 w-full rounded-xl bg-card font-bold"
            onClick={openFirst48}
          >
            {summary.first48.complete ? "Rever o plano" : "Continuar o plano"} <ArrowRight />
          </Button>
        ) : (
          <p className="mt-3 text-[13px] leading-snug text-muted-foreground">
            O plano é montado a partir do diagnóstico.
          </p>
        )}
      </section>

      <SectionTitle>Plano de 21 dias</SectionTitle>
      <section className="rounded-card bg-card p-5 shadow-soft">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-display text-[16px] font-extrabold">
            {summary.plan.done} de {summary.plan.total} dias
          </h3>
          <StatusPill done={summary.plan.finished}>
            {summary.plan.finished ? "Concluído" : "Em andamento"}
          </StatusPill>
        </div>
        <div className="mt-3">
          <PhaseBar completed={summary.plan.done} />
        </div>
        <ul className="mt-4 space-y-2">
          {summary.plan.phases.map((phase) => (
            <li key={phase.phase} className="flex items-center gap-3 text-sm">
              <span
                className={cn(
                  "grid size-7 shrink-0 place-items-center rounded-full text-[12px] font-black",
                  phase.done === phase.total
                    ? "bg-success text-primary-foreground"
                    : "bg-primary-soft text-primary",
                )}
              >
                {phase.done === phase.total ? (
                  <Check className="size-4" strokeWidth={3} />
                ) : (
                  phase.phase
                )}
              </span>
              <span className="min-w-0 flex-1 font-semibold">{phase.title}</span>
              <span className="shrink-0 text-xs font-bold tabular-nums text-muted-foreground">
                {phase.done} de {phase.total}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-4 rounded-xl bg-muted px-4 py-3 text-[13px] leading-snug">
          {summary.impulse.days === 1 ? "1 dia" : `${summary.impulse.days} dias`} sem agir por
          impulso. A meta da Fase 1 é {summary.impulse.goal}.
        </p>
        <Button
          variant="outline"
          className="mt-4 h-11 w-full rounded-xl bg-card font-bold"
          onClick={openPlan}
        >
          Ver o caminho do plano <ArrowRight />
        </Button>
      </section>

      <SectionTitle>Ferramentas utilizadas</SectionTitle>
      {used.length === 0 ? (
        <section className="flex items-center gap-3 rounded-card bg-tint-rose p-5">
          <EmojiBadge name="diario" tint="rose" size="md" />
          <p className="text-[13px] leading-snug">
            Quando você usar a Pausa, o Diário ou a Central, o registro aparece aqui.
          </p>
        </section>
      ) : (
        <ul className="overflow-hidden rounded-card bg-card shadow-soft">
          {used.map((tool) => (
            <li
              key={tool.id}
              className="flex items-center justify-between gap-3 border-b border-border px-5 py-3.5 last:border-b-0"
            >
              <span className="text-sm font-semibold">{tool.label}</span>
              <span className="font-display text-lg font-black tabular-nums text-primary">
                {tool.count}
              </span>
            </li>
          ))}
        </ul>
      )}
      {reset && (
        <div className="mt-3 rounded-card bg-card p-5 shadow-soft">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-display text-[15px] font-extrabold">Reset Emocional do Ex</h3>
            <span className="text-xs font-bold tabular-nums text-muted-foreground">
              {reset.stepsDone} de 7 etapas · {reset.modulesDone} de 5 módulos
            </span>
          </div>
          <div className="mt-3 flex">
            <GoalProgress
              tone="primary"
              value={reset.percent}
              max={100}
              label="Progresso do Reset"
            />
          </div>
        </div>
      )}
      <Button variant="ghost" className="mt-2 h-11 w-full rounded-xl font-bold" onClick={openDiary}>
        Abrir o Diário <ArrowRight />
      </Button>

      <SectionTitle>Marcos</SectionTitle>
      <ol className="space-y-2">
        {summary.milestones.map((item) => (
          <li
            key={item.id}
            className={cn(
              "flex gap-3 rounded-xl px-4 py-3",
              item.achieved ? "bg-card shadow-soft" : "border border-dashed border-border",
            )}
          >
            {item.achieved ? (
              <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-success text-primary-foreground">
                <Check className="size-3.5" strokeWidth={3.5} />
              </span>
            ) : (
              <Circle aria-hidden className="mt-0.5 size-6 shrink-0 text-border" />
            )}
            <span className="min-w-0 flex-1">
              <span
                className={cn(
                  "block text-sm font-extrabold leading-snug",
                  !item.achieved && "text-muted-foreground",
                )}
              >
                {item.title}
              </span>
              <span className="mt-0.5 block text-[13px] leading-snug text-muted-foreground">
                {item.description}
              </span>
              {item.at && (
                <span className="mt-1 block text-[11px] font-bold text-success">
                  {formatWhen(item.at)}
                </span>
              )}
            </span>
            <span className="sr-only">{item.achieved ? "Alcançado" : "Ainda não"}</span>
          </li>
        ))}
      </ol>
    </Overlay>
  );
}
