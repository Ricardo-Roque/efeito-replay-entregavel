import { describe, expect, it } from "vitest";

import { contextOf } from "@/lib/comunicacao/rules";
import { ACTIVITY_ORDER } from "@/lib/jornada/first48";
import { EMPTY_JORNADA } from "@/lib/jornada/persist";
import type { DiagnosisAnswers, JornadaData } from "@/lib/jornada/types";
import { progressSummary } from "@/lib/progress-summary";
import {
  audioSessions,
  forgivenessLessons,
  journeySteps,
  modules,
  nightScript,
  sayAvoidCategories,
} from "@/lib/reset/content";
import {
  buildMap,
  buildTrustMap,
  questions,
  type Answers,
  type Behavior,
  type Cause,
  type Contact,
  type Difficulty,
  type Elapsed,
  type Goal,
} from "@/lib/reset/diagnosis";
import type { AppData, JournalEntry } from "@/lib/store";

const NOW = new Date("2026-10-14T12:00:00");
const iso = (daysAgo: number) => new Date(NOW.getTime() - daysAgo * 86_400_000).toISOString();

let seq = 0;
const entry = (partial: Partial<JournalEntry> & Pick<JournalEntry, "type">): JournalEntry => ({
  id: `e${(seq += 1)}`,
  at: iso(1),
  ...partial,
});

const app = (partial: Partial<AppData> = {}): AppData => ({
  profile: { name: "Ana", scenario: null, startedAt: iso(30) },
  completed: {},
  journal: [],
  ...partial,
});

const answers: DiagnosisAnswers = {
  elapsed: "m1a3",
  contact: "normal",
  reason: "distanciamento",
  otherPerson: "nao",
  tried: ["nada"],
  difficulty: "o_que_dizer",
};

const withDiagnosis = (data: JornadaData = EMPTY_JORNADA): JornadaData => ({
  ...data,
  diagnoses: [{ id: "d1", at: iso(10), version: 2, answers }],
});

// Promessa de resultado ou alegação sem fonte não pode aparecer em nada que a cliente lê.
const FORBIDDEN =
  /\b(com certeza|garant\w*|ele vai voltar|vai voltar|comprovad\w*|cient[ií]fic\w*|subconsciente dele|reativa o c[ée]rebro)\b/i;

describe("Meu progresso", () => {
  it("conta vazia: nada alcançado e nenhum erro", () => {
    const summary = progressSummary(app(), EMPTY_JORNADA, NOW);
    expect(summary.diagnosis.done).toBe(false);
    expect(summary.first48.done).toBe(0);
    expect(summary.plan.done).toBe(0);
    expect(summary.tools.every((tool) => tool.count === 0)).toBe(true);
    // O único marco possível sem nada feito é a sequência sem impulso (30 dias desde o início).
    expect(summary.milestones.filter((item) => item.achieved).map((item) => item.id)).toEqual([
      "impulso",
    ]);
  });

  it("diagnóstico, 48 horas e plano aparecem com datas", () => {
    const jornada = withDiagnosis({
      ...EMPTY_JORNADA,
      first48: {
        checks: {},
        done: Object.fromEntries(
          ACTIVITY_ORDER.map((id, i) => [id, { at: iso(9 - i), diagnosisId: "d1" }]),
        ),
      },
    });
    const completed = Object.fromEntries(
      Array.from({ length: 8 }, (_, i) => [i + 1, iso(8 - i)]),
    ) as Record<number, string>;
    const summary = progressSummary(app({ completed }), jornada, NOW);
    expect(summary.diagnosis).toMatchObject({ done: true, count: 1 });
    expect(summary.first48.complete).toBe(true);
    expect(summary.first48.completedAt).toBe(iso(5));
    expect(summary.plan.done).toBe(8);
    expect(summary.plan.phases[0]).toMatchObject({ done: 7, total: 7 });
    expect(summary.plan.phases[1]).toMatchObject({ done: 1, total: 6 });
    const reached = summary.milestones.filter((item) => item.achieved).map((item) => item.id);
    expect(reached).toEqual(expect.arrayContaining(["diagnostico", "first48", "dia1", "dia7"]));
    expect(reached).not.toContain("dia14");
  });

  it("registros antigos, sem origem, continuam contando", () => {
    const journal = [
      entry({ type: "held" }),
      entry({ type: "held" }),
      entry({ type: "draft", text: "oi", readyAt: iso(0) }),
      entry({ type: "note", text: "antiga" }),
      entry({ type: "note", source: "nao_enviar", text: "Mensagem que eu não enviei: oi" }),
      entry({ type: "note", source: "cenario", text: "Mudei o meu cenário" }),
      entry({ type: "contact" }),
      entry({ type: "acted", at: iso(2) }),
    ];
    const summary = progressSummary(app({ journal }), EMPTY_JORNADA, NOW);
    const count = (id: string) => summary.tools.find((tool) => tool.id === id)?.count;
    expect(count("held")).toBe(2);
    expect(count("not_sent")).toBe(2);
    // A mudança de cenário é registro de progresso, não reflexão.
    expect(count("notes")).toBe(1);
    expect(count("contact")).toBe(1);
    // "Agi por impulso" há 2 dias: a sequência recomeçou, sem linguagem de falha.
    expect(summary.impulse.days).toBe(2);
    expect(summary.milestones.find((item) => item.id === "impulso")?.achieved).toBe(false);
  });

  it("nenhum marco fala em reconciliação ou promete resultado", () => {
    const summary = progressSummary(app(), EMPTY_JORNADA, NOW);
    for (const item of summary.milestones) {
      expect(`${item.title} ${item.description}`).not.toMatch(FORBIDDEN);
      expect(`${item.title} ${item.description}`).not.toMatch(/reconquist|voltou|reconcili/i);
    }
  });
});

