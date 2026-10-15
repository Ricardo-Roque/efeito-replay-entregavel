import { describe, expect, it } from "vitest";

import { commCategories } from "@/lib/comunicacao/library";
import {
  answersWithLimit,
  outcomeOf,
  replySituationById,
  replySituations,
  resolveReply,
  visibleReplySituations,
} from "@/lib/comunicacao/reply";
import { availabilityOf, canSend, contextOf, messageById } from "@/lib/comunicacao/rules";
import type {
  CommContext,
  CommStance,
  ReplyAction,
  ReplySituation,
  ResolvedReply,
} from "@/lib/comunicacao/types";
import { pathOf } from "@/lib/jornada/first48";
import type { DiagnosisAnswers } from "@/lib/jornada/types";
import { TOTAL_DAYS } from "@/lib/plan";
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

/** Um diagnóstico real para cada momento dela. */
const contexts: Record<CommStance, CommContext> = {
  conversa: ctxOf({}),
  sem_diagnostico: ctxOf(null),
  pausa: ctxOf({ contact: "pediu_tempo" }),
  espaco: ctxOf({ contact: "nao_responde" }),
  limite: ctxOf({ contact: "bloqueou" }),
};

/** Toda combinação situação × opção, com a opção como a tela passa (null sem pergunta). */
const paths = replySituations.flatMap((situation) =>
  situation.question
    ? situation.question.options.map((option) => ({
        situation,
        option: option.id as string | null,
      }))
    : [{ situation, option: null as string | null }],
);

const all = (stance: CommStance) =>
  paths.map(({ situation, option }) => {
    const result = resolveReply(situation, option, contexts[stance]);
    expect(result, `${situation.id}/${option}`).not.toBeNull();
    return result!;
  });

const actionsOf = (result: ResolvedReply): ReplyAction[] => [result.next, ...result.more];

const textsOf = (situation: ReplySituation) =>
  [
    situation.label,
    situation.title,
    situation.hint,
    ...situation.reading,
    situation.question?.text ?? "",
    situation.question?.hint ?? "",
    ...(situation.question?.options.map((option) => option.label) ?? []),
    ...Object.values(situation.outcomes).flatMap((outcome) => [
      outcome.title,
      ...(outcome.reading ?? []),
      ...outcome.doNow.flatMap((item) => [item.text, item.why]),
      ...outcome.avoid.flatMap((item) => [item.text, item.why]),
      outcome.example?.him ?? "",
      outcome.example?.note ?? "",
      ...(outcome.alerts ?? []).flatMap((alert) => [alert.title, alert.text]),
      ...[outcome.next, ...outcome.more].flatMap((action) => [action.label, action.text]),
    ]),
  ].join(" ");

