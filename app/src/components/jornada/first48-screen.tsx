import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  ArrowRight,
  Check,
  ChevronRight,
  Circle,
  Clock,
  Eye,
  Map as MapIcon,
  NotebookPen,
  RefreshCw,
  X,
} from "lucide-react";

import {
  CareLines,
  CheckRow,
  Emoji,
  EmojiBadge,
  GoalProgress,
  Overlay,
  PhaseBar,
} from "@/components/common";
import { Button } from "@/components/ui/button";
import { moods } from "@/lib/guide";
import type { EmojiName } from "@/lib/illustrations";
import {
  ACTIVITY_ORDER,
  buildFirst48Plan,
  canComplete,
  choiceLabel,
  first48Progress,
  first48Stages,
  mainPattern,
  reviewOf,
  type First48Review,
} from "@/lib/jornada/first48";
import { templateById } from "@/lib/jornada/messages";
import { useJornada } from "@/lib/jornada/store";
import type {
  First48Activity,
  First48ActivityId,
  First48Block,
  First48Plan,
  First48Tool,
} from "@/lib/jornada/types";
import { calendarDaysBetween, dayState, planProgress } from "@/lib/progress";
import type { ScenarioId } from "@/lib/scenarios";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

type View = "overview" | "done" | First48ActivityId;

const activityEmoji: Record<First48ActivityId, EmojiName> = {
  entender: "sinais",
  interromper: "pausa",
  preparar: "diario",
  escolher: "compromisso",
  organizar: "estrela",
};

const toneIcon: Record<First48Block["tone"], ReactNode> = {
  do: <Check aria-hidden className="mt-1 size-4 shrink-0 text-success" strokeWidth={3} />,
  avoid: <X aria-hidden className="mt-1 size-4 shrink-0 text-primary" strokeWidth={3} />,
  watch: <Eye aria-hidden className="mt-1 size-4 shrink-0 text-primary" />,
  info: <span aria-hidden className="mt-2.5 size-1.5 shrink-0 rounded-full bg-primary" />,
};

const shortDate = (iso: string) =>
  new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });

