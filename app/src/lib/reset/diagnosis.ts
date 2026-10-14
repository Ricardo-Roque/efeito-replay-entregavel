// Reset Emocional do Ex: diagnóstico e regras de personalização.
//
// Nada aqui é aleatório: cada parte do resultado sai de uma regra explícita sobre as respostas.
// As orientações falam do que ELA pode fazer, a partir do que ELA contou. O app não interpreta o
// que ele pensa nem dá diagnóstico psicológico a ninguém.
// Limite: se ele pediu para não haver contato ou bloqueou, nenhuma recomendação envolve contato.
// O limite também vale quando vem do diagnóstico principal do app (bloqueio, pedido de não contato
// ou outra relação): `buildMap` e `buildTrustMap` recebem `appLimit` para os dois nunca discordarem.

export type Cause = "traicao" | "mentira" | "humilhacao" | "brigas" | "afastamento" | "outro";
export type Behavior = "nao_responde" | "frio" | "raiva" | "evita_emocional" | "sem_contato";
export type Elapsed = "ate7" | "7a30" | "1a3m" | "3a6m" | "mais6m";
export type Difficulty =
  "perdao" | "medo_raiva" | "confianca" | "quando" | "discussoes" | "abertura";
export type Contact = "frequente" | "ocasional" | "pediu_tempo" | "pediu_sem_contato" | "bloqueou";
export type Goal = "confianca" | "respeito" | "comunicacao" | "proximidade" | "reconciliacao";

export interface Answers {
  cause: Cause;
  behavior: Behavior;
  elapsed: Elapsed;
  difficulty: Difficulty;
  contact: Contact;
  goal: Goal;
}

export interface Question<K extends keyof Answers = keyof Answers> {
  id: K;
  title: string;
  options: { value: Answers[K]; label: string }[];
}

export const questions: Question[] = [
  {
    id: "cause",
    title: "O que mais prejudicou a confiança entre vocês?",
    // As três primeiras falam do que ELA fez: é a elas que se aplicam o reconhecimento e o pedido
    // de desculpas. Se quem traiu ou mentiu foi ele, a opção certa é "Outro motivo".
    options: [
      { value: "traicao", label: "Uma traição minha" },
      { value: "mentira", label: "Uma mentira minha" },
      { value: "humilhacao", label: "Algo que eu disse ou fiz e que o humilhou" },
      { value: "brigas", label: "Brigas e discussões constantes" },
      { value: "afastamento", label: "Um afastamento gradual" },
      { value: "outro", label: "Outro motivo (inclusive algo que ele fez)" },
    ],
  },
  {
    id: "behavior",
    title: "Como ele se comporta atualmente?",
    options: [
      { value: "nao_responde", label: "Não responde às minhas mensagens" },
      { value: "frio", label: "Responde, mas demonstra frieza" },
      { value: "raiva", label: "Demonstra raiva ou ressentimento" },
      { value: "evita_emocional", label: "Conversa normalmente, mas evita assuntos emocionais" },
      { value: "sem_contato", label: "Estamos completamente sem contato" },
    ],
  },
  {
    id: "elapsed",
    title: "Há quanto tempo vocês terminaram?",
    options: [
      { value: "ate7", label: "Menos de 7 dias" },
      { value: "7a30", label: "Entre 7 e 30 dias" },
      { value: "1a3m", label: "Entre 1 e 3 meses" },
      { value: "3a6m", label: "Entre 3 e 6 meses" },
      { value: "mais6m", label: "Mais de 6 meses" },
    ],
  },
  {
    id: "difficulty",
    title: "Qual é a sua maior dificuldade neste momento?",
    options: [
      { value: "perdao", label: "Não sei como pedir perdão" },
      { value: "medo_raiva", label: "Tenho medo de provocar mais raiva" },
      { value: "confianca", label: "Ele não confia mais em mim" },
      { value: "quando", label: "Não sei quando tentar uma aproximação" },
      { value: "discussoes", label: "Sempre acabamos discutindo" },
      { value: "abertura", label: "Não sei se ainda existe abertura para conversar" },
    ],
  },
  {
    id: "contact",
    title: "Como está o contato entre vocês?",
    options: [
      { value: "frequente", label: "Conversamos frequentemente" },
      { value: "ocasional", label: "Conversamos ocasionalmente" },
      { value: "pediu_tempo", label: "Ele pediu um tempo" },
      { value: "pediu_sem_contato", label: "Ele pediu para eu não entrar em contato" },
      { value: "bloqueou", label: "Ele me bloqueou" },
    ],
  },
  {
    id: "goal",
    title: "O que você mais deseja reconstruir?",
    options: [
      { value: "confianca", label: "A confiança" },
      { value: "respeito", label: "O respeito" },
      { value: "comunicacao", label: "A comunicação" },
      { value: "proximidade", label: "A proximidade emocional" },
      { value: "reconciliacao", label: "A possibilidade de uma reconciliação" },
    ],
  },
];

