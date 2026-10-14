// "Meu Plano de 48 Horas". RASCUNHO de conteúdo.
//
// Orientações para os dois primeiros dias depois do diagnóstico: cinco atividades em duas etapas.
// 48 horas é a duração desta etapa inicial, não uma promessa de que ele volta (ver
// docs/revisao-vsl.md). Nada é travado pelo relógio: as etapas só sugerem um ritmo, e todas as
// atividades ficam abertas desde o primeiro minuto. O plano convive com o de 21 dias e não mexe em
// dayState nem em completeDay.
//
// Tudo sai das respostas por regras explícitas, na mesma ordem de prioridade do Mapa
// (lib/jornada/map.ts): limites dele primeiro. Nos caminhos limite, pausa e espaco nenhuma
// orientação envolve escrever para ele. Nenhuma atividade depende de resposta de outra pessoa.
//
// Mudança de diagnóstico: o plano é recalculado; atividades concluídas continuam concluídas.
// Regra de mudança significativa em diagnosisChange e reviewOf (documentada em
// docs/evolucao-entregavel.md, seção 7).

import { attentionOf, contactModeOf, isRecent, triedReaching } from "@/lib/jornada/diagnosis";
import { buildDiagnosisResult } from "@/lib/jornada/map";
import { templatesFor } from "@/lib/jornada/messages";
import type {
  DiagnosisAnswers,
  DiagnosisRecord,
  DiagnosisResult,
  First48Activity,
  First48ActivityId,
  First48Block,
  First48CheckItem,
  First48Choice,
  First48ChoiceId,
  First48Exercise,
  First48NextStep,
  First48Path,
  First48Plan,
  First48Stage,
  First48StageId,
  First48State,
  First48ToolLink,
} from "@/lib/jornada/types";
import { scenarioById, type ScenarioId } from "@/lib/scenarios";

const HOUR = 60 * 60 * 1000;
export const FIRST48_HOURS = 48;

export const first48Stages: First48Stage[] = [
  {
    id: "a",
    title: "Primeiras 24 horas",
    from: 0,
    to: 24,
    objective: "Entender o seu momento, interromper os impulsos e cuidar de você.",
  },
  {
    id: "b",
    title: "De 24 a 48 horas",
    from: 24,
    to: 48,
    objective: "Escolher o próximo passo com calma e organizar a continuação.",
  },
];

export const ACTIVITY_ORDER: First48ActivityId[] = [
  "entender",
  "interromper",
  "preparar",
  "escolher",
  "organizar",
];

/** Etapa de cada atividade (fixa). */
export const stageOfActivity: Record<First48ActivityId, First48StageId> = {
  entender: "a",
  interromper: "a",
  preparar: "a",
  escolher: "b",
  organizar: "b",
};

// ---------- Caminho ----------

/**
 * Caminho do próximo passo. Prioridade: limites dele, pedido de tempo, ausência de reciprocidade
 * (não responde ou padrão de insistência) e, por fim, conversa.
 */
export function pathOf(a: DiagnosisAnswers): First48Path {
  const mode = contactModeOf(a);
  if (mode === "sem_contato") return "limite";
  if (mode === "pausa") return "pausa";
  if (a.contact === "nao_responde" || attentionOf(a) === "insistencia") return "espaco";
  return "conversa";
}

const hasTrustIssue = (a: DiagnosisAnswers) =>
  a.reason === "traicao" || a.reason === "quebra_confianca";

const noContactPath = (path: First48Path) => path !== "conversa";

const check = (activity: First48ActivityId, item: string, text: string): First48CheckItem => ({
  id: `${activity}:${item}`,
  text,
});

/** Junta itens na ordem, sem repetir e sem os falsos. */
const list = (...items: (string | false | undefined)[]) => [
  ...new Set(items.filter((item): item is string => Boolean(item))),
];

// ---------- Atividade 1: Entenda sua situação ----------

