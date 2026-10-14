import { ArrowRight, Check, CircleCheck, Lock } from "lucide-react";

import {
  CheckRow,
  LimitNotice,
  NoteField,
  ResetProgress,
  ResetShell,
  SectionLabel,
  useResetLimit,
} from "@/components/reset/reset-common";
import { Button } from "@/components/ui/button";
import { journeySteps, modules } from "@/lib/reset/content";
import { buildMap, type ModuleId } from "@/lib/reset/diagnosis";
import { stepDone, useReset } from "@/lib/reset/store";
import { cn } from "@/lib/utils";

/** Minha Jornada de Reconexão: as sete etapas, no ritmo dela (sem bloqueio de tempo). */
export function JourneyList({
  onBack,
  openStep,
}: {
  onBack: () => void;
  openStep: (id: number) => void;
}) {
  const { data, current } = useReset();
  const { appLimit } = useResetLimit();
  const titles = current ? buildMap(current.answers, appLimit).steps : null;
  const done = journeySteps.filter((s) => stepDone(data, s.id)).length;

  return (
    <ResetShell
      eyebrow="Protocolo de sete etapas"
      title="Minha Jornada de Reconexão"
      onBack={onBack}
    >
      <p className="text-sm leading-6 text-muted-foreground">
        Sete etapas sugeridas para reconstruir a confiança. Não é uma promessa de reconciliação em
        sete dias: avance no seu ritmo.
      </p>
      <div className="mt-4 flex items-center gap-3">
        <div className="flex-1">
          <ResetProgress
            value={Math.round((done / journeySteps.length) * 100)}
            label="Etapas concluídas"
          />
        </div>
        <span className="text-xs font-bold text-muted-foreground">
          {done} de {journeySteps.length}
        </span>
      </div>
      <ol className="mt-5 space-y-2.5">
        {journeySteps.map((step) => {
          const finished = stepDone(data, step.id);
          const title = titles?.[step.id - 1]?.title ?? defaultTitle(step.id);
          return (
            <li key={step.id}>
              <button
                type="button"
                onClick={() => openStep(step.id)}
                className="flex w-full cursor-pointer items-center gap-3 rounded-card bg-card p-4 text-left shadow-soft transition-transform active:scale-[0.99]"
              >
                <span
                  className={cn(
                    "grid size-10 shrink-0 place-items-center rounded-full font-display font-black",
                    finished ? "bg-success text-primary-foreground" : "bg-reset-soft text-reset",
                  )}
                >
                  {finished ? <Check className="size-5" strokeWidth={3} /> : step.id}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-bold text-muted-foreground">
                    Etapa {step.id}
                  </span>
                  <span className="block font-display text-[15px] font-extrabold leading-snug">
                    {title}
                  </span>
                </span>
                <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
              </button>
            </li>
          );
        })}
      </ol>
    </ResetShell>
  );
}

const defaultTitles = [
  "Entendendo a ferida emocional",
  "Identificando os gatilhos de conflito",
  "Desenvolvendo a consciência do perdão",
  "Aprendendo uma nova comunicação",
  "Trabalhando a reconstrução da confiança",
  "Preparando uma possível reaproximação",
  "Definindo os próximos passos",
];
const defaultTitle = (id: number) => defaultTitles[id - 1] ?? "";

export function JourneyStepView({
  id,
  onBack,
  openModule,
  openStep,
}: {
  id: number;
  onBack: () => void;
  openModule: (id: ModuleId) => void;
  openStep: (id: number) => void;
}) {
  const { data, current, toggleCheck, completeStep } = useReset();
  const { appLimit, limit } = useResetLimit();
  const step = journeySteps.find((s) => s.id === id)!;
  const personal = current ? buildMap(current.answers, appLimit).steps[id - 1] : null;
  const checks = data.journey[id]?.checks ?? [];
  const finished = stepDone(data, id);
  const allChecked = step.checklist.every((_, index) => checks.includes(index));
  const module = step.module ? modules.find((m) => m.id === step.module) : null;
  const next = journeySteps.find((s) => s.id === id + 1);

  return (
    <ResetShell
      eyebrow={`Etapa ${id} de ${journeySteps.length}`}
      title={personal?.title ?? defaultTitle(id)}
      onBack={onBack}
    >
      <div className="rounded-card bg-reset-soft p-4">
        <p className="text-[11px] font-extrabold uppercase tracking-widest text-reset">Objetivo</p>
        <p className="mt-1 text-[15px] font-semibold leading-6">{step.objective}</p>
        {personal && (
          <p className="mt-2 text-sm leading-6">
            <b>No seu caso:</b> {personal.focus}
          </p>
        )}
      </div>

      {limit && (
        <div className="mt-4">
          <LimitNotice />
        </div>
      )}

      <SectionLabel>Conteúdo</SectionLabel>
      <div className="space-y-3">
        {step.content.map((paragraph) => (
          <p key={paragraph} className="text-sm leading-6">
            {paragraph}
          </p>
        ))}
      </div>

      <SectionLabel>Atividade</SectionLabel>
      <div className="rounded-card bg-card p-4 shadow-soft">
        <p className="text-sm font-semibold leading-6">{step.activity}</p>
        {module && (
          <Button
            variant="outline"
            className="mt-3 h-auto min-h-10 w-full whitespace-normal rounded-xl bg-card py-2 font-bold"
            onClick={() => openModule(module.id)}
          >
            Abrir {module.title} <ArrowRight />
          </Button>
        )}
        <div className="mt-4">
          <NoteField noteKey={`etapa:${id}`} label="Minhas anotações desta etapa" />
        </div>
      </div>

      <SectionLabel>Checklist de conclusão</SectionLabel>
      <div className="space-y-2">
        {step.checklist.map((item, index) => (
          <CheckRow
            key={item}
            checked={finished || checks.includes(index)}
            onToggle={() => !finished && toggleCheck(id, index)}
          >
            {item}
          </CheckRow>
        ))}
      </div>

      {finished ? (
        <div className="mt-6 rounded-card bg-success-soft p-4 text-center">
          <CircleCheck className="mx-auto size-7 text-success" />
          <p className="mt-1 font-display font-extrabold">Etapa concluída</p>
          {next && (
            <Button
              className="mt-3 h-11 w-full rounded-xl bg-reset font-bold hover:bg-reset/90"
              onClick={() => openStep(next.id)}
            >
              Ir para a etapa {next.id} <ArrowRight />
            </Button>
          )}
        </div>
      ) : (
        <div className="mt-6">
          <Button
            className="h-12 w-full rounded-xl bg-reset font-bold hover:bg-reset/90"
            disabled={!allChecked}
            onClick={() => completeStep(id)}
          >
            {allChecked ? <CircleCheck /> : <Lock />}
            {allChecked ? "Concluir etapa" : "Marque o checklist para concluir"}
          </Button>
        </div>
      )}
    </ResetShell>
  );
}
