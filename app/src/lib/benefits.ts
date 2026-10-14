// Os três upsells atuais do Código da Reconquista (ver docs/estrutura-comercial-upsells.md).
//
// O acesso vem SÓ de cr_my_entitlements (Supabase, compras "paid"). Hoje essa função devolve
// app, reset e all_days: nenhuma das três chaves abaixo existe ainda. Enquanto a chave não vier do
// servidor, o benefício fica "pendente" (nunca "liberado"). Nada aqui lê estado local, URL ou nome
// de produto para liberar acesso.
//
// O Reset Emocional do Ex (upsell antigo) continua em entitlements.reset, separado daqui.

const env = (key: string) => String(import.meta.env[key] ?? "").trim();
const digits = (value: string) => value.replace(/\D/g, "");

/** Link https válido ou "" (nenhum botão com destino quebrado ou inventado). */
function httpsUrl(value: string) {
  if (!value) return "";
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.toString() : "";
  } catch {
    return "";
  }
}

export const BENEFIT_IDS = ["conselheiro", "circulo", "vitalicio"] as const;
export type BenefitId = (typeof BENEFIT_IDS)[number];

/**
 * Valor que o servidor devolve para cada benefício:
 * true = compra confirmada; false = servidor diz que não comprou; null = o servidor ainda não
 * informa este benefício (permissão não implementada).
 */
export type BenefitGrants = Record<BenefitId, boolean | null>;

export const NO_BENEFIT_GRANTS: BenefitGrants = {
  conselheiro: null,
  circulo: null,
  vitalicio: null,
};

/** Lê as chaves dos benefícios na resposta de cr_my_entitlements. Só booleano conta. */
export function parseBenefitGrants(raw: Record<string, unknown>): BenefitGrants {
  const read = (key: BenefitId) => (typeof raw[key] === "boolean" ? (raw[key] as boolean) : null);
  return {
    conselheiro: read("conselheiro"),
    circulo: read("circulo"),
    vitalicio: read("vitalicio"),
  };
}

export type BenefitAccess = "liberado" | "nao_adquirido" | "pendente";

export function benefitAccess(grant: boolean | null): BenefitAccess {
  if (grant === true) return "liberado";
  if (grant === false) return "nao_adquirido";
  return "pendente";
}

export const accessLabel: Record<BenefitId, Record<BenefitAccess, string>> = {
  conselheiro: {
    liberado: "Acesso liberado",
    nao_adquirido: "Não adquirido",
    pendente: "Acesso pendente de configuração",
  },
  circulo: {
    liberado: "Acesso liberado",
    nao_adquirido: "Não adquirido",
    pendente: "Acesso pendente de configuração",
  },
  vitalicio: {
    liberado: "Acesso vitalício ativo",
    nao_adquirido: "Não adquirido",
    pendente: "Acesso pendente de configuração",
  },
};

export interface BenefitInfo {
  id: BenefitId;
  /** Nome oficial da oferta. */
  name: string;
  /** Título do card em Meus Benefícios. */
  title: string;
  description: string;
  /** Formato de entrega, para não confundir serviço, comunidade e acesso. */
  format: string;
  /** O que a oferta promete (texto da venda, sem acrescentar nada). */
  promises: string[];
}

