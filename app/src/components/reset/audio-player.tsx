import { useEffect, useRef, useState } from "react";
import { Mic, Pause, Play, RotateCcw } from "lucide-react";

import { cn } from "@/lib/utils";

const fmt = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;

/** Player com controles próprios. Sem arquivo, mostra que o áudio está em gravação (nada é simulado). */
export function AudioPlayer({
  src,
  title,
  minutes,
  night = false,
}: {
  src: string | null;
  title: string;
  minutes: number;
  night?: boolean;
}) {
  const ref = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState(false);

  useEffect(() => () => ref.current?.pause(), []);

  if (!src)
    return (
      <div
        className={cn(
          "flex items-center gap-3 rounded-2xl border border-dashed p-4",
          night ? "border-white/25 bg-white/5" : "border-reset/40 bg-reset-soft",
        )}
      >
        <span
          className={cn(
            "grid size-12 shrink-0 place-items-center rounded-full",
            night ? "bg-white/10" : "bg-card",
          )}
        >
          <Mic className={cn("size-5", night ? "text-night-foreground" : "text-reset")} />
        </span>
        <div className="text-sm leading-snug">
          <p className="font-extrabold">Áudio em gravação</p>
          <p className={night ? "text-night-foreground/75" : "text-muted-foreground"}>
            Cerca de {minutes} min. Enquanto isso, a transcrição completa está abaixo.
          </p>
        </div>
      </div>
    );

  const toggle = () => {
    const audio = ref.current;
    if (!audio) return;
    if (audio.paused) void audio.play().catch(() => setError(true));
    else audio.pause();
  };

  return (
    <div className={cn("rounded-2xl p-4", night ? "bg-night-card" : "bg-card shadow-soft")}>
      <audio
        ref={ref}
        src={src}
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onTimeUpdate={(event) => setTime(event.currentTarget.currentTime)}
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
        onError={() => setError(true)}
      />
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? `Pausar ${title}` : `Tocar ${title}`}
          className="grid size-14 shrink-0 cursor-pointer place-items-center rounded-full bg-reset text-primary-foreground shadow-soft transition-transform active:scale-95"
        >
          {playing ? (
            <Pause className="size-6 fill-current" />
          ) : (
            <Play className="size-6 fill-current" />
          )}
        </button>
        <div className="min-w-0 flex-1">
          <input
            type="range"
            min={0}
            max={duration || minutes * 60}
            step={1}
            value={time}
            aria-label="Posição do áudio"
            onChange={(event) => {
              const audio = ref.current;
              if (audio) audio.currentTime = Number(event.target.value);
            }}
            className="w-full accent-[var(--reset)]"
          />
          <div
            className={cn(
              "flex justify-between text-xs font-bold tabular-nums",
              night ? "text-night-foreground/70" : "text-muted-foreground",
            )}
          >
            <span>{fmt(time)}</span>
            <span>{duration ? fmt(duration) : `${minutes} min`}</span>
          </div>
        </div>
        <button
          type="button"
          aria-label="Voltar 15 segundos"
          onClick={() => {
            const audio = ref.current;
            if (audio) audio.currentTime = Math.max(0, audio.currentTime - 15);
          }}
          className={cn(
            "grid size-10 shrink-0 cursor-pointer place-items-center rounded-full",
            night ? "bg-white/10" : "bg-muted",
          )}
        >
          <RotateCcw className="size-4" />
        </button>
      </div>
      {error && (
        <p role="alert" className="mt-2 text-xs font-semibold text-destructive">
          Não foi possível tocar o áudio. Confira a internet e tente de novo.
        </p>
      )}
    </div>
  );
}
