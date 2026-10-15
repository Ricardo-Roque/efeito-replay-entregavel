import type { ReactNode } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { ArrowLeft, Check, Phone, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { careLines } from "@/lib/guide";
import { cenarioArte, emoji, personagem, type EmojiName, type Pose } from "@/lib/illustrations";
import type { ScenarioId } from "@/lib/scenarios";
import { planPhases } from "@/lib/plan";
import { cn } from "@/lib/utils";

/** Mesmo papel do CalmKidsBrand: logo grande no login, compacto no cabeçalho.
 * Logo em texto (Nunito black), com "Reconquista" na cor de ação. */
export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <span
      role="img"
      aria-label="Código da Reconquista"
      className={cn(
        "inline-flex items-center gap-2 font-display font-black leading-none tracking-tight",
        compact ? "text-[19px]" : "text-[28px]",
      )}
    >
      <img
        src={emoji.fase3}
        alt=""
        width={64}
        height={64}
        className={compact ? "size-8" : "size-11"}
      />
      <span>
        <span className="text-foreground">Código da </span>
        <span className="text-primary">Reconquista</span>
      </span>
    </span>
  );
}

/** Iniciais num círculo, como o ProfileAvatar do Calm Kids. `className` inclui tamanho e fonte. */
export function ProfileAvatar({ initials, className }: { initials: string; className: string }) {
  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center rounded-full bg-primary-soft font-extrabold text-primary shadow-tile ring-2 ring-primary/15",
        className,
      )}
    >
      {initials}
    </span>
  );
}

/** Emoji 3D (papel das ilustrações 3D do Calm Kids). */
export function Emoji({ name, className }: { name: EmojiName; className?: string }) {
  return (
    <img
      src={emoji[name]}
      alt=""
      width={192}
      height={192}
      loading="lazy"
      decoding="async"
      className={cn("object-contain", className)}
    />
  );
}

export const tintClass = {
  rose: "bg-tint-rose",
  honey: "bg-tint-honey",
  sage: "bg-tint-sage",
  lavender: "bg-tint-lavender",
} as const;

/** Emoji dentro de um quadrado arredondado colorido (como os ícones dos tiles do Calm Kids). */
export function EmojiBadge({
  name,
  tint = "rose",
  size = "md",
}: {
  name: EmojiName;
  tint?: keyof typeof tintClass;
  size?: "sm" | "md" | "lg";
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "grid shrink-0 place-items-center",
        tintClass[tint],
        size === "sm" && "size-10 rounded-xl [&_img]:size-6",
        size === "md" && "size-12 rounded-2xl [&_img]:size-8",
        size === "lg" && "size-16 rounded-tile [&_img]:size-11",
      )}
    >
      <Emoji name={name} />
    </span>
  );
}

/** Protagonista em pé (papel do Calminho no Calm Kids). `className` define a altura. */
export function Character({ pose, className }: { pose: Pose; className?: string }) {
  return (
    <img
      src={personagem[pose]}
      alt=""
      width={240}
      height={560}
      decoding="async"
      className={cn("w-auto object-contain", className)}
    />
  );
}

/** Arte do cenário (quadrada). */
export function ScenarioArt({ id, className }: { id: ScenarioId; className?: string }) {
  return (
    <img
      src={cenarioArte[id]}
      alt=""
      width={480}
      height={480}
      loading="lazy"
      decoding="async"
      className={cn("object-contain", className)}
    />
  );
}

/** Arte do cenário num quadrado arredondado colorido (mesmo formato do EmojiBadge). */
export function ScenarioBadge({
  id,
  tint,
  size = "md",
}: {
  id: ScenarioId;
  tint: keyof typeof tintClass;
  size?: "sm" | "md" | "lg";
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "grid shrink-0 place-items-center",
        tintClass[tint],
        size === "sm" && "size-10 rounded-xl [&_img]:size-8",
        size === "md" && "size-12 rounded-2xl [&_img]:size-10",
        size === "lg" && "size-16 rounded-tile [&_img]:size-14",
      )}
    >
      <ScenarioArt id={id} />
    </span>
  );
}

/** Barra dos 21 dias dividida pelas 4 fases. */
export function PhaseBar({ completed }: { completed: number }) {
  return (
    <div
      role="progressbar"
      aria-label="Dias concluídos do plano"
      aria-valuemin={0}
      aria-valuemax={21}
      aria-valuenow={completed}
      className="flex h-2.5 gap-1"
    >
      {planPhases.map((phase) => {
        const size = phase.last - phase.first + 1;
        const done = Math.max(0, Math.min(size, completed - phase.first + 1));
        return (
          <span
            key={phase.phase}
            style={{ flex: size }}
            className="relative overflow-hidden rounded-full bg-muted"
          >
            <span
              className="absolute inset-y-0 left-0 rounded-full bg-primary transition-all"
              style={{ width: `${(done / size) * 100}%` }}
            />
          </span>
        );
      })}
    </div>
  );
}

