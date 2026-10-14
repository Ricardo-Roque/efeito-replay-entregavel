// "Meu Mapa de Reconquista": o resultado do diagnóstico de entrada. RASCUNHO de conteúdo.
//
// Cada parte sai das respostas por regras explícitas (lib/jornada/diagnosis.ts para modo de
// contato, cenário, foco e ponto de atenção). Ordem de prioridade em todas as listas:
// 1) limites dele (bloqueio, pedido de não contato, outra relação, pedido de tempo);
// 2) padrão de insistência; 3) momento do término; 4) motivo; 5) dificuldade dela.
// Com limite de contato, nenhuma orientação envolve escrever para ele.
//
// O texto descreve o que ela contou e o que ela pode fazer. Nunca afirma o que ele pensa ou sente.

import {
  attentionOf,
  contactModeOf,
  focusOf,
  hasHardLimit,
  isRecent,
  optionLabel,
  scenarioOf,
} from "@/lib/jornada/diagnosis";
import type {
  AttentionId,
  BreakupReason,
  ContactMode,
  ContactStatus,
  DiagnosisAnswers,
  DiagnosisResult,
  Difficulty,
  Elapsed,
  FirstStep,
  OtherPerson,
} from "@/lib/jornada/types";

const MAX_ITEMS = 5;

/** Junta as listas na ordem de prioridade, sem repetir, até o limite. */
const pick = (...groups: (string | false | undefined)[][]) =>
  [...new Set(groups.flat().filter((item): item is string => Boolean(item)))].slice(0, MAX_ITEMS);

/** "a", "a e b", "a, b e c". */
const listPt = (items: string[]) =>
  items.length <= 1
    ? (items[0] ?? "")
    : `${items.slice(0, -1).join(", ")} e ${items[items.length - 1]}`;

const lower = (text: string) => text.charAt(0).toLowerCase() + text.slice(1);

// ---------- Resumo ----------

const elapsedText: Record<Elapsed, string> = {
  menos7d: "O término é recente: aconteceu há menos de 7 dias.",
  d7a30: "O término aconteceu entre 7 e 30 dias atrás.",
  m1a3: "O término aconteceu entre 1 e 3 meses atrás.",
  m3a6: "O término aconteceu entre 3 e 6 meses atrás.",
  mais6m: "O término aconteceu há mais de 6 meses.",
};

const contactText: Record<ContactStatus, string> = {
  normal: "Vocês ainda conversam normalmente.",
  frio: "Ele responde, mas de forma fria.",
  raro: "Ele responde raramente.",
  nao_responde: "Hoje ele não responde.",
  bloqueou: "Ele bloqueou você.",
  pediu_tempo: "Ele pediu um tempo.",
  pediu_sem_contato: "Ele pediu, com todas as letras, que você não entre em contato.",
};

const reasonText: Record<BreakupReason, string> = {
  discussoes: "Para você, o principal motivo foram as discussões frequentes.",
  distanciamento: "Para você, o principal motivo foi o distanciamento emocional.",
  quebra_confianca: "Para você, o principal motivo foi uma quebra de confiança.",
  traicao: "Para você, o principal motivo foi uma traição.",
  incompatibilidade: "Para você, o principal motivo foram incompatibilidades entre vocês.",
  outro: "O motivo do término ainda não está claro para você.",
};

const otherPersonText: Record<OtherPerson, string> = {
  sim: "Você contou que ele está se envolvendo com outra pessoa.",
  nao: "Pelo que você sabe, ele não está com outra pessoa.",
  nao_sei: "Você não sabe se ele está com outra pessoa, e não precisa descobrir agora.",
};

const difficultyText: Record<Difficulty, string> = {
  ansiedade: "controlar a ansiedade",
  se_contato: "saber se você deve entrar em contato",
  o_que_dizer: "saber o que dizer",
  interpretar: "interpretar as respostas dele",
  frieza: "lidar com a frieza",
  confianca: "reconstruir a confiança",
  afastamento: "respeitar o afastamento",
};

function summaryOf(a: DiagnosisAnswers): string[] {
  const tried = a.tried.filter((item) => item !== "nada").map((item) => optionLabel("tried", item));
  return [
    elapsedText[a.elapsed],
    contactText[a.contact],
    reasonText[a.reason],
    otherPersonText[a.otherPerson],
    tried.length > 0
      ? `Você já tentou ${listPt(tried.map(lower))}.`
      : "Você ainda não tentou nada, então dá para começar com calma.",
    `Sua maior dificuldade hoje é ${difficultyText[a.difficulty]}.`,
  ];
}

// ---------- Ponto de atenção ----------

