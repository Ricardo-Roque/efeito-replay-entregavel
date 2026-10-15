import {
  ArrowRight,
  Copy,
  Hourglass,
  MessageCircleReply,
  NotebookPen,
  Star,
  TriangleAlert,
} from "lucide-react";

import { Overlay, SectionTitle } from "@/components/common";
import { useCommContext, useMessageActions } from "@/components/comunicacao/hooks";
import { AvailabilityBadge, BulletList, MessageCard } from "@/components/comunicacao/shared";
import { Button } from "@/components/ui/button";
import {
  availabilityNote,
  availabilityOf,
  canSend,
  categoryById,
  messageById,
  relatedOf,
} from "@/lib/comunicacao/rules";
import { useJornada } from "@/lib/jornada/store";
import { features } from "@/lib/features";
import { cn } from "@/lib/utils";

/**
 * Detalhe de um conteúdo da Central: propósito, modelo, quando faz sentido, quando não enviar, o
 * que fazer com ou sem resposta, limites e próximo passo. Copiar e levar para a Pausa só aparecem
 * quando o momento dela permite (availabilityOf em lib/comunicacao/rules.ts).
 */
export function MessageDetail({
  id,
  onClose,
  openMessage,
  openReply,
  openPause,
}: {
  id: string;
  onClose: () => void;
  openMessage: (id: string) => void;
  openReply: () => void;
  openPause: (draft?: string) => void;
}) {
  const ctx = useCommContext();
  const { data, toggleFavorite } = useJornada();
  const actions = useMessageActions(openPause);
  const message = messageById(id);
  if (!message) return null;

  const availability = availabilityOf(message, ctx);
  const sendable = canSend(availability);
  const note = availabilityNote(message, ctx);
  const favorite = Boolean(data.messages.favorites[message.id]);
  const related = relatedOf(message);
  const avoid = message.kind === "evitar";
  const reflection = message.kind === "reflexao";

  return (
    <Overlay eyebrow={categoryById(message.category).label} title={message.title} onClose={onClose}>
      <div className="flex items-center justify-between gap-3">
        <AvailabilityBadge message={message} availability={availability} />
        <Button
          variant="outline"
          size="sm"
          aria-pressed={favorite}
          className="h-9 rounded-xl bg-card font-bold"
          onClick={() => toggleFavorite(message.id)}
        >
          <Star className={cn(favorite && "fill-primary text-primary")} />
          {favorite ? "Favorito" : "Favoritar"}
        </Button>
      </div>

      {note && (
        <p
          role="note"
          className={cn(
            "mt-3 rounded-xl px-4 py-3 text-[13px] leading-snug",
            availability === "nao_agora"
              ? "border border-destructive/30 bg-destructive-soft"
              : "bg-tint-honey",
          )}
        >
          {note}
        </p>
      )}

      <SectionTitle>O que esta mensagem pretende comunicar</SectionTitle>
      <div className="rounded-card bg-card p-4 shadow-soft">
        <p className="text-[15px] font-bold leading-6">{message.goal}</p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{message.context}</p>
      </div>

      <SectionTitle>
        {avoid ? "Exemplo do que evitar" : reflection ? "Texto para você" : "Modelo de mensagem"}
      </SectionTitle>
      {avoid ? (
        <div className="rounded-2xl border-2 border-dashed border-destructive/40 bg-destructive-soft px-4 py-3">
          <p className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-wide text-destructive">
            <TriangleAlert className="size-4" /> Não envie
          </p>
          <p className="mt-1.5 text-sm font-semibold leading-6 line-through decoration-destructive/40">
            {message.text}
          </p>
        </div>
      ) : reflection ? (
        <div className="rounded-2xl bg-tint-lavender px-4 py-3 text-sm font-semibold leading-6">
          {message.text}
        </div>
      ) : (
        <div
          className={cn(
            "ml-auto max-w-[92%] rounded-2xl rounded-br-md px-4 py-3 text-sm font-semibold leading-6 shadow-soft",
            sendable ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
          )}
        >
          {message.text}
        </div>
      )}

      {sendable && (
        <>
          <div className="mt-3 grid grid-cols-2 gap-2 max-[359px]:grid-cols-1">
            <Button
              variant="outline"
              className="h-11 rounded-xl bg-card font-bold"
              onClick={() => void actions.copy(message)}
            >
              <Copy /> Copiar
            </Button>
            <Button className="h-11 rounded-xl font-bold" onClick={() => actions.toPause(message)}>
              <Hourglass /> Levar para a Pausa
            </Button>
          </div>
          <p className="mt-2 text-[12px] leading-snug text-muted-foreground">
            Troque os trechos entre colchetes pelas suas palavras. Uma mensagem, e depois solte o
            celular.
          </p>
        </>
      )}
      {reflection && features.diary && (
        <Button
          variant="outline"
          className="mt-3 h-11 w-full rounded-xl bg-card font-bold"
          onClick={() => actions.toDiary(message)}
        >
          <NotebookPen /> Guardar no Diário
        </Button>
      )}
      {avoid && message.alternative && (
        <Button
          variant="outline"
          className="mt-3 h-11 w-full rounded-xl bg-card font-bold"
          onClick={() => openMessage(message.alternative!)}
        >
          O que fazer no lugar <ArrowRight />
        </Button>
      )}

      <SectionTitle>Por que este tom</SectionTitle>
      <div className="rounded-card bg-card p-4 text-sm leading-6 shadow-soft">
        {message.whyTone}
      </div>

      <SectionTitle>Quando faz sentido</SectionTitle>
      <BulletList items={message.whenToUse} tone="do" />

      <SectionTitle>Quando não enviar</SectionTitle>
      <BulletList items={message.whenToAvoid} tone="avoid" />

      <SectionTitle>Se ele responder</SectionTitle>
      <BulletList items={message.ifReply} tone="info" />

      <SectionTitle>Se ele não responder</SectionTitle>
      <BulletList items={message.ifNoReply} tone="info" />

      <SectionTitle>Limites</SectionTitle>
      <div className="flex gap-3 rounded-card bg-tint-rose p-4 text-sm font-semibold leading-6">
        <TriangleAlert className="mt-0.5 size-5 shrink-0 text-primary" />
        {message.limits}
      </div>

      <SectionTitle>Próximo passo</SectionTitle>
      <div className="space-y-2">
        <Button
          variant="outline"
          className="h-12 w-full justify-between rounded-xl bg-card font-bold"
          onClick={() => (sendable ? actions.toPause(message) : openPause())}
        >
          <span className="flex items-center gap-2">
            <Hourglass className="size-4" />
            {sendable ? "Adaptar na Pausa antes de enviar" : "Escrever na Pausa, só para mim"}
          </span>
          <ArrowRight />
        </Button>
        <Button
          variant="outline"
          className="h-12 w-full justify-between rounded-xl bg-card font-bold"
          onClick={openReply}
        >
          <span className="flex items-center gap-2">
            <MessageCircleReply className="size-4" /> Ele respondeu. E agora?
          </span>
          <ArrowRight />
        </Button>
      </div>

      {related.length > 0 && (
        <>
          <SectionTitle>Veja também</SectionTitle>
          <div className="space-y-3">
            {related.map((item) => (
              <MessageCard
                key={item.id}
                message={item}
                ctx={ctx}
                favorite={Boolean(data.messages.favorites[item.id])}
                onOpen={openMessage}
              />
            ))}
          </div>
        </>
      )}

      <p className="mt-8 text-center text-xs leading-5 text-muted-foreground">
        Exemplo novo, escrito para o Código da Reconquista. Não é uma fórmula pronta e não garante
        resposta.
      </p>
    </Overlay>
  );
}
