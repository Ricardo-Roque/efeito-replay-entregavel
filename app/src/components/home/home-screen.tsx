import { ArrowRight, ChevronRight, Play, TrendingUp } from "lucide-react";

import {
  Brand,
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
import { benefitAccess, type BenefitId } from "@/lib/benefits";
import type { CommCategoryId, ReplySituationId } from "@/lib/comunicacao/types";
import { features } from "@/lib/features";
import { vslTechniques } from "@/lib/jornada/messages";
import type { EmojiName } from "@/lib/illustrations";
import { buildFirst48Plan, first48Progress } from "@/lib/jornada/first48";
import { useJornada } from "@/lib/jornada/store";
import type { First48ActivityId, StepTarget, VslTechniqueId } from "@/lib/jornada/types";
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
  openMore: () => void;
  openDiagnosis: () => void;
  openMap: () => void;
  openStep: (target: StepTarget, scenario: ScenarioId) => void;
  openFirst48: (activity?: First48ActivityId) => void;
  openCentral: (category?: CommCategoryId) => void;
  openTechnique: (id: VslTechniqueId) => void;
  openReply: (situation?: ReplySituationId) => void;
  openProgress: () => void;
  openBenefits: (only: BenefitId) => void;
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="mx-5 mb-3 flex items-center justify-between">
      <h2 className="font-display text-[17px] font-extrabold text-foreground">{title}</h2>
    </div>
  );
}

/** Cards dos três upsells atuais (textos curtos; o detalhe fica na tela de cada benefício). */
const UPSELL_CARDS: {
  id: BenefitId;
  title: string;
  subtitle: string;
  tint: "rose" | "lavender" | "honey";
  emoji: EmojiName;
}[] = [
  {
    id: "conselheiro",
    title: "Conselheiro da Reconquista",
    subtitle: "Orientação individual pelo WhatsApp.",
    tint: "rose",
    emoji: "escrever",
  },
  {
    id: "circulo",
    title: "Círculo da Reconquista",
    subtitle: "Comunidade de mulheres para trocar experiências.",
    tint: "lavender",
    emoji: "estrela",
  },
  {
    id: "vitalicio",
    title: "Acesso Total Vitalício",
    subtitle: "Sem mensalidade nem renovação.",
    tint: "honey",
    emoji: "trofeu",
  },
];

/** Arte do atalho de cada técnica editorial. */
const TECHNIQUE_EMOJI: Record<VslTechniqueId, EmojiName> = {
  tres_palavras: "escrever",
  comeca_com_h: "contato",
  pensando_aqui: "celular",
  frase_3: "regras",
  frase_replay: "brilho",
  buraco_negro: "sinais",
  tecnica_noturna: "estrela",
};

const centralSubtitle: Record<string, string> = {
  conversa: "Modelos, orientações e o que não enviar, para o seu momento.",
  pausa: "Hoje, só respostas, e só se ele escrever primeiro.",
  espaco: "Hoje, só respostas, e só se ele escrever primeiro.",
  limite: "Orientações para cuidar de você, sem sugerir contato ou contornar limites.",
  sem_diagnostico: "Modelos e orientações. O diagnóstico ajusta tudo ao seu momento.",
};

function impulseMessage(days: number) {
  if (days === 0) return "Registre no Diário cada vez que segurar a vontade de mandar mensagem.";
  const label = days === 1 ? "1 dia" : `${days} dias`;
  if (days < IMPULSE_GOAL)
    return `${label} sem agir por impulso. A meta da Fase 1 é ${IMPULSE_GOAL}.`;
  return `${label} sem agir por impulso. A meta da Fase 1 foi cumprida. Que avanço!`;
}

