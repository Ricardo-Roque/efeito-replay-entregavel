// Ponte entre a jornada (diagnóstico e 48 horas) e a Central de Comunicação. RASCUNHO de conteúdo.
//
// O conteúdo da Central mora em lib/comunicacao (dados em library.ts, regras em rules.ts). Aqui
// ficam: os modelos expostos no formato MessageTemplate (usados pelo Meu Plano de 48 Horas) e as
// técnicas citadas na VSL. O assistente "Ele respondeu. E agora?" mora em lib/comunicacao/reply.ts.
// As técnicas ficam "aguardando_material" até recebermos o texto que as define: nenhum texto foi
// inventado para elas (docs/pendencias-central-comunicacao.md).
//
// Segurança: no modo "sem_contato" não sai nenhum modelo.

import { commMessages } from "@/lib/comunicacao/library";
import type { ScenarioId } from "@/lib/scenarios";
import type { ContactMode, MessageTemplate, VslTechnique } from "@/lib/jornada/types";

export const vslTechniques: VslTechnique[] = [
  {
    id: "tres_palavras",
    vslName: "Mensagem de três palavras",
    status: "aguardando_material",
    note: "Falta o texto e o contexto de uso definidos no material do produto.",
  },
  {
    id: "comeca_com_h",
    vslName: "Mensagem que começa com H",
    status: "aguardando_material",
    note: "Falta o texto e o contexto de uso definidos no material do produto.",
  },
  {
    id: "pensando_aqui",
    vslName: 'Mensagem "pensando aqui"',
    status: "aguardando_material",
    note: "Falta o texto e o contexto de uso definidos no material do produto.",
  },
  {
    id: "frase_3",
    vslName: "Frase número 3",
    status: "aguardando_material",
    note: "Falta o texto e em que lista ela é a número 3.",
  },
  {
    id: "frase_replay",
    vslName: "Frase do Replay",
    status: "aguardando_material",
    note: "Falta o texto e o contexto de uso definidos no material do produto.",
  },
  {
    id: "buraco_negro",
    vslName: "Técnica do buraco negro emocional",
    status: "aguardando_material",
    note: "Falta a definição. Se envolver manipular sentimentos dele, não entra no app.",
  },
];

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