function watchSignals(a: DiagnosisAnswers, path: First48Path): string[] {
  // Nos caminhos sem contato, os sinais a observar são dela, não dele.
  const own = [
    "Os momentos do dia em que a saudade aperta mais",
    "A vontade de checar as redes dele, e o que você sente depois",
  ];
  if (path === "limite")
    return list(
      a.contact === "bloqueou" && "A vontade de conferir se ele desbloqueou",
      "Pensamentos de mandar recado por alguém",
      ...own,
      a.otherPerson === "sim" && "Quando a comparação com a outra pessoa começa",
    );
  if (path === "pausa")
    return list(
      "A vontade de perguntar quanto tempo vai durar",
      "Se ele retomar o contato, se foi por iniciativa dele",
      ...own,
    );
  if (path === "espaco")
    return list(
      "Se ele procura você por iniciativa própria, sem você ter escrito antes",
      "Quanto a falta de resposta mexe com o seu dia",
      a.otherPerson === "nao_sei" && "A vontade de investigar se ele está com alguém",
      ...own.slice(0, 1),
    );
  return list(
    "Abertura: ele responde mais rápido, faz perguntas ou prolonga a conversa",
    "Alerta: respostas secas, demora maior ou assunto pessoal evitado",
    "Pare aqui: um pedido de espaço, mesmo que dito de leve",
    hasTrustIssue(a) && "Se ele traz o que aconteceu, e em que tom, sem você puxar o assunto",
    a.otherPerson === "nao_sei" && "A vontade de investigar se ele está com alguém",
  );
}

function inControl(a: DiagnosisAnswers, path: First48Path): string[] {
  return list(
    path === "limite" && "Respeitar o limite, inclusive nos dias em que doer mais",
    path === "pausa" && "Dar o tempo que ele pediu, sem contar os dias",
    path === "espaco" && "Parar as tentativas e dar espaço de verdade",
    path === "conversa" && "O ritmo e o tom das suas respostas",
    "Como você reage ao que sente, sem agir no pico",
    "O seu cuidado: sono, comida e pessoas de confiança",
    a.reason === "discussoes" && "Não repetir o padrão que levava às discussões",
    hasTrustIssue(a) && "Ser coerente com o tempo, sem promessas grandes",
  );
}

function attentionExtras(a: DiagnosisAnswers, r: DiagnosisResult): string[] {
  return list(
    `${r.attention.title}. ${r.attention.text}`,
    isRecent(a) &&
      r.attention.id !== "termino_recente" &&
      "O término é recente: as emoções ficam mais intensas nos primeiros dias, então decisões grandes podem esperar.",
    hasTrustIssue(a) &&
      r.attention.id !== "confianca" &&
      "Quando há quebra de confiança, tempo e coerência pesam mais do que qualquer conversa.",
    a.otherPerson === "sim" &&
      r.attention.id !== "outra_relacao" &&
      "Ele está se envolvendo com outra pessoa: o plano não sugere disputa nem comparação.",
  );
}

function understand(a: DiagnosisAnswers, r: DiagnosisResult, path: First48Path): First48Activity {
  const blocks: First48Block[] = [
    { id: "resumo", title: "O seu momento", tone: "info", items: r.summary },
    {
      id: "atencao",
      title: "O que merece atenção",
      tone: "info",
      items: attentionExtras(a, r),
      highlight: true,
    },
    { id: "evitar", title: "Erros a evitar", tone: "avoid", items: r.avoid },
    { id: "sinais", title: "Sinais para observar", tone: "watch", items: watchSignals(a, path) },
    {
      id: "controle",
      title: "O que está sob o seu controle",
      tone: "do",
      items: [
        ...inControl(a, path),
        "Fora do seu controle: o que ele sente, responde ou decide. Por isso o plano não depende disso.",
      ],
    },
  ];
  const avoidFirst = r.avoid[0];
  return {
    id: "entender",
    stage: "a",
    n: 1,
    title: "Entenda sua situação",
    goal: "Ver com clareza o seu momento, antes de decidir qualquer coisa.",
    minutes: 4,
    blocks,
    checklist: [
      check("entender", "resumo", "Li o resumo do meu momento"),
      check(
        "entender",
        "atencao",
        `Entendi o ponto de atenção: ${r.attention.title.toLowerCase()}`,
      ),
      ...(avoidFirst
        ? [
            check(
              "entender",
              "evitar",
              `Nas próximas 24 horas, vou evitar: ${avoidFirst.toLowerCase()}`,
            ),
          ]
        : []),
      check("entender", "controle", "Separei o que depende de mim do que não depende"),
    ],
    tools: [
      { tool: "scenario", label: "Ver o meu cenário" },
      ...(path === "conversa" ? [{ tool: "signals" as const, label: "Ver os sinais" }] : []),
    ],
  };
}

