import { features } from "@/lib/features";
import { navIcons } from "@/lib/icons";
import { cn } from "@/lib/utils";

export type AppTab = keyof typeof navIcons;

// Plano e Diário ficam fora da navegação quando ocultos (lib/features.ts).
const tabs: { id: AppTab; label: string }[] = [
  { id: "home", label: "Início" },
  ...(features.plan21 ? [{ id: "plan" as const, label: "Plano" }] : []),
  { id: "scenarios", label: "Situações" },
  ...(features.diary ? [{ id: "diary" as const, label: "Diário" }] : []),
  { id: "more", label: "Perfil" },
];

const itemClass =
  "flex flex-1 cursor-pointer flex-col items-center gap-1 rounded-tile px-1 py-2 text-[11px] font-bold transition-colors";

/** Navegação inferior fixa, arredondada e flutuante (mesma do Calm Kids e do CalmBaby). */
export function BottomNav({
  active,
  onSelect,
}: {
  active: AppTab;
  onSelect: (tab: AppTab) => void;
}) {
  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-[430px] px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
    >
      <div className="flex items-stretch justify-around rounded-card bg-card/95 p-1.5 shadow-float backdrop-blur">
        {tabs.map((tab) => {
          const Icon = navIcons[tab.id];
          const isActive = tab.id === active;
          return (
            <button
              key={tab.id}
              type="button"
              aria-current={isActive ? "page" : undefined}
              onClick={() => onSelect(tab.id)}
              className={cn(
                itemClass,
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon
                className={cn("size-6", isActive && "fill-primary/20")}
                strokeWidth={isActive ? 2.4 : 2}
              />
              {tab.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
