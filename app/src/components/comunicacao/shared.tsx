import { ChevronRight, Star } from "lucide-react";

import { availabilityLabel, availabilityOf, categoryById } from "@/lib/comunicacao/rules";
import type { CommAvailability, CommContext, CommMessage } from "@/lib/comunicacao/types";
import { cn } from "@/lib/utils";

const badgeTone: Record<CommAvailability, string> = {
  recomendado: "bg-success-soft text-success",
  permitido: "bg-primary-soft text-primary",
  so_resposta: "bg-tint-honey text-foreground",
  nao_agora: "bg-muted text-muted-foreground",
  educativo: "bg-tint-lavender text-foreground",
};

export function AvailabilityBadge({
  message,
  availability,
}: {
  message: CommMessage;
  availability: CommAvailability;
}) {
  const label =
    message.kind === "evitar"
      ? "Evite"
      : message.kind === "reflexao"
        ? "Para o Diário"
        : availabilityLabel[availability];
  return (
    <span
      className={cn(
        "inline-block shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide",
        message.kind === "evitar"
          ? "bg-destructive-soft text-destructive"
          : badgeTone[availability],
      )}
    >
      {label}
    </span>
  );
}

/** Card de um conteúdo na lista: categoria, situação para o momento dela, nome e prévia do texto. */
export function MessageCard({
  message,
  ctx,
  favorite,
  onOpen,
}: {
  message: CommMessage;
  ctx: CommContext;
  favorite: boolean;
  onOpen: (id: string) => void;
}) {
  const availability = availabilityOf(message, ctx);
  return (
    <button
      type="button"
      onClick={() => onOpen(message.id)}
      aria-label={`Abrir: ${message.title}`}
      className={cn(
        "flex w-full cursor-pointer items-start gap-3 rounded-card bg-card p-4 text-left shadow-soft transition-transform active:scale-[0.99]",
        availability === "nao_agora" && "opacity-80",
      )}
    >
      <span className="min-w-0 flex-1">
        <span className="flex items-center justify-between gap-2">
          <span className="truncate text-[11px] font-bold text-muted-foreground">
            {categoryById(message.category).label}
          </span>
          <AvailabilityBadge message={message} availability={availability} />
        </span>
        <span className="mt-1 flex items-center gap-1.5 font-display text-[15px] font-extrabold leading-snug text-foreground">
          {favorite && (
            <Star className="size-3.5 shrink-0 fill-primary text-primary" aria-label="Favorito" />
          )}
          {message.title}
        </span>
        <span
          className={cn(
            "mt-1.5 line-clamp-2 block text-[13px] leading-snug text-muted-foreground",
            message.kind === "evitar" && "line-through decoration-destructive/50",
          )}
        >
          “{message.text}”
        </span>
      </span>
      <ChevronRight className="mt-6 size-4 shrink-0 text-muted-foreground" />
    </button>
  );
}

/** Lista simples com marcador (usada nas seções do detalhe e do guia de resposta). */
export function BulletList({ items, tone }: { items: string[]; tone: "do" | "avoid" | "info" }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li
          key={item}
          className={cn(
            "flex items-start gap-3 rounded-xl px-4 py-3 text-sm leading-6",
            tone === "do" && "border border-success/30 bg-success-soft",
            tone === "avoid" && "border border-destructive/25 bg-destructive-soft",
            tone === "info" && "border border-border bg-card",
          )}
        >
          <span
            aria-hidden
            className={cn(
              "mt-2 size-2 shrink-0 rounded-full",
              tone === "do" && "bg-success",
              tone === "avoid" && "bg-destructive",
              tone === "info" && "bg-primary",
            )}
          />
          {item}
        </li>
      ))}
    </ul>
  );
}
