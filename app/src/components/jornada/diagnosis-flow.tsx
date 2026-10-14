import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Sparkles } from "lucide-react";

import { Overlay } from "@/components/common";
import { Button } from "@/components/ui/button";
import { diagnosisQuestions, isAnswered, isValidAnswers } from "@/lib/jornada/diagnosis";
import { useJornada } from "@/lib/jornada/store";
import type { DiagnosisAnswers, DiagnosisOption } from "@/lib/jornada/types";
import { cn } from "@/lib/utils";

const TOTAL = diagnosisQuestions.length;

/** Na múltipla, a opção exclusiva ("Ainda não tentei nada") desmarca as outras e vice-versa. */
function toggleMulti(current: unknown, option: DiagnosisOption, options: DiagnosisOption[]) {
  const list = Array.isArray(current) ? (current as string[]) : [];
  if (list.includes(option.value)) return list.filter((item) => item !== option.value);
  if (option.exclusive) return [option.value];
  const exclusive = new Set(options.filter((item) => item.exclusive).map((item) => item.value));
  return [...list.filter((item) => !exclusive.has(item)), option.value];
}

/**
 * Diagnóstico de entrada: uma pergunta por tela, cards selecionáveis e barra de progresso.
 * Cada resposta fica salva como rascunho; fechar no meio e voltar depois continua de onde parou.
 * Ao refazer, as respostas anteriores já vêm marcadas.
 */
export function DiagnosisFlow({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const { data, current, saveDiagnosis, saveDraft } = useJornada();
  const draft = data.diagnosisDraft;
  const [step, setStep] = useState(() => Math.min(draft?.step ?? 0, TOTAL - 1));
  const [answers, setAnswers] = useState<Partial<DiagnosisAnswers>>(
    () => draft?.answers ?? current?.answers ?? {},
  );
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [saving, setSaving] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const top = useRef<HTMLDivElement | null>(null);

  const question = diagnosisQuestions[step]!;
  const value = answers[question.id];
  const answered = isAnswered(question, value);
  const last = step === TOTAL - 1;

  useEffect(() => () => window.clearTimeout(timer.current), []);
  useEffect(() => {
    top.current?.scrollIntoView({ block: "start" });
  }, [step]);

  const go = (next: number, nextAnswers = answers) => {
    window.clearTimeout(timer.current);
    const target = Math.max(0, Math.min(TOTAL - 1, next));
    setDirection(target < step ? "back" : "forward");
    setStep(target);
    saveDraft(target, nextAnswers);
  };

  const choose = (option: DiagnosisOption) => {
    const nextValue = question.multiple
      ? toggleMulti(value, option, question.options)
      : option.value;
    const nextAnswers = { ...answers, [question.id]: nextValue } as Partial<DiagnosisAnswers>;
    setAnswers(nextAnswers);
    saveDraft(step, nextAnswers);
    // Escolha única avança sozinha depois de um instante, para a seleção ficar visível.
    if (!question.multiple && !last) {
      const from = step;
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => {
        setDirection("forward");
        setStep((currentStep) => (currentStep === from ? from + 1 : currentStep));
        saveDraft(from + 1, nextAnswers);
      }, 280);
    }
  };

  const finish = () => {
    if (!isValidAnswers(answers)) {
      // Alguma pergunta ficou sem resposta (não deveria acontecer): volta para ela.
      const missing = diagnosisQuestions.findIndex((q) => !isAnswered(q, answers[q.id]));
      if (missing >= 0) go(missing);
      return;
    }
    setSaving(true);
    if (saveDiagnosis(answers)) onDone();
    else setSaving(false);
  };

  const selected = (option: DiagnosisOption) =>
    Array.isArray(value) ? (value as string[]).includes(option.value) : value === option.value;

  return (
    <Overlay
      eyebrow={current ? "Refazer diagnóstico" : "Meu Plano Pessoal"}
      title={`Pergunta ${step + 1} de ${TOTAL}`}
      onClose={step === 0 ? onClose : () => go(step - 1)}
      closeIcon={step === 0 ? "close" : "back"}
    >
      <div ref={top} className="scroll-mt-24" />
      <div
        role="progressbar"
        aria-label="Progresso do diagnóstico"
        aria-valuemin={0}
        aria-valuemax={TOTAL}
        aria-valuenow={step + (answered ? 1 : 0)}
        className="h-2 overflow-hidden rounded-full bg-primary/15"
      >
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${((step + (answered ? 1 : 0)) / TOTAL) * 100}%` }}
        />
      </div>

      <div
        key={question.id}
        className={cn(
          "motion-safe:animate-in motion-safe:fade-in motion-safe:duration-300",
          direction === "forward"
            ? "motion-safe:slide-in-from-right-4"
            : "motion-safe:slide-in-from-left-4",
        )}
      >
        <h2 className="mt-6 font-display text-2xl font-black leading-tight">{question.title}</h2>
        {question.hint && (
          <p className="mt-1.5 text-sm leading-snug text-muted-foreground">{question.hint}</p>
        )}
        <div
          className="mt-5 space-y-2.5"
          role={question.multiple ? "group" : "radiogroup"}
          aria-label={question.title}
        >
          {question.options.map((option) => {
            const on = selected(option);
            return (
              <button
                key={option.value}
                type="button"
                role={question.multiple ? "checkbox" : "radio"}
                aria-checked={on}
                onClick={() => choose(option)}
                className={cn(
                  "flex min-h-[54px] w-full cursor-pointer items-center gap-3 rounded-2xl border-2 bg-card px-4 py-3 text-left text-[15px] font-bold leading-snug transition-all active:scale-[0.99]",
                  on
                    ? "border-primary bg-primary-soft text-foreground shadow-soft"
                    : "border-border hover:border-primary/40",
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    "grid size-6 shrink-0 place-items-center border-2 transition-colors",
                    question.multiple ? "rounded-md" : "rounded-full",
                    on ? "border-primary bg-primary text-primary-foreground" : "border-border",
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
            className="h-12 rounded-xl bg-card font-bold"
            onClick={() => go(step - 1)}
          >
            <ArrowLeft /> Voltar
          </Button>
        )}
        {last ? (
          <Button
            className="h-12 flex-1 rounded-xl font-bold"
            disabled={!answered || saving}
            onClick={finish}
          >
            <Sparkles /> Ver meu Mapa de Reconquista
          </Button>
        ) : (
          <Button
            className="h-12 flex-1 rounded-xl font-bold"
            disabled={!answered}
            onClick={() => go(step + 1)}
          >
            Próxima <ArrowRight />
          </Button>
        )}
      </div>
      <p className="mt-5 text-center text-xs leading-5 text-muted-foreground">
        Suas respostas ficam só neste aparelho e servem para adaptar as orientações a você.
        {current && " Refazer não apaga o seu Diário nem o progresso do plano."}
      </p>
    </Overlay>
  );
}
