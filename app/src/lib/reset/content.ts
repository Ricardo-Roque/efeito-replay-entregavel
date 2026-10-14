// Conteúdo do Reset Emocional do Ex (upsell #01). Dado, não HTML, como o resto do app.
// RASCUNHO: revisar antes de vender. Nenhum texto promete que ele vai voltar nem atribui
// diagnóstico ou pensamento a ele; tudo fala do que ela pode fazer.

import type { ModuleId } from "@/lib/reset/diagnosis";

export interface ModuleInfo {
  id: ModuleId;
  number: string;
  title: string;
  subtitle: string;
}

export const modules: ModuleInfo[] = [
  {
    id: "perdao",
    number: "01",
    title: "Consciência do Perdão",
    subtitle: "Entender a mágoa, assumir sua parte e preparar um pedido de desculpas sincero.",
  },
  {
    id: "audios",
    number: "02",
    title: "Áudio de Reativação Emocional",
    subtitle: "Três sessões guiadas sobre ritmo, defensividade e coerência ao se comunicar.",
  },
  {
    id: "dizer",
    number: "03",
    title: "Guia de Reconexão Subconsciente",
    subtitle: "Na prática: o que dizer e o que evitar em seis situações difíceis.",
  },
  {
    id: "noturno",
    number: "04",
    title: "Técnica de Reversão Noturna",
    subtitle: "Um ritual de cerca de 10 minutos para acalmar a mente antes de dormir.",
  },
  {
    id: "bonus",
    number: "05",
    title: "Mapa de Reconstrução da Confiança",
    subtitle: "Bônus secreto: barreiras, sinais e próximo passo a partir do seu diagnóstico.",
  },
];

// ---------- Módulo 01: Consciência do Perdão ----------

export const forgivenessLessons: {
  id: string;
  title: string;
  text: string[];
  reflection: string;
}[] = [
  {
    id: "ressentimento",
    title: "O que o ressentimento faz",
    text: [
      "Ressentimento é a mágoa que continua ativa. A palavra diz muito: é sentir de novo. A pessoa revive o que aconteceu e, para não sentir aquilo outra vez, se protege.",
      "Essa proteção costuma aparecer como frieza, ironia, silêncio ou desconfiança de gestos bonitos. Não é necessariamente falta de sentimento: muitas vezes é o jeito de não se expor de novo. Por isso, tentativas rápidas de consertar costumam ser recebidas com distância, e insistir tende a reforçar a defesa.",
      "Ressentimento também mora em você. A sua mágoa, a vergonha e a culpa pelo que aconteceu pesam nas suas reações. Quem age a partir do próprio ressentimento cobra, se explica demais ou ataca sem perceber.",
      'Entender isso muda a pergunta. Em vez de "como faço ele esquecer?", a pergunta passa a ser "o que eu posso fazer para não reabrir a ferida, nem a dele nem a minha?". Essa é uma pergunta que depende de você.',
    ],
    reflection:
      "Quando você pensa no que aconteceu, qual momento dói mais para você? E o que você imagina que doeu mais nele?",
  },
  {
    id: "confianca",
    title: "Como a confiança se quebra e se reconstrói",
    text: [
      "Confiança é a sensação de que o outro é previsível: que o que ele diz combina com o que ele faz. Ela se quebra quando um fato mostra que não era bem assim. Depois disso, a dúvida costuma se espalhar para outras lembranças.",
      "Por isso, uma conversa não basta para reconstruí-la, por mais sincera que seja. Palavras pedem que o outro acredite de novo. Atitudes repetidas mostram, sem pedir nada.",
      "O que reconstrói confiança é coerência ao longo do tempo: fazer o que diz, não repetir o que feriu, respeitar limites e aceitar que o outro precise de provas por um tempo. Isso vale mesmo que vocês não estejam se falando: você está se tornando alguém em quem é possível confiar.",
      "E existe um limite honesto: a confiança dele não depende só de você. Você pode ser coerente e, mesmo assim, ele decidir não voltar a confiar. O seu trabalho continua valendo, porque muda a forma como você se relaciona daqui em diante.",
    ],
    reflection:
      "Que atitude sua, repetida com constância por algumas semanas, mostraria que algo mudou?",
  },
  {
    id: "responsabilidade",
    title: "Responsabilidade não é culpa",
    text: [
      "Culpa é um peso que paralisa. Ela faz você querer ser perdoada logo, para parar de sofrer, e isso transforma o pedido de desculpas em uma cobrança por alívio.",
      "Responsabilidade é outra coisa: reconhecer o que você fez, entender o impacto que isso teve e mudar o que estiver ao seu alcance. Ela olha para frente. Não exige que você se castigue.",
      "Assumir a sua parte não significa assumir a parte dele, nem aceitar desrespeito. Se houve agressão, humilhação ou violência dele, isso não é responsabilidade sua. Responsabilidade é olhar para o que estava nas suas mãos, sem aumentar nem diminuir.",
      'Um jeito prático de separar as duas: a culpa pergunta "o que vão pensar de mim?"; a responsabilidade pergunta "o que eu faço diferente a partir de hoje?".',
    ],
    reflection:
      "Escreva, em uma frase, qual foi a sua parte no que aconteceu. Depois, uma frase sobre o que não foi sua parte.",
  },
];

