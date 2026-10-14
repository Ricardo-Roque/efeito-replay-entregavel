import { useState } from "react";
import { ArrowRight, ChevronRight, Play, TrendingUp } from "lucide-react";

import {
  Brand,
  CareLines,
  Character,
  Emoji,
  EmojiBadge,
  GoalProgress,
  PhaseBar,
  ProfileAvatar,
  ScenarioArt,
} from "@/components/common";
import { useCommContext } from "@/components/comunicacao/hooks";
import { CategoryTile, FeaturedCard } from "@/components/home/cards";
import { PersonalPlanCard } from "@/components/home/personal-plan-card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { buildFirst48Plan, first48Progress } from "@/lib/jornada/first48";
import { useJornada } from "@/lib/jornada/store";
import type { First48ActivityId, StepTarget } from "@/lib/jornada/types";
import { Button } from "@/components/ui/button";
import type { RulesSection } from "@/components/tools/rules-panel";
import { dayContent } from "@/lib/plan";
import { IMPULSE_GOAL, dayState, impulseFreeDays, planProgress } from "@/lib/progress";
import { scenarioById, type ScenarioId } from "@/lib/scenarios";
import { firstName, initialsOf, useStore } from "@/lib/store";

interface HomeScreenProps {
  openDay: (day: number) => void;
  openPlan: () => void;
  openPause: () => void;
  openRules: (section?: RulesSection) => void;
  openScenario: (id: ScenarioId) => void;
  openScenarios: () => void;
  openDiary: () => void;
  openCommitment: () => void;
  openReset: () => void;
  openMore: () => void;
  openDiagnosis: () => void;
  openMap: () => void;
  openStep: (target: StepTarget, scenario: ScenarioId) => void;
  openFirst48: (activity?: First48ActivityId) => void;
  openCentral: () => void;
  openReply: () => void;
  openProgress: () => void;
  openBenefits: () => void;
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="mx-5 mb-3 flex items-center justify-between">
      <h2 className="font-display text-[17px] font-extrabold text-foreground">{title}</h2>
    </div>
  );
}

const centralSubtitle: Record<string, string> = {
  conversa: "Modelos, orientações e o que não enviar, para o seu momento.",
  pausa: "Hoje, só respostas, e só se ele escrever primeiro.",
  espaco: "Hoje, só respostas, e só se ele escrever primeiro.",
  sem_diagnostico: "Modelos e orientações. O diagnóstico ajusta tudo ao seu momento.",
};

function impulseMessage(days: number) {
  if (days === 0) return "Registre no Diário cada vez que segurar a vontade de mandar mensagem.";
  const label = days === 1 ? "1 dia" : `${days} dias`;
  if (days < IMPULSE_GOAL)
    return `${label} sem agir por impulso. A meta da Fase 1 é ${IMPULSE_GOAL}.`;
  return `${label} sem agir por impulso. A meta da Fase 1 foi cumprida. Que avanço!`;
}

