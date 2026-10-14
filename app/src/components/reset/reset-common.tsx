import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowLeft, X } from "lucide-react";

import { useCommContext } from "@/components/comunicacao/hooks";
import { Button } from "@/components/ui/button";
import { respectsLimit } from "@/lib/reset/diagnosis";
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

// Mora em components/common.tsx (também usado no Meu Plano de 48 Horas).
export { CheckRow } from "@/components/common";

/**
 * Limite valendo no Reset: o do diagnóstico do Reset ou o do diagnóstico principal do app (mesma
 * regra da Central). Assim, o upsell nunca sugere contato quando o resto do app diz que não.
 */
export function useResetLimit() {
  const { current } = useReset();
  const appLimit = useCommContext().stance === "limite";
  return { appLimit, limit: appLimit || (current ? respectsLimit(current.answers) : false) };
}

/** Aviso fixo quando ele pediu para não haver contato ou bloqueou. */
export function LimitNotice({ children }: { children?: ReactNode }) {
  return (
    <div
      role="note"
      className="rounded-xl border border-reset/30 bg-reset-soft px-4 py-3 text-sm leading-6 text-foreground"
    >
      <b>Seu plano respeita o limite que ele colocou.</b>{" "}
      {children ??
        "Nada aqui envolve entrar em contato com ele. Tudo o que você escrever fica só com você."}
    </div>
  );
}
