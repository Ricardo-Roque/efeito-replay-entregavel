// Conteúdo fixo de apoio: regras de ouro, sinais e checklist da Pausa.
// RASCUNHO, a partir do PDF do protocolo.

import type { CommStance } from "@/lib/comunicacao/types";

export type SignalKind = "open" | "alert" | "stop";

export const signals: Record<SignalKind, string[]> = {
  open: [
    "Responde mais rápido",
    "Faz perguntas sobre a sua vida",
    "Prolonga a conversa",
    "Sugere encontro ou ligação",
  ],
  alert: [
    "Respostas secas e demoradas",
    "Evita qualquer assunto pessoal",
    "Só aparece quando precisa de algo",
  ],
  stop: ["Pediu para você parar", "Bloqueou ou pediu distância"],
};

export const signalTitle: Record<SignalKind, string> = {
  open: "Abertura",
  alert: "Alerta",
  stop: "Pare aqui",
};

export interface PauseQuestion {
  id: string;
  label: string;
  hint: string;
  /** "Não" aqui sempre dá "não envie". */
  hardStop?: boolean;
}

/** Checklist da Pausa antes de enviar. Inclui a proteção da madrugada: no pico emocional, guardar 24h. */
export const pauseQuestions: PauseQuestion[] = [
  { id: "curta", label: "É curta?", hint: "Uma ou duas linhas bastam." },
  { id: "leve", label: "É leve?", hint: 'Sem cobrança, sem peso, sem "você me ama?".' },
  {
    id: "aberta",
    label: "Deixa ele livre para não responder?",
    hint: "Nada de pergunta que exige resposta.",
  },
  {
    id: "semResposta",
    label: "Você ficaria bem sem resposta?",
    hint: "Se precisa da resposta para ficar bem, ainda não é hora.",
  },
  {
    id: "horario",
    label: "Não é madrugada nem um pico de emoção?",
    hint: "No pico emocional, a proteção é guardar e esperar 24 horas.",
  },
  {
    id: "limite",
    label: "Ele não te bloqueou, não pediu distância e não está com outra pessoa?",
    hint: "Bloqueio, pedido de distância e outra relação são limites.",
    hardStop: true,
  },
];

/**
 * Checklist do momento dela. Com pedido de tempo ou sem reciprocidade, a iniciativa não é dela
 * (mesma regra da Central e das 48 horas): só uma resposta a uma mensagem dele pode sair, e
 * "não" aqui leva a guardar por 24 horas. Com limite, o "não" do limite já vem marcado.
 */
export function pauseQuestionsFor(stance: CommStance): PauseQuestion[] {
  if (stance !== "pausa" && stance !== "espaco") return pauseQuestions;
  return [
    ...pauseQuestions,
    {
      id: "iniciativa",
      label: "Ele escreveu primeiro, e você está respondendo?",
      hint:
        stance === "pausa"
          ? "Ele pediu um tempo: enquanto durar, a iniciativa de escrever não é sua."
          : "Hoje não há reciprocidade: só responda se ele escrever primeiro.",
    },
  ];
}

export const rules = {
  errors: [
    {
      title: "Mandar mensagens longas e emocionais",
      text: "Quanto mais você explica, menos espaço ele tem para sentir falta.",
    },
    { title: "Cobrar resposta", text: "A cobrança transforma você em obrigação, não em desejo." },
    { title: "Aparecer disponível demais", text: "Disponibilidade total elimina a saudade." },
  ],
  neverSend: [
    "Textões explicando seus sentimentos",
    'Ultimatos e "última chance"',
    "Mensagens de madrugada",
    "Comparações com outras pessoas",
    'Perguntas do tipo "você me ama?"',
  ],
  relapse: [
    "Quando bater a ansiedade, espere 24 horas",
    "Releia o protocolo antes de agir",
    "Converse com uma amiga, não com ele",
    "Lembre por que você está fazendo isso",
  ],
};

/** Rede de apoio, sempre visível. Números públicos, não dependem de configuração. */
export const careLines = [
  { label: "CVV, apoio emocional 24h", phone: "188" },
  { label: "Central de Atendimento à Mulher", phone: "180" },
];

export const moods = ["Difícil", "Ansiosa", "Ok", "Calma", "Bem"];
