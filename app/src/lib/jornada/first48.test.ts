import { describe, expect, it } from "vitest";

import { diagnosisQuestions } from "@/lib/jornada/diagnosis";
import {
  ACTIVITY_ORDER,
  buildFirst48Plan,
  canComplete,
  diagnosisChange,
  first48Progress,
  pathOf,
  reviewOf,
} from "@/lib/jornada/first48";
import { templatesFor } from "@/lib/jornada/messages";
import {
  EMPTY_JORNADA,
  first48SetChoice,
  first48Start,
  first48ToggleActivity,
  first48ToggleCheck,
  parseJornada,
} from "@/lib/jornada/persist";
import type {
  DiagnosisAnswers,
  DiagnosisRecord,
  First48ChoiceId,
  First48Plan,
  JornadaData,
} from "@/lib/jornada/types";

const CONTACT_CHOICES: First48ChoiceId[] = ["responder", "puxar"];
const T0 = "2026-10-14T10:00:00.000Z";
const hoursAfter = (hours: number) => new Date(new Date(T0).getTime() + hours * 3_600_000);

let seq = 0;
const record = (answers: DiagnosisAnswers): DiagnosisRecord => ({
  id: `diag-${++seq}`,
  at: T0,
  version: 2,
  answers,
});

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
  bloqueada: { ...base, contact: "bloqueou", tried: ["mensagens", "nova_chance"] },
  pediuSemContato: { ...base, contact: "pediu_sem_contato" },
  recente: { ...base, elapsed: "menos7d", difficulty: "ansiedade" },
  traicao: { ...base, reason: "traicao", contact: "frio", difficulty: "confianca" },
  outraRelacao: { ...base, otherPerson: "sim" },
} satisfies Record<string, DiagnosisAnswers>;

const allText = (plan: First48Plan) =>
  [
    ...plan.activities.flatMap((a) => [
      ...a.blocks.flatMap((b) => [b.title, ...b.items]),
      ...a.checklist.map((c) => c.text),
    ]),
    ...plan.nextStep.choices.flatMap((c) => [c.label, c.text]),
    ...plan.exercise.prompts,
  ].join("\n");

/** Garante as regras de um caminho sem contato. */
function expectNoContact(plan: First48Plan) {
  expect(plan.nextStep.examples).toEqual([]);
  expect(plan.nextStep.criteria).toEqual([]);
  expect(plan.nextStep.choices.map((c) => c.id)).not.toEqual(
    expect.arrayContaining(CONTACT_CHOICES),
  );
  for (const choice of plan.nextStep.choices) expect(CONTACT_CHOICES).not.toContain(choice.id);
  // Nenhuma orientação de comunicação (bloco exclusivo do caminho conversa).
  expect(plan.activities.find((a) => a.id === "escolher")!.blocks.map((b) => b.id)).not.toContain(
    "orientacoes",
  );
  expect(allText(plan)).not.toMatch(/Mandar uma mensagem curta|Responder com leveza/);
}

