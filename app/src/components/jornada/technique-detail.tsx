import { ArrowRight, MessageCircleReply, ShieldCheck, Sparkles } from "lucide-react";

import { Overlay, SectionTitle } from "@/components/common";
import { useCommContext } from "@/components/comunicacao/hooks";
import { BulletList } from "@/components/comunicacao/shared";
import { Button } from "@/components/ui/button";
import { techniqueAccess, techniqueById } from "@/lib/jornada/messages";
import type { VslTechniqueId } from "@/lib/jornada/types";
import { cn } from "@/lib/utils";

const accessCopy = {
  practice: {
    title: "Uma prática para você",
    text: "Esta técnica não envia nada e pode ser usada em qualquer momento.",
    className: "border-success/30 bg-success-soft",
  },
  available: {
    title: "Há espaço para avaliar esta mensagem",
    text: "Personalize somente com fatos verdadeiros e passe pela Pausa antes de decidir enviar.",
    className: "border-primary/20 bg-primary-soft",
  },
  reply_only: {
    title: "Use somente se ele escreveu primeiro",
    text: "O momento pede espaço. Esta resposta só faz sentido dentro de uma conversa iniciada por ele.",
    className: "border-brand-honey/40 bg-tint-honey",
  },
  blocked: {
    title: "Hoje, não envie esta mensagem",
    text: "Existe um limite ou falta de reciprocidade. Leia a orientação, mas não use a técnica para iniciar contato.",
    className: "border-destructive/30 bg-destructive-soft",
  },
} as const;

/** Detalhe das técnicas editoriais da VSL, com o mesmo Overlay e os cards usados pela Central. */
export function TechniqueDetail({
  id,
  onClose,
  openPause,
}: {
  id: VslTechniqueId;
  onClose: () => void;
  openPause: (draft?: string) => void;
}) {
  const ctx = useCommContext();
  const technique = techniqueById(id);
  if (!technique) return null;

  const access = techniqueAccess(technique, ctx.stance);
  const notice =
    ctx.stance === "sem_diagnostico" && access === "available"
      ? {
          title: "Faça o diagnóstico antes de decidir",
          text: "Sem o diagnóstico, esta mensagem é apenas uma possibilidade. A Pausa ajuda a conferir o momento e os limites.",
          className: "border-brand-honey/40 bg-tint-honey",
        }
      : accessCopy[access];
  const canPrepare = access === "available" || access === "reply_only";

  return (
    <Overlay eyebrow="Mensagens e técnicas" title={technique.vslName} onClose={onClose}>
      <div className="flex items-start gap-3 rounded-card bg-tint-lavender px-4 py-3">
        <Sparkles className="mt-0.5 size-5 shrink-0 text-primary" />
        <div>
          <p className="text-sm font-extrabold">Orientação do aplicativo</p>
          <p className="mt-1 text-[13px] leading-snug text-muted-foreground">{technique.note}</p>
        </div>
      </div>

      <div className={cn("mt-4 rounded-card border px-4 py-3", notice.className)} role="note">
        <p className="text-sm font-extrabold">{notice.title}</p>
        <p className="mt-1 text-[13px] leading-snug">{notice.text}</p>
      </div>

      <SectionTitle>Para que serve</SectionTitle>
      <div className="rounded-card bg-card p-4 shadow-soft">
        <p className="text-sm leading-6">{technique.purpose}</p>
      </div>

      {technique.kind === "message" && technique.message && access !== "blocked" && (
        <>
          <SectionTitle>Mensagem</SectionTitle>
          <div
            className={cn(
              "ml-auto max-w-[92%] rounded-2xl rounded-br-md px-4 py-3 text-sm font-semibold leading-6 shadow-soft",
              canPrepare ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
            )}
          >
            {technique.message}
          </div>
          {canPrepare && (
            <Button
              className="mt-3 h-12 w-full rounded-xl font-bold"
              onClick={() => openPause(technique.message)}
            >
              <MessageCircleReply /> Levar para a Pausa <ArrowRight />
            </Button>
          )}
          {technique.customization && (
            <>
              <SectionTitle>Como adaptar</SectionTitle>
              <BulletList items={technique.customization} tone="info" />
            </>
          )}
        </>
      )}

      {technique.kind === "practice" && technique.steps && (
        <>
          <SectionTitle>Passo a passo</SectionTitle>
          <ol className="space-y-2">
            {technique.steps.map((step, index) => (
              <li
                key={step}
                className="flex items-start gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm leading-6"
              >
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary text-xs font-extrabold text-primary-foreground">
                  {index + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
          <Button
            variant="outline"
            className="mt-3 h-12 w-full rounded-xl bg-card font-bold"
            onClick={() => openPause()}
          >
            Escrever na Pausa <ArrowRight />
          </Button>
        </>
      )}

      <SectionTitle>Quando usar</SectionTitle>
      <BulletList items={technique.whenToUse} tone="do" />

      <SectionTitle>Quando não usar</SectionTitle>
      <BulletList items={technique.whenToAvoid} tone="avoid" />

      {technique.ifReply && (
        <>
          <SectionTitle>Se ele responder</SectionTitle>
          <BulletList items={technique.ifReply} tone="do" />
        </>
      )}

      {technique.ifNoReply && (
        <>
          <SectionTitle>Se ele não responder</SectionTitle>
          <BulletList items={technique.ifNoReply} tone="info" />
        </>
      )}

      <div className="mt-6 flex items-start gap-3 rounded-card border border-primary/20 bg-primary-soft px-4 py-3">
        <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" />
        <div>
          <p className="text-sm font-extrabold">Limite da técnica</p>
          <p className="mt-1 text-[13px] leading-snug">{technique.limits}</p>
          <p className="mt-2 text-[12px] leading-snug text-muted-foreground">
            Nenhuma técnica garante resposta, mudança de sentimento ou reconciliação.
          </p>
        </div>
      </div>
    </Overlay>
  );
}
