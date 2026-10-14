import { useState } from "react";
import { ArrowRight, Check, CircleCheck, ClipboardList, NotebookPen, X } from "lucide-react";

import { CareLines, CheckRow, Emoji, Overlay, SectionTitle } from "@/components/common";
import { BulletList } from "@/components/comunicacao/shared";
import { ToolLinks } from "@/components/tool-links";
import { useResolveLink } from "@/components/use-resolve-link";
import { Button } from "@/components/ui/button";
import { linkLabel, type AppLink } from "@/lib/app-link";
import { messageById } from "@/lib/comunicacao/rules";
import { useJornada } from "@/lib/jornada/store";
import { dayContent, phaseOf, type PlanDay, type PlanExample, type PlanExercise } from "@/lib/plan";
import { resolveDay } from "@/lib/plan-guide";
import { dayState } from "@/lib/progress";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

/** Exemplo "evitar" da Central lado a lado com a alternativa dele (sem duplicar o texto). */
function CompareCard({ id }: { id: string }) {
  const avoid = messageById(id);
  const better = avoid?.alternative ? messageById(avoid.alternative) : undefined;
  if (!avoid) return null;
  return (
    <div className="rounded-card bg-card p-4 shadow-soft">
      <p className="text-[11px] font-extrabold uppercase tracking-wide text-destructive">
        Evite: {avoid.title}
      </p>
      <p className="mt-1.5 text-sm leading-6 text-muted-foreground line-through decoration-destructive/50">
        “{avoid.text}”
      </p>
      <p className="mt-2 text-[13px] leading-5">{avoid.whyTone}</p>
      {better && (
        <>
          <p className="mt-3 text-[11px] font-extrabold uppercase tracking-wide text-success">
            {better.kind === "reflexao" ? "No lugar, para o seu Diário" : "No lugar"}:{" "}
            {better.title}
          </p>
          <p className="mt-1.5 rounded-xl bg-success-soft px-3 py-2 text-sm leading-6">
            “{better.text}”
          </p>
        </>
      )}
    </div>
  );
}

/** Passos do exercício e, quando há perguntas, campos para escrever e guardar no Diário. */
function Exercise({ day, exercise }: { day: number; exercise: PlanExercise }) {
  const { addEntry, showToast } = useStore();
  const prompts = exercise.prompts ?? [];
  const [answers, setAnswers] = useState<string[]>(() => prompts.map(() => ""));
  const filled = answers.some((answer) => answer.trim());

  const save = () => {
    const body = prompts
      .flatMap((prompt, index) => {
        const answer = answers[index]?.trim();
        return answer ? [`${prompt}\n${answer}`] : [];
      })
      .join("\n\n");
    if (
      !addEntry({
        type: "note",
        source: "plano",
        text: `Dia ${day} · ${exercise.title}\n\n${body}`,
      })
    )
      return;
    setAnswers(prompts.map(() => ""));
    showToast("Guardado no Diário.");
  };

  return (
    <div className="rounded-card bg-card p-4 shadow-soft">
      <p className="font-display text-[15px] font-extrabold">{exercise.title}</p>
      <ol className="mt-3 space-y-2">
        {exercise.steps.map((step, index) => (
          <li key={step} className="flex gap-3 text-sm leading-6">
            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary-soft text-[11px] font-extrabold text-primary">
              {index + 1}
            </span>
            {step}
          </li>
        ))}
      </ol>
      {prompts.length > 0 && (
        <div className="mt-4 space-y-3">
          {prompts.map((prompt, index) => (
            <label key={prompt} className="block">
              <span className="text-sm font-bold leading-snug">{prompt}</span>
              <textarea
                rows={2}
                maxLength={2000}
                value={answers[index] ?? ""}
                onChange={(event) =>
                  setAnswers((current) =>
                    current.map((item, i) => (i === index ? event.target.value : item)),
                  )
                }
                className="mt-1.5 w-full resize-none rounded-xl border border-input bg-background p-3 text-base leading-normal outline-none focus:border-primary"
              />
            </label>
          ))}
          <Button className="h-11 w-full rounded-xl" disabled={!filled} onClick={save}>
            <NotebookPen /> Guardar no Diário
          </Button>
          <p className="text-center text-[11px] text-muted-foreground">
            Fica só no seu Diário, neste aparelho. Nada é enviado para ele.
          </p>
        </div>
      )}
    </div>
  );
}

function Concept({ content, example }: { content: PlanDay; example: PlanExample }) {
  return (
    <>
      <SectionTitle>Entenda</SectionTitle>
      <div className="space-y-3">
        {content.concept.map((paragraph) => (
          <p key={paragraph} className="text-sm leading-6">
            {paragraph}
          </p>
        ))}
      </div>
      {content.points && (
        <div className="mt-4 space-y-2">
          {content.points.map((point) => (
            <div key={point.title} className="rounded-xl border border-border bg-card px-4 py-3">
              <p className="text-sm font-extrabold">{point.title}</p>
              <p className="mt-0.5 text-sm leading-6 text-muted-foreground">{point.text}</p>
            </div>
          ))}
        </div>
      )}

      <SectionTitle>Exemplo</SectionTitle>
      <div className="rounded-card bg-tint-lavender p-4">
        <p className="eyebrow mb-1.5">Situação ilustrativa</p>
        <p className="text-sm leading-6">{example.situation}</p>
        {example.contrast && (
          <div className="mt-3 space-y-2">
            <p className="flex gap-2 rounded-xl bg-card px-3 py-2 text-sm leading-6">
              <X aria-label="Evite" className="mt-1 size-4 shrink-0 text-destructive" />
              <span className="text-muted-foreground">“{example.contrast.avoid}”</span>
            </p>
            <p className="flex gap-2 rounded-xl bg-card px-3 py-2 text-sm leading-6">
              <Check aria-label="Prefira" className="mt-1 size-4 shrink-0 text-success" />
              <span>“{example.contrast.better}”</span>
            </p>
          </div>
        )}
        <p className="mt-3 text-sm font-bold leading-6">{example.takeaway}</p>
      </div>
      {content.compare && (
        <div className="mt-3 space-y-3">
          <p className="text-[13px] text-muted-foreground">Da Central de Comunicação:</p>
          {content.compare.map((id) => (
            <CompareCard key={id} id={id} />
          ))}
        </div>
      )}
    </>
  );
}

