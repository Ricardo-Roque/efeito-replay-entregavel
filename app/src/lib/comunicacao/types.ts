// Central de Comunicação: modelos de conteúdo. Os dados ficam em library.ts e as regras puras em
// rules.ts; as telas (components/comunicacao) só leem. Para acrescentar uma mensagem, basta um item
// novo em library.ts: a interface não precisa mudar.

import type { ContentStatus } from "@/lib/jornada/types";
import type { ScenarioId } from "@/lib/scenarios";

export type CommCategoryId =
  | "primeiro_contato"
  | "frio"
  | "saudade"
  | "sem_resposta"
  | "ressentimento"
  | "confianca"
  | "perguntas"
  | "convites"
  | "reencontro"
  | "evitar";

export interface CommCategory {
  id: CommCategoryId;
  label: string;
  /** Uma linha explicando o que a categoria cobre. */
  description: string;
}

/**
 * Tipo do conteúdo:
 * - modelo: texto que ela poderia enviar, se o momento dela permitir (ver rules.ts).
 * - reflexao: texto para ficar com ela (Diário). Nunca é para enviar.
 * - evitar: exemplo do que não mandar, com o porquê. Nunca é copiável.
 */
export type CommKind = "modelo" | "reflexao" | "evitar";

/**
 * Quem começa a conversa.
 * - dela: ela puxa o assunto. Só faz sentido quando há conversa e reciprocidade.
 * - resposta: ele escreveu primeiro e ela responde.
 */
export type CommInitiative = "dela" | "resposta";

/**
 * O momento dela, que decide o que pode ser sugerido. Igual ao caminho das 48 horas (pathOf),
 * mais "sem_diagnostico" para quem ainda não respondeu e não escolheu um cenário de limite.
 * - limite: bloqueio, pedido de não contato ou outra relação. Nenhum envio é sugerido.
 * - pausa: ele pediu um tempo. Nada de iniciativa dela; responder, só se ele escrever.
 * - espaco: sem reciprocidade. Nada de iniciativa dela; responder, só se ele escrever.
 * - conversa: há conversa. Modelos liberados, sempre com a Pausa antes de enviar.
 */
export type CommStance = "limite" | "pausa" | "espaco" | "conversa" | "sem_diagnostico";

/** Cenário dela para a Central: o momento e o cenário usado para destacar conteúdos. */
export interface CommContext {
  stance: CommStance;
  /** Cenário do perfil, ou o sugerido pelo diagnóstico. */
  scenario: ScenarioId | null;
  /** Categorias em destaque, da mais para a menos ligada ao diagnóstico. */
  focus: CommCategoryId[];
}

export interface CommMessage {
  /** Estável: favoritos e uso ficam gravados por id. Nunca reaproveitar um id removido. */
  id: string;
  title: string;
  category: CommCategoryId;
  kind: CommKind;
  initiative: CommInitiative;
  /** Situações compatíveis. "all" = qualquer cenário em que o momento dela permita. */
  scenarios: ScenarioId[] | "all";
  /** O que esta mensagem pretende comunicar (uma frase). */
  goal: string;
  /** Explicação do contexto em que ela foi pensada. */
  context: string;
  /** Texto ilustrativo. */
  text: string;
  /** Por que este tom. */
  whyTone: string;
  whenToUse: string[];
  whenToAvoid: string[];
  ifReply: string[];
  ifNoReply: string[];
  /** Orientação sobre limites. */
  limits: string;
  /** Pode ser copiado quando o momento permitir. Falso para reflexões e exemplos a evitar. */
  copyable: boolean;
  /** Palavras extras para a busca (sinônimos, expressões que ela digitaria). */
  keywords: string[];
  /** Para conteúdos "evitar": o modelo que cumpre o mesmo papel sem o risco. */
  alternative?: string;
  related?: string[];
  status: ContentStatus;
  /**
   * Origem. Todos os textos atuais são exemplos novos, escritos para o app. Nenhum reproduz as
   * técnicas citadas na VSL, que seguem aguardando material (docs/pendencias-central-comunicacao.md).
   */
  origin: "exemplo_novo";
}

/**
 * Situação do conteúdo para o momento dela:
 * - recomendado: pode usar e combina com o diagnóstico.
 * - permitido: pode usar, com os cuidados de sempre.
 * - so_resposta: só se ele escrever primeiro.
 * - nao_agora: o momento dela pede não enviar. Fica como leitura.
 * - educativo: reflexão ou exemplo a evitar. Nunca é para enviar.
 */
export type CommAvailability =
  "recomendado" | "permitido" | "so_resposta" | "nao_agora" | "educativo";

export interface CommFilters {
  query: string;
  category: CommCategoryId | "todas";
  scenario: ScenarioId | "todos";
  /** Só o que pode ser usado no momento dela. */
  onlyUsable: boolean;
  onlyFavorites: boolean;
}

