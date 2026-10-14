import { useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  ChevronRight,
  Eye,
  Hourglass,
  MessagesSquare,
  NotebookPen,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Signpost,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";

import { CareLines, EmojiBadge, Overlay, SectionTitle, tintClass } from "@/components/common";
import { useCommContext } from "@/components/comunicacao/hooks";
import { AvailabilityBadge, MessageCard } from "@/components/comunicacao/shared";
import type { RulesSection } from "@/components/tools/rules-panel";
import { Button } from "@/components/ui/button";
import {
  answersWithLimit,
  replySituationById,
  resolveReply,
  respondLabel,
  visibleReplySituations,
} from "@/lib/comunicacao/reply";
import { availabilityOf } from "@/lib/comunicacao/rules";
import type {
  CommCategoryId,
  ReplyAction,
  ReplyActionTarget,
  ReplyAlert,
  ReplyLimit,
  ReplyPoint,
  ReplySituationId,
  ResolvedReply,
} from "@/lib/comunicacao/types";
import type { EmojiName } from "@/lib/illustrations";
import { useJornada } from "@/lib/jornada/store";
import type { ScenarioId } from "@/lib/scenarios";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const situationArt: Record<ReplySituationId, { emoji: EmojiName; tint: keyof typeof tintClass }> = {
  frio: { emoji: "humor2", tint: "lavender" },
  saudade: { emoji: "brilho", tint: "rose" },
  pergunta: { emoji: "contato", tint: "sage" },
  magoa: { emoji: "humor1", tint: "lavender" },
  raiva: { emoji: "nunca", tint: "rose" },
  conversar: { emoji: "escrever", tint: "honey" },
  encontro: { emoji: "estrela", tint: "honey" },
  visualizou: { emoji: "celular", tint: "sage" },
  parar: { emoji: "escudo", tint: "rose" },
  outra_pessoa: { emoji: "sinais", tint: "lavender" },
};

const actionIcon: Record<ReplyActionTarget, LucideIcon> = {
  pause_example: Hourglass,
  pause: Hourglass,
  diary: NotebookPen,
  central: MessagesSquare,
  scenario: Signpost,
  day: CalendarDays,
  diagnosis: RotateCcw,
  register_limit: ShieldCheck,
  signals: Eye,
};

const respondTone: Record<ResolvedReply["respond"], string> = {
  sim: "bg-success-soft text-success",
  opcional: "bg-tint-honey text-foreground",
  nao: "bg-destructive-soft text-destructive",
};

function AlertBox({ alert }: { alert: ReplyAlert }) {
  return (
    <section
      role="note"
      className={cn(
        "rounded-card p-4",
        alert.tone === "stop"
          ? "border border-destructive/30 bg-destructive-soft"
          : "bg-tint-honey",
      )}
    >
      <p className="flex items-center gap-2 font-display text-[15px] font-extrabold leading-snug">
        {alert.tone === "stop" ? (
          <ShieldAlert className="size-5 shrink-0 text-destructive" />
        ) : (
          <TriangleAlert className="size-5 shrink-0 text-primary" />
        )}
        {alert.title}
      </p>
      <p className="mt-1.5 text-[13px] leading-snug">{alert.text}</p>
    </section>
  );
}

/** Orientação com a justificativa logo abaixo. */
function ReasonList({ items, tone }: { items: ReplyPoint[]; tone: "do" | "avoid" }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li
          key={item.text}
          className={cn(
            "flex items-start gap-3 rounded-xl px-4 py-3",
            tone === "do"
              ? "border border-success/30 bg-success-soft"
              : "border border-destructive/25 bg-destructive-soft",
          )}
        >
          <span
            aria-hidden
            className={cn(
              "mt-2 size-2 shrink-0 rounded-full",
              tone === "do" ? "bg-success" : "bg-destructive",
            )}
          />
          <span className="min-w-0">
            <span className="block text-sm font-bold leading-6">{item.text}</span>
            <span className="mt-0.5 block text-[13px] leading-snug text-muted-foreground">
              <span className="font-bold">Por quê: </span>
              {item.why}
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}

/**
 * "Ele respondeu. E agora?": assistente por regras. Ela escolhe o que aconteceu, responde no
 * máximo uma pergunta e vê a leitura, o que fazer, o que evitar, um exemplo e o próximo passo.
 * O momento dela (diagnóstico e cenário do perfil) é aplicado em resolveReply: com limite,
 * nenhuma resposta é sugerida em nenhuma situação.
 */
export function ReplyGuideScreen({
  initial,
  onClose,
  openMessage,
  openPause,
  openDiagnosis,
  openCentral,
  openScenario,
  openDay,
  openRules,
}: {
  initial?: ReplySituationId | undefined;
  onClose: () => void;
  openMessage: (id: string) => void;
  openPause: (draft?: string) => void;
  openDiagnosis: () => void;
  openCentral: (category: CommCategoryId) => void;
  openScenario: (id: ScenarioId) => void;
  openDay: (day: number) => void;
  openRules: (section: RulesSection) => void;
}) {
  const ctx = useCommContext();
  const { data, current, saveDiagnosis } = useJornada();
  const { addEntry, showToast } = useStore();
  const [situationId, setSituationId] = useState<ReplySituationId | null>(initial ?? null);
  const [option, setOption] = useState<string | null>(null);
  const [confirmLimit, setConfirmLimit] = useState(false);

  const situation = situationId ? replySituationById(situationId) : null;
  const result = situation ? resolveReply(situation, option, ctx) : null;
  const limited = ctx.stance === "limite";

  const choose = (id: ReplySituationId) => {
    setSituationId(id);
    setOption(null);
    setConfirmLimit(false);
  };
  const startOver = () => {
    setSituationId(null);
    setOption(null);
    setConfirmLimit(false);
  };
  const back = () => {
    if (result && situation?.question) setOption(null);
    else if (situation) startOver();
    else onClose();
  };

  const registerLimit = (limit: ReplyLimit) => {
    // Sem diagnóstico, não há o que atualizar: ela faz o diagnóstico e marca o limite lá.
    if (!current) return openDiagnosis();
    if (saveDiagnosis(answersWithLimit(current.answers, limit))) {
      setConfirmLimit(false);
      showToast("Limite registrado. O app passa a respeitar esse pedido em todas as ferramentas.");
    }
  };

  const toDiary = (resolved: ResolvedReply) => {
    const chosen = resolved.situation.question?.options.find((item) => item.id === resolved.option);
    const text = [
      `Ele respondeu. E agora? ${resolved.situation.title}${chosen ? ` (${chosen.label.toLowerCase()})` : ""}.`,
      `O caminho que faz sentido: ${resolved.title.toLowerCase()}.`,
      "O que eu senti:",
    ].join("\n");
    // Conta como "Ele fez contato" no Diário, com a situação e o caminho escolhido.
    if (addEntry({ type: "contact", source: "contato", text }))
      showToast("Registrado no Diário. Complete com o que você sentiu quando quiser.");
  };

  const run = (action: ReplyAction, resolved: ResolvedReply) => {
    switch (action.target) {
      case "pause_example":
        return openPause(resolved.example?.message.text ?? "");
      case "pause":
        return openPause();
      case "diary":
        return toDiary(resolved);
      case "central":
        return openCentral(action.category ?? resolved.situation.category);
      case "scenario":
        return action.scenario && openScenario(action.scenario);
      case "day":
        return action.day && openDay(action.day);
      case "diagnosis":
        return openDiagnosis();
      case "register_limit":
        return setConfirmLimit(true);
      case "signals":
        return openRules("signals");
    }
  };

  // ---------- 1. O que aconteceu ----------
  if (!situation)
    return (
      <Overlay
        key="inicio"
        eyebrow="Central de Comunicação"
        title="Ele respondeu. E agora?"
        onClose={onClose}
      >
        <div className="flex items-center gap-4">
          <EmojiBadge name="contato" tint="sage" size="lg" />
          <div>
            <h2 className="font-display text-xl font-black leading-tight">
              Ele respondeu. E agora?
            </h2>
            <p className="mt-1 text-[14px] leading-snug text-muted-foreground">
              Entenda sua situação e descubra qual próximo passo faz sentido.
            </p>
          </div>
        </div>

        {limited ? (
          <div className="mt-5">
            <AlertBox
              alert={{
                tone: "stop",
                title: "Existe um limite registrado no seu diagnóstico",
                text: "Você pode ler as orientações de qualquer situação, mas o app não vai sugerir respostas enquanto esse limite valer.",
              }}
            />
          </div>
        ) : (
          <p className="mt-5 rounded-xl bg-primary-soft px-4 py-3 text-[13px] leading-snug">
            Respire antes de responder: você não precisa responder na hora. As orientações abaixo
            ajudam a decidir, mas ninguém, nem o app, sabe o que ele pensa ou vai decidir.
          </p>
        )}

        <SectionTitle>O que aconteceu depois da última mensagem?</SectionTitle>
        <div className="space-y-2.5" role="list">
          {visibleReplySituations().map((item) => (
            <button
              key={item.id}
              type="button"
              role="listitem"
              onClick={() => choose(item.id)}
              className="flex w-full cursor-pointer items-center gap-3 rounded-card bg-card p-3.5 text-left shadow-soft transition-transform active:scale-[0.99]"
            >
              <EmojiBadge
                name={situationArt[item.id].emoji}
                tint={situationArt[item.id].tint}
                size="sm"
              />
              <span className="min-w-0 flex-1">
                <span className="block font-display text-[15px] font-extrabold leading-snug">
                  {item.label}
                </span>
                <span className="mt-0.5 block text-[12px] leading-snug text-muted-foreground">
                  {item.hint}
                </span>
              </span>
              <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
            </button>
          ))}
        </div>
      </Overlay>
    );

  // ---------- 2. Pergunta de refinamento ----------
  if (!result && situation.question)
    return (
      <Overlay
        key={situation.id}
        eyebrow="Ele respondeu. E agora?"
        title={situation.title}
        onClose={back}
      >
        <div
          className={cn(
            "flex items-center gap-4 rounded-card p-4",
            tintClass[situationArt[situation.id].tint],
          )}
        >
          <EmojiBadge name={situationArt[situation.id].emoji} tint="honey" size="md" />
          <p className="text-[14px] font-semibold leading-snug">
            Uma pergunta rápida para a orientação servir ao seu caso.
          </p>
        </div>
        <SectionTitle>{situation.question.text}</SectionTitle>
        {situation.question.hint && (
          <p className="-mt-1 mb-3 text-[13px] leading-snug text-muted-foreground">
            {situation.question.hint}
          </p>
        )}
        <div className="space-y-2.5" role="list">
          {situation.question.options.map((item) => (
            <button
              key={item.id}
              type="button"
              role="listitem"
              onClick={() => setOption(item.id)}
              className="flex w-full cursor-pointer items-center gap-3 rounded-card bg-card p-4 text-left shadow-soft transition-transform active:scale-[0.99]"
            >
              <span className="min-w-0 flex-1 text-[15px] font-bold leading-snug">
                {item.label}
              </span>
              <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
            </button>
          ))}
        </div>
        <Button
          variant="ghost"
          className="mt-4 h-11 w-full font-bold text-primary"
          onClick={startOver}
        >
          Escolher outra situação
        </Button>
      </Overlay>
    );

  if (!result) return null;

  // ---------- 3. Resultado ----------
  const { example } = result;
  const NextIcon = actionIcon[result.next.target];
  return (
    // A chave remonta a camada a cada passo, então cada tela nova começa do topo.
    <Overlay
      key={`${situation.id}-${result.option}`}
      eyebrow="Ele respondeu. E agora?"
      title={situation.title}
      onClose={back}
    >
      <div className={cn("rounded-card p-4", tintClass[situationArt[situation.id].tint])}>
        <span
          className={cn(
            "inline-block rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide",
            respondTone[result.respond],
          )}
        >
          {respondLabel[result.respond]}
        </span>
        <p className="mt-2 font-display text-[17px] font-extrabold leading-snug">{result.title}</p>
      </div>

      {result.alerts.length > 0 && (
        <div className="mt-4 space-y-3">
          {result.alerts.map((alert) => (
            <AlertBox key={alert.title} alert={alert} />
          ))}
        </div>
      )}
      {result.care && (
        <div className="mt-4">
          <CareLines highlight />
        </div>
      )}

      <SectionTitle>Interpretação cuidadosa</SectionTitle>
      <ul className="space-y-2">
        {result.reading.map((item) => (
          <li
            key={item}
            className="flex items-start gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm leading-6"
          >
            <span aria-hidden className="mt-2 size-2 shrink-0 rounded-full bg-primary" />
            {item}
          </li>
        ))}
      </ul>
      <p className="mt-2 text-[12px] leading-snug text-muted-foreground">
        São possibilidades, não certezas. Só ele sabe o que sente.
      </p>

      <SectionTitle>O que fazer agora</SectionTitle>
      <ReasonList items={result.doNow} tone="do" />

      <SectionTitle>O que evitar</SectionTitle>
      <ReasonList items={result.avoid} tone="avoid" />

      {example && (
        <>
          <SectionTitle>Exemplo de resposta</SectionTitle>
          <div className="rounded-card bg-card p-4 shadow-soft">
            <div className="flex items-center justify-between gap-2">
              <p className="eyebrow">Exemplo de conversa</p>
              <AvailabilityBadge
                message={example.message}
                availability={availabilityOf(example.message, ctx)}
              />
            </div>
            <div className="mt-3 space-y-2" aria-label="Exemplo de conversa">
              <div className="flex justify-start">
                <p className="max-w-[85%] rounded-2xl rounded-bl-md bg-muted px-3.5 py-2.5 text-sm leading-snug">
                  <span className="mb-0.5 block text-[11px] font-bold text-muted-foreground">
                    Ele (exemplo)
                  </span>
                  {example.him}
                </p>
              </div>
              <div className="flex justify-end">
                <p className="max-w-[85%] rounded-2xl rounded-br-md bg-primary-soft px-3.5 py-2.5 text-sm leading-snug">
                  <span className="mb-0.5 block text-[11px] font-bold text-primary">Você</span>
                  {example.message.text}
                </p>
              </div>
            </div>
            <p className="mt-3 text-[13px] leading-snug text-muted-foreground">{example.note}</p>
            {example.caution && (
              <p
                role="note"
                className="mt-2 rounded-xl bg-tint-honey px-3 py-2 text-[12px] leading-snug"
              >
                {example.caution}
              </p>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              {example.sendable && result.next.target !== "pause_example" && (
                <Button
                  className="h-10 rounded-xl text-[13px] font-bold"
                  onClick={() => openPause(example.message.text)}
                >
                  <Hourglass /> Adaptar na Pausa
                </Button>
              )}
              <Button
                variant="outline"
                className="h-10 rounded-xl bg-card text-[13px] font-bold"
                onClick={() => openMessage(example.message.id)}
              >
                Ver detalhes do modelo
              </Button>
            </div>
          </div>
        </>
      )}

      <SectionTitle>Próximo passo</SectionTitle>
      <button
        type="button"
        onClick={() => run(result.next, result)}
        className="relative flex w-full cursor-pointer items-center gap-3 overflow-hidden rounded-card bg-goal-card p-5 text-left text-primary-foreground shadow-glow transition-transform active:scale-[0.99]"
      >
        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary-foreground/15">
          <NextIcon className="size-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-display text-[16px] font-extrabold leading-snug">
            {result.next.label}
          </span>
          <span className="mt-1 block text-[13px] leading-snug text-primary-foreground/85">
            {result.next.text}
          </span>
        </span>
        <ArrowRight className="size-5 shrink-0" />
      </button>

      {confirmLimit && result.limit && (
        <section
          role="alertdialog"
          aria-label="Confirmar registro do limite"
          className="mt-3 rounded-card border border-destructive/30 bg-destructive-soft p-4"
        >
          <p className="text-sm font-bold leading-6">
            {current
              ? result.limit === "pediu_sem_contato"
                ? "Seu diagnóstico passa a registrar que ele pediu para não haver contato."
                : "Seu diagnóstico passa a registrar que ele está em outra relação."
              : "Você ainda não fez o diagnóstico. Faça agora e marque esse limite nas respostas."}
          </p>
          <p className="mt-1 text-[13px] leading-snug">
            A Central, a Pausa e o seu plano deixam de sugerir mensagens. Se a situação mudar, é só
            refazer o diagnóstico. O Diário e os dias concluídos não mudam.
          </p>
          <div className="mt-3 flex gap-2">
            <Button
              className="h-10 flex-1 rounded-xl text-[13px] font-bold"
              onClick={() => registerLimit(result.limit!)}
            >
              {current ? "Registrar" : "Fazer diagnóstico"}
            </Button>
            <Button
              variant="outline"
              className="h-10 flex-1 rounded-xl bg-card text-[13px] font-bold"
              onClick={() => setConfirmLimit(false)}
            >
              Agora não
            </Button>
          </div>
        </section>
      )}

      {result.more.length > 0 && (
        <>
          <p className="eyebrow mb-2 mt-5">Também pode ajudar</p>
          <div className="space-y-2">
            {result.more.map((action) => {
              const Icon = actionIcon[action.target];
              return (
                <button
                  key={`${action.target}-${action.day ?? ""}-${action.scenario ?? ""}-${action.category ?? ""}`}
                  type="button"
                  onClick={() => run(action, result)}
                  className="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-left transition-colors hover:bg-muted"
                >
                  <Icon className="size-4 shrink-0 text-primary" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold leading-snug">{action.label}</span>
                    <span className="block text-[12px] leading-snug text-muted-foreground">
                      {action.text}
                    </span>
                  </span>
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                </button>
              );
            })}
          </div>
        </>
      )}

      {result.related.length > 0 && (
        <>
          <SectionTitle>Mais na Central</SectionTitle>
          <div className="space-y-3">
            {result.related.map((message) => (
              <MessageCard
                key={message.id}
                message={message}
                ctx={ctx}
                favorite={Boolean(data.messages.favorites[message.id])}
                onOpen={openMessage}
              />
            ))}
          </div>
        </>
      )}

      <div className="mt-6 space-y-1">
        {situation.question && (
          <Button
            variant="outline"
            className="h-12 w-full rounded-xl bg-card font-bold"
            onClick={() => setOption(null)}
          >
            Mudar a resposta da pergunta
          </Button>
        )}
        <Button variant="ghost" className="h-11 w-full font-bold text-primary" onClick={startOver}>
          Escolher outra situação
        </Button>
      </div>

      <p className="mt-6 text-center text-xs leading-5 text-muted-foreground">
        Orientações escritas para o Código da Reconquista. Elas ajudam você a decidir com calma, mas
        não preveem nem controlam o que ele sente ou decide. Não enviar nada também é uma escolha.
      </p>
    </Overlay>
  );
}