export const BENEFITS: Record<BenefitId, BenefitInfo> = {
  conselheiro: {
    id: "conselheiro",
    name: "Conselheiro da Reconquista",
    title: "Seu Conselheiro da Reconquista",
    description: "Orientação individual para ajudar você a decidir seus próximos passos.",
    format: "Acompanhamento individual pelo WhatsApp. Não é curso nem módulo com aulas.",
    promises: [
      "Contar a sua história e receber orientação personalizada.",
      "Ajuda para interpretar as respostas e as atitudes dele.",
      "Orientação sobre o momento certo de enviar uma mensagem.",
      "Ajuda para escolher as palavras de uma mensagem.",
      "Ajuste dos próximos passos conforme a situação evoluir.",
    ],
  },
  circulo: {
    id: "circulo",
    name: "Círculo da Reconquista",
    title: "Círculo da Reconquista",
    description: "Uma comunidade de mulheres para compartilhar experiências e encontrar apoio.",
    format: "Acesso a uma comunidade. Não é curso nem módulo educacional.",
    promises: [
      "Compartilhar dúvidas.",
      "Encontrar acolhimento.",
      "Conversar sobre experiências parecidas.",
      "Trocar experiências sobre a aplicação do Código da Reconquista.",
      "Celebrar avanços.",
      "Apoio nos momentos de saudade e insegurança.",
    ],
  },
  vitalicio: {
    id: "vitalicio",
    name: "Código da Reconquista — Acesso Total Vitalício",
    title: "Meu Acesso Total Vitalício",
    description: "Seu programa, os produtos digitais incluídos e futuras atualizações.",
    format: "Modalidade de acesso, sem mensalidade nem renovação. Não é um curso novo.",
    promises: [
      "Acesso vitalício ao Código da Reconquista.",
      "Os produtos digitais da linha.",
      "As futuras atualizações do Código da Reconquista.",
      "Acesso contínuo aos materiais, sem mensalidade nem renovação.",
    ],
  },
};

/** Lembrete exigido em toda menção ao acompanhamento. */
export const COUNSELOR_NOTE =
  "O acompanhamento oferece orientação. A reconciliação também depende da vontade dele.";

export const CIRCLE_RULES = [
  "Respeito entre todas as participantes.",
  "O que é contado no Círculo fica no Círculo. Não copie nem divulgue relatos de outras participantes.",
  "Não publique dados pessoais de terceiros: nome completo, telefone, endereço, perfis ou fotos do ex ou de outras pessoas.",
  "Ninguém aqui incentiva perseguição, insistência ou contato contra a vontade da outra pessoa.",
  "Acolhimento, sem promessas de resultado. Cada história tem o seu tempo.",
];

/** Materiais do Acesso Total Vitalício, separados pelo que existe de fato. */
export type LifetimeItemStatus = "disponivel" | "nao_cadastrado" | "futuro";

export interface LifetimeItem {
  title: string;
  detail: string;
  status: LifetimeItemStatus;
}

// Só o Código da Reconquista está confirmado como produto disponível. A lista dos outros produtos
// digitais da linha ainda não foi definida: quando for, cada um entra aqui como "disponivel".
export const LIFETIME_ITEMS: LifetimeItem[] = [
  {
    title: "Código da Reconquista",
    detail: "Diagnóstico, Plano de 48 Horas, Central de Comunicação e protocolo de 21 dias.",
    status: "disponivel",
  },
  {
    title: "Outros produtos digitais da linha",
    detail: "Serão listados aqui assim que forem cadastrados no app.",
    status: "nao_cadastrado",
  },
  {
    title: "Atualizações do Código da Reconquista",
    detail: "Nenhuma atualização publicada ainda. As próximas aparecem aqui.",
    status: "futuro",
  },
];

/** Links e dados operacionais. Vazio = o botão não aparece (nada inventado). */
export const benefitConfig = {
  conselheiro: {
    whatsapp: digits(env("VITE_CONSELHEIRO_WHATSAPP")),
    /** Horários e condições do atendimento, em texto livre. Vazio = o card avisa que serão informados. */
    hours: env("VITE_CONSELHEIRO_HORARIOS"),
    checkoutUrl: httpsUrl(env("VITE_CONSELHEIRO_CHECKOUT_URL")),
  },
  circulo: {
    /** Link de entrada. Deve exigir aprovação na entrada (vai no código do app, que é público). */
    url: httpsUrl(env("VITE_CIRCULO_URL")),
    checkoutUrl: httpsUrl(env("VITE_CIRCULO_CHECKOUT_URL")),
  },
  vitalicio: {
    checkoutUrl: httpsUrl(env("VITE_VITALICIO_CHECKOUT_URL")),
  },
};

/** Conversa com o Conselheiro: só o e-mail da compra, para identificar a cliente. */
export function counselorLink(phone: string, email: string) {
  if (!phone) return "";
  const message = [
    "Olá! Sou cliente do Conselheiro da Reconquista.",
    email ? `Meu e-mail de acesso é ${email}.` : "",
  ]
    .filter(Boolean)
    .join(" ");
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