describe("personalização por perfil", () => {
  it("contato aberto: caminho conversa, com orientações, exemplos e critérios", () => {
    const plan = buildFirst48Plan(record(personas.aberto));
    expect(plan.path).toBe("conversa");
    const choices = plan.nextStep.choices.map((c) => c.id);
    expect(choices).toEqual(expect.arrayContaining(["responder", "puxar", "esperar", "cuidar"]));
    expect(plan.nextStep.examples.length).toBeGreaterThan(0);
    expect(plan.nextStep.criteria.length).toBeGreaterThan(0);
    const allowed = templatesFor("aberto", "respondeu").map((t) => t.id);
    for (const id of plan.nextStep.examples) expect(allowed).toContain(id);
    expect(plan.activities.find((a) => a.id === "escolher")!.blocks[0]!.id).toBe("orientacoes");
    // Esperar sempre existe: escrever nunca é obrigatório.
    expect(choices).toContain("esperar");
  });

  it("bloqueada: caminho limite, sem nenhuma sugestão de contato", () => {
    const plan = buildFirst48Plan(record(personas.bloqueada));
    expect(plan.path).toBe("limite");
    expectNoContact(plan);
    expect(plan.nextStep.choices.map((c) => c.id)).toEqual(["respeitar", "diario", "cuidar"]);
    const signals = plan.activities[0]!.blocks.find((b) => b.id === "sinais")!.items;
    expect(signals).toContain("A vontade de conferir se ele desbloqueou");
    // Entender a situação mostra o limite como ponto de atenção.
    expect(plan.activities[0]!.blocks.find((b) => b.id === "atencao")!.items[0]).toMatch(
      /Respeitar o bloqueio/,
    );
    // A tentativa anterior de mensagens aparece no checklist de padrões.
    expect(plan.activities[1]!.checklist.map((c) => c.id)).toContain("interromper:sem-nova");
  });

  it("pedido de não contato: mesmo cuidado do bloqueio", () => {
    const plan = buildFirst48Plan(record(personas.pediuSemContato));
    expect(plan.path).toBe("limite");
    expectNoContact(plan);
  });

  it("término recente: sem puxar conversa, impulso em destaque e pergunta do dia", () => {
    const plan = buildFirst48Plan(record(personas.recente));
    expect(plan.path).toBe("conversa");
    expect(plan.nextStep.choices.map((c) => c.id)).not.toContain("puxar");
    expect(plan.activities[1]!.blocks[0]!.id).toBe("padrao-impulso");
    expect(plan.exercise.prompts).toContain("Do que você precisa hoje para atravessar o dia?");
  });

  it("traição: exemplos e critérios sobre confiança, sem pedido de perdão", () => {
    const plan = buildFirst48Plan(record(personas.traicao));
    expect(plan.path).toBe("conversa");
    expect(plan.nextStep.examples[0]).toBe("conf-coerencia");
    expect(plan.nextStep.criteria).toContain("Você não está pedindo perdão nem explicação agora");
    expect(plan.exercise.prompts.join(" ")).toMatch(/segura de novo/);
    const guidance = plan.activities.find((a) => a.id === "escolher")!.blocks[0]!.items;
    expect(guidance).toContain("Sem promessas grandes e sem pressionar por perdão.");
  });

  it("outro relacionamento: caminho limite, foco nela e sem comparação", () => {
    const plan = buildFirst48Plan(record(personas.outraRelacao));
    expect(plan.path).toBe("limite");
    expectNoContact(plan);
    expect(plan.exercise.prompts.join(" ")).toMatch(/se compara/);
    const noContact = plan.activities.find((a) => a.id === "escolher")!.blocks[1]!.items;
    expect(noContact).toContain("Silenciar os perfis que fazem você se comparar.");
  });

  it("perfis diferentes geram planos diferentes (não é só o nome)", () => {
    const texts = Object.values(personas).map((a) => allText(buildFirst48Plan(record(a))));
    expect(new Set(texts).size).toBe(texts.length);
  });
});

describe("refazer o diagnóstico", () => {
  const first = record(personas.aberto);

  function withProgress(): JornadaData {
    let d: JornadaData = { ...EMPTY_JORNADA, diagnoses: [first] };
    d = first48Start(d, T0);
    d = first48ToggleCheck(d, "entender:resumo", T0);
    d = first48ToggleActivity(d, "entender", first.id, T0);
    d = first48ToggleActivity(d, "interromper", first.id, T0);
    d = first48SetChoice(d, "responder", first.id, T0);
    d = first48ToggleActivity(d, "escolher", first.id, T0);
    return d;
  }

  it("mudança significativa: mantém as concluídas, avisa e pede nova escolha", () => {
    const blocked = record(personas.bloqueada);
    const d = { ...withProgress(), diagnoses: [first, blocked] };
    const plan = buildFirst48Plan(blocked);
    const review = reviewOf(d.first48, d.diagnoses, plan);
    expect(diagnosisChange(first.answers, blocked.answers)).toBe("significant");
    expect(first48Progress(d.first48, hoursAfter(1)).done).toBe(3);
    expect(review.outdated).toEqual(["entender", "interromper", "escolher"]);
    expect(review.choiceInvalid).toBe(true);
    expect(review.choice).toBeNull();
    expect(canComplete("escolher", review)).toBe(false);
    expect(d.first48.checks["entender:resumo"]).toBe(T0);

    const chosen = first48SetChoice(d, "respeitar", blocked.id, T0);
    const after = reviewOf(chosen.first48, chosen.diagnoses, plan);
    expect(after.choiceInvalid).toBe(false);
    expect(after.choice).toBe("respeitar");
  });

  it("mudança pequena: nada a revisar e a escolha continua valendo", () => {
    const tweak = record({ ...personas.aberto, difficulty: "interpretar" });
    const d = { ...withProgress(), diagnoses: [first, tweak] };
    const review = reviewOf(d.first48, d.diagnoses, buildFirst48Plan(tweak));
    expect(diagnosisChange(first.answers, tweak.answers)).toBe("minor");
    expect(review.outdated).toEqual([]);
    expect(review.choice).toBe("responder");
  });
});

