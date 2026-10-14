import { describe, expect, it } from "vitest";

import { commCategories, commMessages } from "@/lib/comunicacao/library";
import {
  EMPTY_FILTERS,
  availabilityNote,
  availabilityOf,
  canSend,
  contextOf,
  countByCategory,
  filterMessages,
  highlightsFor,
  matchesQuery,
  messageById,
  relatedOf,
  stanceNotice,
} from "@/lib/comunicacao/rules";
import type { CommContext, CommStance } from "@/lib/comunicacao/types";
import { contactModeOf, diagnosisQuestions } from "@/lib/jornada/diagnosis";
import { centralTemplates, templatesFor, vslTechniques } from "@/lib/jornada/messages";
import { EMPTY_JORNADA, jornadaKey, parseJornada } from "@/lib/jornada/persist";
import type { DiagnosisAnswers, JornadaData } from "@/lib/jornada/types";
import { scenarios, type ScenarioId } from "@/lib/scenarios";

const base: DiagnosisAnswers = {
  elapsed: "m1a3",
  contact: "normal",
  reason: "distanciamento",
  otherPerson: "nao",
  tried: ["nada"],
  difficulty: "o_que_dizer",
};

const ctxOf = (answers: Partial<DiagnosisAnswers> | null, profile: ScenarioId | null = null) =>
  contextOf(answers ? { ...base, ...answers } : null, null, profile);

const sendable = (ctx: CommContext) =>
  commMessages.filter((item) => canSend(availabilityOf(item, ctx)));

describe("biblioteca", () => {
  it("tem entre 30 e 40 conteúdos, com ids únicos e todas as categorias preenchidas", () => {
    expect(commMessages.length).toBeGreaterThanOrEqual(30);
    expect(commMessages.length).toBeLessThanOrEqual(40);
    expect(new Set(commMessages.map((item) => item.id)).size).toBe(commMessages.length);
    expect(commCategories).toHaveLength(10);
    const counts = countByCategory();
    for (const category of commCategories) expect(counts[category.id]).toBeGreaterThan(0);
  });

  it("todo conteúdo tem os campos editoriais completos", () => {
    for (const item of commMessages) {
      for (const field of [
        item.title,
        item.goal,
        item.context,
        item.text,
        item.whyTone,
        item.limits,
      ])
        expect(field.trim().length, `${item.id}`).toBeGreaterThan(0);
      for (const field of [item.whenToUse, item.whenToAvoid, item.ifReply, item.ifNoReply])
        expect(field.length, `${item.id}`).toBeGreaterThan(0);
      expect(item.keywords.length, item.id).toBeGreaterThan(0);
      expect(item.origin).toBe("exemplo_novo");
      expect(item.status).not.toBe("aguardando_material");
    }
  });

  it("textos não se repetem (sem variações da mesma frase)", () => {
    const texts = commMessages.map((item) => item.text.toLowerCase());
    expect(new Set(texts).size).toBe(texts.length);
  });

  it("reflexões e exemplos a evitar nunca são copiáveis; exemplos a evitar indicam alternativa", () => {
    for (const item of commMessages.filter((m) => m.kind !== "modelo"))
      expect(item.copyable, item.id).toBe(false);
    for (const item of commMessages.filter((m) => m.kind === "evitar")) {
      expect(item.alternative, item.id).toBeDefined();
      expect(messageById(item.alternative!)!.kind).not.toBe("evitar");
    }
  });

  it("relacionados e alternativas apontam para conteúdos que existem", () => {
    for (const item of commMessages)
      for (const id of [...(item.related ?? []), ...(item.alternative ? [item.alternative] : [])])
        expect(messageById(id), `${item.id} -> ${id}`).toBeDefined();
    expect(relatedOf(messageById("evit-textao")!).map((m) => m.id)).toEqual(["semresp-carta"]);
  });

  it("não reproduz as técnicas da VSL nem promete efeito comprovado", () => {
    const forbidden = [
      /tr[eê]s palavras/i,
      /pensando aqui/i,
      /replay/i,
      /buraco negro/i,
      /frase n[uú]mero/i,
      /cient[ií]fic/i,
      /comprovad/i,
      /neuroci[eê]ncia/i,
      /psicol[oó]gica/i,
      /garant(e|ido|ia)\b(?![^.]*n[ãa]o)/i,
    ];
    for (const item of commMessages) {
      const all = [item.title, item.goal, item.context, item.text, item.whyTone].join(" ");
      for (const pattern of forbidden) expect(all, `${item.id} ${pattern}`).not.toMatch(pattern);
    }
    expect(vslTechniques.every((t) => t.status === "aguardando_material")).toBe(true);
  });
});

