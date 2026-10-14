// Conteúdo do plano de 21 dias. RASCUNHO editorial: precisa de revisão antes de ser aprovado.
// Formato de dado, sem React. A regra de personalização mora em lib/plan-guide.ts.
//
// Cada dia segue a mesma estrutura: objetivo, conceito, exemplo, orientação prática, o que
// evitar, ação do dia, exercício, checklist, ferramentas e a orientação para o momento dela
// (guide). O conteúdo-base (action, practice, exercise, checklist) vale para quem tem conversa
// aberta e precisa ser seguro para todo mundo nos dias sem contato; nos dias de comunicação, as
// variantes trocam a ação por uma versão sem envio (pausa, espaço, limite, sem diagnóstico).
//
// Regras de conteúdo: nada de contornar bloqueio, usar terceiros, insistir ou pressionar.
// "Não" e pedido de distância são respostas. Nenhuma promessa de que ele volta. Nenhum dia
// depende de ele responder: o checklist só tem o que depende dela, e concluir não exige marcar.
// Exemplos são situações ilustrativas, nunca depoimentos.

import type { LabeledLink } from "@/lib/app-link";
import type { EmojiName, Pose } from "@/lib/illustrations";

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

/** Item de checklist. O id é estável: a marcação fica gravada por ele (JornadaData.plan). */
export interface PlanCheck {
  id: string;
  text: string;
}

export interface PlanPoint {
  title: string;
  text: string;
}

export interface PlanExercise {
  title: string;
  steps: string[];
  /** Perguntas para escrever. Com elas, a tela mostra os campos e "Guardar no Diário". */
  prompts?: string[];
}

/** Situação ilustrativa, com um contraste opcional entre o que piora e o que ajuda. */
export interface PlanExample {
  situation: string;
  contrast?: { avoid: string; better: string };
  takeaway: string;
}

/**
 * Momento dela para o plano. Os quatro primeiros são o caminho do diagnóstico (pathOf); bloqueio
 * e outra refinam o limite; sem_diagnostico é quem ainda não respondeu.
 */
export type PlanGuideKey =
  "conversa" | "espaco" | "pausa" | "limite" | "bloqueio" | "outra" | "sem_diagnostico";

/** Orientação para um momento. Campos ausentes mantêm o conteúdo-base do dia. */
export interface PlanVariant {
  text: string[];
  action?: string;
  /** Troca o exemplo quando o do dia não combina com o momento (ex.: envio, com limite). */
  example?: PlanExample;
  practice?: string[];
  exercise?: PlanExercise;
  /** Troca o checklist inteiro (ids próprios quando o item muda de sentido). */
  checklist?: PlanCheck[];
  /** Entram antes das ferramentas do dia. */
  tools?: LabeledLink[];
}

/** Observação extra, somada à orientação do momento. `conversaOnly`: só com conversa aberta. */
export interface PlanNote {
  text: string;
  link?: LabeledLink;
  conversaOnly?: boolean;
}

export interface PlanGuide {
  conversa: PlanVariant;
  espaco: PlanVariant;
  pausa: PlanVariant;
  limite: PlanVariant;
  bloqueio?: PlanVariant;
  outra?: PlanVariant;
  sem_diagnostico?: PlanVariant;
  /** Traição ou quebra de confiança. */
  confianca?: PlanNote;
  /** Término há menos de 7 dias. */
  recente?: PlanNote;
}

