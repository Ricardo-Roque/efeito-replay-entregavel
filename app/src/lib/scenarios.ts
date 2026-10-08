// Os 6 cenários (equivalente às situações do Calm Kids). RASCUNHO de conteúdo.
// safety: bloqueio e outra pessoa mostram o alerta, não têm modelos de mensagem e a Pausa
// responde "não envie" (bloqueio) ou avisa que o plano não sugere mensagens (outra pessoa).
// Os modelos de mensagem são o "banco de respostas por cenário": pontos de partida curtos e leves,
// sempre passando pela Pausa. Nenhum promete efeito sobre ele.

import type { EmojiName } from "@/lib/illustrations";

export type ScenarioId = "bloqueou" | "frio" | "outra" | "desinteresse" | "respondeu" | "encontro";

export interface Scenario {
  id: ScenarioId;
  label: string;
  short: string;
  emoji: EmojiName;
  /** Fundo do tile (mesmo papel dos tints do Calm Kids). */
  tint: "rose" | "honey" | "sage" | "lavender";
  description: string;
  safety?: "block" | "other";
  alert?: string;
  do: string[];
  avoid: string[];
  messages: string[];
  noMessages?: string;
  stop: string;
  days: number[];
}

export const scenarios: Scenario[] = [
  {
    id: "bloqueou",
    emoji: "bloqueou",
    tint: "rose",
    label: "Ele me bloqueou",
    short: "Um limite que pede respeito",
    description:
      "O bloqueio costuma ser uma barreira emocional. Seja qual for o motivo, é um limite que ele colocou, e o seu plano agora é cuidar de você.",
    safety: "block",
    alert:
      "Respeite o bloqueio. Não use outros perfis, números, amigos ou familiares para chegar até ele, e não apareça onde ele está.",
    do: [
      "Respeitar o limite",
      "Investir em você durante os 21 dias",
      "Escrever no Diário o que você queria dizer",
    ],
    avoid: [
      "Criar outro perfil ou número",
      "Mandar recado por terceiros",
      "Checar se ele desbloqueou",
    ],
    messages: [],
    noMessages: "Aqui não existe mensagem para enviar. O seu trabalho é o Reset emocional.",
    stop: "Se o bloqueio continuar, essa é a resposta dele. Seguir o plano continua valendo, por você.",
    days: [2, 3, 4, 5],
  },
  {
    id: "frio",
    emoji: "frio",
    tint: "lavender",
    label: "Ele está frio e distante",
    short: "Mudar o clima muda a resposta",
    description:
      "A frieza costuma aparecer quando a conversa virou fonte de cobrança. Mudar o clima muda a resposta.",
    do: [
      "Respostas curtas e leves",
      "Assuntos neutros e agradáveis",
      "Dar espaço entre as mensagens",
    ],
    avoid: [
      "Reclamar da frieza",
      "Insistir em conversar sobre o término",
      "Perguntar o que ele sente",
    ],
    messages: [
      "Lembrei de uma coisa engraçada de quando a gente foi àquele show. Espero que você esteja bem.",
      "Passando só para desejar uma boa semana.",
    ],
    stop: 'Se ele pedir para você parar, agradeça e pare. Um "não" também é resposta.',
    days: [8, 9, 10, 11],
  },
  {
    id: "outra",
    emoji: "outra",
    tint: "rose",
    label: "Ele está com outra pessoa",
    short: "Sem disputa, sem comparação",
    description:
      "Um novo envolvimento muda o cenário. Comparação e disputa só aumentam a distância e machucam você.",
    safety: "other",
    alert:
      "Ele está em outra relação. Não procure a outra pessoa, não compare e não mande mensagens para testar.",
    do: [
      "Cuidar da sua vida e de quem está perto",
      "Silenciar perfis se isso te ajudar",
      "Seguir o Reset emocional",
    ],
    avoid: ["Competir ou comparar", "Criticar a outra pessoa", "Mandar mensagem para testar"],
    messages: [],
    noMessages: "Enquanto ele estiver em outra relação, o plano não sugere mensagens.",
    stop: "Quem se mantém inteira não precisa disputar.",
    days: [3, 4, 6],
  },
  {
    id: "desinteresse",
    emoji: "desinteresse",
    tint: "honey",
    label: "Ele perdeu o interesse",
    short: "Novidade, não insistência",
    description:
      "Quando o interesse diminui, insistir costuma afastar mais. O que muda o quadro é uma mudança real no seu jeito de estar presente.",
    do: [
      "Parar de repetir o mesmo padrão",
      "Viver uma rotina mais leve, por você",
      "Se houver conversa, trazer algo novo",
    ],
    avoid: ["Cobrar atenção", "Mandar várias mensagens seguidas", "Explicar a relação de novo"],
    messages: ["Vi algo hoje que me lembrou de você. Fiquei com um sorriso aqui."],
    stop: "Mudança percebida vale mais que mil explicações. Se ele não responder, não insista.",
    days: [6, 8, 12],
  },
  {
    id: "respondeu",
    emoji: "respondeu",
    tint: "sage",
    label: "Ele respondeu",
    short: "Leve, curta, sem peso",
    description:
      "Quando ele responde, o objetivo não é resolver o passado. É criar uma experiência boa de falar com você.",
    do: ["Responder leve e curto", "Encerrar antes de ele cansar", "Observar os sinais no Diário"],
    avoid: [
      "Resolver o passado agora",
      "Transformar em conversa sobre a relação",
      "Cobrar a demora da resposta",
    ],
    messages: [
      "Tudo ótimo por aqui! E por aí?",
      "Que bom falar com você. Preciso ir agora, depois a gente se fala.",
    ],
    stop: "Se a conversa esfriar ou ele pedir espaço, respeite e volte ao seu ritmo.",
    days: [14, 15, 16],
  },
  {
    id: "encontro",
    emoji: "encontro",
    tint: "honey",
    label: "Quero chamar para um encontro",
    short: "Convite leve, sem cobrança",
    description:
      "Quando a conversa flui e ele mostra sinais de abertura, um convite simples abre a porta. Sem dramas, sem cobranças.",
    do: [
      "Convidar com leveza, num lugar público",
      "Deixar claro que tudo bem se não der",
      "Aceitar a resposta, qualquer que seja",
    ],
    avoid: [
      'Ultimatos e "última chance"',
      "Insistir depois de um não",
      "Transformar o encontro em DR",
    ],
    messages: [
      "Fui àquele café que você gosta e lembrei de você. Quer tomar um qualquer dia desses?",
    ],
    stop: "Se ele recusar, agradeça e encerre com leveza. Recusa não é convite para insistir.",
    days: [19, 20, 21],
  },
];

export const scenarioById = (id: ScenarioId) => scenarios.find((item) => item.id === id)!;