// Hierarquia do Início: 1) Meu Plano Pessoal (diagnóstico e Mapa), 2) próxima atividade (48 horas
// ou o dia do plano), 3) ajuda imediata, 4) Central de Comunicação, 5) jornada de 21 dias,
// 6) Diário e ferramentas (com o acesso ao progresso), 7) conteúdos complementares.
// Cada destino aparece uma vez: o dia do plano não se repete na jornada quando já é a próxima atividade.
export function HomeScreen({
  openDay,
  openPlan,
  openPause,
  openRules,
  openScenario,
  openScenarios,
  openDiary,
  openCommitment,
  openReset,
  openMore,
  openDiagnosis,
  openMap,
  openStep,
  openFirst48,
  openCentral,
  openReply,
  openProgress,
  openBenefits,
}: HomeScreenProps) {
  const { data, entitlements } = useStore();
  const { current, result, data: jornada } = useJornada();
  const [care, setCare] = useState(false);
  const profile = data.profile!;
  const now = new Date();
  const progress = planProgress(data);
  const today = dayContent(progress.currentDay);
  const state = dayState(data, progress.currentDay, { now, allDays: entitlements.allDays });
  const phase = progress.phase;
  const impulse = impulseFreeDays(data, now);
  // Atalho "Meu cenário": o escolhido no perfil; sem ele, o sugerido pelo diagnóstico.
  const shortcutScenario = profile.scenario ?? result?.scenario ?? null;
  // Com limite (diagnóstico ou cenário do perfil), o card da Central não aparece no Início.
  // A Central continua no Perfil e nos cenários, só como leitura.
  const stance = useCommContext().stance;
  const showCentral = stance !== "limite";

  // Próxima atividade: o Meu Plano de 48 Horas enquanto não termina; depois, o dia do plano.
  const first48 = first48Progress(jornada.first48);
  const nextFirst48 =
    current && !first48.complete && first48.next
      ? (buildFirst48Plan(current, profile.scenario).activities.find(
          (item) => item.id === first48.next,
        ) ?? null)
      : null;

  const todayCard = (eyebrow: string) => (
    <section className="mx-5 rounded-card bg-card p-5 shadow-soft">
      <p className="eyebrow">{eyebrow}</p>
      <div className="mt-3 flex items-center gap-4">
        <EmojiBadge name={phase.emoji} tint="rose" size="lg" />
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-lg font-extrabold leading-snug text-foreground">
            {progress.finished ? "Plano concluído!" : today.title}
          </h2>
          <p className="mt-0.5 text-[13px] leading-snug text-muted-foreground">
            {progress.finished
              ? "Você pode rever qualquer dia quando quiser."
              : `Fase ${phase.phase}: ${phase.title}`}
          </p>
        </div>
      </div>
      <p className="mb-2.5 mt-4 text-xs font-bold text-muted-foreground">
        {progress.finished
          ? "21 de 21 dias"
          : `Dia ${progress.currentDay} de 21 · ${today.minutes} min${state === "tomorrow" ? " · libera amanhã" : ""}`}
      </p>
      <PhaseBar completed={progress.total} />
      <Button
        className="mt-4 h-12 w-full rounded-xl text-sm font-bold"
        onClick={() => (state === "open" ? openDay(progress.currentDay) : openPlan())}
      >
        <Play className="fill-current" />
        {progress.finished
          ? "Ver plano completo"
          : state === "open"
            ? `Começar o Dia ${progress.currentDay}`
            : "Ver meu plano"}
      </Button>
    </section>
  );

  return (
    <div className="pb-36">
      <header className="flex items-center justify-between px-5 pt-[max(1.25rem,env(safe-area-inset-top))]">
        <Brand compact />
        <button
          type="button"
          aria-label="Abrir perfil"
          onClick={openMore}
          className="cursor-pointer"
        >
          <ProfileAvatar initials={initialsOf(profile.name)} className="size-11 text-sm" />
        </button>
      </header>

      <section className="relative mt-3 h-[206px] px-5">
        <div className="relative z-10 max-w-[60%] pt-4">
          <p className="text-[15px] font-semibold text-muted-foreground">
            Olá, {firstName(profile.name)}!
          </p>
          <h1 className="mt-1 font-display text-[26px] font-black leading-[1.12] text-foreground">
            {progress.finished ? "Você chegou até o fim do plano!" : "Um passo de cada vez, hoje."}
          </h1>
        </div>
        <Character
          pose={progress.finished ? "comemorando" : phase.pose}
          className="pointer-events-none absolute -bottom-6 right-3 z-0 h-[236px] drop-shadow-[0_14px_16px_rgba(90,20,38,0.14)]"
        />
      </section>

      {/* 1. Meu Plano Pessoal */}
      <div className="relative z-10">
        <PersonalPlanCard openDiagnosis={openDiagnosis} openMap={openMap} openStep={openStep} />
      </div>

      {/* 2. Próxima atividade */}
      <div className="mt-4">
        {nextFirst48 ? (
          <section className="mx-5 rounded-card bg-card p-5 shadow-soft">
            <div className="flex items-center justify-between gap-3">
              <p className="eyebrow">Próxima atividade</p>
              <span className="shrink-0 text-[11px] font-bold text-muted-foreground">
                {first48.done} de {first48.total}
              </span>
            </div>
            <div className="mt-3 flex items-center gap-4">
              <EmojiBadge name="estrela" tint="honey" size="lg" />
              <div className="min-w-0 flex-1">
                <h2 className="font-display text-lg font-extrabold leading-snug">
                  {nextFirst48.n}. {nextFirst48.title}
                </h2>
                <p className="mt-0.5 text-[13px] leading-snug text-muted-foreground">
                  Meu Plano de 48 Horas
                </p>
              </div>
            </div>
            <div className="mt-4 flex">
              <GoalProgress
                tone="primary"
                value={first48.done}
                max={first48.total}
                label="Atividades concluídas do plano de 48 horas"
              />
            </div>
            <Button
              className="mt-4 h-12 w-full rounded-xl text-sm font-bold"
              onClick={() => openFirst48(nextFirst48.id)}
            >
              {first48.done === 0 ? "Começar meu plano de 48 horas" : "Continuar meu plano"}{" "}
              <ArrowRight />
            </Button>
          </section>
        ) : (
          todayCard("Próxima atividade · Plano de hoje")
        )}
      </div>

      {/* 3. Ajuda imediata */}
      <section
        className="mx-5 mt-4 rounded-card bg-card px-4 pb-6 pt-5 shadow-soft max-[359px]:px-3"
        aria-label="Ajuda imediata"
      >
        <h2 className="font-display text-[16px] font-extrabold leading-snug text-foreground">
          Precisa de ajuda agora?
        </h2>
        <div className="mt-4 grid grid-cols-4 gap-1">
          <CategoryTile label="Vontade de escrever" emoji="pausa" onClick={openPause} />
          <CategoryTile label="Ele respondeu?" emoji="contato" onClick={openReply} />
          <CategoryTile
            label="Meu cenário"
            emoji="sinais"
            {...(shortcutScenario
              ? { icon: <ScenarioArt id={shortcutScenario} className="size-12" /> }
              : {})}
            onClick={() => (shortcutScenario ? openScenario(shortcutScenario) : openScenarios())}
          />
          <CategoryTile label="Apoio emocional" emoji="escudo" onClick={() => setCare(true)} />
        </div>
      </section>

      {/* 4. Central de Comunicação */}
      {showCentral && (
        <button
          type="button"
          onClick={openCentral}
          className="mx-5 mt-4 flex w-[calc(100%-2.5rem)] cursor-pointer items-center gap-4 rounded-card bg-card p-5 text-left shadow-soft transition-transform active:scale-[0.99]"
        >
          <EmojiBadge name="celular" tint="lavender" size="lg" />
          <span className="min-w-0 flex-1">
            <span className="block font-display text-[16px] font-extrabold leading-snug">
              Central de Comunicação
            </span>
            <span className="mt-0.5 block text-[13px] leading-snug text-muted-foreground">
              {centralSubtitle[stance] ?? centralSubtitle["sem_diagnostico"]}
            </span>
          </span>
          <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
        </button>
      )}

      {/* 5. Jornada de 21 dias */}
      <div className="mt-8">
        <SectionHeader title="Sua jornada de 21 dias" />
        {nextFirst48 && <div className="mb-4">{todayCard("Plano de hoje")}</div>}
        <section className="mx-5 overflow-hidden rounded-card bg-goal-card p-5 text-primary-foreground shadow-glow">
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="eyebrow eyebrow-light">Meta da fase {phase.phase}</p>
              <h2 className="mt-1 font-display text-[18px] font-extrabold leading-snug">
                {progress.finished ? "Todas as fases concluídas!" : phase.goal}
              </h2>
              <p className="mt-1.5 text-[13px] leading-snug text-primary-foreground/85">
                {phase.objective}
              </p>
            </div>
            <Emoji
              name="estrela"
              className="pointer-events-none size-20 shrink-0 drop-shadow-[0_10px_14px_rgba(90,20,38,0.28)]"
            />
          </div>
          <div className="mt-5">
            <div className="flex items-center gap-3">
              <GoalProgress
                value={progress.phaseDone}
                max={progress.phaseTotal}
                label={`Dias concluídos na fase ${phase.phase}`}
              />
              <span className="shrink-0 text-xs font-bold">
                {progress.phaseDone} de {progress.phaseTotal} dias da fase
              </span>
            </div>
            <p className="mt-2.5 text-[12px] leading-snug text-primary-foreground/70">
              {progress.phaseDone >= progress.phaseTotal
                ? "Todos os dias da fase concluídos!"
                : "Pequenos passos também contam."}
            </p>
          </div>
        </section>

        <button
          type="button"
          onClick={openPlan}
          className="mx-5 mt-4 flex w-[calc(100%-2.5rem)] cursor-pointer items-center justify-center gap-1 py-1 text-[13px] font-bold text-primary"
        >
          Ver caminho completo do plano <ChevronRight className="size-4" />
        </button>
      </div>

      {/* 6. Diário e ferramentas */}
      <div className="mt-8">
        <SectionHeader title="Diário e ferramentas" />
        <section
          className="mx-5 rounded-card bg-card px-4 pb-5 pt-5 shadow-soft max-[359px]:px-3"
          aria-label="Diário e ferramentas"
        >
          <div className="grid grid-cols-4 gap-1">
            <CategoryTile label="Meu diário" emoji="diario" onClick={openDiary} />
            <CategoryTile label="Regras de ouro" emoji="regras" onClick={() => openRules()} />
            <CategoryTile label="Sinais" emoji="sinais" onClick={() => openRules("signals")} />
            <CategoryTile label="Nunca enviar" emoji="nunca" onClick={() => openRules("never")} />
          </div>
        </section>
        <button
          type="button"
          onClick={openProgress}
          className="mx-5 mt-4 flex w-[calc(100%-2.5rem)] cursor-pointer items-center gap-3 rounded-card bg-card p-5 text-left shadow-soft transition-transform active:scale-[0.99]"
        >
          <Emoji name="medalha" className="size-24 shrink-0" />
          <span className="min-w-0 flex-1">
            <span className="block font-display text-[15px] font-extrabold text-foreground">
              Pequenos avanços
            </span>
            <span className="mt-1.5 block text-[13px] leading-snug text-muted-foreground">
              {impulseMessage(impulse)}
            </span>
            <span className="mt-3 inline-flex items-center gap-1 text-[12px] font-extrabold text-primary">
              <TrendingUp className="size-3.5" strokeWidth={3} /> Ver meu progresso
            </span>
          </span>
        </button>
      </div>

      {/* 7. Conteúdos complementares. O Reset Emocional do Ex (oferta antiga) só aparece para quem
          já comprou; para as demais, o lugar é de Meus Benefícios (as três ofertas atuais). */}
      <div className="mt-8">
        <SectionHeader title="Conteúdos complementares" />
        <div className="mx-5 grid grid-cols-2 gap-4">
          {entitlements.reset ? (
            <FeaturedCard
              title="Reset Emocional do Ex"
              subtitle="Protocolo de Reconstrução da Confiança."
              badge="Liberado"
              badgeClassName="bg-card text-success"
              tint="lavender"
              emoji="brilho"
              onClick={openReset}
            />
          ) : (
            <FeaturedCard
              title="Meus Benefícios"
              subtitle="Conselheiro, Círculo e Acesso Total Vitalício."
              badge="Seus"
              badgeClassName="bg-card text-foreground"
              tint="honey"
              emoji="trofeu"
              action="Ver"
              onClick={openBenefits}
            />
          )}
          <FeaturedCard
            title="Meu compromisso"
            subtitle="Os limites que você escolheu respeitar."
            badge="Seu"
            badgeClassName="bg-card text-success"
            tint="sage"
            emoji="compromisso"
            onClick={openCommitment}
          />
        </div>
        {entitlements.reset && (
          <button
            type="button"
            onClick={openBenefits}
            className="mx-5 mt-4 flex w-[calc(100%-2.5rem)] cursor-pointer items-center gap-3 rounded-card bg-card px-5 py-4 text-left shadow-soft"
          >
            <span className="flex-1 font-display text-[15px] font-extrabold">Meus Benefícios</span>
            <ChevronRight className="size-4 text-muted-foreground" />
          </button>
        )}
      </div>

      <Dialog open={care} onOpenChange={setCare}>
        <DialogContent className="w-[calc(100%-2rem)] rounded-2xl border-border sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Apoio emocional</DialogTitle>
            <DialogDescription className="leading-6">
              Você não precisa atravessar isso sozinha. Se a dor estiver pesada demais, ligue agora.
              Se você vive ou viveu uma relação com violência, procure ajuda especializada.
            </DialogDescription>
          </DialogHeader>
          <CareLines highlight />
        </DialogContent>
      </Dialog>
    </div>
  );
}
