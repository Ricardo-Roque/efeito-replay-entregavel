// Resumo da tela "Meu progresso": diagnóstico, 48 horas, plano de 21 dias, ferramentas e marcos.
// Regras puras sobre o que já está gravado (AppData e JornadaData). Nada aqui mede a resposta dele:
// todo marco é sobre o que ela fez por si, e nenhum é apresentado como reconciliação.

import { ACTIVITY_ORDER } from "@/lib/jornada/first48";
import type { JornadaData } from "@/lib/jornada/types";
import { MILESTONES, TOTAL_DAYS, planPhases } from "@/lib/plan";
import { IMPULSE_GOAL, completedCount, impulseFreeDays } from "@/lib/progress";
import type { AppData, JournalEntry } from "@/lib/store";

export interface PhaseSummary {
  phase: number;
  title: string;
  done: number;
  total: number;
}

export interface ToolUsage {
  id: "held" | "not_sent" | "notes" | "contact" | "signals" | "moods" | "central" | "checks";
  label: string;
  count: number;
}

export interface MilestoneSummary {
  id: string;
  title: string;
  description: string;
  /** ISO de quando foi alcançado; null quando ainda não foi. */
  at: string | null;
  achieved: boolean;
}

export interface ProgressSummary {
  diagnosis: { done: boolean; at: string | null; count: number };
  first48: { done: number; total: number; complete: boolean; completedAt: string | null };
  plan: { done: number; total: number; phases: PhaseSummary[]; finished: boolean };
  impulse: { days: number; goal: number };
  tools: ToolUsage[];
  milestones: MilestoneSummary[];
  achieved: number;
}

const notSent = (entry: JournalEntry) =>
  entry.type === "draft" || (entry.type === "note" && entry.source === "nao_enviar");

const isReflection = (entry: JournalEntry) =>
  entry.type === "note" &&
  (!entry.source ||
    entry.source === "plano" ||
    entry.source === "first48" ||
    entry.source === "central");

const latest = (dates: string[]) => (dates.length ? [...dates].sort().at(-1)! : null);

export function progressSummary(
  data: AppData,
  jornada: JornadaData,
  now = new Date(),
): ProgressSummary {
  const journal = data.journal;
  const firstDiagnosis = jornada.diagnoses[0] ?? null;
  const lastDiagnosis = jornada.diagnoses[jornada.diagnoses.length - 1] ?? null;

  const first48Dates = ACTIVITY_ORDER.flatMap((id) => {
    const done = jornada.first48.done[id];
    return done ? [done.at] : [];
  });
  const first48Complete = first48Dates.length === ACTIVITY_ORDER.length;

  const done = completedCount(data);
  const phases = planPhases.map((phase) => {
    let count = 0;
    for (let day = phase.first; day <= phase.last; day += 1) if (data.completed[day]) count += 1;
    return {
      phase: phase.phase,
      title: phase.title,
      done: count,
      total: phase.last - phase.first + 1,
    };
  });

  const impulse = impulseFreeDays(data, now);
  const count = (fn: (entry: JournalEntry) => boolean) => journal.filter(fn).length;
  const moodDays = new Set(
    journal.filter((entry) => entry.type === "mood").map((entry) => entry.at.slice(0, 10)),
  ).size;

  const tools: ToolUsage[] = [
    {
      id: "held",
      label: "Impulsos segurados",
      count: count((entry) => entry.type === "held"),
    },
    { id: "not_sent", label: "Mensagens que decidi não enviar", count: count(notSent) },
    { id: "notes", label: "Reflexões no Diário", count: count(isReflection) },
    { id: "moods", label: "Dias com humor registrado", count: moodDays },
    { id: "signals", label: "Sinais observados", count: count((entry) => entry.type === "signal") },
    {
      id: "contact",
      label: "Contatos dele registrados",
      count: count((entry) => entry.type === "contact"),
    },
    {
      id: "central",
      label: "Modelos da Central usados",
      count: Object.keys(jornada.messages.usedAt).length,
    },
    {
      id: "checks",
      label: "Itens de checklist do plano",
      count: Object.keys(jornada.plan?.checks ?? {}).length,
    },
  ];

  const firstNote = journal.find((entry) => entry.type !== "mood")?.at ?? null;
  const milestones: MilestoneSummary[] = [
    {
      id: "diagnostico",
      title: "Diagnóstico feito",
      description: "Você olhou para a sua situação com calma e montou o seu Mapa.",
      at: firstDiagnosis?.at ?? null,
      achieved: Boolean(firstDiagnosis),
    },
    {
      id: "first48",
      title: "Meu Plano de 48 Horas concluído",
      description: "Você atravessou o começo sem agir no impulso.",
      at: first48Complete ? latest(first48Dates) : null,
      achieved: first48Complete,
    },
    {
      id: "diario",
      title: "Primeiro registro no Diário",
      description: "Escrever em vez de enviar já é uma mudança.",
      at: firstNote,
      achieved: Boolean(firstNote),
    },
    {
      id: "dia1",
      title: "Dia 1 do plano concluído",
      description: "O primeiro passo do plano de 21 dias.",
      at: data.completed[1] ?? null,
      achieved: Boolean(data.completed[1]),
    },
    {
      id: "impulso",
      title: `${IMPULSE_GOAL} dias sem agir por impulso`,
      description:
        impulse >= IMPULSE_GOAL
          ? "Meta da Fase 1 cumprida na sequência atual."
          : `Sequência atual: ${impulse} de ${IMPULSE_GOAL} dias. Recomeçar faz parte.`,
      at: null,
      achieved: impulse >= IMPULSE_GOAL,
    },
    ...MILESTONES.map((item) => ({
      id: `dia${item.day}`,
      title: item.title,
      description: item.description,
      at: data.completed[item.day] ?? null,
      achieved: Boolean(data.completed[item.day]),
    })),
  ];

  return {
    diagnosis: {
      done: Boolean(lastDiagnosis),
      at: lastDiagnosis?.at ?? null,
      count: jornada.diagnoses.length,
    },
    first48: {
      done: first48Dates.length,
      total: ACTIVITY_ORDER.length,
      complete: first48Complete,
      completedAt: first48Complete ? latest(first48Dates) : null,
    },
    plan: { done, total: TOTAL_DAYS, phases, finished: done >= TOTAL_DAYS },
    impulse: { days: impulse, goal: IMPULSE_GOAL },
    tools,
    milestones,
    achieved: milestones.filter((item) => item.achieved).length,
  };
}
