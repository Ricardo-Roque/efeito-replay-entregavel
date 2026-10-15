import { useState } from "react";
import { Archive, ArrowRight, Copy, NotebookPen, TriangleAlert, X } from "lucide-react";

import { Emoji, Highlight, Overlay, ScenarioArt, SectionTitle } from "@/components/common";
import { useCommContext } from "@/components/comunicacao/hooks";
import { Button } from "@/components/ui/button";
import { copyText } from "@/lib/clipboard";
import { features } from "@/lib/features";
import { pauseQuestionsFor, type PauseQuestion } from "@/lib/guide";
import { useJornada } from "@/lib/jornada/store";
import { formatTime } from "@/lib/progress";
import type { ScenarioId } from "@/lib/scenarios";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

type Answer = "yes" | "no";
type Step = "write" | "check" | "result";
type Result = "ok" | "wait" | "blocked";

const WAIT_HOURS = 24;

function resultOf(questions: PauseQuestion[], answers: Record<string, Answer>): Result {
  if (questions.some((q) => q.hardStop && answers[q.id] === "no")) return "blocked";
  if (questions.some((q) => answers[q.id] === "no")) return "wait";
  return "ok";
}

/** Ferramenta central (camada, como o SosTool do CalmBaby): escrever o rascunho, passar pelo
 * checklist e ver o resultado. O app nunca envia nada; no máximo copia o texto.
 * Proteção da madrugada: no pico emocional, a saída é guardar e esperar 24 horas. */
