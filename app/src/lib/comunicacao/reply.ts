// "Ele respondeu. E agora?": conteúdo e regras puras (sem React e sem window), testados em
// reply.test.ts. RASCUNHO de conteúdo: precisa de revisão editorial antes de virar "aprovado".
//
// Funciona por regras, não por IA. Ela escolhe o que aconteceu, responde no máximo uma pergunta de
// refinamento e vê um resultado fixo. Depois, resolveReply aplica o momento dela (o mesmo
// CommContext da Central), nesta ordem:
// 1. Limite (bloqueio, pedido de não contato, outra relação): nenhuma resposta é sugerida, o
//    exemplo some e o próximo passo vira o Diário. Vale para todas as situações.
// 2. Pausa ou espaço: ele escreveu primeiro, então responder pode fazer sentido, sem reabrir a
//    relação. A disponibilidade do exemplo é a mesma da Central (availabilityOf).
// 3. Conversa ou sem diagnóstico: o resultado da situação, com a Pausa antes de enviar.
//
// Linguagem: nada afirma o que ele pensa ou vai decidir. As leituras falam em possibilidades.

import { availabilityNote, availabilityOf, canSend, messageById } from "@/lib/comunicacao/rules";
import type {
  CommCategoryId,
  CommContext,
  CommMessage,
  ReplyAction,
  ReplyAlert,
  ReplyLimit,
  ReplyOutcome,
  ReplyPoint,
  ReplySituation,
  ReplySituationId,
  ResolvedReply,
} from "@/lib/comunicacao/types";
import type { DiagnosisAnswers } from "@/lib/jornada/types";
import { dayContent } from "@/lib/plan";
import type { ScenarioId } from "@/lib/scenarios";

// ---------- Atalhos para os passos ----------

const pauseExample = (
  text = "Troque pelas suas palavras e confira o checklist antes de enviar.",
): ReplyAction => ({
  target: "pause_example",
  label: "Adaptar esta resposta na Pausa",
  text,
});

const pause = (label: string, text: string): ReplyAction => ({ target: "pause", label, text });

const diary = (label: string, text: string): ReplyAction => ({ target: "diary", label, text });

const central = (category: CommCategoryId, label: string, text: string): ReplyAction => ({
  target: "central",
  category,
  label,
  text,
});

const scenario = (id: ScenarioId, label: string, text: string): ReplyAction => ({
  target: "scenario",
  scenario: id,
  label,
  text,
});

const day = (n: number, text: string): ReplyAction => ({
  target: "day",
  day: n,
  label: `Dia ${n} do plano: ${dayContent(n).title}`,
  text,
});

const signals: ReplyAction = {
  target: "signals",
  label: "Sinais de abertura e de alerta",
  text: "Para olhar o padrão das conversas, e não uma mensagem isolada.",
};

const point = (text: string, why: string): ReplyPoint => ({ text, why });

// ---------- Avisos que se repetem ----------

const VIOLENCE: ReplyAlert = {
  tone: "stop",
  title: "Ameaça, humilhação ou medo não são conversa",
  text: "Se ele ameaçou, humilhou, controlou ou você sentiu medo, não responda para acalmar. Guarde as mensagens, fale com alguém de confiança e, se precisar, ligue 180 (Central de Atendimento à Mulher). Em perigo imediato, 190.",
};

const LIMIT_NOTICE: ReplyAlert = {
  tone: "stop",
  title: "Existe um limite registrado no seu diagnóstico",
  text: "Pelo que você registrou, ele bloqueou, pediu para não haver contato ou está em outra relação. Enquanto isso valer, o app não sugere respostas. Se foi ele quem procurou você e a situação mudou, atualize o diagnóstico antes de responder.",
};

// ---------- Situações ----------