// ---------- Atividade 2: Interrompa os padrões ----------

type PatternId = "impulso" | "cobranca" | "insistencia" | "reativa";

const patternTitle: Record<PatternId, string> = {
  impulso: "Comportamento impulsivo",
  cobranca: "Cobrança",
  insistencia: "Insistência",
  reativa: "Comunicação reativa",
};

const patternWhat: Record<PatternId, string> = {
  impulso: "Agir no pico da emoção: escrever de madrugada, mandar um textão, ligar sem pensar.",
  cobranca:
    'Pedir explicação, atenção ou resposta: "por que você sumiu?", "você não vai falar nada?".',
  insistencia:
    "Repetir tentativas quando a resposta não vem ou é um não: mais uma mensagem, mais um pedido.",
  reativa:
    "Responder no calor do momento a uma frase dele, ou a um post, em vez de escolher o que dizer.",
};

function patternInstead(id: PatternId, path: First48Path): string {
  const noContact = noContactPath(path);
  switch (id) {
    case "impulso":
      return noContact
        ? "Em vez disso: escreva tudo na Pausa ou no Diário. Nada sai do app."
        : "Em vez disso: escreva primeiro na Pausa e espere passar o pico. O rascunho fica guardado por 24 horas.";
    case "cobranca":
      return noContact
        ? "Em vez disso: anote no Diário a pergunta que você queria fazer. Ela fica com você."
        : "Em vez disso: fale de você ou de algo leve, sem pedir nada em troca.";
    case "insistencia":
      return path === "conversa"
        ? "Em vez disso: uma mensagem por vez. Sem resposta, você não manda outra."
        : "Em vez disso: pare as tentativas. Um silêncio ou um limite já é uma resposta.";
    case "reativa":
      return noContact
        ? "Em vez disso: quando algo dele chegar até você, respire e registre no Diário antes de qualquer reação."
        : "Em vez disso: deixe para responder depois de alguns minutos, passando pela Pausa.";
  }
}

/** Ordem dos padrões: o mais provável para ela primeiro. */
function patternOrder(a: DiagnosisAnswers, path: First48Path): PatternId[] {
  const first: PatternId[] = [];
  if (a.tried.includes("mensagens") || a.tried.includes("nova_chance") || path === "espaco")
    first.push("insistencia");
  if (a.difficulty === "ansiedade" || isRecent(a)) first.push("impulso");
  if (a.contact === "frio" || a.contact === "raro" || a.difficulty === "frieza")
    first.push("cobranca");
  if (a.reason === "discussoes") first.push("reativa");
  return [...new Set<PatternId>([...first, "impulso", "cobranca", "insistencia", "reativa"])];
}

/** Padrão que mais merece atenção, para o resumo da atividade 5. */
export const mainPattern = (a: DiagnosisAnswers) => patternTitle[patternOrder(a, pathOf(a))[0]!];

function interrupt(a: DiagnosisAnswers, path: First48Path): First48Activity {
  const order = patternOrder(a, path);
  const blocks: First48Block[] = order.map((id, index) => ({
    id: `padrao-${id}`,
    title: index === 0 ? `${patternTitle[id]} · mais importante para você` : patternTitle[id],
    tone: index === 0 ? "avoid" : "info",
    items: [patternWhat[id], patternInstead(id, path)],
    ...(index === 0 ? { highlight: true } : {}),
  }));
  blocks.push({
    id: "pausa",
    title: "Como a Pausa ajuda",
    tone: "do",
    items: list(
      "Você escreve o que queria mandar, sem enviar.",
      "Um checklist curto mostra se é hora ou se é melhor guardar.",
      path === "limite"
        ? "No seu momento, o resultado é sempre guardar: nada vai para ele."
        : noContactPath(path)
          ? "No seu momento, a Pausa só libera uma resposta a uma mensagem dele. Se a ideia é começar a conversa, o resultado é guardar."
          : "Se não for hora, o rascunho fica guardado por 24 horas para você reler com calma.",
    ),
  });
  return {
    id: "interromper",
    stage: "a",
    n: 2,
    title: "Interrompa os padrões que prejudicam a comunicação",
    goal: "Reconhecer os impulsos que mais afastam e ter um plano para cada um.",
    minutes: 5,
    blocks,
    checklist: [
      check(
        "interromper",
        "padrao",
        `Reconheço o padrão que mais aparece em mim: ${patternTitle[order[0]!].toLowerCase()}`,
      ),
      check(
        "interromper",
        "pausa",
        noContactPath(path)
          ? "Combinei comigo: a vontade de escrever vai para a Pausa ou o Diário, não para ele"
          : "Combinei comigo: toda mensagem passa pela Pausa antes de sair",
      ),
      ...(path === "espaco" || (path !== "conversa" && triedReaching(a))
        ? [
            check(
              "interromper",
              "sem-nova",
              "Nas próximas 24 horas, não mando nenhuma mensagem nova",
            ),
          ]
        : []),
      check("interromper", "arquivo", "Silenciei ou arquivei a conversa para não reler toda hora"),
    ],
    tools: [
      { tool: "pause", label: "Treinar na Pausa" },
      { tool: "never", label: "O que nunca enviar" },
    ],
  };
}

