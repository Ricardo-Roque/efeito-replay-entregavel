import { useEffect, useState } from "react";
import { ArrowRight, ChevronDown, Moon } from "lucide-react";

import { AudioPlayer } from "@/components/reset/audio-player";
import { ResetShell } from "@/components/reset/reset-common";
import { Button } from "@/components/ui/button";
import { audioUrl } from "@/lib/reset/audio";
import { nightFeelings, nightRitual, nightScript } from "@/lib/reset/content";
import { formatWhen } from "@/lib/progress";
import { useReset } from "@/lib/reset/store";
import { newId, useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const ritualMinutes = nightRitual.reduce((sum, step) => sum + step.minutes, 0);

/** Respiração 4-4-6 guiada: o círculo cresce, segura e diminui no ritmo da contagem. */
const PHASES = [
  { label: "Inspire", seconds: 4 },
  { label: "Segure", seconds: 4 },
  { label: "Solte devagar", seconds: 6 },
];
const CYCLE = PHASES.reduce((sum, p) => sum + p.seconds, 0);

function Breathing() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const timer = window.setInterval(() => setTick((t) => t + 1), 1000);
    return () => window.clearInterval(timer);
  }, []);

  let pos = tick % CYCLE;
  let phase = 0;
  while (pos >= PHASES[phase]!.seconds) {
    pos -= PHASES[phase]!.seconds;
    phase += 1;
  }
  const current = PHASES[phase]!;
  return (
    <div className="grid place-items-center py-6">
      <div className="relative grid size-52 place-items-center">
        <div
          aria-hidden
          className={cn(
            "absolute inset-0 rounded-full bg-reset/35 transition-transform ease-in-out motion-reduce:transition-none",
            phase === 2 ? "scale-[0.55] duration-[6000ms]" : "scale-100 duration-[4000ms]",
          )}
        />
        <div className="relative text-center" aria-live="polite">
          <p className="font-display text-xl font-extrabold">{current.label}</p>
          <p className="font-display text-4xl font-black tabular-nums">{current.seconds - pos}</p>
        </div>
      </div>
      <p className="mt-2 text-sm text-night-foreground/70">
        Ciclos completos: {Math.floor(tick / CYCLE)}
      </p>
    </div>
  );
}

