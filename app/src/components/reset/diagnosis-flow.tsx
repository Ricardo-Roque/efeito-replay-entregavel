import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, Sparkles, X } from "lucide-react";

import {
  LimitNotice,
  ResetProgress,
  ResetShell,
  SectionLabel,
} from "@/components/reset/reset-common";
import { Button } from "@/components/ui/button";
import {
  buildMap,
  optionLabel,
  questions,
  type Answers,
  type ModuleId,
} from "@/lib/reset/diagnosis";
import { modules } from "@/lib/reset/content";
import { useReset } from "@/lib/reset/store";
import { cn } from "@/lib/utils";

/** Diagnóstico emocional: uma pergunta por tela, cards selecionáveis e barra de progresso. */
export function DiagnosisFlow({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const { saveDiagnosis, current } = useReset();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<Answers>>({});
  const [saving, setSaving] = useState(false);
  const question = questions[step]!;
  const selected = answers[question.id];
  const last = step === questions.length - 1;

  const choose = (value: string) => {
    setAnswers((current) => ({ ...current, [question.id]: value }));
    // Avança sozinho depois de um instante, para a escolha ficar visível.
    if (!last) window.setTimeout(() => setStep((s) => Math.min(s + 1, questions.length - 1)), 260);
  };

  const finish = () => {
    if (questions.some((q) => !answers[q.id])) return;
    setSaving(true);
    if (saveDiagnosis(answers as Answers)) onDone();
    else setSaving(false);
  };

  return (
    <ResetShell
      eyebrow={current ? "Refazer diagnóstico" : "Diagnóstico emocional"}
      title={`Pergunta ${step + 1} de ${questions.length}`}
      onBack={step === 0 ? onClose : () => setStep(step - 1)}
      backLabel={step === 0 ? "Sair do diagnóstico" : "Pergunta anterior"}
      closeIcon={step === 0}
    >
      <ResetProgress
        value={Math.round(((step + (selected ? 1 : 0)) / questions.length) * 100)}
        label="Progresso do diagnóstico"
      />
      <div
        key={question.id}
        className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-right-4"
      >
        <h2 className="mt-6 font-display text-2xl font-black leading-tight">{question.title}</h2>
        <div className="mt-5 space-y-2.5" role="radiogroup" aria-label={question.title}>
          {question.options.map((option) => {
            const on = selected === option.value;
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => choose(option.value)}
                className={cn(
                  "flex w-full cursor-pointer items-center gap-3 rounded-2xl border-2 bg-card px-4 py-3.5 text-left text-[15px] font-bold transition-all active:scale-[0.99]",
                  on
                    ? "border-reset bg-reset-soft text-foreground"
                    : "border-border hover:border-reset/40",
                )}
              >
                <span
                  className={cn(
                    "grid size-6 shrink-0 place-items-center rounded-full border-2 transition-colors",
                    on ? "border-reset bg-reset text-primary-foreground" : "border-border",
                  )}
                >
                  {on && <Check className="size-3.5" strokeWidth={3} />}
                </span>
                {option.label}
              </button>
            );
          })}
        </div>
      </div>
      <div className="mt-6 flex gap-2">
        {step > 0 && (
          <Button
            variant="outline"
            className="h-12 rounded-xl bg-card"
            onClick={() => setStep(step - 1)}
          >
            <ArrowLeft /> Voltar
          </Button>
        )}
        {last ? (
          <Button
            className="h-12 flex-1 rounded-xl bg-reset font-bold hover:bg-reset/90"
            disabled={!selected || saving}
            onClick={finish}
          >
            <Sparkles /> Ver meu Mapa de Reconstrução
          </Button>
        ) : (
          <Button
            className="h-12 flex-1 rounded-xl bg-reset font-bold hover:bg-reset/90"
            disabled={!selected}
            onClick={() => setStep(step + 1)}
          >
            Próxima <ArrowRight />
          </Button>
        )}
      </div>
      <p className="mt-5 text-center text-xs leading-5 text-muted-foreground">
        Suas respostas ficam só neste aparelho. Elas servem para adaptar as orientações a você.
      </p>
    </ResetShell>
  );
}