/** Barra de progresso do card em degradê (Meta da semana do Calm Kids).
 * `tone="primary"` é a mesma barra sobre fundo claro (cards brancos). */
export function GoalProgress({
  value,
  max,
  label,
  tone = "light",
}: {
  value: number;
  max: number;
  label: string;
  tone?: "light" | "primary";
}) {
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      className={cn(
        "h-2.5 flex-1 overflow-hidden rounded-full",
        tone === "light" ? "bg-card/25" : "bg-primary/15",
      )}
    >
      <div
        className={cn(
          "h-full rounded-full transition-all",
          tone === "light" ? "bg-card" : "bg-primary",
        )}
        style={{ width: `${Math.min(100, (value / max) * 100)}%` }}
      />
    </div>
  );
}

/** Tela cheia no mesmo formato do Overlay do CalmBaby: voltar, rótulo pequeno e título. */
export function Overlay({
  eyebrow,
  title,
  onClose,
  closeIcon = "back",
  children,
}: {
  eyebrow?: string;
  title: string;
  onClose: () => void;
  closeIcon?: "back" | "close";
  children: ReactNode;
}) {
  return (
    <DialogPrimitive.Root open onOpenChange={(open) => !open && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-background" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className="fixed inset-0 z-50 overflow-y-auto bg-background text-foreground outline-none"
        >
          <div className="mx-auto min-h-full max-w-[430px] pb-10">
            <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-background px-4 pb-4 pt-[max(1rem,env(safe-area-inset-top))]">
              <Button
                variant="outline"
                size="icon"
                className="size-11 shrink-0 rounded-xl"
                aria-label={closeIcon === "close" ? "Fechar" : "Voltar"}
                onClick={onClose}
              >
                {closeIcon === "close" ? <X /> : <ArrowLeft />}
              </Button>
              <div className="min-w-0">
                {eyebrow && <p className="eyebrow truncate tracking-widest">{eyebrow}</p>}
                <DialogPrimitive.Title asChild>
                  <h1 className="truncate font-display text-lg font-extrabold">{title}</h1>
                </DialogPrimitive.Title>
              </div>
            </header>
            <main className="px-4 py-6">{children}</main>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

export function SectionTitle({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h2 className={cn("mb-3 mt-6 font-display text-lg font-extrabold", className)}>{children}</h2>
  );
}

/** Frase de destaque num card colorido com emoji (no lugar das citações em serifa). */
export function Highlight({
  children,
  emoji: name = "brilho",
  tint = "honey",
}: {
  children: ReactNode;
  emoji?: EmojiName;
  tint?: keyof typeof tintClass;
}) {
  return (
    <div className={cn("flex items-center gap-3 rounded-card p-4", tintClass[tint])}>
      <Emoji name={name} className="size-10 shrink-0" />
      <p className="font-display text-[15px] font-extrabold leading-snug">{children}</p>
    </div>
  );
}

/** Item de checklist marcável (Reset e Meu Plano de 48 Horas). */
export function CheckRow({
  checked,
  onToggle,
  children,
}: {
  checked: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={checked}
      onClick={onToggle}
      className={cn(
        "flex w-full cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 text-left text-sm leading-6 transition-colors",
        checked ? "border-success/40 bg-success-soft" : "border-border bg-card hover:bg-muted",
      )}
    >
      <span
        className={cn(
          "mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border-2",
          checked ? "border-success bg-success text-primary-foreground" : "border-border",
        )}
      >
        {checked && <Check className="size-3.5" strokeWidth={3} />}
      </span>
      {children}
    </button>
  );
}

/** Rede de apoio (CVV 188 e 180). `highlight` põe em destaque quando o diagnóstico pede. */
export function CareLines({ highlight }: { highlight: boolean }) {
  return (
    <div
      className={cn(
        "rounded-card p-4",
        highlight ? "bg-tint-rose" : "border border-border bg-card",
      )}
    >
      <p className="text-sm font-extrabold">
        Se a dor estiver pesada demais, fale com alguém agora.
      </p>
      <div className="mt-3 space-y-2">
        {careLines.map((line) => (
          <a
            key={line.phone}
            href={`tel:${line.phone}`}
            className="flex items-center gap-3 rounded-xl bg-card px-3 py-2.5 shadow-soft hover:bg-muted"
          >
            <Phone className="size-4 shrink-0 text-primary" />
            <span className="flex-1 text-[13px] font-semibold">{line.label}</span>
            <span className="font-display text-lg font-black text-primary">{line.phone}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
