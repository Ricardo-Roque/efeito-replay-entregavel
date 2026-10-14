// Personalização do plano de 21 dias: escolhe a orientação de cada dia conforme o diagnóstico e o
// cenário do perfil. Regra pura (sem React), testada em plan.test.ts.
//
// O momento vem do mesmo contextOf da Central e do "Ele respondeu. E agora?", então as três telas
// nunca discordam: o cenário do perfil só deixa o momento mais restrito, nunca mais livre.

import type { LabeledLink } from "@/lib/app-link";
import { contextOf, messageById } from "@/lib/comunicacao/rules";
import type { CommCategoryId, CommStance } from "@/lib/comunicacao/types";
import type { DiagnosisAnswers } from "@/lib/jornada/types";
import type {
  PlanCheck,
  PlanDay,
  PlanExample,
  PlanExercise,
  PlanGuideKey,
  PlanNote,
  PlanVariant,
} from "@/lib/plan";
import type { ScenarioId } from "@/lib/scenarios";

export const guideTitle: Record<PlanGuideKey, string> = {
  conversa: "Há conversa entre vocês",
  espaco: "Hoje não há reciprocidade",
  pausa: "Ele pediu um tempo",
  limite: "Existe um limite",
  bloqueio: "Ele bloqueou o contato",
  outra: "Ele está com outra pessoa",
  sem_diagnostico: "Sem diagnóstico",
};

export interface ResolvedDay {
  key: PlanGuideKey;
  stance: CommStance;
  title: string;
  text: string[];
  notes: PlanNote[];
  action: string;
  example: PlanExample;
  practice: string[];
  exercise: PlanExercise;
  checklist: PlanCheck[];
  tools: LabeledLink[];
}

/** Variantes em ordem de preferência para o momento dela. */
export function guideKeysOf(
  answers: DiagnosisAnswers | null,
  profileScenario: ScenarioId | null,
): { stance: CommStance; keys: PlanGuideKey[] } {
  const { stance } = contextOf(answers, null, profileScenario);
  if (stance !== "limite") return { stance, keys: [stance] };
  const blocked = answers?.contact === "bloqueou" || profileScenario === "bloqueou";
  const other = answers?.otherPerson === "sim" || profileScenario === "outra";
  const keys: PlanGuideKey[] = [];
  if (blocked) keys.push("bloqueio");
  if (other) keys.push("outra");
  keys.push("limite");
  return { stance, keys };
}

const sameLink = (a: LabeledLink, b: LabeledLink) =>
  JSON.stringify(a.link) === JSON.stringify(b.link);

const CONTACT_CATEGORIES: CommCategoryId[] = [
  "primeiro_contato",
  "perguntas",
  "convites",
  "reencontro",
];
const CONTACT_SCENARIOS: ScenarioId[] = ["respondeu", "encontro"];

/**
 * Atalho que leva a escrever, convidar ou responder a ele. Com limite, nenhum desses aparece: a
 * Central continua aberta como leitura, mas o plano não aponta para ela como próximo passo.
 */
export function isContactLink({ link }: LabeledLink): boolean {
  if (link.kind === "central") return !link.category || CONTACT_CATEGORIES.includes(link.category);
  if (link.kind === "scenario") return link.id !== undefined && CONTACT_SCENARIOS.includes(link.id);
  if (link.kind === "reply") return link.situation === "encontro";
  if (link.kind === "message") {
    const message = messageById(link.id);
    // Reflexões de reencontro (ex.: "Antes de sair de casa") também pressupõem contato com ele.
    if (!message) return false;
    return message.kind === "modelo" || CONTACT_CATEGORIES.includes(message.category);
  }
  return false;
}

/** Orientação do dia para o momento dela, com o conteúdo-base onde a variante não muda nada. */
export function resolveDay(
  day: PlanDay,
  answers: DiagnosisAnswers | null,
  profileScenario: ScenarioId | null,
): ResolvedDay {
  const { stance, keys } = guideKeysOf(answers, profileScenario);
  // conversa, espaco, pausa e limite existem em todo dia; bloqueio e outra caem no limite. Só
  // "sem_diagnostico" pode faltar, e aí vale o conteúdo-base, que é seguro para todas.
  const found = keys.find((item) => day.guide[item]);
  const key: PlanGuideKey = found ?? "sem_diagnostico";
  const variant: PlanVariant = (found && day.guide[found]) || { text: [] };

  const trust = answers?.reason === "traicao" || answers?.reason === "quebra_confianca";
  const notes = [
    trust ? day.guide.confianca : undefined,
    answers?.elapsed === "menos7d" ? day.guide.recente : undefined,
  ].filter(
    (note): note is PlanNote => note !== undefined && (!note.conversaOnly || stance === "conversa"),
  );

  const extra = variant.tools ?? [];
  const tools = [
    ...extra,
    ...day.tools.filter((tool) => !extra.some((item) => sameLink(item, tool))),
  ].filter((tool) => stance !== "limite" || !isContactLink(tool));

  return {
    key,
    stance,
    title: guideTitle[key],
    text: variant.text,
    notes,
    action: variant.action ?? day.action,
    example: variant.example ?? day.example,
    practice: variant.practice ?? day.practice,
    exercise: variant.exercise ?? day.exercise,
    checklist: variant.checklist ?? day.checklist,
    tools,
  };
}
