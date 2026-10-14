import { describe, expect, it } from "vitest";

import type { AppLink, LabeledLink } from "@/lib/app-link";
import { commCategories } from "@/lib/comunicacao/library";
import { replySituations } from "@/lib/comunicacao/reply";
import { fitsScenario, messageById } from "@/lib/comunicacao/rules";
import { diagnosisQuestions } from "@/lib/jornada/diagnosis";
import { EMPTY_JORNADA, parseJornada, planToggleCheck } from "@/lib/jornada/persist";
import type { DiagnosisAnswers, JornadaData } from "@/lib/jornada/types";
import { MILESTONES, planDays, planPhases, type PlanDay, type PlanGuideKey } from "@/lib/plan";
import { guideKeysOf, isContactLink, resolveDay, type ResolvedDay } from "@/lib/plan-guide";
import { dayState } from "@/lib/progress";
import { scenarios, type ScenarioId } from "@/lib/scenarios";
import type { AppData } from "@/lib/store";

const base: DiagnosisAnswers = {
  elapsed: "m1a3",
  contact: "normal",
  reason: "distanciamento",
  otherPerson: "nao",
  tried: ["nada"],
  difficulty: "o_que_dizer",
};

const personas = {
  aberto: base,
  semResposta: { ...base, contact: "nao_responde" },
  pediuTempo: { ...base, contact: "pediu_tempo" },
  bloqueada: { ...base, contact: "bloqueou" },
  pediuSemContato: { ...base, contact: "pediu_sem_contato" },
  outraRelacao: { ...base, otherPerson: "sim" },
  traicao: { ...base, reason: "traicao" },
  traicaoBloqueada: { ...base, reason: "traicao", contact: "bloqueou" },
  recente: { ...base, elapsed: "menos7d" },
} satisfies Record<string, DiagnosisAnswers>;

const day = (n: number) => planDays[n - 1]!;

const GUIDE_KEYS: PlanGuideKey[] = [
  "conversa",
  "espaco",
  "pausa",
  "limite",
  "bloqueio",
  "outra",
  "sem_diagnostico",
];

/** Todas as combinações do diagnóstico (as mesmas 22.050 dos testes das 48 horas). */
function allAnswers(): DiagnosisAnswers[] {
  const optionsOf = <K extends keyof DiagnosisAnswers>(id: K) =>
    diagnosisQuestions.find((q) => q.id === id)!.options.map((o) => o.value) as never[];
  const triedSets: DiagnosisAnswers["tried"][] = [
    ["nada"],
    ["mensagens"],
    ["contato_zero"],
    ["mensagens", "nova_chance", "pessoalmente"],
    ["desculpas", "contato_zero"],
  ];
  const combos: DiagnosisAnswers[] = [];
  for (const elapsed of optionsOf("elapsed"))
    for (const contact of optionsOf("contact"))
      for (const reason of optionsOf("reason"))
        for (const otherPerson of optionsOf("otherPerson"))
          for (const difficulty of optionsOf("difficulty"))
            for (const tried of triedSets)
              combos.push({ elapsed, contact, reason, otherPerson, difficulty, tried });
  return combos;
}

const PROFILES: (ScenarioId | null)[] = [null, ...scenarios.map((s) => s.id)];

/**
 * Situações distintas para o plano: a resolução só depende das variantes escolhidas, da
 * confiança e do tempo do término. Reduz 22.050 × 7 combinações a poucas dezenas.
 */
function distinctSituations() {
  const seen = new Map<string, { answers: DiagnosisAnswers | null; profile: ScenarioId | null }>();
  const add = (answers: DiagnosisAnswers | null, profile: ScenarioId | null) => {
    const { keys } = guideKeysOf(answers, profile);
    const trust = answers?.reason === "traicao" || answers?.reason === "quebra_confianca";
    const key = `${keys.join(",")}|${trust}|${answers?.elapsed === "menos7d"}`;
    if (!seen.has(key)) seen.set(key, { answers, profile });
  };
  for (const profile of PROFILES) {
    add(null, profile);
    for (const answers of allAnswers()) add(answers, profile);
  }
  return [...seen.values()];
}

