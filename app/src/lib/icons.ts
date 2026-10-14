// Ícones lucide (os mesmos do Calm Kids e do CalmBaby) para a navegação e o menu do Perfil.
// Tiles, cenários, fases e celebrações usam os emojis 3D de src/lib/illustrations.ts.

import {
  BookOpen,
  CalendarCheck,
  CircleHelp,
  Gift,
  Compass,
  Download,
  House,
  KeyRound,
  LifeBuoy,
  Map,
  MessagesSquare,
  NotebookPen,
  Route,
  ShieldCheck,
  TrendingUp,
  UserRound,
  type LucideIcon,
} from "lucide-react";

/** Navegação inferior: mesmas posições do BottomNav do CalmBaby, com a aba Cenários no meio. */
export const navIcons = {
  home: House,
  plan: Route,
  scenarios: Compass,
  diary: NotebookPen,
  more: UserRound,
} satisfies Record<string, LucideIcon>;

/** Itens do menu do Perfil. */
export const moreIcons = {
  diagnosis: Map,
  first48: CalendarCheck,
  progress: TrendingUp,
  central: MessagesSquare,
  scenario: Compass,
  rules: BookOpen,
  support: CircleHelp,
  install: Download,
  privacy: ShieldCheck,
  care: LifeBuoy,
  reset: KeyRound,
  benefits: Gift,
} satisfies Record<string, LucideIcon>;