describe("persistência", () => {
  it("recarregar o navegador no meio do processo mantém tudo", () => {
    const diag = record(personas.recente);
    let d: JornadaData = { ...EMPTY_JORNADA, diagnoses: [diag] };
    d = first48Start(d, T0);
    d = first48ToggleCheck(d, "preparar:respirar", T0);
    d = first48ToggleActivity(d, "entender", diag.id, T0);
    d = first48SetChoice(d, "esperar", diag.id, T0);

    const reloaded = parseJornada(JSON.stringify(d));
    expect(reloaded).toEqual(d);
    expect(first48Progress(reloaded.first48, hoursAfter(30))).toMatchObject({
      phase: "running",
      suggestedStage: "b",
      done: 1,
      next: "interromper",
    });
  });

  it("dados corrompidos ou da fundação antiga não quebram a leitura", () => {
    expect(parseJornada("{not json")).toEqual(EMPTY_JORNADA);
    const legacy = parseJornada(
      JSON.stringify({
        version: 1,
        diagnoses: [],
        first48: { startedAt: T0, done: { "h0-pausa": T0 }, closedAt: T0 },
        messages: {},
      }),
    );
    expect(legacy.first48).toEqual({ startedAt: T0, done: {}, checks: {} });
  });
});

describe("acesso e conclusão", () => {
  it("nada é travado pelo relógio: a etapa B pode ser concluída na primeira hora", () => {
    const diag = record(personas.aberto);
    let d = first48Start({ ...EMPTY_JORNADA, diagnoses: [diag] }, T0);
    d = first48ToggleActivity(d, "organizar", diag.id, T0);
    const progress = first48Progress(d.first48, hoursAfter(1));
    expect(progress.suggestedStage).toBe("a");
    expect(progress.done).toBe(1);
  });

  it("depois de 48 horas, tudo continua disponível", () => {
    const d = first48Start(EMPTY_JORNADA, T0);
    const progress = first48Progress(d.first48, hoursAfter(60));
    expect(progress.phase).toBe("time_over");
    expect(progress.next).toBe("entender");
  });

  it("concluir as 5 atividades grava a conclusão uma vez só", () => {
    const diag = record(personas.bloqueada);
    let d = first48Start({ ...EMPTY_JORNADA, diagnoses: [diag] }, T0);
    d = first48SetChoice(d, "diario", diag.id, T0);
    for (const id of ACTIVITY_ORDER) d = first48ToggleActivity(d, id, diag.id, T0);
    expect(d.first48.completedAt).toBe(T0);
    expect(first48Progress(d.first48).complete).toBe(true);
    const undone = first48ToggleActivity(d, "organizar", diag.id, "2026-10-15T00:00:00.000Z");
    const redone = first48ToggleActivity(undone, "organizar", diag.id, "2026-10-16T00:00:00.000Z");
    expect(redone.first48.completedAt).toBe(T0);
  });
});

describe("todas as combinações do diagnóstico", () => {
  const optionsOf = (id: keyof DiagnosisAnswers) =>
    diagnosisQuestions.find((q) => q.id === id)!.options.map((o) => o.value);
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
              combos.push({
                elapsed,
                contact,
                reason,
                otherPerson,
                difficulty,
                tried,
              } as DiagnosisAnswers);

  it("cobre todas as combinações", () => {
    expect(combos.length).toBe(5 * 7 * 6 * 3 * 7 * 5);
  });

  it("nenhuma etapa exige resposta de terceiros e limites nunca recebem sugestão de contato", () => {
    for (const answers of combos) {
      const diag = record(answers);
      const plan = buildFirst48Plan(diag);
      expect(plan.activities.map((a) => a.id)).toEqual(ACTIVITY_ORDER);

      // Sempre existe um caminho sem contato, e todos os outros passos se concluem sozinhos.
      const ids = plan.nextStep.choices.map((c) => c.id);
      expect(ids.some((id) => !CONTACT_CHOICES.includes(id))).toBe(true);
      const empty = reviewOf({ done: {}, checks: {} }, [diag], plan);
      for (const id of ACTIVITY_ORDER) expect(canComplete(id, empty)).toBe(id !== "escolher");
      const chosen = first48SetChoice(
        { ...EMPTY_JORNADA, diagnoses: [diag] },
        ids.find((id) => !CONTACT_CHOICES.includes(id))!,
        diag.id,
        T0,
      );
      expect(canComplete("escolher", reviewOf(chosen.first48, [diag], plan))).toBe(true);

      // Limites (bloqueio, pedido de não contato, outra relação, pedido de tempo, sem reciprocidade).
      const path = pathOf(answers);
      if (
        answers.contact === "bloqueou" ||
        answers.contact === "pediu_sem_contato" ||
        answers.otherPerson === "sim"
      )
        expect(path).toBe("limite");
      if (path !== "conversa") expectNoContact(plan);

      // ids de checklist únicos (o progresso é guardado por id).
      const checks = plan.activities.flatMap((a) => a.checklist.map((c) => c.id));
      expect(new Set(checks).size).toBe(checks.length);
    }
  });
});