// ---------- Atividade 3: Prepare-se emocionalmente ----------

function exerciseOf(a: DiagnosisAnswers, path: First48Path): First48Exercise {
  return {
    steps: [
      "Sente-se com os pés no chão e solte os ombros.",
      "Inspire pelo nariz contando até 4. Solte pela boca contando até 6. Repita por 1 minuto.",
      "Dê um nome ao que você sente agora, numa palavra só: saudade, raiva, medo, alívio…",
      "Pergunte a você: isso pede uma ação agora, ou só precisa ser sentido?",
    ],
    prompts: list(
      path === "limite"
        ? "O que você diria a ele se pudesse? Escreva aqui. Fica só com você."
        : "O que você está sentindo agora, sem se julgar?",
      isRecent(a) && "Do que você precisa hoje para atravessar o dia?",
      hasTrustIssue(a) &&
        "O que faria você se sentir segura de novo, independentemente do que ele fizer?",
      a.otherPerson === "sim" && "O que você ganha e o que você perde quando se compara?",
      a.reason === "discussoes" && "Que situação costumava virar briga, e como você reagia?",
      "O que você quer para você, com ou sem ele?",
    ).slice(0, 3),
  };
}

function prepare(a: DiagnosisAnswers, r: DiagnosisResult): First48Activity {
  return {
    id: "preparar",
    stage: "a",
    n: 3,
    title: "Prepare-se emocionalmente",
    goal: "Baixar a intensidade do momento e colocar para fora o que pesa, no seu Diário.",
    minutes: 6,
    blocks: [
      {
        id: "porque",
        title: "Por que isso vem antes",
        tone: "info",
        items: list(
          "No pico da emoção, qualquer decisão sobre ele fica mais difícil.",
          "Alguns minutos de respiração e escrita baixam a intensidade e devolvem a escolha para você.",
          r.showCareLines &&
            "Se a dor estiver pesada demais, não fique sozinha: a rede de apoio está no fim desta tela.",
        ),
      },
    ],
    checklist: [
      check("preparar", "respirar", "Fiz a respiração por 1 minuto"),
      check("preparar", "nomear", "Dei um nome ao que estou sentindo"),
      check("preparar", "humor", "Registrei como estou no Diário"),
      check("preparar", "reflexao", "Escrevi uma reflexão no Diário"),
    ],
    tools: [{ tool: "diary", label: "Abrir o Diário" }],
  };
}

// ---------- Atividade 4: Escolha seu próximo passo ----------

