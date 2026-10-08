import { useState } from "react";
import {
  ArrowRight,
  Check,
  ClipboardList,
  Headphones,
  HeartHandshake,
  KeyRound,
  MessagesSquare,
  Moon,
  RefreshCw,
  Route,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

import { DiagnosisFlow, DiagnosisResult } from "@/components/reset/diagnosis-flow";
import { JourneyList, JourneyStepView } from "@/components/reset/journey-view";
import { AudioModule } from "@/components/reset/module-audio";
import { BonusModule } from "@/components/reset/module-bonus";
import { ForgivenessModule } from "@/components/reset/module-forgiveness";
import { NightModule } from "@/components/reset/module-night";
import { SayAvoidModule } from "@/components/reset/module-say-avoid";
import { ResetProgress, ResetShell, SectionLabel } from "@/components/reset/reset-common";
import { Button } from "@/components/ui/button";
import { checkoutLink, config, whatsappLink } from "@/lib/config";
import { modules } from "@/lib/reset/content";
import { buildMap, type ModuleId } from "@/lib/reset/diagnosis";
import { ResetProvider, moduleDone, progressOf, useReset } from "@/lib/reset/store";
import { formatWhen } from "@/lib/progress";
import { firstName, useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const RESET_NAME = "Reset Emocional do Ex";
export const RESET_SUBTITLE = "Protocolo de Reconstrução da Confiança";

const moduleIcon: Record<ModuleId, LucideIcon> = {
  perdao: HeartHandshake,
  audios: Headphones,
  dizer: MessagesSquare,
  noturno: Moon,
  bonus: KeyRound,
};

type View =
  | { kind: "home" }
  | { kind: "welcome" }
  | { kind: "diagnosis" }
  | { kind: "result" }
  | { kind: "journey" }
  | { kind: "step"; id: number }
  | { kind: "module"; id: ModuleId };

/** Entrada do Reset Emocional do Ex (camada por cima do app). Sem a compra do upsell, mostra o
 * que está incluído e, se houver link configurado, o caminho para comprar. */
export function ResetScreen({ onClose }: { onClose: () => void }) {
  const { entitlements } = useStore();
  if (!entitlements.reset) return <LockedView onClose={onClose} />;
  return (
    <ResetProvider>
      <ResetRouter onClose={onClose} />
    </ResetProvider>
  );
}

function ResetRouter({ onClose }: { onClose: () => void }) {
  const { current } = useReset();
  // Primeiro acesso: começa pela apresentação do diagnóstico.
  const [stack, setStack] = useState<View[]>(() => [
    current ? { kind: "home" } : { kind: "welcome" },
  ]);
  const view = stack[stack.length - 1]!;
  const push = (next: View) => setStack((s) => [...s, next]);
  const back = () => (stack.length > 1 ? setStack((s) => s.slice(0, -1)) : onClose());
  const replace = (next: View) => setStack((s) => [...s.slice(0, -1), next]);
  const openModule = (id: ModuleId) => push({ kind: "module", id });
  const startDiagnosis = () => push({ kind: "diagnosis" });

  switch (view.kind) {
    case "welcome":
      return <Welcome onClose={onClose} onStart={() => replace({ kind: "diagnosis" })} />;
    case "diagnosis":
      return (
        <DiagnosisFlow
          onClose={back}
          onDone={() => setStack([{ kind: "home" }, { kind: "result" }])}
        />
      );
    case "result":
      return (
        <DiagnosisResult
          onBack={back}
          openModule={openModule}
          openJourney={() => push({ kind: "journey" })}
          redo={startDiagnosis}
        />
      );
    case "journey":
      return <JourneyList onBack={back} openStep={(id) => push({ kind: "step", id })} />;
    case "step":
      return (
        <JourneyStepView
          key={view.id}
          id={view.id}
          onBack={back}
          openModule={openModule}
          openStep={(id) => replace({ kind: "step", id })}
        />
      );
    case "module":
      if (view.id === "perdao") return <ForgivenessModule onBack={back} />;
      if (view.id === "audios") return <AudioModule onBack={back} />;
      if (view.id === "dizer") return <SayAvoidModule onBack={back} />;
      if (view.id === "noturno") return <NightModule onBack={back} />;
      return <BonusModule onBack={back} startDiagnosis={startDiagnosis} />;
    default:
      return (
        <Dashboard
          onClose={onClose}
          openModule={openModule}
          openJourney={() => push({ kind: "journey" })}
          openStep={(id) => push({ kind: "step", id })}
          openResult={() => push({ kind: "result" })}
          startDiagnosis={startDiagnosis}
        />
      );
  }
}

function Welcome({ onClose, onStart }: { onClose: () => void; onStart: () => void }) {
  const { data } = useStore();
  const name = data.profile ? firstName(data.profile.name) : "";
  return (
    <ResetShell eyebrow={RESET_NAME} title="Boas-vindas" onBack={onClose} closeIcon>
      <div className="rounded-card bg-reset p-6 text-primary-foreground shadow-soft">
        <Sparkles className="size-8 text-brand-gold" />
        <h2 className="mt-3 font-display text-2xl font-black leading-tight">
          {name ? `${name}, vamos começar por você.` : "Vamos começar por você."}
        </h2>
        <p className="mt-2 text-sm leading-6 text-primary-foreground/90">
          São seis perguntas rápidas sobre o que aconteceu e como as coisas estão hoje. Com elas, o
          app monta o seu Mapa de Reconstrução Emocional e adapta a jornada à sua situação.
        </p>
      </div>
      <ul className="mt-5 space-y-2.5 text-sm">
        {[
          "Cerca de 2 minutos, uma pergunta por tela",
          "Suas respostas ficam só neste aparelho",
          "Você pode refazer quando a situação mudar",
        ].map((item) => (
          <li
            key={item}
            className="flex items-center gap-3 rounded-xl bg-card px-4 py-3 shadow-soft"
          >
            <Check className="size-4 shrink-0 text-success" strokeWidth={3} />
            {item}
          </li>
        ))}
      </ul>
      <Button
        className="mt-6 h-12 w-full rounded-xl bg-reset font-bold hover:bg-reset/90"
        onClick={onStart}
      >
        Começar o diagnóstico <ArrowRight />
      </Button>
    </ResetShell>
  );
}

function Dashboard({
  onClose,
  openModule,
  openJourney,
  openStep,
  openResult,
  startDiagnosis,
}: {
  onClose: () => void;
  openModule: (id: ModuleId) => void;
  openJourney: () => void;
  openStep: (id: number) => void;
  openResult: () => void;
  startDiagnosis: () => void;
}) {
  const { data: app } = useStore();
  const { data, current } = useReset();
  const progress = progressOf(data);
  const name = app.profile ? firstName(app.profile.name) : "";
  const map = current ? buildMap(current.answers) : null;
  const stepTitle = progress.currentStep && map ? map.steps[progress.currentStep - 1]?.title : null;

  return (
    <ResetShell eyebrow={RESET_SUBTITLE} title={RESET_NAME} onBack={onClose}>
      <section className="rounded-card bg-reset p-5 text-primary-foreground shadow-soft">
        <p className="text-sm font-semibold text-primary-foreground/80">
          {name ? `Olá, ${name}` : "Olá"}
        </p>
        <p className="mt-1 font-display text-[22px] font-black leading-tight">
          {progress.currentStep ? "Sua jornada de reconexão" : "Jornada concluída"}
        </p>
        <div className="mt-4 flex items-end justify-between">
          <span className="font-display text-4xl font-black tabular-nums">{progress.percent}%</span>
          <span className="pb-1 text-xs font-bold text-primary-foreground/80">
            {progress.stepsDone} de 7 etapas · {progress.modulesDone} de 5 módulos
          </span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/25">
          <div
            className="h-full rounded-full bg-white transition-all"
            style={{ width: `${progress.percent}%` }}
          />
        </div>
        {progress.currentStep && (
          <p className="mt-3 text-sm text-primary-foreground/90">
            Etapa atual:{" "}
            <b>
              {progress.currentStep}. {stepTitle}
            </b>
          </p>
        )}
        <Button
          className="mt-4 h-12 w-full rounded-xl bg-white font-bold text-reset hover:bg-white/90"
          onClick={() => (progress.currentStep ? openStep(progress.currentStep) : openJourney())}
        >
          <Route /> {progress.currentStep ? "Continuar minha jornada" : "Rever a jornada"}
        </Button>
      </section>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={current ? openResult : startDiagnosis}
          className="flex cursor-pointer flex-col gap-2 rounded-card bg-card p-4 text-left shadow-soft active:scale-[0.98]"
        >
          <ClipboardList className="size-6 text-reset" />
          <span className="font-display text-[15px] font-extrabold leading-tight">
            Meu plano personalizado
          </span>
          <span className="text-xs text-muted-foreground">
            {current ? "Mapa de Reconstrução Emocional" : "Faça o diagnóstico"}
          </span>
        </button>
        <button
          type="button"
          onClick={startDiagnosis}
          className="flex cursor-pointer flex-col gap-2 rounded-card bg-card p-4 text-left shadow-soft active:scale-[0.98]"
        >
          <RefreshCw className="size-6 text-reset" />
          <span className="font-display text-[15px] font-extrabold leading-tight">
            {current ? "Refazer diagnóstico" : "Diagnóstico"}
          </span>
          <span className="text-xs text-muted-foreground">
            {current ? `Feito ${formatWhen(current.at).toLowerCase()}` : "6 perguntas, 2 minutos"}
          </span>
        </button>
      </div>

      <SectionLabel>Módulos</SectionLabel>
      <div className="space-y-2.5">
        {modules.map((module) => {
          const Icon = moduleIcon[module.id];
          const done = moduleDone[module.id](data);
          const bonus = module.id === "bonus";
          return (
            <button
              key={module.id}
              type="button"
              onClick={() => openModule(module.id)}
              className={cn(
                "flex w-full cursor-pointer items-center gap-3 rounded-card p-4 text-left shadow-soft transition-transform active:scale-[0.99]",
                bonus ? "border-2 border-brand-gold/40 bg-tint-gold" : "bg-card",
                module.id === "noturno" && "bg-night text-night-foreground",
              )}
            >
              <span
                className={cn(
                  "grid size-12 shrink-0 place-items-center rounded-2xl",
                  module.id === "noturno"
                    ? "bg-white/10 text-night-foreground"
                    : bonus
                      ? "bg-white text-brand-gold"
                      : "bg-reset-soft text-reset",
                )}
              >
                <Icon className="size-6" />
              </span>
              <span className="min-w-0 flex-1">
                <span
                  className={cn(
                    "block text-[11px] font-extrabold uppercase tracking-widest",
                    module.id === "noturno"
                      ? "text-night-foreground/60"
                      : bonus
                        ? "text-brand-gold"
                        : "text-muted-foreground",
                  )}
                >
                  Módulo {module.number}
                  {bonus ? " · Bônus secreto" : module.id === "noturno" ? " · Bônus" : ""}
                </span>
                <span className="block font-display text-[15px] font-extrabold leading-snug">
                  {module.title}
                </span>
                <span
                  className={cn(
                    "block text-xs leading-snug",
                    module.id === "noturno" ? "text-night-foreground/70" : "text-muted-foreground",
                  )}
                >
                  {module.subtitle}
                </span>
              </span>
              {done ? (
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-success text-primary-foreground">
                  <Check className="size-4" strokeWidth={3} />
                </span>
              ) : (
                <ArrowRight className="size-4 shrink-0 opacity-60" />
              )}
            </button>
          );
        })}
      </div>

      <SectionLabel>Minha Jornada de Reconexão</SectionLabel>
      <button
        type="button"
        onClick={openJourney}
        className="w-full cursor-pointer rounded-card bg-card p-4 text-left shadow-soft"
      >
        <div className="flex items-center justify-between">
          <span className="font-display text-[15px] font-extrabold">7 etapas, no seu ritmo</span>
          <ArrowRight className="size-4 text-muted-foreground" />
        </div>
        <div className="mt-3">
          <ResetProgress
            value={Math.round((progress.stepsDone / 7) * 100)}
            label="Etapas concluídas"
          />
        </div>
      </button>

      <SectionLabel>Histórico</SectionLabel>
      {data.activity.length === 0 ? (
        <p className="rounded-card bg-muted p-4 text-sm text-muted-foreground">
          As atividades que você concluir aparecem aqui.
        </p>
      ) : (
        <ul className="overflow-hidden rounded-card bg-card shadow-soft">
          {data.activity.slice(0, 12).map((item) => (
            <li
              key={`${item.at}-${item.label}`}
              className="flex items-center gap-3 border-b border-border px-4 py-3 last:border-b-0"
            >
              <Check className="size-4 shrink-0 text-success" strokeWidth={3} />
              <span className="min-w-0 flex-1 text-sm font-semibold">{item.label}</span>
              <span className="shrink-0 text-[11px] text-muted-foreground">
                {formatWhen(item.at)}
              </span>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-6 text-center text-xs leading-5 text-muted-foreground">
        Conteúdo educativo. Não substitui acompanhamento psicológico e não garante a reconciliação.
      </p>
    </ResetShell>
  );
}

const included = [
  "Diagnóstico emocional personalizado e Mapa de Reconstrução Emocional",
  "Módulo 1: Consciência do Perdão, com o Mapa das Mágoas",
  "Módulo 2: três sessões de áudio sobre comunicação de confiança",
  "Módulo 3: O Que Dizer e O Que Evitar em cada situação",
  "Módulo 4: Técnica de Reversão Noturna (bônus)",
  "Módulo 5: Mapa de Reconstrução da Confiança (bônus secreto)",
  "Minha Jornada de Reconexão: protocolo de sete etapas",
];

function LockedView({ onClose }: { onClose: () => void }) {
  const { email, reload, devSetReset } = useStore();
  const buy = checkoutLink(config.resetCheckoutUrl, email);
  const support = whatsappLink(`Olá! Comprei o ${RESET_NAME} e não consigo acessar.`);
  return (
    <ResetShell eyebrow="Produto complementar" title={RESET_NAME} onBack={onClose}>
      <section className="rounded-card bg-reset p-6 text-primary-foreground shadow-soft">
        <KeyRound className="size-8 text-brand-gold" />
        <h2 className="mt-3 font-display text-2xl font-black leading-tight">{RESET_SUBTITLE}</h2>
        <p className="mt-2 text-sm leading-6 text-primary-foreground/90">
          Para quem passou por traição, mentiras, humilhações ou brigas que abalaram a confiança.
          Entenda o ressentimento, evite o que aumenta a resistência e trabalhe a reconstrução da
          confiança, no seu ritmo.
        </p>
      </section>
      <SectionLabel>O que está incluído</SectionLabel>
      <ul className="space-y-2">
        {included.map((item) => (
          <li
            key={item}
            className="flex gap-3 rounded-xl bg-card px-4 py-3 text-sm leading-6 shadow-soft"
          >
            <Check className="mt-1 size-4 shrink-0 text-success" strokeWidth={3} />
            {item}
          </li>
        ))}
      </ul>
      <div className="mt-6 space-y-2">
        {buy && (
          <Button asChild className="h-12 w-full rounded-xl bg-reset font-bold hover:bg-reset/90">
            <a href={buy} target="_blank" rel="noreferrer">
              Quero o {RESET_NAME} <ArrowRight />
            </a>
          </Button>
        )}
        <p className="pt-2 text-center text-sm text-muted-foreground">
          Disponível para quem adquiriu o {RESET_NAME}. Se você já comprou, o acesso é liberado no
          mesmo e-mail da compra.
        </p>
        <Button
          variant="outline"
          className="h-11 w-full rounded-xl bg-card font-bold"
          onClick={reload}
        >
          <RefreshCw /> Já comprei: atualizar meu acesso
        </Button>
        {support && (
          <Button asChild variant="ghost" className="h-11 w-full font-bold text-reset">
            <a href={support} target="_blank" rel="noreferrer">
              Falar com o suporte
            </a>
          </Button>
        )}
        {import.meta.env.DEV && (
          <button
            type="button"
            onClick={() => devSetReset(true)}
            className="w-full cursor-pointer rounded-card border-2 border-dashed border-border p-3 text-xs font-bold text-muted-foreground"
          >
            Teste local (só em desenvolvimento): simular a compra do Reset
          </button>
        )}
      </div>
    </ResetShell>
  );
}
