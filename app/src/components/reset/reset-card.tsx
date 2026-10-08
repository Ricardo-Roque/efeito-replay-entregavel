import { ArrowRight, KeyRound } from "lucide-react";

import { progressOf, readReset } from "@/lib/reset/store";
import { useStore } from "@/lib/store";

/** Card do Reset Emocional do Ex no Início: com a compra, mostra o progresso; sem a compra,
 * apresenta o produto (abre a tela com o que está incluído). */
export function ResetCard({ onOpen }: { onOpen: () => void }) {
  const { email, entitlements } = useStore();
  const owned = entitlements.reset;
  const progress = owned ? progressOf(readReset(email)) : null;

  return (
    <button
      type="button"
      onClick={onOpen}
      className="mx-5 mt-6 block w-[calc(100%-2.5rem)] cursor-pointer overflow-hidden rounded-card bg-reset text-left text-primary-foreground shadow-soft transition-transform active:scale-[0.99]"
    >
      <div className="flex items-start gap-4 p-5">
        <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-white/15">
          <KeyRound className="size-7 text-brand-gold" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[11px] font-extrabold uppercase tracking-widest text-primary-foreground/75">
            {owned ? "Seu produto premium" : "Produto complementar"}
          </span>
          <span className="mt-0.5 block font-display text-lg font-extrabold leading-snug">
            Reset Emocional do Ex
          </span>
          <span className="block text-[13px] leading-snug text-primary-foreground/85">
            Protocolo de Reconstrução da Confiança
          </span>
        </span>
      </div>
      {progress ? (
        <div className="border-t border-white/15 px-5 pb-4 pt-3">
          <div className="flex items-center justify-between text-xs font-bold">
            <span>
              {progress.percent === 0
                ? "Comece pelo diagnóstico"
                : `${progress.percent}% concluído`}
            </span>
            <span className="inline-flex items-center gap-1">
              {progress.percent === 0 ? "Começar" : "Continuar"} <ArrowRight className="size-3.5" />
            </span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/25">
            <div
              className="h-full rounded-full bg-white"
              style={{ width: `${progress.percent}%` }}
            />
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between border-t border-white/15 px-5 py-3 text-[13px] font-bold">
          <span className="text-primary-foreground/85">
            Para quando a confiança foi abalada por traição, mentira ou brigas
          </span>
          <ArrowRight className="ml-2 size-4 shrink-0" />
        </div>
      )}
    </button>
  );
}