const actionable = (r: ResolvedDay) => [
  r.action,
  ...r.practice,
  ...r.checklist.map((c) => c.text),
  ...r.exercise.steps,
  ...(r.exercise.prompts ?? []),
];

/** Instrução para escrever, convidar ou mandar algo para ele (não pega "não enviar", "nada sai"). */
const SEND = /(?<!não |nunca )\b(envie|mande|convide|enviar uma vez|antes de enviar|envia hoje)\b/i;
/** Com limite, também nenhuma instrução de responder a ele. */
const REPLY = /\bresponda (curto|com|no seu|só)\b/i;

const allLinks = (d: PlanDay): LabeledLink[] => [
  ...d.tools,
  ...GUIDE_KEYS.flatMap((key) => d.guide[key]?.tools ?? []),
  ...[d.guide.confianca?.link, d.guide.recente?.link].filter((l): l is LabeledLink => !!l),
];

function checkLink(link: AppLink, where: string) {
  const categories = commCategories.map((c) => c.id);
  if (link.kind === "message") expect(messageById(link.id), where).toBeDefined();
  if (link.kind === "central" && link.category) expect(categories, where).toContain(link.category);
  if (link.kind === "reply" && link.situation)
    expect(
      replySituations.map((s) => s.id),
      where,
    ).toContain(link.situation);
  if (link.kind === "scenario" && link.id)
    expect(
      scenarios.map((s) => s.id),
      where,
    ).toContain(link.id);
  if (link.kind === "day") expect(link.day >= 1 && link.day <= 21, where).toBe(true);
}

describe("estrutura do plano", () => {
  it("preserva as quatro fases, os 21 dias e os marcos", () => {
    expect(planPhases.map((p) => [p.first, p.last])).toEqual([
      [1, 7],
      [8, 13],
      [14, 18],
      [19, 21],
    ]);
    expect(planDays.map((d) => d.day)).toEqual(Array.from({ length: 21 }, (_, i) => i + 1));
    for (const d of planDays) {
      const phase = planPhases.find((p) => d.day >= p.first && d.day <= p.last)!;
      expect(d.phase).toBe(phase.phase);
    }
    expect(MILESTONES.map((m) => m.day)).toEqual([7, 14, 21]);
  });

  it("todo dia tem as nove partes da lição", () => {
    for (const d of planDays) {
      const where = `dia ${d.day}`;
      expect(d.goal, where).toBeTruthy();
      expect(d.concept.length, where).toBeGreaterThanOrEqual(2);
      expect(d.example.situation && d.example.takeaway, where).toBeTruthy();
      expect(d.practice.length, where).toBeGreaterThanOrEqual(3);
      expect(d.avoid.length, where).toBeGreaterThanOrEqual(3);
      expect(d.action, where).toBeTruthy();
      expect(d.exercise.steps.length, where).toBeGreaterThanOrEqual(1);
      expect(d.checklist.length, where).toBeGreaterThanOrEqual(3);
      expect(d.tools.length, where).toBeGreaterThanOrEqual(2);
      for (const key of ["conversa", "espaco", "pausa", "limite"] as const)
        expect(d.guide[key].text.length, `${where} ${key}`).toBeGreaterThan(0);
      expect(d.minutes, where).toBeGreaterThanOrEqual(3);
      expect(d.minutes, where).toBeLessThanOrEqual(7);
    }
  });

  it("leitura cabe no tempo indicado (cerca de 200 palavras por minuto)", () => {
    for (const d of planDays) {
      const r = resolveDay(d, base, null);
      const text = [
        d.goal,
        ...d.concept,
        ...(d.points ?? []).flatMap((p) => [p.title, p.text]),
        d.example.situation,
        d.example.takeaway,
        ...r.text,
        ...r.practice,
        ...d.avoid,
        r.action,
        ...r.exercise.steps,
        ...r.checklist.map((c) => c.text),
      ].join(" ");
      const words = text.split(/\s+/).length;
      expect(words / 200, `dia ${d.day}: ${words} palavras`).toBeLessThanOrEqual(7);
      expect(words, `dia ${d.day}`).toBeGreaterThanOrEqual(300);
    }
  });

  it("ids do checklist são estáveis, do próprio dia e sem repetição", () => {
    const owner = new Map<string, number>();
    for (const d of planDays) {
      const variants = [d.checklist, ...GUIDE_KEYS.map((key) => d.guide[key]?.checklist)];
      for (const list of variants) {
        if (!list) continue;
        const ids = list.map((c) => c.id);
        expect(new Set(ids).size, `dia ${d.day}`).toBe(ids.length);
        for (const id of ids) {
          expect(id.startsWith(`d${d.day}-`), id).toBe(true);
          expect(owner.get(id) ?? d.day, id).toBe(d.day);
          owner.set(id, d.day);
        }
      }
    }
  });

  it("atalhos e comparações apontam para conteúdos que existem", () => {
    for (const d of planDays) {
      for (const { link } of allLinks(d)) checkLink(link, `dia ${d.day}`);
      for (const id of d.compare ?? []) {
        const message = messageById(id);
        expect(message?.kind, id).toBe("evitar");
        expect(messageById(message!.alternative!), id).toBeDefined();
      }
    }
  });

  it("integra cada tema com a ferramenta correspondente", () => {
    const kinds = (n: number) => day(n).tools.map((t) => t.link);
    expect(kinds(2)[0]).toEqual({ kind: "pause" });
    expect(kinds(5)).toContainEqual({ kind: "pause" });
    expect(kinds(13)).toContainEqual({ kind: "reply" });
    expect(kinds(12)).toContainEqual({ kind: "reply", situation: "visualizou" });
    for (const n of [8, 9, 10, 11]) expect(kinds(n).some((l) => l.kind === "central")).toBe(true);
    for (const n of [1, 7, 18, 21]) expect(kinds(n)).toContainEqual({ kind: "diary" });
    expect(kinds(19)).toContainEqual({ kind: "scenario", id: "encontro" });
  });
});