export const replySituations: ReplySituation[] = [
  {
    id: "frio",
    label: "Ele respondeu friamente.",
    title: "Ele respondeu friamente",
    hint: "Resposta curta, seca ou sem pergunta de volta.",
    reading: [
      "Uma resposta curta pode ter muitos motivos: cansaço, pressa, cautela, ou pouca vontade de conversar agora. Só pela mensagem não dá para saber qual.",
      "Frieza depois de um término é comum. Muitas vezes é uma forma de se proteger, e não um recado sobre você.",
      "Vale mais olhar o padrão das últimas conversas do que tentar decifrar uma mensagem.",
    ],
    question: {
      text: "Nas últimas conversas, ele tem respondido e às vezes puxado assunto?",
      hint: "Pense nas últimas duas ou três semanas, não só em hoje.",
      options: [
        { id: "reciproco", label: "Sim, ele responde e às vezes pergunta algo" },
        { id: "unilateral", label: "Não, quase sempre sou eu quem escreve" },
      ],
    },
    outcomes: {
      reciproco: {
        title: "Responda no tamanho dele, sem cobrar entusiasmo",
        respond: "sim",
        reading: [
          "Se há resposta de volta, existe alguma abertura, mesmo que pequena. Ela não precisa crescer hoje.",
        ],
        doNow: [
          point(
            "Responder curto, no mesmo tom e no mesmo tamanho que ele.",
            "Espelhar o tamanho mostra que você está bem e tira o peso da conversa.",
          ),
          point(
            "Falar de algo leve e concreto do seu dia, se quiser continuar.",
            "Assunto leve dá a ele um jeito fácil de responder, sem obrigação.",
          ),
          point(
            "Encerrar você, com gentileza, antes que a conversa canse.",
            "Uma conversa que termina bem deixa uma lembrança melhor do que uma que morre sem resposta.",
          ),
        ],
        avoid: [
          point(
            'Reclamar da frieza ("nossa, que seco").',
            "Cobrar o tom transforma a conversa em cobrança, e a cobrança costuma aumentar a distância.",
          ),
          point(
            'Pedir explicação agora ("o que está acontecendo?").',
            "Pergunta grande por mensagem pede uma resposta que ele talvez não tenha. Ela fica para outro momento, se houver.",
          ),
          point(
            "Mandar várias mensagens para animar a conversa.",
            "Mais mensagens do seu lado deixam a conversa desequilibrada.",
          ),
        ],
        example: {
          him: "Tudo certo por aqui.",
          replyId: "frio-espelhar",
          note: "Curta, positiva e sem pergunta obrigatória. Se ele quiser continuar, a porta está aberta.",
        },
        next: pauseExample(),
        more: [
          day(15, "Como encerrar a conversa enquanto ela ainda está boa."),
          scenario(
            "frio",
            "Cenário: ele está frio e distante",
            "O que costuma ajudar quando o clima esfriou.",
          ),
          central(
            "frio",
            "Mais exemplos na Central: Respostas frias",
            "Outras respostas curtas para o mesmo momento.",
          ),
        ],
        related: ["frio-encerrar", "frio-assunto-neutro", "evit-cobranca"],
      },
      unilateral: {
        title: "Responda pouco ou não responda, e dê espaço",
        respond: "opcional",
        reading: [
          "Quando quase sempre é você quem escreve, mais uma mensagem tende a reforçar o desequilíbrio, não a resolver.",
        ],
        doNow: [
          point(
            "Se a mensagem dele pede resposta, responder em uma linha e parar ali.",
            "Responder ao que ele trouxe é educação. Esticar a conversa, agora, seria insistência.",
          ),
          point(
            "Não começar a próxima conversa. Deixar que, se houver uma, ela venha dele.",
            "Espaço de verdade é o que permite ver se existe interesse do outro lado.",
          ),
          point(
            "Anotar no Diário o que você sentiu com a resposta.",
            "Escrever tira a urgência de responder para aliviar a ansiedade.",
          ),
        ],
        avoid: [
          point(
            "Perguntar por que ele está assim.",
            "Sem reciprocidade, a pergunta costuma soar como cobrança.",
          ),
          point(
            "Mandar outra mensagem para ver se ele responde melhor.",
            "Testar a resposta dele mantém você presa ao celular e raramente muda o tom.",
          ),
        ],
        example: {
          him: "Tudo certo por aqui.",
          replyId: "frio-encerrar",
          note: "Se quiser responder, uma linha que encerra com leveza basta. Não enviar também é uma escolha válida.",
        },
        next: diary(
          "Registrar no Diário e soltar o celular",
          "O próximo passo é seu, não dele: cuidar do que essa resposta mexeu em você.",
        ),
        more: [
          day(17, "Como ajustar o ritmo em vez de insistir."),
          pause(
            "Escrever na Pausa antes de qualquer coisa",
            "Se a vontade de mandar mais uma apertar, escreva lá primeiro.",
          ),
          signals,
        ],
        related: ["semresp-nao-enviar", "evit-cobranca"],
      },
    },
    category: "frio",
    heWrote: true,
    status: "rascunho",
  },
  {
    id: "saudade",
    label: "Ele disse que sente saudade.",
    title: "Ele disse que sente saudade",
    hint: "Falou em saudade, lembrança ou falta de você.",
    reading: [
      "Saudade é um sentimento, não uma proposta. Ela pode existir sem que ele queira, ou consiga, voltar agora.",
      "Pode ser carinho sincero, um momento de solidão ou vontade de conversar. A mensagem sozinha não diz qual.",
      "O que costuma mostrar mais é o que vem depois: se ele continua presente na conversa, ou se diz isso e some.",
    ],
    question: {
      text: "Em que momento ele escreveu?",
      options: [
        { id: "dia", label: "Durante o dia, numa conversa tranquila" },
        { id: "noite", label: "Tarde da noite, ou parecia ter bebido" },
        { id: "repete", label: "Ele já disse isso antes e depois sumiu" },
      ],
    },
    outcomes: {
      dia: {
        title: "Acolha a abertura sem precipitar uma definição",
        respond: "sim",
        doNow: [
          point(
            "Responder com calma, reconhecendo o que ele disse.",
            "Acolher mostra que você recebeu bem, sem transformar a frase em compromisso.",
          ),
          point(
            "Deixar a conversa leve depois disso.",
            "Leveza dá espaço para ele continuar sem se sentir encurralado.",
          ),
          point(
            "Se a conversa for ficando séria, sugerir falar com calma, ao vivo.",
            "Assuntos grandes ficam melhores frente a frente, com tempo.",
          ),
        ],
        avoid: [
          point(
            'Perguntar "então vamos voltar?".',
            "Pedir uma definição logo depois de uma abertura costuma fazer a pessoa recuar.",
          ),
          point(
            "Responder com um textão sobre tudo o que você sente.",
            "Despejar tudo de uma vez muda o peso da conversa e tira a leveza que permitiu a abertura.",
          ),
          point(
            'Cobrar ("então por que você foi embora?").',
            "Transforma um momento de carinho em acerto de contas.",
          ),
        ],
        example: {
          him: "Tô com saudade de você.",
          replyId: "saudade-acolher",
          note: "Recebe a saudade com carinho e não pede nada em troca.",
        },
        next: pauseExample(),
        more: [
          day(16, "Como separar sinais de abertura de sinais de alerta."),
          central(
            "saudade",
            "Mais exemplos na Central: Saudade",
            "Outras formas de acolher sem pressa.",
          ),
          scenario("respondeu", "Cenário: ele respondeu", "Como manter a conversa leve."),
        ],
        related: ["saudade-sem-pressa", "saudade-misturada"],
      },
      noite: {
        title: "Não decida nada de madrugada",
        respond: "opcional",
        reading: [
          "Mensagens tarde da noite, ou depois de beber, costumam vir num momento de mais emoção e menos clareza. De manhã, o mesmo assunto pode pesar diferente para ele, e para você.",
        ],
        doNow: [
          point(
            "Responder de manhã, ou responder curto e propor falar durante o dia.",
            "Você não precisa acompanhar o horário dele. Conversas importantes pedem cabeça descansada.",
          ),
          point(
            "Notar o que você sentiu ao ler, antes de responder.",
            "Mensagem de madrugada costuma mexer forte. Responder no impulso aumenta a chance de arrependimento.",
          ),
        ],
        avoid: [
          point(
            "Entrar numa conversa longa e emocionada de madrugada.",
            "O que se fala nessa hora costuma ser revisto no dia seguinte, por um ou pelos dois.",
          ),
          point(
            "Tomar a frase como decisão sobre a relação.",
            "Saudade num momento de vulnerabilidade não é a mesma coisa que uma escolha.",
          ),
        ],
        example: {
          him: "Não paro de pensar em você hoje...",
          replyId: "saudade-madrugada",
          note: "Gentil, sem fechar a porta, e leva a conversa para um horário melhor.",
        },
        next: pauseExample("Escreva agora, se quiser, e releia de manhã antes de enviar."),
        more: [
          day(5, "Um plano para as horas em que a emoção aperta."),
          diary("Registrar no Diário", "Anote o que a mensagem mexeu em você antes de decidir."),
        ],
        related: ["saudade-acolher", "saudade-misturada"],
      },
      repete: {
        title: "Olhe o padrão, não só a frase",
        respond: "opcional",
        reading: [
          "Quando a saudade aparece e some várias vezes, o padrão diz mais do que a frase. Isso não prova o que ele sente, mas mostra que, por enquanto, a palavra não tem vindo acompanhada de presença.",
        ],
        doNow: [
          point(
            "Responder com carinho e com clareza sobre você.",
            "Você pode reconhecer a saudade e, ao mesmo tempo, mostrar que quer ir com calma.",
          ),
          point(
            "Observar o que ele faz nos próximos dias, sem cobrar.",
            "Ações repetidas mostram mais do que uma mensagem bonita.",
          ),
          point(
            "Cuidar da sua rotina como antes da mensagem.",
            "Se tudo para quando ele aparece, o ciclo de esperar e se frustrar continua.",
          ),
        ],
        avoid: [
          point(
            "Reorganizar a sua vida em volta da mensagem.",
            "Se ele sumir de novo, a queda costuma ser maior.",
          ),
          point(
            'Jogar o padrão na cara ("você sempre faz isso").',
            "Cobrança abre briga. Clareza sobre o que você quer funciona melhor.",
          ),
        ],
        example: {
          him: "Sinto sua falta, sabia?",
          replyId: "saudade-misturada",
          note: "Reconhece o sentimento e deixa claro que você vai no seu ritmo.",
        },
        next: pauseExample(),
        more: [
          signals,
          day(16, "Como ler sinais de abertura e de alerta."),
          diary(
            "Registrar no Diário",
            "Anotar cada vez que ele aparece ajuda a enxergar o padrão com calma.",
          ),
        ],
        related: ["saudade-sem-pressa"],
      },
    },
    category: "saudade",
    heWrote: true,
    status: "rascunho",
  },
  {
    id: "pergunta",
    label: "Ele fez uma pergunta.",
    title: "Ele fez uma pergunta",
    hint: "Perguntou algo sobre você, sobre vocês ou sobre algo prático.",
    reading: [
      "Uma pergunta mostra algum interesse em conversar, mas não diz o quanto, nem com que intenção.",
      "O tipo da pergunta muda a resposta: uma pergunta leve pede resposta leve; uma pergunta grande pede cuidado, e às vezes conversa ao vivo.",
    ],
    question: {
      text: "Sobre o que foi a pergunta?",
      options: [
        { id: "como_esta", label: "Como eu estou" },
        { id: "alguem", label: "Se estou com alguém" },
        { id: "sentimentos", label: "Sobre nós, ou se ainda gosto dele" },
        { id: "por_que", label: "Por que algo aconteceu" },
        { id: "pratico", label: "Algo prático (objetos, contas, pet)" },
      ],
    },
    outcomes: {
      como_esta: {
        title: "Mostre que você está bem, sem fingir e sem pedir nada",
        respond: "sim",
        doNow: [
          point(
            "Contar algo simples e verdadeiro do seu momento.",
            'Uma resposta concreta é mais natural do que um "tudo ótimo" genérico.',
          ),
          point("Devolver a pergunta, sem pressão.", "Dá a ele a chance de continuar, se quiser."),
        ],
        avoid: [
          point(
            'Responder "mal, sem você".',
            "Põe nele a responsabilidade pelo seu bem-estar, e isso costuma pesar.",
          ),
          point(
            "Fingir uma vida perfeita para impressionar.",
            "Encenação cansa e costuma soar falsa. Verdade simples funciona melhor.",
          ),
        ],
        example: {
          him: "E aí, como você está?",
          replyId: "perg-como-esta",
          note: "Verdadeira, leve e devolve a pergunta. Troque o trecho entre colchetes pelo que é seu.",
        },
        next: pauseExample(),
        more: [
          day(14, "O que fazer quando ele responde."),
          central(
            "perguntas",
            "Mais exemplos na Central: Perguntas dele",
            "Respostas para outras perguntas.",
          ),
        ],
        related: ["perg-sumiu"],
      },
      alguem: {
        title: "Responda com verdade e poucas palavras",
        respond: "sim",
        doNow: [
          point(
            "Responder a verdade, de forma curta.",
            "Honestidade simples evita mal-entendidos e não abre disputa.",
          ),
          point(
            "Voltar a conversa para algo leve, ou deixá-la terminar.",
            "Você não precisa explicar a sua vida afetiva em detalhes.",
          ),
        ],
        avoid: [
          point(
            "Inventar alguém para provocar ciúme.",
            "Ciúme provocado é manipulação, quebra a confiança e costuma afastar.",
          ),
          point(
            'Devolver com "por quê? você está?".',
            "Vira interrogatório e desvia para o que ele faz da vida.",
          ),
        ],
        example: {
          him: "Você está saindo com alguém?",
          replyId: "perg-alguem",
          note: "Verdadeira e curta, sem drama e sem joguinho.",
        },
        next: pauseExample(),
        more: [
          central(
            "perguntas",
            "Mais exemplos na Central: Perguntas dele",
            "Respostas para outras perguntas.",
          ),
        ],
        related: ["evit-ciume"],
      },
      sentimentos: {
        title: "Seja honesta, sem textão, e leve o assunto para o vivo",
        respond: "sim",
        reading: [
          "Perguntas sobre os seus sentimentos podem mostrar interesse, curiosidade ou dúvida dele. Ainda não são uma proposta.",
        ],
        doNow: [
          point(
            "Responder com verdade e poucas palavras.",
            "Você não precisa esconder o que sente, nem colocar tudo numa mensagem.",
          ),
          point(
            "Propor conversar pessoalmente, uma vez, sem insistir.",
            "Assunto grande merece tom de voz, olhar e tempo.",
          ),
        ],
        avoid: [
          point(
            "Despejar tudo o que você sente por mensagem.",
            "Um textão exige uma resposta à altura, e isso costuma assustar.",
          ),
          point(
            'Responder com outra pergunta para testar ("e você?").',
            "Testar o outro troca a conversa sincera por um jogo de quem fala primeiro.",
          ),
        ],
        example: {
          him: "Você ainda gosta de mim?",
          replyId: "perg-ainda-gosta",
          note: "Honesta sem se expor demais, e propõe conversa ao vivo.",
        },
        next: pauseExample(),
        more: [
          diary(
            "Preparar no Diário o que você quer dizer",
            "Saber o que você sente antes de falar deixa a conversa mais calma.",
          ),
          day(19, "Quando um convite para conversar faz sentido."),
        ],
        related: ["conf-pergunta-dificil", "saudade-sem-pressa"],
      },
      por_que: {
        title: "Responda com calma, e de preferência ao vivo",
        respond: "sim",
        reading: [
          'Perguntas de "por quê" costumam vir de algo que ainda dói ou não ficou claro. Elas merecem uma resposta de verdade, e mensagem nem sempre é o lugar.',
        ],
        doNow: [
          point(
            "Reconhecer que ele tem o direito de perguntar.",
            "Validar a pergunta baixa a defesa dos dois.",
          ),
          point(
            "Propor responder numa conversa, com calma.",
            "Por escrito, explicações longas viram debate.",
          ),
        ],
        avoid: [
          point(
            "Responder com justificativas longas e na defensiva.",
            "Justificar tudo de uma vez costuma soar como se você não tivesse ouvido.",
          ),
          point(
            'Devolver com acusação ("e você, que fez...?").',
            "Troca a pergunta dele por uma briga.",
          ),
        ],
        example: {
          him: "Por que você fez aquilo?",
          replyId: "conf-pergunta-dificil",
          note: "Reconhece a pergunta e oferece uma conversa de verdade, sem pressionar.",
        },
        next: pauseExample(),
        more: [
          central(
            "confianca",
            "Central: Reconstruir confiança",
            "Como agir com coerência quando a confiança foi abalada.",
          ),
          diary(
            "Preparar no Diário a sua resposta",
            "Escrever antes ajuda a responder sem se defender.",
          ),
        ],
        related: ["conf-coerencia", "ress-reconhecer"],
      },
      pratico: {
        title: "Resolva o assunto com gentileza e objetividade",
        respond: "sim",
        reading: [
          "Assunto prático é, antes de tudo, assunto prático. Ler a mensagem como pretexto costuma criar expectativa à toa.",
        ],
        doNow: [
          point("Responder só o que foi perguntado.", "Objetividade resolve e mostra respeito."),
          point("Ser cordial.", "Educação simples deixa o clima leve, sem exigir nada."),
        ],
        avoid: [
          point(
            "Aproveitar para falar da relação.",
            "Misturar os assuntos costuma fazer o outro evitar até as conversas práticas.",
          ),
        ],
        example: {
          him: "Posso passar para pegar minhas coisas?",
          replyId: "perg-pratico",
          note: "Resolve o assunto com cordialidade, sem puxar outro tema.",
        },
        next: pauseExample(),
        more: [diary("Registrar no Diário", "Anote como você se sentiu, se mexeu com você.")],
        related: [],
      },
    },
    category: "perguntas",
    heWrote: true,
    status: "rascunho",
  },
  {
    id: "magoa",
    label: "Ele demonstrou mágoa.",
    title: "Ele demonstrou mágoa",
    hint: "Falou de algo que o machucou, sem agressividade.",
    reading: [
      "Quando alguém fala de uma mágoa, pode estar tentando ser ouvido, entender o que aconteceu ou fechar uma ferida. Não dá para saber qual, mas em todos os casos escutar vem antes de explicar.",
      "Reconhecer o que ele sentiu não é concordar com tudo, nem assumir uma culpa que não é sua.",
    ],
    question: {
      text: "O que ele parece querer agora?",
      options: [
        { id: "desabafo", label: "Desabafar, contar o que sentiu" },
        { id: "explicacao", label: "Uma explicação, entender o que aconteceu" },
      ],
    },
    outcomes: {
      desabafo: {
        title: "Escute e reconheça, sem justificativa automática",
        respond: "sim",
        doNow: [
          point(
            "Mostrar que você ouviu, com as palavras dele.",
            "Sentir-se ouvido costuma diminuir a necessidade de repetir a mágoa.",
          ),
          point(
            "Assumir a sua parte, se houver, sem exagerar.",
            "Responsabilidade proporcional é mais crível do que culpa total.",
          ),
          point(
            "Esperar antes de responder, se a mensagem mexeu forte com você.",
            "Responder magoada costuma virar defesa.",
          ),
        ],
        avoid: [
          point(
            'Começar com "mas" ou com a sua versão.',
            "Justificar logo em seguida apaga o reconhecimento e soa como defesa.",
          ),
          point(
            "Prometer que tudo vai ser diferente.",
            "Promessas por mensagem pesam pouco. Coerência ao longo do tempo pesa mais.",
          ),
          point(
            "Pedir perdão várias vezes ou implorar.",
            "Pressiona ele a te consolar, e inverte o momento.",
          ),
        ],
        example: {
          him: "Você me magoou muito naquela época.",
          replyId: "ress-reconhecer",
          note: "Reconhece a dor dele sem se defender e sem cobrar resposta.",
        },
        next: pauseExample(),
        more: [
          central(
            "confianca",
            "Central: Reconstruir confiança",
            "Coerência e pedido de desculpas sem pressão.",
          ),
          central(
            "ressentimento",
            "Central: Mágoa e ressentimento",
            "Outras respostas para quando a mágoa aparece.",
          ),
          diary(
            "Registrar no Diário o que isso mexeu em você",
            "Ouvir uma mágoa também dói. Cuide disso fora da conversa.",
          ),
        ],
        related: ["conf-coerencia", "ress-assumir-parte"],
      },
      explicacao: {
        title: "Responda com honestidade, e o principal ao vivo",
        respond: "sim",
        doNow: [
          point(
            "Reconhecer primeiro o que ele sentiu, depois explicar.",
            "Explicação sem reconhecimento costuma soar como desculpa.",
          ),
          point(
            "Propor conversar com calma, se o assunto for grande.",
            "Explicações longas por mensagem viram debate de frase em frase.",
          ),
        ],
        avoid: [
          point(
            "Escrever uma defesa longa ponto por ponto.",
            "Ele pode ler como se você não tivesse ouvido.",
          ),
          point(
            'Minimizar ("não foi nada demais").',
            "Diminuir a dor do outro costuma aumentar a mágoa.",
          ),
        ],
        example: {
          him: "Eu só queria entender por que você fez aquilo.",
          replyId: "conf-pergunta-dificil",
          note: "Reconhece o direito de perguntar e oferece uma conversa de verdade.",
        },
        next: pauseExample(),
        more: [
          central(
            "confianca",
            "Central: Reconstruir confiança",
            "Como ser coerente quando a confiança foi abalada.",
          ),
          diary(
            "Preparar no Diário o que você quer explicar",
            "Organizar antes evita se defender no calor da conversa.",
          ),
        ],
        related: ["ress-reconhecer", "conf-coerencia"],
      },
    },
    category: "ressentimento",
    heWrote: true,
    status: "rascunho",
  },
  {
    id: "raiva",
    label: "Ele demonstrou raiva.",
    title: "Ele demonstrou raiva",
    hint: "Veio com acusação, cobrança ou tom agressivo.",
    reading: [
      "Raiva muitas vezes esconde mágoa ou frustração. Mas entender de onde ela pode vir não significa aceitar ofensa.",
      "No meio da raiva, quase nada do que se escreve é ouvido. A conversa, se houver, rende mais depois.",
    ],
    question: {
      text: "Houve ameaça, humilhação, ou você sentiu medo?",
      options: [
        { id: "nao", label: "Não. Foi raiva ou acusação, sem ameaça" },
        { id: "sim", label: "Sim, ou não tenho certeza" },
      ],
    },
    outcomes: {
      nao: {
        title: "Não entre na briga: reconheça e saia com respeito",
        respond: "opcional",
        doNow: [
          point(
            "Esperar antes de responder. Horas, se precisar.",
            "Responder no calor costuma virar revide.",
          ),
          point(
            "Se responder, uma frase calma que não aceita a briga.",
            "Você pode reconhecer que ele está bravo sem concordar com tudo.",
          ),
          point(
            "Sair da conversa se ela continuar agressiva.",
            "Você não precisa ficar numa conversa que machuca.",
          ),
        ],
        avoid: [
          point("Revidar ou ironizar.", "Revide alimenta a briga, e o assunto real se perde."),
          point(
            "Se justificar em várias mensagens.",
            "No meio da raiva, explicações costumam ser lidas como ataque.",
          ),
          point(
            "Pedir desculpas só para a raiva passar.",
            "Desculpa sem convicção costuma voltar como cobrança depois.",
          ),
        ],
        example: {
          him: "Você estragou tudo, como sempre.",
          replyId: "ress-nao-revidar",
          note: "Não aceita a briga, não ataca e deixa a porta aberta para outro momento.",
        },
        alerts: [
          {
            tone: "care",
            title: "Se a raiva virar ofensa",
            text: "Você pode encerrar a conversa. Uma frase curta basta, e depois não é preciso responder mais.",
          },
        ],
        next: pauseExample(
          "Escreva na Pausa e espere passar a raiva, a dele e a sua, antes de enviar.",
        ),
        more: [
          central(
            "ressentimento",
            "Central: Mágoa e ressentimento",
            "Respostas que não alimentam a briga.",
          ),
          diary("Registrar no Diário", "Anote o que você sentiu, para não responder com isso."),
          day(2, "Como sair do modo reação."),
        ],
        related: ["ress-limite", "ress-reconhecer"],
      },
      sim: {
        title: "A sua segurança vem antes de qualquer resposta",
        respond: "nao",
        reading: [
          "Ameaça, humilhação ou medo não são uma discussão difícil. Nesses casos, nenhuma técnica de comunicação resolve, e a prioridade é você ficar segura.",
        ],
        doNow: [
          point(
            "Não responder para acalmá-lo.",
            "Tentar apaziguar alguém que ameaça costuma manter você na conversa que machuca.",
          ),
          point(
            "Guardar as mensagens (print).",
            "Se você precisar de ajuda ou de uma medida de proteção, elas são registro.",
          ),
          point("Falar com alguém de confiança hoje.", "Ninguém precisa atravessar isso sozinha."),
          point(
            "Se houver risco, buscar ajuda: 180 orienta; em perigo imediato, 190.",
            "Esses serviços existem para isso, e o atendimento do 180 é gratuito e sigiloso.",
          ),
        ],
        avoid: [
          point(
            'Encontrar com ele para "resolver".',
            "Um encontro com alguém que ameaça pode colocar você em risco.",
          ),
          point("Achar que a culpa é sua.", "Nada justifica ameaça ou humilhação."),
        ],
        alerts: [VIOLENCE],
        care: true,
        next: diary(
          "Registrar no Diário o que aconteceu",
          "Anotar data e o que foi dito ajuda a enxergar com clareza e a pedir ajuda, se precisar.",
        ),
        more: [
          {
            target: "diagnosis",
            label: "Atualizar meu diagnóstico",
            text: "Para o app parar de sugerir mensagens enquanto você cuida de você.",
          },
        ],
        related: ["ress-limite"],
      },
    },
    category: "ressentimento",
    heWrote: true,
    status: "rascunho",
  },
  {
    id: "conversar",
    label: "Ele sugeriu conversar.",
    title: "Ele sugeriu conversar",
    hint: 'Disse algo como "a gente precisa conversar".',
    reading: [
      "Querer conversar mostra disposição para falar, mas não diz sobre o quê, nem o que ele espera. Pode ser para reaproximar, para fechar o assunto, ou para resolver algo prático.",
      "Por isso, o melhor preparo é para qualquer resultado, não só para o que você deseja.",
    ],
    question: {
      text: "Você se sente pronta para essa conversa agora?",
      options: [
        { id: "pronta", label: "Sim, me sinto pronta" },
        { id: "ainda_nao", label: "Ainda não, preciso de um tempo" },
      ],
    },
    outcomes: {
      pronta: {
        title: "Aceite com tranquilidade e prepare-se para qualquer resposta",
        respond: "sim",
        doNow: [
          point(
            "Aceitar e propor um momento com tempo, de preferência ao vivo ou por ligação.",
            "Conversa importante por mensagem costuma virar mal-entendido.",
          ),
          point(
            "Preparar antes o que você quer dizer, e o que você não vai trazer.",
            "Ter isso claro evita transformar a conversa numa DR sem fim.",
          ),
          point(
            "Ouvir mais do que falar no começo.",
            "Saber o que ele quer conversar ajuda você a responder ao que realmente está em jogo.",
          ),
        ],
        avoid: [
          point(
            'Perguntar por mensagem "sobre o quê?" com ansiedade.',
            "Adiantar o assunto por escrito costuma tirar a calma da conversa.",
          ),
          point(
            "Chegar com uma lista de cobranças.",
            "Vira julgamento, e ele tende a se defender.",
          ),
          point(
            "Contar com um resultado específico.",
            "Uma conversa não decide tudo sozinha. Estar preparada para qualquer resposta protege você.",
          ),
        ],
        example: {
          him: "Acho que a gente precisava conversar direito.",
          replyId: "conv-ele-convida",
          note: "Aceita com tranquilidade e já propõe um momento, sem ansiedade.",
        },
        next: pauseExample(),
        more: [
          diary(
            "Preparar a conversa no Diário",
            "O que eu quero dizer, o que não vou trazer e como vou ficar se a resposta for não.",
          ),
          day(19, "Quando uma conversa ou convite faz sentido."),
          central("reencontro", "Central: Reencontro", "Como se preparar e o que fazer depois."),
        ],
        related: ["reen-preparar", "conf-pergunta-dificil"],
      },
      ainda_nao: {
        title: "Você pode pedir um tempo com gentileza",
        respond: "sim",
        doNow: [
          point(
            "Responder que quer conversar com calma, num momento melhor.",
            "Adiar com clareza é diferente de fugir. Mostra cuidado com a conversa.",
          ),
          point(
            "Usar esse tempo para entender o que você quer.",
            "Chegar mais tranquila costuma deixar a conversa melhor para os dois.",
          ),
        ],
        avoid: [
          point(
            "Aceitar só por medo de perder a chance.",
            "Conversa feita no impulso tende a deixar arrependimento.",
          ),
          point("Sumir sem responder.", "Silêncio sem explicação costuma ser lido como recusa."),
        ],
        example: {
          him: "Acho que a gente precisava conversar direito.",
          replyId: "saudade-sem-pressa",
          note: "Recebe a abertura e combina conversar com calma, sem fechar a porta.",
        },
        next: pauseExample(),
        more: [
          diary(
            "Escrever no Diário o que você precisa antes",
            "Ajuda a perceber quando você estiver pronta.",
          ),
          central("reencontro", "Central: Reencontro", "Para quando a conversa acontecer."),
        ],
        related: ["reen-preparar"],
      },
    },
    category: "reencontro",
    heWrote: true,
    status: "rascunho",
  },
  {
    id: "encontro",
    label: "Ele demonstrou interesse em um encontro.",
    title: "Ele demonstrou interesse em um encontro",
    hint: "Chamou para sair, tomar um café ou se ver.",
    reading: [
      "Um convite é uma abertura. Ainda não é uma decisão sobre a relação, e pode ter intenções diferentes das que você imagina.",
      "Você não precisa aceitar se não estiver pronta. Avaliar o convite é cuidar de você.",
    ],
    question: {
      text: "Como você se sente com o convite?",
      options: [
        { id: "quero", label: "Quero ir" },
        { id: "insegura", label: "Quero, mas estou insegura" },
        { id: "nao_quero", label: "Não quero ou não estou pronta" },
      ],
    },
    outcomes: {
      quero: {
        title: "Aceite com leveza, num lugar e horário que deixem você à vontade",
        respond: "sim",
        doNow: [
          point(
            "Combinar algo de dia, em lugar público, com hora para começar.",
            "Um ambiente neutro tira a pressão e deixa você mais segura.",
          ),
          point(
            "Ir por conta própria e avisar alguém de confiança onde você vai estar.",
            "Você continua dona da sua ida e da sua volta.",
          ),
          point(
            "Preparar antes o que você quer viver nesse encontro.",
            "Ter clareza evita transformar o encontro em DR.",
          ),
        ],
        avoid: [
          point(
            "Levar o encontro para a casa de um dos dois logo de cara.",
            "Pode misturar expectativas e deixar você numa posição menos confortável.",
          ),
          point(
            "Usar o encontro para cobrar respostas sobre o passado.",
            "Encontro leve abre portas; julgamento costuma fechá-las.",
          ),
          point(
            "Ir com a expectativa de sair com tudo resolvido.",
            "Um encontro bom pode ser só um encontro bom. O resto se constrói com o tempo, se for o caso.",
          ),
        ],
        example: {
          him: "Bora tomar um café essa semana?",
          replyId: "conv-ele-convida",
          note: "Aceita com tranquilidade e propõe um horário de dia. Ajuste o dia e o lugar ao que é seguro para você.",
        },
        next: pauseExample(),
        more: [
          diary(
            "Preparar o encontro no Diário",
            "O que eu quero viver, o assunto que não vou trazer e como vou ficar com qualquer resultado.",
          ),
          scenario(
            "encontro",
            "Cenário: quero chamar para um encontro",
            "Cuidados antes, durante e depois.",
          ),
          day(21, "Como ficar bem com qualquer resultado do encontro."),
        ],
        related: ["reen-confirmar", "reen-preparar", "reen-depois"],
      },
      insegura: {
        title: "Antes de responder, entenda a sua insegurança",
        respond: "sim",
        doNow: [
          point(
            "Escrever no Diário o que você espera e o que você teme desse encontro.",
            "Colocar a insegurança no papel ajuda a ver se é nervosismo ou um sinal de que ainda não é a hora.",
          ),
          point(
            "Se decidir ir, escolher um formato curto: um café de dia.",
            "Um encontro curto e público pesa menos e é mais fácil de encerrar.",
          ),
          point(
            "Responder em algumas horas, sem pressa.",
            "Você não precisa decidir na hora em que o convite chega.",
          ),
        ],
        avoid: [
          point(
            "Aceitar no impulso para não perder a chance.",
            "Decisão tomada com medo de perder costuma vir com ansiedade demais.",
          ),
          point(
            'Pedir garantias a ele antes ("mas é para voltar?").',
            "Ele também pode não saber. Pressionar por uma definição costuma afastar.",
          ),
        ],
        example: {
          him: "Bora tomar um café essa semana?",
          replyId: "conv-ele-convida",
          note: "Se decidir ir, uma resposta simples basta. Proponha o formato em que você se sente segura.",
        },
        next: diary(
          "Preparar no Diário antes de responder",
          "O que eu espero, o que eu temo e o que me deixaria tranquila nesse encontro.",
        ),
        more: [
          pauseExample(),
          day(19, "Como avaliar se o convite combina com o seu momento."),
          central("reencontro", "Central: Reencontro", "Como se preparar."),
        ],
        related: ["reen-preparar"],
      },
      nao_quero: {
        title: "Recusar com gentileza também é uma resposta",
        respond: "sim",
        doNow: [
          point(
            "Agradecer o convite e dizer que agora não é um bom momento.",
            "Clareza com gentileza evita mal-entendido e não fecha portas à força.",
          ),
          point("Não precisar justificar em detalhes.", "Você tem o direito de não estar pronta."),
        ],
        avoid: [
          point(
            "Aceitar por culpa ou por medo de perder a chance.",
            "Encontro sem vontade costuma ser tenso e deixa arrependimento.",
          ),
          point(
            "Recusar para testar se ele insiste.",
            "Teste de interesse costuma ser lido como desinteresse de verdade.",
          ),
        ],
        example: {
          him: "Bora tomar um café essa semana?",
          replyId: "saudade-sem-pressa",
          note: "Agradece a abertura sem marcar nada agora. Se não quiser deixar porta aberta, diga só que agora não é um bom momento.",
        },
        next: pauseExample(),
        more: [
          diary(
            "Registrar no Diário o que você decidiu",
            "Ajuda a sustentar a sua escolha sem culpa.",
          ),
        ],
        related: ["conv-recusa"],
      },
    },
    category: "convites",
    heWrote: true,
    status: "rascunho",
  },
  {
    id: "visualizou",
    label: "Ele visualizou e não respondeu.",
    title: "Ele visualizou e não respondeu",
    hint: "Leu a sua mensagem e não respondeu.",
    reading: [
      "Visualizar e não responder pode ser falta de tempo, de vontade, de saber o que dizer, ou uma escolha de distância. Não dá para saber qual, e tentar adivinhar costuma aumentar a ansiedade.",
      "O silêncio, por enquanto, já é uma resposta sobre o momento dele. Não é uma sentença sobre você.",
    ],
    question: {
      text: "Como você está agora?",
      options: [
        { id: "impulso", label: "Com muita vontade de mandar outra mensagem" },
        { id: "calma", label: "Chateada, mas sem urgência" },
      ],
    },
    outcomes: {
      impulso: {
        title: "Não envie outra. Cuide da vontade antes",
        respond: "nao",
        doNow: [
          point(
            "Escrever na Pausa o que você queria mandar, sem enviar.",
            "Tirar o impulso do peito e pôr no papel diminui a urgência.",
          ),
          point(
            "Respirar fundo por alguns minutos: inspire em 4 tempos, segure 4, solte em 6.",
            "Soltar o ar devagar ajuda o corpo a sair do modo alarme.",
          ),
          point(
            "Tirar o celular de perto por uma hora e fazer algo com as mãos.",
            "Distância física do celular reduz a checagem compulsiva.",
          ),
        ],
        avoid: [
          point(
            'Mandar "?" ou "vi que você visualizou".',
            "Cobrar a resposta costuma afastar e tira o equilíbrio da conversa.",
          ),
          point(
            "Checar se ele está on-line ou mexer nas redes dele.",
            "Cada checagem reacende a ansiedade sem trazer resposta.",
          ),
          point(
            "Pedir para alguém perguntar por você.",
            "Usar terceiros expõe você e passa por cima do silêncio dele.",
          ),
        ],
        next: pause(
          "Escrever na Pausa, só para mim",
          "A Pausa guarda o rascunho por 24 horas. Amanhã você relê com calma.",
        ),
        more: [
          day(5, "Um plano para as horas em que a vontade aperta."),
          day(12, "O que fazer com a espera depois de uma mensagem."),
          diary("Registrar no Diário que segurei o impulso", "Cada impulso que você segura conta."),
        ],
        related: ["semresp-nao-enviar", "evit-cobranca", "evit-terceiros"],
      },
      calma: {
        title: "Deixe o silêncio ser silêncio e volte para você",
        respond: "nao",
        doNow: [
          point(
            "Não mandar outra mensagem.",
            "Uma mensagem sem resposta já disse o que precisava dizer por agora.",
          ),
          point(
            "Seguir o seu dia do plano.",
            "Voltar à rotina mostra a você mesma que a sua vida não depende da resposta.",
          ),
          point(
            "Anotar no Diário o que você sentiu.",
            "Nomear a frustração ajuda a ela passar mais rápido.",
          ),
        ],
        avoid: [
          point(
            "Reler a conversa procurando o erro.",
            "Revisar a mensagem mil vezes alimenta a culpa e não muda o silêncio.",
          ),
          point(
            "Interpretar o silêncio como resposta definitiva.",
            "Também não dá para saber isso. Melhor não decidir nada sobre ele hoje.",
          ),
        ],
        next: diary(
          "Registrar no Diário e seguir o dia",
          "Hoje o próximo passo é seu: cuidar de você, não esperar a resposta.",
        ),
        more: [
          day(13, "Como observar sem tirar conclusões do silêncio."),
          central(
            "sem_resposta",
            "Central: Quando ele não responde",
            "Reflexões para esse momento.",
          ),
        ],
        related: ["semresp-nao-enviar", "evit-cobranca"],
      },
    },
    category: "sem_resposta",
    heWrote: false,
    status: "rascunho",
  },
  {
    id: "parar",
    label: "Ele pediu para eu parar.",
    title: "Ele pediu para você parar",
    hint: "Pediu para não mandar mais mensagens ou para dar distância.",
    reading: [
      "Um pedido para parar é uma resposta clara, e vale a partir de agora. Não há o que interpretar nem o que contornar.",
      "Respeitar esse limite não é desistir de você. É a única forma de manter a sua dignidade e a dele.",
    ],
    outcomes: {
      padrao: {
        title: "Respeite o limite e pare as mensagens",
        respond: "nao",
        reading: [
          "Se havia uma pergunta prática pendente (filhos, contas, objetos), trate só do necessário, de forma objetiva, e pelo canal que ele aceitar.",
        ],
        doNow: [
          point(
            "Parar de enviar mensagens a partir de agora.",
            "Continuar depois de um pedido de distância desrespeita a vontade dele e expõe você.",
          ),
          {
            ...point(
              "Registrar esse limite no seu diagnóstico.",
              "Assim o app inteiro, Central e Pausa incluídas, para de sugerir mensagens.",
            ),
            registers: true,
          },
          point(
            "Escrever no Diário o que você queria dizer.",
            "O que você sente continua importante. Só não vai para ele.",
          ),
        ],
        avoid: [
          point(
            "Mandar mais uma para explicar, se despedir ou pedir desculpas.",
            "Mesmo com boa intenção, é uma mensagem depois de um pedido para parar.",
          ),
          point(
            "Falar com ele por amigos, familiares ou outros perfis.",
            "Contornar o limite por outros caminhos continua sendo desrespeitá-lo.",
          ),
          point(
            "Aparecer onde ele está.",
            "Presença sem convite depois de um pedido de distância pode assustar e ter consequências.",
          ),
        ],
        alerts: [
          {
            tone: "stop",
            title: "Aqui, a resposta é respeitar",
            text: "O app não sugere nenhuma mensagem depois de um pedido para parar.",
          },
        ],
        limit: "pediu_sem_contato",
        next: {
          target: "register_limit",
          label: "Registrar o pedido dele no meu diagnóstico",
          text: "O app inteiro passa a respeitar esse limite.",
        },
        more: [
          diary("Escrever no Diário o que eu queria dizer", "Tirar do peito, sem enviar."),
          day(3, "Como sustentar a distância sem se abandonar."),
          scenario(
            "bloqueou",
            "Cenário: um limite que pede respeito",
            "O que fazer quando ele coloca um limite.",
          ),
        ],
        related: ["semresp-carta", "evit-terceiros"],
      },
    },
    category: "sem_resposta",
    heWrote: true,
    status: "rascunho",
  },
  {
    id: "outra_pessoa",
    label: "Ele mencionou outra pessoa.",
    title: "Ele mencionou outra pessoa",
    hint: "Falou de alguém com quem está saindo ou se envolvendo.",
    reading: [
      "Mencionar outra pessoa pode ser só contar da vida, ser honesto com você, ou deixar claro que ele seguiu em frente. Não dá para saber a intenção pela mensagem.",
      "Seja qual for o motivo, a sua dignidade não entra em disputa com ninguém.",
    ],
    question: {
      text: "Ele disse que está num relacionamento com essa pessoa?",
      options: [
        { id: "sim", label: "Sim, está com alguém" },
        { id: "nao_sei", label: "Não sei, só mencionou" },
      ],
    },
    outcomes: {
      sim: {
        title: "Sem disputa e sem comparação: o limite agora é a relação dele",
        respond: "opcional",
        reading: [
          "Se ele está com outra pessoa, o app não sugere mensagens para reaproximar. Isso respeita ele, a outra pessoa e principalmente você.",
        ],
        doNow: [
          point(
            "Se for responder, uma frase curta e educada, e parar.",
            "Você não precisa reagir à notícia, nem mostrar que está bem ou mal.",
          ),
          point(
            "Registrar no diagnóstico que ele está em outra relação.",
            "Assim o app deixa de sugerir mensagens e passa a focar em você.",
          ),
          point(
            "Cuidar do que essa notícia mexeu em você, hoje.",
            "É normal doer. Esse cuidado é o passo mais importante agora.",
          ),
        ],
        avoid: [
          point(
            "Perguntar detalhes sobre a outra pessoa.",
            "Detalhes alimentam comparação e prolongam a dor.",
          ),
          point(
            "Falar mal dela ou investigar as redes dela.",
            "Disputa e investigação tiram você do seu centro e não mudam a escolha dele.",
          ),
          point(
            "Provocar ciúme ou tentar mostrar que você é a melhor opção.",
            "Competir coloca você numa posição que machuca.",
          ),
        ],
        limit: "outra_relacao",
        next: {
          target: "register_limit",
          label: "Registrar no meu diagnóstico que ele está com alguém",
          text: "O app inteiro passa a respeitar esse limite e foca em você.",
        },
        more: [
          scenario("outra", "Cenário: ele está com outra pessoa", "Sem disputa, sem comparação."),
          diary(
            "Escrever no Diário o que você sentiu",
            "Para a notícia não virar mensagem por impulso.",
          ),
        ],
        related: ["evit-ciume", "semresp-nao-enviar"],
      },
      nao_sei: {
        title: "Não investigue: responda ao que ele disse",
        respond: "opcional",
        reading: [
          "Uma menção não diz, sozinha, que ele está num relacionamento. Também não é, necessariamente, uma provocação.",
        ],
        doNow: [
          point(
            "Responder só ao assunto da mensagem, se houver um.",
            "Você não precisa reagir à menção.",
          ),
          point(
            "Se a dúvida apertar, escrever no Diário em vez de perguntar.",
            "Perguntar por ansiedade costuma soar como cobrança.",
          ),
          point(
            "Se depois souber que ele está com alguém, atualizar o diagnóstico.",
            "Aí o cuidado muda, e o app passa a respeitar esse limite.",
          ),
        ],
        avoid: [
          point(
            'Perguntar "quem é ela?".',
            "Investigar a vida dele desloca a conversa para disputa.",
          ),
          point(
            "Responder citando outra pessoa para provocar ciúme.",
            "Ciúme provocado é manipulação e costuma afastar.",
          ),
        ],
        next: diary(
          "Registrar no Diário o que a menção mexeu em você",
          "Escrever ajuda a não transformar a dúvida em pergunta.",
        ),
        more: [
          pause("Escrever a resposta na Pausa", "Se for responder, confira antes de enviar."),
          signals,
          scenario("outra", "Cenário: ele está com outra pessoa", "Se a dúvida se confirmar."),
        ],
        related: ["evit-ciume", "perg-alguem"],
      },
    },
    category: "evitar",
    heWrote: true,
    status: "rascunho",
  },
];

