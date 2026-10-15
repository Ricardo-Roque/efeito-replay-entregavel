// Modelos da evolução do entregável: diagnóstico de entrada, primeiras 48 horas e central de
// mensagens. Arquitetura e decisões em docs/evolucao-entregavel.md.
//
// Tudo aqui é dado do aparelho (localStorage, separado por e-mail), como o Diário e o Reset.
// Nenhum destes tipos corresponde a tabela no Supabase: banco, RLS e sincronização ficam de fora.

import type { CommCategoryId } from "@/lib/comunicacao/types";
import type { ScenarioId } from "@/lib/scenarios";

// ---------- Conteúdo ----------

/**
 * Situação de cada texto. O app atual inteiro é "rascunho" (vai para clientes, mas ainda pede
 * revisão). "aguardando_material" é conteúdo prometido na VSL cuja definição ainda não recebemos:
 * nunca aparece para a cliente.
 */
export type ContentStatus = "rascunho" | "aprovado" | "aguardando_material";

/**
 * O quanto o contato com ele é permitido, a regra de segurança de toda a jornada.
 * - sem_contato: bloqueou, pediu para não haver contato ou está com outra pessoa. Nenhuma mensagem.
 * - pausa: pediu tempo, ou ela está em crise. Só ferramentas de autocuidado e rascunhos na Pausa.
 * - aberto: há conversa possível. Modelos liberados, sempre passando pela Pausa antes de enviar.
 */
export type ContactMode = "sem_contato" | "pausa" | "aberto";

// ---------- Diagnóstico ----------

/** 1. Há quanto tempo ocorreu o término. */
export type Elapsed = "menos7d" | "d7a30" | "m1a3" | "m3a6" | "mais6m";
/** 2. Como está o contato hoje. */
export type ContactStatus =
  "normal" | "frio" | "raro" | "nao_responde" | "bloqueou" | "pediu_tempo" | "pediu_sem_contato";
/** 3. Principal motivo do término. */
export type BreakupReason =
  "discussoes" | "distanciamento" | "quebra_confianca" | "traicao" | "incompatibilidade" | "outro";
/** 4. Se ele está se envolvendo com outra pessoa. */
export type OtherPerson = "sim" | "nao" | "nao_sei";
/** 5. O que ela já tentou (seleção múltipla; "nada" exclui as demais). */
export type TriedAction =
  "mensagens" | "nova_chance" | "contato_zero" | "pessoalmente" | "desculpas" | "nada";
/** 6. Principal dificuldade dela agora. */
export type Difficulty =
  | "ansiedade"
  | "se_contato"
  | "o_que_dizer"
  | "interpretar"
  | "frieza"
  | "confianca"
  | "afastamento";

export interface DiagnosisAnswers {
  elapsed: Elapsed;
  contact: ContactStatus;
  reason: BreakupReason;
  otherPerson: OtherPerson;
  /** Pelo menos um item. */
  tried: TriedAction[];
  difficulty: Difficulty;
}

export type DiagnosisQuestionId = keyof DiagnosisAnswers;

export interface DiagnosisOption {
  value: string;
  label: string;
  /** Na seleção múltipla, marcar esta opção desmarca as outras (ex.: "Ainda não tentei nada"). */
  exclusive?: boolean;
}

export interface DiagnosisQuestion {
  id: DiagnosisQuestionId;
  title: string;
  hint?: string;
  multiple?: boolean;
  options: DiagnosisOption[];
}

/** Uma vez respondido, guardado com a versão das perguntas para migrar se elas mudarem. */
export interface DiagnosisRecord {
  id: string;
  /** ISO */
  at: string;
  /** Igual a DIAGNOSIS_VERSION (lib/jornada/diagnosis.ts). Registros de outra versão são descartados. */
  version: 2;
  answers: DiagnosisAnswers;
}

/** Respostas de um diagnóstico em andamento, para continuar de onde parou se o app fechar. */
export interface DiagnosisDraft {
  /** ISO da última alteração. */
  at: string;
  step: number;
  answers: Partial<DiagnosisAnswers>;
}

/** Foco que o diagnóstico prioriza; vira ordem dos cards e das categorias de mensagem. */
export type Focus =
  | "estabilizar"
  | "respeitar_limite"
  | "silencio"
  | "frieza"
  | "ressentimento"
  | "confianca"
  | "responder_contato"
  | "reaproximacao";