export function PauseTool({
  initialDraft = "",
  onClose,
  openScenario,
}: {
  initialDraft?: string;
  onClose: () => void;
  openScenario: (id: ScenarioId) => void;
}) {
  const { data, addEntry, showToast } = useStore();
  const scenario = data.profile!.scenario;
  const { result: diagnosis } = useJornada();
  const [step, setStep] = useState<Step>("write");
  const [draft, setDraft] = useState(initialDraft);
  // Mesmo limite da Central e do "Ele respondeu. E agora?" (contextOf): bloqueio, pedido de não
  // contato ou outra relação, pelo diagnóstico ou pelo cenário do perfil. Com ele, o limite já vem
  // marcado, não pode ser desmarcado e o resultado é "não envie". Com pedido de tempo ou sem
  // reciprocidade, o checklist ganha a pergunta "ele escreveu primeiro?".
  const { stance } = useCommContext();
  const pauseQuestions = pauseQuestionsFor(stance);
  const limitKnown = stance === "limite";
  // Outra relação (sem bloqueio nem pedido de distância) leva ao cenário "outra"; o resto, ao bloqueio.
  const otherRelation =
    limitKnown &&
    diagnosis?.attention.id !== "bloqueio" &&
    diagnosis?.attention.id !== "pedido_sem_contato" &&
    scenario !== "bloqueou" &&
    (diagnosis?.attention.id === "outra_relacao" || scenario === "outra");
  const limitScenario: ScenarioId = otherRelation ? "outra" : "bloqueou";
  const [answers, setAnswers] = useState<Record<string, Answer>>(
    limitKnown ? { limite: "no" } : {},
  );
  const text = draft.trim();
  const lines = text ? text.split(/\n/).length : 0;
  const allAnswered = pauseQuestions.every((q) => answers[q.id]);
  // Limite registrado não se desfaz aqui: só refazendo o diagnóstico ou trocando o cenário.
  const result = limitKnown ? "blocked" : resultOf(pauseQuestions, answers);
  const locked = (question: PauseQuestion) => limitKnown && Boolean(question.hardStop);
  const readyAt = new Date(Date.now() + WAIT_HOURS * 60 * 60 * 1000);
  const stepLabel = { write: "Passo 1 de 3", check: "Passo 2 de 3", result: "Resultado" }[step];

  const saveDraft = (wait: boolean) => {
    // Diário oculto (lib/features.ts): nada é gravado nem enviado; a Pausa só fecha.
    if (!features.diary) {
      showToast(
        wait
          ? "Nada foi enviado. Se amanhã ainda fizer sentido, passe pela Pausa de novo."
          : "Nada foi enviado. Escrever já tira um pouco do peso.",
      );
      onClose();
      return;
    }
    const ok = wait
      ? addEntry({ type: "draft", source: "nao_enviar", text, readyAt: readyAt.toISOString() })
      : addEntry({
          type: "note",
          source: "nao_enviar",
          text: `Mensagem que eu não enviei: ${text}`,
        });
    if (!ok) return;
    showToast(
      wait
        ? "Guardado no Diário. Amanhã você relê com calma."
        : "Guardado no Diário, só para você.",
    );
    onClose();
  };

  const copy = async () => {
    const ok = await copyText(text);
    showToast(
      ok
        ? "Mensagem copiada. Envie uma vez só e solte o celular."
        : "Não foi possível copiar. Selecione o texto e copie.",
      ok ? "info" : "error",
    );
  };

  return (
    <Overlay eyebrow={stepLabel} title="Pausa antes de enviar" onClose={onClose} closeIcon="close">
      {step === "write" && (
        <>
          <div className="flex items-center gap-4 rounded-card bg-tint-honey p-4">
            <Emoji name="pausa" className="size-16 shrink-0" />
            <div>
              <h2 className="font-display text-xl font-black leading-tight">
                Escreva aqui, não no WhatsApp.
              </h2>
              <p className="mt-1 text-[13px] leading-snug text-muted-foreground">
                Anotar o impulso já tira metade da pressão. Só você vê este texto.
              </p>
            </div>
          </div>
          {scenario === "outra" && (
            <div className="mt-4 flex gap-3 rounded-xl border border-destructive/30 bg-destructive-soft px-4 py-3 text-sm leading-6">
              <TriangleAlert className="mt-0.5 size-5 shrink-0 text-destructive" />
              No seu cenário (ele está com outra pessoa), o plano não sugere mensagens. Escrever
              aqui ajuda a tirar o peso, e pode ficar só com você.
            </div>
          )}
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            rows={6}
            maxLength={2000}
            placeholder="O que você queria mandar para ele?"
            className="mt-5 w-full resize-none rounded-xl border border-input bg-card p-4 text-base leading-normal shadow-sm outline-none focus:border-primary"
          />
          <p className="mt-1.5 text-right text-xs font-bold text-muted-foreground">
            {lines} {lines === 1 ? "linha" : "linhas"} · {text.length} caracteres
          </p>
          <Button
            className="mt-4 h-12 w-full rounded-xl text-sm font-bold"
            disabled={!text}
            onClick={() => setStep("check")}
          >
            Passar pelo checklist <ArrowRight />
          </Button>
          <Button
            variant="ghost"
            className="mt-1 h-11 w-full font-bold text-primary"
            disabled={!text}
            onClick={() => saveDraft(true)}
          >
            {features.diary ? "Só quero guardar no Diário" : "Só quero escrever, sem enviar"}
          </Button>
          <div className="mt-5">
            <Highlight emoji="brilho" tint="rose">
              Se você precisa de resposta para se sentir bem, ainda não é hora de enviar.
            </Highlight>
          </div>
        </>
      )}

      {step === "check" && (
        <>
          <h2 className="font-display text-2xl font-black">Checklist da mensagem</h2>
          <div className="mt-3 rounded-xl bg-muted px-4 py-3 text-[13px] italic leading-snug">
            "{text}"
          </div>
          <div className="mt-4 space-y-3">
            {pauseQuestions.map((question) => (
              <div
                key={question.id}
                className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3"
              >
                <span className="flex-1 text-sm font-bold leading-snug">
                  {question.label}
                  <small className="mt-0.5 block text-xs font-semibold text-muted-foreground">
                    {locked(question)
                      ? "Registrado no seu diagnóstico ou no seu cenário. Se a situação mudou, atualize por lá."
                      : question.hint}
                  </small>
                </span>
                <span className="flex shrink-0 gap-1.5" role="group" aria-label={question.label}>
                  {(["yes", "no"] as const).map((value) => {
                    const on = answers[question.id] === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        aria-pressed={on}
                        disabled={locked(question)}
                        onClick={() =>
                          setAnswers((current) => ({ ...current, [question.id]: value }))
                        }
                        className={cn(
                          "h-9 cursor-pointer rounded-xl px-3 text-[13px] font-extrabold transition-colors disabled:cursor-not-allowed",
                          !on && "bg-muted text-muted-foreground",
                          on && value === "yes" && "bg-success text-primary-foreground",
                          on && value === "no" && "bg-primary text-primary-foreground",
                        )}
                      >
                        {value === "yes" ? "Sim" : "Não"}
                      </button>
                    );
                  })}
                </span>
              </div>
            ))}
          </div>
          <Button
            className="mt-5 h-12 w-full rounded-xl text-sm font-bold"
            disabled={!allAnswered}
            onClick={() => setStep("result")}
          >
            Ver resultado
          </Button>
          <Button
            variant="ghost"
            className="mt-1 h-11 w-full font-bold text-primary"
            onClick={() => setStep("write")}
          >
            Voltar e editar o texto
          </Button>
        </>
      )}

      {step === "result" && result === "wait" && (
        <>
          <section className="relative overflow-hidden rounded-card bg-goal-card p-6 text-center text-primary-foreground shadow-glow">
            <Emoji name="pausa" className="mx-auto size-20" />
            <h2 className="mt-3 font-display text-2xl font-black">Guarde por 24 horas</h2>
            <p className="mt-2 text-[13px] leading-snug text-primary-foreground/85">
              {features.diary
                ? "Algumas respostas pedem mais tempo. Amanhã, se ainda fizer sentido, você relê com calma."
                : "Algumas respostas pedem mais tempo. Se amanhã ainda fizer sentido, passe pela Pausa de novo."}
            </p>
            <p className="mt-4 font-display text-5xl font-black">24h</p>
            <p className="mt-1 text-xs font-bold text-primary-foreground/75">
              {features.diary ? "pode reler amanhã às" : "volte amanhã, depois das"}{" "}
              {formatTime(readyAt)}
            </p>
            <Button
              className="mt-5 h-12 w-full rounded-xl bg-card text-sm font-bold text-primary hover:bg-card/90"
              onClick={() => saveDraft(true)}
            >
              <Archive /> {features.diary ? "Guardar no Diário" : "Esperar 24 horas"}
            </Button>
          </section>
          <SectionTitle>O que pesou</SectionTitle>
          <ul className="space-y-2.5">
            {pauseQuestions
              .filter((question) => answers[question.id] === "no")
              .map((question) => (
                <li
                  key={question.id}
                  className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm font-semibold"
                >
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-primary-soft text-primary">
                    <X className="size-4" />
                  </span>
                  {question.hint}
                </li>
              ))}
          </ul>
          <div className="mt-4">
            <Highlight emoji="compromisso" tint="sage">
              Converse com uma amiga, não com ele.
            </Highlight>
          </div>
        </>
      )}

      {step === "result" && result === "ok" && (
        <>
          <section className="rounded-card bg-tint-sage p-6 text-center">
            <Emoji name="ok" className="mx-auto size-20" />
            <h2 className="mt-3 font-display text-2xl font-black">Pode enviar, com calma</h2>
            <p className="mt-2 text-[13px] leading-snug text-muted-foreground">
              Curta, leve e aberta. O app não envia nada: copie e mande você mesma, uma vez só.
            </p>
          </section>
          <div className="ml-auto mt-5 max-w-[88%] whitespace-pre-line rounded-2xl rounded-br-md bg-primary px-4 py-3 text-sm font-semibold leading-6 text-primary-foreground shadow-soft">
            {text}
          </div>
          <Button
            className="mt-5 h-12 w-full rounded-xl text-sm font-bold"
            onClick={() => void copy()}
          >
            <Copy /> Copiar mensagem
          </Button>
          <Button
            variant="ghost"
            className="mt-1 h-11 w-full font-bold text-primary"
            onClick={() => saveDraft(true)}
          >
            {features.diary ? "Prefiro guardar por 24 horas" : "Prefiro esperar 24 horas"}
          </Button>
          <div className="mt-4">
            <Highlight emoji="celular">
              Envie uma. Depois, solte o celular. Se ele não responder, está tudo bem.
            </Highlight>
          </div>
        </>
      )}

      {step === "result" && result === "blocked" && (
        <>
          <section className="rounded-card bg-tint-rose p-6 text-center">
            <ScenarioArt id={limitScenario} className="mx-auto size-24" />
            <h2 className="mt-3 font-display text-2xl font-black">Não envie</h2>
            <p className="mt-2 text-[13px] leading-snug text-muted-foreground">
              {otherRelation
                ? "Ele está em outra relação. Não interferir é um limite, e respeitar esse limite também é parte do plano."
                : "Ele te bloqueou ou pediu distância. Isso é um limite, e respeitar esse limite também é parte do plano."}
            </p>
          </section>
          <div className="mt-4 flex gap-3 rounded-xl border border-destructive/30 bg-destructive-soft px-4 py-3 text-sm leading-6">
            <TriangleAlert className="mt-0.5 size-5 shrink-0 text-destructive" />
            Não use outro número, outro perfil ou amigos para mandar a mensagem.
          </div>
          <Button
            className="mt-5 h-12 w-full rounded-xl text-sm font-bold"
            onClick={() => saveDraft(false)}
          >
            <NotebookPen /> {features.diary ? "Guardar no Diário, só para mim" : "Não enviar"}
          </Button>
          <Button
            variant="ghost"
            className="mt-1 h-11 w-full font-bold text-primary"
            onClick={() => openScenario(limitScenario)}
          >
            {otherRelation
              ? 'Ver o cenário "Ele está com outra pessoa"'
              : 'Ver o cenário "Ele me bloqueou"'}
          </Button>
        </>
      )}
    </Overlay>
  );
}