/** Mapa de Reconstrução Emocional: o resultado do diagnóstico atual. */
export function DiagnosisResult({
  onBack,
  openModule,
  openJourney,
  redo,
}: {
  onBack: () => void;
  openModule: (id: ModuleId) => void;
  openJourney: () => void;
  redo: () => void;
}) {
  const { current, data } = useReset();
  if (!current) return null;
  const map = buildMap(current.answers);
  const firstModule = modules.find((m) => m.id === map.firstStep.module)!;
  const history = data.diagnoses.slice(0, -1).reverse();

  return (
    <ResetShell eyebrow="Seu resultado" title="Mapa de Reconstrução Emocional" onBack={onBack}>
      <div className="rounded-card bg-reset p-5 text-primary-foreground shadow-soft">
        <p className="text-[11px] font-extrabold uppercase tracking-widest text-primary-foreground/75">
          Principal dificuldade
        </p>
        <h2 className="mt-1 font-display text-2xl font-black leading-tight">
          {map.difficulty.title}
        </h2>
        <p className="mt-2 text-sm leading-6 text-primary-foreground/90">{map.difficulty.text}</p>
      </div>

      {map.mode === "limite" && (
        <div className="mt-4">
          <LimitNotice />
        </div>
      )}

      <SectionLabel>O que pode estar mantendo o distanciamento</SectionLabel>
      <ul className="space-y-2.5">
        {map.factors.map((factor) => (
          <li key={factor} className="rounded-xl bg-card px-4 py-3 text-sm leading-6 shadow-soft">
            {factor}
          </li>
        ))}
      </ul>
      <p className="mt-2 text-xs leading-5 text-muted-foreground">
        Orientações a partir do que você contou. Não são certezas sobre o que ele pensa ou sente.
      </p>

      <SectionLabel>Comportamentos para evitar agora</SectionLabel>
      <ul className="space-y-2">
        {map.avoid.map((item) => (
          <li
            key={item}
            className="flex gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm leading-6"
          >
            <X aria-hidden className="mt-1 size-4 shrink-0 text-primary" strokeWidth={3} />
            {item}
          </li>
        ))}
      </ul>

      <SectionLabel>Primeiro passo recomendado</SectionLabel>
      <div className="rounded-card border-2 border-reset/30 bg-reset-soft p-4">
        <p className="font-display text-[17px] font-extrabold leading-snug">
          {map.firstStep.title}
        </p>
        <p className="mt-1.5 text-sm leading-6">{map.firstStep.text}</p>
        <Button
          className="mt-4 h-11 w-full rounded-xl bg-reset font-bold hover:bg-reset/90"
          onClick={() => openModule(map.firstStep.module)}
        >
          Abrir {firstModule.title} <ArrowRight />
        </Button>
      </div>

      <SectionLabel>Seu protocolo de sete etapas</SectionLabel>
      <ol className="space-y-2.5">
        {map.steps.map((step, index) => (
          <li key={step.title} className="flex gap-3 rounded-xl bg-card p-4 shadow-soft">
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-reset-soft font-display text-sm font-black text-reset">
              {index + 1}
            </span>
            <span>
              <span className="block text-sm font-extrabold leading-snug">{step.title}</span>
              <span className="mt-0.5 block text-[13px] leading-snug text-muted-foreground">
                {step.focus}
              </span>
            </span>
          </li>
        ))}
      </ol>
      <Button
        variant="outline"
        className="mt-4 h-11 w-full rounded-xl bg-card font-bold"
        onClick={openJourney}
      >
        Começar a jornada <ArrowRight />
      </Button>

      <SectionLabel>Suas respostas</SectionLabel>
      <dl className="rounded-card bg-card p-4 text-sm shadow-soft">
        {questions.map((q) => (
          <div key={q.id} className="border-b border-border py-2 last:border-b-0">
            <dt className="text-xs font-bold text-muted-foreground">{q.title}</dt>
            <dd className="font-semibold">{optionLabel(q.id, current.answers[q.id] as never)}</dd>
          </div>
        ))}
      </dl>
      <Button variant="ghost" className="mt-2 h-11 w-full font-bold text-reset" onClick={redo}>
        Refazer o diagnóstico
      </Button>
      {history.length > 0 && (
        <p className="mt-1 text-center text-xs text-muted-foreground">
          Diagnósticos anteriores guardados: {history.length} (o mais recente é{" "}
          {new Date(history[0]!.at).toLocaleDateString("pt-BR")}).
        </p>
      )}
    </ResetShell>
  );
}
