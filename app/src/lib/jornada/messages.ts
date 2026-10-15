// Ponte entre a jornada (diagnóstico e 48 horas) e a Central de Comunicação. RASCUNHO de conteúdo.
//
// O conteúdo da Central mora em lib/comunicacao (dados em library.ts, regras em rules.ts). Aqui
// ficam: os modelos expostos no formato MessageTemplate (usados pelo Meu Plano de 48 Horas) e as
// técnicas citadas na VSL. O assistente "Ele respondeu. E agora?" mora em lib/comunicacao/reply.ts.
// As sete técnicas abaixo são versões editoriais próprias do aplicativo, criadas em 14/10/2026.
// Elas não são apresentadas como transcrição de um material original que não foi fornecido.
//
// Segurança: no modo "sem_contato" não sai nenhum modelo.

import { commMessages } from "@/lib/comunicacao/library";
import type { CommStance } from "@/lib/comunicacao/types";
import type { ContactMode, MessageTemplate, VslTechnique } from "@/lib/jornada/types";
import type { ScenarioId } from "@/lib/scenarios";

const EDITORIAL_NOTE =
  "Orientação criada para o Código da Reconquista. Use como referência e adapte ao seu contexto.";

export const vslTechniques: VslTechnique[] = [
  {
    id: "tres_palavras",
    vslName: "Mensagem de três palavras",
    shortName: "Três palavras",
    status: "rascunho",
    kind: "message",
    initiative: "dela",
    purpose:
      "Abrir uma conversa de forma breve e honesta quando já existe espaço para contato, sem cobrança nem pergunta que obrigue uma resposta.",
    whenToUse: [
      "Existe contato aberto ou uma conversa cordial recente.",
      "Você lembrou dele de verdade e consegue aceitar que talvez não haja resposta.",
      "Não há mensagem sua aguardando resposta.",
    ],
    whenToAvoid: [
      "Ele bloqueou, pediu distância, está em outro relacionamento ou deixou mensagens anteriores sem resposta.",
      "O término é muito recente e você ainda espera que uma frase resolva a situação.",
      "A lembrança não é verdadeira ou seria usada apenas para despertar curiosidade.",
    ],
    message: "Lembrei de você.",
    customization: [
      "Envie apenas se a frase for verdadeira; ela funciona justamente por não carregar uma justificativa inventada.",
      "Se ele perguntar do que você lembrou, responda com uma lembrança concreta e leve, em uma ou duas frases.",
    ],
    ifReply: [
      "Responda somente ao que ele perguntou, com naturalidade.",
      "Observe o ritmo dele e encerre a conversa antes de transformar abertura em cobrança.",
    ],
    ifNoReply: [
      "Não mande complemento, interrogação ou segunda tentativa.",
      "Considere a ausência de resposta como informação e volte à sua rotina.",
    ],
    limits:
      "Nunca use para contornar bloqueio, pedido de distância, silêncio após outra iniciativa sua ou um relacionamento atual dele.",
    note: EDITORIAL_NOTE,
  },
  {
    id: "comeca_com_h",
    vslName: "Mensagem que começa com H",
    shortName: "Começa com H",
    status: "rascunho",
    kind: "message",
    initiative: "dela",
    purpose:
      "Usar uma lembrança real e específica para iniciar um contato compreensível, sem suspense artificial.",
    whenToUse: [
      "Há abertura para conversar e a lembrança é recente, concreta e positiva.",
      "Você consegue escrever sem transformar a lembrança em pedido para voltar.",
    ],
    whenToAvoid: [
      "Ele pediu espaço, não respondeu ao último contato ou existe qualquer limite registrado.",
      "A lembrança envolve culpa, ciúme, intimidade ou um assunto ainda doloroso.",
      "Você pretende usar uma coincidência inventada como pretexto.",
    ],
    message:
      "Hoje passei por [lugar] e lembrei de [lembrança concreta]. Espero que você esteja bem.",
    customization: [
      "Troque os dois trechos entre colchetes por fatos reais e fáceis de reconhecer.",
      "Escolha uma lembrança leve; não use datas sensíveis, apelidos íntimos ou promessas do relacionamento.",
    ],
    ifReply: [
      "Acompanhe o assunto que ele escolher, sem conduzir imediatamente para a relação.",
      "Mantenha o mesmo tamanho e a mesma leveza da resposta dele.",
    ],
    ifNoReply: [
      "Não explique novamente a lembrança e não pergunte se ele viu.",
      "Não use outra memória como segunda tentativa.",
    ],
    limits:
      "Uma lembrança compartilhada não dá permissão para ultrapassar bloqueio, pedido de distância ou falta de reciprocidade.",
    note: EDITORIAL_NOTE,
  },
  {
    id: "pensando_aqui",
    vslName: 'Mensagem "pensando aqui"',
    shortName: "Pensando aqui",
    status: "rascunho",
    kind: "message",
    initiative: "dela",
    purpose:
      "Reconhecer uma troca recente que foi boa sem pedir definição, encontro ou continuidade imediata.",
    whenToUse: [
      "Vocês conversaram recentemente com respeito e reciprocidade.",
      "Existe algo concreto da conversa que você consegue reconhecer sem exagerar.",
    ],
    whenToAvoid: [
      "A conversa terminou com conflito, silêncio, pedido de tempo ou limite.",
      "Você quer usar a frase para descobrir o que ele sente ou cobrar a próxima iniciativa.",
    ],
    message: "Pensando aqui: gostei da forma como a gente conversou sobre [assunto].",
    customization: [
      "Substitua [assunto] pelo tema real da conversa, sem interpretar sentimentos dele.",
      "Não acrescente perguntas como “e você?” ou “será que podemos voltar?”.",
    ],
    ifReply: [
      "Receba a resposta como ela vier e continue apenas se houver reciprocidade.",
      "Se ele também valorizar a conversa, mantenha o assunto simples antes de propor outro passo.",
    ],
    ifNoReply: [
      "Não transforme o reconhecimento em cobrança.",
      "Espere uma iniciativa espontânea dele antes de retomar.",
    ],
    limits:
      "A técnica só reconhece uma conversa que realmente aconteceu; não serve para reabrir contato fechado.",
    note: EDITORIAL_NOTE,
  },
  {
    id: "frase_3",
    vslName: "Frase número 3",
    shortName: "Frase nº 3",
    status: "rascunho",
    kind: "message",
    initiative: "resposta",
    purpose:
      "Responder a uma fala incerta ou a um pedido de calma sem discutir, pressionar ou tentar resolver tudo naquele momento.",
    whenToUse: [
      "Ele escreveu dizendo que está confuso, precisa de calma ou não quer decidir agora.",
      "Você quer reconhecer o limite e encerrar a troca com respeito.",
    ],
    whenToAvoid: [
      "Ele não escreveu primeiro.",
      "Ele pediu para você não entrar mais em contato ou bloqueou.",
      "Há uma pergunta prática dele que precisa de uma resposta objetiva.",
    ],
    message: "Entendi. Vamos com calma.",
    customization: [
      "Use a frase inteira, sem acrescentar defesa, cobrança ou promessa.",
      "Se houver uma questão prática, responda-a antes em uma frase objetiva.",
    ],
    ifReply: [
      "Deixe que ele escolha o próximo assunto.",
      "Se ele continuar, responda ao presente sem puxar uma decisão sobre o relacionamento.",
    ],
    ifNoReply: [
      "Considere a conversa encerrada por enquanto.",
      "Não envie uma explicação adicional para preencher o silêncio.",
    ],
    limits:
      "Esta é uma resposta, nunca uma forma de iniciar contato depois de um pedido de distância.",
    note: EDITORIAL_NOTE,
  },
  {
    id: "frase_replay",
    vslName: "Frase do Replay",
    shortName: "Frase do Replay",
    status: "rascunho",
    kind: "message",
    initiative: "resposta",
    purpose:
      "Repetir com clareza o que tornou uma conversa recente agradável, sem usar nostalgia para criar obrigação emocional.",
    whenToUse: [
      "Ele retomou o contato e vocês acabaram de ter uma conversa leve e recíproca.",
      "Você quer fechar bem a troca, sem pedir outro encontro ou uma definição.",
    ],
    whenToAvoid: [
      "A conversa foi unilateral, tensa ou terminou sem resposta.",
      "Você pretende citar o passado para fazê-lo sentir culpa ou saudade.",
      "Não houve iniciativa ou participação dele na conversa.",
    ],
    message: "Gostei da nossa conversa sobre [assunto]. Foi leve falar com você.",
    customization: [
      "Troque [assunto] pelo tema real que os dois desenvolveram.",
      "Não acrescente convite ou pergunta; deixe a frase encerrar a interação.",
    ],
    ifReply: [
      "Agradeça ou acompanhe o tom dele sem acelerar a proximidade.",
      "Se surgir outro assunto naturalmente, continue sem transformar a troca em avaliação da relação.",
    ],
    ifNoReply: [
      "A frase já cumpriu o papel de fechar a conversa com respeito.",
      "Não envie uma nova mensagem para obter confirmação.",
    ],
    limits:
      "Replay significa reconhecer uma experiência real e recente, não repetir memórias para provocar emoção ou contornar distância.",
    note: EDITORIAL_NOTE,
  },
  {
    id: "buraco_negro",
    vslName: "Técnica do buraco negro emocional",
    shortName: "Buraco negro emocional",
    status: "rascunho",
    kind: "practice",
    purpose:
      "Criar um intervalo privado entre o impulso e a ação, para que a ansiedade não vire mensagem, vigilância de perfil ou tentativa de provocar reação.",
    whenToUse: [
      "Você sente urgência para escrever, responder imediatamente ou verificar as redes dele.",
      "Uma lembrança, postagem ou silêncio disparou interpretações repetitivas.",
      "Você percebe que está prestes a fazer algo apenas para obter uma reação.",
    ],
    whenToAvoid: [
      "Como castigo, sumiço calculado ou teste para descobrir se ele sentirá sua falta.",
      "Para ignorar uma responsabilidade prática combinada, como filhos, documentos ou segurança.",
      "Quando você precisa de ajuda imediata de uma pessoa de confiança ou serviço de apoio.",
    ],
    steps: [
      "Dê um nome ao gatilho em uma frase: “Eu vi, ouvi ou lembrei de...”",
      "Afaste o celular por 30 minutos e interrompa a sequência de mensagens ou consultas ao perfil.",
      "Faça uma ação concreta e neutra: beber água, tomar banho, caminhar ou organizar um espaço pequeno.",
      "Separe em duas linhas o fato observado e a interpretação que a ansiedade criou.",
      "Ao final, escolha entre não enviar nada ou levar um rascunho para a Pausa. Não decida pelo medo de perder.",
    ],
    limits:
      "O “buraco negro” absorve o seu impulso; não é uma estratégia para retirar atenção e manipular o comportamento dele.",
    note: EDITORIAL_NOTE,
  },
  {
    id: "tecnica_noturna",
    vslName: "Técnica noturna",
    shortName: "Técnica noturna",
    status: "rascunho",
    kind: "practice",
    purpose:
      "Encerrar a noite sem tomar decisões de contato no pico da saudade, deixando o assunto para ser revisto com mais clareza pela manhã.",
    whenToUse: [
      "A vontade de escrever aumenta à noite ou depois de rever fotos e conversas.",
      "Você está repetindo mentalmente hipóteses sobre o que ele sente ou faz.",
      "Não existe uma urgência prática que precise ser resolvida naquele momento.",
    ],
    whenToAvoid: [
      "Como tratamento para insônia, ansiedade ou qualquer condição de saúde.",
      "Quando existe uma emergência real ou você precisa procurar apoio imediato.",
      "Para adiar indefinidamente uma conversa prática que já foi combinada.",
    ],
    steps: [
      "Coloque o celular para carregar fora do alcance por dez minutos.",
      "Escreva três linhas: o que aconteceu, o que você sentiu e o que está sob seu controle agora.",
      "Registre uma decisão válida somente até amanhã: “Hoje eu não vou enviar nada.”",
      "Escolha uma ação curta de encerramento, como beber água, lavar o rosto ou preparar o ambiente para descansar.",
      "Na manhã seguinte, releia o que escreveu e use a Pausa antes de decidir qualquer contato.",
    ],
    limits:
      "A prática organiza a sua noite; ela não age sobre o sono, os pensamentos ou as decisões da outra pessoa.",
    note: "Versão editorial criada para o Código da Reconquista. É diferente da Técnica de Reversão Noturna do Reset.",
  },
];