export const replySituationById = (id: ReplySituationId) =>
  replySituations.find((item) => item.id === id)!;

/** Visível para a cliente: nunca conteúdo aguardando material. */
export const visibleReplySituations = () =>
  replySituations.filter((item) => item.status !== "aguardando_material");

/** Chave do resultado: a opção escolhida, ou "padrao" quando não há pergunta. */
export const outcomeKey = (situation: ReplySituation, option: string | null) =>
  situation.question ? option : "padrao";

export const outcomeOf = (situation: ReplySituation, option: string | null) => {
  const key = outcomeKey(situation, option);
  return key ? situation.outcomes[key] : undefined;
};

// ---------- Momento dela ----------

/** Respostas que respeitam o limite: o que fazer quando há limite e ele escreveu mesmo assim. */
const LIMIT_DO: ReplyPoint[] = [
  point(
    "Não responder por impulso.",
    "Com um limite registrado, o app não sugere respostas. Isso protege você de reabrir algo que ainda dói.",
  ),
  point(
    "Escrever no Diário o que você sentiu e o que gostaria de responder.",
    "O que você sente continua importante, mesmo sem ir para ele.",
  ),
  point(
    "Se foi ele quem procurou você e a situação mudou, atualizar o diagnóstico antes.",
    "As orientações passam a valer para o momento de agora, e não para o anterior.",
  ),
];