describe("conteúdo", () => {
  it("tem as dez situações pedidas, na ordem da tela", () => {
    expect(visibleReplySituations().map((item) => item.label)).toEqual([
      "Ele respondeu friamente.",
      "Ele disse que sente saudade.",
      "Ele fez uma pergunta.",
      "Ele demonstrou mágoa.",
      "Ele demonstrou raiva.",
      "Ele sugeriu conversar.",
      "Ele demonstrou interesse em um encontro.",
      "Ele visualizou e não respondeu.",
      "Ele pediu para eu parar.",
      "Ele mencionou outra pessoa.",
    ]);
    expect(new Set(replySituations.map((item) => item.id)).size).toBe(10);
  });

  it("cada opção da pergunta tem um resultado, e não sobra resultado sem opção", () => {
    for (const situation of replySituations) {
      const keys = Object.keys(situation.outcomes).sort();
      const expected = situation.question
        ? situation.question.options.map((option) => option.id).sort()
        : ["padrao"];
      expect(keys, situation.id).toEqual(expected);
      expect(new Set(expected).size, situation.id).toBe(expected.length);
    }
  });

  it("todo resultado tem leitura, orientação com justificativa, o que evitar e próximo passo", () => {
    for (const situation of replySituations) {
      expect(situation.reading.length, situation.id).toBeGreaterThanOrEqual(2);
      for (const [key, outcome] of Object.entries(situation.outcomes)) {
        const where = `${situation.id}/${key}`;
        expect(outcome.title.trim(), where).not.toBe("");
        expect(outcome.doNow.length, where).toBeGreaterThanOrEqual(2);
        expect(outcome.avoid.length, where).toBeGreaterThanOrEqual(1);
        for (const item of [...outcome.doNow, ...outcome.avoid]) {
          expect(item.text.trim(), where).not.toBe("");
          expect(item.why.trim(), `${where}: ${item.text}`).not.toBe("");
        }
        expect(outcome.next.label.trim(), where).not.toBe("");
        expect(outcome.more.length, where).toBeGreaterThanOrEqual(1);
      }
    }
  });

  it("exemplos usam modelos da Central que são respostas (ele escreveu primeiro)", () => {
    for (const situation of replySituations)
      for (const [key, outcome] of Object.entries(situation.outcomes)) {
        if (!outcome.example) continue;
        const message = messageById(outcome.example.replyId);
        expect(message, `${situation.id}/${key}`).toBeDefined();
        expect(message!.kind).toBe("modelo");
        expect(message!.copyable).toBe(true);
        expect(message!.initiative, `${situation.id}/${key}`).toBe("resposta");
        expect(outcome.example.him.trim()).not.toBe("");
      }
  });

  it("passos e conteúdos relacionados apontam para destinos que existem", () => {
    const categories = commCategories.map((item) => item.id);
    const scenarioIds = scenarios.map((item) => item.id);
    for (const situation of replySituations) {
      expect(categories).toContain(situation.category);
      for (const [key, outcome] of Object.entries(situation.outcomes)) {
        const where = `${situation.id}/${key}`;
        for (const id of outcome.related)
          expect(messageById(id), `${where} -> ${id}`).toBeDefined();
        for (const action of [outcome.next, ...outcome.more]) {
          if (action.target === "day") {
            expect(action.label, where).not.toContain(action.text.replace(/\.$/, ""));
            expect(action.day, where).toBeGreaterThanOrEqual(1);
            expect(action.day, where).toBeLessThanOrEqual(TOTAL_DAYS);
          }
          if (action.target === "scenario") expect(scenarioIds, where).toContain(action.scenario);
          if (action.target === "central") expect(categories, where).toContain(action.category);
          if (action.target === "register_limit") expect(outcome.limit, where).toBeDefined();
        }
      }
    }
  });

  it("não promete efeito nem afirma o que ele pensa ou vai decidir", () => {
    const forbidden = [
      /com certeza/i,
      /certamente/i,
      /sem d[uú]vida/i,
      /ele vai (voltar|sentir|perceber|procurar|querer)/i,
      /ele (quer|ainda gosta|sente) (voltar|de voc[eê])/i,
      /isso (prova|significa) que ele/i,
      /garant(e|ido|ida)\b/i,
      /funciona sempre|sempre funciona/i,
      /cient[ií]fic|comprovad|neuroci[eê]ncia/i,
      /tr[eê]s palavras|buraco negro|frase do replay/i,
    ];
    for (const situation of replySituations) {
      const text = textsOf(situation);
      for (const pattern of forbidden)
        expect(text, `${situation.id} ${pattern}`).not.toMatch(pattern);
    }
  });
});