/**
 * Principal ponto de atenção, escolhido por prioridade (ver attentionOf em diagnosis.ts).
 * Os limites dele (bloqueio, pedido de não contato, outra relação, pedido de tempo) vêm sempre
 * antes de qualquer orientação de comunicação.
 */
export type AttentionId =
  | "bloqueio"
  | "pedido_sem_contato"
  | "outra_relacao"
  | "pedido_tempo"
  | "insistencia"
  | "termino_recente"
  | "confianca"
  | "silencio"
  | "frieza"
  | "conversa_aberta";

/** Para onde o primeiro passo leva. Só destinos que já existem no app. */
export type StepTarget =
  "pause" | "diary" | "rules" | "signals" | "never" | "scenario" | "plan" | "care";

export interface FirstStep {
  title: string;
  text: string;
  target: StepTarget;
  /** Texto do botão. */
  action: string;
}

/** Saída do diagnóstico ("Meu Mapa de Reconquista"). Sai de regras explícitas, nunca de sorteio. */
export interface DiagnosisResult {
  contactMode: ContactMode;
  /** Cenário sugerido. Só vira o cenário do perfil quando ela confirma (setScenario do store). */
  scenario: ScenarioId;
  /** Por que esse cenário, quando o nome dele não descreve exatamente a resposta dela. */
  scenarioNote?: string;
  /** Do mais para o menos urgente. */
  focus: Focus[];
  /** Mostrar a rede de apoio (CVV 188, 180) em destaque. */
  showCareLines: boolean;
  /** Nome curto da situação, para o cartão do Início. */
  headline: string;
  /** Resumo da situação, frase a frase, a partir das respostas. */
  summary: string[];
  attention: { id: AttentionId; title: string; text: string };
  doNow: string[];
  avoid: string[];
  firstStep: FirstStep;
}

// ---------- Meu Plano de 48 Horas ----------

/** Etapa A: primeiras 24 horas. Etapa B: de 24 a 48 horas. Sugestão de ritmo, nunca trava. */
export type First48StageId = "a" | "b";

export type First48ActivityId = "entender" | "interromper" | "preparar" | "escolher" | "organizar";

/**
 * Caminho do próximo passo, derivado do diagnóstico (pathOf em first48.ts):
 * - limite: bloqueio, pedido de não contato ou outra relação. Nada envolve contato.
 * - pausa: ele pediu um tempo. Nada envolve contato enquanto durar.
 * - espaco: sem reciprocidade (não responde ou padrão de insistência). Dar espaço, sem envio.
 * - conversa: há conversa e ela é bem-vinda. Orientações, exemplos e critérios para decidir.
 */
export type First48Path = "limite" | "pausa" | "espaco" | "conversa";

/** Escolhas da atividade 4. As de contato ("responder", "puxar") só existem no caminho conversa. */
export type First48ChoiceId =
  "responder" | "puxar" | "esperar" | "parar" | "respeitar" | "diario" | "cuidar";

/** Destinos que as atividades abrem: só ferramentas que já existem no app. */
export type First48Tool = Exclude<StepTarget, "care"> | "map";

export interface First48Stage {
  id: First48StageId;
  title: string;
  /** Horas desde o início do plano em que a etapa é sugerida: [from, to). */
  from: number;
  to: number;
  objective: string;
}

/** Bloco curto de conteúdo. `tone` define o ícone dos itens (fazer, evitar, observar, informar). */
export interface First48Block {
  id: string;
  title: string;
  tone: "do" | "avoid" | "watch" | "info";
  items: string[];
  /** Destaque visual (ex.: o padrão mais importante para ela). */
  highlight?: boolean;
}

export interface First48CheckItem {
  /** Estável entre diagnósticos: "<atividade>:<item>". */
  id: string;
  text: string;
}

export interface First48ToolLink {
  tool: First48Tool;
  label: string;
}

export interface First48Choice {
  id: First48ChoiceId;
  label: string;
  text: string;
  /** Para onde ir depois de escolher. */
  next: First48ToolLink;
}

export interface First48Activity {
  id: First48ActivityId;
  stage: First48StageId;
  /** 1 a 5. */
  n: number;
  title: string;
  goal: string;
  minutes: number;
  blocks: First48Block[];
  checklist: First48CheckItem[];
  tools: First48ToolLink[];
}

/** Atividade 3: exercício guiado e perguntas de reflexão que vão para o Diário. */
export interface First48Exercise {
  steps: string[];
  prompts: string[];
}

