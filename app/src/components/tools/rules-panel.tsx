import { useEffect, useRef } from "react";
import { Check, X } from "lucide-react";

import { Character, Emoji, Highlight, Overlay, SectionTitle } from "@/components/common";
import { commitment, rules, signalTitle, signals, type SignalKind } from "@/lib/guide";
import { cn } from "@/lib/utils";

export type RulesSection = "errors" | "never" | "relapse" | "signals";

/** Regras de ouro (biblioteca fixa): os 3 erros, o que nunca enviar, como não voltar ao padrão e
 * os sinais. `section` rola direto para a parte pedida pelo atalho da Home. */
export function RulesPanel({
  section,
  onClose,
}: {
  section?: RulesSection | undefined;
  onClose: () => void;
}) {
  const refs = useRef<Partial<Record<RulesSection, HTMLElement | null>>>({});

  useEffect(() => {
    if (section && section !== "errors") refs.current[section]?.scrollIntoView({ block: "start" });
  }, [section]);

  return (
    <Overlay eyebrow="Biblioteca" title="Regras de ouro" onClose={onClose}>
      <section ref={(el) => void (refs.current.errors = el)} className="scroll-mt-24">
        <div className="flex items-center gap-4 rounded-card bg-tint-honey p-4">
          <Emoji name="regras" className="size-16 shrink-0" />
          <h2 className="font-display text-xl font-black leading-tight">
            Os 3 erros que afastam ainda mais
          </h2>
        </div>
        <ol className="mt-4 space-y-3">
          {rules.errors.map((error, index) => (
            <li key={error.title} className="flex gap-3 rounded-card bg-card p-4 shadow-soft">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary-soft font-display text-base font-black text-primary">
                {index + 1}
              </span>
              <div>
                <p className="font-display text-[15px] font-extrabold leading-snug">
                  {error.title}
                </p>
                <p className="mt-1 text-[13px] leading-snug text-muted-foreground">{error.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section
        ref={(el) => void (refs.current.never = el)}
        className="relative mt-6 scroll-mt-24 overflow-hidden rounded-card bg-goal-card p-5 text-primary-foreground shadow-glow"
      >
        <Emoji
          name="nunca"
          className="pointer-events-none absolute -right-1 top-3 size-20 drop-shadow-[0_10px_14px_rgba(90,20,38,0.28)]"
        />
        <p className="eyebrow eyebrow-light">Nunca envie</p>
        <h2 className="mt-1 max-w-[70%] font-display text-xl font-black leading-snug">
          O que nunca enviar
        </h2>
        <ul className="mt-4 space-y-2">
          {rules.neverSend.map((item) => (
            <li
              key={item}
              className="flex items-center gap-3 rounded-xl bg-card/15 px-3 py-2.5 text-sm font-bold"
            >
              <X className="size-4 shrink-0" />
              {item}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-[13px] font-bold leading-snug text-primary-foreground/85">
          Se você precisa de resposta para se sentir bem, ainda não é hora de enviar.
        </p>
      </section>

      <section ref={(el) => void (refs.current.relapse = el)} className="scroll-mt-24">
        <SectionTitle>Como não voltar ao padrão antigo</SectionTitle>
        <ol className="space-y-3">
          {rules.relapse.map((item, index) => (
            <li
              key={item}
              className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3"
            >
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-primary-soft text-[11px] font-extrabold text-primary">
                {index + 1}
              </span>
              <span className="text-sm font-semibold leading-6">{item}</span>
            </li>
          ))}
        </ol>
      </section>

      <section ref={(el) => void (refs.current.signals = el)} className="scroll-mt-24">
        <SectionTitle>Sinais para observar</SectionTitle>
        {(Object.keys(signals) as SignalKind[]).map((kind) => (
          <div key={kind} className="mb-4">
            <p className="eyebrow mb-2">{signalTitle[kind]}</p>
            <ul className="space-y-2">
              {signals[kind].map((signal) => (
                <li
                  key={signal}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold",
                    kind === "open" ? "bg-success-soft" : "bg-primary-soft",
                  )}
                >
                  <span
                    className={cn(
                      "grid size-7 shrink-0 place-items-center rounded-full text-primary-foreground",
                      kind === "open" ? "bg-success" : "bg-primary",
                    )}
                  >
                    {kind === "open" ? <Check className="size-4" /> : <X className="size-4" />}
                  </span>
                  {signal}
                </li>
              ))}
            </ul>
          </div>
        ))}
        <Highlight emoji="sinais" tint="lavender">
          Observe sem interpretar demais. Ajuste, não insista.
        </Highlight>
      </section>
    </Overlay>
  );
}

/** Os limites do protocolo, sempre à mão. */
export function CommitmentPanel({ onClose }: { onClose: () => void }) {
  return (
    <Overlay eyebrow="Você escolheu" title="Meu compromisso" onClose={onClose}>
      <div className="flex items-center gap-4 rounded-card bg-tint-sage p-4">
        <Character pose="maoNoPeito" className="-my-2 h-28 shrink-0" />
        <h2 className="font-display text-xl font-black leading-tight">A mudança começa em você.</h2>
      </div>
      <ul className="mt-5 space-y-3">
        {commitment.map((item) => (
          <li
            key={item}
            className="flex items-start gap-3 rounded-xl border border-success/40 bg-success-soft px-4 py-3"
          >
            <span className="grid size-7 shrink-0 place-items-center rounded-full bg-success text-primary-foreground">
              <Check className="size-4" />
            </span>
            <span className="text-sm leading-6">{item}</span>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-sm leading-6 text-muted-foreground">
        Este protocolo não é sobre manipular ninguém. É sobre mudar a sua forma de agir e de se
        comunicar. O resultado não depende só de você, e o que você constrói aqui continua seu.
      </p>
    </Overlay>
  );
}