export const responsibilityPrompts = [
  "O que eu fiz (ou deixei de fazer) que contribuiu para o conflito?",
  "Qual foi o impacto disso nele, do ponto de vista dele?",
  "O que eu faria diferente hoje?",
];

/** Montador de pedido de desculpas: cada parte vira uma frase. */
export const apologyParts = [
  {
    id: "reconheco",
    label: "O que eu reconheço",
    hint: "Diga o que você fez, de forma específica e sem atenuar.",
    example: "Eu reconheço que menti sobre onde estava naquela noite.",
  },
  {
    id: "impacto",
    label: "O impacto que isso teve",
    hint: "Mostre que entende como ele pode ter se sentido, sem dizer o que ele sente.",
    example: "Imagino o quanto isso deve ter abalado a sua confiança em mim.",
  },
  {
    id: "mudanca",
    label: "O que mudou em mim",
    hint: "Uma mudança concreta, não uma promessa.",
    example: "Tenho trabalhado para ser transparente, mesmo nas pequenas coisas.",
  },
  {
    id: "liberdade",
    label: "A liberdade dele",
    hint: "Deixe claro que ele não precisa responder nem perdoar.",
    example: "Não espero uma resposta. Só queria que você soubesse.",
  },
];

export const apologyAvoid = [
  'Começar com "me desculpa, mas..."',
  "Explicar seus motivos antes de reconhecer o erro",
  "Lembrar o que ele também fez",
  'Pedir para ele "esquecer" ou "superar"',
  "Mandar mais de uma mensagem seguida",
  "Cobrar uma resposta ou um perdão",
  "Mandar de madrugada ou depois de beber",
];

// ---------- Módulo 02: áudios ----------

export interface AudioSession {
  id: string;
  title: string;
  description: string;
  /** Duração do roteiro gravado (estimada). */
  minutes: number;
  transcript: string[];
  exercise: string;
}

