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
      className="group flex min-w-0 cursor-pointer flex-col justify-start text-left"
    >
      <span
        className={cn(
          "relative grid aspect-[1/0.92] place-items-center overflow-hidden rounded-card shadow-soft transition-transform group-active:scale-[0.98]",
          tintClass[tint],
        )}
      >
        <span
          className={cn(
            "absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide",
            badgeClassName,
          )}
        >
          {badge}
        </span>
        <Emoji name={emoji} className="mt-4 h-[56%] w-auto" />
      </span>
      <span className="mt-2.5 block px-1">
        <span className="block font-display text-[15px] font-extrabold leading-tight text-foreground">
          {title}
        </span>
        <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">{subtitle}</span>
      </span>
    </button>
  );
}