export const optionLabel = <K extends keyof Answers>(id: K, value: Answers[K]) =>
  questions.find((q) => q.id === id)?.options.find((o) => o.value === value)?.label ?? "";

// ---------- Modos que mudam todo o resultado ----------

/** Ele pediu para não haver contato ou bloqueou: o plano é só dela, sem nenhuma mensagem. */
export const respectsLimit = (a: Answers) =>
  a.contact === "pediu_sem_contato" || a.contact === "bloqueou";

/** Pediu um tempo, ou o término é muito recente: primeiro vem uma pausa. */
export const needsPause = (a: Answers) =>
  !respectsLimit(a) && (a.contact === "pediu_tempo" || a.elapsed === "ate7");

/** A confiança foi quebrada por algo que ela fez ou disse (traição, mentira, humilhação). */
export const trustBroken = (a: Answers) =>
  a.cause === "traicao" || a.cause === "mentira" || a.cause === "humilhacao";

export type Mode = "limite" | "pausa" | "aberto";
export const modeOf = (a: Answers, appLimit = false): Mode =>
  respectsLimit(a) || appLimit ? "limite" : needsPause(a) ? "pausa" : "aberto";

// ---------- Resultado: Mapa de Reconstrução Emocional ----------

const difficultyText: Record<Difficulty, { title: string; text: string }> = {
  perdao: {
    title: "Pedir perdão sem pressionar",
    text: "Você quer reconhecer o que aconteceu, mas ainda não sabe como fazer isso sem que o pedido vire uma cobrança por uma resposta.",
  },
  medo_raiva: {
    title: "Medo de provocar mais raiva",
    text: "Qualquer passo parece arriscado. Antes de falar, vale entender o que pode ter alimentado essa raiva e o que não repetir.",
  },
  confianca: {
    title: "Confiança abalada",
    text: "Palavras sozinhas costumam não bastar quando a confiança foi ferida. O que pesa é a coerência entre o que você diz e o que você faz, ao longo do tempo.",
  },
  quando: {
    title: "Saber o momento certo",
    text: "A dúvida não é só o que dizer, mas quando. Ler o momento evita uma aproximação antes da hora.",
  },
  discussoes: {
    title: "Conversas que viram briga",
    text: "Vocês entram num ciclo em que cada conversa reabre a ferida. O trabalho é mudar a forma de conversar antes do conteúdo.",
  },
  abertura: {
    title: "Não saber se ainda há abertura",
    text: "Você precisa de referências mais claras para diferenciar abertura real de educação, e de quando é melhor respeitar o afastamento.",
  },
};

const causeFactor: Record<Cause, string> = {
  traicao:
    "Depois de uma traição, a outra pessoa costuma precisar de tempo e de sinais consistentes antes de voltar a se sentir segura.",
  mentira:
    "Quando uma mentira vem à tona, a dúvida tende a se espalhar para outras coisas que foram ditas.",
  humilhacao:
    "Situações de humilhação costumam ferir o orgulho, e o orgulho ferido tende a se proteger com distância.",
  brigas:
    "Brigas repetidas criam uma memória de cansaço: a conversa começa a ser associada a desgaste.",
  afastamento:
    "No afastamento gradual, a falta de conexão vai se acumulando aos poucos, até virar hábito.",
  outro:
    "O motivo do término pode ter deixado mágoas que ainda não foram nomeadas por nenhum dos dois.",
};

