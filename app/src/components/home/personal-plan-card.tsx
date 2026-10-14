import { ArrowRight, ChevronRight, Map as MapIcon, RotateCcw } from "lucide-react";

import { EmojiBadge } from "@/components/common";
import { Button } from "@/components/ui/button";
import { diagnosisQuestions } from "@/lib/jornada/diagnosis";
import { first48Progress } from "@/lib/jornada/first48";
import { useJornada } from "@/lib/jornada/store";
import type { StepTarget } from "@/lib/jornada/types";
import type { ScenarioId } from "@/lib/scenarios";
import { useStore } from "@/lib/store";

/**
 * "Meu Plano Pessoal" no topo do Início: mostra o status do diagnóstico (pendente, em andamento
 * ou feito) e, depois de feito, a situação e o ponto de atenção. O andamento e a ação das 48 horas
 * ficam no card "Próxima atividade", logo abaixo, para não repetir.
 * Com as 48 horas concluídas, o card mostra o primeiro passo do Mapa.
 */
export function PersonalPlanCard({
  openDiagnosis,
  openMap,
  openStep,
}: {
  openDiagnosis: () => void;
  openMap: () => void;
  openStep: (target: StepTarget, scenario: ScenarioId) => void;
}) {
  const { data } = useStore();
  const { current, result, data: jornada } = useJornada();
  const draft = jornada.diagnosisDraft;

  if (!current || !result) {
    const answered = draft ? Object.keys(draft.answers).length : 0;
    return (
      <section className="mx-5 rounded-card bg-card p-5 shadow-soft">
        <div className="flex items-center justify-between gap-3">
          <p className="eyebrow">Meu Plano Pessoal</p>
          <span className="shrink-0 whitespace-nowrap rounded-full bg-tint-honey px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide">
            {draft ? "Em andamento" : "Pendente"}
          </span>
        </div>
        <div className="mt-3 flex items-center gap-4">
          <EmojiBadge name="escrever" tint="rose" size="lg" />
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-lg font-extrabold leading-snug">
              {draft ? "Termine o seu diagnóstico" : "Descubra o seu próximo passo"}
            </h2>
            <p className="mt-0.5 text-[13px] leading-snug text-muted-foreground">
              {draft
                ? `${answered} de ${diagnosisQuestions.length} perguntas respondidas.`
                : `${diagnosisQuestions.length} perguntas rápidas para montar o seu Mapa de Reconquista.`}
            </p>
          </div>
        </div>
        <Button className="mt-4 h-12 w-full rounded-xl text-sm font-bold" onClick={openDiagnosis}>
          {draft ? "Continuar diagnóstico" : "Fazer meu diagnóstico"} <ArrowRight />
        </Button>
      </section>
    );
  }

  const scenario = data.profile?.scenario ?? result.scenario;
  const first48 = first48Progress(jornada.first48);

  return (
    <section className="mx-5 rounded-card bg-card p-5 shadow-soft">
      <div className="flex items-center justify-between gap-3">
        <p className="eyebrow">Meu Plano Pessoal</p>
        <span className="shrink-0 whitespace-nowrap rounded-full bg-tint-sage px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide">
          Feito em{" "}
          {new Date(current.at).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
        </span>
      </div>
      <button
        type="button"
        onClick={openMap}
        className="mt-3 flex w-full cursor-pointer items-center gap-4 text-left"
      >
        <EmojiBadge
          name={result.contactMode === "sem_contato" ? "escudo" : "ok"}
          tint="rose"
          size="lg"
        />
        <span className="min-w-0 flex-1">
          <span className="block font-display text-lg font-extrabold leading-snug">
            {result.headline}
          </span>
          <span className="mt-0.5 block text-[13px] leading-snug text-muted-foreground">
            Atenção: {result.attention.title}
          </span>
        </span>
        <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
      </button>
      {first48.complete ? (
        <button
          type="button"
          onClick={() => openStep(result.firstStep.target, scenario)}
          className="mt-4 flex w-full cursor-pointer items-center gap-3 rounded-xl bg-primary-soft px-4 py-3 text-left transition-transform active:scale-[0.99]"
        >
          <span className="min-w-0 flex-1">
            <span className="block text-[11px] font-extrabold uppercase tracking-widest text-primary">
              Primeiro passo do Mapa
            </span>
            <span className="mt-0.5 block text-sm font-bold leading-snug">
              {result.firstStep.title}
            </span>
          </span>
          <span className="inline-flex shrink-0 items-center gap-1 text-[12px] font-extrabold text-primary">
            {result.firstStep.action} <ArrowRight className="size-3.5" strokeWidth={3} />
          </span>
        </button>
      ) : null}
      <Button
        variant="outline"
        className="mt-4 h-11 w-full rounded-xl bg-card text-sm font-bold"
        onClick={openMap}
      >
        <MapIcon /> Ver meu Mapa de Reconquista
      </Button>
      <button
        type="button"
        onClick={openDiagnosis}
        className="mt-3 flex w-full cursor-pointer items-center justify-center gap-1.5 text-[12px] font-bold text-muted-foreground hover:text-foreground"
      >
        <RotateCcw className="size-3.5" /> Refazer o diagnóstico
      </button>
    </section>
  );
}
