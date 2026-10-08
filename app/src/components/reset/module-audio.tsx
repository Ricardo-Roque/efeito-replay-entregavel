import { useState } from "react";
import { Check, ChevronDown, CircleCheck } from "lucide-react";

import { AudioPlayer } from "@/components/reset/audio-player";
import { NoteField, ResetShell } from "@/components/reset/reset-common";
import { Button } from "@/components/ui/button";
import { audioUrl } from "@/lib/reset/audio";
import { audioSessions } from "@/lib/reset/content";
import { useReset } from "@/lib/reset/store";
import { cn } from "@/lib/utils";

/** Módulo 02: três sessões, cada uma com player, transcrição, exercício e conclusão. */
export function AudioModule({ onBack }: { onBack: () => void }) {
  const { data, update } = useReset();
  const [open, setOpen] = useState<string>(
    audioSessions.find((s) => !data.audioDone[s.id])?.id ?? audioSessions[0]!.id,
  );
  const [transcript, setTranscript] = useState<string | null>(null);

  return (
    <ResetShell eyebrow="Módulo 02" title="Áudio de Reativação Emocional" onBack={onBack}>
      <p className="text-sm leading-6 text-muted-foreground">
        Três sessões curtas sobre comunicação acolhedora e consciente. Ouça com calma, de
        preferência com fones, e faça o exercício de cada uma.
      </p>
      <div className="mt-5 space-y-3">
        {audioSessions.map((session, index) => {
          const done = Boolean(data.audioDone[session.id]);
          const expanded = open === session.id;
          return (
            <section key={session.id} className="overflow-hidden rounded-card bg-card shadow-soft">
              <button
                type="button"
                aria-expanded={expanded}
                onClick={() => setOpen(expanded ? "" : session.id)}
                className="flex w-full cursor-pointer items-center gap-3 p-4 text-left"
              >
                <span
                  className={cn(
                    "grid size-10 shrink-0 place-items-center rounded-full font-display font-black",
                    done ? "bg-success text-primary-foreground" : "bg-reset-soft text-reset",
                  )}
                >
                  {done ? <Check className="size-5" strokeWidth={3} /> : index + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-[15px] font-extrabold leading-snug">
                    {session.title}
                  </span>
                  <span className="block text-xs font-bold text-muted-foreground">
                    {session.minutes} min{done ? " · concluída" : ""}
                  </span>
                </span>
                <ChevronDown
                  className={cn(
                    "size-5 text-muted-foreground transition-transform",
                    expanded && "rotate-180",
                  )}
                />
              </button>
              {expanded && (
                <div className="space-y-4 border-t border-border px-4 pb-4 pt-4">
                  <p className="text-sm leading-6">{session.description}</p>
                  <AudioPlayer
                    src={audioUrl(session.id)}
                    title={session.title}
                    minutes={session.minutes}
                  />
                  <div>
                    <button
                      type="button"
                      aria-expanded={transcript === session.id}
                      onClick={() => setTranscript(transcript === session.id ? null : session.id)}
                      className="flex w-full cursor-pointer items-center justify-between rounded-xl bg-muted px-4 py-3 text-sm font-bold"
                    >
                      Transcrição
                      <ChevronDown
                        className={cn(
                          "size-4 transition-transform",
                          transcript === session.id && "rotate-180",
                        )}
                      />
                    </button>
                    {transcript === session.id && (
                      <div className="mt-2 space-y-3 rounded-xl bg-background p-4">
                        {session.transcript.map((paragraph) => (
                          <p key={paragraph} className="text-sm leading-6">
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="rounded-xl bg-reset-soft p-4">
                    <p className="text-[11px] font-extrabold uppercase tracking-widest text-reset">
                      Exercício prático
                    </p>
                    <p className="mt-1 text-sm leading-6">{session.exercise}</p>
                    <div className="mt-3">
                      <NoteField
                        noteKey={`audio:${session.id}`}
                        label="Minhas anotações"
                        rows={2}
                      />
                    </div>
                  </div>
                  {done ? (
                    <p className="flex items-center justify-center gap-2 rounded-xl bg-success-soft px-4 py-3 text-sm font-bold text-success">
                      <CircleCheck className="size-4" /> Sessão concluída
                    </p>
                  ) : (
                    <Button
                      className="h-11 w-full rounded-xl bg-reset font-bold hover:bg-reset/90"
                      onClick={() => {
                        if (
                          update(
                            (d) => ({
                              ...d,
                              audioDone: { ...d.audioDone, [session.id]: new Date().toISOString() },
                            }),
                            `Concluiu a sessão "${session.title}"`,
                          )
                        )
                          setOpen(audioSessions[index + 1]?.id ?? "");
                      }}
                    >
                      <CircleCheck /> Marcar como concluída
                    </Button>
                  )}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </ResetShell>
  );
}
