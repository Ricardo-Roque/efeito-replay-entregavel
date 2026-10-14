import { useState } from "react";
import { ArrowRight, Check, Hourglass, Trash2 } from "lucide-react";

import { Emoji, GoalProgress } from "@/components/common";
import { Button } from "@/components/ui/button";
import { moods, signalTitle, signals, type SignalKind } from "@/lib/guide";
import type { EmojiName } from "@/lib/illustrations";
import {
  IMPULSE_GOAL,
  calendarDaysBetween,
  formatWhen,
  impulseFreeDays,
  isDraftReady,
} from "@/lib/progress";
import {
  ENTRY_SOURCES,
  useStore,
  type EntrySource,
  type EntryType,
  type JournalEntry,
} from "@/lib/store";
import { cn } from "@/lib/utils";

const entryInfo: Record<EntryType, { label: string; emoji: EmojiName }> = {
  mood: { label: "Como eu estava", emoji: "humor3" },
  held: { label: "Segurei o impulso", emoji: "escudo" },
  acted: { label: "Agi por impulso", emoji: "celular" },
  contact: { label: "Ele fez contato", emoji: "contato" },
  draft: { label: "Rascunho guardado", emoji: "pausa" },
  signal: { label: "Sinal percebido", emoji: "sinais" },
  note: { label: "Anotação", emoji: "escrever" },
};

/** Rótulo pela origem (registros feitos pelas outras ferramentas). Sem origem, vale o tipo. */
const sourceInfo: Record<EntrySource, { label: string; emoji: EmojiName }> = {
  diagnostico: { label: "Diagnóstico", emoji: "ok" },
  first48: { label: "Meu Plano de 48 Horas", emoji: "estrela" },
  cenario: { label: "Mudança de cenário", emoji: "sinais" },
  contato: { label: "Ele fez contato", emoji: "contato" },
  nao_enviar: { label: "Decidi não enviar", emoji: "escudo" },
  progresso: { label: "Progresso", emoji: "medalha" },
  plano: { label: "Plano de 21 dias", emoji: "diario" },
  central: { label: "Central de Comunicação", emoji: "celular" },
};

const sourceOf = (entry: JournalEntry): EntrySource | null =>
  entry.source && ENTRY_SOURCES.includes(entry.source) ? entry.source : null;

function infoOf(entry: JournalEntry) {
  const source = sourceOf(entry);
  // O rascunho da Pausa continua com o rótulo próprio (ele tem o botão de reler).
  if (source && entry.type !== "draft") return sourceInfo[source];
  return entryInfo[entry.type];
}

type Filter = "all" | "notes" | "contact" | "held" | "progress";

const filters: { id: Filter; label: string }[] = [
  { id: "all", label: "Tudo" },
  { id: "notes", label: "Reflexões" },
  { id: "contact", label: "Contato" },
  { id: "held", label: "Não enviei" },
  { id: "progress", label: "Progresso" },
];

function matchesFilter(entry: JournalEntry, filter: Filter) {
  const source = sourceOf(entry);
  if (filter === "all") return true;
  if (filter === "contact") return entry.type === "contact";
  if (filter === "held")
    return entry.type === "held" || entry.type === "draft" || source === "nao_enviar";
  if (filter === "progress")
    return source === "progresso" || source === "diagnostico" || source === "cenario";
  return (
    entry.type === "note" &&
    (source === null || source === "plano" || source === "first48" || source === "central")
  );
}

const PAGE = 20;

const moodEmoji: EmojiName[] = ["humor1", "humor2", "humor3", "humor4", "humor5"];

function entryDetail(entry: JournalEntry, now: Date) {
  const when = formatWhen(entry.at, now);
  if (entry.type === "signal")
    return `${when} · ${entry.signalKind ? signalTitle[entry.signalKind] : ""}: ${entry.signal ?? ""}`;
  if (entry.type === "draft" && entry.readyAt) {
    return isDraftReady(entry, now)
      ? `${when} · 24 horas já passaram`
      : `${when} · pode reler ${formatWhen(entry.readyAt, now).toLowerCase()}`;
  }
  return when;
}

/** Aba Diário, no formato do Diário do sono do CalmBaby: evolução no topo, registrar,
 * sinais e últimos registros. */
