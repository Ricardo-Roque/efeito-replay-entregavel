import { useState } from "react";
import { BookOpenCheck, Check, Copy, Trash2 } from "lucide-react";

import {
  CheckRow,
  LimitNotice,
  NoteField,
  ResetShell,
  SectionLabel,
} from "@/components/reset/reset-common";
import { Button } from "@/components/ui/button";
import { copyText } from "@/lib/clipboard";
import {
  apologyAvoid,
  apologyParts,
  forgivenessLessons,
  responsibilityPrompts,
} from "@/lib/reset/content";
import { respectsLimit } from "@/lib/reset/diagnosis";
import { useReset } from "@/lib/reset/store";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

/** Módulo 01: lições curtas, exercícios de reflexão, Mapa das Mágoas e pedido de desculpas. */
export function ForgivenessModule({ onBack }: { onBack: () => void }) {
  const { data, current, update, addHurt, removeHurt } = useReset();
  const { showToast } = useStore();
  const limit = current ? respectsLimit(current.answers) : false;
  const [open, setOpen] = useState<string | null>(forgivenessLessons[0]!.id);
  const [hurt, setHurt] = useState({ event: "", consequences: "", repair: "" });

  const markRead = (id: string, title: string) =>
    update(
      (d) => ({ ...d, lessonsRead: { ...d.lessonsRead, [id]: new Date().toISOString() } }),
      `Leu a lição "${title}"`,
    );

  const apologyText = apologyParts
    .map((part) => data.apology[part.id]?.trim())
    .filter(Boolean)
    .join(" ");

  const setApology = (id: string, value: string) =>
    update((d) => ({ ...d, apology: { ...d.apology, [id]: value } }));

  const avoidKey = (index: number) => `evitar:${index}`;

  return (
    <ResetShell eyebrow="Módulo 01" title="Consciência do Perdão" onBack={onBack}>
      <p className="text-sm leading-6 text-muted-foreground">
        Entender como o ressentimento e a quebra de confiança afetam uma reaproximação, assumir a
        sua parte e, quando fizer sentido, preparar um pedido de desculpas sincero.
      </p>
      {limit && (
        <div className="mt-4">
          <LimitNotice />
        </div>
      )}

      <SectionLabel>1 · Lições</SectionLabel>
      <div className="space-y-2.5">
        {forgivenessLessons.map((lesson, index) => {
          const read = Boolean(data.lessonsRead[lesson.id]);
          const expanded = open === lesson.id;
          return (
            <section key={lesson.id} className="overflow-hidden rounded-card bg-card shadow-soft">
              <button
                type="button"
                aria-expanded={expanded}
                onClick={() => setOpen(expanded ? null : lesson.id)}
                className="flex w-full cursor-pointer items-center gap-3 p-4 text-left"
              >
                <span
                  className={cn(
                    "grid size-8 shrink-0 place-items-center rounded-full text-sm font-black",
                    read ? "bg-success text-primary-foreground" : "bg-reset-soft text-reset",
                  )}
                >
                  {read ? <Check className="size-4" strokeWidth={3} /> : index + 1}
                </span>
                <span className="flex-1 font-display text-[15px] font-extrabold">
                  {lesson.title}
                </span>
              </button>
              {expanded && (
                <div className="space-y-3 border-t border-border px-4 pb-4 pt-3">
                  {lesson.text.map((paragraph) => (
                    <p key={paragraph} className="text-sm leading-6">
                      {paragraph}
                    </p>
                  ))}
                  <NoteField noteKey={`licao:${lesson.id}`} label={lesson.reflection} />
                  {!read && (
                    <Button
                      variant="outline"
                      className="h-10 w-full rounded-xl bg-card font-bold"
                      onClick={() => {
                        markRead(lesson.id, lesson.title);
                        setOpen(forgivenessLessons[index + 1]?.id ?? null);
                      }}
                    >
                      <BookOpenCheck /> Marcar como lida
                    </Button>
                  )}
                </div>
              )}
            </section>
          );
        })}
      </div>

      <SectionLabel>2 · Exercício de responsabilidade emocional</SectionLabel>
      <div className="space-y-4 rounded-card bg-card p-4 shadow-soft">
        {responsibilityPrompts.map((prompt, index) => (
          <NoteField key={prompt} noteKey={`responsabilidade:${index}`} label={prompt} rows={2} />
        ))}
      </div>

      <SectionLabel>3 · Mapa das Mágoas</SectionLabel>
      <div className="rounded-card bg-reset-soft p-4">
        <p className="text-sm leading-6">
          Para cada acontecimento que ainda pesa, registre o que aconteceu, as consequências e o que
          poderia ajudar a reparar. Só você vê.
        </p>
        <form
          className="mt-3 space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            if (!hurt.event.trim()) return;
            if (
              addHurt({
                event: hurt.event.trim(),
                consequences: hurt.consequences.trim(),
                repair: hurt.repair.trim(),
              })
            ) {
              setHurt({ event: "", consequences: "", repair: "" });
              showToast("Mágoa registrada no seu mapa.");
            }
          }}
        >
          {(
            [
              ["event", "O acontecimento", "O que aconteceu, com suas palavras."],
              ["consequences", "As consequências", "O que mudou entre vocês depois disso."],
              ["repair", "Possíveis formas de reparação", "O que estaria ao seu alcance fazer."],
            ] as const
          ).map(([field, label, placeholder]) => (
            <div key={field}>
              <label htmlFor={`hurt-${field}`} className="text-sm font-bold">
                {label}
              </label>
              <textarea
                id={`hurt-${field}`}
                rows={2}
                maxLength={1000}
                value={hurt[field]}
                placeholder={placeholder}
                onChange={(event) => setHurt((h) => ({ ...h, [field]: event.target.value }))}
                className="mt-1.5 w-full resize-none rounded-xl border border-input bg-card p-3 text-base outline-none focus:border-reset"
              />
            </div>
          ))}
          <Button
            type="submit"
            disabled={!hurt.event.trim()}
            className="h-11 w-full rounded-xl bg-reset font-bold hover:bg-reset/90"
          >
            Adicionar ao mapa
          </Button>
        </form>
      </div>
      {data.hurts.length > 0 && (
        <ul className="mt-3 space-y-2.5">
          {data.hurts.map((item) => (
            <li key={item.id} className="rounded-card bg-card p-4 shadow-soft">
              <div className="flex items-start gap-2">
                <p className="flex-1 text-sm font-extrabold leading-snug">{item.event}</p>
                <button
                  type="button"
                  aria-label="Apagar esta mágoa"
                  onClick={() => removeHurt(item.id)}
                  className="grid size-8 shrink-0 cursor-pointer place-items-center rounded-full text-muted-foreground hover:bg-muted"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
              {item.consequences && (
                <p className="mt-2 text-[13px] leading-snug">
                  <b>Consequências:</b> {item.consequences}
                </p>
              )}
              {item.repair && (
                <p className="mt-1 text-[13px] leading-snug">
                  <b>Reparação:</b> {item.repair}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}

      <SectionLabel>4 · Pedido de desculpas sincero</SectionLabel>
      <p className="text-sm leading-6 text-muted-foreground">
        {limit
          ? "Escreva para organizar o que você sente. Neste momento, ele fica guardado só com você."
          : "Monte o pedido por partes. Depois, decida com calma se é o momento de enviar."}
      </p>
      <div className="mt-3 space-y-3">
        {apologyParts.map((part) => (
          <div key={part.id} className="rounded-card bg-card p-4 shadow-soft">
            <label htmlFor={`apology-${part.id}`} className="text-sm font-extrabold">
              {part.label}
            </label>
            <p className="text-xs leading-5 text-muted-foreground">{part.hint}</p>
            <textarea
              id={`apology-${part.id}`}
              rows={2}
              maxLength={600}
              defaultValue={data.apology[part.id] ?? ""}
              placeholder={part.example}
              onBlur={(event) => setApology(part.id, event.target.value.trim())}
              className="mt-2 w-full resize-none rounded-xl border border-input bg-background p-3 text-base outline-none focus:border-reset"
            />
          </div>
        ))}
      </div>
      {apologyText && (
        <div className="mt-3 rounded-card border-2 border-reset/30 bg-reset-soft p-4">
          <p className="text-[11px] font-extrabold uppercase tracking-widest text-reset">
            Seu pedido, completo
          </p>
          <p className="mt-2 whitespace-pre-line text-[15px] leading-6">{apologyText}</p>
          {!limit && (
            <Button
              variant="outline"
              className="mt-3 h-10 w-full rounded-xl bg-card font-bold"
              onClick={() =>
                void copyText(apologyText).then((ok) =>
                  showToast(
                    ok ? "Copiado. Antes de enviar, passe pela Pausa." : "Não foi possível copiar.",
                    ok ? "info" : "error",
                  ),
                )
              }
            >
              <Copy /> Copiar
            </Button>
          )}
        </div>
      )}

      <SectionLabel>5 · Checklist: o que evitar no pedido</SectionLabel>
      <div className="space-y-2">
        {apologyAvoid.map((item, index) => {
          const checked = data.notes[avoidKey(index)] === "1";
          return (
            <CheckRow
              key={item}
              checked={checked}
              onToggle={() =>
                update((d) => ({
                  ...d,
                  notes: { ...d.notes, [avoidKey(index)]: checked ? "" : "1" },
                }))
              }
            >
              <span>
                <span className="font-semibold">{item}</span>
                <span className="block text-xs text-muted-foreground">
                  {checked ? "Conferido: meu pedido não faz isso." : "Toque quando conferir."}
                </span>
              </span>
            </CheckRow>
          );
        })}
      </div>
    </ResetShell>
  );
}