export const audioSessions: AudioSession[] = [
  {
    id: "seguranca",
    title: "A voz que transmite segurança",
    description: "Como o ritmo, o tom e o tamanho das frases mudam a forma como você é ouvida.",
    minutes: 7,
    transcript: [
      "Olá. Antes de começar, encontre uma posição confortável e respire fundo uma vez. Esta sessão não é sobre o que dizer para ele. É sobre como você soa quando está em paz.",
      "Pense na última vez que alguém falou com você com calma, mesmo numa situação tensa. Talvez um médico, uma amiga, alguém da família. O que fez você se sentir segura não foram só as palavras. Foi o ritmo. A pessoa não tinha pressa.",
      "Pressa comunica medo. Quando escrevemos dez mensagens seguidas, ou falamos rápido, o outro sente a nossa ansiedade antes de entender o conteúdo. E ansiedade costuma gerar defesa.",
      "Segurança tem três marcas. A primeira: frases curtas. Uma ideia por vez. A segunda: pausas. Você não precisa preencher cada silêncio. A terceira: firmeza gentil. Você pode dizer o que sente sem pedir desculpas por existir.",
      'Experimente agora, em voz baixa: "Eu estou bem. Estou cuidando de mim." Diga devagar. Perceba a diferença entre dizer isso para se convencer e dizer isso porque é verdade, mesmo que só um pouco.',
      "Quando a voz vem de um lugar calmo, ela convida o outro a baixar a guarda. Não porque você controla o que ele sente, mas porque você deixa de ser uma ameaça para a paz dele.",
      "Até a próxima sessão, observe como você fala com as pessoas no dia a dia. Onde você acelera? Onde você se explica demais? Só observe.",
    ],
    exercise:
      "Grave um áudio de 20 segundos para você mesma, dizendo como foi o seu dia, devagar e com pausas. Ouça e anote o que mudou no seu tom.",
  },
  {
    id: "defensividade",
    title: "Como conversar sem despertar defensividade",
    description: "As frases que fecham a conversa e as que mantêm a porta aberta.",
    minutes: 8,
    transcript: [
      "Nesta sessão vamos falar de defensividade: aquela reação automática de se proteger quando alguém nos critica, cobra ou acusa.",
      'Repare em três tipos de frase que quase sempre despertam defesa. Generalizações, como "você sempre" e "você nunca". Perguntas que são acusações, como "por que você fez isso comigo?". E interpretações, como "você não liga para mim".',
      "Todas elas colocam o outro no banco dos réus. E quem está no banco dos réus não escuta: prepara a defesa.",
      'A alternativa é falar da sua experiência, não do comportamento dele. Em vez de "você me ignorou", algo como "eu me senti sozinha naquele dia". Em vez de cobrar, descrever. Em vez de acusar, contar.',
      'Outra ferramenta é a curiosidade. Quando ele disser algo duro, em vez de rebater, você pode responder: "entendo que você vê dessa forma". Isso não é concordar com tudo. É mostrar que você ouviu.',
      'E, se a conversa esquentar, a pausa é sua aliada. Dizer "acho melhor a gente continuar outra hora, com calma" vale mais do que vencer a discussão.',
      'Esta semana, quando perceber que vai começar uma frase com "você", pare e tente começar com "eu".',
    ],
    exercise:
      'Escreva três frases que você costumava dizer em brigas e reescreva cada uma começando com "eu senti" ou "eu percebi".',
  },
  {
    id: "confianca",
    title: "Construindo uma comunicação de confiança",
    description: "Coerência, previsibilidade e respeito ao tempo do outro.",
    minutes: 8,
    transcript: [
      "Confiança, na comunicação, tem a ver com previsibilidade. A pessoa confia quando sabe o que esperar de você.",
      "Por isso, mudanças bruscas atrapalham. Mandar muitas mensagens num dia e sumir no outro. Ser muito carinhosa e, em seguida, cobrar. Isso confunde, e confusão gera distância.",
      "Comunicação de confiança é consistente. Mensagens curtas, num tom parecido, sem altos e baixos. Você não precisa provar nada a cada conversa.",
      "Também é respeitosa com o tempo do outro. Se ele demora a responder, isso não é um sinal para insistir. É um ritmo diferente do seu, e você pode respeitá-lo.",
      "E é honesta. Se você não está pronta para falar sobre algo, pode dizer isso. Se errou, pode reconhecer. Honestidade simples, sem drama, é o que constrói segurança ao longo do tempo.",
      "Termine esta sessão pensando em uma palavra que você quer que defina a forma como você se comunica a partir de hoje. Calma, clara, leve. Escolha a sua.",
    ],
    exercise:
      "Escolha a palavra que vai definir a sua comunicação e escreva três atitudes práticas que representam essa palavra.",
  },
];

