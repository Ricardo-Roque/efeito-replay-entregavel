// Atalhos para as ferramentas do app, usados pelo plano de 21 dias e pelos cenários. Só destinos
// que já existem. Quem resolve o destino é ReconquistaApp (openLink); aqui fica só o dado.

import type { CommCategoryId, ReplySituationId } from "@/lib/comunicacao/types";
import type { ScenarioId } from "@/lib/scenarios";

/** Seções das Regras de ouro (mesmos valores de RulesSection, em components/tools/rules-panel). */
export type RulesAnchor = "errors" | "never" | "relapse" | "signals";

export type AppLink =
  | { kind: "pause" }
  | { kind: "diary" }
  | { kind: "rules"; section?: RulesAnchor }
  /** Central de Comunicação, opcionalmente já filtrada. */
  | { kind: "central"; category?: CommCategoryId }
  /** Um conteúdo da Central (id de lib/comunicacao/library.ts). */
  | { kind: "message"; id: string }
  /** "Ele respondeu. E agora?", opcionalmente numa situação. */
  | { kind: "reply"; situation?: ReplySituationId }
  /** Sem id: o cenário dela (perfil, depois o sugerido pelo diagnóstico). */
  | { kind: "scenario"; id?: ScenarioId }
  | { kind: "day"; day: number }
  | { kind: "map" }
  | { kind: "diagnosis" };

const rulesLabel: Record<RulesAnchor, string> = {
  errors: "Os 3 erros que afastam",
  never: "O que nunca enviar",
  relapse: "Como não voltar ao padrão",
  signals: "Sinais de abertura e de alerta",
};

/** Texto padrão do botão. Quem usa o link pode trocar por um texto próprio (`label`). */
export function linkLabel(link: AppLink): string {
  switch (link.kind) {
    case "pause":
      return "Pausa antes de enviar";
    case "diary":
      return "Meu diário";
    case "rules":
      return link.section ? rulesLabel[link.section] : "Regras de ouro";
    case "central":
      return "Central de Comunicação";
    case "message":
      return "Ver na Central";
    case "reply":
      return "Ele respondeu. E agora?";
    case "scenario":
      return link.id ? "Abrir o cenário" : "Meu cenário";
    case "day":
      return `Dia ${link.day} do plano`;
    case "map":
      return "Meu Mapa de Reconquista";
    case "diagnosis":
      return "Fazer meu diagnóstico";
  }
}

/** Link com texto próprio. */
export interface LabeledLink {
  link: AppLink;
  label?: string;
}
