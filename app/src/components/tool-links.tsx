import type { ReactNode } from "react";
import {
  BookOpen,
  CalendarDays,
  ChevronRight,
  ClipboardList,
  Compass,
  Hourglass,
  Map as MapIcon,
  MessageCircleReply,
  MessageSquareText,
  MessagesSquare,
  NotebookPen,
} from "lucide-react";

import { useResolveLink } from "@/components/use-resolve-link";
import { linkLabel, type AppLink, type LabeledLink } from "@/lib/app-link";
import { features } from "@/lib/features";
import { cn } from "@/lib/utils";

const icon: Record<AppLink["kind"], ReactNode> = {
  pause: <Hourglass />,
  diary: <NotebookPen />,
  rules: <BookOpen />,
  central: <MessagesSquare />,
  message: <MessageSquareText />,
  reply: <MessageCircleReply />,
  scenario: <Compass />,
  day: <CalendarDays />,
  map: <MapIcon />,
  diagnosis: <ClipboardList />,
};

/** Lista de atalhos para ferramentas e conteúdos (plano de 21 dias e cenários). */
export function ToolLinks({
  links,
  onOpen,
  className,
}: {
  links: LabeledLink[];
  onOpen: (link: AppLink) => void;
  className?: string;
}) {
  const resolve = useResolveLink();
  // Depois de resolver, dois atalhos podem levar ao mesmo lugar (ex.: Mapa sem diagnóstico).
  const seen = new Set<string>();
  const items = links
    // Plano de 21 dias e Diário ocultos: os atalhos para eles não aparecem (lib/features.ts).
    .filter(
      ({ link }) =>
        (link.kind !== "day" || features.plan21) && (link.kind !== "diary" || features.diary),
    )
    .map((item) => {
      const link = resolve(item.link);
      return { link, label: item.label, key: JSON.stringify(link) };
    })
    .filter((item) => !seen.has(item.key) && Boolean(seen.add(item.key)));
  return (
    <div className={cn("space-y-2", className)}>
      {items.map(({ link, label, key }) => (
        <button
          key={key}
          type="button"
          onClick={() => onOpen(link)}
          className="flex w-full cursor-pointer items-center gap-3 rounded-xl bg-card px-4 py-3 text-left text-sm font-bold shadow-soft transition-transform active:scale-[0.99] [&_svg]:size-4 [&_svg]:shrink-0"
        >
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary-soft text-primary">
            {icon[link.kind]}
          </span>
          <span className="min-w-0 flex-1">{label ?? linkLabel(link)}</span>
          <ChevronRight className="text-muted-foreground" />
        </button>
      ))}
    </div>
  );
}