/** Roteiro do áudio noturno (Técnica de Reversão Noturna). */
export const nightScript: string[] = [
  "Boa noite. Este é o seu momento. Deite-se ou sente-se de forma confortável, e, se puder, deixe o celular longe das mãos depois de iniciar.",
  "Comece percebendo o seu corpo. Os ombros, a mandíbula, as mãos. Onde há tensão, apenas perceba, sem tentar mudar ainda.",
  "Agora vamos respirar juntas. Inspire contando até quatro. Segure o ar por quatro. Solte devagar, contando até seis. Mais uma vez. Inspire, segure, solte.",
  "Traga à mente um momento do relacionamento que ainda volta com frequência. Não precisa ser o pior. Apenas um que aparece quando você tenta dormir.",
  "Observe essa lembrança como se fosse uma cena num filme. Você está na plateia, não no palco. O que você sentia naquele momento? E o que você sente agora, olhando de longe?",
  'Pensamentos repetitivos querem resolver algo que não pode ser resolvido esta noite. Diga para você mesma: "Eu vi esse pensamento. Ele pode esperar até amanhã."',
  "Imagine que você coloca esse pensamento numa caixa e fecha a tampa. Ele não sumiu. Só não precisa ficar com você agora.",
  "Pense no dia de amanhã. Uma coisa simples que você vai fazer por você. Um café com calma, uma caminhada, uma conversa com uma amiga.",
  'Repita, devagar: "Eu fiz o que estava ao meu alcance hoje. Amanhã eu continuo."',
  "Respire mais uma vez, profundamente. E, quando estiver pronta, deixe o sono chegar no tempo dele.",
];

// ---------- Módulo 03: O Que Dizer e O Que Evitar ----------

export interface SayAvoidCard {
  situation: string;
  avoid: string;
  instead: string;
  why: string;
}

export const sayAvoidCategories: { id: string; title: string; cards: SayAvoidCard[] }[] = [
  {
    id: "raiva",
    title: "Quando ele demonstra raiva",
    cards: [
      {
        situation: "Ele manda uma mensagem dura, falando do que você fez.",
        avoid: "Mas você também errou! Não fui só eu.",
        instead: "Você tem razão de estar com raiva. Eu entendo.",
        why: "Rebater coloca os dois em disputa. Acolher a raiva não é concordar com tudo: é baixar a temperatura.",
      },
      {
        situation: "Ele diz que não quer mais falar sobre isso.",
        avoid: "A gente precisa conversar, você não pode fugir para sempre.",
        instead: "Tudo bem. Respeito o seu tempo.",
        why: "Insistir confirma que você não respeita o limite dele. Aceitar mostra o contrário.",
      },
      {
        situation: "Ele faz uma acusação que você acha injusta.",
        avoid: "Isso é mentira, você está distorcendo tudo!",
        instead: "Eu vejo de outro jeito, mas entendo que para você foi assim.",
        why: "Discutir a versão dos fatos no meio da raiva vira disputa. Reconhecer a experiência dele não é confessar o que você não fez, e a conversa sobre os fatos pode esperar um momento calmo.",
      },
    ],
  },
  {
    id: "distante",
    title: "Quando ele está distante",
    cards: [
      {
        situation: "Ele responde com frieza.",
        avoid: "Você nunca vai me perdoar? Já não aguento mais isso.",
        instead: "Entendo que talvez você ainda precise de espaço. Não quero pressionar você.",
        why: "Cobrar calor aumenta a defesa. Respeitar o espaço tira o peso da conversa.",
      },
      {
        situation: "Ele demora dias para responder.",
        avoid: "Pelo visto eu não sou mais prioridade, né?",
        instead: "(Não mandar outra mensagem. Esperar.)",
        why: "Uma mensagem sem resposta não pede outra. O silêncio dele também é uma informação.",
      },
      {
        situation: "Ele diz que precisa de um tempo para pensar.",
        avoid: "Quanto tempo? Eu preciso saber até quando.",
        instead: "Tudo bem. Respeito o seu tempo.",
        why: "Pedir prazo transforma o pedido dele em negociação. Aceitar sem condições é o que mostra que o pedido foi ouvido. Durante esse tempo, a iniciativa de escrever não é sua.",
      },
    ],
  },
  {
    id: "confianca",
    title: "Quando existe uma quebra de confiança",
    cards: [
      {
        situation: "Ele diz que não consegue mais confiar em você.",
        avoid: "Eu já pedi desculpas, o que mais você quer?",
        instead:
          "Faz sentido você se sentir assim. Confiança se reconstrói com o tempo, e eu entendo.",
        why: "Exigir que a confiança volte rápido é mais uma pressão. Reconhecer o tempo dele mostra maturidade.",
      },
      {
        situation: "Ele pergunta de novo sobre o que aconteceu.",
        avoid: "De novo esse assunto? Já te expliquei mil vezes.",
        instead: "Posso responder o que você precisar saber, com calma.",
        why: "Perguntas repetidas costumam ser uma tentativa de voltar a se sentir seguro. Irritar-se reabre a ferida.",
      },
    ],
  },
  {
    id: "evita",
    title: "Quando ele evita conversar",
    cards: [
      {
        situation: "A conversa está leve, mas ele muda de assunto quando o tema fica sério.",
        avoid: "Por que você sempre foge quando eu quero falar de nós?",
        instead: "Que bom conversar com você assim, de forma leve.",
        why: "Valorizar o que existe agora mantém a porta aberta. Forçar o assunto pode fechá-la.",
      },
      {
        situation: 'Ele responde só com "ok" ou com um emoji.',
        avoid: "Só isso? Você não tem nada para me dizer?",
        instead:
          "(Deixar a conversa terminar ali, leve. Não mandar outra mensagem para tirar mais dele.)",
        why: "Resposta curta não é convite para cobrar mais. Terminar bem uma conversa curta vale mais do que esticar uma conversa que ele não quer agora.",
      },
    ],
  },
  {
    id: "insistir",
    title: "Quando você sente vontade de insistir",
    cards: [
      {
        situation: "Ele não respondeu e você quer mandar outra mensagem.",
        avoid: "Oi?? Você viu minha mensagem?",
        instead: "(Escrever na Pausa antes de enviar e guardar por 24 horas.)",
        why: "A vontade de insistir é sobre a sua ansiedade, não sobre ele. Esperar protege os dois.",
      },
      {
        situation: "É madrugada e a saudade apertou.",
        avoid: "Sinto sua falta, não consigo dormir pensando em você.",
        instead: "(Fazer o ritual da Técnica de Reversão Noturna.)",
        why: "Mensagens de madrugada costumam ser lidas como impulso. De manhã, a decisão é outra.",
      },
    ],
  },
  {
    id: "desculpas",
    title: "Quando surge a oportunidade de pedir desculpas",
    cards: [
      {
        situation: "Ele abriu espaço para falar do que aconteceu.",
        avoid: "Me desculpa, mas você tem que entender que eu estava passando por muita coisa.",
        instead: "Eu errei, e entendo o quanto isso te machucou. Sinto muito.",
        why: 'O "mas" apaga o pedido de desculpas. Reconhecer sem justificar é o que soa sincero.',
      },
      {
        situation: "Você pediu desculpas e ele não disse nada.",
        avoid: "E aí, você me perdoa?",
        instead: "(Não cobrar. O pedido foi feito; a resposta é dele.)",
        why: "Perdão cobrado vira obrigação. Dar espaço é parte do pedido.",
      },
    ],
  },
];