/** Tela cheia do dia: objetivo, orientação para o momento dela, conceito, exemplo, prática, o que
 * evitar, ação, exercício, checklist (gravado) e ferramentas. Só conclui se o dia estiver
 * liberado; o checklist ajuda, mas nunca é condição para concluir. */
export function DayPanel({
  day,
  onClose,
  onCompleted,
  openLink,
}: {
  day: number;
  onClose: () => void;
  onCompleted: (day: number) => void;
  openLink: (link: AppLink) => void;
}) {
  const { data, entitlements, completeDay } = useStore();
  const { current, result, data: jornada, togglePlanCheck } = useJornada();
  const resolveLink = useResolveLink();
  const content = dayContent(day);
  const phase = phaseOf(day);
  const state = dayState(data, day, { allDays: entitlements.allDays });
  const alreadyDone = state === "done";
  const guide = resolveDay(content, current?.answers ?? null, data.profile?.scenario ?? null);
  const checks = jornada.plan?.checks ?? {};
  const checked = guide.checklist.filter((item) => checks[item.id]).length;
  const primary = guide.tools[0] ? resolveLink(guide.tools[0].link) : null;
  const [confirming, setConfirming] = useState(false);

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
        <div className="min-w-0">
          <p className="eyebrow">Objetivo do dia</p>
          <p className="mt-1 font-display text-[15px] font-extrabold leading-snug">
            {content.goal}
          </p>
          <p className="mt-2 text-xs font-bold text-muted-foreground">
            Cerca de {content.minutes} min · {phase.title}
          </p>
        </div>
      </div>

      <section
        aria-label="Para o seu momento"
        className={cn(
          "mt-4 rounded-card p-4",
          guide.stance === "conversa" ? "bg-tint-sage" : "bg-tint-honey",
        )}
      >
        <p className="eyebrow">Para o seu momento</p>
        <p className="mt-1 font-display text-[15px] font-extrabold">{guide.title}</p>
        <div className="mt-2 space-y-2">
          {guide.text.map((paragraph) => (
            <p key={paragraph} className="text-sm leading-6">
              {paragraph}
            </p>
          ))}
        </div>
        {guide.notes.map((note) => (
          <div key={note.text} className="mt-3 rounded-xl bg-card px-3 py-3 text-sm leading-6">
            {note.text}
            {note.link && (
              <Button
                variant="ghost"
                className="mt-1 h-9 w-full rounded-xl font-bold text-primary"
                onClick={() => openLink(note.link!.link)}
              >
                {note.link.label ?? linkLabel(note.link.link)} <ArrowRight />
              </Button>
            )}
          </div>
        ))}
        {guide.stance === "sem_diagnostico" && (
          <Button
            variant="outline"
            className="mt-3 h-11 w-full rounded-xl bg-card font-bold"
            onClick={() => openLink({ kind: "diagnosis" })}
          >
            <ClipboardList /> Fazer meu diagnóstico
          </Button>
        )}
      </section>

      <Concept content={content} example={guide.example} />

      <SectionTitle>Na prática</SectionTitle>
      <ol className="space-y-2">
        {guide.practice.map((item, index) => (
          <li
            key={item}
            className="flex gap-3 rounded-xl bg-card px-4 py-3 text-sm leading-6 shadow-soft"
          >
            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary-soft text-[11px] font-extrabold text-primary">
              {index + 1}
            </span>
            {item}
          </li>
        ))}
      </ol>

      <SectionTitle>O que evitar</SectionTitle>
      <BulletList items={content.avoid} tone="avoid" />

      <SectionTitle>Ação de hoje</SectionTitle>
      <div className="rounded-card bg-tint-honey p-4">
        <p className="text-[15px] font-bold leading-6 text-foreground">{guide.action}</p>
        {primary && (
          <Button
            variant="outline"
            className="mt-4 h-11 w-full rounded-xl bg-card font-bold"
            onClick={() => openLink(primary)}
          >
            {guide.tools[0]!.label ?? linkLabel(primary)} <ArrowRight />
          </Button>
        )}
      </div>

      <SectionTitle>Exercício</SectionTitle>
      <Exercise key={guide.key} day={day} exercise={guide.exercise} />

      <div className="mb-3 mt-6 flex items-baseline justify-between gap-3">
        <h2 className="font-display text-lg font-extrabold">Checklist</h2>
        <span className="text-xs font-bold text-muted-foreground">
          {checked} de {guide.checklist.length}
        </span>
      </div>
      <div className="space-y-2">
        {guide.checklist.map((item) => (
          <CheckRow
            key={item.id}
            checked={Boolean(checks[item.id])}
            onToggle={() => togglePlanCheck(item.id)}
          >
            {item.text}
          </CheckRow>
        ))}
      </div>
      <p className="mt-2 text-[12px] leading-5 text-muted-foreground">
        O checklist ajuda a acompanhar, mas não é condição para concluir o dia.
      </p>

      <SectionTitle>Ferramentas relacionadas</SectionTitle>
      <ToolLinks links={guide.tools} onOpen={openLink} />

      {result?.showCareLines && (
        <div className="mt-6">
          <CareLines highlight />
        </div>
      )}

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
