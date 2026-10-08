import { ChevronRight, Play } from "lucide-react";

import {
  Brand,
  Character,
  Emoji,
  EmojiBadge,
  GoalProgress,
  PhaseBar,
  ProfileAvatar,
  ScenarioBadge,
} from "@/components/common";
import { CategoryTile, FeaturedCard } from "@/components/home/cards";
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
  openMore: () => void;
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="mx-5 mb-3 flex items-center justify-between">
      <h2 className="font-display text-[17px] font-extrabold text-foreground">{title}</h2>
    </div>
  );
}

function impulseMessage(days: number) {
  if (days === 0) return "Registre no Diário cada vez que segurar a vontade de mandar mensagem.";
  const label = days === 1 ? "1 dia" : `${days} dias`;
  if (days < IMPULSE_GOAL)
    return `${label} sem agir por impulso. A meta da Fase 1 é ${IMPULSE_GOAL}.`;
  return `${label} sem agir por impulso. A meta da Fase 1 foi cumprida. Que avanço!`;
}

// Mesma ordem da Home do Calm Kids: 1) o que fazer hoje, 2) ajuda imediata, 3) meta da fase,
// 4) seu cenário, 5) evolução, 6) conteúdos extras por último.
export function HomeScreen({
  openDay,
  openPlan,
  openPause,
  openRules,
  openScenario,
  openScenarios,
  openDiary,
  openCommitment,
  openMore,
}: HomeScreenProps) {
  const { data } = useStore();
  const profile = data.profile!;
  const now = new Date();
  const progress = planProgress(data);
  const today = dayContent(progress.currentDay);
  const state = dayState(data, progress.currentDay, now);
  const phase = progress.phase;
  const scenario = scenarioById(profile.scenario);
  const impulse = impulseFreeDays(data, now);

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

      <div className="relative z-10">
        <section className="mx-5 rounded-card bg-card p-5 shadow-soft">
          <p className="eyebrow">Plano de hoje</p>
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
                ? "Começar agora"
                : "Ver meu plano"}
          </Button>
        </section>
      </div>

      <button
        type="button"
        onClick={openPause}
        className="mx-5 mt-4 flex w-[calc(100%-2.5rem)] cursor-pointer items-center gap-4 rounded-card bg-card p-4 text-left shadow-soft ring-2 ring-primary/15 transition-transform active:scale-[0.99]"
      >
        <EmojiBadge name="pausa" tint="honey" size="lg" />
        <span className="min-w-0 flex-1">
          <span className="block font-display text-[17px] font-extrabold leading-snug">
            Vontade de mandar mensagem?
          </span>
          <span className="mt-0.5 block text-[13px] text-muted-foreground">
            Faça a pausa antes de enviar
          </span>
        </span>
        <ChevronRight className="size-5 text-primary" />
      </button>

      <section
        className="mx-5 mt-7 rounded-card bg-card px-4 pb-10 pt-5 shadow-soft"
        aria-label="O que você precisa agora?"
      >
        <h2 className="font-display text-[16px] font-extrabold leading-snug text-foreground">
          O que você precisa agora?
        </h2>
        <div className="mt-4 grid grid-cols-4 gap-1">
          <CategoryTile label="Regras de ouro" emoji="regras" onClick={() => openRules()} />
          <CategoryTile label="Sinais" emoji="sinais" onClick={() => openRules("signals")} />
          <CategoryTile label="Nunca enviar" emoji="nunca" onClick={() => openRules("never")} />
          <CategoryTile label="Meu diário" emoji="diario" onClick={openDiary} />
        </div>
      </section>

      <section className="relative z-10 mx-5 -mt-6 overflow-hidden rounded-card bg-goal-card p-5 text-primary-foreground shadow-glow">
        <div className="max-w-[64%]">
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
          className="pointer-events-none absolute -right-1 top-4 size-24 drop-shadow-[0_10px_14px_rgba(90,20,38,0.28)]"
        />
        <div className="mt-5">
          <div className="flex items-center gap-3">
            <GoalProgress
              value={progress.phaseDone}
              max={progress.phaseTotal}
              label={`Dias concluídos na fase ${phase.phase}`}
            />
            <span className="shrink-0 text-xs font-bold">
              {progress.phaseDone} de {progress.phaseTotal} dias
            </span>
          </div>
          <p className="mt-2.5 text-[12px] leading-snug text-primary-foreground/70">
            {progress.phaseDone >= progress.phaseTotal
              ? "Meta da fase cumprida!"
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

      <section className="mx-5 mt-6 rounded-card bg-card p-5 shadow-soft">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-[16px] font-extrabold text-foreground">Seu cenário</h2>
          <button
            type="button"
            onClick={openScenarios}
            className="cursor-pointer rounded-full bg-tint-rose px-3 py-1 text-[11px] font-extrabold text-primary"
          >
            Trocar
          </button>
        </div>
        <button
          type="button"
          onClick={() => openScenario(scenario.id)}
          className="mt-4 flex w-full cursor-pointer items-center gap-4 text-left"
        >
          <ScenarioBadge id={scenario.id} tint={scenario.tint} size="lg" />
          <span className="min-w-0 flex-1">
            <span className="block font-display text-[16px] font-extrabold leading-snug">
              {scenario.label}
            </span>
            <span className="mt-0.5 block text-[13px] text-muted-foreground">{scenario.short}</span>
          </span>
          <ChevronRight className="size-5 text-muted-foreground" />
        </button>
      </section>

      <section className="mx-5 mt-6 flex items-center gap-3 rounded-card bg-card p-5 shadow-soft">
        <Emoji name="medalha" className="size-24 shrink-0" />
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-[15px] font-extrabold text-foreground">
            Pequenos avanços
          </h2>
          <p className="mt-1.5 text-[13px] leading-snug text-muted-foreground">
            {impulseMessage(impulse)}
          </p>
          <span className="mt-3 inline-block rounded-full bg-tint-sage px-3 py-1 text-[11px] font-extrabold text-foreground">
            {progress.total} de 21 dias do plano
          </span>
        </div>
      </section>

      <div className="mt-8">
        <SectionHeader title="Especialmente para você" />
        <div className="mx-5 grid grid-cols-2 gap-4">
          <FeaturedCard
            title="Regras de ouro"
            subtitle="Os 3 erros, o que nunca enviar e como não voltar ao padrão."
            badge="Guia"
            badgeClassName="bg-card text-primary"
            tint="honey"
            emoji="regras"
            onClick={() => openRules()}
          />
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
      </div>
    </div>
  );
}
