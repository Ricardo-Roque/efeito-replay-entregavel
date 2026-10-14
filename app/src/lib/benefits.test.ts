import { describe, expect, it } from "vitest";

import {
  BENEFITS,
  BENEFIT_IDS,
  LIFETIME_ITEMS,
  benefitAccess,
  counselorLink,
  parseBenefitGrants,
} from "@/lib/benefits";

describe("Meus Benefícios: permissões", () => {
  it("resposta atual do servidor (app, reset, all_days) deixa os três benefícios pendentes", () => {
    const grants = parseBenefitGrants({ app: true, reset: true, all_days: true });
    for (const id of BENEFIT_IDS) {
      expect(grants[id]).toBeNull();
      expect(benefitAccess(grants[id])).toBe("pendente");
    }
  });

  it("só true booleano libera; texto, número ou nome de produto não liberam", () => {
    const grants = parseBenefitGrants({
      conselheiro: "true",
      circulo: 1,
      vitalicio: "Código da Reconquista — Acesso Total Vitalício",
    });
    for (const id of BENEFIT_IDS) expect(benefitAccess(grants[id])).toBe("pendente");
  });

  it("cada benefício é independente", () => {
    const grants = parseBenefitGrants({ conselheiro: false, circulo: true });
    expect(benefitAccess(grants.conselheiro)).toBe("nao_adquirido");
    expect(benefitAccess(grants.circulo)).toBe("liberado");
    expect(benefitAccess(grants.vitalicio)).toBe("pendente");
  });

  it("o Reset Emocional do Ex não é uma das ofertas atuais", () => {
    for (const id of BENEFIT_IDS) expect(BENEFITS[id].name).not.toMatch(/reset/i);
  });
});

describe("Meus Benefícios: conteúdo", () => {
  it("sem número configurado, o Conselheiro não gera link", () => {
    expect(counselorLink("", "ana@exemplo.com")).toBe("");
  });

  it("a mensagem para o Conselheiro leva só o e-mail da compra", () => {
    const link = counselorLink("5511999999999", "ana@exemplo.com");
    const text = decodeURIComponent(link.split("?text=")[1] ?? "");
    expect(link.startsWith("https://wa.me/5511999999999?text=")).toBe(true);
    expect(text).toContain("ana@exemplo.com");
  });

  it("o vitalício não lista produto adicional como disponível sem cadastro", () => {
    const available = LIFETIME_ITEMS.filter((item) => item.status === "disponivel");
    expect(available.map((item) => item.title)).toEqual(["Código da Reconquista"]);
  });

  it("nenhuma oferta promete reconciliação garantida", () => {
    const text = BENEFIT_IDS.flatMap((id) => [
      BENEFITS[id].description,
      BENEFITS[id].format,
      ...BENEFITS[id].promises,
    ]).join(" ");
    expect(text).not.toMatch(/garant|100%|com certeza/i);
  });
});
