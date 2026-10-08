import { useState, type ReactNode } from "react";
import { Check, Compass, KeyRound, Lock, X } from "lucide-react";

import { Emoji } from "@/components/common";
import { LimitNotice, ResetShell } from "@/components/reset/reset-common";
import { Button } from "@/components/ui/button";
import { buildTrustMap, respectsLimit } from "@/lib/reset/diagnosis";
import { useReset } from "@/lib/reset/store";
import { cn } from "@/lib/utils";

function Block({
  title,
  tone = "neutral",
  children,
}: {
  title: string;
  tone?: "neutral" | "good" | "warn" | "gold";
  children: ReactNode;
}) {
  return (
    <section
      className={cn(
        "rounded-card p-4",
        tone === "neutral" && "bg-card shadow-soft",
        tone === "good" && "bg-success-soft",
        tone === "warn" && "bg-primary-soft",
        tone === "gold" && "border-2 border-brand-gold/40 bg-tint-gold",
      )}
    >
      <p
        className={cn(
          "text-[11px] font-extrabold uppercase tracking-widest",
          tone === "good"
            ? "text-success"
            : tone === "warn"
              ? "text-primary"
              : tone === "gold"
                ? "text-brand-gold"
                : "text-reset",
        )}
      >
        {title}
      </p>
      <div className="mt-1.5 text-sm leading-6">{children}</div>
    </section>
  );
}

function List({ items, icon }: { items: string[]; icon: "check" | "x" | "dot" }) {
  return (
    <ul className="space-y-1.5">
      {items.map((item) => (
        <li key={item} className="flex gap-2">
          {icon === "check" ? (
            <Check className="mt-1 size-4 shrink-0 text-success" strokeWidth={3} />
          ) : icon === "x" ? (
            <X className="mt-1 size-4 shrink-0 text-primary" strokeWidth={3} />
          ) : (
            <span aria-hidden className="mt-2.5 size-1.5 shrink-0 rounded-full bg-reset" />
          )}
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

/** Módulo 05 (bônus secreto): Mapa de Reconstrução da Confiança, gerado a partir do diagnóstico,
 * com uma revelação na primeira vez. */
export function BonusModule({
  onBack,
  startDiagnosis,
}: {
  onBack: () => void;
  startDiagnosis: () => void;
}) {
  const { data, current, update } = useReset();
  const [revealing, setRevealing] = useState(false);

  if (!current)
    return (
      <ResetShell
        eyebrow="Módulo 05 · Bônus secreto"
        title="Mapa de Reconstrução da Confiança"
        onBack={onBack}
      >
        <div className="rounded-card bg-reset-soft p-6 text-center">
          <Lock className="mx-auto size-8 text-reset" />
          <p className="mt-3 font-display text-lg font-extrabold">
            Seu mapa nasce do seu diagnóstico
          </p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Responda às seis perguntas do diagnóstico para gerar o seu Mapa de Reconstrução da
            Confiança.
          </p>
          <Button
            className="mt-4 h-11 w-full rounded-xl bg-reset font-bold hover:bg-reset/90"
            onClick={startDiagnosis}
          >
            Fazer o diagnóstico
          </Button>
        </div>
      </ResetShell>
    );

  const map = buildTrustMap(current.answers);
  const revealed = Boolean(data.bonusRevealedAt);

  if (!revealed)
    return (
      <ResetShell
        eyebrow="Módulo 05 · Bônus secreto"
        title="Mapa de Reconstrução da Confiança"
        onBack={onBack}
      >
        <div className="relative overflow-hidden rounded-card bg-reset p-6 text-center text-primary-foreground shadow-soft">
          <div className={cn("transition-all duration-700", revealing && "scale-110 opacity-0")}>
            <KeyRound className="mx-auto size-10 text-brand-gold drop-shadow" />
            <p className="mt-4 text-[11px] font-extrabold uppercase tracking-widest text-primary-foreground/75">
              Exclusivo para você
            </p>
            <p className="mt-1 font-display text-2xl font-black leading-tight">
              Seu mapa está pronto
            </p>
            <p className="mt-2 text-sm leading-6 text-primary-foreground/90">
              Montado a partir das suas respostas: a situação atual, a principal barreira, os sinais
              para observar e o próximo passo.
            </p>
          </div>
        </div>
        <Button
          className="mt-4 h-12 w-full rounded-xl bg-brand-gold font-bold text-white hover:bg-brand-gold/90"
          disabled={revealing}
          onClick={() => {
            setRevealing(true);
            window.setTimeout(() => {
              update(
                (d) => ({ ...d, bonusRevealedAt: new Date().toISOString() }),
                "Revelou o Mapa de Reconstrução da Confiança",
              );
            }, 700);
          }}
        >
          <KeyRound /> Revelar meu mapa
        </Button>
      </ResetShell>
    );

  return (
    <ResetShell
      eyebrow="Módulo 05 · Bônus secreto"
      title="Mapa de Reconstrução da Confiança"
      onBack={onBack}
    >
      <div className="space-y-3 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-700">
        <div className="flex items-center gap-3">
          <Emoji name="estrela" className="size-12 shrink-0" />
          <p className="text-sm leading-6 text-muted-foreground">
            Orientações a partir do que você contou no diagnóstico. Não são certezas sobre o que ele
            pensa ou sente.
          </p>
        </div>
        {respectsLimit(current.answers) && <LimitNotice />}
        <Block title="Situação atual">{map.situation}</Block>
        <Block title="Principal barreira de comunicação">{map.barrier}</Block>
        <Block title="Atitudes que podem prejudicar a confiança" tone="warn">
          <List items={map.harmful} icon="x" />
        </Block>
        <Block title="Possíveis ações de reparação">
          <List items={map.repair} icon="dot" />
        </Block>
        <Block title="Sinais de abertura para um diálogo" tone="good">
          <List items={map.openSigns} icon="check" />
        </Block>
        <Block title="Sinais de que é melhor respeitar o afastamento" tone="warn">
          <List items={map.respectSigns} icon="x" />
        </Block>
        <Block title="Próximo passo recomendado" tone="gold">
          <p className="flex gap-2 font-semibold">
            <Compass className="mt-1 size-4 shrink-0 text-brand-gold" />
            {map.nextStep}
          </p>
        </Block>
        <p className="pt-2 text-center text-xs text-muted-foreground">
          Se a sua situação mudar, refaça o diagnóstico: o mapa se atualiza.
        </p>
      </div>
    </ResetShell>
  );
}
