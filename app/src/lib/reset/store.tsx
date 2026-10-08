import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import {
  journeySteps,
  audioSessions,
  forgivenessLessons,
  sayAvoidCategories,
} from "@/lib/reset/content";
import type { Answers, ModuleId } from "@/lib/reset/diagnosis";
import { newId, useStore } from "@/lib/store";

// Progresso do Reset Emocional do Ex. Mesmo modelo do app principal: fica no localStorage deste
// aparelho, separado por e-mail. Respostas do diagnóstico e textos dos exercícios são pessoais e
// sensíveis: não vão para servidor, log ou URL. Limitação: não sincroniza entre aparelhos e se
// perde se o navegador for limpo (o mesmo vale para o Diário).

export interface Diagnosis {
  id: string;
  at: string;
  answers: Answers;
}

export interface Hurt {
  id: string;
  at: string;
  event: string;
  consequences: string;
  repair: string;
}

export interface NightLog {
  id: string;
  at: string;
  feeling: string;
  note: string;
}

export interface ResetData {
  /** Histórico do diagnóstico; o último é o atual. */
  diagnoses: Diagnosis[];
  hurts: Hurt[];
  /** Respostas livres (reflexões das lições, responsabilidade, atividades da jornada). */
  notes: Record<string, string>;
  apology: Record<string, string>;
  lessonsRead: Record<string, string>;
  audioDone: Record<string, string>;
  categoriesSeen: Record<string, string>;
  night: NightLog[];
  journey: Record<number, { checks: number[]; doneAt?: string }>;
  bonusRevealedAt?: string;
  activity: { at: string; label: string }[];
}

const EMPTY: ResetData = {
  diagnoses: [],
  hurts: [],
  notes: {},
  apology: {},
  lessonsRead: {},
  audioDone: {},
  categoriesSeen: {},
  night: [],
  journey: {},
  activity: [],
};

const keyOf = (email: string) => `codigo-reconquista:reset:v1:${email}`;

export function readReset(email: string): ResetData {
  try {
    const raw = window.localStorage.getItem(keyOf(email));
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<ResetData>;
    return { ...EMPTY, ...parsed };
  } catch {
    return EMPTY;
  }
}

// ---------- Progresso (puro, usado no painel e no card do Início) ----------

export const moduleDone: Record<ModuleId, (d: ResetData) => boolean> = {
  perdao: (d) =>
    forgivenessLessons.every((l) => d.lessonsRead[l.id]) &&
    d.hurts.length > 0 &&
    Boolean(d.apology["reconheco"]?.trim()),
  audios: (d) => audioSessions.every((s) => d.audioDone[s.id]),
  dizer: (d) => sayAvoidCategories.every((c) => d.categoriesSeen[c.id]),
  noturno: (d) => d.night.length > 0,
  bonus: (d) => Boolean(d.bonusRevealedAt),
};

export const stepDone = (d: ResetData, step: number) => Boolean(d.journey[step]?.doneAt);

export function progressOf(d: ResetData) {
  const steps = journeySteps.filter((s) => stepDone(d, s.id)).length;
  const mods = (Object.keys(moduleDone) as ModuleId[]).filter((m) => moduleDone[m](d)).length;
  const diag = d.diagnoses.length > 0 ? 1 : 0;
  const total = journeySteps.length + 5 + 1;
  const currentStep = journeySteps.find((s) => !stepDone(d, s.id))?.id ?? null;
  return {
    percent: Math.round(((steps + mods + diag) / total) * 100),
    stepsDone: steps,
    modulesDone: mods,
    currentStep,
  };
}

// ---------- Contexto ----------

type Updater = (d: ResetData) => ResetData;

interface ResetStore {
  data: ResetData;
  /** Diagnóstico atual (o último feito), se existir. */
  current: Diagnosis | null;
  update: (fn: Updater, activity?: string) => boolean;
  saveDiagnosis: (answers: Answers) => boolean;
  addHurt: (hurt: Omit<Hurt, "id" | "at">) => boolean;
  removeHurt: (id: string) => boolean;
  setNote: (key: string, value: string) => boolean;
  toggleCheck: (step: number, index: number) => boolean;
  completeStep: (step: number) => boolean;
}

const Ctx = createContext<ResetStore | null>(null);

export function ResetProvider({ children }: { children: ReactNode }) {
  const { email, showToast } = useStore();
  const [data, setData] = useState<ResetData>(() => readReset(email));
  const ref = useRef(data);
  ref.current = data;

  useEffect(() => setData(readReset(email)), [email]);

  const update = useCallback(
    (fn: Updater, activity?: string) => {
      const before = ref.current;
      let next = fn(before);
      if (next === before) return true;
      if (activity)
        next = {
          ...next,
          activity: [{ at: new Date().toISOString(), label: activity }, ...next.activity].slice(
            0,
            40,
          ),
        };
      try {
        window.localStorage.setItem(keyOf(email), JSON.stringify(next));
      } catch {
        showToast(
          "Não foi possível salvar neste aparelho. Confira se o navegador não está em modo anônimo ou sem espaço.",
          "error",
        );
        return false;
      }
      ref.current = next;
      setData(next);
      return true;
    },
    [email, showToast],
  );

  const value: ResetStore = {
    data,
    current: data.diagnoses[data.diagnoses.length - 1] ?? null,
    update,
    saveDiagnosis: (answers) =>
      update(
        (d) => ({
          ...d,
          diagnoses: [...d.diagnoses, { id: newId(), at: new Date().toISOString(), answers }],
        }),
        d0(data) ? "Refez o diagnóstico" : "Fez o diagnóstico emocional",
      ),
    addHurt: (hurt) =>
      update(
        (d) => ({
          ...d,
          hurts: [{ ...hurt, id: newId(), at: new Date().toISOString() }, ...d.hurts],
        }),
        "Registrou uma mágoa no Mapa das Mágoas",
      ),
    removeHurt: (id) => update((d) => ({ ...d, hurts: d.hurts.filter((h) => h.id !== id) })),
    setNote: (key, value) => update((d) => ({ ...d, notes: { ...d.notes, [key]: value } })),
    toggleCheck: (step, index) =>
      update((d) => {
        const checks = d.journey[step]?.checks ?? [];
        const next = checks.includes(index)
          ? checks.filter((i) => i !== index)
          : [...checks, index];
        return { ...d, journey: { ...d.journey, [step]: { ...d.journey[step], checks: next } } };
      }),
    completeStep: (step) =>
      update(
        (d) => ({
          ...d,
          journey: {
            ...d.journey,
            [step]: { checks: d.journey[step]?.checks ?? [], doneAt: new Date().toISOString() },
          },
        }),
        `Concluiu a etapa ${step} da jornada`,
      ),
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

const d0 = (d: ResetData) => d.diagnoses.length > 0;

export function useReset() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useReset precisa estar dentro de ResetProvider");
  return ctx;
}
