// Conteúdo do plano de 21 dias. RASCUNHO: texto escrito a partir do PDF do protocolo, ainda precisa
// de revisão antes de ir para clientes. Mesmo formato do plan.ts do CalmBaby (dado, não HTML).
//
// Regras de conteúdo: nada de contornar bloqueio, usar terceiros, insistir ou pressionar.
// "Não" e pedido de distância são respostas. Nenhuma promessa de que ele volta.

import type { EmojiName, Pose } from "@/lib/illustrations";

/** Ferramenta que o dia abre (como o PlanTool do CalmBaby). */
export type PlanTool = "pause" | "diary" | "rules";

export interface PlanPhase {
  phase: 1 | 2 | 3 | 4;
  numeral: string;
  title: string;
  first: number;
  last: number;
  objective: string;
  goal: string;
  /** Emoji 3D da fase (papel das poses do Calminho por semana no Calm Kids). */
  emoji: EmojiName;
  /** Pose da protagonista na Home e no cabeçalho do Plano. */
  pose: Pose;
}

export interface PlanDay {
  day: number;
  phase: PlanPhase["phase"];
  title: string;
  minutes: number;
  lesson: string[];
  action: string;
  checklist: string[];
  tool?: PlanTool;
}

export const planPhases: PlanPhase[] = [
  {
    phase: 1,
    numeral: "I",
    title: "Reset emocional",
    first: 1,
    last: 7,
    objective: "Sair do modo reação antes de qualquer mensagem.",
    goal: "7 dias sem agir por impulso",
    emoji: "fase1",
    pose: "respirando",
  },
  {
    phase: 2,
    numeral: "II",
    title: "Nova comunicação",
    first: 8,
    last: 13,
    objective: "Menos explicação, mais presença. Menos pedido, mais leveza.",
    goal: "Uma mensagem curta, leve e aberta, sem esperar resposta",
    emoji: "fase2",
    pose: "sorrindoCelular",
  },
  {
    phase: 3,
    numeral: "III",
    title: "Reconexão",
    first: 14,
    last: 18,
    objective: "Quando ele responde, criar uma experiência boa de falar com você.",
    goal: "Conversas leves que terminam antes de cansar",
    emoji: "fase3",
    pose: "neutra",
  },
  {
    phase: 4,
    numeral: "IV",
    title: "Do contato ao reencontro",
    first: 19,
    last: 21,
    objective: "Um convite simples, só quando a conversa flui. Aceitar qualquer resposta.",
    goal: "Convidar sem pressão, ou decidir que ainda não é hora",
    emoji: "fase4",
    pose: "indoCafe",
  },
];