const headlineOf: Record<AttentionId, string> = {
  bloqueio: "Limite de contato: bloqueio",
  pedido_sem_contato: "Limite de contato pedido por ele",
  outra_relacao: "Ele está em outra relação",
  pedido_tempo: "Tempo pedido por ele",
  insistencia: "Hora de dar espaço",
  termino_recente: "Término recente",
  confianca: "Confiança abalada",
  silencio: "Silêncio do outro lado",
  frieza: "Contato frio",
  conversa_aberta: "Conversa em andamento",
};

const responsePhrase: Partial<Record<ContactStatus, string>> = {
  frio: "estão frias",
  raro: "são raras",
  nao_responde: "não vêm",
};

function attentionText(id: AttentionId, a: DiagnosisAnswers): { title: string; text: string } {
  switch (id) {
    case "bloqueio":
      return {
        title: "Respeitar o bloqueio",
        text: "O bloqueio é um limite que ele colocou. Contornar esse limite (outro perfil, outro número, recado por amigos) expõe você e não muda a decisão dele. O trabalho agora é com você.",
      };
    case "pedido_sem_contato":
      return {
        title: "Respeitar o pedido de não contato",
        text: "Ele pediu para você não entrar em contato. Respeitar esse pedido é o ponto de partida: nenhuma orientação deste mapa envolve escrever para ele.",
      };
    case "outra_relacao":
      return {
        title: "Não disputar com a outra relação",
        text: "Enquanto ele estiver com outra pessoa, o plano não sugere mensagens nem comparações. O foco é você ficar inteira, sem disputa.",
      };
    case "pedido_tempo":
      return {
        title: "Dar o tempo que ele pediu",
        text: "Ele pediu um tempo. Mensagens agora, mesmo leves, passam por cima desse pedido. Use este período para se fortalecer, sem contar os dias.",
      };
    case "insistencia": {
      const tried = a.tried
        .filter((item) => item === "mensagens" || item === "nova_chance" || item === "pessoalmente")
        .map((item) => lower(optionLabel("tried", item)));
      return {
        title: "Interromper o ciclo de tentativas",
        text: `Você já tentou ${listPt(tried)}, e as respostas dele ${responsePhrase[a.contact] ?? "estão difíceis"}. Repetir tentativas aumenta a pressão sobre a conversa. O próximo passo é dar espaço, não mandar mais uma mensagem.`,
      };
    }
    case "termino_recente":
      return {
        title: "Atravessar os primeiros dias",
        text: "Nos primeiros dias depois do término, as emoções ficam mais intensas e a vontade de agir é maior. Decisões importantes, como mandar uma mensagem longa, ficam para depois desse pico.",
      };
    case "confianca":
      return {
        title: "Confiança antes de reaproximação",
        text: `Quando o término envolve ${a.reason === "traicao" ? "uma traição" : "quebra de confiança"}, pedidos de nova chance e promessas não bastam. Confiança se reconstrói com tempo e coerência, não numa conversa só.`,
      };
    case "silencio":
      return {
        title: "Não preencher o silêncio",
        text: "Ele não está respondendo. Mandar mais mensagens para provocar uma resposta costuma piorar o quadro. Por enquanto, a resposta é o silêncio, e insistir não muda isso.",
      };
    case "frieza":
      return {
        title: "Não reagir à frieza",
        text: "As respostas dele estão frias ou espaçadas. Cobrar atenção ou reclamar da frieza deixa a conversa mais pesada. Leveza e espaço vêm antes de qualquer conversa séria.",
      };
    case "conversa_aberta":
      return {
        title: "Manter a conversa leve",
        text: "Vocês ainda conversam. O risco é transformar cada conversa numa tentativa de resolver o término. Conversas curtas e agradáveis vêm antes de qualquer assunto sério.",
      };
  }
}

// ---------- O que fazer agora ----------

