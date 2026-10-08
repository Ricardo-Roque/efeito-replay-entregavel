import { ChevronRight } from "lucide-react";

import { Emoji, tintClass } from "@/components/common";
import type { EmojiName } from "@/lib/illustrations";
import { cn } from "@/lib/utils";

// Mesmos cartões da Home do Calm Kids (category-tile e featured-card), com emoji 3D no lugar
// das ilustrações e clique em vez de link.

export function CategoryTile({
  label,
  emoji,
  onClick,
}: {
  label: string;
  emoji: EmojiName;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex cursor-pointer flex-col items-center gap-2 text-center"
    >
      <span className="grid size-[68px] place-items-center rounded-tile bg-card shadow-tile ring-1 ring-border/60 transition-transform group-active:scale-95">
        <Emoji name={emoji} className="size-11" />
      </span>
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
  onClick,
}: {
  title: string;
  subtitle: string;
  badge: string;
  badgeClassName: string;
  tint: keyof typeof tintClass;
  emoji: EmojiName;
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
          className="absolute left-1/2 top-[56%] h-auto w-[62%] -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_10px_12px_rgba(90,20,38,0.18)] transition-transform duration-300 group-hover:scale-105"
        />
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
          Abrir <ChevronRight className="size-3.5" strokeWidth={3} />
        </span>
      </span>
    </button>
  );
}