const STANCE_NOTE: Partial<Record<CommContext["stance"], ReplyAlert>> = {
  pausa: {
    tone: "care",
    title: "Ele tinha pedido um tempo",
    text: "Se ele mesmo escreveu, responder com leveza é respeitoso. Responda ao que ele trouxe, sem usar a resposta para reabrir o assunto da relação.",
  },
  espaco: {
    tone: "care",
    title: "Vocês estavam sem reciprocidade",
    text: "Responda ao que ele trouxe, no tamanho dele, sem cobrar o silêncio. A iniciativa das próximas conversas continua não sendo sua.",
  },
  sem_diagnostico: {
    tone: "care",
    title: "Sem diagnóstico, as orientações são gerais",
    text: "Se existir um limite (bloqueio, pedido de não contato, outra relação), faça o diagnóstico antes de responder: o app passa a respeitá-lo.",
  },
};

const DIAGNOSIS: ReplyAction = {
  target: "diagnosis",
  label: "Fazer meu diagnóstico",
  text: "Para as orientações levarem em conta o seu momento.",
};

const UPDATE_DIAGNOSIS: ReplyAction = {
  target: "diagnosis",
  label: "Atualizar meu diagnóstico",
  text: "Se a situação mudou, as orientações passam a valer para agora.",
};

