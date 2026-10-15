// O que aparece para a cliente. O produto principal entrega só o que a VSL promete: diagnóstico,
// orientações de comunicação, mensagens, situações e as técnicas do método. O resto continua no
// código e nos dados do aparelho (nada é apagado). Para reexibir, basta trocar o valor para true.
// Ver docs/CONTINUIDADE-DESENVOLVIMENTO.md.

export const features: Record<"plan21" | "diary" | "first48" | "progress", boolean> = {
  /** Plano de 21 dias: aba Plano, dias, fases, marcos e atalhos para os dias. */
  plan21: false,
  /** Diário emocional: aba Diário, registros, contador de impulsos e "guardar no Diário". */
  diary: false,
  /** Meu Plano de 48 Horas (jornada de atividades). */
  first48: false,
  /** Meu progresso (metas e marcos). */
  progress: false,
};
