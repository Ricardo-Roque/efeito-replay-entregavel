import { useMemo, useState, type ReactNode } from "react";
import { Hourglass, MessageCircleReply, Search, ShieldAlert, Star, X } from "lucide-react";

import { EmojiBadge, Overlay, SectionTitle } from "@/components/common";
import { useCommContext } from "@/components/comunicacao/hooks";
import { MessageCard } from "@/components/comunicacao/shared";
import { Button } from "@/components/ui/button";
import { commCategories } from "@/lib/comunicacao/library";
import {
  EMPTY_FILTERS,
  countByCategory,
  filterMessages,
  highlightsFor,
  stanceNotice,
} from "@/lib/comunicacao/rules";
import type { CommCategoryId, CommFilters } from "@/lib/comunicacao/types";
import { useJornada } from "@/lib/jornada/store";
import { scenarios, type ScenarioId } from "@/lib/scenarios";
import { cn } from "@/lib/utils";

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "shrink-0 cursor-pointer whitespace-nowrap rounded-full border px-3.5 py-2 text-[13px] font-bold transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-foreground hover:bg-muted",
      )}
    >
      {children}
    </button>
  );
}

const noticeTone = {
  stop: "border border-destructive/30 bg-destructive-soft",
  care: "bg-tint-honey",
  info: "bg-primary-soft",
} as const;

/**
 * Central de Comunicação: busca, filtros por categoria e cenário, destaques do diagnóstico e
 * acesso à Pausa e ao "Ele respondeu. E agora?". Os filtros ficam guardados enquanto a camada
 * estiver aberta, então voltar de um detalhe mantém a busca.
 */