const sameAction = (a: ReplyAction, b: ReplyAction) =>
  a.target === b.target &&
  a.day === b.day &&
  a.scenario === b.scenario &&
  a.category === b.category;

const uniqueActions = (items: ReplyAction[]) =>
  items.filter((item, index) => items.findIndex((other) => sameAction(item, other)) === index);

/**
 * O resultado ajustado ao momento dela. Devolve null se a opção não existe para a situação.
 * A disponibilidade do exemplo é exatamente a da Central (availabilityOf), para as duas telas
 * nunca se contradizerem.
 */
export function resolveReply(
  situation: ReplySituation,
  option: string | null,
  ctx: CommContext,
): ResolvedReply | null {
  const outcome: ReplyOutcome | undefined = outcomeOf(situation, option);
  if (!outcome) return null;
  const limited = ctx.stance === "limite";

  const message = outcome.example ? messageById(outcome.example.replyId) : undefined;
  const availability = message ? availabilityOf(message, ctx) : null;
  const sendable =
    !limited && outcome.respond !== "nao" && availability !== null && canSend(availability);
  const example =
    message && outcome.example && !limited
      ? {
          him: outcome.example.him,
          message,
          note: outcome.example.note,
          sendable,
          caution: sendable ? null : availabilityNote(message, ctx),
        }
      : null;

  // Sem exemplo que possa ir para a Pausa, o passo vira a Pausa em branco (escrever sem enviar).
  const fixPause = (action: ReplyAction): ReplyAction =>
    action.target === "pause_example" && !sendable
      ? pause(
          "Escrever na Pausa antes de decidir",
          "Escrever ajuda a decidir, e nada é enviado sem você conferir.",
        )
      : action;

  let next = fixPause(outcome.next);
  let more = outcome.more.map(fixPause);
  const alerts: ReplyAlert[] = [];

  if (limited) {
    alerts.push(LIMIT_NOTICE);
    // O limite já está registrado: registrar de novo não faz sentido.
    const keep = (action: ReplyAction) =>
      action.target !== "register_limit" && action.target !== "pause_example";
    next =
      outcome.respond === "nao" && keep(outcome.next)
        ? outcome.next
        : diary(
            "Escrever no Diário, só para mim",
            "Com um limite registrado, o próximo passo é cuidar de você, não responder.",
          );
    more = [...more.filter(keep), UPDATE_DIAGNOSIS];
  } else if (situation.heWrote && STANCE_NOTE[ctx.stance]) {
    alerts.push(STANCE_NOTE[ctx.stance]!);
  }
  if (!limited && ctx.stance === "sem_diagnostico") more = [...more, DIAGNOSIS];
  alerts.push(...(outcome.alerts ?? []));

  const related = outcome.related
    .map((id) => messageById(id))
    .filter((item): item is CommMessage => Boolean(item))
    // Com limite, só leituras (reflexões e exemplos do que evitar), como nos destaques da Central.
    .filter((item) => !limited || item.kind !== "modelo");

  return {
    situation,
    option: outcomeKey(situation, option)!,
    // Com limite, o título do caminho (que pode falar em responder) dá lugar ao do limite.
    title:
      limited && outcome.respond !== "nao"
        ? "Com um limite registrado, cuide de você antes de qualquer resposta"
        : outcome.title,
    respond: limited ? "nao" : outcome.respond,
    reading: [...situation.reading, ...(outcome.reading ?? [])],
    // Com limite: caminhos que já não pedem mensagem ficam como estão (sem o passo de registrar,
    // que já foi feito); os outros trocam o "o que fazer" pelo cuidado com o limite.
    doNow: !limited
      ? outcome.doNow
      : outcome.respond === "nao"
        ? outcome.doNow.filter((item) => !item.registers)
        : LIMIT_DO,
    avoid: outcome.avoid,
    example,
    alerts,
    care: Boolean(outcome.care),
    limit: limited ? null : (outcome.limit ?? null),
    next,
    more: uniqueActions(more.filter((item) => !sameAction(item, next))),
    related,
  };
}

export const respondLabel: Record<ResolvedReply["respond"], string> = {
  sim: "Responder pode fazer sentido",
  opcional: "Responder é opcional",
  nao: "Hoje, nenhuma mensagem",
};

/**
 * Respostas do diagnóstico com o limite que ela registrou no assistente. Muda só a resposta
 * ligada ao limite; o resto do diagnóstico fica como estava. Grava um novo registro (o histórico
 * continua), e com ele a Central, a Pausa, o Mapa e as 48 horas passam a respeitar o limite.
 */
export function answersWithLimit(answers: DiagnosisAnswers, limit: ReplyLimit): DiagnosisAnswers {
  return limit === "pediu_sem_contato"
    ? { ...answers, contact: "pediu_sem_contato" }
    : { ...answers, otherPerson: "sim" };
}