// Hierarquia do Início, só com o que a VSL promete: 1) protocolo personalizado, 2) mensagens e
// técnicas, 3) o que fazer depois e 4) situações especiais. Os upsells continuam abaixo, sem se
// misturar ao produto principal. A jornada de 21 dias, o Diário, as 48 horas e o progresso só
// reaparecem se forem ligados em lib/features.ts.
export function HomeScreen({
  openDay,
  openPlan,
  openPause,
  openRules,
  openScenario,
  openScenarios,
  openDiary,
  openMore,
  openDiagnosis,
  openMap,
  openStep,
  openFirst48,
  openCentral,
  openTechnique,
  openReply,
  openProgress,
  openBenefits,
}: HomeScreenProps) {
  const { data, entitlements } = useStore();
  const { current, result, data: jornada } = useJornada();
  const profile = data.profile!;
  const now = new Date();
  const progress = planProgress(data);
  const today = dayContent(progress.currentDay);
  const state = dayState(data, progress.currentDay, { now, allDays: entitlements.allDays });
  const phase = progress.phase;
  const impulse = impulseFreeDays(data, now);
  // Atalho "Meu cenário": o escolhido no perfil; sem ele, o sugerido pelo diagnóstico.
  const shortcutScenario = profile.scenario ?? result?.scenario ?? null;
  const stance = useCommContext().stance;

  // Próxima atividade: o Meu Plano de 48 Horas enquanto não termina; depois, o dia do plano.
  const first48 = first48Progress(jornada.first48);
  const nextFirst48 =
    features.first48 && current && !first48.complete && first48.next
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
            {features.plan21 && progress.finished
              ? "Você chegou até o fim do plano!"
              : "Um passo de cada vez, hoje."}
          </h1>
        </div>
        <Character
          pose={features.plan21 && progress.finished ? "comemorando" : phase.pose}
          className="pointer-events-none absolute -bottom-6 right-3 z-0 h-[236px] drop-shadow-[0_14px_16px_rgba(90,20,38,0.14)]"
        />
      </section>

      {/* 1. Meu Protocolo Personalizado */}
      <div className="relative z-10">
        <PersonalPlanCard openDiagnosis={openDiagnosis} openMap={openMap} openStep={openStep} />
      </div>

      {/* Próxima atividade: só com as 48 horas ou o plano de 21 dias ligados */}
      {(nextFirst48 || features.plan21) && (
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
      )}

      {/* 2. Mensagens e Técnicas */}
      <div className="mt-8">
        <SectionHeader title="Mensagens e técnicas" />
        <button
          type="button"
          onClick={() => openCentral()}
          className="mx-5 flex w-[calc(100%-2.5rem)] cursor-pointer items-center gap-4 rounded-card bg-card p-5 text-left shadow-soft transition-transform active:scale-[0.99]"
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

        {/* Técnicas editoriais: itens completos abrem o detalhe; pendências continuam "Em breve". */}
        <section
          className="mx-5 mt-4 rounded-card bg-card px-4 pb-6 pt-5 shadow-soft max-[359px]:px-3"
          aria-label="Técnicas do aplicativo"
        >
          <div className="grid grid-cols-4 gap-x-1 gap-y-5">
            {vslTechniques.map((technique) => (
              <CategoryTile
                key={technique.id}
                label={technique.shortName}
                emoji={TECHNIQUE_EMOJI[technique.id]}
                soon={technique.status === "aguardando_material"}
                onClick={() => openTechnique(technique.id)}
              />
            ))}
          </div>
        </section>
      </div>

      {/* 3. O Que Fazer Depois: atalhos para o mesmo assistente, sem duplicar conteúdo. */}
      <div className="mt-8">
        <SectionHeader title="O que fazer depois" />
        <section
          className="mx-5 rounded-card bg-card px-4 pb-6 pt-5 shadow-soft max-[359px]:px-3"
          aria-label="O que fazer depois"
        >
          <div className="grid grid-cols-4 gap-x-1 gap-y-5">
            <CategoryTile label="Ele respondeu" emoji="contato" onClick={() => openReply()} />
            <CategoryTile label="Resposta fria" emoji="celular" onClick={() => openReply("frio")} />
            <CategoryTile label="Ressentimento" emoji="sinais" onClick={() => openReply("magoa")} />
            <CategoryTile
              label="Não respondeu"
              emoji="nunca"
              onClick={() => openReply("visualizou")}
            />
            <CategoryTile
              label="Quer conversar"
              emoji="escrever"
              onClick={() => openReply("conversar")}
            />
            <CategoryTile
              label="Sugeriu encontro"
              emoji="estrela"
              onClick={() => openReply("encontro")}
            />
            <CategoryTile
              label="Continuar conversa"
              emoji="brilho"
              onClick={() => openReply("pergunta")}
            />
            <CategoryTile
              label="Reconstruir confiança"
              emoji="escudo"
              onClick={() => openCentral("confianca")}
            />
          </div>
        </section>
        <button
          type="button"
          onClick={openPause}
          className="mx-5 mt-4 flex w-[calc(100%-2.5rem)] cursor-pointer items-center gap-4 rounded-card bg-card p-5 text-left shadow-soft transition-transform active:scale-[0.99]"
        >
          <EmojiBadge name="pausa" tint="honey" size="lg" />
          <span className="min-w-0 flex-1">
            <span className="block font-display text-[16px] font-extrabold leading-snug">
              Pausa antes de enviar
            </span>
            <span className="mt-0.5 block text-[13px] leading-snug text-muted-foreground">
              Escreva, confira os limites e decida sem agir por impulso.
            </span>
          </span>
          <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
        </button>
      </div>

      {/* 4. Situações Especiais: reaproveita os cenários já existentes. */}
      <div className="mt-8">
        <SectionHeader title="Situações especiais" />
        <button
          type="button"
          onClick={() => (shortcutScenario ? openScenario(shortcutScenario) : openScenarios())}
          className="mx-5 flex w-[calc(100%-2.5rem)] cursor-pointer items-center gap-4 rounded-card bg-card p-5 text-left shadow-soft transition-transform active:scale-[0.99]"
        >
          {shortcutScenario ? (
            <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-primary-soft">
              <ScenarioArt id={shortcutScenario} className="size-14" />
            </span>
          ) : (
            <EmojiBadge name="sinais" tint="rose" size="lg" />
          )}
          <span className="min-w-0 flex-1">
            <span className="block font-display text-[16px] font-extrabold leading-snug">
              {shortcutScenario
                ? scenarioById(shortcutScenario).label
                : "Encontre a orientação para a sua situação"}
            </span>
            <span className="mt-0.5 block text-[13px] leading-snug text-muted-foreground">
              Bloqueio, frieza, falta de resposta, outra pessoa, conversa retomada ou encontro.
            </span>
          </span>
          <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
        </button>
        {shortcutScenario && (
          <button
            type="button"
            onClick={openScenarios}
            className="mx-5 mt-3 flex min-h-11 w-[calc(100%-2.5rem)] cursor-pointer items-center justify-center gap-1 py-2 text-[13px] font-bold text-primary"
          >
            Ver todas as situações <ChevronRight className="size-4" />
          </button>
        )}
        <p className="mx-5 mt-3 text-center text-[12px] leading-snug text-muted-foreground">
          Término antigo, traição e conflitos anteriores também são considerados no seu protocolo.
        </p>
      </div>

      {/* Jornada de 21 dias (oculta em lib/features.ts) */}
      {features.plan21 && (
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
      )}

      {/* Diário e ferramentas, com o progresso (ocultos em lib/features.ts) */}
      {(features.diary || features.progress) && (
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
      )}

      {/* 5. Conteúdos complementares: um card por upsell atual. O selo "Liberado" vem só do
          servidor (cr_my_entitlements); sem ele, o card mostra a oferta. */}
      <div className="mt-8">
        <SectionHeader title="Conteúdos complementares" />
        <div className="mx-5 grid grid-cols-2 gap-4">
          {UPSELL_CARDS.map((card) => {
            const owned = benefitAccess(entitlements.benefits[card.id]) === "liberado";
            return (
              <FeaturedCard
                key={card.id}
                title={card.title}
                subtitle={card.subtitle}
                badge={owned ? "Liberado" : "Extra"}
                badgeClassName={owned ? "bg-card text-success" : "bg-card text-foreground"}
                tint={card.tint}
                emoji={card.emoji}
                locked={!owned}
                action={owned ? "Abrir" : "Conhecer"}
                onClick={() => openBenefits(card.id)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