export function CentralScreen({
  initialCategory,
  initialScenario,
  onClose,
  openMessage,
  openReply,
  openPause,
  openDiagnosis,
}: {
  initialCategory?: CommCategoryId | undefined;
  initialScenario?: ScenarioId | undefined;
  onClose: () => void;
  openMessage: (id: string) => void;
  openReply: () => void;
  openPause: (draft?: string) => void;
  openDiagnosis: () => void;
}) {
  const ctx = useCommContext();
  const { data } = useJornada();
  const favorites = data.messages.favorites;
  const [filters, setFilters] = useState<CommFilters>({
    ...EMPTY_FILTERS,
    ...(initialCategory ? { category: initialCategory } : {}),
    ...(initialScenario ? { scenario: initialScenario } : {}),
  });
  const set = (patch: Partial<CommFilters>) => setFilters((current) => ({ ...current, ...patch }));

  const results = useMemo(() => filterMessages(ctx, filters, favorites), [ctx, filters, favorites]);
  const highlights = useMemo(() => highlightsFor(ctx), [ctx]);
  const counts = useMemo(() => countByCategory(), []);
  const notice = stanceNotice(ctx.stance);
  const filtered =
    filters.query.trim() !== "" ||
    filters.category !== "todas" ||
    filters.scenario !== "todos" ||
    filters.onlyUsable ||
    filters.onlyFavorites;
  const sendBlocked = ctx.stance === "limite";
  const favoriteCount = Object.keys(favorites).length;

  // Com "todas", agrupa por categoria; com uma categoria escolhida, lista direto.
  const groups = commCategories
    .map((category) => ({
      category,
      items: results.filter((item) => item.category === category.id),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <Overlay eyebrow="Biblioteca" title="Central de Comunicação" onClose={onClose}>
      <div className="flex items-center gap-4">
        <EmojiBadge name="celular" tint="rose" size="lg" />
        <p className="text-[15px] font-semibold leading-snug">
          Encontre orientações e exemplos para cada momento da conversa.
        </p>
      </div>

      <section
        role="note"
        aria-label={notice.title}
        className={cn("mt-5 rounded-card p-4", noticeTone[notice.tone])}
      >
        <p className="flex items-center gap-2 font-display text-[15px] font-extrabold">
          {notice.tone === "stop" && <ShieldAlert className="size-5 shrink-0 text-destructive" />}
          {notice.title}
        </p>
        <p className="mt-1.5 text-[13px] leading-snug">{notice.text}</p>
        {ctx.stance === "sem_diagnostico" && (
          <Button className="mt-3 h-10 rounded-xl text-[13px] font-bold" onClick={openDiagnosis}>
            Fazer meu diagnóstico
          </Button>
        )}
      </section>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => openPause()}
          className="flex cursor-pointer flex-col items-start gap-2 rounded-card bg-tint-honey p-4 text-left transition-transform active:scale-[0.98]"
        >
          <Hourglass className="size-5 text-primary" />
          <span className="font-display text-[14px] font-extrabold leading-tight">
            Pausa antes de enviar
          </span>
          <span className="text-[12px] leading-snug text-muted-foreground">
            {sendBlocked
              ? "Escreva para tirar o peso. Fica só com você."
              : "Confira antes de mandar."}
          </span>
        </button>
        <button
          type="button"
          onClick={openReply}
          className="flex cursor-pointer flex-col items-start gap-2 rounded-card bg-tint-sage p-4 text-left transition-transform active:scale-[0.98]"
        >
          <MessageCircleReply className="size-5 text-primary" />
          <span className="font-display text-[14px] font-extrabold leading-tight">
            Ele respondeu. E agora?
          </span>
          <span className="text-[12px] leading-snug text-muted-foreground">
            Como ler e responder ao que ele mandou.
          </span>
        </button>
      </div>

      {!filtered && highlights.length > 0 && (
        <>
          <SectionTitle>
            {ctx.stance === "conversa" ? "Para o seu momento" : "Comece por aqui"}
          </SectionTitle>
          <p className="-mt-1 mb-3 text-[13px] leading-snug text-muted-foreground">
            {ctx.stance === "conversa"
              ? "Escolhidos a partir do seu diagnóstico."
              : ctx.stance === "sem_diagnostico"
                ? "Uma amostra. Com o diagnóstico, os destaques passam a ser para você."
                : "Conteúdos que respeitam o seu momento. Nenhum pede que você comece uma conversa."}
          </p>
          <div className="space-y-3">
            {highlights.map((message) => (
              <MessageCard
                key={message.id}
                message={message}
                ctx={ctx}
                favorite={Boolean(favorites[message.id])}
                onOpen={openMessage}
              />
            ))}
          </div>
        </>
      )}

      <SectionTitle>Biblioteca</SectionTitle>
      <label className="relative block">
        <span className="sr-only">Buscar na Central</span>
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={filters.query}
          onChange={(event) => set({ query: event.target.value })}
          placeholder="Buscar: saudade, não responde, convite…"
          className="h-12 w-full rounded-xl border border-input bg-card pl-10 pr-11 text-base shadow-sm outline-none focus:border-primary [&::-webkit-search-cancel-button]:hidden"
        />
        {filters.query && (
          <button
            type="button"
            aria-label="Limpar busca"
            onClick={() => set({ query: "" })}
            className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 cursor-pointer place-items-center rounded-full text-muted-foreground hover:bg-muted"
          >
            <X className="size-4" />
          </button>
        )}
      </label>

      <p className="eyebrow mb-2 mt-4">Categoria</p>
      <div
        role="group"
        aria-label="Filtrar por categoria"
        className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1"
      >
        <Chip active={filters.category === "todas"} onClick={() => set({ category: "todas" })}>
          Todas
        </Chip>
        {commCategories.map((category) => (
          <Chip
            key={category.id}
            active={filters.category === category.id}
            onClick={() => set({ category: category.id })}
          >
            {category.label} · {counts[category.id]}
          </Chip>
        ))}
      </div>

      <p className="eyebrow mb-2 mt-4">Cenário</p>
      <div
        role="group"
        aria-label="Filtrar por cenário"
        className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1"
      >
        <Chip active={filters.scenario === "todos"} onClick={() => set({ scenario: "todos" })}>
          Todos
        </Chip>
        {scenarios.map((scenario) => (
          <Chip
            key={scenario.id}
            active={filters.scenario === scenario.id}
            onClick={() => set({ scenario: scenario.id })}
          >
            {scenario.label}
            {ctx.scenario === scenario.id && " · seu"}
          </Chip>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {!sendBlocked && (
          <Chip
            active={filters.onlyUsable}
            onClick={() => set({ onlyUsable: !filters.onlyUsable })}
          >
            Só o que posso usar agora
          </Chip>
        )}
        <Chip
          active={filters.onlyFavorites}
          onClick={() => set({ onlyFavorites: !filters.onlyFavorites })}
        >
          <Star className="mr-1 inline size-3.5 align-[-2px]" />
          Favoritos{favoriteCount > 0 && ` · ${favoriteCount}`}
        </Chip>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-[13px] font-bold text-muted-foreground" role="status">
          {results.length === 1 ? "1 conteúdo" : `${results.length} conteúdos`}
        </p>
        {filtered && (
          <button
            type="button"
            onClick={() => setFilters(EMPTY_FILTERS)}
            className="cursor-pointer text-[13px] font-extrabold text-primary"
          >
            Limpar filtros
          </button>
        )}
      </div>

      {results.length === 0 ? (
        <div className="mt-3 rounded-card bg-muted p-5 text-center">
          <p className="text-sm font-bold">Nada encontrado com esses filtros.</p>
          <p className="mt-1 text-[13px] leading-snug text-muted-foreground">
            {filters.onlyFavorites && favoriteCount === 0
              ? "Você ainda não favoritou nenhum conteúdo. Toque na estrela dentro de um conteúdo para guardar aqui."
              : "Tente outra palavra ou limpe os filtros."}
          </p>
          <Button
            variant="outline"
            className="mt-3 h-10 rounded-xl bg-card font-bold"
            onClick={() => setFilters(EMPTY_FILTERS)}
          >
            Limpar filtros
          </Button>
        </div>
      ) : (
        <div className="mt-3 space-y-6">
          {groups.map((group) => (
            <section key={group.category.id} aria-label={group.category.label}>
              {filters.category === "todas" && (
                <div className="mb-2.5">
                  <h3 className="font-display text-[15px] font-extrabold">
                    {group.category.label}
                  </h3>
                  <p className="text-[12px] leading-snug text-muted-foreground">
                    {group.category.description}
                  </p>
                </div>
              )}
              <div className="space-y-3">
                {group.items.map((message) => (
                  <MessageCard
                    key={message.id}
                    message={message}
                    ctx={ctx}
                    favorite={Boolean(favorites[message.id])}
                    onOpen={openMessage}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <p className="mt-8 text-center text-xs leading-5 text-muted-foreground">
        Exemplos escritos para o Código da Reconquista, para você adaptar com as suas palavras.
        Nenhuma mensagem garante resposta ou controla o que ele sente. Não enviar nada também é uma
        escolha.
      </p>
    </Overlay>
  );
}
