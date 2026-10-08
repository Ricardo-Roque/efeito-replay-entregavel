import { forwardRef, useMemo } from "react";
import {
  ArrowLeft,
  Check,
  Clock,
  Lock,
  Play,
  RotateCcw,
  Sparkles,
  Star,
  Trophy,
} from "lucide-react";

import { Character, Emoji, GoalProgress } from "@/components/common";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import type { EmojiName } from "@/lib/illustrations";
import { MILESTONES, type PlanDay, type PlanPhase } from "@/lib/plan";
import { cn } from "@/lib/utils";

// Mesmos componentes da Jornada do Calm Kids (trilha em zigue-zague, cabeçalho da semana, cartão
// flutuante, gaveta de detalhes e celebração), adaptados às 4 fases e aos 21 dias.

export type DayStatus = "completed" | "current" | "open" | "tomorrow" | "locked";

const NODE_SIZE = 80;
const LABEL_WIDTH = 108;
const ROW_HEIGHT = 118;
const TOP_PAD = 50;
const BOTTOM_PAD = 56;
const CENTER_X = 170;
const CONTAINER_WIDTH = 340;
// Deslocamento horizontal por posição: desenha um caminho em "S", não uma coluna reta.
const OFFSETS = [0, 46, 64, 46, 0, -46, -64];

const isMilestone = (day: number) => MILESTONES.some((item) => item.day === day);

function DayIcon({ day, status }: { day: number; status: DayStatus }) {
  if (status === "completed") return <Check className="size-8" strokeWidth={3} />;
  if (status === "locked") return <Lock className="size-7" />;
  if (status === "tomorrow") return <Clock className="size-7" />;
  if (day === 21) return <Trophy className="size-8" />;
  if (isMilestone(day)) return <Star className="size-8 fill-current" />;
  return <Sparkles className="size-7" />;
}

function DayNode({
  day,
  status,
  side,
  x,
  y,
  onSelect,
}: {
  day: PlanDay;
  status: DayStatus;
  side: "left" | "right";
  x: number;
  y: number;
  onSelect: () => void;
}) {
  const unavailable = status === "locked" || status === "tomorrow";
  return (
    <div
      className="absolute"
      style={{
        left: x,
        top: y,
        width: NODE_SIZE,
        height: NODE_SIZE,
        transform: "translateX(-50%)",
      }}
    >
      {status === "current" && (
        <span
          className="absolute inset-0 -z-10 rounded-full bg-primary/25 blur-md motion-safe:animate-pulse"
          aria-hidden
        />
      )}
      <button
        type="button"
        onClick={onSelect}
        aria-label={`Dia ${day.day}: ${day.title}${unavailable ? " (ainda não liberado)" : ""}`}
        className={cn(
          "grid size-full cursor-pointer place-items-center rounded-full border-4 transition-transform active:scale-95",
          status === "completed" && "border-success bg-node-success text-success shadow-tile",
          status === "current" &&
            "scale-110 border-primary bg-play-button text-primary-foreground shadow-glow",
          status === "open" && "border-primary bg-play-button text-primary-foreground",
          unavailable && "border-border bg-muted text-muted-foreground",
        )}
      >
        <DayIcon day={day.day} status={status} />
      </button>
      <span
        className={cn(
          "absolute top-1/2 -translate-y-1/2 text-xs font-bold leading-tight",
          side === "left" ? "right-full mr-3 text-right" : "left-full ml-3 text-left",
          unavailable ? "text-muted-foreground" : "text-foreground",
        )}
        style={{ width: LABEL_WIDTH }}
      >
        <span className="block text-[10px] font-extrabold uppercase tracking-wide text-muted-foreground">
          Dia {day.day}
        </span>
        {day.title}
      </span>
    </div>
  );
}

/** Caminho vertical em zigue-zague em SVG. Cada trecho é pintado conforme o progresso real:
 * verde (percorrido), cor de ação (leva ao dia atual) ou cinza (ainda não chegou). */