describe("personalização", () => {
  it("Dia 11 muda conforme o diagnóstico", () => {
    const d11 = day(11);
    const aberto = resolveDay(d11, personas.aberto, null);
    expect(aberto.key).toBe("conversa");
    expect(aberto.checklist.map((c) => c.id)).toContain("d11-pausa");
    expect(aberto.tools).toContainEqual(
      expect.objectContaining({ link: { kind: "central", category: "primeiro_contato" } }),
    );

    const bloqueio = resolveDay(d11, personas.bloqueada, null);
    expect(bloqueio.key).toBe("bloqueio");
    expect(bloqueio.checklist.map((c) => c.id)).toContain("d11-carta");
    expect(bloqueio.text.join(" ")).toMatch(/nenhum caminho/);

    const pedido = resolveDay(d11, personas.pediuSemContato, null);
    expect(pedido.key).toBe("limite");
    expect(pedido.exercise.title).toBe("Carta sem envio");

    const outra = resolveDay(d11, personas.outraRelacao, null);
    expect(outra.key).toBe("outra");
    expect(outra.checklist.map((c) => c.id)).toContain("d11-nao-interferir");

    expect(resolveDay(d11, personas.pediuTempo, null).key).toBe("pausa");
    expect(resolveDay(d11, personas.semResposta, null).key).toBe("espaco");
    expect(resolveDay(d11, null, null).key).toBe("sem_diagnostico");
  });

  it("traição só traz a reflexão de confiança quando há conversa", () => {
    const d11 = day(11);
    const conversa = resolveDay(d11, personas.traicao, null);
    expect(conversa.notes.map((n) => n.text).join(" ")).toMatch(/confiança/);
    expect(resolveDay(d11, personas.traicaoBloqueada, null).notes).toEqual([]);
    expect(resolveDay(day(8), personas.traicaoBloqueada, null).notes.length).toBe(1);
  });

  it("término recente traz a observação nos dias que a têm", () => {
    expect(resolveDay(day(11), personas.recente, null).notes.length).toBe(1);
    expect(resolveDay(day(9), personas.recente, null).notes).toEqual([]);
  });

  it("o cenário do perfil só deixa o momento mais restrito", () => {
    expect(resolveDay(day(11), null, "bloqueou").key).toBe("bloqueio");
    expect(resolveDay(day(11), null, "outra").key).toBe("outra");
    expect(resolveDay(day(11), personas.aberto, "bloqueou").key).toBe("bloqueio");
    expect(resolveDay(day(11), personas.bloqueada, "respondeu").key).toBe("bloqueio");
    // Sem variante própria, bloqueio e outra usam a de limite.
    expect(resolveDay(day(1), personas.bloqueada, null).key).toBe("limite");
  });

  it("em todas as situações: sem envio fora da conversa, sem resposta com limite", () => {
    const situations = distinctSituations();
    expect(situations.length).toBeGreaterThan(10);
    for (const { answers, profile } of situations)
      for (const d of planDays) {
        const r = resolveDay(d, answers, profile);
        const where = `dia ${d.day} · ${r.key} · ${profile ?? "sem perfil"}`;
        expect(r.text.length + r.action.length, where).toBeGreaterThan(0);
        if (r.stance !== "conversa")
          for (const text of actionable(r)) expect(text, where).not.toMatch(SEND);
        if (r.stance === "limite") {
          for (const text of actionable(r)) expect(text, where).not.toMatch(REPLY);
          for (const tool of r.tools) expect(isContactLink(tool), where).toBe(false);
          expect(r.example.situation, where).not.toMatch(/\b(envia|envie|manda|mande|convite)\b/i);
        }
        // Nenhuma tarefa depende de ele fazer algo.
        for (const item of r.checklist)
          expect(item.text, where).not.toMatch(/\bele (responder|responda|aceitar|aceite)\b/i);
        expect(new Set(r.checklist.map((c) => c.id)).size, where).toBe(r.checklist.length);
      }
  });

  it("toda situação tem uma orientação do seu tipo", () => {
    const keys = new Set<PlanGuideKey>();
    for (const { answers, profile } of distinctSituations())
      for (const d of planDays) keys.add(resolveDay(d, answers, profile).key);
    expect([...keys].sort()).toEqual(
      ["bloqueio", "conversa", "espaco", "limite", "outra", "pausa", "sem_diagnostico"].sort(),
    );
  });
});

