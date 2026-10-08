import { TOTAL_DAYS, phaseOf, planDays } from "@/lib/plan";
import type { AppData, JournalEntry } from "@/lib/store";

export type DayState = "done" | "open" | "tomorrow" | "locked";

export const pad = (value: number) => String(value).padStart(2, "0");

/** "AAAA-MM-DD" no fuso do aparelho. */
export const dateKey = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

/** Quantos dias de calendário entre duas datas (0 = mesmo dia). */
export const calendarDaysBetween = (from: Date, to: Date) =>
  Math.round((startOfDay(to).getTime() - startOfDay(from).getTime()) / (24 * 60 * 60 * 1000));

/** Mesma regra do CalmBaby: um dia libera quando o anterior foi concluído num dia anterior do calendário.
 *  allDays (cr_clients.unlock_all) abre todos os dias de uma vez. */
export function dayState(
  data: AppData,
  day: number,
  { now = new Date(), allDays = false }: { now?: Date; allDays?: boolean } = {},
): DayState {
  if (data.completed[day]) return "done";
  if (day === 1 || allDays) return "open";
  const previous = data.completed[day - 1];
  if (!previous) return "locked";
  return dateKey(new Date(previous)) < dateKey(now) ? "open" : "tomorrow";
}

export function currentDay(data: AppData) {
  return planDays.find((item) => !data.completed[item.day])?.day ?? TOTAL_DAYS;
}

export const completedCount = (data: AppData) => Object.keys(data.completed).length;

export interface PlanProgress {
  currentDay: number;
  phase: ReturnType<typeof phaseOf>;
  phaseDone: number;
  phaseTotal: number;
  total: number;
  finished: boolean;
}

/** Resumo no mesmo formato do planProgress do CalmBaby, com fase no lugar de semana. */
export function planProgress(data: AppData): PlanProgress {
  const total = completedCount(data);
  const day = currentDay(data);
  const phase = phaseOf(day);
  const phaseDays = planDays.filter((item) => item.phase === phase.phase);
  return {
    currentDay: day,
    phase,
    phaseDone: phaseDays.filter((item) => data.completed[item.day]).length,
    phaseTotal: phaseDays.length,
    total,
    finished: total >= TOTAL_DAYS,
  };
}

/** Dias desde o último "agi por impulso" (ou desde o começo do plano, se nunca houve). */
export function impulseFreeDays(data: AppData, now = new Date()) {
  const lastActed = [...data.journal].reverse().find((entry) => entry.type === "acted");
  const since = lastActed?.at ?? data.profile?.startedAt;
  if (!since) return 0;
  return Math.max(0, calendarDaysBetween(new Date(since), now));
}

export const IMPULSE_GOAL = 7;

export const formatTime = (date: Date) => `${pad(date.getHours())}:${pad(date.getMinutes())}`;

/** "Hoje às 21:40", "Ontem às 09:12", "05/10 às 19:02". */
export function formatWhen(iso: string, now = new Date()) {
  const date = new Date(iso);
  const diff = calendarDaysBetween(date, now);
  const prefix =
    diff === 0
      ? "Hoje"
      : diff === 1
        ? "Ontem"
        : diff === -1
          ? "Amanhã"
          : `${pad(date.getDate())}/${pad(date.getMonth() + 1)}`;
  return `${prefix} às ${formatTime(date)}`;
}

export const isDraftReady = (entry: JournalEntry, now = new Date()) =>
  !entry.readyAt || new Date(entry.readyAt) <= now;