const behaviorFactor: Record<Behavior, string> = {
  nao_responde: "Insistir em mensagens sem resposta pode reforçar a vontade de não responder.",
  frio: "Respostas frias podem ser uma forma de se proteger. Cobrar mais calor tende a aumentar a defesa.",
  raiva:
    "Enquanto a raiva estiver alta, tentativas de explicar ou se justificar podem soar como ataque.",
  evita_emocional:
    "Ele mantém a conversa, mas evita o assunto. Forçar o tema emocional agora pode encerrar até a conversa leve.",
  sem_contato:
    "Sem contato, qualquer reaproximação depende primeiro do seu próprio preparo emocional.",
};

const contactFactor: Partial<Record<Contact, string>> = {
  pediu_tempo:
    "Ele pediu um tempo. Respeitar esse pedido é, por si só, um sinal de que algo mudou.",
  pediu_sem_contato:
    "Ele pediu para você não entrar em contato. Esse pedido é um limite, e respeitá-lo vem antes de qualquer outra coisa.",
  bloqueou: "O bloqueio é um limite. Não existe caminho saudável que passe por contorná-lo.",
};

const elapsedFactor: Partial<Record<Elapsed, string>> = {
  ate7: "O término é muito recente: as emoções dos dois ainda estão no pico.",
  mais6m:
    "Já se passou bastante tempo. Uma reaproximação, se acontecer, vai começar quase do zero, e tudo bem.",
};

export interface ReconstructionMap {
  mode: Mode;
  difficulty: { title: string; text: string };
  factors: string[];
  avoid: string[];
  firstStep: { title: string; text: string; module: ModuleId };
  steps: { title: string; focus: string }[];
}

export type ModuleId = "perdao" | "audios" | "dizer" | "noturno" | "bonus";

function avoidList(a: Answers, limit: boolean): string[] {
  const list: string[] = [];
  if (limit) {
    list.push("Criar outro perfil, usar outro número ou pedir para amigos levarem recados.");
    list.push("Aparecer onde ele está ou checar se o bloqueio foi desfeito.");
  }
  if (a.behavior === "raiva") list.push("Se justificar ou rebater quando ele demonstrar raiva.");
  if (a.behavior === "nao_responde")
    list.push("Mandar uma segunda mensagem cobrando a resposta da primeira.");
  if (a.behavior === "frio") list.push('Reclamar da frieza ("por que você está assim comigo?").');
  if (a.behavior === "evita_emocional")
    list.push("Puxar o assunto do término quando a conversa está leve.");
  if (trustBroken(a))
    list.push(
      'Minimizar o que aconteceu ("não foi nada demais") ou dividir a culpa na hora do pedido de desculpas.',
    );
  if (a.difficulty === "discussoes")
    list.push("Continuar uma conversa que já começou a esquentar. Pausar é melhor que vencer.");
  if (a.elapsed === "ate7")
    list.push(
      limit
        ? "Tomar decisões grandes nos primeiros dias, no pico da dor."
        : "Tomar decisões ou mandar mensagens longas nos primeiros dias.",
    );
  list.push("Pedir garantias de que ele vai perdoar ou voltar.");
  return list.slice(0, 5);
}

function firstStep(a: Answers, limit: boolean): ReconstructionMap["firstStep"] {
  if (limit)
    return {
      title: "Não enviar nada e começar pelo Mapa das Mágoas",
      text: "Seu primeiro passo é respeitar o limite que ele colocou e entender, só para você, o que aconteceu. O Mapa das Mágoas ajuda a organizar isso sem enviar nada a ninguém.",
      module: "perdao",
    };
  if (needsPause(a))
    return {
      title: "Respeitar a pausa e cuidar das suas emoções",
      text: "Antes de qualquer conversa, use a Técnica de Reversão Noturna para baixar a ansiedade das noites e não agir no impulso.",
      module: "noturno",
    };
  if (a.behavior === "raiva" || a.difficulty === "medo_raiva")
    return {
      title: "Aprender a não reagir à raiva",
      text: 'Estude como responder sem se defender nem atacar. Comece pela categoria "Quando ele demonstra raiva" em O Que Dizer e O Que Evitar.',
      module: "dizer",
    };
  if (a.difficulty === "perdao" || trustBroken(a))
    return {
      title: "Preparar um reconhecimento sincero",
      text: "Comece pelo Módulo 1. Ele ajuda a reconhecer o que aconteceu com responsabilidade, sem pressionar por uma resposta.",
      module: "perdao",
    };
  if (a.difficulty === "discussoes")
    return {
      title: "Mudar a forma de conversar",
      text: 'Comece pelos áudios de comunicação, em especial "Como conversar sem despertar defensividade".',
      module: "audios",
    };
  return {
    title: "Entender os sinais antes de agir",
    text: "Consulte o Mapa de Reconstrução da Confiança para ler os sinais de abertura e de afastamento na sua situação.",
    module: "bonus",
  };
}