describe("caminhos (resolveReply)", () => {
  it("opção inexistente não monta resultado", () => {
    expect(resolveReply(replySituationById("frio"), "xyz", contexts.conversa)).toBeNull();
    expect(resolveReply(replySituationById("frio"), null, contexts.conversa)).toBeNull();
    expect(resolveReply(replySituationById("parar"), null, contexts.conversa)).not.toBeNull();
  });

  it("todo caminho resolve em todos os momentos dela", () => {
    for (const stance of Object.keys(contexts) as CommStance[])
      expect(all(stance)).toHaveLength(paths.length);
  });

  it("quando o caminho é não enviar, nada vira mensagem", () => {
    for (const stance of Object.keys(contexts) as CommStance[])
      for (const result of all(stance)) {
        if (result.respond !== "nao") continue;
        const where = `${stance} ${result.situation.id}/${result.option}`;
        expect(result.example?.sendable ?? false, where).toBe(false);
        expect(
          actionsOf(result).map((a) => a.target),
          where,
        ).not.toContain("pause_example");
      }
  });

  it("a Pausa com o exemplo só aparece quando o exemplo pode ser enviado", () => {
    for (const stance of Object.keys(contexts) as CommStance[])
      for (const result of all(stance)) {
        const hasPauseExample = actionsOf(result).some((a) => a.target === "pause_example");
        expect(hasPauseExample, `${stance} ${result.situation.id}/${result.option}`).toBe(
          hasPauseExample && Boolean(result.example?.sendable),
        );
      }
  });

  it("o exemplo segue a mesma regra da Central (sem contradição)", () => {
    for (const stance of ["conversa", "sem_diagnostico", "pausa", "espaco"] as CommStance[])
      for (const result of all(stance)) {
        if (!result.example) continue;
        const central = canSend(availabilityOf(result.example.message, contexts[stance]));
        const where = `${stance} ${result.situation.id}/${result.option}`;
        expect(result.example.sendable, where).toBe(central && result.respond !== "nao");
        if (!result.example.sendable) expect(result.example.caution, where).toBeTruthy();
      }
  });

  it("com conversa, todo caminho que sugere responder tem um exemplo enviável", () => {
    for (const result of all("conversa")) {
      if (result.respond !== "sim") continue;
      expect(result.example?.sendable, `${result.situation.id}/${result.option}`).toBe(true);
    }
  });

  it("com pausa ou espaço, ele escreveu: respostas continuam possíveis, com aviso", () => {
    for (const stance of ["pausa", "espaco"] as CommStance[])
      for (const result of all(stance)) {
        const where = `${stance} ${result.situation.id}/${result.option}`;
        if (result.situation.heWrote) expect(result.alerts[0]?.tone, where).toBe("care");
        if (result.example?.sendable)
          expect(availabilityOf(result.example.message, contexts[stance]), where).toBe(
            "so_resposta",
          );
      }
  });

  it("com limite no diagnóstico, nenhuma situação sugere resposta", () => {
    for (const result of all("limite")) {
      const where = `${result.situation.id}/${result.option}`;
      expect(result.respond, where).toBe("nao");
      expect(result.title, where).not.toMatch(/^(Responda|Aceite|Acolha|Seja honesta)/);
      expect(result.example, where).toBeNull();
      expect(result.limit, where).toBeNull();
      expect(result.alerts[0]?.tone, where).toBe("stop");
      const targets = actionsOf(result).map((a) => a.target);
      expect(targets, where).not.toContain("pause_example");
      expect(targets, where).not.toContain("register_limit");
      expect(targets, where).toContain("diagnosis");
      expect(
        result.related.every((m) => m.kind !== "modelo"),
        where,
      ).toBe(true);
      expect(
        result.doNow.some((p) => p.registers),
        where,
      ).toBe(false);
    }
  });

  it("o limite do perfil (bloqueio, outra relação) vale mesmo com diagnóstico de conversa", () => {
    for (const profile of ["bloqueou", "outra"] as ScenarioId[]) {
      const ctx = ctxOf({}, profile);
      const result = resolveReply(replySituationById("saudade"), "dia", ctx)!;
      expect(result.respond).toBe("nao");
      expect(result.example).toBeNull();
    }
  });

  it("sem diagnóstico, oferece fazer o diagnóstico", () => {
    for (const result of all("sem_diagnostico"))
      expect(actionsOf(result).map((a) => a.target)).toContain("diagnosis");
  });

  it("os passos não se repetem", () => {
    for (const stance of Object.keys(contexts) as CommStance[])
      for (const result of all(stance)) {
        const keys = actionsOf(result).map(
          (a) => `${a.target}:${a.day}:${a.scenario}:${a.category}`,
        );
        expect(new Set(keys).size, `${stance} ${result.situation.id}/${result.option}`).toBe(
          keys.length,
        );
      }
  });
});

