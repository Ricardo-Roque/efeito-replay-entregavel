import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowLeft, Check, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useReset } from "@/lib/reset/store";
import { cn } from "@/lib/utils";

/** Tela cheia do Reset, no formato do Overlay do app: voltar, rótulo e título.
 * `night` troca para o céu noturno da Técnica de Reversão Noturna. */
export function ResetShell({
  eyebrow,
  title,
  onBack,
  backLabel = "Voltar",
  closeIcon = false,
  night = false,
  children,
}: {
  eyebrow?: string;
  title: string;
  onBack: () => void;
  backLabel?: string;
  closeIcon?: boolean;
  night?: boolean;
  children: ReactNode;
}) {
  const scroller = useRef<HTMLDivElement | null>(null);
  // Cada tela nova começa do topo.
  useEffect(() => {
    scroller.current?.scrollTo({ top: 0 });
  }, [title]);
  return (
    <div
      ref={scroller}
      className={cn(
        "fixed inset-0 z-50 overflow-y-auto",
        night ? "bg-night text-night-foreground" : "bg-background text-foreground",
      )}
    >
      <div className="mx-auto min-h-full max-w-[430px] pb-12">
        <header
          className={cn(
            "sticky top-0 z-10 flex items-center gap-3 border-b px-4 pb-4 pt-[max(1rem,env(safe-area-inset-top))]",
            night ? "border-white/10 bg-night" : "border-border bg-background",
          )}
        >
          <Button
            variant="outline"
            size="icon"
            aria-label={backLabel}
            onClick={onBack}
            className={cn(
              "shrink-0 rounded-xl",
              night && "border-white/20 bg-white/10 text-night-foreground hover:bg-white/20",
            )}
          >
            {closeIcon ? <X /> : <ArrowLeft />}
          </Button>
          <div className="min-w-0">
            {eyebrow && (
              <p
                className={cn(
                  "truncate text-[11px] font-extrabold uppercase tracking-widest",
                  night ? "text-night-foreground/70" : "text-reset",
                )}
              >
                {eyebrow}
              </p>
            )}
            <h1 className="truncate font-display text-lg font-extrabold">{title}</h1>
          </div>
        </header>
        <main className="px-4 py-6">{children}</main>
      </div>
    </div>
  );
}

export function ResetProgress({ value, label }: { value: number; label: string }) {
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
      className="h-2 overflow-hidden rounded-full bg-reset/15"
    >
      <div
        className="h-full rounded-full bg-reset transition-all duration-500"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="mb-2 mt-7 text-[11px] font-extrabold uppercase tracking-widest text-reset">
      {children}
    </p>
  );
}

/** Campo de texto que salva sozinho no aparelho ao sair do campo. */
export function NoteField({
  noteKey,
  label,
  placeholder = "Escreva aqui…",
  rows = 3,
}: {
  noteKey: string;
  label: string;
  placeholder?: string;
  rows?: number;
}) {
  const { data, setNote } = useReset();
  const saved = data.notes[noteKey] ?? "";
  const [value, setValue] = useState(saved);
  const [status, setStatus] = useState<"idle" | "saved">("idle");
  useEffect(() => setValue(saved), [saved]);
  const id = `note-${noteKey}`;
  return (
    <div>
      <label htmlFor={id} className="text-sm font-bold leading-snug">
        {label}
      </label>
      <textarea
        id={id}
        rows={rows}
        maxLength={2000}
        value={value}
        placeholder={placeholder}
        onChange={(event) => {
          setValue(event.target.value);
          setStatus("idle");
        }}
        onBlur={() => {
          if (value === saved) return;
          if (setNote(noteKey, value.trim())) setStatus("saved");
        }}
        className="mt-2 w-full resize-none rounded-xl border border-input bg-card p-3 text-base leading-normal outline-none focus:border-reset"
      />
      <p className="mt-1 h-4 text-right text-[11px] font-bold text-success" aria-live="polite">
        {status === "saved" ? "Salvo" : ""}
      </p>
    </div>
  );
}

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

/** Aviso fixo quando ele pediu para não haver contato ou bloqueou. */
export function LimitNotice() {
  return (
    <div
      role="note"
      className="rounded-xl border border-reset/30 bg-reset-soft px-4 py-3 text-sm leading-6 text-foreground"
    >
      <b>Seu plano respeita o limite que ele colocou.</b> Nada aqui envolve entrar em contato com
      ele. Tudo o que você escrever fica só com você.
    </div>
  );
}
