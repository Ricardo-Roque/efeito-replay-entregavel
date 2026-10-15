import { useRef, type ReactNode } from "react";
import { ArrowRight, Check, ChevronRight, RotateCcw, X } from "lucide-react";

import { CareLines, EmojiBadge, GoalProgress, Overlay, ScenarioBadge } from "@/components/common";
import { useCommContext } from "@/components/comunicacao/hooks";
import { Button } from "@/components/ui/button";
import { stanceNotice } from "@/lib/comunicacao/rules";
import { diagnosisQuestions, optionLabel } from "@/lib/jornada/diagnosis";
import { features } from "@/lib/features";
import { first48Progress } from "@/lib/jornada/first48";
import { useJornada } from "@/lib/jornada/store";
import type { StepTarget } from "@/lib/jornada/types";
import { scenarioById, type ScenarioId } from "@/lib/scenarios";
import { useStore } from "@/lib/store";

function Section({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <section className="mt-7">
      <h2 className="mb-3 flex items-center gap-2.5 font-display text-lg font-extrabold">
        <span className="grid size-7 shrink-0 place-items-center rounded-full bg-primary-soft text-sm font-black text-primary">
          {n}
        </span>
        {title}
      </h2>
      {children}
    </section>
  );
}

/**
 * Meu Mapa de Reconquista: o resultado do diagnóstico atual. Todo o texto sai de
 * buildDiagnosisResult (lib/jornada/map.ts) a partir das respostas dela.
 */