function steps(a: Answers, limit: boolean): ReconstructionMap["steps"] {
  const pause = !limit && needsPause(a);
  return [
    {
      title: "Entendendo a ferida emocional",
      focus: trustBroken(a)
        ? "Olhar com honestidade para o que você fez e para o impacto que isso teve nele."
        : "Nomear o que foi se perdendo entre vocês, sem procurar culpados.",
    },
    {
      title: "Identificando os gatilhos de conflito",
      focus:
        a.difficulty === "discussoes" || a.cause === "brigas"
          ? "Mapear em que momento as conversas viram briga e qual é a sua parte nisso."
          : "Perceber quais situações fazem você agir no impulso.",
    },
    {
      title: "Desenvolvendo a consciência do perdão",
      focus:
        "Diferenciar pedir desculpas de pedir uma resposta. O perdão é dele; a responsabilidade é sua.",
    },
    {
      title: "Aprendendo uma nova comunicação",
      focus: limit
        ? "Treinar uma nova forma de falar para a vida, mesmo sem conversar com ele agora."
        : "Trocar explicações e cobranças por frases curtas, calmas e sem pressão.",
    },
    {
      title: "Trabalhando a reconstrução da confiança",
      focus:
        a.goal === "confianca" || trustBroken(a)
          ? "Confiança se reconstrói com coerência ao longo do tempo, não com uma conversa só."
          : "Ser, no dia a dia, alguém em quem é possível confiar, começando por você mesma.",
    },
    {
      title: limit ? "Respeitando o limite" : "Preparando uma possível reaproximação",
      focus: limit
        ? "Aceitar que, agora, a resposta dele é a distância, e seguir cuidando de você."
        : pause
          ? "Esperar o tempo pedido e só depois avaliar, pelos sinais, se há abertura."
          : "Avaliar os sinais de abertura e, se fizer sentido, dar um passo leve.",
    },
    {
      title: "Definindo os próximos passos",
      focus: "Decidir o que você vai manter dessa jornada, independentemente da resposta dele.",
    },
  ];
}

/** Aviso quando o limite vem só do diagnóstico principal (o do Reset não registra limite). */
export const APP_LIMIT_FACTOR =
  "No seu diagnóstico principal do app há um limite (bloqueio, pedido de não contato ou outra relação). Enquanto ele valer, este plano não sugere nenhum contato.";

export function buildMap(a: Answers, appLimit = false): ReconstructionMap {
  const limit = respectsLimit(a) || appLimit;
  const factors = [
    causeFactor[a.cause],
    behaviorFactor[a.behavior],
    contactFactor[a.contact],
    limit && !respectsLimit(a) ? APP_LIMIT_FACTOR : undefined,
    elapsedFactor[a.elapsed],
  ].filter((item): item is string => Boolean(item));
  return {
    mode: modeOf(a, appLimit),
    difficulty: difficultyText[a.difficulty],
    factors,
    avoid: avoidList(a, limit),
    firstStep: firstStep(a, limit),
    steps: steps(a, limit),
  };
}

// ---------- Bônus: Mapa de Reconstrução da Confiança ----------