function doNowOf(a: DiagnosisAnswers, mode: ContactMode, attention: AttentionId): string[] {
  const byLimit =
    mode === "sem_contato"
      ? [
          "Seguir o plano de 21 dias por você, sem esperar resposta dele",
          "Escrever no Diário o que você queria dizer a ele, sem enviar",
          a.contact === "bloqueou" && "Arquivar as conversas e fotos que mais doem, se isso ajudar",
          a.otherPerson === "sim" && "Silenciar os perfis que fazem você se comparar",
        ]
      : mode === "pausa"
        ? [
            "Combinar com você mesma que não vai escrever durante o tempo que ele pediu",
            "Usar a Pausa sempre que bater vontade de mandar mensagem",
          ]
        : [];

  const byAttention: (string | false)[] =
    attention === "insistencia"
      ? ["Parar as tentativas por enquanto e registrar no Diário cada vez que segurar a vontade"]
      : mode === "aberto"
        ? [
            a.contact === "normal" && "Responder com leveza e encerrar antes de a conversa cansar",
            (a.contact === "frio" || a.contact === "raro") &&
              "Dar espaço entre as mensagens e manter assuntos neutros",
            a.contact === "nao_responde" && "Parar de enviar mensagens enquanto ele não responde",
          ]
        : [];

  const byElapsed: (string | false)[] = [
    isRecent(a) &&
      "Cuidar do básico nestes primeiros dias: dormir, comer e falar com alguém de confiança",
    a.elapsed === "mais6m" &&
      mode === "aberto" &&
      "Olhar para o que mudou em você desde o término antes de pensar em reaproximação",
  ];

  const byReason: Record<BreakupReason, string> = {
    discussoes:
      "Anotar no Diário o que costumava disparar as discussões, para não repetir o padrão",
    distanciamento: "Reconstruir a sua rotina e os seus interesses, independentemente dele",
    quebra_confianca: "Separar o que é dor do que é decisão antes de falar sobre o que aconteceu",
    traicao: "Separar o que é dor do que é decisão antes de falar sobre o que aconteceu",
    incompatibilidade: "Pensar com calma no que, de fato, precisaria ser diferente",
    outro: "Escrever no Diário o que você entende hoje sobre o término",
  };

  // Escrever para ele só entra nas sugestões com contato aberto, sem padrão de insistência e com
  // ele respondendo. Nos outros casos, a mesma dificuldade vira uma orientação sem envio.
  const canWrite = mode === "aberto" && attention !== "insistencia" && a.contact !== "nao_responde";
  const byDifficulty: Record<Difficulty, string> = {
    ansiedade: "Usar a Pausa antes de enviar qualquer mensagem",
    se_contato: canWrite
      ? "Passar pelo checklist da Pausa para decidir se é hora de escrever"
      : mode === "aberto"
        ? "Esperar alguns dias antes de decidir se vai escrever de novo"
        : "Lembrar que, neste momento, a resposta para entrar em contato é não",
    o_que_dizer: canWrite
      ? "Usar os modelos do seu cenário como ponto de partida, sempre com as suas palavras"
      : "Escrever no Diário, e não para ele, o que você gostaria de dizer",
    interpretar: "Registrar as respostas dele no Diário, sem tirar conclusão de uma mensagem só",
    frieza: "Manter o seu ritmo, sem cobrar atenção",
    confianca: "Mostrar coerência com o tempo, sem promessas grandes",
    afastamento: "Escrever no Diário, e não para ele, nos dias em que o afastamento pesa mais",
  };

  const byTried = [
    a.tried.includes("contato_zero") &&
      (mode !== "aberto" || a.contact === "nao_responde") &&
      "Manter o contato zero que você já começou",
  ];

  return pick(
    byLimit,
    byAttention,
    byTried,
    byElapsed,
    [byDifficulty[a.difficulty]],
    [byReason[a.reason]],
  );
}

// ---------- O que evitar ----------

const avoidByContact: Record<ContactStatus, string[]> = {
  bloqueou: [
    "Criar outro perfil ou número para falar com ele",
    "Mandar recado por amigos ou familiares",
    "Checar se ele desbloqueou",
  ],
  pediu_sem_contato: [
    'Escrever "só para saber se está bem"',
    "Mandar recado por amigos ou familiares",
    "Aparecer em lugares onde ele está",
  ],
  pediu_tempo: ["Perguntar quanto tempo vai durar", 'Mandar mensagem "só para saber como está"'],
  nao_responde: ["Mandar várias mensagens seguidas", "Cobrar a falta de resposta"],
  frio: ["Reclamar da frieza", "Perguntar o que ele sente"],
  raro: ["Cobrar a demora das respostas", "Perguntar o que ele sente"],
  normal: ["Transformar toda conversa numa DR", "Cobrar uma definição sobre a relação agora"],
};

function avoidOf(a: DiagnosisAnswers): string[] {
  return pick(
    avoidByContact[a.contact],
    [
      a.otherPerson === "sim" && "Procurar a outra pessoa ou se comparar com ela",
      a.otherPerson === "nao_sei" && "Investigar as redes sociais dele para descobrir",
    ],
    [
      a.tried.includes("nova_chance") && "Pedir uma nova chance outra vez",
      a.tried.includes("desculpas") && "Repetir pedidos de desculpas",
      a.tried.includes("mensagens") &&
        !hasHardLimit(a) &&
        "Mandar uma mensagem longa para explicar tudo",
    ],
    [isRecent(a) && "Tomar decisões importantes no calor do momento"],
    [
      (a.reason === "quebra_confianca" || a.reason === "traicao") &&
        "Prometer mudanças que você ainda não consegue cumprir",
      a.reason === "discussoes" && "Retomar a discussão que levou ao término",
      a.difficulty === "interpretar" &&
        "Tirar conclusões sobre o que ele sente a partir de uma mensagem",
    ],
  );
}