describe("momento dela (contextOf)", () => {
  it("segue o caminho das 48 horas", () => {
    expect(ctxOf({}).stance).toBe("conversa");
    expect(ctxOf({ contact: "bloqueou" }).stance).toBe("limite");
    expect(ctxOf({ contact: "pediu_sem_contato" }).stance).toBe("limite");
    expect(ctxOf({ otherPerson: "sim" }).stance).toBe("limite");
    expect(ctxOf({ contact: "pediu_tempo" }).stance).toBe("pausa");
    expect(ctxOf({ contact: "nao_responde" }).stance).toBe("espaco");
    expect(ctxOf({ contact: "frio", tried: ["mensagens", "nova_chance"] }).stance).toBe("espaco");
  });

  it("cenário de limite no perfil prevalece sobre um diagnóstico de conversa", () => {
    expect(ctxOf({}, "bloqueou").stance).toBe("limite");
    expect(ctxOf({}, "outra").stance).toBe("limite");
    expect(ctxOf({}, "frio").stance).toBe("conversa");
  });

  it("sem diagnóstico: limite se o cenário pedir, senão sem_diagnostico", () => {
    expect(ctxOf(null).stance).toBe("sem_diagnostico");
    expect(ctxOf(null, "bloqueou").stance).toBe("limite");
    expect(ctxOf(null, "outra").stance).toBe("limite");
    expect(ctxOf(null, "encontro")).toMatchObject({
      stance: "sem_diagnostico",
      focus: ["convites", "reencontro"],
    });
  });

  it("o foco acompanha as respostas", () => {
    expect(ctxOf({ reason: "traicao", contact: "frio" }).focus[0]).toBe("frio");
    expect(ctxOf({ reason: "traicao", contact: "frio" }).focus).toContain("confianca");
    expect(ctxOf({ reason: "discussoes" }).focus).toContain("ressentimento");
    expect(ctxOf({ tried: ["mensagens"] }).focus).toContain("evitar");
  });
});