describe("situações com regra própria", () => {
  const conversa = contexts.conversa;

  it("frio: com reciprocidade, exemplo simples; sem reciprocidade, espaço", () => {
    const yes = resolveReply(replySituationById("frio"), "reciproco", conversa)!;
    expect(yes.respond).toBe("sim");
    expect(yes.next.target).toBe("pause_example");
    const no = resolveReply(replySituationById("frio"), "unilateral", conversa)!;
    expect(no.respond).toBe("opcional");
    // Escrever sem enviar acontece na Pausa (o Diário está oculto, ver lib/features.ts).
    expect(no.next.target).toBe("pause");
  });

  it("saudade: lembra que saudade não é decisão de voltar", () => {
    const result = resolveReply(replySituationById("saudade"), "dia", conversa)!;
    expect(result.reading.join(" ")).toMatch(/não uma proposta/);
    expect(result.avoid.map((p) => p.text).join(" ")).toMatch(/vamos voltar/);
  });

  it("mágoa: liga à confiança e ensina a reconhecer sem justificar", () => {
    const result = resolveReply(replySituationById("magoa"), "desabafo", conversa)!;
    expect(result.example?.message.id).toBe("ress-reconhecer");
    expect(result.more.some((a) => a.target === "central" && a.category === "confianca")).toBe(
      true,
    );
  });

  it("raiva com ameaça: segurança primeiro, sem exemplo, com rede de apoio", () => {
    const result = resolveReply(replySituationById("raiva"), "sim", conversa)!;
    expect(result.respond).toBe("nao");
    expect(result.example).toBeNull();
    expect(result.care).toBe(true);
    expect(result.alerts.map((a) => a.text).join(" ")).toMatch(/180/);
  });

  it("visualizou: nunca sugere outra mensagem e leva para a Pausa ou o Diário", () => {
    for (const stance of Object.keys(contexts) as CommStance[])
      for (const option of ["impulso", "calma"]) {
        const result = resolveReply(replySituationById("visualizou"), option, contexts[stance])!;
        expect(result.respond).toBe("nao");
        expect(result.example).toBeNull();
        expect(["pause", "diary"]).toContain(result.next.target);
      }
  });

  it("pediu para parar: interrompe o contato e oferece registrar o limite", () => {
    const result = resolveReply(replySituationById("parar"), null, conversa)!;
    expect(result.respond).toBe("nao");
    expect(result.example).toBeNull();
    expect(result.limit).toBe("pediu_sem_contato");
    expect(result.next.target).toBe("register_limit");
  });

  it("encontro: fala de lugar público e de preparar a conversa", () => {
    const result = resolveReply(replySituationById("encontro"), "quero", conversa)!;
    const text = result.doNow.map((p) => p.text).join(" ");
    expect(text).toMatch(/lugar público/);
    expect(text).toMatch(/[Pp]reparar/);
    expect(result.more.some((a) => a.target === "pause" && /sem enviar/.test(a.label))).toBe(true);
  });

  it("outra pessoa em relacionamento: oferece registrar o limite, sem exemplo", () => {
    const result = resolveReply(replySituationById("outra_pessoa"), "sim", conversa)!;
    expect(result.limit).toBe("outra_relacao");
    expect(result.example).toBeNull();
  });

  it("registrar o limite deixa o app inteiro em modo limite", () => {
    expect(pathOf(answersWithLimit(base, "pediu_sem_contato"))).toBe("limite");
    expect(pathOf(answersWithLimit(base, "outra_relacao"))).toBe("limite");
    expect(contextOf(answersWithLimit(base, "pediu_sem_contato"), null, null).stance).toBe(
      "limite",
    );
    // Só a resposta do limite muda.
    expect(answersWithLimit(base, "outra_relacao")).toEqual({ ...base, otherPerson: "sim" });
    // E, depois de registrar, o próprio assistente para de oferecer o registro.
    const after = contextOf(answersWithLimit(base, "pediu_sem_contato"), null, null);
    const result = resolveReply(replySituationById("parar"), null, after)!;
    expect(result.next.target).not.toBe("register_limit");
    expect(result.doNow.some((p) => p.registers)).toBe(false);
  });

  it("outcomeOf ignora opção quando a situação não tem pergunta", () => {
    expect(outcomeOf(replySituationById("parar"), "qualquer")).toBe(
      replySituationById("parar").outcomes["padrao"],
    );
  });
});