const choiceDef: Record<First48ChoiceId, First48Choice> = {
  responder: {
    id: "responder",
    label: "Responder com leveza quando ele escrever",
    text: "Você não puxa a conversa. Se ele escrever, responde curto e leve, passando pela Pausa.",
    next: { tool: "pause", label: "Abrir a Pausa" },
  },
  puxar: {
    id: "puxar",
    label: "Mandar uma mensagem curta e leve",
    text: "Só se todos os critérios abaixo fizerem sentido. Uma mensagem, sem esperar resposta.",
    next: { tool: "pause", label: "Escrever na Pausa" },
  },
  esperar: {
    id: "esperar",
    label: "Esperar alguns dias antes de decidir",
    text: "Nenhuma mensagem por enquanto. Você volta a pensar nisso com mais calma.",
    next: { tool: "plan", label: "Seguir no plano de 21 dias" },
  },
  parar: {
    id: "parar",
    label: "Parar as tentativas e dar espaço",
    text: "Sem novas mensagens. A energia que ia para as tentativas vai para você.",
    next: { tool: "commitment", label: "Rever Meu compromisso" },
  },
  respeitar: {
    id: "respeitar",
    label: "Respeitar o que ele pediu e cuidar de mim",
    text: "Nada de contato, por nenhum caminho. O plano de 21 dias segue por você.",
    next: { tool: "commitment", label: "Rever Meu compromisso" },
  },
  diario: {
    id: "diario",
    label: "Escrever no Diário o que eu diria",
    text: "Tudo o que você queria dizer vai para o Diário. Fica só com você.",
    next: { tool: "diary", label: "Abrir o Diário" },
  },
  cuidar: {
    id: "cuidar",
    label: "Focar só em mim por enquanto",
    text: "Rotina, sono, pessoas de confiança e o dia de hoje do plano.",
    next: { tool: "plan", label: "Abrir o plano" },
  },
};

const choicesByPath: (a: DiagnosisAnswers) => Record<First48Path, First48ChoiceId[]> = (a) => ({
  limite: ["respeitar", "diario", "cuidar"],
  pausa: ["respeitar", "diario", "cuidar"],
  espaco: ["parar", "diario", "cuidar"],
  // Puxar conversa só aparece com conversa normal e fora do pico do término recente.
  conversa:
    a.contact === "normal" && !isRecent(a)
      ? ["responder", "puxar", "esperar", "cuidar"]
      : ["responder", "esperar", "cuidar"],
});

const introByPath: Record<First48Path, string> = {
  limite:
    "Ele colocou um limite. Os caminhos abaixo respeitam esse limite: nenhum envolve contato, por nenhum meio.",
  pausa:
    "Ele pediu um tempo. Enquanto durar, os caminhos abaixo não envolvem mensagem. Depois, você decide com calma, sem pressa.",
  espaco:
    "Hoje não há reciprocidade na conversa. Os caminhos abaixo dão espaço de verdade, sem nenhuma mensagem nova.",
  conversa:
    "Vocês conversam. Isso não obriga você a escrever: escolha o caminho que faz sentido hoje. Esperar também é um passo.",
};

/** Exemplos para o caminho conversa, do mais para o menos ligado às respostas. */
function examplesOf(a: DiagnosisAnswers, scenario: ScenarioId): string[] {
  const allowed = new Set(templatesFor("aberto", scenario).map((item) => item.id));
  const preferred = list(
    hasTrustIssue(a) && "conf-coerencia",
    a.reason === "discussoes" && "ress-reconhecer",
    a.contact === "normal" && "perg-como-esta",
    (a.contact === "frio" || a.contact === "raro") && "frio-espelhar",
    ...scenarioById(scenario).messages,
    "frio-encerrar",
  );
  return preferred.filter((id) => allowed.has(id)).slice(0, 3);
}

function criteriaOf(a: DiagnosisAnswers): string[] {
  return list(
    a.contact === "normal"
      ? "Ele tem respondido com interesse, sem você precisar insistir"
      : "Ele respondeu à última mensagem, mesmo que curto",
    "Você está calma, não num pico de emoção nem de madrugada",
    "Você ficaria bem se não houvesse resposta",
    "A mensagem é curta, leve e não pede nada em troca",
    "Ele não pediu espaço nem distância",
    hasTrustIssue(a) && "Você não está pedindo perdão nem explicação agora",
    a.reason === "discussoes" && "Você não vai retomar a discussão que levou ao término",
  );
}

