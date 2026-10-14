import type { ReactNode } from "react";
import { ChevronRight, Lock } from "lucide-react";

import { Emoji, tintClass } from "@/components/common";
import type { EmojiName } from "@/lib/illustrations";
import { cn } from "@/lib/utils";

// Mesmos cartões da Home do Calm Kids (category-tile e featured-card), com emoji 3D no lugar
// das ilustrações e clique em vez de link.

export function CategoryTile({
  label,
  emoji,
  icon,
  onClick,
  soon = false,
}: {
  label: string;
  emoji: EmojiName;
  /** Substitui o emoji (ex.: a arte do cenário). */
  icon?: ReactNode;
  onClick?: () => void;
  /** Função ainda sem destino: aparece apagada, com "Em breve", e não é um botão. */
  soon?: boolean;
}) {
  const tile = (
    <span
      className={cn(
        "relative grid size-[68px] place-items-center rounded-tile bg-card shadow-tile ring-1 ring-border/60 transition-transform",
        !soon && "group-active:scale-95",
      )}
    >
      {icon ?? <Emoji name={emoji} className={cn("size-11", soon && "opacity-50 grayscale")} />}
      {soon && (
        <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-muted px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-muted-foreground">
          Em breve
        </span>
      )}
    </span>
  );
  if (soon || !onClick)
    return (
      <div aria-disabled="true" className="flex flex-col items-center gap-2 text-center">
        {tile}
        <span className="text-[13px] font-bold leading-tight text-muted-foreground">{label}</span>
      </div>
    );
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex cursor-pointer flex-col items-center gap-2 text-center"
    >
      {tile}
      <span className="text-[13px] font-bold leading-tight text-foreground">{label}</span>
    </button>
  );
}

export function FeaturedCard({
  title,
  subtitle,
  badge,
  badgeClassName,
  tint,
  emoji,
  locked = false,
  action = "Abrir",
  onClick,
}: {
  title: string;
  subtitle: string;
  badge: string;
  badgeClassName: string;
  tint: keyof typeof tintClass;
  emoji: EmojiName;
  /** Produto não comprado: mostra o cadeado e o texto de ação (ex.: "Pedir acesso"). */
  locked?: boolean;
  action?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex h-full min-w-0 cursor-pointer flex-col overflow-hidden rounded-card bg-card text-left shadow-soft transition-transform active:scale-[0.98]"
    >
      {/* Painel colorido: a imagem fica centralizada no espaço todo, com um brilho suave atrás. */}
      <span className={cn("relative block aspect-[1/0.82] w-full", tintClass[tint])}>
        <span
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(circle_at_50%_58%,rgba(255,255,255,0.8),transparent_62%)]"
        />
        <Emoji
          name={emoji}
          className={cn(
            "absolute left-1/2 top-[56%] h-auto w-[62%] -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_10px_12px_rgba(90,20,38,0.18)] transition-transform duration-300 group-hover:scale-105",
            locked && "opacity-80 saturate-[0.85]",
          )}
        />
        {locked && (
          <span
            aria-hidden
            className="absolute right-3 top-3 grid size-7 place-items-center rounded-full bg-card text-foreground shadow-sm"
          >
            <Lock className="size-3.5" strokeWidth={2.5} />
          </span>
        )}
        <span
          className={cn(
            "absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide shadow-sm",
            badgeClassName,
          )}
        >
          {badge}
        </span>
      </span>
      <span className="flex flex-1 flex-col px-3.5 pb-3.5 pt-3">
        <span className="block font-display text-[15px] font-extrabold leading-tight text-foreground">
          {title}
        </span>
        <span className="mt-1 block flex-1 text-xs leading-snug text-muted-foreground">
          {subtitle}
        </span>
        <span className="mt-2.5 inline-flex items-center gap-1 text-[12px] font-extrabold text-primary">
          {action} <ChevronRight className="size-3.5" strokeWidth={3} />
        </span>
      </span>
    </button>
  );
}
