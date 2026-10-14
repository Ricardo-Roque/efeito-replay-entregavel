import { describe, expect, it } from "vitest";

import { contextOf } from "@/lib/comunicacao/rules";
import { pauseQuestions, pauseQuestionsFor } from "@/lib/guide";
import { pathOf } from "@/lib/jornada/first48";
import { planDays } from "@/lib/plan";
import { isContactLink, resolveDay } from "@/lib/plan-guide";
import type { DiagnosisAnswers } from "@/lib/jornada/types";

// Problemas encontrados na auditoria de QA (docs/qa-evolucao.md).

const base: DiagnosisAnswers = {
  elapsed: "d7a30",
  contact: "normal",
  reason: "distanciamento",
  otherPerson: "nao",
  tried: ["nada"],
  difficulty: "o_que_dizer",
};

describe("Pausa coerente com o momento dela", () => {
  it("sem limite e com conversa aberta, o checklist é o de sempre", () => {
    expect(pauseQuestionsFor("conversa")).toBe(pauseQuestions);
    expect(pauseQuestionsFor("sem_diagnostico")).toBe(pauseQuestions);
    expect(pauseQuestionsFor("limite")).toBe(pauseQuestions);
  });

  it("com pedido de tempo ou sem reciprocidade, pergunta se ele escreveu primeiro", () => {
    for (const stance of ["pausa", "espaco"] as const) {
      const questions = pauseQuestionsFor(stance);
      expect(questions).toHaveLength(pauseQuestions.length + 1);
      const extra = questions.at(-1)!;
      expect(extra.id).toBe("iniciativa");
      // "Não" leva a guardar (wait), não a "não envie": responder a ele continua possível.
      expect(extra.hardStop).toBeUndefined();
    }
  });

  it("o caminho das 48 horas e o momento da Pausa são o mesmo", () => {
    const cases: DiagnosisAnswers[] = [
      { ...base, contact: "pediu_tempo" },
      { ...base, contact: "nao_responde" },
      { ...base, contact: "frio", tried: ["mensagens", "desculpas"] },
      { ...base, contact: "bloqueou" },
      { ...base, otherPerson: "sim" },
      base,
    ];
    for (const answers of cases) {
      expect(contextOf(answers, null, null).stance).toBe(pathOf(answers));
    }
  });
});

describe("Plano de 21 dias com limite", () => {
  it("não aponta para conteúdos de reencontro (ex.: Dia 20, Preparar o encontro)", () => {
    expect(isContactLink({ link: { kind: "message", id: "reen-preparar" }, label: "" })).toBe(true);
    for (const answers of [
      { ...base, contact: "bloqueou" as const },
      { ...base, contact: "pediu_sem_contato" as const },
      { ...base, otherPerson: "sim" as const },
    ])
      for (const day of planDays) {
        const ids = resolveDay(day, answers, null).tools.flatMap(({ link }) =>
          link.kind === "message" ? [link.id] : [],
        );
        expect(ids, `Dia ${day.day}`).not.toContain("reen-preparar");
      }
  });
});
