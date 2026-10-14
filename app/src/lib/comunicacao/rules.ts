// Central de Comunicação: regras puras (sem React e sem window), testadas em rules.test.ts.
//
// Segurança primeiro: o momento dela (CommStance) é calculado antes de tudo e decide o que pode
// ser copiado ou levado para a Pausa. Com limite (bloqueio, pedido de não contato, outra relação)
// nenhum modelo vira ação: a biblioteca continua aberta só como leitura.

import { commCategories, commMessages } from "@/lib/comunicacao/library";
import type {
  CommAvailability,
  CommCategoryId,
  CommContext,
  CommFilters,
  CommMessage,
  CommStance,
} from "@/lib/comunicacao/types";
import { pathOf } from "@/lib/jornada/first48";
import type { DiagnosisAnswers } from "@/lib/jornada/types";
import { scenarioById, type ScenarioId } from "@/lib/scenarios";

export const categoryById = (id: CommCategoryId) => commCategories.find((item) => item.id === id)!;

export const messageById = (id: string) => commMessages.find((item) => item.id === id);

/** Cenários de limite: escolhidos no perfil, valem mesmo que o diagnóstico diga outra coisa. */
const LIMIT_SCENARIOS: ScenarioId[] = ["bloqueou", "outra"];

const list = <T>(...items: (T | false | undefined)[]) => [
  ...new Set(items.filter((item): item is T => Boolean(item))),
];

function focusOfAnswers(a: DiagnosisAnswers): CommCategoryId[] {
  return list<CommCategoryId>(
    a.contact === "nao_responde" && "sem_resposta",
    (a.contact === "frio" || a.contact === "raro") && "frio",
    a.difficulty === "frieza" && "frio",
    (a.reason === "traicao" || a.reason === "quebra_confianca" || a.difficulty === "confianca") &&
      "confianca",
    a.reason === "discussoes" && "ressentimento",
    a.contact === "normal" && "perguntas",
    a.difficulty === "interpretar" && "perguntas",
    a.contact === "normal" && "saudade",
    a.difficulty === "o_que_dizer" && "primeiro_contato",
    (a.difficulty === "ansiedade" || a.difficulty === "se_contato") && "sem_resposta",
    (a.tried.includes("mensagens") || a.tried.includes("nova_chance")) && "evitar",
  );
}

const focusOfScenario: Record<ScenarioId, CommCategoryId[]> = {
  bloqueou: ["sem_resposta", "evitar"],
  outra: ["sem_resposta", "evitar"],
  frio: ["frio", "primeiro_contato"],
  desinteresse: ["sem_resposta", "primeiro_contato"],
  respondeu: ["perguntas", "saudade"],
  encontro: ["convites", "reencontro"],
};

/**
 * Momento dela para a Central. Usa o mesmo caminho das 48 horas (pathOf). O cenário do perfil
 * só deixa o momento mais restrito (bloqueio ou outra relação viram limite), nunca mais livre.
 */
export function contextOf(
  answers: DiagnosisAnswers | null,
  suggestedScenario: ScenarioId | null,
  profileScenario: ScenarioId | null,
): CommContext {
  const scenario = profileScenario ?? suggestedScenario;
  const limitByProfile = profileScenario !== null && LIMIT_SCENARIOS.includes(profileScenario);
  const stance: CommStance = limitByProfile
    ? "limite"
    : answers
      ? pathOf(answers)
      : "sem_diagnostico";
  const focus = list<CommCategoryId>(
    ...(answers ? focusOfAnswers(answers) : []),
    ...(scenario ? focusOfScenario[scenario] : []),
  );
  return { stance, scenario, focus };
}

/** Pode virar ação (copiar, levar para a Pausa) no momento dela. */
export const canSend = (availability: CommAvailability) =>
  availability === "recomendado" || availability === "permitido" || availability === "so_resposta";

export const fitsScenario = (message: CommMessage, scenario: ScenarioId | null) =>
  scenario === null || message.scenarios === "all" || message.scenarios.includes(scenario);