/** Módulo 04: área noturna com o ritual guiado de cerca de 10 minutos e o registro de sentimentos. */
export function NightModule({ onBack }: { onBack: () => void }) {
  const { data, update } = useReset();
  const { showToast } = useStore();
  const [step, setStep] = useState<number | null>(null);
  const [feeling, setFeeling] = useState("");
  const [note, setNote] = useState("");
  const [script, setScript] = useState(false);

  const save = () => {
    if (!feeling) return;
    const ok = update(
      (d) => ({
        ...d,
        night: [
          { id: newId(), at: new Date().toISOString(), feeling, note: note.trim() },
          ...d.night,
        ].slice(0, 60),
      }),
      "Fez o ritual noturno",
    );
    if (!ok) return;
    showToast("Registro salvo. Boa noite.");
    setStep(null);
    setFeeling("");
    setNote("");
  };

  const current = step === null ? null : nightRitual[step]!;

  return (
    <ResetShell
      eyebrow="Módulo 04 · Bônus"
      title="Técnica de Reversão Noturna"
      onBack={onBack}
      night
    >
      {current ? (
        <div>
          <div className="flex gap-1.5" aria-label={`Etapa ${step! + 1} de ${nightRitual.length}`}>
            {nightRitual.map((item, index) => (
              <i
                key={item.id}
                className={cn(
                  "h-1 flex-1 rounded-full",
                  index <= step! ? "bg-reset" : "bg-white/15",
                )}
              />
            ))}
          </div>
          <p className="mt-5 text-[11px] font-extrabold uppercase tracking-widest text-night-foreground/60">
            {step! + 1} de {nightRitual.length} · cerca de {current.minutes} min
          </p>
          <h2 className="mt-1 font-display text-2xl font-black">{current.title}</h2>
          <p className="mt-3 text-[15px] leading-7 text-night-foreground/90">{current.text}</p>

          {current.kind === "respiracao" && <Breathing />}

          {current.kind === "reflexao" && (
            <div className="mt-4">
              <label htmlFor="night-reflection" className="text-sm font-bold">
                Se quiser, escreva o que veio (opcional)
              </label>
              <textarea
                id="night-reflection"
                rows={3}
                maxLength={1000}
                value={note}
                onChange={(event) => setNote(event.target.value)}
                className="mt-2 w-full resize-none rounded-xl border border-white/15 bg-night-card p-3 text-base text-night-foreground outline-none focus:border-reset"
              />
            </div>
          )}

          {current.kind === "registro" && (
            <div className="mt-4">
              <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Como você está">
                {nightFeelings.map((item) => (
                  <button
                    key={item}
                    type="button"
                    role="radio"
                    aria-checked={feeling === item}
                    onClick={() => setFeeling(item)}
                    className={cn(
                      "cursor-pointer rounded-full px-4 py-2 text-sm font-bold transition-colors",
                      feeling === item
                        ? "bg-reset text-primary-foreground"
                        : "bg-white/10 text-night-foreground",
                    )}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 flex gap-2">
            <Button
              variant="outline"
              className="h-12 rounded-xl border-white/20 bg-white/10 text-night-foreground hover:bg-white/20"
              onClick={() => setStep(step! > 0 ? step! - 1 : null)}
            >
              Voltar
            </Button>
            {current.kind === "registro" ? (
              <Button
                className="h-12 flex-1 rounded-xl bg-reset font-bold hover:bg-reset/90"
                disabled={!feeling}
                onClick={save}
              >
                <Moon /> Concluir e salvar
              </Button>
            ) : (
              <Button
                className="h-12 flex-1 rounded-xl bg-reset font-bold hover:bg-reset/90"
                onClick={() => setStep(step! + 1)}
              >
                Próxima etapa <ArrowRight />
              </Button>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="rounded-card bg-night-card p-5">
            <Moon className="size-8 text-reset" />
            <p className="mt-3 text-[15px] leading-7">
              Um ritual para as noites em que a cabeça não para. Ele ajuda você a regular as suas
              próprias emoções e a acordar com mais clareza para decidir. Não muda o que outra
              pessoa pensa ou sente.
            </p>
            <p className="mt-2 text-sm font-bold text-night-foreground/70">
              {nightRitual.length} etapas · cerca de {ritualMinutes} minutos
            </p>
            <Button
              className="mt-4 h-12 w-full rounded-xl bg-reset font-bold hover:bg-reset/90"
              onClick={() => setStep(0)}
            >
              Começar o ritual guiado
            </Button>
          </div>

          <p className="mb-2 mt-7 text-[11px] font-extrabold uppercase tracking-widest text-night-foreground/60">
            Áudio noturno
          </p>
          <AudioPlayer
            src={audioUrl("noturno")}
            title="Técnica de Reversão Noturna"
            minutes={10}
            night
          />
          <button
            type="button"
            aria-expanded={script}
            onClick={() => setScript(!script)}
            className="mt-3 flex w-full cursor-pointer items-center justify-between rounded-xl bg-white/10 px-4 py-3 text-sm font-bold"
          >
            Roteiro do áudio
            <ChevronDown className={cn("size-4 transition-transform", script && "rotate-180")} />
          </button>
          {script && (
            <div className="mt-2 space-y-3 rounded-xl bg-night-card p-4">
              {nightScript.map((paragraph) => (
                <p key={paragraph} className="text-sm leading-6 text-night-foreground/90">
                  {paragraph}
                </p>
              ))}
            </div>
          )}

          {data.night.length > 0 && (
            <>
              <p className="mb-2 mt-7 text-[11px] font-extrabold uppercase tracking-widest text-night-foreground/60">
                Suas noites
              </p>
              <ul className="overflow-hidden rounded-card bg-night-card">
                {data.night.slice(0, 10).map((log) => (
                  <li key={log.id} className="border-b border-white/10 px-4 py-3 last:border-b-0">
                    <p className="text-sm font-bold">{log.feeling}</p>
                    <p className="text-xs text-night-foreground/60">{formatWhen(log.at)}</p>
                    {log.note && (
                      <p className="mt-1 text-[13px] leading-snug text-night-foreground/85">
                        {log.note}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      )}
    </ResetShell>
  );
}
