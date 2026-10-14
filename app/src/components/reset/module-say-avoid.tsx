import { useEffect, useState } from "react";
import { Check, Eye, X } from "lucide-react";

import { LimitNotice, ResetShell, useResetLimit } from "@/components/reset/reset-common";
import { Button } from "@/components/ui/button";
import { sayAvoidCategories } from "@/lib/reset/content";
import { useReset } from "@/lib/reset/store";
import { cn } from "@/lib/utils";

/** Módulo 03: O Que Dizer e O Que Evitar, por categoria. A alternativa aparece ao tocar. */
export function SayAvoidModule({
  onBack,
  initialCategory,
}: {
  onBack: () => void;
  initialCategory?: string | undefined;
}) {
  const { data, update } = useReset();
  const { limit } = useResetLimit();
  const [category, setCategory] = useState(initialCategory ?? sayAvoidCategories[0]!.id);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const current = sayAvoidCategories.find((c) => c.id === category)!;
  const seen = Object.keys(data.categoriesSeen).length;

  // Abrir uma categoria conta como vista (progresso do módulo).
  useEffect(() => {
    if (data.categoriesSeen[category]) return;
    update(
      (d) =>
        d.categoriesSeen[category]
          ? d
          : {
              ...d,
              categoriesSeen: { ...d.categoriesSeen, [category]: new Date().toISOString() },
            },
      `Estudou "${current.title}"`,
    );
    // só quando a categoria muda
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  return (
    <ResetShell eyebrow="Módulo 03" title="O Que Dizer e O Que Evitar" onBack={onBack}>
      <p className="text-sm leading-6 text-muted-foreground">
        Padrões de comunicação que podem intensificar ressentimentos, e alternativas mais calmas.
        Leia a situação, veja o que evitar e toque para revelar a alternativa.
      </p>
      {limit && (
        <div className="mt-4">
          <LimitNotice>
            Estas frases servem para treinar uma forma de falar, com ele no futuro ou com qualquer
            pessoa. Enquanto o limite valer, nenhuma delas é para enviar a ele.
          </LimitNotice>
        </div>
      )}
      <p className="mt-2 text-xs font-bold text-reset">
        {seen} de {sayAvoidCategories.length} situações estudadas
      </p>

      <div
        className="-mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1"
        role="tablist"
        aria-label="Situações"
      >
        {sayAvoidCategories.map((item) => {
          const active = item.id === category;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setCategory(item.id)}
              className={cn(
                "flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-3.5 py-2 text-[13px] font-bold transition-colors",
                active ? "bg-reset text-primary-foreground" : "bg-card text-foreground shadow-sm",
              )}
            >
              {data.categoriesSeen[item.id] && !active && (
                <Check className="size-3.5 text-success" strokeWidth={3} />
              )}
              {item.title}
            </button>
          );
        })}
      </div>

      <div role="tabpanel" className="mt-4 space-y-3">
        {current.cards.map((card, index) => {
          const key = `${current.id}:${index}`;
          const shown = revealed[key];
          return (
            <article key={key} className="overflow-hidden rounded-card bg-card shadow-soft">
              <div className="p-4">
                <p className="text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground">
                  Situação
                </p>
                <p className="mt-1 text-[15px] font-bold leading-snug">{card.situation}</p>
              </div>
              <div className="flex gap-3 border-t border-border bg-primary-soft/60 px-4 py-3">
                <X className="mt-0.5 size-4 shrink-0 text-primary" strokeWidth={3} />
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-widest text-primary">
                    Evitar
                  </p>
                  <p className="mt-0.5 text-sm leading-6">"{card.avoid}"</p>
                </div>
              </div>
              {shown ? (
                <div className="border-t border-border bg-success-soft px-4 py-3 motion-safe:animate-in motion-safe:fade-in">
                  <div className="flex gap-3">
                    <Check className="mt-0.5 size-4 shrink-0 text-success" strokeWidth={3} />
                    <div>
                      <p className="text-[11px] font-extrabold uppercase tracking-widest text-success">
                        Alternativa
                      </p>
                      <p className="mt-0.5 text-sm font-semibold leading-6">
                        {card.instead.startsWith("(") ? card.instead : `"${card.instead}"`}
                      </p>
                    </div>
                  </div>
                  <p className="mt-2 text-[13px] leading-snug text-muted-foreground">{card.why}</p>
                </div>
              ) : (
                <div className="border-t border-border p-3">
                  <Button
                    variant="outline"
                    className="h-10 w-full rounded-xl bg-card font-bold"
                    onClick={() => setRevealed((r) => ({ ...r, [key]: true }))}
                  >
                    <Eye /> Ver a alternativa
                  </Button>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </ResetShell>
  );
}