describe("progresso e checklist", () => {
  it("progresso antigo continua igual (dias concluídos na chave principal)", () => {
    const old: AppData = {
      profile: null,
      completed: { 1: "2026-10-01T10:00:00.000Z", 2: "2026-10-02T10:00:00.000Z" },
      journal: [],
    };
    const now = new Date("2026-10-14T12:00:00");
    expect(dayState(old, 1, { now })).toBe("done");
    expect(dayState(old, 2, { now })).toBe("done");
    expect(dayState(old, 3, { now })).toBe("open");
    expect(dayState(old, 4, { now })).toBe("locked");
    expect(dayState(old, 21, { now, allDays: true })).toBe("open");
  });

  it("checklist grava, sobrevive à leitura e não mexe no resto da jornada", () => {
    const at = "2026-10-14T10:00:00.000Z";
    const before: JornadaData = {
      ...EMPTY_JORNADA,
      messages: { favorites: { "conv-cafe": at }, usedAt: {} },
    };
    const marked = planToggleCheck(planToggleCheck(before, "d11-pausa", at), "d2-respirar", at);
    const back = parseJornada(JSON.stringify(marked));
    expect(back.plan?.checks).toEqual({ "d11-pausa": at, "d2-respirar": at });
    expect(back.messages).toEqual(before.messages);
    expect(back.first48).toEqual(before.first48);
    const unmarked = planToggleCheck(back, "d11-pausa", at);
    expect(unmarked.plan?.checks).toEqual({ "d2-respirar": at });
  });

  it("dados antigos ou corrompidos não quebram a leitura", () => {
    expect(parseJornada(JSON.stringify({ ...EMPTY_JORNADA })).plan).toBeUndefined();
    const broken = { ...EMPTY_JORNADA, plan: { checks: { "d1-diario": 3, ok: "x" } } };
    expect(parseJornada(JSON.stringify(broken)).plan?.checks).toEqual({ ok: "x" });
    expect(parseJornada(JSON.stringify({ ...EMPTY_JORNADA, plan: "x" })).plan).toBeUndefined();
  });
});

