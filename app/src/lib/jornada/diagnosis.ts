// Diagnóstico de entrada do app principal. RASCUNHO de conteúdo.
//
// Diferente do diagnóstico do Reset Emocional do Ex (lib/reset/diagnosis.ts, só para quem comprou
// o upsell): aqui são seis perguntas sobre o término e o contato com ele, para montar o "Meu Mapa
// de Reconquista" (lib/jornada/map.ts): cenário, modo de contato, foco e ponto de atenção.
// Regras explícitas, sem pontuação oculta. O app não interpreta o que ele pensa ou sente.

import type { ScenarioId } from "@/lib/scenarios";
import type {
  AttentionId,
  ContactMode,
  DiagnosisAnswers,
  DiagnosisQuestion,
  DiagnosisQuestionId,
  Focus,
} from "@/lib/jornada/types";

/** Versão das perguntas. A 1 nunca foi publicada; mudar as opções exige subir este número. */
export const DIAGNOSIS_VERSION = 2 as const;

export const diagnosisQuestions: DiagnosisQuestion[] = [
  {
    id: "elapsed",
    title: "Há quanto tempo ocorreu o término?",
    options: [
      { value: "menos7d", label: "Menos de 7 dias" },
      { value: "d7a30", label: "De 7 a 30 dias" },
      { value: "m1a3", label: "De 1 a 3 meses" },
      { value: "m3a6", label: "De 3 a 6 meses" },
      { value: "mais6m", label: "Mais de 6 meses" },
    ],
  },
  {
    id: "contact",
    title: "Como está o contato atualmente?",
    hint: "Escolha o que está acontecendo hoje, não o que você gostaria.",
    options: [
      { value: "normal", label: "Conversamos normalmente" },
      { value: "frio", label: "Ele responde, mas está frio" },
      { value: "raro", label: "Ele responde raramente" },
      { value: "nao_responde", label: "Não responde" },
      { value: "bloqueou", label: "Ele me bloqueou" },
      { value: "pediu_tempo", label: "Ele pediu um tempo" },
      {
        value: "pediu_sem_contato",
        label: "Ele pediu expressamente para eu não entrar em contato",
      },
    ],
  },
  {
    id: "reason",
    title: "Qual foi o principal motivo do término?",
    options: [
      { value: "discussoes", label: "Discussões frequentes" },
      { value: "distanciamento", label: "Distanciamento emocional" },
      { value: "quebra_confianca", label: "Quebra de confiança" },
      { value: "traicao", label: "Traição" },
      { value: "incompatibilidade", label: "Incompatibilidades" },
      { value: "outro", label: "Outro motivo ou não sei" },
    ],
  },
  {
    id: "otherPerson",
    title: "Ele está se envolvendo com outra pessoa?",
    options: [
      { value: "sim", label: "Sim" },
      { value: "nao", label: "Não" },
      { value: "nao_sei", label: "Não sei" },
    ],
  },
  {
    id: "tried",
    title: "O que você já tentou fazer?",
    hint: "Pode marcar mais de uma opção.",
    multiple: true,
    options: [
      { value: "mensagens", label: "Enviar mensagens" },
      { value: "nova_chance", label: "Pedir uma nova chance" },
      { value: "contato_zero", label: "Fazer contato zero" },
      { value: "pessoalmente", label: "Conversar pessoalmente" },
      { value: "desculpas", label: "Pedir desculpas" },
      { value: "nada", label: "Ainda não tentei nada", exclusive: true },
    ],
  },
  {
    id: "difficulty",
    title: "Qual é sua principal dificuldade?",
    options: [
      { value: "ansiedade", label: "Controlar a ansiedade" },
      { value: "se_contato", label: "Saber se devo entrar em contato" },
      { value: "o_que_dizer", label: "Saber o que dizer" },
      { value: "interpretar", label: "Interpretar as respostas" },
      { value: "frieza", label: "Lidar com a frieza" },
      { value: "confianca", label: "Reconstruir a confiança" },
      { value: "afastamento", label: "Respeitar o afastamento" },
    ],
  },
];

const questionOf = (id: DiagnosisQuestionId) =>
  diagnosisQuestions.find((question) => question.id === id)!;

/** Rótulo de uma resposta, como a cliente viu na pergunta. */
export function optionLabel(id: DiagnosisQuestionId, value: string): string {
  return questionOf(id).options.find((option) => option.value === value)?.label ?? value;
}

/** Valores válidos de uma pergunta, na ordem em que aparecem. */
const valuesOf = (id: DiagnosisQuestionId) => questionOf(id).options.map((option) => option.value);

/** A pergunta já tem resposta válida (na múltipla, ao menos um item). */
export function isAnswered(question: DiagnosisQuestion, value: unknown): boolean {
  const values = valuesOf(question.id);
  if (question.multiple)
    return (
      Array.isArray(value) &&
      value.length > 0 &&
      value.every((item) => typeof item === "string" && values.includes(item))
    );
  return typeof value === "string" && values.includes(value);
}