// Todas as combinações do diagnóstico do Reset (6 × 5 × 5 × 6 × 5 × 5 = 22.500).
function* allResetAnswers(): Generator<Answers> {
  const values = <K extends keyof Answers>(id: K) =>
    questions.find((q) => q.id === id)!.options.map((o) => o.value) as Answers[K][];
  for (const cause of values("cause") as Cause[])
    for (const behavior of values("behavior") as Behavior[])
      for (const elapsed of values("elapsed") as Elapsed[])
        for (const difficulty of values("difficulty") as Difficulty[])
          for (const contact of values("contact") as Contact[])
            for (const goal of values("goal") as Goal[])
              yield { cause, behavior, elapsed, difficulty, contact, goal };
}

const CONTACT_HINT =
  /mandar uma mensagem|mensagem curta|se aproximar|dar um passo leve|antes de qualquer conversa/i;

describe("Reset: limite do app principal", () => {
  it("bloqueio no diagnóstico principal deixa o Reset em modo limite", () => {
    expect(contextOf({ ...answers, contact: "bloqueou" }, null, null).stance).toBe("limite");
    const open: Answers = {
      cause: "brigas",
      behavior: "evita_emocional",
      elapsed: "1a3m",
      difficulty: "quando",
      contact: "frequente",
      goal: "comunicacao",
    };
    expect(buildMap(open).mode).toBe("aberto");
    const limited = buildMap(open, true);
    expect(limited.mode).toBe("limite");
    expect(limited.factors.join(" ")).toMatch(/diagnóstico principal/);
    expect(buildTrustMap(open, true).nextStep).toMatch(/^Não enviar nada/);
  });

  it("com limite (do Reset ou do app), nenhuma combinação sugere contato", () => {
    let checked = 0;
    for (const a of allResetAnswers()) {
      for (const appLimit of [false, true]) {
        const map = buildMap(a, appLimit);
        if (map.mode !== "limite") continue;
        checked += 1;
        expect(map.firstStep.title).toMatch(/^Não enviar nada/);
        expect(map.firstStep.text).not.toMatch(CONTACT_HINT);
        expect(map.steps.map((step) => step.focus).join(" ")).not.toMatch(CONTACT_HINT);
        expect(map.steps[5]!.title).toBe("Respeitando o limite");
        expect(map.avoid.join(" ")).not.toMatch(/mensagens longas/);
        expect(buildTrustMap(a, appLimit).nextStep).not.toMatch(/mensagem curta|mandar/i);
      }
    }
    expect(checked).toBeGreaterThan(22_500);
  });
});

describe("Reset: conteúdo", () => {
  const texts = [
    ...modules.flatMap((m) => [m.title, m.subtitle]),
    ...forgivenessLessons.flatMap((l) => [...l.text, l.reflection]),
    ...audioSessions.flatMap((s) => [s.description, ...s.transcript, s.exercise]),
    ...nightScript,
    ...sayAvoidCategories.flatMap((c) =>
      c.cards.flatMap((card) => [card.situation, card.avoid, card.instead, card.why]),
    ),
    ...journeySteps.flatMap((step) => [step.objective, ...step.content, step.activity]),
  ];

  it("sem promessa de resultado nem alegação científica", () => {
    for (const text of texts) expect(text).not.toMatch(FORBIDDEN);
  });

  it("lições e etapas têm profundidade mínima e nenhum parágrafo repetido", () => {
    for (const lesson of forgivenessLessons) expect(lesson.text.length).toBeGreaterThanOrEqual(3);
    for (const step of journeySteps) expect(step.content.length).toBeGreaterThanOrEqual(3);
    const paragraphs = [
      ...forgivenessLessons.flatMap((l) => l.text),
      ...journeySteps.flatMap((s) => s.content),
    ];
    expect(new Set(paragraphs).size).toBe(paragraphs.length);
  });

  it("os checklists da jornada mantêm 3 itens (o progresso salvo é por posição)", () => {
    expect(journeySteps).toHaveLength(7);
    for (const step of journeySteps) expect(step.checklist).toHaveLength(3);
  });

  it("ids salvos no aparelho continuam os mesmos", () => {
    expect(forgivenessLessons.map((l) => l.id)).toEqual([
      "ressentimento",
      "confianca",
      "responsabilidade",
    ]);
    expect(audioSessions.map((s) => s.id)).toEqual(["seguranca", "defensividade", "confianca"]);
    expect(sayAvoidCategories.map((c) => c.id)).toEqual([
      "raiva",
      "distante",
      "confianca",
      "evita",
      "insistir",
      "desculpas",
    ]);
  });

  it("a pergunta do motivo deixa claro quando o erro foi dela", () => {
    const cause = questions.find((q) => q.id === "cause")!;
    const label = (value: string) => cause.options.find((o) => o.value === value)!.label;
    expect(label("traicao")).toMatch(/minha/);
    expect(label("mentira")).toMatch(/minha/);
    expect(label("outro")).toMatch(/ele fez/);
  });
});
