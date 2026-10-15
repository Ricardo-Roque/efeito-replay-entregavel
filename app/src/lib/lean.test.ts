import { describe, expect, it } from "vitest";

import { commMessages } from "@/lib/comunicacao/library";
import { replySituations } from "@/lib/comunicacao/reply";
import { diagnosisQuestions } from "@/lib/jornada/diagnosis";
import { buildDiagnosisResult } from "@/lib/jornada/map";
import { techniqueAccess, vslTechniques } from "@/lib/jornada/messages";
import type { DiagnosisAnswers } from "@/lib/jornada/types";
import { features } from "@/lib/features";
import { scenarios } from "@/lib/scenarios";

// Produto enxuto (docs/CONTINUIDADE-DESENVOLVIMENTO.md): só o que a VSL promete fica visível.

/** Textos que a cliente lê: nada pode mandar para o Diário ou para o plano, que estão ocultos. */
const HIDDEN = /\bDiário\b|plano de 21 dias|Plano de 48 Horas/;

function allAnswers(): DiagnosisAnswers[] {
  const out: DiagnosisAnswers[] = [];
  const values = (id: string) =>
    diagnosisQuestions.find((q) => q.id === id)!.options.map((o) => o.value);
  for (const elapsed of values("elapsed"))
    for (const contact of values("contact"))
      for (const reason of values("reason"))
        for (const otherPerson of values("otherPerson"))
          for (const difficulty of values("difficulty"))
            for (const tried of [["nada"], ["mensagens", "nova_chance"], ["contato_zero"]])
              out.push({
                elapsed,
                contact,
                reason,
                otherPerson,
                tried,
                difficulty,
              } as DiagnosisAnswers);
  return out;
}

describe("produto enxuto", () => {
  it("plano de 21 dias, Diário, 48 horas e progresso estão ocultos", () => {
    expect(features).toEqual({ plan21: false, diary: false, first48: false, progress: false });
  });

  it("as 7 técnicas editoriais estão completas e identificadas como conteúdo do app", () => {
    expect(vslTechniques.map((t) => t.id)).toEqual([
      "tres_palavras",
      "comeca_com_h",
      "pensando_aqui",
      "frase_3",
      "frase_replay",
      "buraco_negro",
      "tecnica_noturna",
    ]);
    expect(vslTechniques.every((t) => t.status === "rascunho")).toBe(true);
    for (const technique of vslTechniques) {
      expect(technique.purpose.length).toBeGreaterThan(0);
      expect(technique.whenToUse.length).toBeGreaterThan(0);
      expect(technique.whenToAvoid.length).toBeGreaterThan(0);
      expect(technique.limits.length).toBeGreaterThan(0);
      expect(technique.note).toMatch(/criada para o Código da Reconquista/);
      if (technique.kind === "message") {
        expect(technique.message?.length).toBeGreaterThan(0);
        expect(technique.customization?.length).toBeGreaterThan(0);
        expect(technique.ifReply?.length).toBeGreaterThan(0);
        expect(technique.ifNoReply?.length).toBeGreaterThan(0);
      } else {
        expect(technique.steps?.length).toBeGreaterThan(0);
      }
    }
  });

  it("as técnicas de mensagem respeitam limites e falta de reciprocidade", () => {
    const messages = vslTechniques.filter((item) => item.kind === "message");
    for (const technique of messages) expect(techniqueAccess(technique, "limite")).toBe("blocked");

    const initiatives = messages.filter((item) => item.initiative === "dela");
    for (const technique of initiatives) {
      expect(techniqueAccess(technique, "pausa")).toBe("blocked");
      expect(techniqueAccess(technique, "espaco")).toBe("blocked");
      expect(techniqueAccess(technique, "conversa")).toBe("available");
    }

    const replies = messages.filter((item) => item.initiative === "resposta");
    for (const technique of replies) {
      expect(techniqueAccess(technique, "pausa")).toBe("reply_only");
      expect(techniqueAccess(technique, "espaco")).toBe("reply_only");
    }

    for (const technique of vslTechniques.filter((item) => item.kind === "practice"))
      expect(techniqueAccess(technique, "limite")).toBe("practice");
  });

  it("o Mapa nunca manda para o plano ou para o Diário, nem cita os dois", () => {
    for (const answers of allAnswers()) {
      const map = buildDiagnosisResult(answers);
      expect(["plan", "diary"]).not.toContain(map.firstStep.target);
      const texts = [map.firstStep.title, map.firstStep.text, ...map.doNow, ...map.avoid];
      for (const text of texts) expect(text).not.toMatch(HIDDEN);
    }
  });

  it("Central, assistente e cenários não citam o Diário nem o plano", () => {
    const strings: string[] = [];
    const collect = (value: unknown, key = "") => {
      if (["keywords", "id"].includes(key)) return;
      if (typeof value === "string") strings.push(value);
      else if (Array.isArray(value)) value.forEach((item) => collect(item));
      else if (value && typeof value === "object")
        Object.entries(value).forEach(([k, item]) => collect(item, k));
    };
    collect(commMessages);
    collect(replySituations);
    collect(scenarios.map(({ days: _days, ...rest }) => rest));
    for (const text of strings) expect(text).not.toMatch(HIDDEN);
  });

  it("nenhuma ação do assistente grava no Diário", () => {
    const targets: string[] = [];
    const collect = (value: unknown) => {
      if (Array.isArray(value)) value.forEach(collect);
      else if (value && typeof value === "object") {
        const record = value as Record<string, unknown>;
        if (typeof record["target"] === "string" && typeof record["label"] === "string")
          targets.push(record["target"]);
        Object.values(record).forEach(collect);
      }
    };
    collect(replySituations);
    expect(targets.length).toBeGreaterThan(0);
    expect(targets).not.toContain("diary");
  });
});