describe("segurança contextual", () => {
  it("com limite, nada pode ser copiado ou levado para a Pausa", () => {
    for (const ctx of [
      ctxOf({ contact: "bloqueou" }),
      ctxOf({ contact: "pediu_sem_contato" }),
      ctxOf(null, "outra"),
    ]) {
      expect(sendable(ctx)).toEqual([]);
      expect(filterMessages(ctx, { ...EMPTY_FILTERS, onlyUsable: true })).toEqual([]);
      for (const item of commMessages.filter((m) => m.kind === "modelo"))
        expect(availabilityNote(item, ctx)).toMatch(/limite/);
    }
    expect(stanceNotice("limite").title).toMatch(/não enviar nada/);
  });

  it("com pausa ou espaço, só respostas (ele escreve primeiro); nenhuma iniciativa dela", () => {
    for (const ctx of [ctxOf({ contact: "pediu_tempo" }), ctxOf({ contact: "nao_responde" })]) {
      const items = sendable(ctx);
      expect(items.length).toBeGreaterThan(0);
      for (const item of items) {
        expect(item.initiative).toBe("resposta");
        expect(availabilityOf(item, ctx)).toBe("so_resposta");
      }
    }
  });

  it("em conversa, conteúdos de outro cenário ficam como leitura", () => {
    const frio = ctxOf({ contact: "frio" }, "frio");
    expect(availabilityOf(messageById("conv-cafe")!, frio)).toBe("nao_agora");
    expect(availabilityNote(messageById("conv-cafe")!, frio)).toMatch(/outro momento/);
    expect(availabilityOf(messageById("frio-espelhar")!, frio)).toBe("recomendado");
    const encontro = ctxOf({}, "encontro");
    expect(canSend(availabilityOf(messageById("conv-cafe")!, encontro))).toBe(true);
  });

  it("reflexões e exemplos a evitar são sempre só leitura", () => {
    for (const stance of [
      "conversa",
      "sem_diagnostico",
      "pausa",
      "espaco",
      "limite",
    ] as CommStance[]) {
      const ctx: CommContext = { stance, scenario: null, focus: [] };
      for (const item of commMessages.filter((m) => m.kind !== "modelo"))
        expect(availabilityOf(item, ctx)).toBe("educativo");
    }
  });

  it("todas as combinações do diagnóstico respeitam o limite", () => {
    const optionsOf = <K extends keyof DiagnosisAnswers>(id: K) =>
      diagnosisQuestions
        .find((q) => q.id === id)!
        .options.map((o) => o.value) as DiagnosisAnswers[K][];
    const triedSets: DiagnosisAnswers["tried"][] = [
      ["nada"],
      ["mensagens", "nova_chance"],
      ["contato_zero"],
    ];
    let count = 0;
    for (const elapsed of optionsOf("elapsed"))
      for (const contact of optionsOf("contact"))
        for (const reason of optionsOf("reason"))
          for (const otherPerson of optionsOf("otherPerson"))
            for (const tried of triedSets)
              for (const difficulty of optionsOf("difficulty"))
                for (const profile of [null, ...scenarios.map((s) => s.id)]) {
                  const answers = { elapsed, contact, reason, otherPerson, tried, difficulty };
                  const ctx = contextOf(answers, null, profile);
                  count++;
                  const items = sendable(ctx);
                  const highlights = highlightsFor(ctx);
                  if (
                    contactModeOf(answers) === "sem_contato" ||
                    profile === "bloqueou" ||
                    profile === "outra"
                  ) {
                    expect(ctx.stance).toBe("limite");
                    expect(items).toHaveLength(0);
                  }
                  if (ctx.stance !== "conversa" && ctx.stance !== "sem_diagnostico") {
                    expect(items.every((m) => m.initiative === "resposta")).toBe(true);
                    // Os destaques nunca sugerem que ela comece uma conversa.
                    for (const m of highlights)
                      expect(m.kind !== "modelo" || m.initiative === "resposta").toBe(true);
                  }
                  expect(highlights.length).toBeGreaterThan(0);
                }
    expect(count).toBeGreaterThan(10_000);
  });
});