// ---------- Módulo 04: Técnica de Reversão Noturna ----------

export interface RitualStep {
  id: string;
  title: string;
  minutes: number;
  text: string;
  kind: "respiracao" | "reflexao" | "texto" | "registro";
}

export const nightRitual: RitualStep[] = [
  {
    id: "chegada",
    title: "Chegada",
    minutes: 1,
    kind: "texto",
    text: "Apague as luzes mais fortes, deixe o celular no modo silencioso e encontre uma posição confortável. Perceba ombros, mandíbula e mãos, e solte um pouco cada um.",
  },
  {
    id: "respiracao",
    title: "Respiração 4-4-6",
    minutes: 3,
    kind: "respiracao",
    text: "Inspire contando até 4, segure por 4 e solte devagar contando até 6. Siga o círculo.",
  },
  {
    id: "reflexao",
    title: "Reflexão de longe",
    minutes: 2,
    kind: "reflexao",
    text: "Pense num momento do relacionamento que volta à sua mente à noite. Observe como se fosse uma cena de filme: você na plateia, não no palco. O que você sente olhando de longe?",
  },
  {
    id: "caixa",
    title: "A caixa dos pensamentos",
    minutes: 2,
    kind: "texto",
    text: 'Pensamentos repetitivos tentam resolver hoje o que não se resolve hoje. Diga: "Eu vi esse pensamento. Ele pode esperar até amanhã." Imagine-o numa caixa e feche a tampa.',
  },
  {
    id: "amanha",
    title: "Preparação para amanhã",
    minutes: 1,
    kind: "texto",
    text: 'Escolha uma coisa simples que você vai fazer por você amanhã. Repita devagar: "Eu fiz o que estava ao meu alcance hoje. Amanhã eu continuo."',
  },
  {
    id: "registro",
    title: "Como você está agora",
    minutes: 1,
    kind: "registro",
    text: "Um registro rápido antes de dormir. Só você vê.",
  },
];

