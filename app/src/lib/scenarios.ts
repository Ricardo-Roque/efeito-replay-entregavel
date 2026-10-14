// Os 6 cenários (equivalente às situações do Calm Kids). RASCUNHO editorial.
//
// Cada cenário explica a situação, os desafios, o que evitar e o que fazer (com o porquê),
// exemplos, sinais de abertura e de limite, conteúdos relacionados e próximos passos.
// As mensagens não moram aqui: `messages` aponta para conteúdos da Central de Comunicação
// (lib/comunicacao/library.ts), que decide pelo momento dela se cada um pode ser usado.
//
// safety: bloqueio e outra pessoa mostram o alerta e não têm mensagens. A Pausa responde
// "não envie" (bloqueio) ou avisa que o plano não sugere mensagens (outra pessoa).
// Exemplos são situações ilustrativas, nunca depoimentos. Nenhum promete efeito sobre ele.

import type { LabeledLink } from "@/lib/app-link";

export type ScenarioId = "bloqueou" | "frio" | "outra" | "desinteresse" | "respondeu" | "encontro";

/** Uma atitude e o porquê dela. */
export interface ScenarioPoint {
  text: string;
  why: string;
}

export interface ScenarioExample {
  situation: string;
  better: string;
}

export interface Scenario {
  id: ScenarioId;
  label: string;
  short: string;
  /** Fundo do tile (mesmo papel dos tints do Calm Kids). */
  tint: "rose" | "honey" | "sage" | "lavender";
  /** Uma ou duas frases de abertura. */
  description: string;
  safety?: "block" | "other";
  alert?: string;
  /** Explicação da situação. */
  understand: string[];
  /** Principais desafios. */
  challenges: string[];
  /** Atitudes recomendadas. */
  do: ScenarioPoint[];
  /** Comportamentos a evitar. */
  avoid: ScenarioPoint[];
  examples: ScenarioExample[];
  openSignals: string[];
  limitSignals: string[];
  /** Ids da Central. Vazio nos cenários de limite. */
  messages: string[];
  noMessages?: string;
  stop: string;
  /** Próximos passos. */
  next: string[];
  /** Conteúdos e ferramentas relacionados. */
  links: LabeledLink[];
  /** Dias do plano mais ligados ao cenário. */
  days: number[];
}