export const planDays: PlanDay[] = [
  // Fase 1 · Reset emocional
  {
    day: 1,
    phase: 1,
    title: "Seu ponto de partida",
    minutes: 3,
    lesson: [
      "Este protocolo não é sobre manipular ninguém. É sobre mudar a sua forma de agir e de se comunicar, para que a conexão volte a ser possível.",
      "Cada fase prepara a seguinte. Pular etapas é o motivo mais comum de a reaproximação não funcionar. Um dia por vez.",
    ],
    action: "Faça o seu primeiro registro no Diário: como você está hoje, sem filtro.",
    checklist: [
      "Conferir o meu cenário",
      "Fazer o primeiro registro no Diário",
      "Reler o meu compromisso",
    ],
    tool: "diary",
  },
  {
    day: 2,
    phase: 1,
    title: "Sair do modo reação",
    minutes: 3,
    lesson: [
      "Quando a vontade de escrever vem forte, ela quase sempre vem de um pico de ansiedade, não de uma decisão. Agir nesse pico é o que mais afasta.",
      "Hoje você só vai aprender a reconhecer esse pico. Respirar antes de abrir a conversa já muda o que acontece depois.",
    ],
    action:
      "Na próxima vez que sentir vontade de mandar mensagem, abra a Pausa antes de enviar e escreva lá, não no WhatsApp.",
    checklist: [
      "Fazer 5 respirações lentas antes de pegar o celular",
      "Usar a Pausa se a vontade aparecer",
      "Registrar no Diário como foi",
    ],
    tool: "pause",
  },
  {
    day: 3,
    phase: 1,
    title: "Contato zero consciente",
    minutes: 3,
    lesson: [
      "Contato zero aqui não é jogo nem castigo. É um tempo para você sair do modo reação e recuperar o seu centro.",
      "Se vocês precisam falar de algo prático (filhos, contas, objetos), responda só o necessário, com educação e sem abrir outros assuntos.",
    ],
    action:
      "Decida por quanto tempo você não vai iniciar conversa. A sugestão é até o fim desta fase.",
    checklist: [
      "Escolher o meu prazo",
      "Anotar no Diário o motivo",
      "Definir como responder assuntos práticos",
    ],
    tool: "diary",
  },
  {
    day: 4,
    phase: 1,
    title: "Parar de checar o perfil dele",
    minutes: 2,
    lesson: [
      "Cada vez que você olha o perfil dele, a ansiedade volta para o começo. Stories, horários e curtidas viram interpretação, e nada disso te ajuda a agir melhor.",
      "Silenciar não é bloquear nem um recado para ele. É só uma proteção para você.",
    ],
    action:
      "Silencie hoje os stories e as publicações dele. Se precisar, silencie também os perfis que te levam até ele.",
    checklist: [
      "Silenciar stories e publicações",
      "Tirar a conversa dele dos fixados",
      "Registrar quando a vontade de olhar aparecer",
    ],
  },
  {
    day: 5,
    phase: 1,
    title: "Um plano para as horas vulneráveis",
    minutes: 3,
    lesson: [
      "Quase todo mundo tem horários em que a saudade aperta: antes de dormir, no fim de semana, depois de beber.",
      "Saber quais são os seus permite se preparar antes, em vez de reagir na hora. Mensagem de madrugada quase sempre é impulso.",
    ],
    action:
      "Escolha as suas duas horas mais difíceis e o que você vai fazer nelas: ligar para uma amiga, caminhar, deixar o celular em outro cômodo.",
    checklist: [
      "Identificar as minhas horas vulneráveis",
      "Combinar algo com uma amiga para uma delas",
      "Deixar o celular longe na hora de dormir",
    ],
    tool: "pause",
  },
  {
    day: 6,
    phase: 1,
    title: "Rotina e autocuidado",
    minutes: 2,
    lesson: [
      "Sono, alimentação, movimento e as pessoas que gostam de você são a base de uma comunicação calma. Ninguém escreve bem cansada e sozinha.",
      "Não é sobre mostrar nada para ele. É sobre você voltar a se sentir bem.",
    ],
    action:
      "Escolha uma coisa só para você hoje e faça: uma caminhada, um café com alguém, uma hora sem celular.",
    checklist: [
      "Dormir no meu horário",
      "Fazer uma coisa só para mim",
      "Falar com alguém de confiança",
    ],
  },
  {
    day: 7,
    phase: 1,
    title: "Revisão: 7 dias no seu centro",
    minutes: 3,
    lesson: [
      "Uma semana atrás você começou a sair do modo reação. Olhe o Diário: quantas vezes segurou o impulso? O que ajudou?",
      "Se teve dias difíceis, tudo bem. Recomeçar faz parte. O importante é perceber o que funcionou.",
    ],
    action: "Releia os registros da semana e anote no Diário uma coisa que já mudou em você.",
    checklist: ["Reler o Diário da semana", "Anotar o que funcionou", "Anotar o que ainda pesa"],
    tool: "diary",
  },

  // Fase 2 · Nova comunicação
  {
    day: 8,
    phase: 2,
    title: "Por que menos explica mais",
    minutes: 3,
    lesson: [
      "Depois do término, a vontade é explicar tudo: o que sentiu, o que errou, o que mudou. Só que mensagem longa vira peso para quem lê.",
      "Quanto mais você explica, menos espaço ele tem para sentir falta. A mudança aparece no seu jeito, não no tamanho do texto.",
    ],
    action:
      "Escreva um rascunho na Pausa (ou pegue um antigo) e corte até sobrar uma ou duas linhas.",
    checklist: [
      "Escrever ou reler um rascunho",
      "Cortar até duas linhas",
      "Tirar qualquer cobrança",
    ],
    tool: "pause",
  },
  {
    day: 9,
    phase: 2,
    title: "Curta, leve e aberta",
    minutes: 3,
    lesson: [
      "Uma mensagem nova não explica o passado. Ela mostra, em uma ou duas linhas, que você está bem.",
      "Curta: uma ou duas linhas bastam. Leve: sem peso emocional, sem cobrança. Aberta: deixa espaço para ele responder só se quiser.",
    ],
    action:
      "Escreva um rascunho na Pausa antes de enviar e passe pelo checklist. Hoje você não precisa enviar nada.",
    checklist: [
      "Ler os três critérios",
      "Escrever um rascunho na Pausa",
      "Passar pelo checklist da mensagem",
    ],
    tool: "pause",
  },
  {
    day: 10,
    phase: 2,
    title: "O que nunca enviar",
    minutes: 2,
    lesson: [
      'Algumas mensagens fecham portas quase sempre: textões, ultimatos, mensagens de madrugada, comparações e perguntas como "você me ama?".',
      "Se você precisa da resposta para se sentir bem, ainda não é hora de enviar.",
    ],
    action:
      "Leia a lista do que nunca enviar nas Regras de ouro e confira se algum rascunho seu cai nela.",
    checklist: [
      "Ler a lista",
      "Conferir os rascunhos guardados no Diário",
      "Deixar de lado o que não serve",
    ],
    tool: "rules",
  },
  {
    day: 11,
    phase: 2,
    title: "Sua primeira mensagem leve",
    minutes: 3,
    lesson: [
      "Se o seu cenário permite contato e você está estável, hoje pode ser o dia de uma mensagem curta e leve. Não é obrigatório.",
      "Se ele te bloqueou, pediu distância ou está em outra relação, este dia é só de escrita. Você guarda no Diário e não envia nada.",
    ],
    action:
      'Passe a mensagem pela Pausa. Se o resultado for "pode enviar", envie uma vez só e solte o celular.',
    checklist: [
      "Conferir o meu cenário",
      "Passar a mensagem pela Pausa",
      "Enviar só se o resultado permitir",
    ],
    tool: "pause",
  },
  {
    day: 12,
    phase: 2,
    title: "Depois de enviar, solte o celular",
    minutes: 2,
    lesson: [
      "Depois de mandar, vem a vontade de checar se ele viu, se está online, se respondeu. Isso puxa você de volta para a ansiedade.",
      "Uma mensagem enviada não pede outra. Se ele não responder, essa também é uma resposta.",
    ],
    action:
      "Se você enviou algo, não mande uma segunda mensagem. Ocupe as próximas horas com algo seu.",
    checklist: [
      "Não mandar uma segunda mensagem",
      "Silenciar as notificações dele por hoje",
      "Registrar no Diário como me senti",
    ],
    tool: "diary",
  },
  {
    day: 13,
    phase: 2,
    title: "Observar sem interpretar demais",
    minutes: 3,
    lesson: [
      "Se ele respondeu, observe o tom, não cada palavra. Uma resposta curta não é rejeição, e uma resposta simpática não é volta.",
      "Use os sinais de abertura e de alerta como guia. Ajuste, não insista.",
    ],
    action: "Marque no Diário os sinais que você percebeu até agora, se houver algum.",
    checklist: [
      "Ler os sinais de abertura e de alerta",
      "Marcar os sinais no Diário",
      "Decidir o próximo passo sem pressa",
    ],
    tool: "diary",
  },

  // Fase 3 · Reconexão
  {
    day: 14,
    phase: 3,
    title: "Quando ele responde",
    minutes: 3,
    lesson: [
      "Quando ele responde, o objetivo não é resolver o passado. É criar uma experiência boa de falar com você.",
      "Responda no seu tempo, curto e leve, sem cobrar a demora e sem perguntar o que ele sente.",
    ],
    action:
      'Se ele respondeu, use os modelos do cenário "Ele respondeu" como ponto de partida, e passe pela Pausa.',
    checklist: [
      "Ler o cenário Ele respondeu",
      "Responder curto e leve",
      "Não puxar o assunto da relação",
    ],
    tool: "pause",
  },
  {
    day: 15,
    phase: 3,
    title: "Encerrar antes de cansar",
    minutes: 2,
    lesson: [
      "Uma conversa boa termina enquanto ainda está boa. Arrastar até esfriar deixa a última impressão pior.",
      'Encerrar com leveza ("preciso ir, depois a gente se fala") mostra que você tem uma vida acontecendo.',
    ],
    action: "Na próxima conversa, encerre você, com leveza, antes de ela esfriar.",
    checklist: ["Conversar sem pressa", "Encerrar com leveza", "Não mandar mais nada depois"],
  },
  {
    day: 16,
    phase: 3,
    title: "Sinais de abertura e de alerta",
    minutes: 3,
    lesson: [
      "Abertura: ele responde mais rápido, faz perguntas sobre a sua vida, prolonga a conversa, sugere encontro ou ligação.",
      "Alerta: respostas secas e demoradas, evita qualquer assunto pessoal, só aparece quando precisa de algo. Observe sem interpretar demais.",
    ],
    action: "Registre no Diário os sinais que apareceram nas últimas conversas.",
    checklist: [
      "Ler os sinais",
      "Registrar o que percebi",
      "Não tirar conclusão de uma conversa só",
    ],
    tool: "diary",
  },
  {
    day: 17,
    phase: 3,
    title: "Ajustar, não insistir",
    minutes: 2,
    lesson: [
      "Se os sinais forem de alerta, recue: mais espaço, menos mensagens, mais foco em você.",
      'Se ele pedir para você parar, pare. Respeitar um "não" também é parte de quem você está se tornando.',
    ],
    action: "Olhe os sinais do Diário e decida: manter o ritmo, desacelerar ou parar.",
    checklist: [
      "Rever os sinais",
      "Escolher o ritmo da próxima semana",
      "Respeitar qualquer pedido de distância",
    ],
    tool: "diary",
  },
  {
    day: 18,
    phase: 3,
    title: "Revisão: o que mudou em você",
    minutes: 3,
    lesson: [
      "Compare como você agia no dia 1 e como age hoje: menos impulso, menos explicação, mais calma.",
      "Independente da resposta dele, essa mudança é sua e fica com você.",
    ],
    action: "Escreva no Diário três coisas que você faz diferente hoje.",
    checklist: ["Reler o Diário", "Anotar três mudanças", "Escolher uma para manter"],
    tool: "diary",
  },

  // Fase 4 · Do contato ao reencontro
  {
    day: 19,
    phase: 4,
    title: "Quando um convite faz sentido",
    minutes: 3,
    lesson: [
      "Um convite só faz sentido quando a conversa já flui: ele responde com interesse, faz perguntas e prolonga a conversa.",
      "Se os sinais forem de alerta, ou se ele estiver em outra relação, o convite fica para depois, ou não acontece. Tudo bem.",
    ],
    action: "Confira os sinais no Diário e decida, com honestidade, se é hora de convidar.",
    checklist: [
      "Rever os sinais de abertura",
      "Conferir o meu cenário",
      "Decidir: convidar agora ou esperar",
    ],
    tool: "diary",
  },
  {
    day: 20,
    phase: 4,
    title: "Um convite simples, sem pressão",
    minutes: 3,
    lesson: [
      "Convite leve é específico e fácil de recusar: um café, um lugar público, sem dramas.",
      "Deixe claro que tudo bem se não der. Um sim dado sem pressão vale mais.",
    ],
    action: "Se decidiu convidar, escreva o convite na Pausa antes de enviar.",
    checklist: [
      "Escrever o convite na Pausa",
      "Conferir se está leve",
      "Enviar só se o resultado permitir",
    ],
    tool: "pause",
  },
  {
    day: 21,
    phase: 4,
    title: "Qualquer resposta, e o seu próximo passo",
    minutes: 3,
    lesson: [
      "Ele pode aceitar, recusar ou não responder. Você não controla isso. Controla como você recebe.",
      "Se ele recusar, agradeça e encerre com leveza. Recusa não é convite para insistir. O que você construiu nesses 21 dias continua seu.",
    ],
    action: "Escreva no Diário o que você leva desses 21 dias, qualquer que tenha sido a resposta.",
    checklist: [
      "Receber a resposta com calma",
      "Agradecer e encerrar se for um não",
      "Escrever o que eu levo desses 21 dias",
    ],
    tool: "diary",
  },
];

export const TOTAL_DAYS = planDays.length;

export interface Milestone {
  day: number;
  emoji: EmojiName;
  /** Quando existe, a celebração mostra a protagonista no lugar do emoji. */
  pose?: Pose;
  title: string;
  description: string;
}

export const MILESTONES: Milestone[] = [
  {
    day: 7,
    emoji: "medalha",
    title: "Fase 1 concluída",
    description: "7 dias saindo do modo reação. Tudo o que vem depois se apoia nisso.",
  },
  {
    day: 14,
    emoji: "estrela",
    title: "Duas semanas de constância",
    description: "Você aprendeu a escrever menos e dizer mais. Agora começa a Reconexão.",
  },
  {
    day: 21,
    emoji: "trofeu",
    pose: "comemorando",
    title: "21 dias completos",
    description: "Você não perdeu a conexão com você. Aprendeu a reconstruí-la.",
  },
];

export const phaseOf = (day: number) =>
  planPhases.find((phase) => day >= phase.first && day <= phase.last) ?? planPhases[0]!;

export const dayContent = (day: number) => planDays[day - 1] ?? planDays[0]!;