// ---------- Primeiro passo ----------

function firstStepOf(a: DiagnosisAnswers, mode: ContactMode, attention: AttentionId): FirstStep {
  if (mode === "sem_contato")
    return {
      title: "Escreva a mensagem que você não vai enviar",
      text: "No Diário, coloque para fora tudo o que gostaria de dizer a ele. Fica só com você e ajuda a atravessar a vontade de escrever.",
      target: "diary",
      action: "Abrir o Diário",
    };
  if (mode === "pausa")
    return {
      title: "Antes de escrever, use a Pausa",
      text: "Ele pediu um tempo. Se der vontade de escrever, comece pela Pausa: enquanto o tempo durar, a mensagem fica guardada com você.",
      target: "pause",
      action: "Abrir a Pausa",
    };
  if (attention === "insistencia" || a.difficulty === "ansiedade" || a.difficulty === "se_contato")
    return {
      title: "Antes de escrever, use a Pausa",
      text: "Se der vontade de mandar mensagem, escreva primeiro na Pausa. O checklist ajuda a decidir com calma, e o rascunho fica guardado por 24 horas.",
      target: "pause",
      action: "Abrir a Pausa",
    };
  if (a.difficulty === "interpretar")
    return {
      title: "Conheça os sinais",
      text: "Veja quais sinais indicam abertura, alerta ou pedido de espaço, para não decidir nada por uma mensagem só.",
      target: "signals",
      action: "Ver os sinais",
    };
  if (a.difficulty === "o_que_dizer")
    return {
      title: "Veja o que fazer no seu cenário",
      text: "O que fazer, o que evitar e modelos curtos para usar como ponto de partida, sempre passando pela Pausa.",
      target: "scenario",
      action: "Abrir o cenário",
    };
  if (a.difficulty === "frieza" || attention === "frieza" || attention === "silencio")
    return {
      title: "Leia o que nunca enviar",
      text: "As mensagens que mais pesam quando a conversa está fria ou parada, para você não cair nelas.",
      target: "never",
      action: "Ver o que nunca enviar",
    };
  if (a.difficulty === "confianca" || attention === "confianca")
    return {
      title: "Leia as Regras de ouro",
      text: "Os erros que mais afastam e como não voltar ao padrão antigo, antes de qualquer conversa sobre o que aconteceu.",
      target: "rules",
      action: "Abrir as Regras de ouro",
    };
  if (a.difficulty === "afastamento")
    return {
      title: "Escreva no Diário o que você sente",
      text: "Nos dias em que o afastamento pesa mais, escreva no Diário o que você gostaria de dizer. Fica só com você.",
      target: "diary",
      action: "Abrir o Diário",
    };
  return {
    title: "Comece pelo dia de hoje do plano",
    text: "O plano de 21 dias organiza o caminho em passos pequenos. O dia de hoje leva poucos minutos.",
    target: "plan",
    action: "Abrir o plano",
  };
}

// ---------- Cenário ----------

function scenarioNoteOf(a: DiagnosisAnswers): string | undefined {
  if (a.contact === "pediu_sem_contato")
    return 'Ele pediu para não haver contato. As orientações do cenário "Ele me bloqueou" valem para qualquer limite de contato.';
  if (a.contact === "pediu_tempo")
    return "Os modelos de mensagem deste cenário ficam para depois do tempo que ele pediu.";
  if (a.contact === "raro") return "Respostas raras seguem as mesmas orientações da frieza.";
  return undefined;
}

// ---------- Resultado ----------

export function buildDiagnosisResult(a: DiagnosisAnswers): DiagnosisResult {
  const contactMode = contactModeOf(a);
  const attention = attentionOf(a);
  const note = scenarioNoteOf(a);
  return {
    contactMode,
    scenario: scenarioOf(a),
    ...(note ? { scenarioNote: note } : {}),
    focus: focusOf(a, contactMode),
    showCareLines: a.difficulty === "ansiedade" || isRecent(a),
    headline: headlineOf[attention],
    summary: summaryOf(a),
    attention: { id: attention, ...attentionText(attention, a) },
    doNow: doNowOf(a, contactMode, attention),
    avoid: avoidOf(a),
    firstStep: firstStepOf(a, contactMode, attention),
  };
}