export function MapScreen({
  onClose,
  redo,
  go,
  openScenario,
  openFirst48,
  openCentral,
}: {
  onClose: () => void;
  redo: () => void;
  openFirst48: () => void;
  openCentral: () => void;
  /** Abre o destino de um passo (exceto "care", resolvido aqui mesmo). */
  go: (target: StepTarget, scenario: ScenarioId) => void;
  openScenario: (id: ScenarioId) => void;
}) {
  const { data, setScenario, showToast } = useStore();
  const { current, result, data: jornada } = useJornada();
  const care = useRef<HTMLDivElement | null>(null);
  const comm = useCommContext();
  if (!current || !result) return null;
  const commNotice = stanceNotice(comm.stance);

  const scenario = scenarioById(result.scenario);
  const profileScenario = data.profile?.scenario ?? null;
  const usingSuggested = profileScenario === result.scenario;
  const noContact = result.contactMode === "sem_contato";
  const first48 = first48Progress(jornada.first48);
  const previous = jornada.diagnoses.length - 1;

  const open = (target: StepTarget) => {
    if (target === "care") care.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    else go(target, profileScenario ?? result.scenario);
  };

  return (
    <Overlay eyebrow="Seu resultado" title="Meu Mapa de Reconquista" onClose={onClose}>
      <div className="rounded-card bg-goal-card p-5 text-primary-foreground shadow-glow">
        <p className="eyebrow eyebrow-light">Seu momento</p>
        <h2 className="mt-1 font-display text-2xl font-black leading-tight">{result.headline}</h2>
        <p className="mt-2 text-[13px] text-primary-foreground/80">
          Diagnóstico feito em {new Date(current.at).toLocaleDateString("pt-BR")}
        </p>
      </div>

      {noContact && (
        <div
          role="note"
          className="mt-4 rounded-xl border border-primary/25 bg-primary-soft px-4 py-3 text-sm leading-6"
        >
          <b>Seu plano respeita o limite de contato.</b> Nada neste mapa envolve escrever para ele.
          Tudo o que você escrever no app fica só com você.
        </div>
      )}
      {result.contactMode === "pausa" && (
        <div
          role="note"
          className="mt-4 rounded-xl border border-primary/25 bg-primary-soft px-4 py-3 text-sm leading-6"
        >
          <b>Enquanto durar o tempo que ele pediu, o plano não sugere mensagens.</b> Se der vontade
          de escrever, use a Pausa: o rascunho fica guardado e não vai para ninguém.
        </div>
      )}

      {result.showCareLines && (
        <div ref={care} className="mt-4">
          <CareLines highlight />
        </div>
      )}

      <Section n={1} title="Resumo da situação">
        <ul className="space-y-2 rounded-card bg-card p-4 text-sm leading-6 shadow-soft">
          {result.summary.map((line) => (
            <li key={line} className="flex gap-2.5">
              <span aria-hidden className="mt-2.5 size-1.5 shrink-0 rounded-full bg-primary" />
              {line}
            </li>
          ))}
        </ul>
      </Section>

      <Section n={2} title="Principal ponto de atenção">
        <div className="flex gap-3 rounded-card bg-tint-honey p-4">
          <EmojiBadge name={noContact ? "escudo" : "sinais"} tint="honey" size="md" />
          <div className="min-w-0">
            <p className="font-display text-[17px] font-extrabold leading-snug">
              {result.attention.title}
            </p>
            <p className="mt-1.5 text-sm leading-6">{result.attention.text}</p>
          </div>
        </div>
      </Section>

      <Section n={3} title="O que fazer agora">
        <ul className="space-y-2">
          {result.doNow.map((item) => (
            <li
              key={item}
              className="flex gap-3 rounded-xl bg-card px-4 py-3 text-sm leading-6 shadow-soft"
            >
              <Check aria-hidden className="mt-1 size-4 shrink-0 text-success" strokeWidth={3} />
              {item}
            </li>
          ))}
        </ul>
      </Section>

      <Section n={4} title="O que evitar">
        <ul className="space-y-2">
          {result.avoid.map((item) => (
            <li
              key={item}
              className="flex gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm leading-6"
            >
              <X aria-hidden className="mt-1 size-4 shrink-0 text-primary" strokeWidth={3} />
              {item}
            </li>
          ))}
        </ul>
      </Section>

      <Section n={5} title="Primeiro passo recomendado">
        <div className="rounded-card border-2 border-primary/25 bg-primary-soft p-4">
          <p className="font-display text-[17px] font-extrabold leading-snug">
            {result.firstStep.title}
          </p>
          <p className="mt-1.5 text-sm leading-6">{result.firstStep.text}</p>
          <Button
            className="mt-4 h-11 w-full rounded-xl font-bold"
            onClick={() => open(result.firstStep.target)}
          >
            {result.firstStep.action} <ArrowRight />
          </Button>
        </div>
      </Section>

      {/* Meu Plano de 48 Horas: oculto em lib/features.ts */}
      {features.first48 && (
        <Section n={6} title="Meu Plano de 48 Horas">
          <div className="rounded-card bg-card p-4 shadow-soft">
            <p className="text-sm leading-6 text-muted-foreground">
              Cinco atividades curtas para os próximos dois dias, montadas a partir deste mapa. Tudo
              fica disponível agora: as etapas só sugerem um ritmo.
            </p>
            {first48.done > 0 && (
              <div className="mt-3 flex items-center gap-3 rounded-xl bg-primary-soft px-3 py-2.5">
                <GoalProgress
                  tone="primary"
                  value={first48.done}
                  max={first48.total}
                  label="Atividades concluídas do plano de 48 horas"
                />
                <span className="shrink-0 text-xs font-bold">
                  {first48.done} de {first48.total}
                </span>
              </div>
            )}
            <Button className="mt-3 h-11 w-full rounded-xl font-bold" onClick={openFirst48}>
              {first48.complete
                ? "Rever meu plano de 48 horas"
                : first48.done > 0
                  ? "Continuar meu plano de 48 horas"
                  : "Começar meu plano de 48 horas"}{" "}
              <ArrowRight />
            </Button>
          </div>
        </Section>
      )}

      <Section n={features.first48 ? 7 : 6} title="Seu cenário">
        <div className="rounded-card bg-card p-4 shadow-soft">
          <button
            type="button"
            onClick={() => openScenario(result.scenario)}
            className="flex w-full cursor-pointer items-center gap-4 text-left"
          >
            <ScenarioBadge id={scenario.id} tint={scenario.tint} size="lg" />
            <span className="min-w-0 flex-1">
              <span className="block font-display text-[16px] font-extrabold leading-snug">
                {scenario.label}
              </span>
              <span className="mt-0.5 block text-[13px] text-muted-foreground">
                {scenario.short}
              </span>
            </span>
            <ChevronRight className="size-5 text-muted-foreground" />
          </button>
          {result.scenarioNote && (
            <p className="mt-3 text-[13px] leading-snug text-muted-foreground">
              {result.scenarioNote}
            </p>
          )}
          {usingSuggested ? (
            <p className="mt-3 text-[13px] font-bold text-success">É o cenário do seu plano.</p>
          ) : (
            <>
              {profileScenario && (
                <p className="mt-3 text-[13px] leading-snug text-muted-foreground">
                  Hoje o seu plano usa "{scenarioById(profileScenario).label}". Trocar é escolha
                  sua.
                </p>
              )}
              <Button
                variant="outline"
                className="mt-3 h-11 w-full rounded-xl bg-card font-bold"
                onClick={() =>
                  setScenario(result.scenario) && showToast("Cenário do plano atualizado.")
                }
              >
                Usar este cenário no meu plano
              </Button>
            </>
          )}
        </div>
      </Section>

      <Section n={features.first48 ? 8 : 7} title="Central de Comunicação">
        <div className="rounded-card bg-card p-4 shadow-soft">
          <p className="font-display text-[15px] font-extrabold leading-snug">{commNotice.title}</p>
          <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{commNotice.text}</p>
          <Button
            variant="outline"
            className="mt-3 h-11 w-full rounded-xl bg-card font-bold"
            onClick={openCentral}
          >
            Abrir a Central <ArrowRight />
          </Button>
        </div>
      </Section>

      <p className="mt-6 text-xs leading-5 text-muted-foreground">
        Orientações a partir do que você contou. Não são certezas sobre o que ele pensa ou sente, e
        não garantem um resultado.
      </p>

      {!result.showCareLines && (
        <div ref={care} className="mt-6">
          <CareLines highlight={false} />
        </div>
      )}

      <h2 className="mb-3 mt-8 font-display text-lg font-extrabold">Suas respostas</h2>
      <dl className="rounded-card bg-card p-4 text-sm shadow-soft">
        {diagnosisQuestions.map((question) => {
          const value = current.answers[question.id];
          const labels = (Array.isArray(value) ? value : [value]).map((item) =>
            optionLabel(question.id, item),
          );
          return (
            <div key={question.id} className="border-b border-border py-2 last:border-b-0">
              <dt className="text-xs font-bold text-muted-foreground">{question.title}</dt>
              <dd className="font-semibold">{labels.join(", ")}</dd>
            </div>
          );
        })}
      </dl>
      <Button
        variant="outline"
        className="mt-4 h-11 w-full rounded-xl bg-card font-bold"
        onClick={redo}
      >
        <RotateCcw /> Refazer o diagnóstico
      </Button>
      <p className="mt-2 text-center text-xs leading-5 text-muted-foreground">
        Você pode refazer sempre que a situação mudar.
        {previous > 0 &&
          ` ${previous === 1 ? "1 diagnóstico anterior guardado" : `${previous} diagnósticos anteriores guardados`}.`}
      </p>
    </Overlay>
  );
}