function Block({ block }: { block: First48Block }) {
  return (
    <section
      className={cn("rounded-card p-4", block.highlight ? "bg-tint-honey" : "bg-card shadow-soft")}
    >
      <h3 className="font-display text-[15px] font-extrabold leading-snug">{block.title}</h3>
      <ul className="mt-2 space-y-1.5 text-sm leading-6">
        {block.items.map((item) => (
          <li key={item} className="flex gap-2.5">
            {toneIcon[block.tone]}
            <span className="min-w-0">{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ToolButtons({
  tools,
  go,
}: {
  tools: First48Activity["tools"];
  go: (tool: First48Tool) => void;
}) {
  if (tools.length === 0) return null;
  return (
    <div className="mt-5">
      <p className="eyebrow mb-2">Ferramentas relacionadas</p>
      <div className="grid grid-cols-2 gap-2">
        {tools.map((link) => (
          <Button
            key={link.tool + link.label}
            variant="outline"
            className="h-auto min-h-11 justify-between whitespace-normal rounded-xl bg-card px-3 py-2 text-left text-[13px] font-bold leading-snug"
            onClick={() => go(link.tool)}
          >
            {link.label}
            <ChevronRight className="shrink-0" />
          </Button>
        ))}
      </div>
    </div>
  );
}

function StatusPill({ done, outdated }: { done: boolean; outdated: boolean }) {
  if (outdated)
    return (
      <span className="shrink-0 whitespace-nowrap rounded-full bg-tint-honey px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide">
        Atualizada
      </span>
    );
  if (done)
    return (
      <span className="shrink-0 whitespace-nowrap rounded-full bg-success-soft px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-success">
        Concluída
      </span>
    );
  return null;
}

/** "Meu Plano de 48 Horas": visão geral, as 5 atividades e a tela de conclusão. */
export function First48Screen({
  initial,
  onClose,
  openStep,
  openMap,
  openPause,
  openDay,
  openPlan,
  openCentral,
}: {
  initial?: First48ActivityId | undefined;
  onClose: () => void;
  openStep: (target: Exclude<First48Tool, "map">, scenario: ScenarioId) => void;
  openMap: () => void;
  openPause: (draft?: string) => void;
  openDay: (day: number) => void;
  openPlan: () => void;
  openCentral: () => void;
}) {
  const { data, entitlements } = useStore();
  const jornada = useJornada();
  const { current, result, startFirst48 } = jornada;
  const [view, setView] = useState<View>(initial ?? "overview");
  const scroller = useRef<HTMLDivElement | null>(null);
  const profileScenario = data.profile?.scenario ?? null;

  const plan = useMemo(
    () => (current ? buildFirst48Plan(current, profileScenario) : null),
    [current, profileScenario],
  );

  // O relógio das 48 horas começa na primeira vez que ela abre o plano (nunca trava nada).
  useEffect(() => {
    if (current && !jornada.data.first48.startedAt) startFirst48();
  }, [current, jornada.data.first48.startedAt, startFirst48]);

  // Cada troca de tela começa do topo.
  useEffect(() => {
    scroller.current?.closest(".overflow-y-auto")?.scrollTo({ top: 0 });
  }, [view]);

  if (!current || !result || !plan) return null;

  const state = jornada.data.first48;
  const progress = first48Progress(state);
  const review = reviewOf(state, jornada.data.diagnoses, plan);
  const scenario = profileScenario ?? result.scenario;
  const go = (tool: First48Tool) => (tool === "map" ? openMap() : openStep(tool, scenario));

  const back = () => (view === "overview" ? onClose() : setView("overview"));
  const activity = plan.activities.find((item) => item.id === view);

  return (
    <Overlay
      eyebrow={
        activity
          ? `${first48Stages.find((s) => s.id === activity.stage)!.title} · Atividade ${activity.n} de 5`
          : "Seu plano"
      }
      title={activity ? activity.title : "Meu Plano de 48 Horas"}
      onClose={back}
    >
      <div ref={scroller}>
        {view === "overview" && (
          <Overview plan={plan} review={review} progress={progress} setView={setView} go={go} />
        )}
        {activity && (
          <ActivityView
            activity={activity}
            plan={plan}
            review={review}
            go={go}
            openPause={openPause}
            openCentral={openCentral}
            openDay={openDay}
            openPlan={openPlan}
            allDays={entitlements.allDays}
            onFinished={(id) => {
              const nextAfter = ACTIVITY_ORDER.find(
                (item) => item !== id && !jornada.data.first48.done[item],
              );
              setView(nextAfter ?? "done");
            }}
          />
        )}
        {view === "done" && (
          <DoneView
            plan={plan}
            review={review}
            setView={setView}
            go={go}
            openDay={openDay}
            openPlan={openPlan}
            allDays={entitlements.allDays}
          />
        )}
      </div>
    </Overlay>
  );
}

// ---------- Visão geral ----------

function Overview({
  plan,
  review,
  progress,
  setView,
  go,
}: {
  plan: First48Plan;
  review: First48Review;
  progress: ReturnType<typeof first48Progress>;
  setView: (view: View) => void;
  go: (tool: First48Tool) => void;
}) {
  const { data, result } = useJornada();
  const state = data.first48;
  if (!result) return null;
  const next = progress.next ? plan.activities.find((item) => item.id === progress.next) : null;

  const timeText =
    progress.phase === "time_over"
      ? "As 48 horas passaram. Todas as atividades continuam disponíveis."
      : progress.suggestedStage === "a"
        ? `Agora: primeiras 24 horas · ${Math.ceil(progress.hoursLeft)}h restantes`
        : `Agora: de 24 a 48 horas · ${Math.ceil(progress.hoursLeft)}h restantes`;

  return (
    <>
      <div className="rounded-card bg-goal-card p-5 text-primary-foreground shadow-glow">
        <p className="eyebrow eyebrow-light">Seu momento</p>
        <h2 className="mt-1 font-display text-2xl font-black leading-tight">{result.headline}</h2>
        <p className="mt-1.5 text-[13px] leading-snug text-primary-foreground/85">
          Atenção: {result.attention.title}
        </p>
        <div className="mt-4 flex items-center gap-3">
          <GoalProgress
            value={progress.done}
            max={progress.total}
            label="Atividades concluídas do plano de 48 horas"
          />
          <span className="shrink-0 text-xs font-bold">
            {progress.done} de {progress.total}
          </span>
        </div>
        <p className="mt-2.5 flex items-center gap-1.5 text-[12px] font-semibold text-primary-foreground/80">
          <Clock className="size-3.5" /> {timeText}
        </p>
      </div>

      <div className="mt-4 rounded-card bg-card p-4 shadow-soft">
        <p className="eyebrow">Objetivo</p>
        <p className="mt-1 text-sm leading-6">
          Receber orientações para o seu momento e atravessar os primeiros dias com mais clareza,
          sem agir por impulso. As 48 horas são a duração desta etapa, não uma promessa de
          reconciliação.
        </p>
        <button
          type="button"
          onClick={() => go("map")}
          className="mt-2 inline-flex cursor-pointer items-center gap-1 text-[13px] font-extrabold text-primary"
        >
          <MapIcon className="size-3.5" /> Ver o meu Mapa completo
        </button>
      </div>

      {plan.path !== "conversa" && (
        <div
          role="note"
          className="mt-4 rounded-xl border border-primary/25 bg-primary-soft px-4 py-3 text-sm leading-6"
        >
          <b>Nenhuma atividade envolve escrever para ele.</b>{" "}
          {plan.path === "limite"
            ? "O plano respeita o limite de contato."
            : plan.path === "pausa"
              ? "O plano respeita o tempo que ele pediu."
              : "O plano dá espaço, sem novas mensagens."}
        </div>
      )}

      {(review.outdated.length > 0 || review.choiceInvalid) && (
        <div
          role="status"
          className="mt-4 flex gap-3 rounded-xl border border-border bg-tint-honey px-4 py-3 text-sm leading-6"
        >
          <RefreshCw aria-hidden className="mt-1 size-4 shrink-0" />
          <p>
            <b>Seu diagnóstico mudou.</b> As atividades concluídas continuam concluídas e o conteúdo
            já foi ajustado ao seu novo momento.
            {review.outdated.length > 0 &&
              ` Vale reler: ${review.outdated
                .map((id) => plan.activities.find((item) => item.id === id)!.n)
                .join(", ")
                .replace(/, (\d)$/, " e $1")}.`}
            {review.choiceInvalid && " Escolha de novo o seu próximo passo na atividade 4."}
          </p>
        </div>
      )}

      {next ? (
        <div className="mt-4 rounded-card border-2 border-primary/25 bg-primary-soft p-4">
          <p className="text-[11px] font-extrabold uppercase tracking-widest text-primary">
            Próximo passo
          </p>
          <p className="mt-0.5 font-display text-[17px] font-extrabold leading-snug">
            {next.n}. {next.title}
          </p>
          <p className="mt-1 text-[13px] leading-snug text-muted-foreground">{next.goal}</p>
          <Button
            className="mt-3 h-11 w-full rounded-xl font-bold"
            onClick={() => setView(next.id)}
          >
            {progress.done === 0 ? "Começar" : "Continuar"} <ArrowRight />
          </Button>
        </div>
      ) : (
        <div className="mt-4 rounded-card bg-tint-sage p-4">
          <p className="font-display text-[17px] font-extrabold">Plano concluído</p>
          <p className="mt-1 text-[13px] leading-snug">
            {state.completedAt && `Concluído em ${shortDate(state.completedAt)}. `}Você pode rever
            qualquer atividade quando quiser.
          </p>
          <Button className="mt-3 h-11 w-full rounded-xl font-bold" onClick={() => setView("done")}>
            Ver o resumo <ArrowRight />
          </Button>
        </div>
      )}

      {first48Stages.map((stage) => (
        <section key={stage.id} className="mt-7">
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="font-display text-lg font-extrabold">
              Etapa {stage.id.toUpperCase()} · {stage.title}
            </h2>
            {progress.phase === "running" && progress.suggestedStage === stage.id && (
              <span className="shrink-0 rounded-full bg-tint-rose px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-primary">
                Agora
              </span>
            )}
          </div>
          <p className="mt-0.5 text-[13px] leading-snug text-muted-foreground">
            {stage.objective}
            {stage.id === "b" &&
              progress.phase === "running" &&
              progress.suggestedStage === "a" &&
              " Sugerida a partir de 24 horas, mas já está disponível."}
          </p>
          <ul className="mt-3 space-y-2">
            {plan.activities
              .filter((item) => item.stage === stage.id)
              .map((item) => {
                const done = Boolean(state.done[item.id]);
                const isNext = progress.next === item.id;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => setView(item.id)}
                      className={cn(
                        "flex w-full cursor-pointer items-center gap-3 rounded-card bg-card p-3.5 text-left shadow-soft transition-colors hover:bg-muted",
                        isNext && "ring-2 ring-primary/40",
                      )}
                    >
                      <span className="relative">
                        <EmojiBadge name={activityEmoji[item.id]} tint="rose" size="md" />
                        <span
                          className={cn(
                            "absolute -bottom-1 -right-1 grid size-5 place-items-center rounded-full border-2 border-card",
                            done
                              ? "bg-success text-primary-foreground"
                              : "bg-muted text-muted-foreground",
                          )}
                        >
                          {done ? (
                            <Check className="size-3" strokeWidth={3.5} />
                          ) : (
                            <span className="text-[10px] font-black">{item.n}</span>
                          )}
                        </span>
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[15px] font-extrabold leading-snug">
                          {item.title}
                        </span>
                        <span className="mt-0.5 flex items-center gap-2 text-[12px] text-muted-foreground">
                          {item.minutes} min
                          <StatusPill done={done} outdated={review.outdated.includes(item.id)} />
                        </span>
                      </span>
                      <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
                    </button>
                  </li>
                );
              })}
          </ul>
        </section>
      ))}

      <p className="mt-6 text-xs leading-5 text-muted-foreground">
        Nenhuma atividade depende de ele responder. Orientações a partir do que você contou: não são
        certezas sobre o que ele pensa ou sente, e não garantem um resultado.
      </p>
      <div className="mt-6">
        <CareLines highlight={result.showCareLines} />
      </div>
    </>
  );
}

// ---------- Atividade ----------

function ActivityView({
  activity,
  plan,
  review,
  go,
  openPause,
  openCentral,
  openDay,
  openPlan,
  allDays,
  onFinished,
}: {
  activity: First48Activity;
  plan: First48Plan;
  review: First48Review;
  go: (tool: First48Tool) => void;
  openPause: (draft?: string) => void;
  openCentral: () => void;
  openDay: (day: number) => void;
  openPlan: () => void;
  allDays: boolean;
  onFinished: (id: First48ActivityId) => void;
}) {
  const { data, result, toggleFirst48Check, toggleFirst48Activity } = useJornada();
  const { addEntry } = useStore();
  const state = data.first48;
  const done = state.done[activity.id];
  const checked = activity.checklist.filter((item) => state.checks[item.id]).length;
  const allowed = canComplete(activity.id, review);

  // Concluir uma atividade (e o plano inteiro) fica registrado no Diário.
  const complete = () => {
    if (!toggleFirst48Activity(activity.id)) return;
    addEntry({
      type: "note",
      source: "first48",
      text: `Meu Plano de 48 Horas: concluí a atividade ${activity.n}, "${activity.title}".`,
    });
    const progress = first48Progress(data.first48);
    if (progress.done + 1 >= progress.total)
      addEntry({
        type: "note",
        source: "progresso",
        text: "Concluí o Meu Plano de 48 Horas. Agora sigo no plano de 21 dias, no meu ritmo.",
      });
    onFinished(activity.id);
  };

  return (
    <>
      <div className="flex items-center gap-3 rounded-card bg-card p-4 shadow-soft">
        <EmojiBadge name={activityEmoji[activity.id]} tint="rose" size="lg" />
        <div className="min-w-0">
          <p className="text-sm font-semibold leading-snug">{activity.goal}</p>
          <p className="mt-1 text-[12px] font-bold text-muted-foreground">
            Cerca de {activity.minutes} min
          </p>
        </div>
      </div>

      {review.outdated.includes(activity.id) && (
        <p
          role="status"
          className="mt-3 rounded-xl bg-tint-honey px-4 py-2.5 text-[13px] leading-snug"
        >
          Atualizada para o seu novo diagnóstico. Continua concluída, e vale reler.
        </p>
      )}

      <div className="mt-4 space-y-3">
        {activity.blocks.map((block) => (
          <Block key={block.id} block={block} />
        ))}
      </div>

      {activity.id === "preparar" && <Exercise plan={plan} />}
      {activity.id === "escolher" && (
        <NextStep
          plan={plan}
          review={review}
          go={go}
          openPause={openPause}
          openCentral={openCentral}
        />
      )}
      {activity.id === "organizar" && (
        <Continuation
          plan={plan}
          review={review}
          openDay={openDay}
          openPlan={openPlan}
          allDays={allDays}
        />
      )}

      {activity.checklist.length > 0 && (
        <section className="mt-6">
          <div className="mb-2 flex items-baseline justify-between">
            <p className="eyebrow">Checklist</p>
            <span className="text-[12px] font-bold text-muted-foreground">
              {checked} de {activity.checklist.length}
            </span>
          </div>
          <div className="space-y-2">
            {activity.checklist.map((item) => (
              <CheckRow
                key={item.id}
                checked={Boolean(state.checks[item.id])}
                onToggle={() => toggleFirst48Check(item.id)}
              >
                {item.text}
              </CheckRow>
            ))}
          </div>
        </section>
      )}

      <ToolButtons tools={activity.tools} go={go} />

      {activity.id === "preparar" && result && (
        <div className="mt-6">
          <CareLines highlight={result.showCareLines} />
        </div>
      )}

      <div className="mt-7">
        {done ? (
          <div className="rounded-card bg-success-soft p-4 text-center">
            <p className="text-sm font-extrabold text-success">Concluída em {shortDate(done.at)}</p>
            <Button
              className="mt-3 h-11 w-full rounded-xl font-bold"
              onClick={() => onFinished(activity.id)}
            >
              {ACTIVITY_ORDER.some((id) => id !== activity.id && !state.done[id])
                ? "Ir para a próxima"
                : "Ver o resumo"}{" "}
              <ArrowRight />
            </Button>
            <button
              type="button"
              onClick={() => toggleFirst48Activity(activity.id)}
              className="mt-2 cursor-pointer text-[12px] font-bold text-muted-foreground hover:text-foreground"
            >
              Desmarcar como concluída
            </button>
          </div>
        ) : (
          <>
            <Button
              className="h-12 w-full rounded-xl text-sm font-bold"
              disabled={!allowed}
              onClick={complete}
            >
              <Check /> Concluir atividade
            </Button>
            <p className="mt-2 text-center text-xs leading-5 text-muted-foreground">
              {allowed
                ? "O checklist ajuda, mas não é obrigatório. Concluir depende só de você."
                : "Escolha um caminho acima para concluir. Nenhum exige mandar mensagem."}
            </p>
          </>
        )}
      </div>
    </>
  );
}

// ---------- Atividade 3: exercício e Diário ----------

function Exercise({ plan }: { plan: First48Plan }) {
  const { data, addEntry, showToast } = useStore();
  const { data: jornada, toggleFirst48Check } = useJornada();
  const [prompt, setPrompt] = useState(plan.exercise.prompts[0] ?? "");
  const [text, setText] = useState("");
  const now = new Date();
  const todayMood = [...data.journal]
    .reverse()
    .find(
      (entry) => entry.type === "mood" && calendarDaysBetween(new Date(entry.at), now) === 0,
    )?.mood;

  const mark = (id: string) => {
    if (!jornada.first48.checks[id]) toggleFirst48Check(id);
  };

  const saveMood = (mood: string) => {
    if (!addEntry({ type: "mood", source: "first48", mood })) return;
    mark("preparar:humor");
    showToast("Humor registrado no seu Diário.");
  };

  const saveReflection = () => {
    const answer = text.trim();
    if (!answer) return;
    if (!addEntry({ type: "note", source: "first48", text: `${prompt}\n${answer}` })) return;
    mark("preparar:reflexao");
    setText("");
    showToast("Guardado no seu Diário, só para você.");
  };

  return (
    <>
      <section className="mt-6 rounded-card bg-card p-4 shadow-soft">
        <p className="eyebrow">Exercício · 1 minuto</p>
        <ol className="mt-2 space-y-2.5">
          {plan.exercise.steps.map((step, index) => (
            <li key={step} className="flex gap-3 text-sm leading-6">
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary-soft text-[12px] font-black text-primary">
                {index + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-4 rounded-card bg-card p-4 shadow-soft">
        <p className="eyebrow">Como você está agora?</p>
        <div className="mt-3 grid grid-cols-5 gap-1.5">
          {moods.map((mood, index) => (
            <button
              key={mood}
              type="button"
              aria-pressed={todayMood === mood}
              onClick={() => saveMood(mood)}
              className={cn(
                "flex cursor-pointer flex-col items-center gap-1 rounded-xl border px-1 py-2 text-[11px] font-bold",
                todayMood === mood
                  ? "border-primary bg-primary-soft text-primary"
                  : "border-border hover:bg-muted",
              )}
            >
              <Emoji name={`humor${index + 1}` as EmojiName} className="size-8" />
              {mood}
            </button>
          ))}
        </div>
        <p className="mt-2 text-[12px] leading-snug text-muted-foreground">
          Vai para o seu Diário, como o registro de humor do dia.
        </p>
      </section>

      <section className="mt-4 rounded-card bg-card p-4 shadow-soft">
        <p className="eyebrow">Reflexão</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {plan.exercise.prompts.map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={prompt === item}
              onClick={() => setPrompt(item)}
              className={cn(
                "cursor-pointer rounded-xl border px-3 py-1.5 text-left text-[12px] font-bold leading-snug",
                prompt === item
                  ? "border-primary bg-primary-soft text-primary"
                  : "border-border hover:bg-muted",
              )}
            >
              {item}
            </button>
          ))}
        </div>
        <label htmlFor="first48-reflection" className="sr-only">
          {prompt}
        </label>
        <textarea
          id="first48-reflection"
          rows={4}
          maxLength={2000}
          value={text}
          placeholder="Escreva aqui…"
          onChange={(event) => setText(event.target.value)}
          className="mt-3 w-full resize-none rounded-xl border border-input bg-card p-3 text-base leading-normal outline-none focus:border-primary"
        />
        <Button
          variant="outline"
          className="mt-2 h-11 w-full rounded-xl bg-card font-bold"
          disabled={!text.trim()}
          onClick={saveReflection}
        >
          <NotebookPen /> Guardar no Diário
        </Button>
        {jornada.first48.checks["preparar:reflexao"] && (
          <p className="mt-2 text-center text-[12px] font-bold text-success">
            Você já guardou uma reflexão no Diário.
          </p>
        )}
      </section>
    </>
  );
}

// ---------- Atividade 4: próximo passo ----------

function NextStep({
  plan,
  review,
  go,
  openPause,
  openCentral,
}: {
  plan: First48Plan;
  review: First48Review;
  go: (tool: First48Tool) => void;
  openPause: (draft?: string) => void;
  openCentral: () => void;
}) {
  const { data, setFirst48Choice, toggleFirst48Check } = useJornada();
  const step = plan.nextStep;
  const selected = step.choices.find((item) => item.id === review.choice) ?? null;
  const criteriaChecked = step.criteria.filter(
    (item) => data.first48.checks[`escolher:criterio:${item}`],
  ).length;
  const { addEntry } = useStore();
  // A escolha vai para o Diário. Os caminhos sem mensagem contam como "decidi não enviar".
  const choose = (choice: (typeof step.choices)[number]) => {
    if (selected?.id === choice.id || !setFirst48Choice(choice.id)) return;
    const sends = choice.id === "responder" || choice.id === "puxar";
    addEntry({
      type: "note",
      source: sends ? "first48" : "nao_enviar",
      text: `Meu próximo passo nas 48 horas: ${choice.label}.`,
    });
  };

  return (
    <>
      <p className="mt-6 rounded-card bg-card p-4 text-sm leading-6 shadow-soft">{step.intro}</p>

      {review.choiceInvalid && data.first48.choice && (
        <p
          role="status"
          className="mt-3 rounded-xl bg-tint-honey px-4 py-2.5 text-[13px] leading-snug"
        >
          Seu diagnóstico mudou e o caminho escolhido antes (“{choiceLabel(data.first48.choice.id)}
          ”) não vale para o seu momento atual. Escolha de novo abaixo.
        </p>
      )}

      {step.criteria.length > 0 && (
        <section className="mt-4">
          <div className="mb-2 flex items-baseline justify-between">
            <p className="eyebrow">Vale conversar? Critérios</p>
            <span className="text-[12px] font-bold text-muted-foreground">
              {criteriaChecked} de {step.criteria.length}
            </span>
          </div>
          <div className="space-y-2">
            {step.criteria.map((item) => (
              <CheckRow
                key={item}
                checked={Boolean(data.first48.checks[`escolher:criterio:${item}`])}
                onToggle={() => toggleFirst48Check(`escolher:criterio:${item}`)}
              >
                {item}
              </CheckRow>
            ))}
          </div>
          <p className="mt-2 rounded-xl bg-primary-soft px-4 py-2.5 text-[13px] leading-snug">
            {criteriaChecked === step.criteria.length
              ? "Todos os critérios fazem sentido hoje. Se quiser escrever, passe pela Pausa. Se não quiser, tudo bem também."
              : "Se algum critério não fizer sentido hoje, esperar é o caminho mais seguro. Tudo bem."}
          </p>
        </section>
      )}

      {step.examples.length > 0 && (
        <section className="mt-5">
          <p className="eyebrow mb-2">Exemplos para o seu momento</p>
          <div className="space-y-2">
            {step.examples.map((id) => {
              const template = templateById(id);
              if (!template) return null;
              return (
                <div key={id} className="rounded-card bg-card p-4 shadow-soft">
                  <p className="text-[12px] font-bold text-muted-foreground">
                    {template.whenToUse}
                  </p>
                  <p className="mt-1.5 rounded-xl bg-muted px-3 py-2 text-sm leading-6">
                    “{template.text}”
                  </p>
                  <button
                    type="button"
                    onClick={() => openPause(template.text)}
                    className="mt-2 inline-flex cursor-pointer items-center gap-1 text-[13px] font-extrabold text-primary"
                  >
                    Adaptar na Pausa <ChevronRight className="size-3.5" strokeWidth={3} />
                  </button>
                </div>
              );
            })}
          </div>
          <p className="mt-2 text-[12px] leading-snug text-muted-foreground">
            Pontos de partida: use as suas palavras. Nada precisa ser enviado.
          </p>
          <button
            type="button"
            onClick={openCentral}
            className="mt-2 inline-flex cursor-pointer items-center gap-1 text-[13px] font-extrabold text-primary"
          >
            Ver mais exemplos e orientações na Central{" "}
            <ChevronRight className="size-3.5" strokeWidth={3} />
          </button>
        </section>
      )}

      <section className="mt-5" aria-label="Escolha o seu próximo passo">
        <p className="eyebrow mb-2">Qual caminho faz sentido hoje?</p>
        <div className="space-y-2" role="radiogroup">
          {step.choices.map((choice) => {
            const on = selected?.id === choice.id;
            return (
              <button
                key={choice.id}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => choose(choice)}
                className={cn(
                  "flex w-full cursor-pointer items-start gap-3 rounded-xl border-2 px-4 py-3 text-left transition-colors",
                  on ? "border-primary bg-primary-soft" : "border-border bg-card hover:bg-muted",
                )}
              >
                {on ? (
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
                    <Check className="size-3" strokeWidth={3.5} />
                  </span>
                ) : (
                  <Circle aria-hidden className="mt-0.5 size-5 shrink-0 text-border" />
                )}
                <span className="min-w-0">
                  <span className="block text-sm font-extrabold leading-snug">{choice.label}</span>
                  <span className="mt-0.5 block text-[13px] leading-snug text-muted-foreground">
                    {choice.text}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
        {selected && (
          <Button
            variant="outline"
            className="mt-3 h-11 w-full rounded-xl bg-card font-bold"
            onClick={() => (selected.next.tool === "pause" ? openPause() : go(selected.next.tool))}
          >
            {selected.next.label} <ArrowRight />
          </Button>
        )}
      </section>
      <p className="mt-3 text-[12px] leading-snug text-muted-foreground">
        Nenhum caminho exige mandar mensagem ou receber resposta.
      </p>
    </>
  );
}

// ---------- Atividade 5 e conclusão ----------

function Learned({ plan, review }: { plan: First48Plan; review: First48Review }) {
  const { result, current } = useJornada();
  if (!result || !current) return null;
  const items = [
    `Ponto de atenção: ${result.attention.title}.`,
    `Padrão a interromper: ${mainPattern(current.answers).toLowerCase()}.`,
    review.choice
      ? `Seu próximo passo: ${choiceLabel(review.choice).toLowerCase()}.`
      : "Seu próximo passo: ainda a escolher na atividade 4.",
    ...result.avoid.slice(0, 2).map((item) => `Evitar: ${item.toLowerCase()}.`),
  ];
  return (
    <section className="rounded-card bg-card p-4 shadow-soft">
      <h3 className="font-display text-[15px] font-extrabold">O que você leva destas 48 horas</h3>
      <ul className="mt-2 space-y-1.5 text-sm leading-6">
        {items.map((item) => (
          <li key={item} className="flex gap-2.5">
            <Check aria-hidden className="mt-1 size-4 shrink-0 text-success" strokeWidth={3} />
            {item}
          </li>
        ))}
      </ul>
      {plan.path !== "conversa" && (
        <p className="mt-3 text-[13px] leading-snug text-muted-foreground">
          Nada disso envolve contato com ele. O plano continua valendo do mesmo jeito.
        </p>
      )}
    </section>
  );
}

function PlanContinuation({
  openDay,
  openPlan,
  allDays,
}: {
  openDay: (day: number) => void;
  openPlan: () => void;
  allDays: boolean;
}) {
  const { data } = useStore();
  const progress = planProgress(data);
  const state = dayState(data, progress.currentDay, { now: new Date(), allDays });
  return (
    <section className="mt-4 rounded-card bg-card p-4 shadow-soft">
      <p className="eyebrow">Continuação · plano de 21 dias</p>
      <p className="mt-1 font-display text-[16px] font-extrabold leading-snug">
        {progress.finished
          ? "Você já concluiu os 21 dias"
          : progress.total === 0
            ? "Comece pelo Dia 1"
            : `Siga do Dia ${progress.currentDay}`}
      </p>
      <p className="mb-2.5 mt-0.5 text-[13px] leading-snug text-muted-foreground">
        As 48 horas preparam você. O plano de 21 dias organiza o caminho em passos pequenos, um por
        dia.
      </p>
      <PhaseBar completed={progress.total} />
      <Button
        className="mt-3 h-11 w-full rounded-xl font-bold"
        onClick={() =>
          !progress.finished && state === "open" ? openDay(progress.currentDay) : openPlan()
        }
      >
        {progress.finished
          ? "Ver o plano"
          : state === "open"
            ? `Abrir o Dia ${progress.currentDay}`
            : "Ver meu plano"}{" "}
        <ArrowRight />
      </Button>
    </section>
  );
}

function Continuation({
  plan,
  review,
  openDay,
  openPlan,
  allDays,
}: {
  plan: First48Plan;
  review: First48Review;
  openDay: (day: number) => void;
  openPlan: () => void;
  allDays: boolean;
}) {
  return (
    <div className="mt-4">
      <Learned plan={plan} review={review} />
      <PlanContinuation openDay={openDay} openPlan={openPlan} allDays={allDays} />
    </div>
  );
}

function DoneView({
  plan,
  review,
  setView,
  go,
  openDay,
  openPlan,
  allDays,
}: {
  plan: First48Plan;
  review: First48Review;
  setView: (view: View) => void;
  go: (tool: First48Tool) => void;
  openDay: (day: number) => void;
  openPlan: () => void;
  allDays: boolean;
}) {
  const { data } = useJornada();
  const organize = plan.activities.find((item) => item.id === "organizar")!;
  return (
    <>
      <div className="flex flex-col items-center rounded-card bg-goal-card p-6 text-center text-primary-foreground shadow-glow">
        <Emoji name="trofeu" className="size-24 drop-shadow-[0_10px_14px_rgba(90,20,38,0.28)]" />
        <h2 className="mt-2 font-display text-2xl font-black leading-tight">
          Você concluiu o seu plano de 48 horas
        </h2>
        <p className="mt-2 text-[13px] leading-snug text-primary-foreground/85">
          {data.first48.completedAt && `Em ${shortDate(data.first48.completedAt)}. `}Cuidar de você
          primeiro foi o passo mais importante. O caminho continua no plano de 21 dias.
        </p>
      </div>
      <div className="mt-4">
        <Learned plan={plan} review={review} />
      </div>
      <PlanContinuation openDay={openDay} openPlan={openPlan} allDays={allDays} />
      <ToolButtons tools={organize.tools} go={go} />
      <Button
        variant="outline"
        className="mt-5 h-11 w-full rounded-xl bg-card font-bold"
        onClick={() => setView("overview")}
      >
        Rever as atividades
      </Button>
    </>
  );
}