const repairByCause: Record<Cause, string[]> = {
  traicao: [
    "Reconhecer o que aconteceu sem detalhar demais nem se justificar.",
    "Aceitar que a desconfiança dele é uma consequência compreensível, não um ataque.",
    "Se um dia houver conversa, mostrar mudança por atitudes consistentes, não por promessas.",
  ],
  mentira: [
    "Assumir a mentira com clareza, sem versões parciais.",
    "Ser transparente nas pequenas coisas daqui em diante.",
    "Não exigir que ele volte a acreditar rápido.",
  ],
  humilhacao: [
    "Reconhecer o quanto aquela situação pode ter ferido o orgulho dele.",
    "Não repetir o tom nem a exposição daquela situação, nem em brincadeira.",
    "Demonstrar respeito em público e no privado.",
  ],
  brigas: [
    "Assumir a sua parte no ciclo de brigas, sem listar a parte dele.",
    "Combinar com você mesma uma pausa sempre que a conversa esquentar.",
    'Trocar o "você sempre" por "eu senti".',
  ],
  afastamento: [
    "Reconhecer o que foi deixado de lado na rotina de vocês.",
    "Mostrar presença com leveza, sem tentar compensar tudo de uma vez.",
    "Valorizar pequenos momentos de conexão, se surgirem.",
  ],
  outro: [
    "Nomear, para você, o que exatamente ficou ferido.",
    "Reconhecer sua parte sem assumir o que não é seu.",
    "Dar tempo para que a confiança se reconstrua.",
  ],
};

const barrierByBehavior: Record<Behavior, string> = {
  nao_responde: "Silêncio: ainda não há canal aberto para conversar.",
  frio: "Defesa: ele responde, mas mantém distância emocional.",
  raiva: "Raiva e ressentimento: qualquer explicação tende a soar como ataque.",
  evita_emocional: "Evitação: a conversa existe, mas o assunto emocional está fechado.",
  sem_contato: "Ausência de contato: não há conversa acontecendo agora.",
};

export interface TrustMap {
  situation: string;
  barrier: string;
  harmful: string[];
  repair: string[];
  openSigns: string[];
  respectSigns: string[];
  nextStep: string;
}

export function buildTrustMap(a: Answers, appLimit = false): TrustMap {
  const limit = respectsLimit(a) || appLimit;
  const situation = `${optionLabel("cause", a.cause)}, término ${
    {
      ate7: "há menos de 7 dias",
      "7a30": "entre 7 e 30 dias atrás",
      "1a3m": "entre 1 e 3 meses atrás",
      "3a6m": "entre 3 e 6 meses atrás",
      mais6m: "há mais de 6 meses",
    }[a.elapsed]
  }. Hoje: ${optionLabel("behavior", a.behavior).toLowerCase()}; ${optionLabel("contact", a.contact).toLowerCase()}.`;
  return {
    situation,
    barrier: limit
      ? "Limite colocado por ele: o próximo movimento não é seu."
      : barrierByBehavior[a.behavior],
    harmful: avoidList(a, limit).slice(0, 4),
    repair: limit
      ? [
          "Respeitar o limite, sem exceções.",
          "Fazer o trabalho interno: entender sua parte e cuidar de você.",
          "Escrever o que gostaria de dizer, só para você, no Mapa das Mágoas.",
        ]
      : repairByCause[a.cause],
    openSigns: [
      "Ele puxa conversa ou responde sem demora.",
      "Pergunta sobre você ou sobre a sua vida.",
      "Fala do que aconteceu sem agressividade.",
      "Sugere conversar com calma ou se encontrar.",
    ],
    respectSigns: [
      "Ele pede, com palavras, para você parar ou se afastar.",
      "Bloqueia ou deixa de responder por completo.",
      "As conversas sempre terminam em raiva.",
      "Ele diz que está em outra relação.",
    ],
    nextStep: limit
      ? "Não enviar nada. Seguir a jornada pelo seu próprio bem-estar."
      : needsPause(a)
        ? "Respeitar o tempo pedido e voltar aos sinais de abertura daqui a alguns dias."
        : a.behavior === "raiva"
          ? "Não responder à raiva com explicações. Se ele falar com você, acolher com uma frase curta."
          : "Se houver abertura, mandar uma mensagem curta e leve, sem tocar no conflito, e passar pela Pausa antes de enviar.",
  };
}