export const nightFeelings = ["Mais leve", "Calma", "Cansada", "Ainda ansiosa", "Triste"];

// ---------- Jornada de Reconexão (7 etapas) ----------

export interface JourneyStep {
  id: number;
  objective: string;
  content: string[];
  activity: string;
  /** Módulo que ajuda nesta etapa. */
  module?: ModuleId;
  checklist: string[];
}

// Os checklists continuam com 3 itens na mesma ordem: o progresso salvo é guardado pela posição.
export const journeySteps: JourneyStep[] = [
  {
    id: 1,
    objective: "Entender o que foi ferido, dos dois lados, antes de pensar em qualquer conversa.",
    content: [
      "Toda reaproximação começa por entender a ferida. Sem isso, as tentativas de consertar tendem a tocar no lugar errado: você pede desculpas pelo que mais pesa em você, e não necessariamente pelo que mais pesou nele.",
      "Olhe para o que aconteceu em três camadas. O fato: o que aconteceu, sem adjetivos. O impacto nele: o que aquilo pode ter tirado dele (segurança, orgulho, tranquilidade, confiança). O impacto em você: o que você sente hoje quando lembra.",
      "Não é um exercício para se culpar. É para trocar uma dor confusa por algo que você consegue nomear. O que tem nome dá para cuidar.",
    ],
    activity:
      "Registre pelo menos uma mágoa no Mapa das Mágoas, com o fato, as consequências e o que poderia reparar.",
    module: "perdao",
    checklist: [
      "Li as lições do Módulo 1",
      "Registrei uma mágoa no Mapa das Mágoas",
      "Respondi à reflexão sobre a minha parte",
    ],
  },
  {
    id: 2,
    objective: "Perceber quais situações fazem você agir no impulso ou entrar em briga.",
    content: [
      "Gatilhos são situações que disparam reações automáticas: uma mensagem visualizada sem resposta, uma foto nova, uma data, um horário do dia, uma música.",
      "Repare que o gatilho não é o problema. O problema é o que você faz nos minutos seguintes, quando a emoção ainda está no pico. É nesse intervalo que nascem as mensagens longas, as cobranças e as explicações que depois você queria não ter mandado.",
      "Quando você conhece os seus gatilhos, consegue se preparar antes deles. Para cada um, defina uma ação pequena e concreta: abrir a Pausa, escrever no Diário, ligar para uma amiga, sair do aplicativo por dez minutos.",
    ],
    activity:
      "Liste três gatilhos seus e, ao lado de cada um, o que você vai fazer quando ele aparecer.",
    module: "dizer",
    checklist: [
      "Identifiquei três gatilhos",
      'Li a categoria "Quando você sente vontade de insistir"',
      "Defini o que fazer quando cada gatilho aparecer",
    ],
  },
  {
    id: 3,
    objective: "Separar pedir desculpas de pedir uma resposta.",
    content: [
      "Um pedido de desculpas sincero tem quatro partes: o que você reconhece, o impacto que isso teve, o que mudou em você e a liberdade dele de não responder. Sem a última, o pedido vira cobrança.",
      'O que costuma estragar um pedido: o "mas", a explicação que vem antes do reconhecimento, lembrar o que ele também fez e mandar mais de uma mensagem seguida.',
      "Escrever o pedido não obriga você a enviá-lo. Em muitos casos (bloqueio, pedido de distância, outra relação), ele fica guardado. Mesmo assim, escrever organiza o que você sente e mostra o que mudou na forma como você enxerga o que aconteceu.",
    ],
    activity:
      "Monte o seu pedido de desculpas no Módulo 1, confira o checklist do que evitar e decida, com calma, se é para guardar ou para um dia enviar.",
    module: "perdao",
    checklist: [
      "Montei o meu pedido de desculpas",
      "Conferi o checklist do que evitar",
      "Decidi se é o momento de enviar ou de guardar",
    ],
  },
  {
    id: 4,
    objective: "Treinar uma comunicação que não desperta defesa.",
    content: [
      'Três hábitos mudam o clima de qualquer conversa: frases curtas, nada de generalizações ("você sempre", "você nunca") e falar da sua experiência em vez de interpretar a dele.',
      "Isso se treina como qualquer habilidade. No começo, parece artificial. Com algumas semanas, vira o seu jeito de falar, e não só com ele: com a família, no trabalho, com as amigas.",
      "As três sessões do Módulo 2 trabalham o ritmo, a defensividade e a coerência. Cada uma termina com um exercício prático, que é o que realmente fixa a mudança.",
    ],
    activity:
      "Faça as três sessões do Módulo 2 (ouvindo ou lendo o roteiro) e os exercícios de cada uma.",
    module: "audios",
    checklist: ["Concluí a sessão 1", "Concluí a sessão 2", "Concluí a sessão 3"],
  },
  {
    id: 5,
    objective: "Entender a confiança como algo que se reconstrói com coerência, ao longo do tempo.",
    content: [
      "Confiança volta, quando volta, porque o outro percebe repetidas vezes que você faz o que diz e respeita os limites dele. Uma promessa sozinha não faz isso.",
      'Escolha atitudes pequenas e observáveis. Não "vou ser uma pessoa melhor", e sim "não vou checar as redes dele", "vou responder com calma mesmo quando ele estiver frio", "não vou mentir nem em coisas pequenas".',
      "Isso vale mesmo sem contato. Coerência não é um recado para ele: é a pessoa que você está se tornando. Se um dia houver conversa, ela vai encontrar alguém diferente. Se não houver, você ganhou do mesmo jeito.",
    ],
    activity:
      "Escolha três atitudes de coerência, escreva cada uma de forma concreta e pratique uma delas nesta semana.",
    module: "bonus",
    checklist: [
      "Consultei o Mapa de Reconstrução da Confiança",
      "Escolhi três atitudes de coerência",
      "Pratiquei uma delas",
    ],
  },
  {
    id: 6,
    objective: "Avaliar com honestidade se há abertura, ou se o melhor é respeitar o afastamento.",
    content: [
      "Os sinais de abertura e de afastamento do seu Mapa ajudam a decidir com calma. Leia como possibilidades, não como certezas: ninguém sabe o que o outro sente.",
      "Abertura é reciprocidade que se repete: ele puxa conversa, pergunta de você, fala do que aconteceu sem agressividade. Um contato isolado, educado ou nostálgico, não é a mesma coisa.",
      "Se ele pediu distância, bloqueou ou está com outra pessoa, esta etapa é sobre aceitar o limite e cuidar de você. Respeitar não é desistir de si: é parar de gastar energia numa porta que ele fechou.",
    ],
    activity:
      "Releia os sinais do seu Mapa, anote o que você tem observado de fato (sem interpretar) e decida o seu próximo passo.",
    module: "bonus",
    checklist: [
      "Reli os sinais de abertura e de afastamento",
      "Usei a Técnica de Reversão Noturna em uma noite difícil",
      "Decidi o meu próximo passo com calma",
    ],
  },
  {
    id: 7,
    objective: "Definir o que você leva desta jornada, qualquer que seja a resposta dele.",
    content: [
      "A reaproximação não depende só de você. O que você aprendeu sobre si, sobre comunicação e sobre limites, sim, e isso fica com você.",
      "Olhe para trás: o que você faz hoje de forma diferente de quando começou? Talvez seja esperar antes de responder, falar de você sem acusar ou dormir sem o celular na mão. Esses ganhos são reais e não dependem de ninguém.",
      "Feche a jornada escolhendo um hábito para manter. Se a situação mudou (ele voltou a falar, pediu distância, começou outra relação), refaça o diagnóstico: o app se ajusta ao momento atual.",
    ],
    activity: "Escreva três aprendizados desta jornada e o hábito que você vai manter.",
    checklist: [
      "Escrevi três aprendizados",
      "Escolhi um hábito para manter",
      "Refiz o diagnóstico, se a situação mudou",
    ],
  },
];