describe("cenários", () => {
  it("preserva os seis cenários, com todas as seções", () => {
    expect(scenarios.map((s) => s.id)).toEqual([
      "bloqueou",
      "frio",
      "outra",
      "desinteresse",
      "respondeu",
      "encontro",
    ]);
    for (const s of scenarios) {
      expect(s.understand.length, s.id).toBeGreaterThanOrEqual(2);
      expect(s.challenges.length, s.id).toBeGreaterThanOrEqual(3);
      expect(s.do.length, s.id).toBeGreaterThanOrEqual(3);
      expect(s.avoid.length, s.id).toBeGreaterThanOrEqual(3);
      for (const point of [...s.do, ...s.avoid]) expect(point.why, s.id).toBeTruthy();
      expect(s.examples.length, s.id).toBeGreaterThanOrEqual(2);
      expect(s.openSignals.length && s.limitSignals.length, s.id).toBeGreaterThan(0);
      expect(s.next.length, s.id).toBeGreaterThanOrEqual(2);
      expect(s.links.length, s.id).toBeGreaterThanOrEqual(2);
      expect(s.stop, s.id).toBeTruthy();
      for (const { link } of s.links) checkLink(link, s.id);
      for (const d of s.days) expect(d >= 1 && d <= 21, s.id).toBe(true);
    }
  });

  it("mensagens vêm da Central, servem ao cenário e nunca aparecem nos cenários de limite", () => {
    for (const s of scenarios) {
      for (const id of s.messages) {
        const message = messageById(id);
        expect(message, `${s.id}: ${id}`).toBeDefined();
        expect(message!.kind, id).not.toBe("evitar");
        expect(fitsScenario(message!, s.id), `${s.id}: ${id}`).toBe(true);
      }
      if (s.safety) {
        expect(s.messages, s.id).toEqual([]);
        expect(s.noMessages, s.id).toBeTruthy();
      } else expect(s.messages.length, s.id).toBeGreaterThan(0);
    }
  });
});

describe("linguagem", () => {
  const texts = [
    ...planDays.flatMap((d) => [
      d.title,
      d.goal,
      ...d.concept,
      ...(d.points ?? []).flatMap((p) => [p.title, p.text]),
      d.example.situation,
      d.example.takeaway,
      d.example.contrast?.better ?? "",
      ...d.practice,
      ...d.avoid,
      d.action,
      ...GUIDE_KEYS.flatMap((key) => {
        const variant = d.guide[key];
        return variant ? [...variant.text, ...(variant.practice ?? []), variant.action ?? ""] : [];
      }),
      d.guide.confianca?.text ?? "",
      d.guide.recente?.text ?? "",
    ]),
    ...scenarios.flatMap((s) => [
      s.description,
      ...s.understand,
      ...s.challenges,
      ...s.do.flatMap((p) => [p.text, p.why]),
      ...s.avoid.flatMap((p) => [p.text, p.why]),
      ...s.examples.flatMap((e) => [e.situation, e.better]),
      ...s.openSignals,
      ...s.limitSignals,
      ...s.next,
      s.stop,
    ]),
  ] as string[];

  it("sem promessa, sem pseudociência e sem manipulação", () => {
    const forbidden =
      /com certeza|ele vai voltar|(?<!não )garant|comprovad|cientific|estudos mostram|neuro|dopamina|cortisol|infalível|100%|técnica secreta|fazer ele sentir/i;
    for (const text of texts) expect(text).not.toMatch(forbidden);
  });

  it("sem textos repetidos entre os dias", () => {
    const seen = new Map<string, number>();
    for (const d of planDays)
      for (const text of [...d.concept, d.example.situation, d.example.takeaway, d.goal]) {
        expect(seen.get(text) ?? d.day, text).toBe(d.day);
        seen.set(text, d.day);
      }
  });
});