function guidanceOf(a: DiagnosisAnswers, path: First48Path): First48Block[] {
  if (path === "conversa")
    return [
      {
        id: "orientacoes",
        title: "Orientações de comunicação",
        tone: "do",
        items: list(
          "Mensagens curtas: uma ou duas linhas bastam.",
          "Leveza antes de qualquer assunto sério.",
          "Encerre a conversa enquanto ela está boa.",
          a.contact !== "normal" && "Espaço entre as mensagens: não responda na hora toda vez.",
          hasTrustIssue(a) && "Sem promessas grandes e sem pressionar por perdão.",
          a.reason === "discussoes" &&
            "Se o assunto da briga voltar, reconheça sem reabrir a discussão.",
        ),
      },
    ];
  return [
    {
      id: "limites",
      title: path === "espaco" ? "Como dar espaço de verdade" : "Como respeitar o limite",
      tone: "do",
      items: list(
        path === "limite" && "Sem outros perfis, números ou recados por amigos e familiares.",
        path === "limite" && "Sem aparecer onde ele está.",
        path === "pausa" && "Sem perguntar quanto tempo vai durar.",
        path === "pausa" && 'Sem mensagens "só para saber como você está".',
        path === "espaco" && "Sem mensagem nova, nem para perguntar se ele recebeu a anterior.",
        path === "espaco" && "Sem cobrar a falta de resposta, nem em indireta nas redes.",
        "Se ele procurar você, respire antes e passe pela Pausa.",
      ),
    },
    {
      id: "sem-contato",
      title: "O que fazer, sem contato",
      tone: "info",
      items: list(
        "Escrever no Diário o que você gostaria de dizer.",
        "Fazer o dia de hoje do plano de 21 dias.",
        "Reler Meu compromisso quando a vontade apertar.",
        a.otherPerson === "sim" && "Silenciar os perfis que fazem você se comparar.",
      ),
    },
  ];
}

function nextStepOf(a: DiagnosisAnswers, path: First48Path, scenario: ScenarioId): First48NextStep {
  return {
    path,
    intro: introByPath[path],
    choices: choicesByPath(a)[path].map((id) => choiceDef[id]),
    examples: path === "conversa" ? examplesOf(a, scenario) : [],
    criteria: path === "conversa" ? criteriaOf(a) : [],
  };
}

function choose(a: DiagnosisAnswers, path: First48Path): First48Activity {
  return {
    id: "escolher",
    stage: "b",
    n: 4,
    title: "Escolha seu próximo passo",
    goal: "Decidir o que fazer agora, sem pressa e sem obrigação de mandar mensagem.",
    minutes: 5,
    blocks: guidanceOf(a, path),
    checklist: [],
    tools:
      path === "conversa"
        ? [{ tool: "signals", label: "Ver os sinais" }]
        : [{ tool: "commitment", label: "Meu compromisso" }],
  };
}

// ---------- Atividade 5: Organize a continuação ----------

function toolsOf(path: First48Path): First48ToolLink[] {
  return [
    { tool: "pause", label: "Pausa antes de enviar" },
    { tool: "diary", label: "Meu diário" },
    path === "conversa"
      ? { tool: "signals", label: "Sinais" }
      : { tool: "commitment", label: "Meu compromisso" },
    { tool: "rules", label: "Regras de ouro" },
    { tool: "scenario", label: "Meu cenário" },
    { tool: "map", label: "Meu Mapa" },
  ];
}

function organize(path: First48Path): First48Activity {
  return {
    id: "organizar",
    stage: "b",
    n: 5,
    title: "Organize a continuação",
    goal: "Juntar o que você aprendeu e seguir para o plano de 21 dias.",
    minutes: 3,
    blocks: [],
    checklist: [
      check("organizar", "pontos", "Revi os meus pontos de atenção"),
      check("organizar", "ferramentas", "Sei qual ferramenta usar quando bater a vontade de agir"),
      check("organizar", "plano", "Vou seguir para o plano de 21 dias"),
    ],
    tools: toolsOf(path),
  };
}

// ---------- Plano ----------

/**
 * Monta o plano a partir do diagnóstico atual. `scenario` é o cenário que vale para ela (o do
 * perfil, se escolheu; senão o sugerido), usado nos exemplos e no link do cenário.
 */
export function buildFirst48Plan(
  record: DiagnosisRecord,
  scenario?: ScenarioId | null,
): First48Plan {
  const a = record.answers;
  const r = buildDiagnosisResult(a);
  const path = pathOf(a);
  // Com limite de contato, os exemplos nunca saem do cenário do perfil: usam o sugerido.
  const usable =
    scenario && !scenarioById(scenario).safety && path === "conversa" ? scenario : r.scenario;
  return {
    diagnosisId: record.id,
    path,
    activities: [
      understand(a, r, path),
      interrupt(a, path),
      prepare(a, r),
      choose(a, path),
      organize(path),
    ],
    exercise: exerciseOf(a, path),
    nextStep: nextStepOf(a, path, usable),
  };
}