export const techniqueById = (id: VslTechnique["id"]) =>
  vslTechniques.find((item) => item.id === id);

export type TechniqueAccess = "practice" | "available" | "reply_only" | "blocked";

/** Aplica às técnicas as mesmas regras de contato usadas pela Central. */
export function techniqueAccess(technique: VslTechnique, stance: CommStance): TechniqueAccess {
  if (technique.kind === "practice") return "practice";
  if (stance === "limite") return "blocked";
  if (stance === "pausa" || stance === "espaco")
    return technique.initiative === "resposta" ? "reply_only" : "blocked";
  return "available";
}

/**
 * Modelos copiáveis da Central no formato da jornada. Respostas (ele escreveu primeiro) também
 * valem no modo "pausa"; iniciativas dela, só no "aberto".
 */
export const centralTemplates: MessageTemplate[] = commMessages
  .filter((item) => item.kind === "modelo" && item.copyable)
  .map((item) => ({
    id: item.id,
    category: item.category,
    title: item.title,
    text: item.text,
    whenToUse: item.whenToUse[0] ?? item.goal,
    avoidIf: item.whenToAvoid,
    scenarios: item.scenarios,
    contactModes: item.initiative === "resposta" ? ["aberto", "pausa"] : ["aberto"],
    status: item.status,
    source: "central",
  }));

export const allTemplates: MessageTemplate[] = centralTemplates;

export const templateById = (id: string) => allTemplates.find((item) => item.id === id);

/** Visível para a cliente: nunca conteúdo aguardando material. */
export const isVisible = (item: { status: MessageTemplate["status"] }) =>
  item.status !== "aguardando_material";

/** Modelos permitidos para o modo de contato e o cenário. "sem_contato" devolve lista vazia. */
export function templatesFor(mode: ContactMode, scenario: ScenarioId | null): MessageTemplate[] {
  if (mode === "sem_contato") return [];
  return allTemplates.filter(
    (item) =>
      isVisible(item) &&
      (item.contactModes as ContactMode[]).includes(mode) &&
      (item.scenarios === "all" || (scenario !== null && item.scenarios.includes(scenario))),
  );
}