/** Situação do conteúdo para o momento dela. Ver CommAvailability. */
export function availabilityOf(message: CommMessage, ctx: CommContext): CommAvailability {
  if (message.kind !== "modelo" || !message.copyable) return "educativo";
  if (ctx.stance === "limite") return "nao_agora";
  if (ctx.stance === "pausa" || ctx.stance === "espaco")
    return message.initiative === "resposta" && fitsScenario(message, ctx.scenario)
      ? "so_resposta"
      : "nao_agora";
  if (!fitsScenario(message, ctx.scenario)) return "nao_agora";
  return ctx.focus.includes(message.category) ? "recomendado" : "permitido";
}

export const availabilityLabel: Record<CommAvailability, string> = {
  recomendado: "Para o seu momento",
  permitido: "Pode fazer sentido",
  so_resposta: "Só se ele escrever",
  nao_agora: "Não é para agora",
  educativo: "Leitura",
};

/** Por que o conteúdo não é para agora (ou o cuidado extra), em linguagem dela. */
export function availabilityNote(message: CommMessage, ctx: CommContext): string | null {
  const status = availabilityOf(message, ctx);
  if (message.kind === "evitar") return "Exemplo do que não enviar. Não é para copiar.";
  if (message.kind === "reflexao") return "Este texto é para o seu Diário, não para ele.";
  if (status === "so_resposta")
    return ctx.stance === "pausa"
      ? "Ele pediu um tempo. Use só se ele mesmo escrever, e sem reabrir o assunto da relação."
      : "Hoje não há reciprocidade. Use só se ele escrever primeiro. Não comece a conversa.";
  if (status !== "nao_agora") return null;
  if (ctx.stance === "limite")
    return "No seu cenário há um limite (bloqueio, pedido de não contato ou outra relação). Fica só como leitura: nenhuma mensagem é sugerida.";
  if (ctx.stance === "pausa")
    return "Ele pediu um tempo. Enquanto durar, a iniciativa de escrever não é sua.";
  if (ctx.stance === "espaco")
    return "Hoje não há reciprocidade na conversa. Dar espaço de verdade é não começar uma nova mensagem.";
  const names =
    message.scenarios === "all"
      ? ""
      : message.scenarios.map((id) => scenarioById(id).label.toLowerCase()).join(", ");
  return `Pensado para outro momento (${names}). No seu cenário atual, prefira os conteúdos em destaque.`;
}

export interface StanceNotice {
  title: string;
  text: string;
  /** "stop": nada a enviar. "care": cuidado extra. "info": orientação geral. */
  tone: "stop" | "care" | "info";
}

/** Aviso do topo da Central, de acordo com o momento dela. */
export function stanceNotice(stance: CommStance): StanceNotice {
  switch (stance) {
    case "limite":
      return {
        title: "Hoje, o recomendado é não enviar nada",
        text: "Ele colocou um limite. A Central fica aberta para você entender a comunicação e cuidar do que sente, mas nenhuma mensagem é sugerida e nada aqui serve para contornar esse limite.",
        tone: "stop",
      };
    case "pausa":
      return {
        title: "Ele pediu um tempo",
        text: 'Enquanto durar, não comece conversas. Se ele mesmo escrever, os modelos marcados "Só se ele escrever" ajudam a responder com leveza.',
        tone: "stop",
      };
    case "espaco":
      return {
        title: "Hoje, dar espaço é o melhor passo",
        text: "Sem reciprocidade, uma nova mensagem costuma afastar. Nada de iniciativa sua por enquanto. Se ele escrever, você encontra aqui como responder.",
        tone: "care",
      };
    case "sem_diagnostico":
      return {
        title: "Faça o diagnóstico para ver o que combina com você",
        text: "Sem ele, a Central mostra tudo como possibilidade. Antes de enviar qualquer coisa, passe pela Pausa: ela confere limite, horário e expectativa.",
        tone: "info",
      };
    default:
      return {
        title: "Exemplos, não roteiros",
        text: "Use as suas palavras, envie no máximo uma mensagem e passe pela Pausa antes. Não enviar nada também é uma escolha válida.",
        tone: "info",
      };
  }
}

/** Sem acento e em minúsculas, para a busca encontrar "mágoa" digitando "magoa". */
export const normalize = (value: string) =>
  value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

function haystack(message: CommMessage) {
  return normalize(
    [
      message.title,
      message.goal,
      message.context,
      message.text,
      categoryById(message.category).label,
      ...message.keywords,
    ].join(" "),
  );
}