/** Atividade 4: caminhos possíveis e, só no caminho conversa, exemplos e critérios. */
export interface First48NextStep {
  path: First48Path;
  intro: string;
  choices: First48Choice[];
  /** ids de MessageTemplate (lib/jornada/messages.ts). Vazio fora do caminho conversa. */
  examples: string[];
  /** Critérios para decidir se vale conversar. Vazio fora do caminho conversa. */
  criteria: string[];
}

/** O plano inteiro, montado a partir das respostas. Calculado, nunca gravado. */
export interface First48Plan {
  diagnosisId: string;
  path: First48Path;
  activities: First48Activity[];
  exercise: First48Exercise;
  nextStep: First48NextStep;
}

/** Conclusão de uma atividade, com o diagnóstico que valia quando ela concluiu. */
export interface First48Done {
  at: string;
  diagnosisId: string;
}

export interface First48State {
  /** ISO de quando ela abriu o plano pela primeira vez. Ausente = não abriu. */
  startedAt?: string;
  /** Atividades concluídas. Refazer o diagnóstico nunca apaga. */
  done: Partial<Record<First48ActivityId, First48Done>>;
  /** Itens de checklist marcados: id -> ISO. */
  checks: Record<string, string>;
  /** Caminho escolhido na atividade 4. */
  choice?: { id: First48ChoiceId; at: string; diagnosisId: string };
  /** ISO de quando concluiu as 5 atividades pela primeira vez. */
  completedAt?: string;
}

// ---------- Central de mensagens ----------

/** Categorias da Central de Comunicação (lib/comunicacao/library.ts). */
export type MessageCategory = CommCategoryId;

/** Técnicas citadas na VSL e desenvolvidas editorialmente para o aplicativo. */
export type VslTechniqueId =
  | "tres_palavras"
  | "comeca_com_h"
  | "pensando_aqui"
  | "frase_3"
  | "frase_replay"
  | "buraco_negro"
  | "tecnica_noturna";

export type VslTechniqueKind = "message" | "practice";

export interface VslTechnique {
  id: VslTechniqueId;
  /** Nome como aparece na VSL. */
  vslName: string;
  status: ContentStatus;
  /** Nome curto para o atalho no Início. */
  shortName: string;
  kind: VslTechniqueKind;
  /** Quem inicia o contato. Ausente nas práticas sem mensagem. */
  initiative?: "dela" | "resposta";
  purpose: string;
  whenToUse: string[];
  whenToAvoid: string[];
  /** Texto exato das técnicas de mensagem. */
  message?: string;
  /** Como preencher ou usar a mensagem sem mudar sua intenção. */
  customization?: string[];
  /** Passos das técnicas práticas. */
  steps?: string[];
  ifReply?: string[];
  ifNoReply?: string[];
  limits: string;
  /** Transparência editorial: estes textos foram criados para o app. */
  note: string;
}

export interface MessageTemplate {
  id: string;
  category: MessageCategory;
  title: string;
  text: string;
  whenToUse: string;
  avoidIf: string[];
  /** "all" = qualquer cenário com contato aberto. */
  scenarios: ScenarioId[] | "all";
  /** Modos em que pode aparecer. Nunca inclui "sem_contato". */
  contactModes: Exclude<ContactMode, "sem_contato">[];
  technique?: VslTechniqueId;
  status: ContentStatus;
  /** Origem: modelo da Central (lib/comunicacao). Os cenários apontam para eles por id. */
  source: "central";
}

export interface MessagesState {
  /** id do modelo -> ISO de quando favoritou. */
  favorites: Record<string, string>;
  /** id do modelo -> ISO da última vez que copiou ou levou para a Pausa. */
  usedAt: Record<string, string>;
}

// ---------- Persistência ----------

export interface JornadaData {
  version: 1;
  /** Histórico; o último é o atual. */
  diagnoses: DiagnosisRecord[];
  /** Diagnóstico começado e ainda não concluído. Opcional: ausente em quem nunca começou. */
  diagnosisDraft?: DiagnosisDraft;
  first48: First48State;
  messages: MessagesState;
  /** Checklist do plano de 21 dias. Opcional: ausente em quem nunca marcou nada. */
  plan?: PlanChecksState;
}

/**
 * Itens marcados no checklist dos dias (id do item, ISO de quando marcou). Os dias concluídos
 * continuam na chave principal (AppData.completed): marcar ou desmarcar aqui não muda o progresso.
 */
export interface PlanChecksState {
  checks: Record<string, string>;
}