export interface PlanDay {
  day: number;
  phase: PlanPhase["phase"];
  title: string;
  /** Leitura e execução, sem contar a escrita mais longa do exercício. */
  minutes: number;
  /** 1. Objetivo do dia. */
  goal: string;
  /** 2. Explicação do conceito. */
  concept: string[];
  points?: PlanPoint[];
  /** 3. Exemplo de situação realista. */
  example: PlanExample;
  /** Exemplos "evitar" da Central (ids), mostrados com a alternativa de cada um. */
  compare?: string[];
  /** 4. Orientação prática. */
  practice: string[];
  /** 5. O que evitar. */
  avoid: string[];
  /** Ação de hoje. */
  action: string;
  /** 6. Exercício. */
  exercise: PlanExercise;
  /** 7. Checklist. */
  checklist: PlanCheck[];
  /** 8. Ferramentas relacionadas (a primeira é a principal). */
  tools: LabeledLink[];
  /** 9. Orientação conforme o diagnóstico. */
  guide: PlanGuide;
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
    goal: "Saber quando uma mensagem faz sentido, e quando o melhor é não enviar",
    emoji: "fase2",
    pose: "sorrindoCelular",
  },
  {
    phase: 3,
    numeral: "III",
    title: "Reconexão",
    first: 14,
    last: 18,
    objective: "Quando há conversa, torná-la leve. Quando não há, cuidar de você.",
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

const c = (id: string, text: string): PlanCheck => ({ id, text });

// Ferramentas mais usadas.
const DIARY: LabeledLink = { link: { kind: "diary" } };
const PAUSE: LabeledLink = { link: { kind: "pause" } };
const COMMITMENT: LabeledLink = { link: { kind: "commitment" } };
const MAP: LabeledLink = { link: { kind: "map" } };
const DIAGNOSIS: LabeledLink = { link: { kind: "diagnosis" } };
const SIGNALS: LabeledLink = { link: { kind: "rules", section: "signals" } };

/** Texto padrão para quem ainda não fez o diagnóstico. */
const NO_DIAGNOSIS =
  "Você ainda não fez o diagnóstico, então este dia mostra a versão geral. O diagnóstico leva poucos minutos e ajusta as orientações ao seu momento, inclusive quando há bloqueio, pedido de distância ou outra relação.";

/** Exercício de escrita sem envio, usado nos dias de comunicação para quem não vai enviar nada. */
const writeOnly = (title: string, prompts: string[]): PlanExercise => ({
  title,
  steps: [
    "Escreva as respostas abaixo com as suas palavras, sem se corrigir.",
    "Guarde no Diário. Este texto é seu e não é para enviar.",
  ],
  prompts,
});

export const planDays: PlanDay[] = [
  // ---------------------------------------------------------------- Fase 1 · Reset emocional
  {
    day: 1,
    phase: 1,
    title: "Seu ponto de partida",
    minutes: 5,
    goal: "Entender como o plano funciona e registrar, sem filtro, onde você está hoje.",
    concept: [
      "Depois de um término, quase tudo o que dá vontade de fazer nasce da urgência: escrever, explicar, checar, pedir. A urgência é compreensível, mas costuma produzir justamente as atitudes que aumentam a distância.",
      "Este plano trabalha o que está sob o seu controle: como você reage, como se comunica e como cuida de você. Ele não controla a decisão dele, e nenhum dia depende de ele responder.",
      "As fases têm uma ordem por um motivo: primeiro estabilidade, depois comunicação, depois reconexão, quando houver espaço para ela. Pular direto para a mensagem antes de estar estável é o erro mais comum.",
    ],
    points: [
      {
        title: "O que muda em 21 dias",
        text: "A sua forma de agir e de se comunicar. Esse é o resultado que depende de você.",
      },
      {
        title: "O que não muda por decisão sua",
        text: "O que ele sente e decide. Respeitar isso faz parte do método, não é desistência.",
      },
    ],
    example: {
      situation:
        "Duas semanas depois do término, você abre a conversa dele várias vezes por dia, escreve e apaga, e passa a noite relendo mensagens antigas, procurando a frase certa para mandar.",
      takeaway:
        "Antes de qualquer frase, falta um ponto de partida claro: como você está, o que tem feito por impulso e o que quer mudar. É isso que o Dia 1 constrói.",
    },
    practice: [
      "Registre como você está hoje no Diário: o humor do dia e duas ou três frases, sem se corrigir.",
      "Confira o seu diagnóstico e o seu cenário. São eles que ajustam as orientações de cada dia.",
      "Leia o Meu compromisso e escolha uma frase para lembrar nos momentos difíceis.",
    ],
    avoid: [
      "Ler o plano inteiro hoje procurando o dia da mensagem.",
      "Usar o registro para escrever para ele: o Diário é seu.",
      "Medir o seu progresso pela resposta dele.",
    ],
    action: "Faça o seu primeiro registro no Diário: como você está hoje, sem filtro.",
    exercise: {
      title: "Seu retrato de hoje",
      steps: [
        "Escolha o humor do dia no Diário.",
        "Responda às perguntas abaixo com sinceridade.",
        "Guarde no Diário. No Dia 7 e no Dia 18 você vai reler este texto.",
      ],
      prompts: [
        "Como eu estou hoje, em uma frase?",
        "O que eu mais tenho feito por impulso desde o término?",
        "O que eu quero que seja diferente em mim daqui a 21 dias?",
      ],
    },
    checklist: [
      c("d1-cenario", "Conferir o meu diagnóstico e o meu cenário"),
      c("d1-diario", "Fazer o primeiro registro no Diário"),
      c("d1-compromisso", "Ler o Meu compromisso"),
    ],
    tools: [DIARY, MAP, COMMITMENT],
    guide: {
      conversa: {
        text: [
          "Vocês ainda conversam. Isso não muda o começo: os primeiros dias são para estabilizar, não para intensificar a conversa. Se ele escrever, responda curto e no seu tempo.",
        ],
      },
      espaco: {
        text: [
          "Hoje ele não tem respondido. O plano não depende disso: tudo o que você fizer nos próximos dias é por você e para você.",
        ],
      },
      pausa: {
        text: [
          "Ele pediu um tempo. Os 21 dias respeitam esse pedido: nenhuma tarefa pede que você escreva para ele enquanto o tempo durar.",
        ],
      },
      limite: {
        text: [
          "Existe um limite no seu cenário. O plano inteiro vale para você, sem nenhuma tarefa de contato: os dias de comunicação viram dias de escrita para o Diário.",
        ],
      },
      sem_diagnostico: { text: [NO_DIAGNOSIS], tools: [DIAGNOSIS] },
      recente: {
        text: "O término é muito recente. Se hoje o objetivo for só atravessar o dia, já conta. Faça um registro curto e volte amanhã.",
      },
    },
  },
  {
    day: 2,
    phase: 1,
    title: "Sair do modo reação",
    minutes: 5,
    goal: "Reconhecer o pico de impulso e atravessá-lo sem agir.",
    concept: [
      "Impulso é a vontade urgente de fazer algo agora para aliviar a ansiedade: mandar mensagem, ligar, olhar o perfil. Ele parece uma decisão, mas é uma busca de alívio. E o alívio dura pouco: depois de agir, a ansiedade costuma voltar, junto com o arrependimento.",
      "A vontade costuma subir, chegar ao máximo e baixar em alguns minutos, se não for alimentada. Por isso o objetivo de hoje não é deixar de sentir. É criar um intervalo entre sentir e fazer.",
    ],
    points: [
      {
        title: "Sinais de que é impulso",
        text: 'Pressa, coração acelerado, um pensamento que se repete ("preciso falar com ele agora") e a sensação de que, se não fizer agora, vai perder a chance.',
      },
      {
        title: "O intervalo",
        text: "Respirar, dar nome ao que sente e escrever na Pausa, nunca direto na conversa dele.",
      },
    ],
    example: {
      situation:
        'Domingo à noite, você vê uma foto dele num bar. Em segundos, está com a conversa aberta, digitando "pelo visto você está ótimo, né".',
      takeaway:
        "Não era uma decisão, era o pico. Se você abre a Pausa, respira e escreve lá, o texto fica guardado e o pico passa. No dia seguinte, com calma, a decisão costuma ser outra.",
    },
    practice: [
      "Quando a vontade vier, pare e faça cinco respirações lentas, soltando o ar mais devagar do que puxou.",
      "Dê nome ao que sente, em uma palavra: saudade, raiva, medo, ciúme, solidão.",
      "Escreva na Pausa tudo o que queria dizer. Lá, o texto fica guardado por 24 horas, longe do botão de enviar.",
      "Depois, registre no Diário o que disparou a vontade e o que você fez com ela.",
    ],
    avoid: [
      'Escrever direto na conversa dele, mesmo "só para rascunhar".',
      "Tomar qualquer decisão no meio do pico.",
      "Se culpar por sentir a vontade: sentir não é agir.",
    ],
    action:
      "Na próxima vez que sentir vontade de mandar mensagem, abra a Pausa e escreva lá, não no WhatsApp.",
    exercise: {
      title: "O mapa do seu impulso",
      steps: [
        "Lembre da última vez que agiu por impulso desde o término.",
        "Responda às perguntas abaixo.",
        "Guarde no Diário. Saber o que dispara a vontade ajuda no Dia 5.",
      ],
      prompts: [
        "O que aconteceu logo antes da vontade (hora, lugar, o que eu vi)?",
        "O que eu senti no corpo?",
        "O que eu fiz, e como me senti uma hora depois?",
      ],
    },
    checklist: [
      c("d2-respirar", "Fazer 5 respirações lentas quando a vontade aparecer"),
      c("d2-pausa", "Usar a Pausa em vez de escrever na conversa"),
      c("d2-registro", "Registrar no Diário o que disparou a vontade"),
    ],
    tools: [PAUSE, DIARY, { link: { kind: "rules", section: "relapse" } }],
    guide: {
      conversa: {
        text: [
          "Como vocês conversam, o impulso pode aparecer como resposta rápida demais, mensagem a mais ou pergunta sobre a relação. Use a Pausa também para respostas, não só para começar conversas.",
        ],
      },
      espaco: {
        text: [
          'Sem resposta dele, o impulso mais comum é mandar "só mais uma". Hoje, toda vontade de escrever vai para a Pausa, e fica lá.',
        ],
      },
      pausa: {
        text: [
          "Ele pediu um tempo. Toda vontade de escrever vai para a Pausa, que vai lembrar você do pedido dele. Escrever lá é permitido; mandar para ele, não.",
        ],
      },
      limite: {
        text: [
          "No seu cenário, a vontade de escrever encontra um limite. A Pausa já sabe disso: guarda o que você escreveu e mostra que não é para enviar. Escrever ali alivia sem ultrapassar nada.",
        ],
      },
      bloqueio: {
        text: [
          "Ele bloqueou o contato. O impulso pode aparecer como vontade de procurar outro caminho: outro número, outro perfil, um amigo em comum. Isso é ultrapassar o limite dele. Escreva na Pausa e guarde.",
        ],
      },
      sem_diagnostico: { text: [NO_DIAGNOSIS], tools: [DIAGNOSIS] },
      recente: {
        text: "Nos primeiros dias depois do término, os picos são mais frequentes. É esperado. Não conte quantas vezes a vontade veio; conte quantas vezes você usou o intervalo.",
      },
    },
  },
  {
    day: 3,
    phase: 1,
    title: "Contato zero consciente",
    minutes: 5,
    goal: "Definir um período sem iniciar conversa e decidir como lidar com assuntos práticos.",
    concept: [
      "Contato zero consciente é um período em que você não inicia conversa com ele. Não é jogo, castigo nem estratégia para provocar saudade. É tempo para parar de reagir e recuperar a clareza.",
      'A diferença está na intenção. Contato zero "para ver se ele sente falta" mantém você presa ao que ele faz: você conta os dias e checa se ele percebeu. Contato zero consciente mantém o foco em você.',
      "Quando há assuntos práticos (filhos, contas, objetos, trabalho), o contato acontece, mas fica restrito ao assunto: claro, educado e curto.",
    ],
    points: [
      {
        title: "Prazo",
        text: 'Sugestão: até o fim da Fase 1 (Dia 7). Um prazo definido é mais fácil de cumprir do que "até eu aguentar".',
      },
      {
        title: "Se ele escrever",
        text: "Contato zero é sobre não iniciar. Se ele escrever, você pode responder com calma, no seu tempo, sem abrir outros assuntos.",
      },
    ],
    example: {
      situation:
        'Vocês dividem os cuidados com o cachorro. Ele escreve: "Posso buscar o Thor no sábado?". Você pensa em responder e emendar um "aliás, precisamos conversar".',
      contrast: {
        avoid: "Pode. Aliás, a gente precisa conversar sobre a gente, né?",
        better: "Pode sim. Ele vai estar pronto às 10h.",
      },
      takeaway:
        "Puxar a relação para dentro de um assunto prático costuma deixar a outra pessoa na defensiva e torna difícil até o que era simples. A resposta prática fica no assunto.",
    },
    practice: [
      'Escolha o seu prazo e escreva no Diário: "Até [data], eu não inicio conversa".',
      "Liste os assuntos práticos que podem exigir contato e decida como responder: curto, educado e no assunto.",
      "Combine com você o que fazer quando a vontade vier: Pausa, respiração, uma amiga.",
    ],
    avoid: [
      'Anunciar o contato zero para ele ("vou sumir um tempo").',
      "Usar um assunto prático como pretexto para puxar conversa.",
      "Contar os dias esperando que ele perceba.",
    ],
    action: "Decida por quanto tempo você não vai iniciar conversa e registre no Diário.",
    exercise: {
      title: "Seu acordo com você",
      steps: ["Responda às perguntas abaixo.", "Guarde no Diário e releia no Dia 7."],
      prompts: [
        "Até quando eu não vou iniciar conversa?",
        "Por que isso é importante para mim (e não para ele)?",
        "Que assuntos práticos podem aparecer, e como vou responder?",
      ],
    },
    checklist: [
      c("d3-prazo", "Escolher o meu prazo"),
      c("d3-motivo", "Anotar no Diário o meu motivo"),
      c("d3-pratico", "Definir como responder assuntos práticos"),
    ],
    tools: [
      DIARY,
      COMMITMENT,
      { link: { kind: "message", id: "perg-pratico" }, label: "Exemplo de resposta prática" },
    ],
    guide: {
      conversa: {
        text: [
          "Mesmo com conversa aberta, um período sem iniciar ajuda a sair do modo reação. Se ele escrever, responda com leveza e encerre antes de a conversa esfriar. Você não precisa sumir; só não precisa puxar.",
        ],
      },
      espaco: {
        text: [
          "Ele não tem respondido. Aqui, não iniciar conversa também é respeitar a falta de reciprocidade: uma nova mensagem não muda o silêncio, e cada tentativa sem resposta pesa em você.",
        ],
      },
      pausa: {
        text: [
          "Ele pediu um tempo. O seu período sem iniciar conversa dura, no mínimo, o tempo que ele pediu. Se ele não disse quanto, não cobre um prazo.",
        ],
      },
      limite: {
        text: [
          "No seu cenário, não iniciar contato não é uma escolha estratégica: é o respeito a um limite. O exercício de hoje é sobre o que fazer com a vontade, já que o contato não está em questão.",
        ],
      },
      bloqueio: {
        text: [
          "Ele bloqueou o contato. Aqui, contato zero significa não procurar nenhum outro caminho até ele: nem outro número, nem redes, nem amigos. Se houver um assunto prático inevitável (bens, documentos), resolva por um meio formal ou com a ajuda de alguém de confiança, sem recados pessoais.",
        ],
      },
      outra: {
        text: [
          "Ele está com outra pessoa. Não iniciar contato também protege você de situações que machucam e de interferir numa relação que não é a sua.",
        ],
      },
      sem_diagnostico: { text: [NO_DIAGNOSIS], tools: [DIAGNOSIS] },
    },
  },
  {
    day: 4,
    phase: 1,
    title: "Parar de checar o perfil dele",
    minutes: 5,
    goal: "Reduzir a checagem das redes dele, que realimenta a ansiedade.",
    concept: [
      'Checar o perfil dele dá um alívio rápido ("só quero saber como ele está") e cobra caro depois: cada story, horário online ou curtida vira uma história que você completa sozinha, quase sempre do jeito que mais dói.',
      "As redes mostram recortes. Uma foto sorrindo não diz que ele está bem, e uma postagem triste não é um recado para você. Ler recortes como sinais mantém você reagindo a coisas que talvez nem tenham relação com você.",
      "Silenciar é diferente de bloquear. Silenciar é privado: ele não fica sabendo, e você para de receber o estímulo. Não é recado nem castigo. É proteção.",
    ],
    example: {
      situation:
        'Você vê que ele curtiu a foto de uma colega. Passa uma hora olhando o perfil dela e escreve para uma amiga: "acho que ele já está com outra". No dia seguinte, descobre que era uma colega de trabalho comemorando uma promoção.',
      takeaway:
        "Uma curtida virou uma noite inteira de angústia. O problema não era a curtida, era o hábito de procurar sinais. Silenciar corta o ciclo antes de ele começar.",
    },
    practice: [
      "Silencie os stories e as publicações dele. No Instagram: perfil dele > Seguindo > Silenciar.",
      "Tire a conversa dele dos fixados e, se ajudar, arquive.",
      "Se houver perfis que levam até ele (amigos, família), silencie também.",
      "Quando der vontade de olhar, anote no Diário em vez de abrir o app. Ver a frequência ajuda a reduzir.",
    ],
    avoid: [
      "Deixar de seguir ou bloquear como recado: isso vira mensagem.",
      "Usar o perfil de outra pessoa para olhar.",
      "Postar pensando no que ele vai achar.",
    ],
    action: "Silencie hoje os stories e as publicações dele, e os perfis que levam até ele.",
    exercise: {
      title: "Registro das checagens",
      steps: [
        "Durante o dia, cada vez que der vontade de olhar o perfil dele, anote no Diário em vez de olhar.",
        "À noite, responda às perguntas abaixo.",
      ],
      prompts: [
        "Quantas vezes a vontade apareceu?",
        "Em que momentos do dia ela foi mais forte?",
        "Como eu me senti depois de não olhar?",
      ],
    },
    checklist: [
      c("d4-silenciar", "Silenciar stories e publicações dele"),
      c("d4-fixados", "Tirar a conversa dele dos fixados"),
      c("d4-registro", "Anotar no Diário quando a vontade aparecer"),
    ],
    tools: [DIARY, { link: { kind: "rules", section: "relapse" } }, PAUSE],
    guide: {
      conversa: {
        text: [
          "Mesmo com conversa, o que ele posta não é assunto para vocês. Comentar stories ou perguntar sobre fotos costuma soar como vigilância.",
        ],
      },
      espaco: {
        text: [
          "Sem resposta dele, as redes viram o lugar onde você procura respostas. Elas não vão dar. Silenciar evita que você interprete o silêncio dele pelo que ele posta.",
        ],
      },
      pausa: {
        text: [
          "Durante o tempo que ele pediu, acompanhar as redes dele é uma forma de continuar presente sem ele saber. Silenciar ajuda a respeitar o pedido de verdade.",
        ],
      },
      limite: {
        text: [
          "No seu cenário, olhar o perfil dele mantém você perto de um lugar onde não há espaço para você agora. Silenciar, e se precisar deixar de seguir, é cuidado com você, não recado.",
        ],
      },
      bloqueio: {
        text: [
          "Se ele bloqueou, não tente ver o perfil por outra conta nem pelo perfil de amigas. Checar se ele desbloqueou também é checagem: inclua no seu registro.",
        ],
      },
      outra: {
        text: [
          "Ele está com outra pessoa. Olhar o perfil dela, comparar fotos ou procurar sinais da relação é o que mais machuca. Silencie os dois perfis e os de quem posta sobre eles.",
        ],
      },
      sem_diagnostico: { text: [NO_DIAGNOSIS], tools: [DIAGNOSIS] },
    },
  },
  {
    day: 5,
    phase: 1,
    title: "Um plano para as horas vulneráveis",
    minutes: 6,
    goal: "Identificar os seus horários de maior risco e decidir antes o que fazer neles.",
    concept: [
      "O impulso não aparece por acaso. Ele costuma ter hora e contexto: antes de dormir, no domingo à tarde, depois de beber, quando você chega em casa sozinha, quando vê algo que lembra ele.",
      'No pico, decidir é difícil. Por isso o plano é feito antes, com a cabeça calma, no formato "quando X acontecer, eu faço Y". Quanto mais concreto, mais fácil de cumprir.',
      "Mensagens enviadas de madrugada, depois de beber ou logo após um dia ruim costumam carregar mais emoção do que você gostaria. São os momentos em que o plano mais ajuda.",
    ],
    points: [
      {
        title: "Formato do plano",
        text: '"Quando [situação], eu vou [ação alternativa]. Se a vontade continuar, eu [segunda opção]."',
      },
    ],
    example: {
      situation:
        "Você percebe que todas as mensagens de que se arrependeu foram enviadas entre 23h e 1h. Decide carregar o celular na sala e deixar um livro na cabeceira.",
      takeaway:
        "Quando a vontade vem, o celular está a dez passos, e a decisão já foi tomada horas antes. O plano faz o trabalho que a força de vontade não consegue fazer no pico.",
    },
    practice: [
      "Liste os seus dois horários ou situações mais difíceis.",
      "Para cada um, escreva uma ação alternativa concreta e uma segunda opção.",
      'Combine com uma amiga um "me liga se eu te mandar um sinal".',
      "À noite, deixe o celular carregando longe da cama.",
    ],
    avoid: [
      'Planos vagos ("vou tentar me distrair").',
      "Contar só com força de vontade no momento do pico.",
      "Beber para aliviar a saudade com o celular por perto.",
    ],
    action: "Escolha as suas duas horas mais difíceis e escreva o que vai fazer em cada uma.",
    exercise: {
      title: "Meu plano para as horas difíceis",
      steps: ["Responda às perguntas abaixo.", "Guarde no Diário e releia antes de dormir."],
      prompts: [
        "Situação difícil 1: quando acontece, e o que eu vou fazer?",
        "Situação difícil 2: quando acontece, e o que eu vou fazer?",
        "Quem eu posso chamar se a vontade continuar?",
      ],
    },
    checklist: [
      c("d5-horarios", "Identificar as minhas duas horas mais difíceis"),
      c("d5-plano", "Escrever uma ação alternativa para cada uma"),
      c("d5-apoio", "Combinar um apoio com alguém de confiança"),
      c("d5-celular", "Deixar o celular longe na hora de dormir"),
    ],
    tools: [DIARY, PAUSE, COMMITMENT],
    guide: {
      conversa: {
        text: [
          'Com conversa aberta, as horas vulneráveis também são as horas em que você responde rápido demais ou estica a conversa. Inclua no plano: "depois das 22h, eu respondo amanhã".',
        ],
      },
      espaco: {
        text: [
          'Sem resposta dele, as horas vulneráveis são quando a vontade de mandar "só mais uma" aparece. No seu plano, a Pausa é a primeira opção e uma pessoa de confiança é a segunda.',
        ],
      },
      pausa: {
        text: [
          'Ele pediu um tempo. As horas vulneráveis são as mais arriscadas para quebrar esse pedido. Deixe escrito no plano: "nessas horas, eu escrevo na Pausa e guardo".',
        ],
      },
      limite: {
        text: [
          "No seu cenário, a vontade não pode virar contato. Faça um plano que mantenha o celular longe nessas horas e que tenha uma pessoa com quem você possa conversar.",
        ],
      },
      sem_diagnostico: { text: [NO_DIAGNOSIS], tools: [DIAGNOSIS] },
      recente: {
        text: "Nas primeiras semanas, quase toda noite pode ser difícil. Se for o seu caso, comece por um único horário: o de dormir.",
      },
    },
  },
  {
    day: 6,
    phase: 1,
    title: "Rotina e autocuidado",
    minutes: 5,
    goal: "Recuperar o básico (sono, comida, movimento e vínculos) que sustenta uma comunicação calma.",
    concept: [
      "Cansaço, fome e isolamento deixam qualquer pessoa mais reativa. Uma noite mal dormida diminui a paciência no dia seguinte, e é aí que o impulso ganha força.",
      "Autocuidado aqui não é sobre aparência nem sobre mostrar para ele que você está bem. É sobre ter um dia que se sustente sem depender de notícia dele.",
      "Comece pequeno. Uma rotina realista que você cumpre vale mais do que uma rotina ideal que dura dois dias.",
    ],
    points: [
      {
        title: "Os quatro pilares",
        text: "Sono (horário para deitar), alimentação (refeições em horário), movimento (20 minutos de caminhada já contam) e vínculo (uma conversa por dia com alguém que gosta de você).",
      },
      {
        title: "Quando procurar ajuda",
        text: "Se há semanas você não consegue dormir, comer ou trabalhar, ou se os pensamentos ficaram pesados demais, procure um profissional de saúde. Pedir ajuda faz parte do cuidado, não é fraqueza.",
      },
    ],
    example: {
      situation:
        "Na primeira semana depois do término, você pula refeições e dorme às 3h. Em vez de mudar tudo, escolhe duas coisas: deitar até meia-noite e almoçar com uma colega duas vezes na semana.",
      takeaway:
        "Duas mudanças pequenas e possíveis já deixam as noites menos longas. É assim que a rotina volta: aos poucos, sem prova de nada para ninguém.",
    },
    practice: [
      "Escolha um horário para deitar nesta semana.",
      "Faça pelo menos duas refeições de verdade hoje.",
      "Mova o corpo por 20 minutos, do jeito que der.",
      "Converse com alguém de confiança sobre qualquer assunto, inclusive o término, se quiser.",
    ],
    avoid: [
      "Postar a rotina para que ele veja.",
      "Trocar tudo de uma vez e desistir no terceiro dia.",
      'Se isolar para "não incomodar ninguém".',
    ],
    action: "Escolha uma coisa só para você hoje e faça.",
    exercise: {
      title: "Inventário do básico",
      steps: ["Responda às perguntas abaixo.", "Guarde no Diário."],
      prompts: [
        "De 0 a 10, como estão o meu sono, a minha alimentação e o meu movimento?",
        "Qual dos três é mais fácil de melhorar um pouco nesta semana?",
        "Com quem eu posso conversar nos próximos dias?",
      ],
    },
    checklist: [
      c("d6-sono", "Dormir no meu horário"),
      c("d6-algo", "Fazer uma coisa só para mim"),
      c("d6-vinculo", "Conversar com alguém de confiança"),
    ],
    tools: [DIARY, COMMITMENT],
    guide: {
      conversa: {
        text: [
          "Com conversa aberta, estar descansada muda o tom do que você escreve. Se você estiver exausta, responder amanhã é sempre uma opção.",
        ],
      },
      espaco: {
        text: [
          "Sem resposta dele, é fácil passar o dia esperando. Uma rotina com horários tira o centro do dia de cima do celular.",
        ],
      },
      pausa: {
        text: [
          "Ele pediu um tempo, e você também pode usar esse tempo. Encha a semana de coisas que dependem só de você.",
        ],
      },
      limite: {
        text: [
          "No seu cenário, toda a sua energia vai para você. Este é um dos dias mais importantes do seu plano.",
        ],
      },
      outra: {
        text: [
          "Saber que ele está com outra pessoa pode tirar o sono e o apetite. Se isso estiver acontecendo há dias, fale com alguém de confiança e procure ajuda profissional se precisar.",
        ],
      },
      sem_diagnostico: { text: [NO_DIAGNOSIS], tools: [DIAGNOSIS] },
      recente: {
        text: "Se o término foi há poucos dias, o básico é o objetivo inteiro: comer, dormir e falar com alguém.",
      },
    },
  },
  {
    day: 7,
    phase: 1,
    title: "Revisão: 7 dias no seu centro",
    minutes: 6,
    goal: "Olhar para a primeira semana, reconhecer o que funcionou e ajustar o que precisa.",
    concept: [
      "Uma revisão não é uma prova. É um jeito de transformar a semana em informação: o que ajudou, o que atrapalhou e o que vale repetir.",
      "Recaídas fazem parte. Se você agiu por impulso alguma vez, isso não apaga a semana. O que importa é perceber o que veio antes e o que pode ser diferente na próxima vez.",
      "Também é hora de conferir se o diagnóstico ainda descreve o seu momento. A situação muda, e as orientações dos próximos dias dependem dele.",
    ],
    points: [
      {
        title: "Recaída não é voltar ao zero",
        text: "Se você agiu por impulso, não precisa recomeçar o plano. Anote o que veio antes (hora, lugar, o que você viu), ajuste o plano das horas vulneráveis e siga do dia em que está.",
      },
      {
        title: "Perguntas que ajudam na revisão",
        text: "O que eu fiz que funcionou? Em que momentos eu escorreguei? O que eu faria diferente na próxima vez? Responder com fatos, e não com julgamentos, torna a revisão útil.",
      },
    ],
    example: {
      situation:
        "Ao reler o Diário, você percebe que segurou o impulso cinco vezes e agiu uma, num sábado depois de uma festa.",
      takeaway:
        'Em vez de se culpar, você inclui "sábado à noite" no plano das horas vulneráveis. A recaída vira ajuste, não desistência.',
    },
    practice: [
      "Releia os registros da semana no Diário, incluindo o do Dia 1.",
      "Conte quantas vezes você segurou o impulso e quantas vezes agiu.",
      "Escreva o que mais ajudou.",
      "Se a situação com ele mudou (pediu distância, bloqueou, voltou a conversar), refaça o diagnóstico.",
    ],
    avoid: [
      "Avaliar a semana pela resposta dele.",
      "Apagar os registros ruins: eles também ensinam.",
      "Começar a Fase 2 sem fazer a revisão.",
    ],
    action: "Releia a semana no Diário e anote uma coisa que já mudou em você.",
    exercise: {
      title: "Revisão da semana",
      steps: ["Releia o Diário.", "Responda às perguntas abaixo e guarde."],
      prompts: [
        "Quantas vezes eu segurei o impulso? Quantas vezes eu agi?",
        "O que mais me ajudou?",
        "O que ainda pesa?",
        "Comparando com o Dia 1, o que já mudou em mim?",
      ],
    },
    checklist: [
      c("d7-reler", "Reler o Diário da semana"),
      c("d7-funcionou", "Anotar o que funcionou"),
      c("d7-pesa", "Anotar o que ainda pesa"),
      c("d7-diagnostico", "Conferir se o meu diagnóstico ainda vale"),
    ],
    tools: [DIARY, MAP],
    guide: {
      conversa: {
        text: [
          "A Fase 2 é sobre comunicação. Antes de entrar nela, pergunte a você: estou mais calma do que no Dia 1? Se ainda não, repetir alguns dias da Fase 1 é uma boa decisão.",
        ],
      },
      espaco: {
        text: [
          "Na Fase 2, você vai aprender a se comunicar melhor, mesmo que hoje não haja reciprocidade. Os dias de mensagem vão ser de escrita e de decisão, sem envio.",
        ],
      },
      pausa: {
        text: [
          "A Fase 2 ensina comunicação, mas não encurta o tempo que ele pediu. Você vai praticar escrevendo e decidir mais tarde, com calma.",
        ],
      },
      limite: {
        text: [
          "Na Fase 2, os dias de mensagem viram dias de escrita para o Diário. Você aprende o mesmo conteúdo, sem enviar nada.",
        ],
      },
      sem_diagnostico: {
        text: [
          "A Fase 2 é sobre comunicação, e as orientações dependem de haver ou não contato bem-vindo. Faça o diagnóstico antes de começar o Dia 8.",
        ],
        tools: [DIAGNOSIS],
      },
    },
  },

  // ---------------------------------------------------------------- Fase 2 · Nova comunicação
  {
    day: 8,
    phase: 2,
    title: "Por que menos explica mais",
    minutes: 6,
    goal: "Entender por que mensagens longas e explicativas costumam afastar, e aprender a cortar.",
    concept: [
      "Depois do término, é natural querer explicar tudo: o que você sentiu, o que errou, o que mudou. Só que quem recebe um texto longo sobre a relação sente que precisa responder à altura, se defender ou tomar uma posição. Isso é peso.",
      "Uma mensagem longa também costuma misturar várias coisas: saudade, mágoa, desculpas, cobrança. A outra pessoa reage à parte que mais incomoda, e o resto se perde.",
      'Mudança se mostra mais pelo jeito do que pelo discurso. Dizer "eu mudei" raramente convence; agir de um jeito diferente, com o tempo, é o que costuma ser percebido.',
    ],
    points: [
      {
        title: "A regra do corte",
        text: "Se a mensagem tem mais de duas linhas, pergunte de cada frase: ela é essencial? Ela pede algo? Ela explica o passado? Corte o que não for essencial.",
      },
      {
        title: 'O problema do "mas"',
        text: '"Sinto sua falta, mas você também errou": o "mas" apaga a primeira parte. Quem lê fica só com a segunda.',
      },
    ],
    example: {
      situation:
        'Você escreve sete parágrafos explicando por que reagiu mal na última briga. Ele responde: "Não quero discutir isso agora". Você se sente ignorada; ele se sente cobrado.',
      takeaway:
        "Os dois sentiram algo legítimo. O texto longo pediu uma resposta que ele não estava pronto para dar. Se um dia houver espaço para essa conversa, ela funciona melhor ao vivo.",
    },
    compare: ["evit-textao"],
    practice: [
      "Pegue um rascunho (novo ou guardado) e escreva na Pausa.",
      "Corte tudo que explica o passado, se justifica ou pede algo.",
      "Pare quando sobrarem uma ou duas linhas que não exigem resposta.",
      "Guarde a versão longa no Diário: ela é sua, e escrever ajuda a organizar.",
    ],
    avoid: [
      "Explicar o término por mensagem.",
      "Listar tudo o que você mudou.",
      'Frases com "mas" no meio.',
    ],
    action: "Pegue um rascunho e corte até sobrar uma ou duas linhas.",
    exercise: {
      title: "Do textão às duas linhas",
      steps: [
        "Escreva na Pausa tudo o que gostaria de dizer, sem filtro.",
        "Marque as frases que explicam o passado, se defendem ou cobram.",
        "Reescreva só com o que sobrou, em até duas linhas.",
        "Responda às perguntas abaixo e guarde no Diário.",
      ],
      prompts: [
        "O que eu mais queria que ele entendesse?",
        "Isso cabe numa mensagem, ou seria uma conversa ao vivo?",
      ],
    },
    checklist: [
      c("d8-rascunho", "Escrever ou reler um rascunho"),
      c("d8-cortar", "Cortar até duas linhas"),
      c("d8-cobranca", "Tirar qualquer cobrança ou justificativa"),
    ],
    tools: [
      PAUSE,
      { link: { kind: "central", category: "evitar" }, label: "Central: o que evitar" },
    ],
    guide: {
      conversa: {
        text: [
          "Como vocês conversam, este exercício vale também para respostas: quando ele mandar algo curto, responda curto. Não transforme uma pergunta simples num desabafo.",
        ],
      },
      espaco: {
        text: [
          'Sem resposta dele, a tentação é mandar uma mensagem maior "para ele finalmente entender". É o contrário do que ajuda. Hoje, o rascunho fica com você.',
        ],
      },
      pausa: {
        text: [
          "Ele pediu um tempo. O exercício de hoje é de escrita: você aprende a cortar, mas guarda o texto enquanto o tempo durar.",
        ],
      },
      limite: {
        text: [
          "No seu cenário, o exercício é só de escrita. A versão longa e a curta ficam no Diário. Aprender a dizer menos ajuda você a organizar o que sente.",
        ],
      },
      sem_diagnostico: { text: [NO_DIAGNOSIS], tools: [DIAGNOSIS] },
      confianca: {
        text: "Se houve traição ou quebra de confiança, explicações longas costumam soar como defesa. Responsabilidade se mostra em atitude e, se ele quiser, em conversa ao vivo, não em textos.",
      },
    },
  },
  {
    day: 9,
    phase: 2,
    title: "Curta, leve e aberta",
    minutes: 7,
    goal: "Aprender o que torna uma mensagem leve, como ela difere de uma cobrança e quando o melhor é não enviar.",
    concept: [
      "Leveza não é fingir que está tudo bem nem ser engraçada o tempo todo. Uma mensagem leve é aquela que não coloca peso em quem recebe: não exige resposta, não cobra, não traz o passado e não pede uma decisão.",
      'Cobrança é qualquer mensagem que transforma o outro em devedor: "você sumiu", "custa responder?", "eu sempre fiz tudo por você". Mesmo quando é verdade, ela coloca a pessoa na defensiva. Quem se sente cobrado se defende ou se afasta; dificilmente se aproxima.',
      "Uma mensagem respeitosa deixa o outro livre para responder ou não. É essa liberdade que torna mais fácil responder.",
    ],
    points: [
      {
        title: "Curta",
        text: "Uma ou duas linhas. Se precisa de mais, provavelmente é uma conversa, não uma mensagem.",
      },
      {
        title: "Leve",
        text: "Sem cobrança, sem ironia, sem o assunto da relação e sem pergunta sobre sentimentos.",
      },
      {
        title: "Aberta",
        text: 'Ele pode responder ou não, e você fica bem nos dois casos. Sem "me responde", sem prazo.',
      },
      {
        title: "Quando o melhor é não enviar",
        text: "Se você precisa da resposta para ficar bem; se é madrugada ou pico de emoção; se ele pediu espaço; ou se a sua última mensagem ficou sem resposta.",
      },
      {
        title: "Como avaliar a reciprocidade",
        text: "Olhe as últimas conversas: ele responde? Às vezes puxa assunto? Faz perguntas sobre você? Se só você começa e ele responde por educação, ou não responde, a conversa não é recíproca hoje, e a próxima mensagem não deve partir de você.",
      },
    ],
    example: {
      situation:
        "Ele visualizou a sua mensagem há dois dias e não respondeu. Você pensa em duas versões para mandar.",
      contrast: {
        avoid: "Vi que você visualizou e não respondeu. Pelo visto, eu não mereço nem um oi.",
        better: "Tudo bem por aqui. Espero que a sua semana esteja boa.",
      },
      takeaway:
        "A primeira acusa e pede explicação. A segunda não pede nada. Ainda assim, neste caso a melhor decisão é não mandar nenhuma: a mensagem sem resposta já foi a sua vez. Se ele escrever, a conversa recomeça leve.",
    },
    compare: ["evit-cobranca"],
    practice: [
      "Antes de escrever, olhe a reciprocidade: quem começou as últimas três conversas? Ele respondeu?",
      "Escreva um rascunho na Pausa com no máximo duas linhas.",
      "Leia em voz alta: soa como cobrança, ironia ou pedido? Se sim, reescreva.",
      "Pergunte a você: eu ficaria bem se ele não respondesse? Se a resposta for não, guarde o rascunho.",
    ],
    avoid: [
      'Perguntas que exigem resposta sobre a relação ("a gente vai conversar?").',
      'Ironia ("pelo visto você está muito ocupado").',
      'Escrever porque "faz tempo", sem olhar se há reciprocidade.',
    ],
    action:
      "Escreva um rascunho na Pausa e passe pelos três critérios. Hoje você não precisa enviar nada.",
    exercise: {
      title: "As duas versões",
      steps: [
        "Escreva na Pausa a mensagem que você mandaria hoje, do jeito que vier.",
        "Reescreva aplicando curta, leve e aberta.",
        "Compare as duas, responda às perguntas e guarde no Diário. Enviar não faz parte do exercício.",
      ],
      prompts: [
        "O que a primeira versão pedia dele?",
        "Na segunda, o que eu tirei, e por quê?",
        "Hoje há reciprocidade para uma mensagem minha? Como eu sei?",
      ],
    },
    checklist: [
      c("d9-reciprocidade", "Avaliar a reciprocidade das últimas conversas"),
      c("d9-rascunho", "Escrever um rascunho na Pausa"),
      c("d9-criterios", "Conferir: curta, leve e aberta"),
      c("d9-guardar", "Guardar as duas versões no Diário"),
    ],
    tools: [
      PAUSE,
      {
        link: { kind: "central", category: "primeiro_contato" },
        label: "Central: modelos de mensagem leve",
      },
      { link: { kind: "rules", section: "never" } },
    ],
    guide: {
      conversa: {
        text: [
          "Vocês conversam, então uma mensagem curta e leve pode fazer sentido em breve. Hoje ainda é dia de rascunho. Use os modelos da Central como ponto de partida e adapte com as suas palavras.",
        ],
      },
      espaco: {
        text: [
          "Ele não tem respondido. Pela régua da reciprocidade, a próxima mensagem não deve partir de você. Faça o exercício para aprender e guarde as duas versões.",
        ],
      },
      pausa: {
        text: [
          "Ele pediu um tempo. Você pode praticar a escrita, mas nada sai daqui enquanto o tempo durar. Se ele escrever primeiro, responda curto e sem reabrir a relação.",
        ],
      },
      limite: {
        text: [
          'No seu cenário, a resposta para "quando não enviar" já está dada: o limite dele. O exercício é só de escrita, para você aprender a se expressar sem peso.',
        ],
        practice: [
          "Escreva a primeira versão do jeito que vier.",
          "Reescreva aplicando curta, leve e aberta.",
          "Guarde as duas no Diário. Nenhuma é para enviar.",
        ],
        checklist: [
          c("d9-limite-escrever", "Escrever as duas versões no Diário"),
          c("d9-criterios", "Conferir: curta, leve e aberta"),
          c("d9-limite-sentir", "Anotar o que eu senti ao escrever"),
        ],
      },
      sem_diagnostico: {
        text: [
          "Sem diagnóstico, o app não sabe se há contato bem-vindo no seu caso. Faça o exercício, guarde o rascunho e faça o diagnóstico antes de pensar em enviar qualquer coisa.",
        ],
        tools: [DIAGNOSIS],
      },
    },
  },
  {
    day: 10,
    phase: 2,
    title: "O que nunca enviar",
    minutes: 6,
    goal: "Reconhecer os tipos de mensagem que quase sempre fecham portas e saber o que fazer no lugar.",
    concept: [
      "Algumas mensagens costumam piorar a situação: o textão emocional, a cobrança, o ultimato, a provocação de ciúme, o recado por outras pessoas e a mensagem de madrugada. Elas têm algo em comum: tentam aliviar a ansiedade de quem envia colocando o peso em quem recebe.",
      "Toda mensagem desse tipo tem uma alternativa: uma versão sem peso ou, muitas vezes, mensagem nenhuma.",
    ],
    points: [
      {
        title: "Textão",
        text: "Mistura saudade, acusação e pedido. Pede uma resposta que ninguém consegue dar por escrito.",
      },
      {
        title: "Cobrança",
        text: 'Transforma o outro em devedor, mesmo em versões curtas como "oi?" ou "sumiu?".',
      },
      {
        title: "Ultimato",
        text: 'Força uma decisão que a outra pessoa não está pronta para tomar ("ou responde até amanhã, ou acabou").',
      },
      {
        title: "Ciúme provocado",
        text: "É um teste, e costuma ser percebido como joguinho. Mina a confiança.",
      },
      {
        title: "Recado por terceiros",
        text: "Expõe os dois e passa por cima do espaço dele. Com bloqueio ou pedido de distância, é desrespeito ao limite.",
      },
      { title: "Madrugada", text: "Escrita no pico da emoção. Quase sempre é um dos tipos acima." },
    ],
    example: {
      situation:
        'Depois de ver que ele foi a uma festa, você escreve: "Que bom que você está se divertindo enquanto eu estou aqui destruída". Antes de enviar, passa pela Pausa.',
      takeaway:
        "A mensagem misturava ironia e cobrança. O que você queria, de verdade, era dizer que está sofrendo, e esse texto tem lugar no Diário ou numa conversa com uma amiga.",
    },
    compare: ["evit-ultimato", "evit-ciume"],
    practice: [
      "Leia a lista do que nunca enviar nas Regras de ouro.",
      "Abra os rascunhos guardados no Diário e marque os que caem em algum tipo.",
      "Para cada um, decida: reescrever sem peso ou deixar de lado.",
      "Lembre do teste: se você precisa da resposta para se sentir bem, ainda não é hora.",
    ],
    avoid: [
      'Mandar "só para desabafar".',
      "Pedir a amigos ou familiares que sondem ou levem recados.",
      "Escrever para ele depois de beber.",
    ],
    action: "Leia a lista do que nunca enviar e confira os seus rascunhos.",
    exercise: {
      title: "Faxina dos rascunhos",
      steps: ["Releia os rascunhos guardados.", "Responda às perguntas e guarde no Diário."],
      prompts: [
        "Qual rascunho meu mais se parece com um dos tipos da lista?",
        "O que eu queria sentir ao enviar aquilo?",
        "Onde mais eu posso buscar esse sentimento sem depender dele?",
      ],
    },
    checklist: [
      c("d10-lista", "Ler a lista do que nunca enviar"),
      c("d10-rascunhos", "Conferir os rascunhos guardados"),
      c("d10-separar", "Separar o que não serve"),
    ],
    tools: [
      { link: { kind: "rules", section: "never" } },
      { link: { kind: "central", category: "evitar" }, label: "Central: o que evitar" },
      PAUSE,
    ],
    guide: {
      conversa: {
        text: [
          "Com conversa aberta, o risco é escorregar no meio de uma conversa boa: uma ironia, uma cobrança disfarçada de brincadeira. Releia antes de enviar, mesmo respostas rápidas.",
        ],
      },
      espaco: {
        text: [
          'Sem resposta, as mensagens desta lista ficam mais tentadoras ("pelo menos ele vai responder"). Nenhuma delas resolve o silêncio, e a maioria aumenta a distância.',
        ],
      },
      pausa: {
        text: [
          "No tempo que ele pediu, qualquer mensagem desta lista quebra o pedido duas vezes: pelo contato e pelo peso.",
        ],
      },
      limite: {
        text: [
          "No seu cenário, nenhuma mensagem é para enviar. A lista ajuda a entender o que você sente quando a vontade aparece.",
        ],
      },
      bloqueio: {
        text: [
          "Recado por terceiros, outro número ou outro perfil são formas de ultrapassar o bloqueio. Estão na lista por isso.",
        ],
      },
      sem_diagnostico: { text: [NO_DIAGNOSIS], tools: [DIAGNOSIS] },
    },
  },
  {
    day: 11,
    phase: 2,
    title: "Sua primeira mensagem leve",
    minutes: 7,
    goal: "Decidir, com critérios, se uma primeira mensagem faz sentido no seu caso, e o que fazer em cada situação.",
    concept: [
      "Uma primeira mensagem depois de um tempo sem contato não é um pedido de volta nem uma explicação. Ela só mostra, em uma ou duas linhas, que você está bem e não carrega peso. Se ele vai responder está fora do seu controle.",
      "Decidir não enviar também conclui este dia. Para muitas pessoas, o passo de hoje é escrever e guardar, e isso é tão importante quanto enviar.",
    ],
    points: [
      {
        title: "Os 5 critérios",
        text: "1) Há reciprocidade nas últimas conversas. 2) Ele não pediu espaço, não bloqueou e não está em outra relação. 3) Você está calma e não é madrugada. 4) A mensagem é curta, leve e aberta. 5) Você ficaria bem sem resposta.",
      },
      {
        title: "Assunto concreto",
        text: 'Uma lembrança específica, algo útil para ele ou algo do presente funcionam melhor do que um "oi, sumido" ou uma pergunta sobre a relação.',
      },
    ],
    example: {
      situation:
        'Vocês trocam mensagens curtas há uma semana, com iniciativa dos dois. Você escreve na Pausa: "Vi que abriu aquela livraria que você gosta. Lembrei de você." Passa pelos critérios, envia e sai para caminhar.',
      takeaway:
        "Um assunto concreto e neutro, nenhuma pergunta sobre a relação e nenhuma espera. Se ele não responder, o dia já está concluído.",
    },
    practice: [
      "Confira os 5 critérios com honestidade, um por um.",
      "Escreva a mensagem na Pausa, nunca direto na conversa.",
      "Se algum critério falhar, guarde a mensagem no Diário. O dia está concluído do mesmo jeito.",
      "Se todos fizerem sentido e você decidir enviar, envie uma mensagem só e solte o celular.",
    ],
    avoid: [
      'Mensagem que pede resposta ("me responde quando puder?").',
      "Uma segunda mensagem se a primeira ficar sem resposta.",
      'Escrever para "testar" como ele está.',
    ],
    action: "Escreva a mensagem na Pausa e decida, pelos critérios, se envia hoje ou guarda.",
    exercise: {
      title: "A mensagem e os critérios",
      steps: [
        "Escreva na Pausa a mensagem que pensou.",
        "Passe pelo checklist da Pausa.",
        "Responda às perguntas abaixo antes de decidir.",
      ],
      prompts: [
        "Por que eu quero mandar esta mensagem hoje?",
        "Como eu vou me sentir se ele não responder?",
        "O que eu vou fazer logo depois de decidir?",
      ],
    },
    checklist: [
      c("d11-criterios", "Conferir os 5 critérios"),
      c("d11-pausa", "Escrever a mensagem na Pausa"),
      c("d11-decidir", "Enviar uma vez só, ou guardar no Diário"),
      c("d11-soltar", "Soltar o celular e seguir o dia"),
    ],
    tools: [
      PAUSE,
      {
        link: { kind: "central", category: "primeiro_contato" },
        label: "Central: primeira mensagem",
      },
      SIGNALS,
    ],
    guide: {
      conversa: {
        text: [
          "Há conversa e ela é bem-vinda. Se os cinco critérios fizerem sentido, uma mensagem curta pode ser enviada hoje. Os modelos da Central são pontos de partida: troque os trechos entre colchetes e passe pela Pausa.",
        ],
      },
      espaco: {
        text: [
          "As suas mensagens recentes ficaram sem resposta, ou o padrão tem sido de insistência. Pelos critérios, hoje não é dia de enviar: a próxima iniciativa não é sua. Escreva a mensagem que você mandaria e guarde.",
          "Se ele escrever primeiro, responda curto e sem cobrar o silêncio.",
        ],
        action: "Escreva a mensagem na Pausa e guarde no Diário. Hoje, nada sai daqui.",
        example: {
          situation:
            "A sua última mensagem está sem resposta há uma semana. Você escreve outra na Pausa, passa pelos critérios e percebe que o primeiro (reciprocidade) não se cumpre. Guarda no Diário.",
          takeaway:
            "Os critérios decidiram por você, com calma. Se ele escrever um dia, a conversa recomeça leve, sem uma mensagem a mais pesando.",
        },
        practice: [
          "Escreva a mensagem na Pausa, com os três critérios do Dia 9.",
          "Guarde no Diário.",
          "Anote o que faria você perceber que há reciprocidade de novo (por exemplo: ele escrever por iniciativa própria).",
        ],
        exercise: writeOnly("A mensagem que fica com você", [
          "A mensagem que eu mandaria:",
          "O que eu esperava que acontecesse depois dela?",
          "O que me faria perceber que há reciprocidade?",
        ]),
        checklist: [
          c("d11-escrever", "Escrever a mensagem na Pausa"),
          c("d11-guardar", "Guardar no Diário, sem enviar"),
          c("d11-reciprocidade", "Anotar o que mostraria reciprocidade"),
        ],
      },
      pausa: {
        text: [
          "Ele pediu um tempo. Enquanto durar, a primeira mensagem não é sua. Escreva a que você gostaria de mandar quando o tempo acabar, guarde e releia daqui a alguns dias: você vai perceber o que ainda é urgência.",
        ],
        action:
          "Escreva a mensagem na Pausa e guarde no Diário. Nada sai daqui enquanto o tempo durar.",
        example: {
          situation:
            "Ele pediu um tempo há alguns dias. Você escreve uma mensagem na Pausa, passa pelos critérios e percebe que o segundo (ele não pediu espaço) não se cumpre. Guarda no Diário com a data.",
          takeaway:
            "Três dias depois, relendo, você percebe que metade do texto era urgência. O pedido dele foi respeitado, e você ganhou clareza sobre o que quer dizer, se um dia fizer sentido.",
        },
        practice: [
          "Escreva a mensagem na Pausa.",
          "Guarde no Diário com a data de hoje.",
          "Releia em três dias e anote o que mudaria.",
        ],
        exercise: writeOnly("A mensagem para depois", [
          "A mensagem que eu gostaria de mandar:",
          "O que nela ainda é urgência?",
          "O que eu vou fazer por mim enquanto o tempo dele durar?",
        ]),
        checklist: [
          c("d11-escrever", "Escrever a mensagem na Pausa"),
          c("d11-guardar", "Guardar no Diário, sem enviar"),
          c("d11-reler", "Reler daqui a três dias"),
        ],
      },
      limite: {
        text: [
          "Ele pediu para não haver contato. Este dia vira um exercício de escrita sem envio: o que você diria fica guardado no Diário. Respeitar o pedido dele não é desistir de você; é agir de acordo com quem você quer ser.",
        ],
        action: "Escreva no Diário a carta que você não vai enviar.",
        example: {
          situation:
            "Você sente que precisa dizer a ele o quanto mudou. Em vez de procurar um jeito de mandar, escreve tudo no Diário, relê no dia seguinte e marca o que é saudade, o que é mágoa e o que é pedido.",
          takeaway:
            "O sentimento foi dito, organizado e guardado, sem ultrapassar o limite dele. Escrever sem enviar não é desistir: é escolher como você quer agir.",
        },
        practice: [
          "Escreva sem filtro, como se ele fosse ler.",
          "Releia e marque o que é saudade, o que é mágoa e o que é pedido.",
          "Guarde no Diário. Não envie por nenhum meio.",
        ],
        exercise: writeOnly("Carta sem envio", [
          "O que eu queria que ele soubesse é…",
          "O que mais me dói agora é…",
          "O que eu vou fazer por mim hoje é…",
        ]),
        checklist: [
          c("d11-carta", "Escrever a carta sem envio no Diário"),
          c("d11-limite", "Reler o limite dele e o Meu compromisso"),
          c("d11-cuidar", "Fazer algo por mim depois de escrever"),
        ],
        tools: [
          DIARY,
          { link: { kind: "message", id: "semresp-carta" }, label: "Modelo de carta sem envio" },
        ],
      },
      bloqueio: {
        text: [
          "Ele bloqueou o contato. Não existe primeira mensagem neste cenário, por nenhum caminho: outro número, outro perfil, e-mail ou amigos em comum. O seu Dia 11 é de escrita sem envio. Escrever o que você diria organiza o sentimento sem ultrapassar o limite dele.",
        ],
        action: "Escreva no Diário a carta que você não vai enviar.",
        example: {
          situation:
            "Você sente que precisa dizer a ele o quanto mudou. Em vez de procurar um jeito de mandar, escreve tudo no Diário, relê no dia seguinte e marca o que é saudade, o que é mágoa e o que é pedido.",
          takeaway:
            "O sentimento foi dito, organizado e guardado, sem ultrapassar o limite dele. Escrever sem enviar não é desistir: é escolher como você quer agir.",
        },
        practice: [
          "Escreva sem filtro, como se ele fosse ler.",
          "Releia e marque o que é saudade, o que é mágoa e o que é pedido.",
          "Guarde no Diário. Não envie por nenhum meio.",
        ],
        exercise: writeOnly("Carta sem envio", [
          "O que eu queria que ele soubesse é…",
          "O que mais me dói agora é…",
          "O que eu vou fazer por mim hoje é…",
        ]),
        checklist: [
          c("d11-carta", "Escrever a carta sem envio no Diário"),
          c("d11-limite", "Reler o limite dele e o Meu compromisso"),
          c("d11-cuidar", "Fazer algo por mim depois de escrever"),
        ],
        tools: [
          DIARY,
          {
            link: { kind: "message", id: "evit-terceiros" },
            label: "Por que não usar outros caminhos",
          },
        ],
      },
      outra: {
        text: [
          "Ele está com outra pessoa. A orientação é de não interferência: nenhuma mensagem para testar, sondar ou lembrar que você existe, e nenhum contato com a outra pessoa. O exercício de hoje é escrever o que você sente e o que você quer para você, independente dele.",
        ],
        action: "Escreva no Diário o que você sente e o que quer para você.",
        example: {
          situation:
            'Você vê uma foto dele com a nova pessoa e sente vontade de mandar um "espero que esteja feliz". Em vez disso, escreve no Diário o que sentiu ao ver a foto e silencia o perfil.',
          takeaway:
            "Uma mensagem assim, mesmo gentil, seria interferência e não traria paz. Escrever cuida do que você sente sem envolver a relação dele.",
        },
        practice: [
          "Escreva sem filtro o que sente ao saber da nova relação.",
          "Escreva o que você quer para a sua vida nos próximos meses, sem incluir ele.",
          "Guarde no Diário.",
        ],
        exercise: writeOnly("O que é meu", [
          "O que eu sinto quando penso na nova relação dele:",
          "O que eu quero para mim nos próximos meses:",
          "Uma coisa que eu vou fazer por mim esta semana:",
        ]),
        checklist: [
          c("d11-carta", "Escrever no Diário o que eu sinto"),
          c(
            "d11-nao-interferir",
            "Reler o que não fazer: testar, comparar, procurar a outra pessoa",
          ),
          c("d11-cuidar", "Fazer algo por mim depois de escrever"),
        ],
        tools: [
          DIARY,
          { link: { kind: "scenario", id: "outra" }, label: "Cenário: ele está com outra pessoa" },
        ],
      },
      sem_diagnostico: {
        text: [
          "O app ainda não sabe se há contato bem-vindo no seu caso. Antes de pensar em enviar, faça o diagnóstico: ele ajusta este dia. Até lá, escreva e guarde.",
        ],
        action: "Escreva a mensagem na Pausa, guarde e faça o diagnóstico antes de decidir.",
        practice: [
          "Faça o diagnóstico.",
          "Escreva a mensagem na Pausa e guarde no Diário.",
          "Volte a este dia depois do diagnóstico: as orientações vão mudar conforme o seu momento.",
        ],
        exercise: writeOnly("A mensagem, antes de decidir", [
          "A mensagem que eu pensei:",
          "Por que eu quero mandar esta mensagem hoje?",
          "Como eu vou me sentir se ele não responder?",
        ]),
        checklist: [
          c("d11-diagnostico", "Fazer o diagnóstico"),
          c("d11-escrever", "Escrever a mensagem na Pausa"),
          c("d11-guardar", "Guardar no Diário, sem enviar"),
        ],
        tools: [DIAGNOSIS],
      },
      confianca: {
        text: "Houve traição ou quebra de confiança. Uma mensagem leve pode soar como se nada tivesse acontecido. Antes de decidir, reflita: eu já reconheci a minha parte? Estou pronta para ouvir sem me defender? Confiança costuma se reconstruir com coerência ao longo do tempo, não com uma mensagem.",
        link: {
          link: { kind: "central", category: "confianca" },
          label: "Central: reconstruir confiança",
        },
        conversaOnly: true,
      },
      recente: {
        text: "O término tem menos de 7 dias. Esperar mais alguns dias costuma ser mais seguro do que qualquer primeira mensagem. Escreva e guarde; você pode voltar a este dia depois.",
      },
    },
  },
  {
    day: 12,
    phase: 2,
    title: "Soltar o celular e lidar com a espera",
    minutes: 5,
    goal: "Atravessar a espera e o silêncio sem mandar uma segunda mensagem e sem checar a conversa.",
    concept: [
      "Depois de enviar, a ansiedade costuma mudar de forma: agora é checar se ele viu, se está online, se está digitando. Cada checagem renova a expectativa e a frustração.",
      'Uma mensagem enviada não pede outra. Uma segunda mensagem ("você viu?", "tudo bem?") transforma um gesto leve em cobrança e apaga o efeito da primeira.',
      "O silêncio também comunica, mas não diz exatamente o quê: pode ser rotina, dúvida, falta de interesse ou necessidade de espaço. Você não precisa decifrar. Precisa só não insistir.",
    ],
    points: [
      {
        title: "Visualizou e não respondeu",
        text: "Não é convite para perguntar o motivo. A sua parte terminou quando você enviou.",
      },
    ],
    example: {
      situation:
        'Você manda uma mensagem leve às 14h. Às 14h05 ele visualiza. Às 18h, você já abriu a conversa trinta vezes e escreveu "tá bravo comigo?".',
      takeaway:
        "A segunda mensagem não traria resposta, só cobrança. Silenciar as notificações dele até o dia seguinte e sair de casa protege a mensagem que você já mandou, e protege você.",
    },
    practice: [
      "Silencie as notificações da conversa dele por algumas horas.",
      "Faça algo que ocupe as mãos e a atenção: sair, cozinhar, treinar, encontrar alguém.",
      "Se a vontade de mandar outra vier, escreva na Pausa e guarde.",
      "Registre no Diário o que sentiu enquanto esperava.",
    ],
    avoid: [
      "Perguntar se ele viu.",
      'Mandar outra mensagem "para completar".',
      "Interpretar a hora em que ele esteve online ou visualizou.",
    ],
    action: "Ocupe as próximas horas com algo seu e registre no Diário como lidou com a espera.",
    exercise: {
      title: "Diário da espera",
      steps: ["Responda às perguntas no fim do dia.", "Guarde no Diário."],
      prompts: [
        "O que eu senti enquanto esperava (ou enquanto pensava nele)?",
        "O que eu fiz com a vontade de checar?",
        "O que me ajudou a seguir o dia?",
      ],
    },
    checklist: [
      c("d12-segunda", "Não mandar uma segunda mensagem"),
      c("d12-silenciar", "Silenciar as notificações dele por hoje"),
      c("d12-registro", "Registrar no Diário como me senti"),
    ],
    tools: [
      DIARY,
      { link: { kind: "reply", situation: "visualizou" }, label: "Ele visualizou e não respondeu" },
      { link: { kind: "message", id: "semresp-nao-enviar" }, label: "Hoje eu escolho não mandar" },
    ],
    guide: {
      conversa: {
        text: [
          "Se você enviou ontem e ele respondeu, responda no seu tempo e curto. Se não respondeu, essa é a resposta por agora. Não mande outra; o Dia 13 ajuda a ler o que aconteceu.",
        ],
      },
      espaco: {
        text: [
          "Você não enviou nada ontem, e isso também é uma espera: a de saber se ele vai aparecer. O exercício vale igual. Silenciar e ocupar o dia são formas de dar espaço de verdade.",
        ],
      },
      pausa: {
        text: [
          "No tempo que ele pediu, a espera é longa e sem data. Em vez de contar os dias, conte o que você fez por você em cada um.",
        ],
      },
      limite: {
        text: [
          "No seu cenário, não há resposta a esperar. O exercício de hoje é soltar o hábito de checar: a conversa, o perfil, se ele desbloqueou.",
        ],
        example: {
          situation:
            "Logo ao acordar, você abre a conversa dele para ver se a foto voltou, sinal de que ele desbloqueou. Depois, olha de novo no almoço e antes de dormir.",
          takeaway:
            "Cada checagem reabre a mesma pergunta e não traz resposta. Arquivar a conversa e anotar no Diário cada vontade de olhar mostra o tamanho do hábito, e ajuda a diminuí-lo.",
        },
        checklist: [
          c("d12-checar", "Não checar a conversa nem o perfil dele hoje"),
          c("d12-arquivar", "Arquivar ou silenciar o que me leva até ele"),
          c("d12-registro", "Registrar no Diário como me senti"),
        ],
      },
      sem_diagnostico: { text: [NO_DIAGNOSIS], tools: [DIAGNOSIS] },
    },
  },
  {
    day: 13,
    phase: 2,
    title: "Observar sem interpretar demais",
    minutes: 6,
    goal: "Ler as respostas, ou a falta delas, com cuidado e sem tirar conclusões de uma mensagem só.",
    concept: [
      'Na ansiedade, cada detalhe vira sinal: o tempo de resposta, um emoji, um "kkk" a menos. Mas uma mensagem isolada diz pouco. O que tem informação é o padrão ao longo dos dias.',
      "Uma resposta curta não é necessariamente rejeição; pode ser cansaço ou rotina. Uma resposta simpática não é necessariamente volta; pode ser educação. Pensar em possibilidades, e não em certezas, evita agir com base numa história que você mesma criou.",
      "Observe três coisas: reciprocidade (ele também puxa assunto?), interesse (ele pergunta sobre você?) e constância (isso se repete ou aconteceu uma vez?).",
    ],
    example: {
      situation:
        'Ele responde "kkk legal" à sua mensagem. Você lê como desprezo e escreve para uma amiga: "acabou". Dois dias depois, ele manda um meme.',
      takeaway:
        'Nem o "kkk legal" era necessariamente desprezo, nem o meme é volta. Era só uma conversa leve, sem conclusão. Registrar os fatos e esperar o padrão aparecer evita as duas leituras extremas.',
    },
    practice: [
      "Anote no Diário os fatos (o que ele fez), separados das interpretações (o que você acha que ele sentiu).",
      "Olhe a última semana, não a última mensagem.",
      'Quando estiver em dúvida sobre como agir, use o "Ele respondeu. E agora?".',
      "Decida o próximo passo só depois de registrar.",
    ],
    avoid: [
      "Pedir a opinião de várias amigas sobre cada mensagem.",
      "Perguntar a ele o que quis dizer.",
      'Concluir "ele voltou" ou "acabou" por uma mensagem só.',
    ],
    action: "Registre no Diário os sinais que você percebeu até agora, se houver algum.",
    exercise: {
      title: "Fato ou interpretação",
      steps: [
        "Pegue a última mensagem dele, ou o silêncio.",
        "Separe o fato das interpretações.",
        "Guarde no Diário.",
      ],
      prompts: [
        "O fato (o que exatamente aconteceu):",
        "Três interpretações possíveis:",
        "O que eu vou fazer, ou não fazer, a partir disso:",
      ],
    },
    checklist: [
      c("d13-sinais", "Ler os sinais de abertura e de alerta"),
      c("d13-registro", "Registrar os fatos no Diário"),
      c("d13-decidir", "Decidir o próximo passo sem pressa"),
    ],
    tools: [{ link: { kind: "reply" } }, SIGNALS, DIARY],
    guide: {
      conversa: {
        text: [
          'Com conversa, use o "Ele respondeu. E agora?" nas situações mais difíceis: resposta fria, pergunta sobre a relação, saudade. Ele ajuda a decidir se responder faz sentido, e como.',
        ],
      },
      espaco: {
        text: [
          "Sem resposta, o silêncio também é um padrão. Observar sem interpretar demais é não procurar explicações e aceitar que, hoje, não há reciprocidade.",
        ],
      },
      pausa: {
        text: [
          'Durante o tempo que ele pediu, observar é observar você: como reage ao silêncio, o que muda no seu dia. Se ele escrever, o "Ele respondeu. E agora?" ajuda a responder sem reabrir a relação.',
        ],
      },
      limite: {
        text: [
          "No seu cenário, não há o que observar nele. Use este dia para observar você: o que mudou desde o Dia 1 e o que ainda dispara a vontade.",
        ],
        example: {
          situation:
            "No Dia 1, você abria as redes dele várias vezes por dia. Hoje, percebe que passou a manhã inteira sem lembrar de olhar, e só sentiu a vontade à noite, ao ouvir uma música.",
          takeaway:
            "Esse é o tipo de sinal que vale observar agora: o seu. Anotar quando a vontade aparece (a música, a noite) mostra o gatilho que ainda falta cuidar.",
        },
        checklist: [
          c("d13-meus-sinais", "Anotar os meus sinais de melhora"),
          c("d13-gatilhos", "Anotar o que ainda dispara a vontade"),
          c("d13-registro", "Registrar no Diário"),
        ],
        tools: [DIARY],
      },
      sem_diagnostico: { text: [NO_DIAGNOSIS], tools: [DIAGNOSIS] },
    },
  },

  // ---------------------------------------------------------------- Fase 3 · Reconexão
  {
    day: 14,
    phase: 3,
    title: "Quando ele responde",
    minutes: 6,
    goal: "Saber responder de um jeito que torne a conversa boa, sem tentar resolver o passado.",
    concept: [
      "Quando ele responde, a vontade é aproveitar a porta aberta para resolver tudo: perguntar o que ele sente, explicar o término, falar do futuro. Só que uma conversa leve que vira discussão sobre a relação costuma terminar mal.",
      "Nesta fase, o objetivo é que conversar com você seja uma experiência agradável. Isso se faz com presença: interesse no que ele conta, respostas no seu ritmo e assuntos do presente.",
      "Responder no seu tempo não é joguinho de esperar horas. É responder quando você estiver disponível e calma, como faria com qualquer pessoa importante.",
    ],
    points: [
      {
        title: "Uma boa resposta",
        text: 'Acolhe o que ele disse, traz algo seu e deixa espaço (um comentário ou uma pergunta leve). Sem cobrar a demora e sem perguntar "e a gente?".',
      },
    ],
    example: {
      situation: 'Ele escreve: "Oi, vi que você voltou a correr. Que legal."',
      contrast: {
        avoid: "Pois é, depois que você foi embora eu precisei me ocupar com alguma coisa.",
        better: "Voltei sim! Tô gostando muito. E você, ainda vai à academia de manhã?",
      },
      takeaway:
        "A primeira resposta leva a conversa para o término e coloca culpa. A segunda fala do presente, mostra que você está bem e devolve o assunto sem peso.",
    },
    practice: [
      "Responda no seu tempo, quando estiver calma.",
      "Mantenha o tamanho parecido com o da mensagem dele.",
      "Fale do presente: o que você está fazendo, algo que viu, uma pergunta sobre a vida dele.",
      'Se ele tocar no assunto da relação, use o "Ele respondeu. E agora?" antes de responder.',
    ],
    avoid: [
      'Cobrar a demora ("demorou, hein").',
      "Perguntar o que ele sente ou o que vocês são.",
      "Mandar várias mensagens seguidas.",
    ],
    action:
      "Faça o exercício das duas respostas. Se ele escrever, responda curto e leve, passando pela Pausa.",
    exercise: {
      title: "Respostas que acolhem",
      steps: [
        "Pense numa mensagem que ele poderia mandar, ou na última que mandou.",
        "Escreva duas respostas: uma que leva ao passado e uma que fica no presente.",
        "Compare e guarde no Diário.",
      ],
      prompts: [
        "A mensagem dele (real ou imaginada):",
        "Resposta que leva ao passado:",
        "Resposta que fica no presente:",
      ],
    },
    checklist: [
      c("d14-cenario", 'Ler o cenário "Ele respondeu"'),
      c("d14-pratica", "Fazer o exercício das duas respostas"),
      c("d14-relacao", "Não puxar o assunto da relação"),
    ],
    tools: [
      { link: { kind: "reply" } },
      { link: { kind: "central", category: "perguntas" }, label: "Central: perguntas difíceis" },
      { link: { kind: "scenario", id: "respondeu" }, label: "Cenário: ele respondeu" },
    ],
    guide: {
      conversa: {
        text: [
          "Vocês conversam. Quando ele escrever, use a Pausa nas respostas importantes e a Central (Perguntas difíceis) quando ele perguntar algo sobre você ou sobre a relação.",
        ],
      },
      espaco: {
        text: [
          "Ele não tem escrito. Este dia não depende disso: faça o exercício com uma mensagem imaginada. Se um dia ele escrever, você vai estar preparada para responder sem pressa e sem cobrar o silêncio.",
        ],
        action: "Faça o exercício das duas respostas com uma mensagem imaginada.",
      },
      pausa: {
        text: [
          "Ele pediu um tempo. Se ele mesmo escrever, você pode responder: curto, gentil e sem reabrir a relação. Não pergunte se o tempo acabou.",
        ],
        action:
          "Faça o exercício das duas respostas. Se ele escrever, responda curto e sem reabrir a relação.",
      },
      limite: {
        text: [
          "No seu cenário, não há resposta a esperar nem a dar. Use o exercício para treinar outra habilidade: voltar ao presente quando o pensamento puxa para o passado.",
        ],
        practice: [
          "Quando perceber que o pensamento voltou ao passado, dê nome a ele: lembrança, saudade, culpa.",
          "Traga a atenção para algo concreto do agora: o que você está fazendo, vendo ou planejando.",
          "Anote no Diário três coisas boas do seu presente.",
        ],
        action: "Escreva no Diário três coisas boas do seu presente.",
        exercise: writeOnly("Voltar ao presente", [
          "Um pensamento sobre o passado que voltou hoje:",
          "Três coisas boas do meu presente:",
          "O que eu fiz quando percebi que estava no passado:",
        ]),
        checklist: [
          c("d14-presente", "Escrever três coisas boas do meu presente"),
          c("d14-passado", "Notar quando o pensamento volta ao passado"),
          c("d14-cuidar", "Fazer algo por mim hoje"),
        ],
        tools: [DIARY],
      },
      sem_diagnostico: {
        text: [NO_DIAGNOSIS],
        action: "Faça o exercício das duas respostas e o diagnóstico.",
        tools: [DIAGNOSIS],
      },
      confianca: {
        text: "Se houve traição ou quebra de confiança e ele tocar no assunto, não minimize nem se defenda na hora. Reconheça e proponha falar com calma, se ele quiser.",
        link: {
          link: { kind: "central", category: "confianca" },
          label: "Central: reconstruir confiança",
        },
        conversaOnly: true,
      },
    },
  },
  {
    day: 15,
    phase: 3,
    title: "Encerrar antes de cansar",
    minutes: 5,
    goal: "Aprender a terminar uma conversa enquanto ela ainda está boa.",
    concept: [
      "Conversas têm curva: começam, ganham ritmo e, em algum momento, esfriam. Quem fica até o fim, puxando assunto quando o outro já responde com monossílabos, costuma sair com a sensação de ter insistido.",
      "Encerrar no ponto alto deixa uma lembrança boa e mostra que você tem uma vida acontecendo. Não é estratégia de sumir: é respeito ao ritmo dos dois.",
      "Sinais de que a conversa está esfriando: respostas mais curtas e mais demoradas, ele para de fazer perguntas, emojis no lugar de frases.",
    ],
    points: [
      {
        title: "Frases que encerram bem",
        text: 'Curtas, calorosas e sem gancho: "Preciso ir, foi bom falar com você", "Vou nessa, boa noite!". Evite terminar com uma pergunta, que pede mais uma resposta.',
      },
    ],
    example: {
      situation:
        'A conversa estava ótima: riram de uma lembrança, falaram de um filme. Depois de alguns minutos, ele passa a responder "haha" e "sim".',
      contrast: {
        avoid: "E aí, o que mais você conta? Fala mais da sua semana!",
        better: "Bom, vou nessa. Foi bom falar com você!",
      },
      takeaway:
        "Reanimar a conversa a qualquer custo mostra mais vontade do que ele tem no momento. Encerrar com leveza deixa a conversa terminar boa, e o próximo contato começa de um lugar melhor.",
    },
    practice: [
      "Repare quando as respostas dele ficarem mais curtas ou espaçadas.",
      "Encerre com uma frase simples e calorosa.",
      "Depois de encerrar, não mande mais nada.",
      "Se ele continuar, responda com leveza, sem puxar novos assuntos.",
    ],
    avoid: [
      "Reanimar a conversa com pergunta atrás de pergunta.",
      'Encerrar com cobrança ("já vi que você não quer falar").',
      'Esperar ele encerrar para não "perder" a conversa.',
    ],
    action:
      "Escreva as suas frases de encerramento. Na próxima conversa, encerre você, com leveza.",
    exercise: {
      title: "Frases de encerramento",
      steps: [
        "Escreva três jeitos de encerrar uma conversa com leveza, com as suas palavras.",
        "Guarde no Diário para ter à mão.",
      ],
      prompts: ["Encerramento 1:", "Encerramento 2:", "Encerramento 3:"],
    },
    checklist: [
      c("d15-sinais", "Reconhecer os sinais de que a conversa esfria"),
      c("d15-frases", "Escrever as minhas frases de encerramento"),
      c("d15-depois", "Não mandar nada depois de encerrar"),
    ],
    tools: [
      { link: { kind: "message", id: "frio-encerrar" }, label: "Modelo: encerrar com leveza" },
      { link: { kind: "reply", situation: "frio" }, label: "Ele respondeu friamente" },
      DIARY,
    ],
    guide: {
      conversa: {
        text: [
          "Com conversa aberta, este é um dos hábitos que mais mudam a dinâmica. Na próxima conversa, quem encerra é você.",
        ],
      },
      espaco: {
        text: [
          "Sem conversa hoje, o exercício prepara você. E vale também para outro tipo de encerramento: parar de mandar mensagens quando não há resposta.",
        ],
      },
      pausa: {
        text: [
          "Se ele escrever durante o tempo que pediu, a conversa deve ser curta. Encerre cedo e com gentileza, sem perguntar sobre o tempo.",
        ],
      },
      limite: {
        text: [
          'No seu cenário, o exercício vira outro: encerrar conversas internas. Quando você se pegar conversando com ele na cabeça, escreva no Diário e encerre: "por hoje, chega".',
        ],
        practice: [
          "Repare quando você estiver conversando com ele na cabeça.",
          'Escolha uma frase para encerrar, como "por hoje, chega".',
          "Escreva no Diário o que estava dizendo e faça outra coisa logo depois.",
        ],
        action: "Quando se pegar conversando com ele na cabeça, escreva no Diário e encerre.",
        exercise: writeOnly("Encerrar a conversa interna", [
          "O que eu disse a ele na minha cabeça hoje:",
          "A frase que eu uso para encerrar:",
          "O que eu fiz logo depois:",
        ]),
        checklist: [
          c("d15-internas", "Notar quando eu converso com ele na cabeça"),
          c("d15-encerrar", "Encerrar a conversa interna com uma frase minha"),
          c("d15-registro", "Registrar no Diário"),
        ],
        tools: [DIARY],
      },
      sem_diagnostico: { text: [NO_DIAGNOSIS], tools: [DIAGNOSIS] },
    },
  },
  {
    day: 16,
    phase: 3,
    title: "Sinais de abertura e de alerta",
    minutes: 6,
    goal: "Distinguir sinais de abertura de sinais de alerta e registrá-los com honestidade.",
    concept: [
      "Sinais de abertura: ele responde com mais frequência, puxa assunto, faz perguntas sobre a sua vida, prolonga a conversa, lembra de coisas que você contou, sugere uma ligação ou um encontro.",
      "Sinais de alerta: respostas secas e demoradas por vários dias, ele evita qualquer assunto pessoal, só aparece quando precisa de algo, pede espaço, menciona outra pessoa ou demonstra irritação com o contato.",
      "Nenhum sinal sozinho decide nada. O que importa é a direção: os sinais de abertura estão aumentando ou diminuindo? E um pedido de espaço vale mais do que qualquer sinal de abertura: se ele pedir, respeite.",
    ],
    points: [
      {
        title: "Registre com datas",
        text: "Escreva o que aconteceu e quando. Depois de duas semanas, uma lista com datas mostra a direção melhor do que a memória, que costuma guardar só o que mais doeu ou mais animou.",
      },
    ],
    example: {
      situation:
        "Em duas semanas, você registrou: ele puxou assunto duas vezes e perguntou do seu trabalho, mas respondeu seco quando você falou de uma viagem antiga de vocês.",
      takeaway:
        "O padrão sugere abertura para conversas do presente, não para lembranças da relação. O ajuste é simples: menos passado, mais presente.",
    },
    practice: [
      "Registre no Diário os sinais da última semana, separando abertura e alerta.",
      "Olhe a direção: mais abertura, estável ou mais distância?",
      "Se aparecer um pedido de espaço, ele vale mais que todos os outros sinais.",
      "Se a situação mudou, atualize o diagnóstico.",
    ],
    avoid: [
      "Contar só os sinais bons.",
      "Provocar para ver a reação dele.",
      "Ignorar um pedido de espaço porque houve sinais bons antes.",
    ],
    action: "Registre no Diário os sinais que apareceram nas últimas conversas.",
    exercise: {
      title: "Quadro de sinais",
      steps: ["Releia as conversas da última semana.", "Responda e guarde no Diário."],
      prompts: [
        "Sinais de abertura que eu percebi (com datas):",
        "Sinais de alerta que eu percebi (com datas):",
        "A direção dos últimos dias é de mais abertura, estável ou de mais distância?",
      ],
    },
    checklist: [
      c("d16-ler", "Ler os sinais de abertura e de alerta"),
      c("d16-registro", "Registrar o que percebi"),
      c("d16-direcao", "Olhar a direção, não uma conversa só"),
    ],
    tools: [SIGNALS, DIARY, MAP],
    guide: {
      conversa: {
        text: [
          "Com conversa aberta, os sinais vão guiar a Fase 4. Seja honesta no registro: é ele que vai dizer se um convite faz sentido.",
        ],
      },
      espaco: {
        text: [
          "Hoje, o sinal mais claro é a falta de resposta. Registrar isso com honestidade é importante: o plano não sugere convite sem reciprocidade.",
        ],
      },
      pausa: {
        text: [
          "O pedido de tempo é o sinal que vale agora. Registre se ele escreveu por iniciativa própria, mas não use isso para concluir que o tempo acabou.",
        ],
      },
      limite: {
        text: [
          "No seu cenário, os sinais que importam são os seus: dormir melhor, checar menos, sentir menos urgência. Registre os seus sinais de abertura para a sua própria vida.",
        ],
        practice: [
          "Registre no Diário os seus sinais de melhora: sono, rotina, menos checagens, menos urgência.",
          "Registre também o que ainda pesa, sem se cobrar.",
          "Olhe a direção das últimas semanas, não um dia só.",
        ],
        exercise: writeOnly("Os meus sinais", [
          "Sinais de que eu estou melhor (com datas):",
          "O que ainda pesa:",
          "A minha direção nas últimas semanas:",
        ]),
        checklist: [
          c("d16-meus", "Registrar os meus sinais de melhora"),
          c("d16-pesa", "Registrar o que ainda pesa"),
          c("d16-minha-direcao", "Olhar a minha direção nas últimas semanas"),
        ],
        tools: [DIARY],
      },
      sem_diagnostico: { text: [NO_DIAGNOSIS], tools: [DIAGNOSIS] },
    },
  },
  {
    day: 17,
    phase: 3,
    title: "Ajustar, não insistir",
    minutes: 5,
    goal: "Usar os sinais para decidir o ritmo: manter, desacelerar ou parar.",
    concept: [
      "Ajustar é responder ao que os sinais mostram. Insistir é continuar fazendo o mesmo e esperar um resultado diferente.",
      'Se os sinais forem de abertura, mantenha o ritmo, sem acelerar. Se forem de alerta, recue: menos mensagens, mais espaço, mais foco em você. Se ele pedir para parar, pare, sem pedir explicação nem uma "última conversa".',
      'Parar não é fracasso. Respeitar um "não" é uma das atitudes mais maduras deste processo, e também protege você de continuar investindo onde não há espaço.',
    ],
    points: [
      {
        title: "Como recuar",
        text: "Responder só quando ele escrever, não começar novas conversas, manter as respostas curtas e voltar à rotina da Fase 1.",
      },
      {
        title: "Quando ele pede distância",
        text: 'Frases como "preciso de espaço", "não quero conversar" ou "para de me mandar mensagem" já decidem o ritmo: parar. Se quiser responder, uma vez e com respeito ("Tudo bem, vou respeitar") basta. Depois, atualize o diagnóstico.',
      },
    ],
    example: {
      situation:
        'Os seus registros mostram três semanas de respostas cada vez mais curtas. Você pensa em mandar "tá tudo bem entre a gente?".',
      takeaway:
        "A pergunta pediria uma explicação que ele não ofereceu. Desacelerar (não iniciar conversa por duas semanas e cuidar da rotina) respeita o que os sinais mostram, sem drama.",
    },
    practice: [
      "Releia o quadro de sinais do Dia 16.",
      "Escolha o ritmo das próximas duas semanas: manter, desacelerar ou parar.",
      "Escreva a decisão no Diário, com o motivo.",
      "Se ele pediu espaço, registre isso no diagnóstico.",
    ],
    avoid: [
      "Pedir explicação por um esfriamento.",
      'Uma "última conversa" depois de um pedido para parar.',
      "Acelerar porque os sinais melhoraram um pouco.",
    ],
    action: "Olhe os sinais e decida o ritmo das próximas semanas: manter, desacelerar ou parar.",
    exercise: {
      title: "A minha decisão de ritmo",
      steps: ["Releia o quadro de sinais.", "Responda e guarde no Diário."],
      prompts: [
        "O que os sinais mostram, em uma frase:",
        "O ritmo que eu escolho:",
        "O que eu vou fazer com a energia que sobra:",
      ],
    },
    checklist: [
      c("d17-sinais", "Rever os sinais"),
      c("d17-ritmo", "Escolher o ritmo das próximas semanas"),
      c("d17-respeitar", "Respeitar qualquer pedido de distância"),
    ],
    tools: [
      DIARY,
      { link: { kind: "reply", situation: "parar" }, label: "Se ele pediu para eu parar" },
      MAP,
    ],
    guide: {
      conversa: {
        text: [
          "Com conversa e sinais de abertura, manter o ritmo é o passo certo. A Fase 4 só faz sentido se a conversa continuar fluindo sem você precisar puxar.",
        ],
      },
      espaco: {
        text: [
          "Sem reciprocidade, a escolha mais coerente é desacelerar ou parar de iniciar. Isso não fecha nada: se ele escrever, você responde.",
        ],
      },
      pausa: {
        text: [
          "Enquanto durar o pedido de tempo, o ritmo já está definido: sem iniciativa sua. A sua escolha é o que fazer com esse tempo.",
        ],
      },
      limite: {
        text: [
          "No seu cenário, o ritmo não está em discussão: o limite dele vale. O exercício é escolher o seu ritmo, o que você vai continuar fazendo depois dos 21 dias.",
        ],
        action: "Escolha o que você vai manter depois dos 21 dias e escreva no Diário.",
        exercise: writeOnly("O meu ritmo", [
          "O que eu vou manter depois dos 21 dias:",
          "O que eu ainda quero mudar:",
          "O que eu vou fazer com a energia que sobra:",
        ]),
        checklist: [
          c("d17-meu-ritmo", "Escolher o que eu mantenho depois dos 21 dias"),
          c("d17-respeitar", "Respeitar qualquer pedido de distância"),
          c("d17-registro", "Escrever a decisão no Diário"),
        ],
        tools: [DIARY],
      },
      sem_diagnostico: { text: [NO_DIAGNOSIS], tools: [DIAGNOSIS] },
    },
  },
  {
    day: 18,
    phase: 3,
    title: "Revisão: o que mudou em você",
    minutes: 6,
    goal: "Reconhecer as mudanças das últimas semanas, que são suas qualquer que seja o resultado.",
    concept: [
      "Compare como você agia no Dia 1 e como age hoje. As mudanças costumam ser pequenas e concretas: escrever menos, esperar antes de responder, checar menos o perfil, dormir melhor.",
      "Essas mudanças são suas. Elas não dependem da resposta dele e vão com você para qualquer relação, inclusive a que você tem com você.",
      "A Fase 4 trata de encontro. Antes dela, vale responder com honestidade: você está pronta para qualquer resposta, inclusive um não?",
    ],
    points: [
      {
        title: "Mudanças pequenas contam",
        text: "Esperar dez minutos antes de responder, dormir uma hora mais cedo, olhar o perfil dele uma vez em vez de dez. Somadas, são elas que mudam o seu jeito de se relacionar.",
      },
      {
        title: "Estar pronta para um não",
        text: "Não é deixar de sentir. É saber que, se a resposta for não, você vai respeitar e continuar cuidando de você.",
      },
    ],
    example: {
      situation:
        'Relendo o Diário, você encontra no Dia 2: "mandei quatro mensagens hoje e me arrependi de todas". No Dia 16: "ele demorou a responder e eu fui à academia".',
      takeaway:
        "Não foi preciso uma reconciliação para perceber a mudança. Ela está ali, registrada, e é sua.",
    },
    practice: [
      "Releia o registro do Dia 1 e o do Dia 7.",
      "Escreva três coisas que você faz diferente hoje.",
      "Escolha uma delas para manter, aconteça o que acontecer.",
      "Pergunte a você se está pronta para qualquer resposta na Fase 4.",
    ],
    avoid: [
      "Medir o progresso pela resposta dele.",
      'Diminuir as mudanças ("isso é pouco").',
      "Avançar para o convite sem estar pronta para um não.",
    ],
    action: "Escreva no Diário três coisas que você faz diferente hoje.",
    exercise: {
      title: "Antes e agora",
      steps: ["Releia o Dia 1.", "Responda e guarde no Diário."],
      prompts: [
        "Como eu reagia no Dia 1:",
        "Como eu reajo hoje:",
        "Uma mudança que eu quero manter:",
        "Estou pronta para ouvir um não? Por quê?",
      ],
    },
    checklist: [
      c("d18-reler", "Reler o Diário"),
      c("d18-mudancas", "Anotar três mudanças"),
      c("d18-manter", "Escolher uma para manter"),
    ],
    tools: [DIARY, MAP, COMMITMENT],
    guide: {
      conversa: {
        text: [
          "Com conversa aberta, a Fase 4 pode incluir um convite. Ele só faz sentido se a resposta à última pergunta do exercício for sim.",
        ],
      },
      espaco: {
        text: [
          "Sem reciprocidade, a Fase 4 não vai girar em torno de um convite. Você vai trabalhar a decisão sobre o seu próximo passo e o que leva destes dias.",
        ],
      },
      pausa: {
        text: [
          "Na Fase 4, o convite não entra enquanto durar o tempo que ele pediu. Você vai fechar os 21 dias com o que construiu.",
        ],
      },
      limite: {
        text: [
          "Na Fase 4, não há convite no seu cenário. Os três últimos dias são sobre encerrar este ciclo com cuidado e decidir o que vem depois, para você.",
        ],
      },
      sem_diagnostico: {
        text: [
          "A Fase 4 trata de convite e encontro, e só faz sentido com contato bem-vindo. Faça o diagnóstico antes do Dia 19.",
        ],
        tools: [DIAGNOSIS],
      },
    },
  },

  // ---------------------------------------------------------------- Fase 4 · Do contato ao reencontro
  {
    day: 19,
    phase: 4,
    title: "Quando um convite faz sentido",
    minutes: 6,
    goal: "Avaliar com critérios se um convite faz sentido agora, ou se o melhor é esperar.",
    concept: [
      "Um convite faz sentido quando a conversa já flui sem esforço: ele responde com interesse, às vezes puxa assunto, faz perguntas e prolonga a conversa. Convite sem esse terreno costuma soar como pressão.",
      "Convidar não é pedir para voltar. É propor um momento leve, ao vivo, para os dois perceberem como é estar juntos hoje. A conversa sobre a relação, se acontecer, vem depois e nunca é obrigatória.",
      "Decidir esperar é tão válido quanto convidar. Esperar não é perder a chance; é não queimar uma conversa que ainda está se formando.",
    ],
    points: [
      {
        title: "Critérios do convite",
        text: "Sinais de abertura há pelo menos uma ou duas semanas; ele não pediu espaço; não está em outra relação; você está pronta para um não; o convite seria simples, num lugar público.",
      },
    ],
    example: {
      situation:
        "Situação A: vocês conversam há três semanas, quase sempre por iniciativa dele, e ele comentou duas vezes que sente falta de sair. Situação B: ele responde por educação e nunca puxa assunto.",
      takeaway:
        "Pelos mesmos critérios, na situação A um convite leve faz sentido; na B, a decisão é esperar. As duas decisões estão certas.",
    },
    practice: [
      "Releia o quadro de sinais do Dia 16 e a decisão do Dia 17.",
      "Confira cada critério com honestidade.",
      "Se algum critério falhar, a decisão é esperar.",
      'Se todos fizerem sentido, leia o cenário "Quero chamar para um encontro".',
    ],
    avoid: [
      'Convidar para "resolver de uma vez".',
      "Usar o convite para testar se ele ainda gosta de você.",
      "Convidar logo depois de uma conversa difícil.",
    ],
    action: "Confira os critérios e decida, com honestidade, se é hora de convidar ou de esperar.",
    exercise: {
      title: "Convidar ou esperar",
      steps: ["Confira os critérios.", "Responda e guarde no Diário."],
      prompts: [
        "Quais critérios fazem sentido hoje?",
        "Quais não fazem?",
        "A minha decisão, e por quê:",
      ],
    },
    checklist: [
      c("d19-sinais", "Rever os sinais de abertura"),
      c("d19-criterios", "Conferir os critérios do convite"),
      c("d19-decidir", "Decidir: convidar ou esperar"),
    ],
    tools: [
      {
        link: { kind: "scenario", id: "encontro" },
        label: "Cenário: quero chamar para um encontro",
      },
      SIGNALS,
      { link: { kind: "reply", situation: "encontro" }, label: "Se ele me convidar" },
    ],
    guide: {
      conversa: {
        text: [
          'Com conversa aberta, confira os critérios. Se fizerem sentido, o cenário "Quero chamar para um encontro" mostra como convidar sem pressão.',
        ],
      },
      espaco: {
        text: [
          "Sem reciprocidade, o critério principal não se cumpre: hoje não é hora de convite. A sua decisão do dia é esperar e cuidar de você enquanto isso.",
        ],
        checklist: [
          c("d19-sinais", "Rever os sinais de abertura"),
          c("d19-criterios", "Conferir os critérios do convite"),
          c("d19-esperar", "Registrar a decisão de esperar e o porquê"),
        ],
      },
      pausa: {
        text: [
          'Ele pediu um tempo, e o convite não entra enquanto durar. Se ele mesmo propuser um encontro, use o "Ele respondeu. E agora?" para decidir com calma.',
        ],
        checklist: [
          c("d19-sinais", "Rever os sinais de abertura"),
          c("d19-criterios", "Conferir os critérios do convite"),
          c("d19-esperar", "Registrar a decisão de esperar e o porquê"),
        ],
      },
      limite: {
        text: [
          "No seu cenário, não há convite. Este dia é sobre outro encontro: com você. Escolha algo que você adiou (um lugar, um curso, uma viagem curta) e marque uma data.",
        ],
        action: "Escolha algo que você adiou e marque uma data para fazer.",
        practice: [
          "Liste três coisas que você adiou nos últimos meses.",
          "Escolha uma que seja possível nas próximas semanas.",
          "Marque a data na agenda e escreva no Diário.",
        ],
        exercise: writeOnly("Um encontro com você", [
          "Três coisas que eu adiei:",
          "A que eu escolho, e quando:",
          "Com quem eu gostaria de ir (ou se vou sozinha):",
        ]),
        checklist: [
          c("d19-adiado", "Escolher algo que eu adiei"),
          c("d19-data", "Marcar uma data para isso"),
          c("d19-registro", "Registrar no Diário"),
        ],
        tools: [DIARY],
      },
      outra: {
        text: [
          "Ele está com outra pessoa. Um convite agora seria interferir numa relação que não é a sua. Este dia é sobre outro encontro: com você. Escolha algo que você adiou e marque uma data.",
        ],
        action: "Escolha algo que você adiou e marque uma data para fazer.",
        practice: [
          "Liste três coisas que você adiou nos últimos meses.",
          "Escolha uma que seja possível nas próximas semanas.",
          "Marque a data na agenda e escreva no Diário.",
        ],
        exercise: writeOnly("Um encontro com você", [
          "Três coisas que eu adiei:",
          "A que eu escolho, e quando:",
          "Com quem eu gostaria de ir (ou se vou sozinha):",
        ]),
        checklist: [
          c("d19-adiado", "Escolher algo que eu adiei"),
          c("d19-data", "Marcar uma data para isso"),
          c("d19-registro", "Registrar no Diário"),
        ],
        tools: [DIARY],
      },
      sem_diagnostico: {
        text: [
          "Sem diagnóstico, o app não sabe se há contato bem-vindo. Faça o diagnóstico antes de decidir sobre um convite.",
        ],
        checklist: [
          c("d19-diagnostico", "Fazer o diagnóstico"),
          c("d19-sinais", "Rever os sinais de abertura"),
          c("d19-criterios", "Conferir os critérios do convite"),
        ],
        tools: [DIAGNOSIS],
      },
    },
  },
  {
    day: 20,
    phase: 4,
    title: "Um convite simples, sem pressão",
    minutes: 6,
    goal: "Saber fazer um convite leve, específico e fácil de recusar, e se preparar para o encontro com segurança.",
    concept: [
      'Um convite leve tem três características: é específico (um café, um passeio), é num lugar público e de dia, e é fácil de recusar ("se não der, tudo bem").',
      'Evite o convite carregado ("precisamos conversar sério"), que já anuncia uma discussão, e o convite vago ("a gente devia se ver"), que deixa toda a decisão com ele.',
      "Se ele aceitar, prepare-se: decida o que você não vai trazer (cobranças, o término), avise alguém de confiança onde vai estar e mantenha o encontro curto. Um encontro bom que termina cedo vale mais do que um longo que termina mal.",
    ],
    points: [
      {
        title: "Segurança no encontro",
        text: "Lugar público, de dia, ida e volta por sua conta e alguém de confiança sabendo onde você está. Você pode ir embora a qualquer momento, sem precisar explicar.",
      },
    ],
    example: {
      situation: "Você escreve o convite na Pausa e depois passa pelos critérios.",
      contrast: {
        avoid: "Precisamos conversar sobre nós. Pode ser sábado?",
        better:
          "Abriu uma cafeteria nova perto do parque. Topa conhecer sábado à tarde? Se não der, tudo bem.",
      },
      takeaway:
        "A primeira versão anuncia uma conversa pesada. A segunda propõe um momento agradável e deixa espaço para recusar.",
    },
    practice: [
      "Escreva o convite na Pausa.",
      "Confira: é específico, num lugar público, de dia e fácil de recusar?",
      "Envie uma vez só. Se ele não responder, não reforce o convite.",
      'Se ele aceitar, leia "Preparar o encontro" na Central.',
    ],
    avoid: [
      "Convidar para a casa de um dos dois.",
      'Ultimatos ("é a última vez que eu chamo").',
      "Reforçar o convite se ele não responder.",
    ],
    action: "Se no Dia 19 você decidiu convidar, escreva o convite na Pausa antes de enviar.",
    exercise: {
      title: "Rascunho do convite",
      steps: [
        "Escreva o convite na Pausa.",
        "Confira os quatro critérios.",
        "Responda às perguntas e guarde no Diário.",
      ],
      prompts: [
        "O meu convite:",
        "O que eu não vou trazer para o encontro:",
        "Quem vai saber onde eu estou:",
      ],
    },
    checklist: [
      c("d20-pausa", "Escrever o convite na Pausa"),
      c("d20-leve", "Conferir se é específico, público e fácil de recusar"),
      c("d20-decidir", "Enviar uma vez só, ou guardar se decidi esperar"),
    ],
    tools: [
      PAUSE,
      { link: { kind: "central", category: "convites" }, label: "Central: convites" },
      { link: { kind: "message", id: "reen-preparar" }, label: "Preparar o encontro" },
    ],
    guide: {
      conversa: {
        text: [
          "Se no Dia 19 você decidiu convidar, hoje é o dia de escrever e, se os critérios fizerem sentido, enviar. Os modelos de convite da Central são pontos de partida. Se decidiu esperar, faça o exercício e guarde.",
        ],
      },
      espaco: {
        text: [
          "Sem reciprocidade, o convite fica no papel. O exercício ensina o formato; se um dia a conversa mudar, você vai saber como fazer.",
        ],
        action: "Escreva o convite como exercício e guarde no Diário. Hoje, nada sai daqui.",
        practice: [
          "Escreva o convite na Pausa, como exercício.",
          "Confira os quatro critérios.",
          "Guarde no Diário.",
        ],
        checklist: [
          c("d20-escrever", "Escrever o convite como exercício"),
          c("d20-leve", "Conferir se é específico, público e fácil de recusar"),
          c("d20-guardar", "Guardar no Diário, sem enviar"),
        ],
      },
      pausa: {
        text: [
          'Enquanto durar o tempo que ele pediu, nenhum convite parte de você. Se ele convidar, o "Ele respondeu. E agora?" ajuda a responder.',
        ],
        action:
          "Escreva o convite como exercício e guarde no Diário. Nada sai daqui enquanto o tempo durar.",
        practice: [
          "Escreva o convite na Pausa, como exercício.",
          "Confira os quatro critérios.",
          "Guarde no Diário.",
        ],
        checklist: [
          c("d20-escrever", "Escrever o convite como exercício"),
          c("d20-leve", "Conferir se é específico, público e fácil de recusar"),
          c("d20-guardar", "Guardar no Diário, sem enviar"),
        ],
        tools: [{ link: { kind: "reply", situation: "encontro" }, label: "Se ele me convidar" }],
      },
      limite: {
        text: [
          "No seu cenário, este dia é sobre convidar outras pessoas para a sua vida: uma amiga, alguém da família, um programa novo. Os mesmos princípios valem: específico, leve, fácil de recusar.",
        ],
        action: "Faça um convite leve para alguém que te faz bem.",
        example: {
          situation:
            'Faz meses que você não vê uma amiga de quem gosta. Você escreve: "Abriu uma cafeteria perto do parque. Topa sábado à tarde? Se não der, a gente marca outro dia."',
          takeaway:
            "Específico, leve e fácil de recusar: os mesmos princípios de qualquer convite, a serviço da sua vida agora.",
        },
        practice: [
          "Escolha uma pessoa que te faz bem e com quem você tem saído pouco.",
          "Proponha algo específico e simples.",
          "Registre no Diário como foi.",
        ],
        exercise: writeOnly("Pessoas que me fazem bem", [
          "Três pessoas que me fazem bem:",
          "O convite que eu vou fazer, e para quem:",
          "Como eu me senti depois:",
        ]),
        checklist: [
          c("d20-quem", "Escolher uma pessoa que me faz bem"),
          c("d20-convite", "Fazer um convite simples para ela"),
          c("d20-registro", "Registrar no Diário como foi"),
        ],
        tools: [DIARY],
      },
      sem_diagnostico: {
        text: [
          "Faça o diagnóstico antes de qualquer convite. Até lá, o exercício é só de escrita.",
        ],
        action: "Escreva o convite como exercício, guarde e faça o diagnóstico.",
        practice: [
          "Faça o diagnóstico.",
          "Escreva o convite na Pausa, como exercício.",
          "Guarde no Diário.",
        ],
        checklist: [
          c("d20-diagnostico", "Fazer o diagnóstico"),
          c("d20-escrever", "Escrever o convite como exercício"),
          c("d20-guardar", "Guardar no Diário, sem enviar"),
        ],
        tools: [DIAGNOSIS],
      },
    },
  },
  {
    day: 21,
    phase: 4,
    title: "Qualquer resposta, e o seu próximo passo",
    minutes: 6,
    goal: "Receber qualquer resposta com tranquilidade e decidir o seu próximo passo.",
    concept: [
      "Ele pode aceitar, recusar, adiar ou não responder. Você não controla isso. Controla como recebe e o que faz depois.",
      "Se ele recusar, agradeça e encerre com leveza. Recusa não é convite para insistir, renegociar ou pedir explicação. Se ele adiar sem propor outra data, trate como um não por agora.",
      "Se ele aceitar, o encontro é um começo, não uma conclusão. Mantenha a leveza, sem pressa de definir nada.",
      "Qualquer que seja a resposta, o que você construiu nestes 21 dias continua seu: menos impulso, mais clareza, mais cuidado com você.",
    ],
    points: [
      {
        title: "Se ele aceitar",
        text: "Combine o essencial (dia, hora e lugar) sem conversa longa antes. No encontro, fale do presente e deixe a conversa sobre a relação para quando os dois quiserem, se quiserem.",
      },
      {
        title: "Depois dos 21 dias",
        text: "O plano termina, mas as ferramentas continuam: a Pausa, o Diário e a Central seguem disponíveis para os próximos dias, qualquer que seja o rumo.",
      },
    ],
    example: {
      situation: 'Ele responde ao convite: "Essa semana não dá, tô enrolado."',
      contrast: {
        avoid: "Ah, e semana que vem? Ou você não quer me ver?",
        better: "Tranquilo! Boa semana pra você.",
      },
      takeaway:
        "Sem propor outra data e sem pedir explicação. Se ele quiser, ele propõe. A forma como você respondeu fica, qualquer que seja o desfecho.",
    },
    practice: [
      'Se ele aceitou: confirme o combinado e leia "Preparar o encontro".',
      "Se ele recusou ou adiou: agradeça em uma linha e não proponha outra data.",
      "Se ele não respondeu: não reforce o convite.",
      "Em todos os casos, escreva no Diário o que você leva destes 21 dias.",
    ],
    avoid: [
      "Insistir depois de um não.",
      "Pedir explicação para a recusa.",
      'Concluir que os 21 dias "não serviram" por causa da resposta dele.',
    ],
    action: "Escreva no Diário o que você leva destes 21 dias, qualquer que tenha sido a resposta.",
    exercise: {
      title: "O que eu levo",
      steps: ["Releia o Dia 1 e o Dia 18.", "Responda e guarde no Diário."],
      prompts: [
        "O que eu aprendi sobre mim nestes 21 dias:",
        "O que eu vou continuar fazendo:",
        "O meu próximo passo, para mim:",
      ],
    },
    checklist: [
      c("d21-calma", "Receber qualquer resposta (ou o silêncio) com calma"),
      c("d21-nao-insistir", "Não insistir depois de um não"),
      c("d21-levo", "Escrever o que eu levo destes 21 dias"),
    ],
    tools: [DIARY, { link: { kind: "message", id: "conv-recusa" }, label: "Se ele recusar" }, MAP],
    guide: {
      conversa: {
        text: [
          'Se você convidou, use as orientações acima para qualquer resposta. Se ele convidar você, o "Ele respondeu. E agora?" ajuda a decidir.',
        ],
        tools: [{ link: { kind: "reply", situation: "encontro" }, label: "Se ele me convidar" }],
      },
      espaco: {
        text: [
          "Sem convite enviado, o dia é sobre o seu próximo passo. Pergunte a você: continuo dando espaço, ou é hora de seguir em frente? As duas respostas são legítimas.",
        ],
        checklist: [
          c("d21-levo", "Escrever o que eu levo destes 21 dias"),
          c("d21-proximo", "Escolher o meu próximo passo"),
          c("d21-reconhecer", "Reconhecer o que eu atravessei"),
        ],
      },
      pausa: {
        text: [
          "O tempo que ele pediu pode ainda estar valendo. Decida o que fazer depois: esperar mais, por quanto tempo, e o que fazer por você enquanto isso.",
        ],
        checklist: [
          c("d21-levo", "Escrever o que eu levo destes 21 dias"),
          c("d21-proximo", "Escolher o meu próximo passo"),
          c("d21-reconhecer", "Reconhecer o que eu atravessei"),
        ],
      },
      limite: {
        text: [
          "No seu cenário, este dia fecha 21 dias de respeito a um limite, o que é difícil e merece reconhecimento. Escreva o que você leva e qual é o seu próximo passo, para você.",
        ],
        example: {
          situation:
            "Relendo o Diário, você vê que no começo escrevia todos os dias sobre ele. Nas últimas semanas, os registros falam mais do trabalho, das amigas e do sono.",
          takeaway:
            "Respeitar o limite não apagou o que você sente, mas devolveu espaço para a sua vida. Esse é o resultado que fica com você.",
        },
        practice: [
          "Releia o Dia 1 e o Dia 18.",
          "Escreva o que você leva destes 21 dias.",
          "Escolha um próximo passo que dependa só de você.",
        ],
        checklist: [
          c("d21-levo", "Escrever o que eu levo destes 21 dias"),
          c("d21-proximo", "Escolher o meu próximo passo"),
          c("d21-reconhecer", "Reconhecer o que eu atravessei"),
        ],
      },
      sem_diagnostico: {
        text: [NO_DIAGNOSIS],
        practice: [
          "Releia o Dia 1 e o Dia 18.",
          "Escreva o que você leva destes 21 dias.",
          "Escolha um próximo passo que dependa só de você.",
        ],
        checklist: [
          c("d21-levo", "Escrever o que eu levo destes 21 dias"),
          c("d21-proximo", "Escolher o meu próximo passo"),
          c("d21-reconhecer", "Reconhecer o que eu atravessei"),
        ],
        tools: [DIAGNOSIS],
      },
    },
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