export function JourneyPath({
  days,
  statusOf,
  onSelect,
}: {
  days: PlanDay[];
  statusOf: (day: number) => DayStatus;
  onSelect: (day: number) => void;
}) {
  const points = useMemo(
    () =>
      days.map((_, index) => ({
        x: CENTER_X + (OFFSETS[index % OFFSETS.length] ?? 0),
        y: TOP_PAD + index * ROW_HEIGHT,
      })),
    [days],
  );
  const height = TOP_PAD + (days.length - 1) * ROW_HEIGHT + BOTTOM_PAD;

  const segmentColor = (index: number) => {
    const from = days[index]!;
    const to = days[index + 1];
    if (statusOf(from.day) === "completed") return "var(--color-success)";
    if (to && statusOf(to.day) === "current") return "var(--color-primary)";
    return "var(--color-border)";
  };

  return (
    <div className="relative mx-auto" style={{ width: CONTAINER_WIDTH, height }}>
      <svg
        width={CONTAINER_WIDTH}
        height={height}
        viewBox={`0 0 ${CONTAINER_WIDTH} ${height}`}
        className="absolute inset-0"
        aria-hidden
      >
        {points.slice(0, -1).map((point, index) => {
          const next = points[index + 1]!;
          return (
            <line
              key={days[index]!.day}
              x1={point.x}
              y1={point.y}
              x2={next.x}
              y2={next.y}
              stroke={segmentColor(index)}
              strokeWidth={8}
              strokeLinecap="round"
              style={{ transition: "stroke 400ms ease" }}
            />
          );
        })}
      </svg>
      {days.map((day, index) => (
        <DayNode
          key={day.day}
          day={day}
          status={statusOf(day.day)}
          side={(OFFSETS[index % OFFSETS.length] ?? 0) < 0 ? "right" : "left"}
          x={points[index]!.x}
          y={points[index]!.y - NODE_SIZE / 2}
          onSelect={() => onSelect(day.day)}
        />
      ))}
    </div>
  );
}

/** Fica fixo no topo enquanto a página rola pelas 4 fases (WeekHeader do Calm Kids). */
export const PhaseHeader = forwardRef<
  HTMLElement,
  { phase: PlanPhase; done: number; total: number; onBack: () => void }
>(function PhaseHeader({ phase, done, total, onBack }, ref) {
  return (
    <section
      ref={ref}
      className="sticky top-0 z-30 transform-gpu overflow-hidden rounded-b-3xl bg-goal-card px-5 pb-6 pt-[max(1rem,env(safe-area-inset-top))] text-primary-foreground shadow-glow"
    >
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          aria-label="Voltar ao Início"
          className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-full bg-card/20 text-primary-foreground hover:bg-card/30"
        >
          <ArrowLeft className="size-4" />
        </button>
        <p className="eyebrow eyebrow-light tracking-widest">
          Fase {phase.phase} de 4 · dias {phase.first} a {phase.last}
        </p>
      </div>
      <Character
        pose={phase.pose}
        className="pointer-events-none absolute -bottom-12 right-2 h-[176px] drop-shadow-[0_10px_14px_rgba(60,10,25,0.3)]"
      />
      <div className="relative z-10 mt-3 max-w-[72%]">
        <h1 className="font-display text-xl font-extrabold leading-snug">{phase.title}</h1>
        <p className="mt-1.5 text-[13px] leading-snug text-primary-foreground/85">
          {phase.objective}
        </p>
      </div>
      <div className="relative z-10 mt-5 flex items-center gap-3 pr-[84px]">
        <GoalProgress value={done} max={total} label={`Dias concluídos na fase ${phase.phase}`} />
        <span className="shrink-0 text-xs font-bold">
          {done} de {total} dias
        </span>
      </div>
    </section>
  );
});