export const scenarios: Scenario[] = [
  {
    id: "bloqueou",
    tint: "rose",
    label: "Ele me bloqueou",
    short: "Um limite que pede respeito",
    description:
      "O bloqueio é um limite que ele colocou. Seja qual for o motivo, o seu plano agora é cuidar de você.",
    safety: "block",
    alert:
      "Respeite o bloqueio. Não use outros perfis, números, amigos ou familiares para chegar até ele, e não apareça onde ele está.",
    understand: [
      "O bloqueio é a forma mais clara de alguém dizer que, agora, não quer contato. Os motivos podem ser vários: se proteger da dor, evitar uma discussão, precisar de distância para pensar. Você não precisa saber qual é para respeitar.",
      "Bloqueio não é um desafio a ser contornado. Procurar outros caminhos (outro número, outro perfil, amigos, aparecer onde ele está) costuma confirmar para ele que o bloqueio era necessário, e pode ser vivido como perseguição.",
      "Neste cenário, o trabalho é todo seu: atravessar a dor, reorganizar a rotina e entender o que você quer para você.",
    ],
    challenges: [
      "Lidar com a sensação de não poder dizer o que sente.",
      "Resistir à vontade de checar se ele desbloqueou.",
      "Não transformar amigos em comum em mensageiros.",
      'Não tratar o bloqueio como algo que precisa ser "resolvido".',
    ],
    do: [
      {
        text: "Respeitar o limite, por todos os meios",
        why: "Respeitar é o que preserva a sua dignidade e deixa com ele a decisão de, um dia, procurar você.",
      },
      {
        text: "Escrever no Diário o que você queria dizer",
        why: "A carta sem envio organiza o sentimento sem ultrapassar o limite dele.",
      },
      {
        text: "Seguir o plano de 21 dias pensando em você",
        why: "Todos os dias têm uma versão para quem está sem contato.",
      },
      {
        text: "Pedir apoio a pessoas de confiança",
        why: "Falar com alguém alivia a pressão de falar com ele.",
      },
    ],
    avoid: [
      {
        text: "Criar outro perfil, número ou e-mail",
        why: "É contornar um limite, e pode ser vivido por ele como perseguição.",
      },
      {
        text: "Mandar recado por amigos ou família",
        why: "Expõe os dois e coloca outras pessoas numa posição difícil.",
      },
      {
        text: "Aparecer onde ele está",
        why: "Transforma o limite em confronto.",
      },
      {
        text: "Checar se ele desbloqueou",
        why: "Mantém você presa ao que ele faz, e não ao que você precisa.",
      },
    ],
    examples: [
      {
        situation: 'Uma amiga em comum oferece: "Se quiser, eu falo com ele por você".',
        better:
          'Agradeça e recuse: "Obrigada, mas prefiro respeitar o espaço dele. Se ele quiser falar comigo, ele sabe como."',
      },
      {
        situation: "É o aniversário dele e você sente que precisa dizer alguma coisa.",
        better:
          "Escreva no Diário tudo o que quiser dizer e não envie por nenhum meio. O gesto fica com você.",
      },
    ],
    openSignals: [
      "Só existe abertura se ele desbloquear e escrever por iniciativa própria. Ainda assim, quem dá o ritmo é ele: atualize o diagnóstico antes de responder.",
    ],
    limitSignals: [
      "O bloqueio continua.",
      "Ele bloqueou também em outras redes ou pediu a amigos que não levem recados.",
      "Ele disse que não quer contato.",
    ],
    messages: [],
    noMessages:
      "Neste cenário não existe mensagem para enviar, por nenhum meio. A Central fica aberta só para leitura e reflexão.",
    stop: "Se o bloqueio continuar, essa é a resposta dele por agora. Seguir o plano continua valendo, por você.",
    next: [
      "Faça os dias 2 a 5 com atenção: eles tratam do impulso e das horas vulneráveis.",
      "No Dia 11, escreva a carta sem envio.",
      "Se ele desbloquear e escrever, atualize o diagnóstico antes de responder.",
    ],
    links: [
      { link: { kind: "message", id: "semresp-carta" }, label: "Carta sem envio" },
      {
        link: { kind: "message", id: "evit-terceiros" },
        label: "Por que não usar outros caminhos",
      },
      { link: { kind: "diary" } },
    ],
    days: [2, 3, 4, 5, 11],
  },
  {
    id: "frio",
    tint: "lavender",
    label: "Ele está frio e distante",
    short: "Menos peso, mais leveza",
    description:
      "Ainda há contato, mas ele responde pouco e sem interesse. A porta não está fechada, mas também não está aberta.",
    understand: [
      "Frieza é quando ainda há contato, mas ele responde curto, demora, não puxa assunto e evita qualquer tema pessoal. É diferente de bloqueio ou de pedido de distância.",
      "Muitas vezes, a frieza aparece quando a conversa virou lugar de cobrança, de discussão sobre a relação ou de expectativa. Também pode ser cansaço, confusão ou falta de interesse. Não dá para saber qual, e não é preciso.",
      "O que está no seu controle é o clima que você leva para a conversa: menos peso, menos frequência, mais leveza. Isso não garante uma resposta calorosa, mas evita que a distância aumente por causa de você.",
    ],
    challenges: [
      "Não reclamar da frieza.",
      "Não compensar com mensagens mais longas ou mais frequentes.",
      "Aceitar que a leveza não garante uma resposta calorosa.",
      "Perceber quando a frieza virou falta total de reciprocidade.",
    ],
    do: [
      {
        text: "Responder curto, no tamanho dele",
        why: "Espelhar o tamanho tira a sensação de desequilíbrio.",
      },
      {
        text: "Trazer assuntos neutros e do presente",
        why: "Assuntos sem peso são mais fáceis de responder.",
      },
      {
        text: "Dar espaço entre as mensagens",
        why: "Mensagens frequentes aumentam a sensação de cobrança.",
      },
      {
        text: "Encerrar a conversa antes dele",
        why: "Ela termina num ponto bom, sem você ficar puxando.",
      },
    ],
    avoid: [
      {
        text: 'Reclamar da frieza ("você está tão seco")',
        why: "Vira cobrança e confirma o clima pesado.",
      },
      {
        text: "Insistir em conversar sobre o término",
        why: "É o assunto que mais costuma esfriar a conversa.",
      },
      {
        text: "Perguntar o que ele sente",
        why: "Pede uma definição que ele não está oferecendo.",
      },
      {
        text: "Mandar várias mensagens seguidas",
        why: "Desequilibra ainda mais a conversa.",
      },
    ],
    examples: [
      {
        situation: 'Ele responde "tudo certo" à sua pergunta sobre o fim de semana.',
        better:
          'Responda no mesmo tom ("Que bom! Por aqui também.") e deixe a conversa terminar ali, sem puxar outro assunto.',
      },
      {
        situation: 'Você sente vontade de perguntar "por que você está assim comigo?".',
        better:
          "Escreva a pergunta no Diário. Se a vontade de falar sobre isso continuar, é assunto para uma conversa ao vivo, quando houver abertura, e não para mensagem.",
      },
    ],
    openSignals: [
      "Respostas um pouco mais longas ou mais rápidas.",
      "Ele faz uma pergunta sobre você.",
      "Ele puxa assunto, mesmo que raramente.",
      "Ele usa humor ou lembra de algo que você contou.",
    ],
    limitSignals: [
      "Ele para de responder.",
      "Ele pede para você parar ou diz que precisa de espaço.",
      "As respostas ficam mais curtas a cada semana, mesmo com leveza da sua parte.",
      "Ele demonstra irritação com o contato.",
    ],
    messages: ["frio-espelhar", "frio-assunto-neutro", "frio-encerrar", "pc-lembranca-concreta"],
    stop: 'Se ele pedir para você parar, agradeça e pare. Se as respostas sumirem, não insista: o cenário passa a ser "Ele perdeu o interesse".',
    next: [
      "Faça os dias 8 a 10 para ajustar o tom.",
      'Quando ele responder friamente, use o "Ele respondeu. E agora?".',
      "Registre os sinais no Diário por uma ou duas semanas antes de qualquer passo maior.",
    ],
    links: [
      { link: { kind: "central", category: "frio" }, label: "Central: quando ele está frio" },
      { link: { kind: "reply", situation: "frio" }, label: "Ele respondeu friamente" },
      { link: { kind: "rules", section: "signals" } },
    ],
    days: [8, 9, 10, 15],
  },
  {
    id: "outra",
    tint: "rose",
    label: "Ele está com outra pessoa",
    short: "Sem disputa, sem comparação",
    description:
      "Um novo envolvimento muda o cenário. A orientação aqui é de não interferência e de cuidado com você.",
    safety: "other",
    alert:
      "Ele está em outra relação. Não procure a outra pessoa, não compare e não mande mensagens para testar.",
    understand: [
      "Quando ele está com outra pessoa, a situação muda de natureza: já não envolve só vocês dois. Existe uma terceira pessoa, que não tem responsabilidade pelo que aconteceu entre vocês.",
      'Comparar, investigar, competir ou tentar mostrar que você é melhor costuma machucar você, expor você e aumentar a distância. Mesmo mensagens "inocentes" agora podem ser lidas como interferência.',
      "A orientação deste cenário é de não interferência: cuidar de você, sem mensagens e sem disputa. O futuro da relação dele não é algo que você precise, ou deva, tentar provocar.",
    ],
    challenges: [
      "Lidar com o ciúme e com a comparação.",
      "Não procurar informações sobre a outra pessoa.",
      "Não ser puxada para conversas de amigos sobre o novo relacionamento.",
      "Separar a sua autoestima da escolha dele.",
    ],
    do: [
      {
        text: "Silenciar os perfis dele e de quem posta sobre os dois",
        why: "Diminui os estímulos que alimentam a comparação.",
      },
      {
        text: "Cuidar da sua vida e de quem está perto",
        why: "Recoloca o centro em você.",
      },
      {
        text: "Seguir o plano de 21 dias na versão sem contato",
        why: "Todos os dias têm orientações para este cenário.",
      },
      {
        text: "Falar com alguém de confiança sobre o que sente",
        why: "Ciúme guardado tende a crescer.",
      },
    ],
    avoid: [
      {
        text: "Procurar ou falar com a outra pessoa",
        why: "Ela não tem responsabilidade pelo término, e a exposição machuca todo mundo.",
      },
      {
        text: "Mandar mensagem para testar se ele ainda sente algo",
        why: "É interferência, e a resposta não traria paz.",
      },
      {
        text: "Se comparar ou criticar a outra pessoa",
        why: "Coloca você numa disputa que não leva a nada bom.",
      },
      {
        text: "Postar pensando em provocar ciúme",
        why: "Funciona como recado e costuma afastar.",
      },
    ],
    examples: [
      {
        situation: "Ele curte uma foto sua.",
        better:
          "Não responda nem interprete. Uma curtida não é convite, e reagir a ela seria iniciar contato enquanto ele está em outra relação.",
      },
      {
        situation: "Uma amiga começa a contar detalhes do novo relacionamento dele.",
        better:
          'Peça com carinho: "Prefiro não saber, isso me faz mal agora." Se proteger de informação também é cuidado.',
      },
    ],
    openSignals: [
      "Nenhum, enquanto ele estiver em outra relação. Se ele terminar e procurar você por iniciativa própria, atualize o diagnóstico antes de responder.",
    ],
    limitSignals: [
      "Ele está em outra relação.",
      "Ele pede para você não procurar.",
      "Ele menciona a outra pessoa quando conversam.",
    ],
    messages: [],
    noMessages:
      "Enquanto ele estiver em outra relação, o plano não sugere mensagens. A Central fica aberta só para leitura.",
    stop: "Quem se mantém inteira não precisa disputar. Seguir o plano é por você.",
    next: [
      "Os dias 3, 4 e 6 são os mais importantes agora.",
      'Se ele escrever, use o "Ele respondeu. E agora?" em "Ele mencionou outra pessoa".',
      "Se a situação mudar, refaça o diagnóstico.",
    ],
    links: [
      { link: { kind: "reply", situation: "outra_pessoa" }, label: "Ele mencionou outra pessoa" },
      { link: { kind: "message", id: "evit-ciume" }, label: "Por que não provocar ciúme" },
      { link: { kind: "diary" } },
      { link: { kind: "map" } },
    ],
    days: [3, 4, 6, 11],
  },
  {
    id: "desinteresse",
    tint: "honey",
    label: "Ele perdeu o interesse",
    short: "Espaço de verdade, sem insistência",
    description:
      "A conversa praticamente parou. Insistir costuma aprofundar a distância; dar espaço é o que está ao seu alcance.",
    understand: [
      "Desinteresse é quando a conversa praticamente parou: ele não responde, ou responde muito pouco, não demonstra curiosidade e não procura. Às vezes, isso aparece depois de um período de insistência.",
      "Insistir costuma aprofundar o desinteresse: cada mensagem sem resposta reforça o padrão e cansa você. Se algo pode mudar o quadro, é parar de repetir o mesmo movimento.",
      "Isso significa dar espaço de verdade: não iniciar conversas, cuidar da sua vida e deixar que, se houver interesse dele, ele apareça. E aceitar que ele pode não aparecer.",
    ],
    challenges: [
      'Parar de mandar "só mais uma".',
      "Lidar com o silêncio sem buscar explicação.",
      "Não interpretar visualizações e horários online.",
      "Reconstruir a autoestima sem depender da atenção dele.",
    ],
    do: [
      {
        text: "Parar de iniciar conversas",
        why: "Sem reciprocidade, cada nova mensagem pesa mais do que ajuda.",
      },
      {
        text: "Viver uma rotina mais leve, por você",
        why: "É a mudança real, e ela não depende dele.",
      },
      {
        text: "Se ele escrever, responder com leveza e sem cobrar o silêncio",
        why: "Uma boa resposta vale mais do que dez iniciativas.",
      },
      {
        text: "Registrar os sinais no Diário",
        why: "Ajuda a ver o padrão, e não uma mensagem isolada.",
      },
    ],
    avoid: [
      {
        text: 'Cobrar atenção ("você nem me responde mais")',
        why: "Cobrança não gera interesse.",
      },
      {
        text: "Mandar várias mensagens seguidas",
        why: "Reforça o padrão de insistência.",
      },
      {
        text: "Explicar a relação de novo",
        why: "Ele já ouviu; repetir não muda o quadro.",
      },
      {
        text: 'Pedir uma "última conversa"',
        why: "Coloca pressão num momento sem abertura.",
      },
    ],
    examples: [
      {
        situation: "Você mandou uma mensagem há cinco dias e ele não respondeu.",
        better:
          "Não mande outra. Se precisar dizer algo, escreva no Diário. A sua última mensagem já foi a sua vez.",
      },
      {
        situation: 'Ele escreve depois de semanas: "Oi, tudo bem?".',
        better:
          'Responda leve, sem cobrar: "Oi! Tudo bem sim, e você?". Não pergunte por que ele sumiu.',
      },
    ],
    openSignals: [
      "Ele escreve por iniciativa própria.",
      "Ele responde e faz uma pergunta de volta.",
      "Ele mantém a conversa por mais de algumas mensagens.",
    ],
    limitSignals: [
      "Silêncio contínuo.",
      "Visualizações sem resposta, repetidas.",
      "Ele pede para você parar ou diz que seguiu em frente.",
    ],
    messages: ["semresp-nao-enviar", "frio-espelhar", "perg-sumiu"],
    stop: "Mudança percebida vale mais que mil explicações. Se ele não responder, não insista.",
    next: [
      "Faça os dias 3, 6 e 12 com atenção.",
      'Leia a reflexão "Hoje eu escolho não mandar" na Central.',
      'Se ele escrever, use o "Ele respondeu. E agora?" antes de responder.',
    ],
    links: [
      { link: { kind: "reply", situation: "visualizou" }, label: "Ele visualizou e não respondeu" },
      {
        link: { kind: "central", category: "sem_resposta" },
        label: "Central: quando não há resposta",
      },
      { link: { kind: "diary" } },
    ],
    days: [3, 6, 12, 17],
  },
  {
    id: "respondeu",
    tint: "sage",
    label: "Ele respondeu",
    short: "Leve, curta, sem peso",
    description:
      "Quando ele responde, o objetivo não é resolver o passado. É que falar com você seja uma experiência boa.",
    understand: [
      "Quando ele responde, existe uma abertura, mas não uma definição. A resposta pode ser educação, saudade, curiosidade ou interesse. Ainda não dá para saber, e não é preciso decidir agora.",
      "O objetivo deste momento não é resolver o passado nem saber o que vocês são. É que a conversa seja leve e agradável, para que falar com você volte a ser algo bom.",
      "Isso se faz com presença: interesse no que ele conta, respostas no seu ritmo, assuntos do presente e conversas que terminam antes de cansar.",
    ],
    challenges: [
      "Não transformar a conversa numa discussão sobre a relação.",
      "Não responder sempre na hora, nem fazer joguinho de demora.",
      "Não interpretar demais cada mensagem.",
      "Lidar com perguntas difíceis (se está com alguém, se ainda gosta).",
    ],
    do: [
      {
        text: "Responder leve, curto e no seu tempo",
        why: "Quando você está calma, o tom da resposta acompanha.",
      },
      {
        text: "Falar do presente",
        why: "O presente é terreno neutro; o passado costuma trazer peso.",
      },
      {
        text: "Encerrar antes de esfriar",
        why: "A conversa termina boa e o próximo contato começa melhor.",
      },
      {
        text: "Observar os sinais no Diário",
        why: "O padrão de semanas diz mais do que uma conversa.",
      },
    ],
    avoid: [
      {
        text: "Resolver o passado agora",
        why: "Uma conversa leve que vira cobrança costuma terminar mal.",
      },
      {
        text: "Transformar o papo numa conversa sobre a relação",
        why: "Pede uma definição que talvez ele não tenha.",
      },
      {
        text: "Cobrar a demora da resposta",
        why: "Transforma o gesto dele em obrigação.",
      },
      {
        text: "Perguntar o que ele sente",
        why: "Coloca pressão num momento que ainda está se formando.",
      },
    ],
    examples: [
      {
        situation: 'Ele pergunta: "E aí, como você está?".',
        better:
          'Responda com algo concreto do seu presente e devolva a pergunta: "Bem! Voltei a fazer aula de dança, tô amando. E você?".',
      },
      {
        situation: "Ele pergunta se você está saindo com alguém.",
        better:
          'Responda com calma e sem jogo: "Não estou. Tenho cuidado de mim." Não devolva com "por quê?" nem com ciúme.',
      },
    ],
    openSignals: [
      "Ele puxa assunto.",
      "Faz perguntas sobre a sua vida.",
      "Prolonga a conversa.",
      "Lembra de coisas que você contou.",
      "Sugere ligar ou se encontrar.",
    ],
    limitSignals: [
      "Respostas cada vez mais curtas.",
      "Ele só aparece quando precisa de algo.",
      "Ele pede espaço.",
      "Ele menciona outra pessoa.",
    ],
    messages: ["perg-como-esta", "perg-alguem", "frio-encerrar", "saudade-acolher"],
    stop: "Se a conversa esfriar ou ele pedir espaço, respeite e volte ao seu ritmo.",
    next: [
      "Os dias 13 a 16 são o seu foco agora.",
      'Use o "Ele respondeu. E agora?" para as mensagens difíceis.',
      "Quando a conversa fluir por algumas semanas, leia o cenário do encontro.",
    ],
    links: [
      { link: { kind: "reply" } },
      { link: { kind: "central", category: "perguntas" }, label: "Central: perguntas difíceis" },
      {
        link: { kind: "scenario", id: "encontro" },
        label: "Cenário: quero chamar para um encontro",
      },
    ],
    days: [13, 14, 15, 16],
  },
  {
    id: "encontro",
    tint: "honey",
    label: "Quero chamar para um encontro",
    short: "Convite leve, sem cobrança",
    description:
      "Quando a conversa flui e ele mostra sinais de abertura, um convite simples pode fazer sentido. Sem pressão, e aceitando qualquer resposta.",
    understand: [
      "Um convite faz sentido quando a conversa já flui: ele responde com interesse, puxa assunto, faz perguntas. Sem esse terreno, o convite costuma soar como pressão.",
      "Convidar não é pedir para voltar. É propor um momento leve, ao vivo, para os dois perceberem como é estar juntos hoje. A conversa sobre a relação, se acontecer, vem depois e nunca é obrigatória.",
      "Segurança vem antes de tudo: lugar público, de dia, alguém de confiança sabendo onde você está, e liberdade para ir embora quando quiser.",
    ],
    challenges: [
      "Saber se é a hora.",
      "Fazer um convite fácil de recusar.",
      "Lidar com um não ou com um adiamento.",
      "Não transformar o encontro numa discussão sobre a relação.",
    ],
    do: [
      {
        text: "Convidar só depois de algumas semanas de sinais de abertura",
        why: "Sem reciprocidade, o convite vira pressão.",
      },
      {
        text: "Propor algo específico, público e de dia",
        why: "É mais fácil dizer sim, e mais seguro para você.",
      },
      {
        text: "Deixar claro que tudo bem se não der",
        why: "Um sim sem pressão vale mais.",
      },
      {
        text: "Manter o encontro curto e leve",
        why: "Um encontro bom que termina cedo deixa uma lembrança melhor.",
      },
    ],
    avoid: [
      {
        text: 'Ultimatos e "última chance"',
        why: "Forçam uma decisão e costumam gerar afastamento.",
      },
      {
        text: "Insistir depois de um não",
        why: "Recusa é resposta, não convite para negociar.",
      },
      {
        text: "Transformar o encontro numa discussão sobre a relação",
        why: "Pesa num momento que deveria ser leve.",
      },
      {
        text: "Convidar para a casa de um dos dois",
        why: "Lugar privado aumenta a pressão e diminui a sua segurança.",
      },
    ],
    examples: [
      {
        situation: "Vocês conversaram bem a semana toda, e ele comentou que sente falta de sair.",
        better:
          'Proponha algo concreto e leve: um café num lugar de que ele gosta, num dia e horário, com "se não der, tudo bem".',
      },
      {
        situation: 'Ele responde ao convite: "Essa semana tá corrido".',
        better: '"Tranquilo! Boa semana." Não proponha outra data: se ele quiser, ele propõe.',
      },
    ],
    openSignals: [
      "Ele mesmo sugere um encontro ou uma ligação.",
      "Ele fala de lugares ou programas de que vocês gostavam.",
      "A conversa flui por dias, com iniciativa dos dois.",
    ],
    limitSignals: [
      "Ele recusa ou adia sem propor outra data.",
      "Ele não responde ao convite.",
      "A conversa esfria depois do convite.",
      "Ele menciona outra pessoa.",
    ],
    messages: ["conv-cafe", "conv-recusa", "conv-ele-convida", "reen-preparar"],
    stop: "Se ele recusar, agradeça e encerre com leveza. Recusa não é convite para insistir.",
    next: [
      "Faça os dias 19 a 21 na ordem.",
      'Antes de convidar, leia "Preparar o encontro" na Central.',
      'Se ele convidar você, use o "Ele respondeu. E agora?".',
    ],
    links: [
      { link: { kind: "reply", situation: "encontro" }, label: "Se ele me convidar" },
      { link: { kind: "central", category: "convites" }, label: "Central: convites" },
      { link: { kind: "central", category: "reencontro" }, label: "Central: reencontro" },
    ],
    days: [19, 20, 21],
  },
];

export const scenarioById = (id: ScenarioId) => scenarios.find((item) => item.id === id)!;
