// Ícones do Código da Reconquista (lucide-react, já usado no Calm Kids e no CalmBaby).
// Na Fase 1 este arquivo vai para src/lib/icons.ts. Estilo: traço 1.5, sem preenchimento,
// dentro de um círculo com filete dourado (como os ícones do PDF). O CalmBaby usava ilustrações
// do Calminho nesses lugares; aqui não há personagem.

import {
  Ban,
  BookOpen,
  CalendarDays,
  CircleHelp,
  Coffee,
  Compass,
  Download,
  Flame,
  HeartHandshake,
  Hourglass,
  House,
  LifeBuoy,
  LogOut,
  MessageCircleHeart,
  MessageSquareText,
  MessagesSquare,
  NotebookPen,
  ScrollText,
  ShieldCheck,
  Snowflake,
  UserRound,
  UsersRound,
  Wind,
  type LucideIcon,
} from "lucide-react";

/** Navegação inferior: mesmas posições do BottomNav do CalmBaby, com a aba Cenários no meio. */
export const navIcons = {
  home: House,
  plan: CalendarDays,
  scenarios: Compass,
  diary: NotebookPen,
  more: UserRound,
} satisfies Record<string, LucideIcon>;

export const scenarioIcons = {
  bloqueou: Ban,
  frio: Snowflake,
  outra: UsersRound,
  desinteresse: Flame,
  respondeu: MessageCircleHeart,
  encontro: Coffee,
} satisfies Record<string, LucideIcon>;

/** Fase 1 a 4. O emblema da fase (numeral romano) fica em brand/emblems/fase-N.svg. */
export const phaseIcons: Record<1 | 2 | 3 | 4, LucideIcon> = {
  1: Wind,
  2: MessageSquareText,
  3: MessagesSquare,
  4: Coffee,
};

/** Ferramentas que um dia do plano pode abrir (equivalente ao PlanTool do CalmBaby). */
export const toolIcons = {
  pause: Hourglass,
  diary: NotebookPen,
  rules: ScrollText,
} satisfies Record<string, LucideIcon>;

/** Itens da aba Mais. */
export const moreIcons = {
  scenario: Compass,
  rules: BookOpen,
  support: CircleHelp,
  install: Download,
  privacy: ShieldCheck,
  care: LifeBuoy,
  commitment: HeartHandshake,
  logout: LogOut,
} satisfies Record<string, LucideIcon>;