/** Fixo acima da borda inferior: sempre o dia real de hoje. */
export function FloatingDayCard({
  day,
  emoji,
  finished,
  waiting,
  onStart,
}: {
  day: PlanDay;
  emoji: EmojiName;
  finished: boolean;
  waiting: boolean;
  onStart: () => void;
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-[430px] transform-gpu px-3 pb-[max(1.675rem,calc(env(safe-area-inset-bottom)+15px))]">
      <div className="flex items-center gap-3 rounded-card bg-card p-3.5 shadow-float">
        <Emoji name={finished ? "trofeu" : emoji} className="size-14 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-extrabold uppercase tracking-wide text-primary">
            {finished
              ? "Plano concluído"
              : waiting
                ? "Próximo dia libera amanhã"
                : "Atividade de hoje"}
          </p>
          <p className="truncate text-[15px] font-extrabold leading-tight text-foreground">
            {finished ? "Você chegou até o fim!" : day.title}
          </p>
          <p className="truncate text-[11px] font-bold text-muted-foreground">
            {finished ? "Toque num dia para rever" : `Dia ${day.day} de 21 · ${day.minutes} min`}
          </p>
        </div>
        <Button
          size="icon"
          className="size-12 shrink-0 rounded-full"
          aria-label="Começar o dia"
          onClick={onStart}
          disabled={finished || waiting}
        >
          <Play className="fill-current" />
        </Button>
      </div>
    </div>
  );
}

const statusCopy: Record<DayStatus, { label: string; className: string }> = {
  completed: { label: "Concluído", className: "bg-success-soft text-success" },
  current: { label: "Disponível agora", className: "bg-primary-soft text-primary" },
  open: { label: "Disponível", className: "bg-primary-soft text-primary" },
  tomorrow: { label: "Libera amanhã", className: "bg-muted text-muted-foreground" },
  locked: { label: "Bloqueado", className: "bg-muted text-muted-foreground" },
};

export function DaySheet({
  day,
  status,
  open,
  onOpenChange,
  onStart,
}: {
  day: PlanDay | null;
  status: DayStatus;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStart: () => void;
}) {
  const unavailable = status === "locked" || status === "tomorrow";
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="mx-auto max-w-[430px] rounded-t-3xl">
        {day && (
          <>
            <DrawerHeader className="text-left">
              <span
                className={cn(
                  "mb-2 inline-flex w-fit items-center rounded-full px-3 py-1 text-[11px] font-extrabold",
                  statusCopy[status].className,
                )}
              >
                {statusCopy[status].label}
              </span>
              <DrawerTitle className="font-display text-2xl">{day.title}</DrawerTitle>
              <DrawerDescription className="text-sm leading-6">{day.lesson[0]}</DrawerDescription>
            </DrawerHeader>
            <div className="space-y-3 px-4 pb-2">
              <div className="flex items-center gap-2 rounded-xl bg-muted px-3 py-2.5 text-sm">
                <Sparkles className="size-4 shrink-0 text-primary" />
                <span className="font-bold text-foreground">Fase {day.phase}</span>
                <span className="text-muted-foreground">· Dia {day.day} de 21</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-muted px-3 py-2.5 text-sm">
                <Clock className="size-4 shrink-0 text-primary" />
                <span className="font-bold text-foreground">Leitura:</span>
                <span className="text-muted-foreground">{day.minutes} min</span>
              </div>
            </div>
            <DrawerFooter>
              {unavailable ? (
                <p className="flex items-center justify-center gap-2 rounded-xl bg-muted px-4 py-3 text-center text-xs font-bold text-muted-foreground">
                  <Lock className="size-3.5 shrink-0" />
                  {status === "tomorrow"
                    ? "Você já fez o dia de hoje. Este libera amanhã."
                    : "Conclua o dia atual para chegar até aqui."}
                </p>
              ) : (
                <Button className="h-12 rounded-xl text-sm font-bold" onClick={onStart}>
                  {status === "completed" ? <RotateCcw /> : <Play className="fill-current" />}
                  {status === "completed" ? "Rever o dia" : "Começar"}
                </Button>
              )}
            </DrawerFooter>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
}