describe("busca e filtros", () => {
  const ctx = ctxOf({}, "respondeu");

  it("busca ignora acento e maiúsculas, e exige todas as palavras", () => {
    expect(matchesQuery(messageById("ress-reconhecer")!, "MAGOA")).toBe(true);
    expect(matchesQuery(messageById("conv-cafe")!, "convite café")).toBe(true);
    expect(matchesQuery(messageById("conv-cafe")!, "convite bloqueio")).toBe(false);
    expect(filterMessages(ctx, { ...EMPTY_FILTERS, query: "   " })).toHaveLength(
      commMessages.length,
    );
    expect(filterMessages(ctx, { ...EMPTY_FILTERS, query: "xyzxyz" })).toEqual([]);
    const ids = filterMessages(ctx, { ...EMPTY_FILTERS, query: "visualizou" }).map((m) => m.id);
    expect(ids).toEqual(expect.arrayContaining(["semresp-nao-enviar", "evit-cobranca"]));
  });

  it("filtra por categoria, cenário, favoritos e uso agora", () => {
    const byCategory = filterMessages(ctx, { ...EMPTY_FILTERS, category: "saudade" });
    expect(byCategory.length).toBe(countByCategory().saudade);
    expect(byCategory.every((m) => m.category === "saudade")).toBe(true);

    const byScenario = filterMessages(ctx, { ...EMPTY_FILTERS, scenario: "encontro" });
    expect(byScenario.every((m) => m.scenarios === "all" || m.scenarios.includes("encontro"))).toBe(
      true,
    );
    expect(byScenario.map((m) => m.id)).not.toContain("frio-assunto-neutro");

    const favorites = { "conv-cafe": "2026-10-14T10:00:00.000Z" };
    expect(
      filterMessages(ctx, { ...EMPTY_FILTERS, onlyFavorites: true }, favorites).map((m) => m.id),
    ).toEqual(["conv-cafe"]);

    const usable = filterMessages(ctx, { ...EMPTY_FILTERS, onlyUsable: true });
    expect(usable.length).toBeGreaterThan(0);
    expect(usable.every((m) => canSend(availabilityOf(m, ctx)))).toBe(true);
  });

  it("filtrar por outro cenário não libera nada que o momento dela não permite", () => {
    const blocked = ctxOf({ contact: "bloqueou" });
    const list = filterMessages(blocked, { ...EMPTY_FILTERS, scenario: "encontro" });
    expect(list.length).toBeGreaterThan(0);
    expect(list.every((m) => !canSend(availabilityOf(m, blocked)))).toBe(true);
  });

  it("dentro da categoria, o que serve ao momento vem primeiro", () => {
    const frio = ctxOf({ contact: "frio" }, "frio");
    const list = filterMessages(frio, { ...EMPTY_FILTERS, category: "convites" });
    const statuses = list.map((m) => availabilityOf(m, frio));
    expect(statuses.indexOf("nao_agora")).toBeGreaterThan(statuses.lastIndexOf("permitido"));
  });
});

describe("destaques", () => {
  it("em conversa, destaca conteúdos recomendados, variando a categoria", () => {
    const ctx = ctxOf({ reason: "discussoes" }, "respondeu");
    const items = highlightsFor(ctx);
    expect(items.length).toBeGreaterThan(0);
    expect(items.every((m) => availabilityOf(m, ctx) === "recomendado")).toBe(true);
    expect(new Set(items.slice(0, 2).map((m) => m.category)).size).toBe(2);
  });

  it("com limite, só reflexões e o exemplo de não contornar o limite", () => {
    const items = highlightsFor(ctxOf({ contact: "bloqueou" }));
    expect(items.map((m) => m.kind)).not.toContain("modelo");
    expect(items.map((m) => m.id)).toContain("evit-terceiros");
  });
});

describe("integração", () => {
  it("a jornada só recebe modelos copiáveis, e nada em sem_contato", () => {
    expect(templatesFor("sem_contato", "respondeu")).toEqual([]);
    expect(templatesFor("sem_contato", null)).toEqual([]);
    for (const t of centralTemplates) expect(messageById(t.id)!.kind).toBe("modelo");
    for (const t of templatesFor("pausa", "frio"))
      expect(messageById(t.id)?.initiative ?? "resposta").toBe("resposta");
  });

  it("favoritos e uso sobrevivem à leitura, sem mexer no resto da jornada", () => {
    const saved: JornadaData = {
      ...EMPTY_JORNADA,
      first48: { done: {}, checks: { "entender:x": "2026-10-14T10:00:00.000Z" } },
      messages: {
        favorites: { "conv-cafe": "2026-10-14T10:00:00.000Z", lixo: 3 as unknown as string },
        usedAt: { "perg-como-esta": "2026-10-14T11:00:00.000Z" },
      },
    };
    const back = parseJornada(JSON.stringify(saved));
    expect(back.messages.favorites).toEqual({ "conv-cafe": "2026-10-14T10:00:00.000Z" });
    expect(back.messages.usedAt).toEqual({ "perg-como-esta": "2026-10-14T11:00:00.000Z" });
    expect(back.first48.checks).toEqual(saved.first48.checks);
    expect(jornadaKey("a@b.com")).toBe("codigo-reconquista:jornada:v1:a@b.com");
  });
});
