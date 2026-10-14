import { useMemo } from "react";

import { contextOf } from "@/lib/comunicacao/rules";
import type { CommContext, CommMessage } from "@/lib/comunicacao/types";
import { copyText } from "@/lib/clipboard";
import { useJornada } from "@/lib/jornada/store";
import { useStore } from "@/lib/store";

/** Momento dela para a Central: último diagnóstico e cenário do perfil. */
export function useCommContext(): CommContext {
  const { data } = useStore();
  const { current, result } = useJornada();
  const profileScenario = data.profile?.scenario ?? null;
  return useMemo(
    () => contextOf(current?.answers ?? null, result?.scenario ?? null, profileScenario),
    [current, result, profileScenario],
  );
}

/** Copiar, levar para a Pausa e guardar no Diário, com o aviso de sempre e o registro de uso. */
export function useMessageActions(openPause: (draft?: string) => void) {
  const { addEntry, showToast } = useStore();
  const { markUsed } = useJornada();
  return {
    copy: async (message: CommMessage) => {
      const ok = await copyText(message.text);
      if (ok) markUsed(message.id);
      showToast(
        ok
          ? "Copiado. Troque os trechos entre colchetes e passe pela Pausa antes de enviar."
          : "Não foi possível copiar. Selecione o texto e copie.",
        ok ? "info" : "error",
      );
    },
    toPause: (message: CommMessage) => {
      markUsed(message.id);
      openPause(message.text);
    },
    toDiary: (message: CommMessage) => {
      if (addEntry({ type: "note", source: "central", text: `${message.title}: ${message.text}` }))
        showToast("Guardado no Diário. Complete com as suas palavras quando quiser.");
    },
  };
}