// ---------- Progresso ----------

export type First48Phase = "not_started" | "running" | "time_over";

export interface First48Progress {
  phase: First48Phase;
  /** Etapa sugerida pelo relógio (só sugestão). */
  suggestedStage: First48StageId;
  hoursElapsed: number;
  hoursLeft: number;
  done: number;
  total: number;
  /** Todas as atividades concluídas. */
  complete: boolean;
  /** Primeira atividade não concluída, na ordem. null quando tudo foi feito. */
  next: First48ActivityId | null;
}

export function first48Progress(state: First48State, now = new Date()): First48Progress {
  const done = ACTIVITY_ORDER.filter((id) => state.done[id]).length;
  const next = ACTIVITY_ORDER.find((id) => !state.done[id]) ?? null;
  const base = { done, total: ACTIVITY_ORDER.length, complete: next === null, next };
  if (!state.startedAt)
    return {
      ...base,
      phase: "not_started",
      suggestedStage: "a",
      hoursElapsed: 0,
      hoursLeft: FIRST48_HOURS,
    };
  const hoursElapsed = Math.max(0, (now.getTime() - new Date(state.startedAt).getTime()) / HOUR);
  return {
    ...base,
    phase: hoursElapsed >= FIRST48_HOURS ? "time_over" : "running",
    suggestedStage: hoursElapsed < 24 ? "a" : "b",
    hoursElapsed,
    hoursLeft: Math.max(0, FIRST48_HOURS - hoursElapsed),
  };
}

// ---------- Mudança de diagnóstico ----------

export type DiagnosisChange = "none" | "minor" | "significant";

/**
 * Mudança entre dois diagnósticos. Significativa quando muda o caminho (limite, pausa, espaço ou
 * conversa) ou o principal ponto de atenção: aí o conteúdo das atividades muda de sentido.
 */
export function diagnosisChange(from: DiagnosisAnswers, to: DiagnosisAnswers): DiagnosisChange {
  if (pathOf(from) !== pathOf(to) || attentionOf(from) !== attentionOf(to)) return "significant";
  return JSON.stringify(from) === JSON.stringify(to) ? "none" : "minor";
}

export interface First48Review {
  /** Atividades concluídas com um diagnóstico significativamente diferente do atual. */
  outdated: First48ActivityId[];
  /** A escolha da atividade 4 não existe no caminho atual (ex.: "responder" e agora há bloqueio). */
  choiceInvalid: boolean;
  /** Escolha válida no caminho atual, se houver. */
  choice: First48ChoiceId | null;
}

/**
 * O que revisar depois de refazer o diagnóstico. Nada é desmarcado: as atividades continuam
 * concluídas e só ganham o aviso "atualizada para o seu novo momento".
 */
export function reviewOf(
  state: First48State,
  diagnoses: DiagnosisRecord[],
  plan: First48Plan,
): First48Review {
  const current = diagnoses.find((item) => item.id === plan.diagnosisId);
  const changed = (diagnosisId: string) => {
    if (!current || diagnosisId === current.id) return false;
    const before = diagnoses.find((item) => item.id === diagnosisId);
    // Diagnóstico antigo descartado (versão anterior): trata como mudança significativa.
    return !before || diagnosisChange(before.answers, current.answers) === "significant";
  };
  const outdated = ACTIVITY_ORDER.filter((id) => {
    const done = state.done[id];
    return done ? changed(done.diagnosisId) : false;
  });
  const allowed = plan.nextStep.choices.map((item) => item.id);
  const saved = state.choice?.id;
  const choiceInvalid = Boolean(saved && !allowed.includes(saved));
  return { outdated, choiceInvalid, choice: saved && !choiceInvalid ? saved : null };
}

/** A atividade pode ser concluída. Só a 4 pede algo: uma escolha válida para o caminho atual. */
export const canComplete = (id: First48ActivityId, review: First48Review) =>
  id !== "escolher" || review.choice !== null;

export const choiceLabel = (id: First48ChoiceId) => choiceDef[id].label;
