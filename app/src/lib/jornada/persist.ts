// Leitura do que a jornada grava no aparelho, sem depender de window (testável).
// Formato inesperado ou respostas de uma versão antiga são descartados, nunca quebram o app.

import { cleanPartial, DIAGNOSIS_VERSION, isValidAnswers } from "@/lib/jornada/diagnosis";
import { ACTIVITY_ORDER } from "@/lib/jornada/first48";
import type {
  DiagnosisDraft,
  DiagnosisRecord,
  First48ChoiceId,
  First48Done,
  First48State,
  JornadaData,
} from "@/lib/jornada/types";

export const jornadaKey = (email: string) => `codigo-reconquista:jornada:v1:${email}`;

export const EMPTY_JORNADA: JornadaData = {
  version: 1,
  diagnoses: [],
  first48: { done: {}, checks: {} },
  messages: { favorites: {}, usedAt: {} },
};

const CHOICES: First48ChoiceId[] = [
  "responder",
  "puxar",
  "esperar",
  "parar",
  "respeitar",
  "diario",
  "cuidar",
];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const stringMap = (value: unknown): Record<string, string> =>
  isRecord(value)
    ? (Object.fromEntries(
        Object.entries(value).filter(([, item]) => typeof item === "string"),
      ) as Record<string, string>)
    : {};

function readDraft(value: unknown): DiagnosisDraft | null {
  if (!isRecord(value) || typeof value["at"] !== "string" || typeof value["step"] !== "number")
    return null;
  return {
    at: value["at"],
    step: Math.max(0, Math.floor(value["step"])),
    answers: cleanPartial(value["answers"]),
  };
}

const isDone = (value: unknown): value is First48Done =>
  isRecord(value) && typeof value["at"] === "string" && typeof value["diagnosisId"] === "string";

function readFirst48(value: unknown): First48State {
  const raw = isRecord(value) ? value : {};
  const doneRaw = isRecord(raw["done"]) ? raw["done"] : {};
  // Só as 5 atividades atuais. Marcações da fundação (tarefas por janela de horas) são ignoradas.
  const done = Object.fromEntries(
    ACTIVITY_ORDER.flatMap((id) => (isDone(doneRaw[id]) ? [[id, doneRaw[id]]] : [])),
  ) as First48State["done"];
  const { startedAt, completedAt, choice } = raw;
  const validChoice =
    isRecord(choice) &&
    typeof choice["at"] === "string" &&
    typeof choice["diagnosisId"] === "string" &&
    CHOICES.includes(choice["id"] as First48ChoiceId);
  return {
    done,
    checks: stringMap(raw["checks"]),
    ...(typeof startedAt === "string" ? { startedAt } : {}),
    ...(typeof completedAt === "string" ? { completedAt } : {}),
    ...(validChoice
      ? {
          choice: {
            id: choice["id"] as First48ChoiceId,
            at: choice["at"] as string,
            diagnosisId: choice["diagnosisId"] as string,
          },
        }
      : {}),
  };
}

export function parseJornada(raw: string | null): JornadaData {
  if (!raw) return EMPTY_JORNADA;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed) || parsed["version"] !== 1) return EMPTY_JORNADA;
    const diagnoses = Array.isArray(parsed["diagnoses"])
      ? (parsed["diagnoses"] as unknown[]).filter(
          (item): item is DiagnosisRecord =>
            isRecord(item) &&
            typeof item["id"] === "string" &&
            typeof item["at"] === "string" &&
            item["version"] === DIAGNOSIS_VERSION &&
            isValidAnswers(item["answers"]),
        )
      : [];
    const messages = isRecord(parsed["messages"]) ? parsed["messages"] : {};
    const draft = readDraft(parsed["diagnosisDraft"]);
    const planChecks = isRecord(parsed["plan"]) ? stringMap(parsed["plan"]["checks"]) : {};
    return {
      version: 1,
      diagnoses,
      ...(draft ? { diagnosisDraft: draft } : {}),
      first48: readFirst48(parsed["first48"]),
      messages: {
        favorites: stringMap(messages["favorites"]),
        usedAt: stringMap(messages["usedAt"]),
      },
      ...(Object.keys(planChecks).length ? { plan: { checks: planChecks } } : {}),
    };
  } catch {
    return EMPTY_JORNADA;
  }
}

// ---------- Transições das 48 horas (puras, usadas pelo store e pelos testes) ----------

const toggle = (map: Record<string, string>, id: string, at: string) => {
  if (map[id]) {
    const { [id]: _removed, ...rest } = map;
    return rest;
  }
  return { ...map, [id]: at };
};

export const first48Start = (d: JornadaData, at: string): JornadaData =>
  d.first48.startedAt ? d : { ...d, first48: { ...d.first48, startedAt: at } };

export const first48ToggleCheck = (d: JornadaData, id: string, at: string): JornadaData => ({
  ...d,
  first48: { ...d.first48, checks: toggle(d.first48.checks, id, at) },
});

/** Marca ou desmarca uma atividade. Ao completar as 5 pela primeira vez, grava completedAt. */
export function first48ToggleActivity(
  d: JornadaData,
  id: (typeof ACTIVITY_ORDER)[number],
  diagnosisId: string,
  at: string,
): JornadaData {
  const { [id]: current, ...rest } = d.first48.done;
  const done: First48State["done"] = current ? rest : { ...rest, [id]: { at, diagnosisId } };
  const all = ACTIVITY_ORDER.every((item) => done[item]);
  return {
    ...d,
    first48: {
      ...d.first48,
      done,
      ...(all && !d.first48.completedAt ? { completedAt: at } : {}),
    },
  };
}

/** Marca ou desmarca um item do checklist de um dia do plano de 21 dias. */
export const planToggleCheck = (d: JornadaData, id: string, at: string): JornadaData => ({
  ...d,
  plan: { checks: toggle(d.plan?.checks ?? {}, id, at) },
});

export const first48SetChoice = (
  d: JornadaData,
  id: First48ChoiceId,
  diagnosisId: string,
  at: string,
): JornadaData => ({ ...d, first48: { ...d.first48, choice: { id, at, diagnosisId } } });