// ---------- "Ele respondeu. E agora?" ----------
// Assistente por regras (sem IA): ela escolhe o que aconteceu, responde no máximo uma pergunta de
// refinamento e vê um resultado montado a partir de conteúdo fixo (reply.ts). O momento dela
// (CommStance) é aplicado por cima: com limite, nada vira mensagem.

export type ReplySituationId =
  | "frio"
  | "saudade"
  | "pergunta"
  | "magoa"
  | "raiva"
  | "conversar"
  | "encontro"
  | "visualizou"
  | "parar"
  | "outra_pessoa";

/** Uma orientação e o porquê dela. */
export interface ReplyPoint {
  text: string;
  why: string;
  /** O passo é registrar o limite no diagnóstico (some quando o limite já está registrado). */
  registers?: true;
}

export interface ReplyAlert {
  /** "stop": não seguir com contato. "care": cuidado extra. */
  tone: "stop" | "care";
  title: string;
  text: string;
}

/**
 * Destinos dos botões. Só ferramentas que já existem no app.
 * - pause_example: leva o exemplo para a Pausa. Só aparece se o momento dela permitir enviar.
 * - pause: Pausa em branco (escrever sem enviar também conta).
 * - diary: registra no Diário o que aconteceu e o passo escolhido.
 * - register_limit: grava no diagnóstico o limite que ele colocou (ver ReplyOutcome.limit).
 */
export type ReplyActionTarget =
  | "pause_example"
  | "pause"
  | "diary"
  | "central"
  | "scenario"
  | "day"
  | "diagnosis"
  | "register_limit"
  | "signals";

export interface ReplyAction {
  target: ReplyActionTarget;
  label: string;
  /** Uma linha: por que este passo. */
  text: string;
  category?: CommCategoryId;
  scenario?: ScenarioId;
  day?: number;
}

/** Limites que ela pode registrar no diagnóstico a partir do assistente. */
export type ReplyLimit = "pediu_sem_contato" | "outra_relacao";

/**
 * Se responder faz sentido neste caminho:
 * - sim: há abertura; um exemplo ajuda.
 * - opcional: responder pouco ou não responder são escolhas válidas.
 * - nao: nenhuma mensagem é sugerida.
 */
export type ReplyRespond = "sim" | "opcional" | "nao";

export interface ReplyExample {
  /** Mensagem ilustrativa dele (nunca é dele de verdade: só situa o exemplo). */
  him: string;
  /** id de um modelo da Central (library.ts). O texto da resposta vem de lá. */
  replyId: string;
  /** Por que essa resposta funciona aqui. */
  note: string;
}

export interface ReplyOutcome {
  /** O caminho em uma frase. */
  title: string;
  respond: ReplyRespond;
  /** Leitura extra deste caminho, além da leitura da situação. */
  reading?: string[];
  doNow: ReplyPoint[];
  avoid: ReplyPoint[];
  example?: ReplyExample;
  alerts?: ReplyAlert[];
  /** Mostra a rede de apoio (CVV 188, 180) em destaque. */
  care?: boolean;
  /** Limite que ela pode registrar no diagnóstico. */
  limit?: ReplyLimit;
  /** Próximo passo em destaque. */
  next: ReplyAction;
  /** Outros passos possíveis, em ordem. */
  more: ReplyAction[];
  /** Outros conteúdos da Central (ids). */
  related: string[];
}

export interface ReplyQuestion {
  text: string;
  hint?: string;
  options: { id: string; label: string }[];
}

export interface ReplySituation {
  id: ReplySituationId;
  /** Como aparece na pergunta "O que aconteceu depois da última mensagem?". */
  label: string;
  /** Título do resultado. */
  title: string;
  /** Uma linha abaixo da opção. */
  hint: string;
  /** Interpretação cuidadosa: o que pode estar acontecendo, sem afirmar o que ele pensa. */
  reading: string[];
  /** Pergunta de refinamento. Sem ela, o resultado é outcomes.padrao. */
  question?: ReplyQuestion;
  /** Um resultado por opção da pergunta, ou só "padrao". */
  outcomes: Record<string, ReplyOutcome>;
  /** Categoria da Central ligada à situação. */
  category: CommCategoryId;
  /** Ele escreveu (true) ou a situação é o silêncio dele (false). */
  heWrote: boolean;
  status: ContentStatus;
}

/** Resultado já ajustado ao momento dela (resolveReply em reply.ts). */
export interface ResolvedReply {
  situation: ReplySituation;
  /** Opção escolhida na pergunta, ou "padrao". */
  option: string;
  title: string;
  respond: ReplyRespond;
  reading: string[];
  doNow: ReplyPoint[];
  avoid: ReplyPoint[];
  example: {
    him: string;
    message: CommMessage;
    note: string;
    /** Pode ir para a Pausa no momento dela (mesma regra da Central). */
    sendable: boolean;
    /** Por que não é para agora, quando não for. */
    caution: string | null;
  } | null;
  alerts: ReplyAlert[];
  care: boolean;
  limit: ReplyLimit | null;
  next: ReplyAction;
  more: ReplyAction[];
  related: CommMessage[];
}