export function DiaryScreen({
  openPause,
  openReply,
}: {
  openPause: (draft?: string) => void;
  /** "Ele respondeu. E agora?", oferecido logo depois de registrar que ele fez contato. */
  openReply: () => void;
}) {
  const { data, addEntry, deleteEntry, toggleSignal, showToast } = useStore();
  const [note, setNote] = useState("");
  const [contacted, setContacted] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const [limit, setLimit] = useState(PAGE);
  const now = new Date();
  const impulse = impulseFreeDays(data, now);
  const todayMood = [...data.journal]
    .reverse()
    .find(
      (entry) => entry.type === "mood" && calendarDaysBetween(new Date(entry.at), now) === 0,
    )?.mood;
  const todaySignals = new Set(
    data.journal
      .filter(
        (entry) => entry.type === "signal" && calendarDaysBetween(new Date(entry.at), now) === 0,
      )
      .map((entry) => entry.signal),
  );
  // Nenhum registro antigo some: a lista mostra 20 de cada vez, com "Ver registros anteriores".
  const history = [...data.journal]
    .reverse()
    .filter((entry) => entry.type !== "mood" && matchesFilter(entry, filter));
  const recent = history.slice(0, limit);

  const quick = (type: "held" | "acted" | "contact") => {
    if (!addEntry({ type })) return;
    if (type === "contact") setContacted(true);
    showToast(
      type === "held"
        ? "Registrado. Cada impulso segurado conta."
        : type === "acted"
          ? "Registrado. O contador recomeça hoje, e recomeçar faz parte."
          : "Registrado. Marque abaixo os sinais que você percebeu.",
    );
  };

  const saveNote = () => {
    const text = note.trim();
    if (!text) return;
    if (addEntry({ type: "note", text })) {
      setNote("");
      showToast("Anotação salva no Diário.");
    }
  };

  return (
    <div className="px-5 pb-36 pt-[max(2rem,env(safe-area-inset-top))]">
      <h1 className="font-display text-3xl font-black">Diário</h1>
      <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
        Anote o impulso em vez de enviar. Aqui fica a sua evolução.
      </p>

      <section className="relative mt-6 overflow-hidden rounded-card bg-goal-card p-5 text-primary-foreground shadow-glow">
        <p className="eyebrow eyebrow-light">Dias sem agir por impulso</p>
        <div className="mt-2 flex items-end gap-2">
          <span className="font-display text-5xl font-black tabular-nums">{impulse}</span>
          <span className="pb-1.5 text-sm font-bold text-primary-foreground/85">
            {impulse === 1 ? "dia" : "dias"}
          </span>
        </div>
        <Emoji
          name={impulse >= IMPULSE_GOAL ? "medalha" : "escudo"}
          className="pointer-events-none absolute -right-1 top-3 size-24 drop-shadow-[0_10px_14px_rgba(90,20,38,0.28)]"
        />
        <div className="mt-4 flex items-center gap-3">
          <GoalProgress value={impulse} max={IMPULSE_GOAL} label="Meta de 7 dias sem impulso" />
          <span className="shrink-0 text-xs font-bold">
            {Math.min(impulse, IMPULSE_GOAL)} de {IMPULSE_GOAL}
          </span>
        </div>
        <p className="mt-2.5 text-[12px] leading-snug text-primary-foreground/75">
          {impulse >= IMPULSE_GOAL
            ? "Meta da Fase 1 cumprida!"
            : "Meta da Fase 1: 7 dias. Recomeçar faz parte."}
        </p>
      </section>

      <section className="mt-5 rounded-card bg-card p-5 shadow-soft">
        <h2 className="font-display text-[16px] font-extrabold">Como você está agora?</h2>
        <div className="mt-4 grid grid-cols-5 gap-1.5">
          {moods.map((mood, index) => {
            const on = todayMood === mood;
            return (
              <button
                key={mood}
                type="button"
                aria-pressed={on}
                onClick={() => addEntry({ type: "mood", mood })}
                className={cn(
                  "flex cursor-pointer flex-col items-center gap-1 rounded-tile px-1 py-2.5 text-[11px] font-bold transition-colors",
                  on ? "bg-primary-soft text-primary ring-2 ring-primary/30" : "hover:bg-muted",
                )}
              >
                <Emoji name={moodEmoji[index]!} className="size-9" />
                {mood}
              </button>
            );
          })}
        </div>
      </section>

      <section className="mt-5 rounded-card bg-card p-5 shadow-soft">
        <h2 className="font-display text-[16px] font-extrabold">Registrar</h2>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {(["held", "acted", "contact"] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => quick(type)}
              className="flex cursor-pointer flex-col items-center gap-1.5 rounded-tile bg-card px-2 py-3 text-xs font-bold shadow-tile ring-1 ring-border/60 active:scale-95"
            >
              <Emoji name={entryInfo[type].emoji} className="size-9" />
              {entryInfo[type].label}
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs leading-snug text-muted-foreground">
          "Agi por impulso" recomeça o contador. Recomeçar faz parte.
        </p>
        {contacted && (
          <Button
            variant="outline"
            className="mt-3 h-11 w-full justify-between rounded-xl bg-card font-bold"
            onClick={openReply}
          >
            Ele escreveu? Veja o que fazer agora <ArrowRight />
          </Button>
        )}
      </section>

      <section className="mt-5 rounded-card bg-card p-5 shadow-soft">
        <h2 className="font-display text-[16px] font-extrabold">Escrever</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          O que você está sentindo, o que queria dizer, o que mudou. Só você lê.
        </p>
        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          rows={4}
          maxLength={2000}
          placeholder="Hoje eu…"
          className="mt-3 w-full resize-none rounded-xl border border-input bg-background p-3 text-base leading-normal outline-none focus:border-primary"
        />
        <Button
          className="mt-3 h-11 w-full rounded-xl font-bold"
          disabled={!note.trim()}
          onClick={saveNote}
        >
          Salvar no Diário
        </Button>
      </section>

      <section className="mt-5 rounded-card bg-card p-5 shadow-soft">
        <h2 className="font-display text-[16px] font-extrabold">Sinais que você notou hoje</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Observe sem interpretar demais. Ajuste, não insista.
        </p>
        {(Object.keys(signals) as SignalKind[]).map((kind) => (
          <div key={kind} className="mt-4">
            <p className="eyebrow mb-2">{signalTitle[kind]}</p>
            <div className="flex flex-wrap gap-2">
              {signals[kind].map((signal) => {
                const on = todaySignals.has(signal);
                return (
                  <button
                    key={signal}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggleSignal(kind, signal)}
                    className={cn(
                      "inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-2 text-[13px] font-bold transition-colors",
                      !on && "bg-muted text-foreground",
                      on && kind === "open" && "bg-success text-primary-foreground",
                      on && kind !== "open" && "bg-primary text-primary-foreground",
                    )}
                  >
                    {on && <Check className="size-3.5" />}
                    {signal}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        {[...todaySignals].some((signal) => signals.stop.includes(signal ?? "")) && (
          <p className="mt-4 rounded-xl bg-destructive-soft px-4 py-3 text-[13px] font-semibold leading-snug">
            Um pedido para parar ou de distância é a resposta dele. Respeite e volte o foco para
            você.
          </p>
        )}
      </section>

      <h2 className="mb-3 mt-8 font-display text-[17px] font-extrabold">Últimos registros</h2>
      <div
        className="-mx-5 mb-3 flex gap-2 overflow-x-auto px-5 pb-1"
        aria-label="Filtrar registros"
      >
        {filters.map((item) => {
          const on = filter === item.id;
          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={on}
              onClick={() => {
                setFilter(item.id);
                setLimit(PAGE);
              }}
              className={cn(
                "shrink-0 cursor-pointer rounded-full px-3.5 py-2 text-[13px] font-bold transition-colors",
                on ? "bg-primary text-primary-foreground" : "bg-card text-foreground shadow-soft",
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      {recent.length === 0 ? (
        <section className="flex items-center gap-3 rounded-card bg-tint-rose p-5">
          <Emoji name="diario" className="size-14 shrink-0" />
          <p className="text-[13px] leading-snug text-foreground">
            {filter === "all"
              ? 'Seus registros aparecem aqui. Comece pelo "Registrar" acima.'
              : 'Nenhum registro deste tipo ainda. Toque em "Tudo" para ver os outros.'}
          </p>
        </section>
      ) : (
        <ul className="overflow-hidden rounded-card bg-card shadow-soft">
          {recent.map((entry) => {
            const info = infoOf(entry);
            const ready = entry.type === "draft" && isDraftReady(entry, now);
            return (
              <li
                key={entry.id}
                className="flex items-start gap-3 border-b border-border px-5 py-3.5 last:border-b-0"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary-soft">
                  <Emoji name={info.emoji} className="size-6" />
                </span>
                <div className="min-w-0 flex-1">
                  <span className="block text-sm font-bold">{info.label}</span>
                  <span className="block text-xs text-muted-foreground tabular-nums">
                    {entryDetail(entry, now)}
                  </span>
                  {entry.text && (
                    <p
                      className={cn(
                        "mt-2 whitespace-pre-line rounded-xl bg-muted px-3 py-2 text-[13px] leading-snug",
                        entry.type === "draft" && "italic",
                      )}
                    >
                      {entry.text}
                    </p>
                  )}
                  {ready && entry.text && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 h-9 rounded-xl bg-card font-bold"
                      onClick={() => openPause(entry.text)}
                    >
                      <Hourglass /> Reler na Pausa
                    </Button>
                  )}
                </div>
                <button
                  type="button"
                  aria-label="Apagar registro"
                  onClick={() => deleteEntry(entry.id)}
                  className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-full text-muted-foreground hover:bg-muted"
                >
                  <Trash2 className="size-4" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
      {history.length > recent.length && (
        <Button
          variant="outline"
          className="mt-3 h-11 w-full rounded-xl bg-card font-bold"
          onClick={() => setLimit((current) => current + PAGE)}
        >
          Ver registros anteriores ({history.length - recent.length})
        </Button>
      )}
    </div>
  );
}