/** Confere um objeto lido do aparelho. Respostas fora das opções atuais invalidam o registro. */
export function isValidAnswers(value: unknown): value is DiagnosisAnswers {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  return diagnosisQuestions.every((question) => isAnswered(question, record[question.id]));
}

/** Guarda só as respostas parciais que ainda existem nas perguntas atuais. */
export function cleanPartial(value: unknown): Partial<DiagnosisAnswers> {
  if (typeof value !== "object" || value === null) return {};
  const record = value as Record<string, unknown>;
  return Object.fromEntries(
    diagnosisQuestions
      .filter((question) => isAnswered(question, record[question.id]))
      .map((question) => [question.id, record[question.id]]),
  ) as Partial<DiagnosisAnswers>;
}

// ---------- Regras ----------

/** Um limite que ele colocou: nada de mensagem, em nenhuma parte do app. */
export const hasHardLimit = (a: DiagnosisAnswers) =>
  a.contact === "bloqueou" || a.contact === "pediu_sem_contato";

/** Ela tentou contato ativo (mensagens, pedido de nova chance ou conversa). */
export const triedReaching = (a: DiagnosisAnswers) =>
  a.tried.some((item) => item === "mensagens" || item === "nova_chance" || item === "pessoalmente");

/** Respostas dele pouco frequentes ou ausentes. */
const lowResponse = (a: DiagnosisAnswers) =>
  a.contact === "frio" || a.contact === "raro" || a.contact === "nao_responde";

export const isRecent = (a: DiagnosisAnswers) => a.elapsed === "menos7d";

/**
 * Regra de segurança. Prioridade:
 * 1. Bloqueio, pedido de não contato ou outra relação confirmada: sem_contato.
 * 2. Pedido de tempo: pausa (nenhuma mensagem até ela decidir com calma, depois do tempo pedido).
 * 3. Demais casos: aberto, sempre passando pela Pausa antes de enviar.
 */
export function contactModeOf(a: DiagnosisAnswers): ContactMode {
  if (hasHardLimit(a) || a.otherPerson === "sim") return "sem_contato";
  if (a.contact === "pediu_tempo") return "pausa";
  return "aberto";
}

/** Mapeia para um dos seis cenários existentes. "encontro" nunca é sugerido: é escolha dela depois. */
export function scenarioOf(a: DiagnosisAnswers): ScenarioId {
  // Os limites dele vêm antes: bloqueio e pedido de não contato usam o cenário sem mensagens.
  if (hasHardLimit(a)) return "bloqueou";
  if (a.otherPerson === "sim") return "outra";
  if (a.contact === "normal") return "respondeu";
  if (a.contact === "nao_responde") return "desinteresse";
  return "frio";
}

/**
 * Principal ponto de atenção. A ordem é a regra de prioridade: limites dele primeiro, depois o
 * padrão de insistência, o momento do término, o motivo e, por fim, o estado do contato.
 */
export function attentionOf(a: DiagnosisAnswers): AttentionId {
  if (a.contact === "bloqueou") return "bloqueio";
  if (a.contact === "pediu_sem_contato") return "pedido_sem_contato";
  if (a.otherPerson === "sim") return "outra_relacao";
  if (a.contact === "pediu_tempo") return "pedido_tempo";
  if (lowResponse(a) && triedReaching(a) && !a.tried.includes("contato_zero")) return "insistencia";
  if (isRecent(a)) return "termino_recente";
  if (a.reason === "quebra_confianca" || a.reason === "traicao") return "confianca";
  if (a.contact === "nao_responde") return "silencio";
  if (a.contact === "frio" || a.contact === "raro") return "frieza";
  return "conversa_aberta";
}

export function focusOf(a: DiagnosisAnswers, mode = contactModeOf(a)): Focus[] {
  if (mode === "sem_contato") return ["estabilizar", "respeitar_limite"];
  const focus: Focus[] = [];
  if (a.difficulty === "ansiedade" || isRecent(a)) focus.push("estabilizar");
  if (mode === "pausa" || a.difficulty === "afastamento") focus.push("respeitar_limite");
  if (a.contact === "nao_responde" || a.contact === "raro") focus.push("silencio");
  if (a.contact === "frio" || a.difficulty === "frieza") focus.push("frieza");
  if (a.reason === "quebra_confianca" || a.reason === "traicao" || a.difficulty === "confianca")
    focus.push("confianca");
  if (a.reason === "discussoes") focus.push("ressentimento");
  if (
    mode === "aberto" &&
    (a.contact === "normal" || a.difficulty === "interpretar" || a.difficulty === "o_que_dizer")
  )
    focus.push("responder_contato");
  if (mode === "aberto" && a.contact === "normal" && !isRecent(a) && a.difficulty !== "ansiedade")
    focus.push("reaproximacao");
  if (!focus.includes("estabilizar")) focus.push("estabilizar");
  return [...new Set(focus)];
}