/** Todas as palavras da busca precisam aparecer (em qualquer campo). Busca vazia encontra tudo. */
export function matchesQuery(message: CommMessage, query: string) {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  if (terms.length === 0) return true;
  const text = haystack(message);
  return terms.every((term) => text.includes(term));
}

export const EMPTY_FILTERS: CommFilters = {
  query: "",
  category: "todas",
  scenario: "todos",
  onlyUsable: false,
  onlyFavorites: false,
};

const rank: Record<CommAvailability, number> = {
  recomendado: 0,
  permitido: 1,
  so_resposta: 2,
  educativo: 3,
  nao_agora: 4,
};

/**
 * Lista filtrada. Ordem: categoria (ordem da biblioteca); dentro dela, o que serve ao momento
 * dela primeiro. O filtro de cenário mostra o que foi pensado para aquele cenário; a
 * disponibilidade continua sendo a do momento dela (filtrar não libera nada).
 */
export function filterMessages(
  ctx: CommContext,
  filters: CommFilters,
  favorites: Record<string, string> = {},
  messages: CommMessage[] = commMessages,
): CommMessage[] {
  const order = commCategories.map((item) => item.id);
  return messages
    .filter(
      (message) =>
        (filters.category === "todas" || message.category === filters.category) &&
        (filters.scenario === "todos" ||
          message.scenarios === "all" ||
          message.scenarios.includes(filters.scenario)) &&
        (!filters.onlyUsable || canSend(availabilityOf(message, ctx))) &&
        (!filters.onlyFavorites || Boolean(favorites[message.id])) &&
        matchesQuery(message, filters.query),
    )
    .sort(
      (a, b) =>
        order.indexOf(a.category) - order.indexOf(b.category) ||
        rank[availabilityOf(a, ctx)] - rank[availabilityOf(b, ctx)],
    );
}

/** Quantos conteúdos cada categoria tem (para os filtros). */
export const countByCategory = (messages: CommMessage[] = commMessages) =>
  Object.fromEntries(
    commCategories.map((category) => [
      category.id,
      messages.filter((item) => item.category === category.id).length,
    ]),
  ) as Record<CommCategoryId, number>;

/**
 * Destaques do topo ("Para o seu momento"). Com limite, pausa ou espaço, nunca destaca algo para
 * ela começar: só reflexões, respostas possíveis (pausa e espaço) e um exemplo do que evitar.
 */
export function highlightsFor(ctx: CommContext, max = 4): CommMessage[] {
  const byFocus = (items: CommMessage[]) =>
    [...items].sort((a, b) => {
      const ia = ctx.focus.indexOf(a.category);
      const ib = ctx.focus.indexOf(b.category);
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    });
  const reflections = commMessages.filter(
    (item) => item.kind === "reflexao" && fitsScenario(item, ctx.scenario),
  );
  const avoid = (id: string) => commMessages.filter((item) => item.id === id);

  if (ctx.stance === "limite")
    return [
      ...reflections.filter((item) => item.category === "sem_resposta"),
      ...avoid("evit-terceiros"),
    ].slice(0, max);
  if (ctx.stance === "pausa" || ctx.stance === "espaco") {
    const replies = byFocus(
      commMessages.filter((item) => availabilityOf(item, ctx) === "so_resposta"),
    );
    return [
      ...reflections.filter((item) => item.category === "sem_resposta").slice(0, 1),
      ...avoid("evit-cobranca"),
      ...replies.slice(0, 2),
    ].slice(0, max);
  }
  const usable = byFocus(
    commMessages.filter((item) => {
      const status = availabilityOf(item, ctx);
      return ctx.stance === "sem_diagnostico" ? status === "permitido" : status === "recomendado";
    }),
  );
  // Um por categoria antes de repetir, para o destaque mostrar variedade.
  const seen = new Set<CommCategoryId>();
  const first = usable.filter((item) => !seen.has(item.category) && seen.add(item.category));
  const rest = usable.filter((item) => !first.includes(item));
  return [...first, ...rest].slice(0, max);
}

/** Conteúdos relacionados (os declarados, depois a alternativa). */
export function relatedOf(message: CommMessage): CommMessage[] {
  return list(...(message.related ?? []), message.alternative)
    .map((id) => messageById(id))
    .filter((item): item is CommMessage => Boolean(item) && item!.id !== message.id);
}
